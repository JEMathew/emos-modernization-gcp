import type { DecisionReadiness, Disposition6R } from '../../types';
import { evaluateEvidenceReadiness } from '../readiness';
import { buildDefaultLifecycleState } from '../transformationEngine';
import { PLAIN_ENGLISH_6R } from '../../config/capabilityCues';
import {
  classifyOrchestrationIntent,
  detectGovernanceViolation,
  orchestrateAskEmos,
  type OrchestrateAskEmosInput,
} from './orchestrator';
import { synthesizeArchitecturalRecommendation } from './enterpriseArchitectAgent';
import { runGeminiPortfolioDiscoveryAgent } from './geminiDiscoveryAgent';
import { runGeminiEnterpriseArchitectAgent } from './geminiArchitectAgent';
import {
  callGeminiStructuredJson,
  type GeminiTokenUsage,
  type StructuredModelCaller,
} from './geminiRuntime';
import type {
  EnterpriseArchitectOutput,
  PortfolioDiscoveryOutput,
} from './schemas';
import type {
  AgentToolExecution,
  OrchestratedAskEmosResult,
  SpecialistAgentContext,
  SpecialistAgentId,
} from './types';

export interface GeminiOrchestratedResult extends OrchestratedAskEmosResult {
  executionMode: 'live-gemini' | 'deterministic-fallback' | 'deterministic-governance-block';
  modelsUsed: string[];
  liveModelCalls: number;
  liveLatencyMs: number;
  tokenUsage?: GeminiTokenUsage;
  aiUnavailableReason?: string;
  discoveryOutput?: PortfolioDiscoveryOutput;
  architectOutput?: EnterpriseArchitectOutput;
}

function sumTokenUsage(usages: (GeminiTokenUsage | undefined)[]): GeminiTokenUsage | undefined {
  const valid = usages.filter((u): u is GeminiTokenUsage => Boolean(u));
  if (valid.length === 0) return undefined;
  return {
    promptTokens: valid.reduce((a, u) => a + u.promptTokens, 0),
    outputTokens: valid.reduce((a, u) => a + u.outputTokens, 0),
    totalTokens: valid.reduce((a, u) => a + u.totalTokens, 0),
  };
}

/**
 * Deterministic EMOS Orchestrator invoking the Gemini-backed Specialist Agents.
 *
 * Architecture Contract:
 *   AGENTS REASON (Gemini Portfolio Discovery Agent & Gemini Enterprise Architect Agent)
 *   WORKFLOWS ORCHESTRATE (this deterministic router & Discovery -> Architect handoff)
 *   RULES GOVERN (deterministic readiness gate, canonical 6R validation, adversarial pre-check)
 *   HUMANS AUTHORIZE (HITL approval never bypassed)
 */
