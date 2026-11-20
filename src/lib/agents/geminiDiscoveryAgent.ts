import type { EnterpriseWorkload } from '../../types';
import type { EvidenceReadinessResult } from '../readiness';
import {
  callGeminiStructuredJson,
  GeminiAgentError,
  parseStructuredJson,
  type GeminiTokenUsage,
  type StructuredModelCaller,
} from './geminiRuntime';
import {
  portfolioDiscoveryOutputSchema,
  type PortfolioDiscoveryOutput,
} from './schemas';
import {
  inspectDiscoveryFindings,
  runPortfolioDiscoveryAgent,
} from './portfolioDiscoveryAgent';
import type { AgentToolExecution, SpecialistAgentContext } from './types';

export interface GeminiDiscoveryAgentResult {
  agentId: 'portfolio-discovery-agent';
  agentLabel: 'Portfolio Discovery Agent';
  executionMode: 'live-gemini' | 'deterministic-fallback';
  modelUsed?: string;
  latencyMs: number;
  tokenUsage?: GeminiTokenUsage;
  aiUnavailableReason?: string;
  structuredOutput?: PortfolioDiscoveryOutput;
  conclusion: string;
  bullets: string[];
  nextAction: string;
  toolsCalled: AgentToolExecution[];
  reasoningNote: string;
}

const DISCOVERY_SYSTEM_INSTRUCTION = `You are the EMOS Portfolio Discovery Agent — a specialist enterprise modernization discovery analyst.

STRICT RULES:
1. Reason ONLY over the structured workload evidence supplied in the user prompt.
2. NEVER invent dependencies, costs, TCO numbers, owners, technologies, compliance policies, risks, or evidence.
3. Explicitly label unverified/missing fields as missing or unknown.
4. NEVER change or override the deterministic evidence readiness status (READY vs NEEDS EVIDENCE) or approve any decision.
5. Focus on: interpreting heterogeneous workload evidence, synthesizing relationships from supplied evidence, identifying ambiguity, identifying missing evidence, determining what evidence should be investigated next, and explaining why that evidence matters.
6. Return ONLY valid JSON matching this exact schema:
{
  "findings": ["string (1-6 concise evidence-grounded findings)"],
  "relationships": ["string (0-6 dependency/integration relationships from supplied evidence)"],
  "missingEvidence": ["string (0-10 missing or incomplete evidence items)"],
  "ambiguities": ["string (0-6 conflicting or ambiguous signals)"],
  "recommendedInvestigations": ["string (1-6 prioritized next investigations with why each matters)"],
  "evidenceReferences": ["string (1-12 exact labels/values cited from supplied DNA)"],
  "confidence": 0-100
}`;

