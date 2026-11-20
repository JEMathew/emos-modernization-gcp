import type { DecisionReadiness, Disposition6R, EnterpriseWorkload, Interaction } from '../../types';
import { evaluateEvidenceReadiness } from '../readiness';
import { buildDefaultLifecycleState, type WorkloadLifecycleState } from '../transformationEngine';
import { PLAIN_ENGLISH_6R } from '../../config/capabilityCues';
import { runPortfolioDiscoveryAgent } from './portfolioDiscoveryAgent';
import {
  runEnterpriseArchitectAgent,
  synthesizeArchitecturalRecommendation,
} from './enterpriseArchitectAgent';
import type {
  AgentToolExecution,
  GovernanceViolationType,
  OrchestratedAskEmosResult,
  OrchestrationIntent,
  SpecialistAgentContext,
  SpecialistAgentId,
} from './types';

export interface OrchestrateAskEmosInput {
  question: string;
  workload: EnterpriseWorkload;
  lifecycle?: WorkloadLifecycleState;
  activeInteraction?: Interaction | null;
  currentStage?: string;
  estateName?: string;
}

/**
 * Deterministic Governance & Safety Guardrail Detector.
 * Runs BEFORE specialist agents so adversarial prompts can never bypass
 * EMOS evidence readiness gates, human approval authority, or workload isolation.
 */
export function detectGovernanceViolation(question: string): GovernanceViolationType | null {
  const q = question.toLowerCase();

  if (
    /ignore.*(evidence|readiness|gate)|bypass.*(evidence|readiness|gate)|skip.*(evidence|verification|gate)|override.*gate|approve.*despite.*missing|approve.*without.*evidence/.test(
      q,
    )
  ) {
    return 'evidence_gate_bypass';
  }

  if (
    /(proceed|execute|deploy|cutover|mobilize|approve).*(without|even though|despite).*(human|approval|review|sign-off|governance)|auto-?approve|skip.*human.*(approval|review)|bypass.*approval|approve.*automatically|act as approver/.test(
      q,
    )
  ) {
    return 'human_approval_bypass';
  }

  if (
    /(change|override|force|switch).*(recommendation|disposition|6r).*(no|without).*(evidence|support|facts)|force.*(refactor|rehost|replatform|retire|retain|repurchase).*without/.test(
      q,
    )
  ) {
    return 'unsupported_override';
  }

  if (
    /(use|copy|reuse|borrow|carry over).*(previous|last|prior|other|earlier).*(workload|app|system).*(evidence|dna|data|metrics)|previous workload'?s evidence/.test(
      q,
    )
  ) {
    return 'cross_workload_leakage';
  }

  if (
    /(invent|fabricate|make up|hallucinate|fake|guess|assume).*(missing|cost|tco|evidence|compliance|dependency|data|numbers|baseline)/.test(
      q,
    )
  ) {
    return 'fabricated_evidence';
  }

  return null;
}

/**
 * Semantic + stage-aware deterministic intent router.
 * Maps natural-language questions (not brittle exact strings) to the appropriate
 * specialist agent or multi-agent handoff.
 */
