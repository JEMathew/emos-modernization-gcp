import type { Disposition6R, EnterpriseWorkload, Interaction, DecisionReadiness } from '../../types';
import type { WorkloadLifecycleState } from '../transformationEngine';
import type { EvidenceReadinessResult } from '../readiness';

export type SpecialistAgentId = 'portfolio-discovery-agent' | 'enterprise-architect-agent';

export type OrchestrationIntent =
  | 'discovery_gaps'
  | 'discovery_dependencies'
  | 'architect_recommendation'
  | 'architect_alternatives'
  | 'architect_counterfactual'
  | 'architect_risks'
  | 'architect_execution'
  | 'architect_outcomes_learning'
  | 'hybrid_discovery_and_architect'
  | 'governance_refusal';

export type GovernanceViolationType =
  | 'evidence_gate_bypass'
  | 'human_approval_bypass'
  | 'unsupported_override'
  | 'cross_workload_leakage'
  | 'fabricated_evidence';

export interface AgentToolExecution {
  toolName: string;
  label: string;
  summary: string;
  status: 'verified';
}

export interface SpecialistAgentContext {
  question: string;
  intent: OrchestrationIntent;
  workload: EnterpriseWorkload;
  lifecycle: WorkloadLifecycleState;
  readiness: EvidenceReadinessResult;
  activeInteraction?: Interaction | null;
  currentStage?: string;
  estateName?: string;
}

export interface DiscoveryFindings {
  completeness: number;
  decisionReadiness: DecisionReadiness;
  criticalGaps: string[];
  nonCriticalGaps: string[];
  incompleteFields: string[];
  dependencySummary: string;
  ambiguitySignals: string[];
  prioritizedNextInvestigations: string[];
}

export interface SpecialistAgentResult {
  agentId: SpecialistAgentId;
  agentLabel: string;
  conclusion: string;
  bullets: string[];
  nextAction: string;
  toolsCalled: AgentToolExecution[];
  reasoningNote: string;
  discoveryFindings?: DiscoveryFindings;
  recommended6R?: Disposition6R;
}

export interface OrchestratedAskEmosResult {
  id: string;
  question: string;
  workloadId: string;
  workloadName: string;
  stage: string;
  intent: OrchestrationIntent;
  routedAgents: SpecialistAgentId[];
  handoffOccurred: boolean;
  governanceIntercepted: boolean;
  governanceViolation?: GovernanceViolationType;
  recommended6R: Disposition6R;
  decisionReadiness: DecisionReadiness;
  evidenceCompleteness: number;
  confidenceScore: number;
  conclusion: string;
  bullets: string[];
  nextAction: string;
  evidenceSummary: string;
  reasoningSummary: string;
  toolsCalled: AgentToolExecution[];
  timestamp: string;
  isLiveGemini?: boolean;
}
