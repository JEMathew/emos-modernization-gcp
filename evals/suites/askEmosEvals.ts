import { performance } from 'node:perf_hooks';
import { orchestrateAskEmos } from '../../src/lib/agents/orchestrator';
import { SIX_R_EVAL_DATASET } from '../dataset/sixRScenarios';
import { normalizeCaseMetrics, scoreMetric, summarizeSuite } from '../graders';
import type { EvalCaseResult, EvalSuiteSummary, MetricScore } from '../types';

export function runAskEmosConversationalEvals(): EvalSuiteSummary {
  const needsEvidenceWorkload = SIX_R_EVAL_DATASET.find((s) => s.scenarioId === 'SCEN-REFACTOR-03')!.workload;
  const readyWorkload = SIX_R_EVAL_DATASET.find((s) => s.scenarioId === 'SCEN-REPLATFORM-01')!.workload;

  const prompts: {
    id: string;
    stage: string;
    question: string;
    workload: typeof readyWorkload;
    expectedAgent: 'portfolio-discovery-agent' | 'enterprise-architect-agent';
    relevanceRegex: RegExp;
  }[] = [
    {
      id: 'ASK-01',
      stage: 'dna',
      question: "What's missing?",
      workload: needsEvidenceWorkload,
      expectedAgent: 'portfolio-discovery-agent',
      relevanceRegex: /missing|gap|tco|target|verify/i,
    },
    {
      id: 'ASK-02',
      stage: 'assess',
      question: 'Why Replatform?',
      workload: readyWorkload,
      expectedAgent: 'enterprise-architect-agent',
      relevanceRegex: /replatform|managed cloud|tco|scale/i,
    },
    {
      id: 'ASK-03',
      stage: 'assess',
      question: 'Why not Refactor?',
      workload: readyWorkload,
      expectedAgent: 'enterprise-architect-agent',
      relevanceRegex: /alternative|rejected|outperforms|rehost|refactor|retire/i,
    },
    {
      id: 'ASK-04',
      stage: 'approve',
      question: 'What risks remain?',
      workload: readyWorkload,
      expectedAgent: 'enterprise-architect-agent',
      relevanceRegex: /risk|dependenc|cutover|governance|sign-off/i,
    },
    {
      id: 'ASK-05',
      stage: 'execute',
      question: 'Why is this blocked?',
      workload: readyWorkload,
      expectedAgent: 'enterprise-architect-agent',
      relevanceRegex: /blocked|gated|stage|gate|approval/i,
    },
    {
      id: 'ASK-06',
      stage: 'measure',
      question: 'Why did this miss target?',
      workload: readyWorkload,
      expectedAgent: 'enterprise-architect-agent',
      relevanceRegex: /baseline|target|observed|variance|outcome/i,
    },
    {
      id: 'ASK-07',
      stage: 'learn',
      question: 'Where should this lesson apply?',
      workload: readyWorkload,
      expectedAgent: 'enterprise-architect-agent',
      relevanceRegex: /lesson|apply|wave|playbook|data platform/i,
    },
  ];

  const cases: EvalCaseResult[] = prompts.map((p) => {
    const t0 = performance.now();
    const res = orchestrateAskEmos({
      question: p.question,
      workload: p.workload,
      currentStage: p.stage,
    });
    const latencyMs = Math.round((performance.now() - t0) * 1000) / 1000;
    const combined = [res.conclusion, ...res.bullets, res.nextAction].join(' ');
    const wordCount = combined.split(/\s+/).filter(Boolean).length;

    const metrics: MetricScore[] = [
      scoreMetric(
        'Correctness',
        res.routedAgents.includes(p.expectedAgent) && !res.governanceIntercepted ? 2 : 0,
        'deterministic',
        `Routed to ${res.routedAgents.join(', ')} (expected ${p.expectedAgent}).`,
      ),
      scoreMetric(
        'Groundedness',
        combined.includes(p.workload.name) && res.evidenceSummary.includes(`${p.workload.evidenceCompleteness}%`)
          ? 2
          : 1,
        'deterministic',
        `Grounded in ${p.workload.name} (${p.workload.evidenceCompleteness}% verified).`,
      ),
      scoreMetric(
        'Context Retention',
        res.workloadId === p.workload.id && res.stage === p.stage ? 2 : 0,
        'deterministic',
        `Preserved workloadId=${res.workloadId} and stage=${res.stage}.`,
      ),
      scoreMetric(
        'Relevance',
        p.relevanceRegex.test(combined) ? 2 : 0,
        'rubric-heuristic',
        `Response directly addressed "${p.question}" in ${p.stage} stage.`,
      ),
      scoreMetric(
        'Actionability',
        res.nextAction.length >= 20 ? 2 : 0,
        'rubric-heuristic',
        `Provided explicit next action: "${res.nextAction}".`,
      ),
      scoreMetric(
        'Conciseness',
        res.bullets.length <= 3 && wordCount <= 160 ? 2 : wordCount <= 220 ? 1 : 0,
        'rubric-heuristic',
        `Concise executive format (${res.bullets.length} bullets, ${wordCount} words).`,
      ),
      scoreMetric(
        'Safety',
        !/auto-?approved|bypassed gate|invented cost/i.test(combined) ? 2 : 0,
        'deterministic',
        'No unsafe governance bypass or fabricated claims.',
      ),
    ];

    const normalizedPct = normalizeCaseMetrics(metrics);
    return {
      caseId: p.id,
      title: `[${p.stage.toUpperCase()}] "${p.question}"`,
      suiteId: 'ask-emos-conversational',
      latencyMs,
      success: true,
      metrics,
      normalizedPct,
      passed: metrics.every((m) => m.score >= 1) && normalizedPct >= 85,
    };
  });

  return summarizeSuite(
    'ask-emos-conversational',
    'Ask EMOS Conversational Evals',
    'Ask EMOS Conversational',
    'Hybrid (Deterministic routing/grounding/safety + Rubric relevance/conciseness)',
    cases,
  );
}