function serializeWorkloadForDiscovery(
  workload: EnterpriseWorkload,
  readiness: EvidenceReadinessResult,
  question: string,
  stage?: string,
  estateName?: string,
): string {
  const allFields = [
    ...workload.dna.business.map((f) => ({ section: 'Business', ...f })),
    ...workload.dna.technology.map((f) => ({ section: 'Technology', ...f })),
    ...workload.dna.dependency.map((f) => ({ section: 'Dependency', ...f })),
    ...workload.dna.economics.map((f) => ({ section: 'Economics', ...f })),
    ...workload.dna.dataAndRisk.map((f) => ({ section: 'Data & Risk', ...f })),
    ...workload.dna.targetState.map((f) => ({ section: 'Target State', ...f })),
  ];

  const verifiedFields = allFields
    .filter((f) => f.status === 'known')
    .map((f) => `- [${f.section}] ${f.label}: ${f.value}${f.detail ? ` (${f.detail})` : ''}`);

  const missingOrIncompleteFields = allFields
    .filter((f) => f.status !== 'known')
    .map((f) => `- [${f.section}] ${f.label}: STATUS=${f.status.toUpperCase()}${f.detail ? ` (${f.detail})` : ''}`);

  return [
    `USER QUESTION: ${question}`,
    `ACTIVE STAGE: ${stage || 'dna'}`,
    estateName ? `ESTATE: ${estateName}` : null,
    `WORKLOAD ID: ${workload.id}`,
    `WORKLOAD NAME: ${workload.name}`,
    `TYPE: ${workload.type} | BUSINESS CAPABILITY: ${workload.businessCapability} | CRITICALITY: ${workload.businessCriticality}`,
    `STACK: ${workload.currentStack} | HOSTING: ${workload.hosting}`,
    `KNOWN DEPENDENCIES: ${workload.knownDependencies}`,
    `MODERNIZATION SIGNALS: ${workload.modernizationSignals.join('; ')}`,
    `DETERMINISTIC READINESS (AUTHORITATIVE, DO NOT OVERRIDE): ${readiness.decisionReadiness} (${readiness.completeness}% verified, ${readiness.knownCount}/${readiness.totalCount} known, critical gaps: ${readiness.criticalGaps.length > 0 ? readiness.criticalGaps.join(', ') : 'NONE'})`,
    '',
    'VERIFIED ENTERPRISE DNA EVIDENCE:',
    ...verifiedFields,
    '',
    'MISSING / INCOMPLETE ENTERPRISE DNA EVIDENCE:',
    ...(missingOrIncompleteFields.length > 0 ? missingOrIncompleteFields : ['- None']),
  ]
    .filter((line) => line !== null)
    .join('\n');
}

/**
 * Genuine Gemini-backed Portfolio Discovery Agent with deterministic schema validation
 * and explicit failure fallback (never silently fabricates an answer).
 */