export async function orchestrateAskEmosWithGemini(
  input: OrchestrateAskEmosInput,
  modelCaller: StructuredModelCaller = callGeminiStructuredJson,
): Promise<GeminiOrchestratedResult> {
  const trimmedQuestion = (input.question || '').trim();
  if (!trimmedQuestion) {
    throw new Error('Ask EMOS requires a non-empty question.');
  }

  // 1. Deterministic Governance / Safety Pre-Check (executes BEFORE any Gemini call!)
  const violation = detectGovernanceViolation(trimmedQuestion);
  if (violation) {
    const blocked = orchestrateAskEmos(input);
    return {
      ...blocked,
      executionMode: 'deterministic-governance-block',
      modelsUsed: [],
      liveModelCalls: 0,
      liveLatencyMs: 0,
      isLiveGemini: false,
    };
  }

  const { workload, activeInteraction, currentStage, estateName } = input;
  const readiness = evaluateEvidenceReadiness(workload.dna);
  const detRec = synthesizeArchitecturalRecommendation(workload);
  const lifecycle =
    input.lifecycle ||
    buildDefaultLifecycleState(
      workload,
      (activeInteraction?.recommended6R as Disposition6R | undefined) || detRec.recommended6R,
    );

  const decisionReadiness: DecisionReadiness =
    (activeInteraction?.decisionReadiness as DecisionReadiness | undefined) || readiness.decisionReadiness;
  const completeness = activeInteraction?.evidenceCompleteness ?? readiness.completeness;

  const baseTools: AgentToolExecution[] = [
    {
      toolName: 'inspect_workload_dna',
      label: 'inspect_workload_dna()',
      summary: `Scanned ${readiness.totalCount} Enterprise DNA attributes for ${workload.name} (${completeness}% verified).`,
      status: 'verified',
    },
    {
      toolName: 'evaluate_readiness_gate',
      label: 'evaluate_readiness_gate()',
      summary: `Readiness gate is ${decisionReadiness} (threshold 70%; critical gaps: ${readiness.criticalGaps.length}).`,
      status: 'verified',
    },
  ];

  const intent = classifyOrchestrationIntent(trimmedQuestion, currentStage);
  const ctx: SpecialistAgentContext = {
    question: trimmedQuestion,
    intent,
    workload,
    lifecycle,
    readiness,
    activeInteraction,
    currentStage,
    estateName,
  };

  const routedAgents: SpecialistAgentId[] = [];
  let handoffOccurred = false;
  let specialistTools: AgentToolExecution[] = [];
  let conclusion = '';
  let bullets: string[] = [];
  let nextAction = '';
  let reasoningNotes: string[] = [];
  let recommended6R: Disposition6R =
    (activeInteraction?.recommended6R as Disposition6R) || lifecycle.disposition || detRec.recommended6R;
  let confidenceScore = activeInteraction?.confidenceScore ?? detRec.confidenceScore;

  const modelsUsed: string[] = [];
  const tokenUsages: (GeminiTokenUsage | undefined)[] = [];
  let liveModelCalls = 0;
  let liveLatencyMs = 0;
  let anyFallback = false;
  let aiUnavailableReason: string | undefined;
  let discoveryOutput: PortfolioDiscoveryOutput | undefined;
  let architectOutput: EnterpriseArchitectOutput | undefined;

  if (intent === 'discovery_gaps' || intent === 'discovery_dependencies') {
    routedAgents.push('portfolio-discovery-agent');
    const disc = await runGeminiPortfolioDiscoveryAgent(ctx, modelCaller);
    specialistTools = disc.toolsCalled;
    conclusion = disc.conclusion;
    bullets = disc.bullets;
    nextAction = disc.nextAction;
    reasoningNotes.push(disc.reasoningNote);
    discoveryOutput = disc.structuredOutput;
    if (disc.executionMode === 'live-gemini') {
      liveModelCalls += 1;
      liveLatencyMs += disc.latencyMs;
      if (disc.modelUsed) modelsUsed.push(disc.modelUsed);
      tokenUsages.push(disc.tokenUsage);
      if (disc.structuredOutput) confidenceScore = disc.structuredOutput.confidence;
    } else {
      anyFallback = true;
      aiUnavailableReason = disc.aiUnavailableReason;
    }
  } else if (intent === 'hybrid_discovery_and_architect') {
    routedAgents.push('portfolio-discovery-agent', 'enterprise-architect-agent');
    handoffOccurred = true;

    const disc = await runGeminiPortfolioDiscoveryAgent(
      { ...ctx, intent: 'discovery_gaps' },
      modelCaller,
    );
    discoveryOutput = disc.structuredOutput;
    if (disc.executionMode === 'live-gemini') {
      liveModelCalls += 1;
      liveLatencyMs += disc.latencyMs;
      if (disc.modelUsed) modelsUsed.push(disc.modelUsed);
      tokenUsages.push(disc.tokenUsage);
    } else {
      anyFallback = true;
      aiUnavailableReason = disc.aiUnavailableReason;
    }

    const arch = await runGeminiEnterpriseArchitectAgent(
      { ...ctx, intent: 'architect_recommendation' },
      { discoveryHandoff: disc.structuredOutput, modelCaller },
    );
    architectOutput = arch.structuredOutput;
    recommended6R = arch.recommended6R;
    if (arch.executionMode === 'live-gemini') {
      liveModelCalls += 1;
      liveLatencyMs += arch.latencyMs;
      if (arch.modelUsed) modelsUsed.push(arch.modelUsed);
      tokenUsages.push(arch.tokenUsage);
      if (arch.structuredOutput) confidenceScore = arch.structuredOutput.confidence;
    } else {
      anyFallback = true;
      aiUnavailableReason = aiUnavailableReason || arch.aiUnavailableReason;
    }

    specialistTools = [
      ...disc.toolsCalled,
      {
        toolName: 'orchestrator_handoff',
        label: 'orchestrator.handoff(discovery → architect)',
        summary: `Passed validated Discovery findings (${readiness.criticalGaps.length} critical gap(s)) to Enterprise Architect Agent.`,
        status: 'verified',
      },
      ...arch.toolsCalled,
    ];
    conclusion = `${arch.conclusion} ${disc.conclusion}`;
    bullets = [arch.bullets[0], disc.bullets[0], arch.bullets[1] || disc.bullets[1]].filter(Boolean);
    nextAction = readiness.decisionReadiness === 'NEEDS EVIDENCE' ? disc.nextAction : arch.nextAction;
    reasoningNotes.push(disc.reasoningNote, arch.reasoningNote);
  } else {
    routedAgents.push('enterprise-architect-agent');
    const arch = await runGeminiEnterpriseArchitectAgent(ctx, { modelCaller });
    specialistTools = arch.toolsCalled;
    conclusion = arch.conclusion;
    bullets = arch.bullets;
    nextAction = arch.nextAction;
    reasoningNotes.push(arch.reasoningNote);
    recommended6R = arch.recommended6R;
    architectOutput = arch.structuredOutput;
    if (arch.executionMode === 'live-gemini') {
      liveModelCalls += 1;
      liveLatencyMs += arch.latencyMs;
      if (arch.modelUsed) modelsUsed.push(arch.modelUsed);
      tokenUsages.push(arch.tokenUsage);
      if (arch.structuredOutput) confidenceScore = arch.structuredOutput.confidence;
    } else {
      anyFallback = true;
      aiUnavailableReason = arch.aiUnavailableReason;
    }
  }

  const plain = PLAIN_ENGLISH_6R[recommended6R]?.plainEnglish || recommended6R;
  const executionMode = anyFallback ? 'deterministic-fallback' : 'live-gemini';

  return {
    id: `agent-reply-${Date.now()}`,
    question: trimmedQuestion,
    workloadId: workload.id,
    workloadName: workload.name,
    stage: currentStage || 'assess',
    intent,
    routedAgents,
    handoffOccurred,
    governanceIntercepted: false,
    recommended6R,
    decisionReadiness,
    evidenceCompleteness: completeness,
    confidenceScore,
    conclusion,
    bullets: bullets.slice(0, 3),
    nextAction,
    evidenceSummary: `${completeness}% verified (${workload.name} · ${workload.currentStack} · ${workload.hosting} · ${workload.knownDependencies})`,
    reasoningSummary: `Routed via EMOS Deterministic Orchestrator to ${routedAgents.join(' → ')} (${executionMode}${modelsUsed.length > 0 ? `: ${Array.from(new Set(modelsUsed)).join(', ')}` : ''}). ${reasoningNotes.join(' ')} Readiness=${decisionReadiness}, Confidence=${confidenceScore}%, Primary=${plain} (${recommended6R}).`,
    toolsCalled: [...baseTools, ...specialistTools],
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isLiveGemini: executionMode === 'live-gemini',
    executionMode,
    modelsUsed: Array.from(new Set(modelsUsed)),
    liveModelCalls,
    liveLatencyMs: Math.round(liveLatencyMs * 100) / 100,
    tokenUsage: sumTokenUsage(tokenUsages),
    aiUnavailableReason,
    discoveryOutput,
    architectOutput,
  };
}
