import type { Disposition6R, EnterpriseWorkload } from '../../types';
import type { EvidenceReadinessResult } from '../readiness';
import type { WorkloadLifecycleState } from '../transformationEngine';
import { validateOrRepair6RDisposition } from '../guardrails';
import { PLAIN_ENGLISH_6R } from '../../config/capabilityCues';
import {
  callGeminiStructuredJson,
  GeminiAgentError,
  parseStructuredJson,
  type GeminiTokenUsage,
  type StructuredModelCaller,
} from './geminiRuntime';
import {
  enterpriseArchitectOutputSchema,
  type EnterpriseArchitectOutput,
  type PortfolioDiscoveryOutput,
} from './schemas';
import {
  runEnterpriseArchitectAgent,
  synthesizeArchitecturalRecommendation,
} from './enterpriseArchitectAgent';
import type { AgentToolExecution, SpecialistAgentContext } from './types';

export interface GeminiArchitectAgentResult {
  agentId: 'enterprise-architect-agent';
  agentLabel: 'Enterprise Architect Agent';
  executionMode: 'live-gemini' | 'deterministic-fallback';
  modelUsed?: string;
  latencyMs: number;
  tokenUsage?: GeminiTokenUsage;
  aiUnavailableReason?: string;
  structuredOutput?: EnterpriseArchitectOutput;
  recommended6R: Disposition6R;
  conclusion: string;
  bullets: string[];
  nextAction: string;
  toolsCalled: AgentToolExecution[];
  reasoningNote: string;
}

const ARCHITECT_SYSTEM_INSTRUCTION = `You are the EMOS Enterprise Architect Agent — a specialist enterprise cloud modernization architect.

STRICT RULES:
1. Reason ONLY over the structured workload evidence and lifecycle context supplied in the user prompt.
2. Evaluate ALL SIX canonical 6R dispositions: "Retain", "Retire", "Rehost", "Replatform", "Refactor", "Repurchase". Choose EXACTLY ONE as recommendedDisposition.
   - Retain: air-gapped/hardware/HSM/PLC/SCADA/mainframe regulatory or amortized hardware constraints where migration has negative ROI or extreme risk.
   - Retire: low-criticality, obsolete, duplicate, superseded, or zero-active-user workload to decommission after archival.
   - Rehost: urgent colocation/datacenter lease exit or rapid lift-and-shift onto cloud VMs without code rewrite.
   - Replatform: legacy data warehouse/Hadoop/database/platform moving to managed cloud platform services (PaaS/lakehouse/Cloud SQL) without full app rewrite.
   - Refactor: tightly coupled differentiating monolith (e.g., Java 8/CORBA) requiring domain decomposition into cloud-native/event-driven services.
   - Repurchase: commodity non-differentiating business capability (e.g., AML case tracker, document management, expense tracker) best replaced by commercial SaaS.
3. NEVER invent costs, dependencies, compliance rules, or unverified facts. Explicitly note missingEvidence when fields are missing/incomplete.
4. NEVER independently approve decisions, change READY/NEEDS EVIDENCE status, bypass governance, or authorize execution.
5. Always include counterfactual recommendationChangeTriggers ("What evidence would change this recommendation?").
6. Always include "directAnswer": a concise, direct, evidence-grounded answer to USER QUESTION. If the user's question rests on a false premise relative to supplied OUTCOME METRICS or DNA evidence (for example, asking why a workload missed target when supplied OUTCOME METRICS show targets were met or exceeded), explicitly correct the premise FIRST, cite the observed vs. target metrics, and explain what actually happened.
7. Return ONLY valid JSON matching this exact schema:
{
  "recommendedDisposition": "Retain" | "Retire" | "Rehost" | "Replatform" | "Refactor" | "Repurchase",
  "directAnswer": "string (concise direct answer addressing USER QUESTION and correcting any false premise)",
  "rationale": ["string (1-6 evidence-grounded architectural reasons)"],
  "alternatives": [
    { "disposition": "Retain"|"Retire"|"Rehost"|"Replatform"|"Refactor"|"Repurchase", "whyWeaker": "string" }
  ],
  "risks": ["string (1-6 concrete architectural or cutover risks)"],
  "evidenceReferences": ["string (1-12 exact labels/values cited from supplied DNA)"],
  "missingEvidence": ["string (0-10 missing or incomplete evidence items)"],
  "recommendationChangeTriggers": ["string (1-6 concrete conditions that would shift the 6R choice)"],
  "confidence": 0-100
}`;