export async function runGeminiPortfolioDiscoveryAgent(
  ctx: SpecialistAgentContext,
  modelCaller: StructuredModelCaller = callGeminiStructuredJson,
): Promise<GeminiDiscoveryAgentResult> {
  const t0 = performance.now();
  const deterministicFindings = inspectDiscoveryFindings(ctx);

  try {
    const userPrompt = serializeWorkloadForDiscovery(
      ctx.workload,
      ctx.readiness,
      ctx.question,
      ctx.currentStage,
      ctx.estateName,
    );

    const callResult = await modelCaller({
      systemInstruction: DISCOVERY_SYSTEM_INSTRUCTION,
      userPrompt,
      temperature: 0.15,
      timeoutMs: 20_000,
    });

    const parsedRaw = parseStructuredJson(callResult.text, callResult.modelUsed);
    const validated = portfolioDiscoveryOutputSchema.safeParse(parsedRaw);

    if (!validated.success) {
      throw new GeminiAgentError(
        'schema_validation_failed',
        `Portfolio Discovery Agent output failed schema validation: ${validated.error.issues
          .map((i) => `${i.path.join('.')}: ${i.message}`)
          .join('; ')}`,
        callResult.modelUsed,
      );
    }

    const output = validated.data;

    // Deterministic reconciliation: ensure every deterministic critical gap is preserved in missingEvidence
    const normalizedMissing = [...output.missingEvidence];
    for (const criticalGap of ctx.readiness.criticalGaps) {
      const alreadyMentioned = normalizedMissing.some((m) =>
        m.toLowerCase().includes(criticalGap.toLowerCase()),
      );
      if (!alreadyMentioned) {
        normalizedMissing.push(`${criticalGap} (deterministic critical gate gap)`);
      }
    }

    const reconciledOutput: PortfolioDiscoveryOutput = {
      ...output,
      missingEvidence: normalizedMissing,
      // Bound confidence deterministically when NEEDS EVIDENCE
      confidence:
        ctx.readiness.decisionReadiness === 'NEEDS EVIDENCE'
          ? Math.min(output.confidence, 75)
          : output.confidence,
    };

    const conclusion =
      ctx.readiness.criticalGaps.length > 0
        ? `${ctx.workload.name} (${ctx.readiness.completeness}% verified, ${ctx.readiness.decisionReadiness}): ${reconciledOutput.findings[0]}`
        : `${ctx.workload.name} (${ctx.readiness.completeness}% verified, ${ctx.readiness.decisionReadiness}): ${reconciledOutput.findings[0]}`;

    const bullets = [
      reconciledOutput.missingEvidence.length > 0
        ? `Missing Evidence: ${reconciledOutput.missingEvidence.slice(0, 3).join('; ')}.`
        : 'Missing Evidence: All critical Dependency, TCO Baseline, and Target-State DNA attributes are verified.',
      reconciledOutput.relationships[0]
        ? `Dependency / Relationship Analysis: ${reconciledOutput.relationships[0]}`
        : `Dependency Surface: ${deterministicFindings.dependencySummary}.`,
      reconciledOutput.ambiguities[0]
        ? `Ambiguity Identified: ${reconciledOutput.ambiguities[0]}`
        : `Next Investigation: ${reconciledOutput.recommendedInvestigations[0]}`,
    ];

    const nextAction = reconciledOutput.recommendedInvestigations[0];

    return {
      agentId: 'portfolio-discovery-agent',
      agentLabel: 'Portfolio Discovery Agent',
      executionMode: 'live-gemini',
      modelUsed: callResult.modelUsed,
      latencyMs: callResult.latencyMs,
      tokenUsage: callResult.tokenUsage,
      structuredOutput: reconciledOutput,
      conclusion,
      bullets,
      nextAction,
      toolsCalled: [
        {
          toolName: 'portfolio_discovery_agent',
          label: `portfolio_discovery_agent.gemini_reason(${callResult.modelUsed})`,
          summary: `Gemini (${callResult.modelUsed}) analyzed ${ctx.readiness.knownCount}/${ctx.readiness.totalCount} verified DNA facts and produced schema-validated discovery findings (${callResult.latencyMs}ms).`,
          status: 'verified',
        },
        {
          toolName: 'validate_discovery_schema',
          label: 'validate_discovery_schema()',
          summary: `Validated structured JSON output against Zod contract and deterministic readiness gate (${ctx.readiness.decisionReadiness}).`,
          status: 'verified',
        },
      ],
      reasoningNote: `Gemini-backed Portfolio Discovery Agent (${callResult.modelUsed}) synthesized ${reconciledOutput.findings.length} findings and ${reconciledOutput.recommendedInvestigations.length} investigations for ${ctx.workload.name}.`,
    };
  } catch (err) {
    const reason =
      err instanceof GeminiAgentError
        ? `${err.code}: ${err.message}`
        : err instanceof Error
        ? err.message
        : String(err);

    const fallback = runPortfolioDiscoveryAgent(ctx);
    const latencyMs = Math.round((performance.now() - t0) * 100) / 100;

    return {
      agentId: 'portfolio-discovery-agent',
      agentLabel: 'Portfolio Discovery Agent',
      executionMode: 'deterministic-fallback',
      latencyMs,
      aiUnavailableReason: reason,
      conclusion: `AI reasoning unavailable (${err instanceof GeminiAgentError ? err.code : 'runtime_error'}). Showing deterministic evidence status: ${fallback.conclusion}`,
      bullets: fallback.bullets,
      nextAction: fallback.nextAction,
      toolsCalled: [
        ...fallback.toolsCalled,
        {
          toolName: 'deterministic_fallback',
          label: 'deterministic_fallback(ai_unavailable)',
          summary: `Gemini Portfolio Discovery Agent unavailable (${err instanceof GeminiAgentError ? err.code : 'runtime_error'}); returned deterministic evidence status without fabrication.`,
          status: 'verified',
        },
      ],
      reasoningNote: `Portfolio Discovery Agent fell back to deterministic evidence status because AI reasoning was unavailable (${reason}).`,
    };
  }
}
