import { performance } from 'node:perf_hooks';
import { orchestrateAskEmos } from '../../src/lib/agents/orchestrator';
import { SIX_R_EVAL_DATASET } from '../dataset/sixRScenarios';
import { normalizeCaseMetrics, scoreMetric, summarizeSuite } from '../graders';
import type { EvalCaseResult, EvalSuiteSummary, MetricScore } from '../types';

export function runOrchestrationEvals(): EvalSuiteSummary {
  const needsEvidenceScenario = SIX_R_EVAL_DATASET.find((s) => s.scenarioId === 'SCEN-REFACTOR-03')!;
  const readyRetainScenario = SIX_R_EVAL_DATASET.find((s) => s.scenarioId === 'SCEN-RETAIN-01')!;
  const readyReplatformScenario = SIX_R_EVAL_DATASET.find((s) => s.scenarioId === 'SCEN-REPLATFORM-01')!;

  const cases: EvalCaseResult[] = [];

  // 1. Paraphrased Discovery Routing (not exact string match)
  {
    const t0 = performance.now();
    const res = orchestrateAskEmos({
      question: 'Which unverified facts do we still need to collect from stakeholders before moving forward?',
      workload: needsEvidenceScenario.workload,
      currentStage: 'dna',
    });
    const latencyMs = Math.round((performance.now() - t0) * 1000) / 1000;
    const metrics: MetricScore[] = [
      scoreMetric(
        'Specialist Routing',
        res.routedAgents.length === 1 && res.routedAgents[0] === 'portfolio-discovery-agent' ? 2 : 0,
        'deterministic',
        `Routed paraphrased discovery prompt to ${res.routedAgents.join(', ')}.`,
      ),
      scoreMetric(
        'Context Preservation',
        res.workloadId === needsEvidenceScenario.workload.id && res.stage === 'dna' ? 2 : 0,
        'deterministic',
        `Preserved workloadId=${res.workloadId} and stage=${res.stage}.`,
      ),
    ];
    cases.push({
      caseId: 'ORCH-01',
      title: 'Paraphrased discovery query routes to Portfolio Discovery Agent',
      suiteId: 'orchestration',
      latencyMs,
      success: true,
      metrics,
      normalizedPct: normalizeCaseMetrics(metrics),
      passed: metrics.every((m) => m.score === 2),
    });
  }

  // 2. Paraphrased Architect Routing
  {
    const t0 = performance.now();
    const res = orchestrateAskEmos({
      question: 'Can you justify this target cloud platform path instead of doing a simple lift and shift?',
      workload: readyReplatformScenario.workload,
      currentStage: 'assess',
    });
    const latencyMs = Math.round((performance.now() - t0) * 1000) / 1000;
    const metrics: MetricScore[] = [
      scoreMetric(
        'Specialist Routing',
        res.routedAgents.length === 1 && res.routedAgents[0] === 'enterprise-architect-agent' ? 2 : 0,
        'deterministic',
        `Routed paraphrased trade-off prompt to ${res.routedAgents.join(', ')}.`,
      ),
      scoreMetric(
        'Intent Accuracy',
        res.intent === 'architect_alternatives' ? 2 : 1,
        'deterministic',
        `Classified intent=${res.intent}.`,
      ),
    ];
    cases.push({
      caseId: 'ORCH-02',
      title: 'Paraphrased trade-off query routes to Enterprise Architect Agent',
      suiteId: 'orchestration',
      latencyMs,
      success: true,
      metrics,
      normalizedPct: normalizeCaseMetrics(metrics),
      passed: metrics.every((m) => m.score === 2),
    });
  }

  // 3. Multi-Agent Handoff (Discovery -> Architect)
  {
    const t0 = performance.now();
    const res = orchestrateAskEmos({
      question: 'What evidence is missing, and why are you recommending Refactor for this workload?',
      workload: needsEvidenceScenario.workload,
      currentStage: 'assess',
    });
    const latencyMs = Math.round((performance.now() - t0) * 1000) / 1000;
    const metrics: MetricScore[] = [
      scoreMetric(
        'Handoff Execution',
        res.handoffOccurred &&
          res.routedAgents[0] === 'portfolio-discovery-agent' &&
          res.routedAgents[1] === 'enterprise-architect-agent'
          ? 2
          : 0,
        'deterministic',
        `Handoff sequence: ${res.routedAgents.join(' -> ')} (handoffOccurred=${res.handoffOccurred}).`,
      ),
      scoreMetric(
        'Sequence Correctness',
        res.toolsCalled.some((t) => t.toolName === 'orchestrator_handoff') &&
          res.decisionReadiness === 'NEEDS EVIDENCE'
          ? 2
          : 0,
        'deterministic',
        'Recorded explicit orchestrator handoff tool trace and preserved NEEDS EVIDENCE gate.',
      ),
    ];
    cases.push({
      caseId: 'ORCH-03',
      title: 'Compound query executes Discovery → Architect handoff',
      suiteId: 'orchestration',
      latencyMs,
      success: true,
      metrics,
      normalizedPct: normalizeCaseMetrics(metrics),
      passed: metrics.every((m) => m.score === 2),
    });
  }

  // 4. Zero Stale-Workload Context Leakage
  {
    const t0 = performance.now();
    const first = orchestrateAskEmos({
      question: 'Why are you recommending Retain?',
      workload: readyRetainScenario.workload,
      currentStage: 'assess',
    });
    const second = orchestrateAskEmos({
      question: 'What evidence is missing?',
      workload: needsEvidenceScenario.workload,
      currentStage: 'dna',
    });
    const latencyMs = Math.round((performance.now() - t0) * 1000) / 1000;
    const secondText = [second.conclusion, ...second.bullets, second.evidenceSummary].join(' ');
    const leakedFirst = secondText.includes(readyRetainScenario.workload.name) || secondText.includes('ISO8583');
    const metrics: MetricScore[] = [
      scoreMetric(
        'Context Isolation',
        first.workloadId !== second.workloadId && !leakedFirst ? 2 : 0,
        'deterministic',
        `Switched from ${first.workloadName} to ${second.workloadName} with zero stale-workload leakage.`,
      ),
      scoreMetric(
        'Readiness Recalculation',
        first.decisionReadiness === 'READY' && second.decisionReadiness === 'NEEDS EVIDENCE' ? 2 : 0,
        'deterministic',
        `Recomputed independent readiness states (${first.decisionReadiness} -> ${second.decisionReadiness}).`,
      ),
    ];
    cases.push({
      caseId: 'ORCH-04',
      title: 'Switching workloads enforces zero stale-workload leakage',
      suiteId: 'orchestration',
      latencyMs,
      success: true,
      metrics,
      normalizedPct: normalizeCaseMetrics(metrics),
      passed: metrics.every((m) => m.score === 2),
    });
  }

  // 5. Stage-Aware Routing on Brief Generic Prompt
  {
    const t0 = performance.now();
    const dnaRes = orchestrateAskEmos({
      question: 'What next?',
      workload: needsEvidenceScenario.workload,
      currentStage: 'dna',
    });
    const execRes = orchestrateAskEmos({
      question: 'What next?',
      workload: readyReplatformScenario.workload,
      currentStage: 'execute',
    });
    const latencyMs = Math.round((performance.now() - t0) * 1000) / 1000;
    const metrics: MetricScore[] = [
      scoreMetric(
        'Stage-Aware Routing',
        dnaRes.routedAgents[0] === 'portfolio-discovery-agent' &&
          execRes.routedAgents[0] === 'enterprise-architect-agent' &&
          execRes.intent === 'architect_execution'
          ? 2
          : 0,
        'deterministic',
        `Same brief prompt routed to ${dnaRes.routedAgents[0]} in DNA stage and ${execRes.routedAgents[0]} (${execRes.intent}) in Execute stage.`,
      ),
    ];
    cases.push({
      caseId: 'ORCH-05',
      title: 'Brief ambiguous prompt adapts routing to active EMOS stage',
      suiteId: 'orchestration',
      latencyMs,
      success: true,
      metrics,
      normalizedPct: normalizeCaseMetrics(metrics),
      passed: metrics.every((m) => m.score === 2),
    });
  }

  // 6. Failure Handling on Empty Input
  {
    const t0 = performance.now();
    let threwExpected = false;
    try {
      orchestrateAskEmos({
        question: '   ',
        workload: readyReplatformScenario.workload,
        currentStage: 'assess',
      });
    } catch (err) {
      threwExpected = err instanceof Error && /non-empty/i.test(err.message);
    }
    const latencyMs = Math.round((performance.now() - t0) * 1000) / 1000;
    const metrics: MetricScore[] = [
      scoreMetric(
        'Failure Behavior',
        threwExpected ? 2 : 0,
        'deterministic',
        threwExpected
          ? 'Rejected empty prompt deterministically with clear validation error.'
          : 'Failed to reject empty prompt.',
      ),
    ];
    cases.push({
      caseId: 'ORCH-06',
      title: 'Empty query fails cleanly with deterministic validation error',
      suiteId: 'orchestration',
      latencyMs,
      success: true,
      metrics,
      normalizedPct: normalizeCaseMetrics(metrics),
      passed: threwExpected,
    });
  }

  return summarizeSuite(
    'orchestration',
    'EMOS Orchestration & Routing Evals',
    'Orchestration & Routing',
    'Deterministic (Routing, handoff, context isolation, and failure contracts)',
    cases,
  );
}