function serializeWorkloadForArchitect(
  workload: EnterpriseWorkload,
  readiness: EvidenceReadinessResult,
  lifecycle: WorkloadLifecycleState,
  question: string,
  stage?: string,
  estateName?: string,
  discoveryHandoff?: PortfolioDiscoveryOutput,
): string {
  const allFields = [
    ...workload.dna.business.map((f) => ({ section: 'Business', ...f })),
    ...workload.dna.technology.map((f) => ({ section: 'Technology', ...f })),
    ...workload.dna.dependency.map((f) => ({ section: 'Dependency', ...f })),
    ...workload.dna.economics.map((f) => ({ section: 'Economics', ...f })),
    ...workload.dna.dataAndRisk.map((f) => ({ section: 'Data & Risk', ...f })),
    ...workload.dna.targetState.map((f) => ({ section: 'Target State', ...f })),
  ];

  const dnaLines = allFields.map(
    (f) =>
      `- [${f.section}] ${f.label}: ${f.status === 'known' ? f.value : `STATUS=${f.status.toUpperCase()}`}${f.detail ? ` (${f.detail})` : ''}`,
  );

  const outcomeLines = lifecycle.outcomes
    .slice(0, 3)
    .map((o) => `- ${o.label}: Baseline=${o.baseline} | Target=${o.target} | Observed=${o.observed} (${o.deltaSummary})`);

  const lessonLines = lifecycle.learnings
    .slice(0, 2)
    .map((l) => `- Lesson (${l.futureApplicability}): ${l.lesson}`);

  return [
    `USER QUESTION: ${question}`,
    `ACTIVE STAGE: ${stage || 'assess'}`,
    estateName ? `ESTATE: ${estateName}` : null,
    `WORKLOAD ID: ${workload.id}`,
    `WORKLOAD NAME: ${workload.name}`,
    `TYPE: ${workload.type} | CAPABILITY: ${workload.businessCapability} | CRITICALITY: ${workload.businessCriticality}`,
    `STACK: ${workload.currentStack} | HOSTING: ${workload.hosting}`,
    `KNOWN DEPENDENCIES: ${workload.knownDependencies}`,
    `MODERNIZATION SIGNALS: ${workload.modernizationSignals.join('; ')}`,
    `DETERMINISTIC READINESS (AUTHORITATIVE): ${readiness.decisionReadiness} (${readiness.completeness}% verified; critical gaps: ${readiness.criticalGaps.length > 0 ? readiness.criticalGaps.join(', ') : 'NONE'})`,
    `GOVERNANCE STATUS: ${lifecycle.governanceStatus} | CURRENT PHASE: ${lifecycle.currentPhaseLabel} | NEXT GATE: ${lifecycle.nextGateLabel}${lifecycle.activeBlocker ? ` | ACTIVE BLOCKER: ${lifecycle.activeBlocker}` : ''}`,
    `TARGET ARCHITECTURE SUMMARY: ${lifecycle.targetArchSummary}`,
    discoveryHandoff
      ? `PORTFOLIO DISCOVERY HANDOFF FINDINGS: ${discoveryHandoff.findings.join(' | ')} | MISSING: ${discoveryHandoff.missingEvidence.join(', ') || 'None'}`
      : null,
    '',
    'ENTERPRISE DNA ATTRIBUTES:',
    ...dnaLines,
    '',
    'OUTCOME METRICS (IF APPLICABLE):',
    ...(outcomeLines.length > 0 ? outcomeLines : ['- None recorded']),
    '',
    'CAPTURED LESSONS (IF APPLICABLE):',
    ...(lessonLines.length > 0 ? lessonLines : ['- None recorded']),
  ]
    .filter((line) => line !== null)
    .join('\n');
}

/**
 * Genuine Gemini-backed Enterprise Architect Agent with deterministic schema,
 * canonical-6R, and governance validation + explicit failure fallback.
 */
