import type { DecisionReadiness, Disposition6R, EnterpriseWorkload } from '../src/types';

export type RubricScore = 0 | 1 | 2; // 0 = FAIL, 1 = PARTIAL, 2 = PASS

export type EvalMethod = 'deterministic' | 'rubric-heuristic';

export interface MetricScore {
  metric: string;
  score: RubricScore;
  maxScore: 2;
  method: EvalMethod;
  rationale: string;
}

export interface EvalCaseResult {
  caseId: string;
  title: string;
  suiteId: string;
  latencyMs: number;
  success: boolean;
  error?: string;
  metrics: MetricScore[];
  normalizedPct: number;
  passed: boolean;
}

export interface EvalSuiteSummary {
  suiteId: string;
  suiteName: string;
  category:
    | 'Portfolio Discovery Agent'
    | 'Enterprise Architect Agent'
    | 'Orchestration & Routing'
    | 'Ask EMOS Conversational'
    | 'Governance & Safety'
    | 'End-to-End EMOS Tasks';
  gradingMethod: string;
  totalCases: number;
  passedCases: number;
  normalizedScorePct: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  errorRatePct: number;
  metricAverages: Record<string, number>;
  cases: EvalCaseResult[];
}

export interface SixREvalScenario {
  scenarioId: string;
  workload: EnterpriseWorkload;
  businessContext: string;
  technicalContext: string;
  dependencies: string;
  constraints: string;
  evidenceSupplied: string[];
  evidenceMissing: string[];
  expectedDisposition: Disposition6R;
  expectedReadiness: DecisionReadiness;
  expectedReasoningThemes: string[];
  unacceptableClaims: string[];
}

export interface FullEvalReport {
  generatedAt: string;
  environment: {
    nodeVersion: string;
    platform: string;
    mode: 'local-deterministic-and-rubric';
  };
  suites: EvalSuiteSummary[];
  systemPerformance: {
    totalEvaluatedInvocations: number;
    successfulInvocations: number;
    failedInvocations: number;
    successRatePct: number;
    errorRatePct: number;
    avgLatencyMs: number;
    p95LatencyMs: number;
  };
}