export function classifyOrchestrationIntent(
  question: string,
  currentStage?: string,
): OrchestrationIntent {
  if (detectGovernanceViolation(question)) {
    return 'governance_refusal';
  }

  const q = question.toLowerCase();

  const hasGapSignal =
    /missing|gap|incomplete|unverified|what.*verify|what else.*need|evidence.*need|readiness.*block|data.*lack|ambigu/.test(
      q,
    );
  const hasDependencySignal =
    /dependenc|integrat|upstream|downstream|affected system|which system|blast radius|coupled|interface/.test(
      q,
    );
  const hasAlternativeSignal =
    /why not|another option|alternative|instead of|compare.*(6r|option|disposition)|other (option|choice|disposition)/.test(
      q,
    );
  const hasCounterfactualSignal =
    /what would change|change your recommendation|shift the recommendation|counterfactual|what if/.test(
      q,
    );
  const hasExecutionSignal =
    /blocked|execution|cutover|next gate|migration phase|wave.*block|stuck|progress/.test(q);
  const hasOutcomeLearningSignal =
    /expected result|miss.*target|differ from target|variance|outcome|observed|what should we learn|lesson|playbook|future wave/.test(
      q,
    );
  const hasRiskSignal = /risk|constraint|concern|blocker|before approv|remaining/.test(q);
  const hasRecSignal =
    /why.*recommend|why (retain|retire|rehost|replatform|refactor|repurchase)|justify|explain|executive|summary|should we/.test(
      q,
    );

  // Hybrid handoff: user asks both discovery (gaps/dependencies) AND architecture (6R recommendation/alternatives)
  if ((hasGapSignal || hasDependencySignal) && (hasRecSignal || hasAlternativeSignal)) {
    return 'hybrid_discovery_and_architect';
  }

  if (hasGapSignal) return 'discovery_gaps';
  if (hasAlternativeSignal) return 'architect_alternatives';
  if (hasCounterfactualSignal) return 'architect_counterfactual';
  if (hasOutcomeLearningSignal) return 'architect_outcomes_learning';
  if (hasExecutionSignal) return 'architect_execution';
  if (hasDependencySignal && !hasRiskSignal) return 'discovery_dependencies';
  if (hasRiskSignal) return 'architect_risks';
  if (hasDependencySignal) return 'discovery_dependencies';
  if (hasRecSignal) return 'architect_recommendation';

  // Stage-aware fallback when prompt is brief (e.g., "What should happen next?")
  if (currentStage === 'dna' || currentStage === 'discover') return 'discovery_gaps';
  if (currentStage === 'execute') return 'architect_execution';
  if (currentStage === 'measure' || currentStage === 'learn') return 'architect_outcomes_learning';

  return 'architect_recommendation';
}