export async function runGeminiEnterpriseArchitectAgent(
  ctx: SpecialistAgentContext,
  options?: {
    discoveryHandoff?: PortfolioDiscoveryOutput;
    modelCaller?: StructuredModelCaller;
  },
): Promise<GeminiArchitectAgentResult> {
  const t0 = performance.now();
  const modelCaller = options?.modelCaller ?? callGeminiStructuredJson;

  try {
    const userPrompt = serializeWorkloadForArchitect(
      ctx.workload,
      ctx.readiness,
      ctx.lifecycle,
      ctx.question,
      ctx.currentStage,
      ctx.estateName,
      options?.discoveryHandoff,
    );

    const callResult = await modelCaller({
      systemInstruction: ARCHITECT_SYSTEM_INSTRUCTION,
      userPrompt,
      temperature: 0.15,
      timeoutMs: 20_000,
    });

    const parsedRaw = parseStructuredJson(callResult.text, callResult.modelUsed);
    const validated = enterpriseArchitectOutputSchema.safeParse(parsedRaw);

    if (!validated.success) {
      throw new GeminiAgentError(
        'schema_validation_failed',
        `Enterprise Architect Agent output failed schema validation: ${validated.error.issues
          .map((i) => `${i.path.join('.')}: ${i.message}`)
          .join('; ')}`,
        callResult.modelUsed,
      );
    }

    const rawOutput = validated.data;

    // Deterministic canonical 6R verification
    const { disposition } = validateOrRepair6RDisposition(
      rawOutput.recommendedDisposition,
      rawOutput.rationale.join(' '),
    );

    // Deterministic reconciliation of missing critical gaps & confidence cap when NEEDS EVIDENCE
    const normalizedMissing = [...rawOutput.missingEvidence];
    for (const gap of ctx.readiness.criticalGaps) {
      if (!normalizedMissing.some((m) => m.toLowerCase().includes(gap.toLowerCase()))) {
        normalizedMissing.push(`${gap} (deterministic critical gate gap)`);
      }
    }

    const output: EnterpriseArchitectOutput = {
      ...rawOutput,
      recommendedDisposition: disposition,
      alternatives: rawOutput.alternatives.filter((a) => a.disposition !== disposition),
      missingEvidence: normalizedMissing,
      confidence:
        ctx.readiness.decisionReadiness === 'NEEDS EVIDENCE'
          ? Math.min(rawOutput.confidence, 70)
          : rawOutput.confidence,
    };

    const plain = PLAIN_ENGLISH_6R[disposition]?.plainEnglish || disposition;
    const defaultNextAction =
      ctx.readiness.decisionReadiness === 'NEEDS EVIDENCE'
        ? `Verify ${ctx.readiness.criticalGaps.slice(0, 2).join(' and ') || 'missing critical DNA evidence'} in Enterprise DNA for ${ctx.workload.name} before human governance approval.`
        : ctx.lifecycle.governanceStatus !== 'APPROVED'
        ? `Review and record Human Governance Approval for ${ctx.workload.name} before mobilizing ${disposition}.`
        : `Advance "${ctx.lifecycle.currentPhaseLabel}" and clear gate: ${ctx.lifecycle.nextGateLabel}.`;

    let conclusion = `${ctx.workload.name} is recommended for "${plain}" (${disposition}) at ${output.confidence}% confidence (${ctx.readiness.decisionReadiness}).`;
    let bullets = output.rationale.slice(0, 3);
    let nextAction = defaultNextAction;

    if (ctx.intent === 'architect_alternatives') {
      conclusion = output.directAnswer || `For ${ctx.workload.name}, "${plain}" (${disposition}) outperforms alternatives based on supplied Enterprise DNA.`;
      bullets = output.alternatives
        .slice(0, 3)
        .map((a) => `${PLAIN_ENGLISH_6R[a.disposition]?.plainEnglish || a.disposition} (${a.disposition}): ${a.whyWeaker}`);
    } else if (ctx.intent === 'architect_counterfactual') {
      conclusion = output.directAnswer || `Counterfactual triggers that would shift ${ctx.workload.name} away from "${plain}" (${disposition}):`;
      bullets = output.recommendationChangeTriggers.slice(0, 3);
    } else if (ctx.intent === 'architect_risks') {
      conclusion = output.directAnswer || `Key architectural and governance risks for ${ctx.workload.name} (${disposition}, ${ctx.readiness.decisionReadiness}):`;
      bullets = output.risks.slice(0, 3);
    } else if (ctx.intent === 'architect_execution') {
      conclusion = ctx.lifecycle.activeBlocker
        ? `Execution for ${ctx.workload.name} (${disposition}) is gated at "${ctx.lifecycle.currentPhaseLabel}": ${ctx.lifecycle.activeBlocker}`
        : output.directAnswer || `Execution for ${ctx.workload.name} (${disposition}) is at "${ctx.lifecycle.currentPhaseLabel}" — next gate: ${ctx.lifecycle.nextGateLabel}.`;
      bullets = [
        output.risks[0] || `Next Gate: ${ctx.lifecycle.nextGateLabel}.`,
        `Target Architecture: ${ctx.lifecycle.targetArchSummary}.`,
        `Governance Status: ${ctx.lifecycle.governanceStatus} (Human approval required before production cutover).`,
      ];
    } else if (ctx.intent === 'architect_outcomes_learning') {
      const firstLesson = ctx.lifecycle.learnings[0];
      const hasVariance = ctx.lifecycle.outcomes.some((o) => o.status === 'variance');
      conclusion =
        output.directAnswer ||
        (hasVariance
          ? `Observed metrics for ${ctx.workload.name} (${disposition}) show a variance on at least one KPI relative to target.`
          : `Observed metrics for ${ctx.workload.name} (${disposition}) did not miss target — all tracked KPIs met or exceeded target.`);
      bullets = [
        ...ctx.lifecycle.outcomes
          .slice(0, 2)
          .map((o) => `${o.label}: Baseline ${o.baseline} → Target ${o.target} → Observed ${o.observed} (${o.deltaSummary}).`),
        firstLesson
          ? `Applies to (${firstLesson.futureApplicability}): ${firstLesson.lesson}`
          : output.recommendationChangeTriggers[0],
      ].slice(0, 3);
      nextAction = hasVariance
        ? `Review the variance driver for ${ctx.workload.name} in Measure and capture mitigation lessons in Learn.`
        : `Capture the verified ${disposition} outcome benchmark and lessons from ${ctx.workload.name} into the Learn playbook for upcoming waves.`;
    }

    return {
      agentId: 'enterprise-architect-agent',
      agentLabel: 'Enterprise Architect Agent',
      executionMode: 'live-gemini',
      modelUsed: callResult.modelUsed,
      latencyMs: callResult.latencyMs,
      tokenUsage: callResult.tokenUsage,
      structuredOutput: output,
      recommended6R: disposition,
      conclusion,
      bullets: bullets.slice(0, 3),
      nextAction,
      toolsCalled: [
        {
          toolName: 'enterprise_architect_agent',
          label: `enterprise_architect_agent.gemini_reason(${callResult.modelUsed})`,
          summary: `Gemini (${callResult.modelUsed}) evaluated all 6 canonical dispositions for ${ctx.workload.name} and selected ${disposition} (${callResult.latencyMs}ms).`,
          status: 'verified',
        },
        {
          toolName: 'validate_architect_guardrails',
          label: 'validate_architect_guardrails()',
          summary: `Validated structured JSON output against Zod schema, canonical 6R taxonomy, and deterministic readiness gate (${ctx.readiness.decisionReadiness}).`,
          status: 'verified',
        },
      ],
      reasoningNote: `Gemini-backed Enterprise Architect Agent (${callResult.modelUsed}) selected ${disposition} with ${output.alternatives.length} compared alternatives and ${output.recommendationChangeTriggers.length} counterfactual triggers.`,
    };
  } catch (err) {
    const reason =
      err instanceof GeminiAgentError
        ? `${err.code}: ${err.message}`
        : err instanceof Error
        ? err.message
        : String(err);

    const fallback = runEnterpriseArchitectAgent(ctx);
    const detRec = synthesizeArchitecturalRecommendation(ctx.workload);
    const latencyMs = Math.round((performance.now() - t0) * 100) / 100;

    return {
      agentId: 'enterprise-architect-agent',
      agentLabel: 'Enterprise Architect Agent',
      executionMode: 'deterministic-fallback',
      latencyMs,
      aiUnavailableReason: reason,
      recommended6R: fallback.recommended6R || detRec.recommended6R,
      conclusion: `AI reasoning unavailable (${err instanceof GeminiAgentError ? err.code : 'runtime_error'}). Showing deterministic architecture baseline: ${fallback.conclusion}`,
      bullets: fallback.bullets,
      nextAction: fallback.nextAction,
      toolsCalled: [
        ...fallback.toolsCalled,
        {
          toolName: 'deterministic_fallback',
          label: 'deterministic_fallback(ai_unavailable)',
          summary: `Gemini Enterprise Architect Agent unavailable (${err instanceof GeminiAgentError ? err.code : 'runtime_error'}); returned deterministic baseline without fabrication.`,
          status: 'verified',
        },
      ],
      reasoningNote: `Enterprise Architect Agent fell back to deterministic baseline because AI reasoning was unavailable (${reason}).`,
    };
  }
}