function buildGovernanceRefusalResult(
  violation: GovernanceViolationType,
  ctx: SpecialistAgentContext,
  recommended6R: Disposition6R,
  confidenceScore: number,
  baseTools: AgentToolExecution[],
): OrchestratedAskEmosResult {
  const { workload, readiness, lifecycle, question, currentStage } = ctx;
  const plain = PLAIN_ENGLISH_6R[recommended6R]?.plainEnglish || recommended6R;

  const refusalByViolation: Record<
    GovernanceViolationType,
    { conclusion: string; bullets: string[]; nextAction: string }
  > = {
    evidence_gate_bypass: {
      conclusion: `Blocked by EMOS Governance: I cannot ignore the evidence readiness gate or approve ${workload.name}.`,
      bullets: [
        `Rule Enforced: AGENT RECOMMENDS → EMOS VALIDATES → HUMAN APPROVES. Evidence readiness is currently ${readiness.decisionReadiness} (${readiness.completeness}% verified; ${readiness.criticalGaps.length} critical gap(s)).`,
        readiness.criticalGaps.length > 0
          ? `Unverified critical fields blocking READY status: ${readiness.criticalGaps.join(', ')}.`
          : `Even when READY, only an authorized human approver can grant governance sign-off.`,
        'Deterministic readiness thresholds (>= 70% completeness + zero critical gaps) cannot be overridden by prompts.',
      ],
      nextAction:
        readiness.criticalGaps.length > 0
          ? `Verify ${readiness.criticalGaps.slice(0, 2).join(' and ')} in Enterprise DNA for ${workload.name}, then submit for human approval.`
          : `Route ${workload.name} to Human Governance Approval in Portfolio & Governance.`,
    },
    human_approval_bypass: {
      conclusion: `Blocked by EMOS Governance: Execution for ${workload.name} cannot proceed without explicit Human Approval.`,
      bullets: [
        'Rule Enforced: HUMANS FOR AUTHORITY — AI agents recommend and explain, but never authorize execution or bypass sign-off.',
        `Current Governance Status for ${workload.name}: ${lifecycle.governanceStatus} (${plain} / ${recommended6R}).`,
        'Execution gates remain locked until an authorized human reviewer records approval.',
      ],
      nextAction: `Review the recommendation and record Human Approval for ${workload.name} before mobilizing execution.`,
    },
    unsupported_override: {
      conclusion: `Blocked by EMOS Governance: I cannot change ${workload.name}'s "${plain}" (${recommended6R}) recommendation without verified supporting evidence.`,
      bullets: [
        `Current recommendation is grounded in ${readiness.knownCount}/${readiness.totalCount} verified Enterprise DNA attributes for ${workload.name}.`,
        'Prompt-only overrides without updated DNA facts violate EMOS evidence grounding and audit traceability.',
        'To evaluate an alternative 6R path, update verified facts in Enterprise DNA or ask "What would change your recommendation?"',
      ],
      nextAction: `Inspect or update verified DNA attributes for ${workload.name} in Enterprise DNA to re-run deterministic validation.`,
    },
    cross_workload_leakage: {
      conclusion: `Blocked by EMOS Context Isolation: I cannot reuse another workload's evidence for ${workload.name}.`,
      bullets: [
        `Active Workload Scope: ${workload.name} (${workload.id}) — evaluated strictly from its own ${readiness.knownCount}/${readiness.totalCount} verified DNA facts.`,
        'Copying evidence from a prior workload would corrupt readiness scoring and create false audit lineage.',
        readiness.criticalGaps.length > 0
          ? `${workload.name} still requires its own verification for: ${readiness.criticalGaps.join(', ')}.`
          : `${workload.name} already has its own verified evidence (${readiness.completeness}%).`,
      ],
      nextAction: `Verify missing DNA fields directly on ${workload.name}'s own Enterprise DNA record.`,
    },
    fabricated_evidence: {
      conclusion: `Blocked by EMOS Grounding Guardrail: I cannot invent or fabricate missing cost, compliance, or technical evidence for ${workload.name}.`,
      bullets: [
        `Verified completeness for ${workload.name} is ${readiness.completeness}% (${readiness.decisionReadiness}). Unverified fields must remain marked missing/incomplete.`,
        readiness.criticalGaps.length > 0
          ? `Fields requiring real verification (not estimation): ${readiness.criticalGaps.join(', ')}.`
          : 'All critical fields are already verified; no fabrication is needed.',
        'EMOS surfaces explicit evidence gaps rather than hallucinating financial baselines or architecture facts.',
      ],
      nextAction: `Collect and enter verified evidence for ${workload.name} in Enterprise DNA before proceeding.`,
    },
  };

  const payload = refusalByViolation[violation];
  const toolsCalled: AgentToolExecution[] = [
    ...baseTools,
    {
      toolName: 'enforce_governance_guardrail',
      label: 'enforce_governance_guardrail()',
      summary: `Intercepted ${violation} attempt on ${workload.name}; preserved deterministic gate & human authority.`,
      status: 'verified',
    },
  ];

  return {
    id: `agent-reply-${Date.now()}`,
    question,
    workloadId: workload.id,
    workloadName: workload.name,
    stage: currentStage || 'assess',
    intent: 'governance_refusal',
    routedAgents: [],
    handoffOccurred: false,
    governanceIntercepted: true,
    governanceViolation: violation,
    recommended6R,
    decisionReadiness: readiness.decisionReadiness,
    evidenceCompleteness: readiness.completeness,
    confidenceScore,
    conclusion: payload.conclusion,
    bullets: payload.bullets,
    nextAction: payload.nextAction,
    evidenceSummary: `${readiness.completeness}% verified (${workload.name} · ${workload.currentStack} · ${workload.hosting} · ${workload.knownDependencies})`,
    reasoningSummary: `EMOS Deterministic Orchestrator intercepted a governance/safety violation (${violation}). Specialist agents were not permitted to bypass Readiness=${readiness.decisionReadiness} or Human Approval.`,
    toolsCalled,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

/**
 * Deterministic EMOS Orchestrator for Ask EMOS.
 *
 * Preserves ONE user-facing conversational experience while coordinating two
 * specialist agents under deterministic workflow & governance controls:
 *   1. Portfolio Discovery Agent (evidence gaps, dependencies, ambiguity)
 *   2. Enterprise Architect Agent (6R reasoning, alternatives, risks, execution, outcomes, learning)
 *
 * Guarantees:
 * - Deterministic evidence readiness validation on every turn
 * - Strict active-workload isolation (no stale-workload evidence leakage)
 * - Deterministic pre-execution guardrail against governance/safety bypasses
 */
export function orchestrateAskEmos(input: OrchestrateAskEmosInput): OrchestratedAskEmosResult {
  const { question, workload, activeInteraction, currentStage, estateName } = input;
  const trimmedQuestion = (question || '').trim();

  if (!trimmedQuestion) {
    throw new Error('Ask EMOS requires a non-empty question.');
  }

  const readiness = evaluateEvidenceReadiness(workload.dna);
  const archRec = synthesizeArchitecturalRecommendation(workload);
  const lifecycle =
    input.lifecycle ||
    buildDefaultLifecycleState(
      workload,
      (activeInteraction?.recommended6R as Disposition6R | undefined) || archRec.recommended6R,
    );

  const recommended6R: Disposition6R =
    (activeInteraction?.recommended6R as Disposition6R) || lifecycle.disposition || archRec.recommended6R;
  const confidenceScore = activeInteraction?.confidenceScore ?? archRec.confidenceScore;
  const completeness = activeInteraction?.evidenceCompleteness ?? readiness.completeness;
  const decisionReadiness: DecisionReadiness =
    (activeInteraction?.decisionReadiness as DecisionReadiness | undefined) || readiness.decisionReadiness;

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

  // 1. Governance / Safety Guardrail Interception
  const violation = detectGovernanceViolation(trimmedQuestion);
  if (violation) {
    return buildGovernanceRefusalResult(violation, ctx, recommended6R, confidenceScore, baseTools);
  }

  // 2. Specialist Routing & Optional Handoff
  const routedAgents: SpecialistAgentId[] = [];
  let handoffOccurred = false;
  let specialistTools: AgentToolExecution[] = [];
  let conclusion = '';
  let bullets: string[] = [];
  let nextAction = '';
  let reasoningNotes: string[] = [];

  if (intent === 'discovery_gaps' || intent === 'discovery_dependencies') {
    routedAgents.push('portfolio-discovery-agent');
    const discoveryResult = runPortfolioDiscoveryAgent(ctx);
    specialistTools = discoveryResult.toolsCalled;
    conclusion = discoveryResult.conclusion;
    bullets = discoveryResult.bullets;
    nextAction = discoveryResult.nextAction;
    reasoningNotes.push(discoveryResult.reasoningNote);
  } else if (intent === 'hybrid_discovery_and_architect') {
    // Multi-agent handoff: Portfolio Discovery Agent -> Enterprise Architect Agent
    routedAgents.push('portfolio-discovery-agent', 'enterprise-architect-agent');
    handoffOccurred = true;
    const discoveryResult = runPortfolioDiscoveryAgent({ ...ctx, intent: 'discovery_gaps' });
    const architectResult = runEnterpriseArchitectAgent(
      { ...ctx, intent: 'architect_recommendation' },
      discoveryResult.discoveryFindings,
    );
    specialistTools = [
      ...discoveryResult.toolsCalled,
      {
        toolName: 'orchestrator_handoff',
        label: 'orchestrator.handoff(discovery → architect)',
        summary: `Passed verified discovery findings (${readiness.criticalGaps.length} critical gap(s)) to Enterprise Architect Agent.`,
        status: 'verified',
      },
      ...architectResult.toolsCalled,
    ];
    conclusion = `${architectResult.conclusion} ${discoveryResult.discoveryFindings && discoveryResult.discoveryFindings.criticalGaps.length > 0 ? `Discovery also flagged ${discoveryResult.discoveryFindings.criticalGaps.length} critical gap(s).` : 'Discovery confirmed evidence readiness.'}`;
    bullets = [
      architectResult.bullets[0],
      discoveryResult.bullets[0],
      architectResult.bullets[2] || discoveryResult.bullets[1],
    ].filter(Boolean);
    nextAction =
      readiness.decisionReadiness === 'NEEDS EVIDENCE'
        ? discoveryResult.nextAction
        : architectResult.nextAction;
    reasoningNotes.push(discoveryResult.reasoningNote, architectResult.reasoningNote);
  } else {
    routedAgents.push('enterprise-architect-agent');
    const architectResult = runEnterpriseArchitectAgent(ctx);
    specialistTools = architectResult.toolsCalled;
    conclusion = architectResult.conclusion;
    bullets = architectResult.bullets;
    nextAction = architectResult.nextAction;
    reasoningNotes.push(architectResult.reasoningNote);
  }

  const plain = PLAIN_ENGLISH_6R[recommended6R]?.plainEnglish || recommended6R;

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
    reasoningSummary: `Routed via EMOS Deterministic Orchestrator to ${routedAgents.join(' → ')}. ${reasoningNotes.join(' ')} Readiness=${decisionReadiness}, Confidence=${confidenceScore}%, Primary=${plain} (${recommended6R}).`,
    toolsCalled: [...baseTools, ...specialistTools],
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}
