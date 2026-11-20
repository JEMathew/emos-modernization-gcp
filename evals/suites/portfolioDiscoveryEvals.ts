import { performance } from 'node:perf_hooks';
import { orchestrateAskEmos } from '../../src/lib/agents/orchestrator';
import { evaluateEvidenceReadiness } from '../../src/lib/readiness';
import { SIX_R_EVAL_DATASET } from '../dataset/sixRScenarios';
import {
  checkNoUnacceptableClaims,
  hasAnyPattern,
  normalizeCaseMetrics,
  scoreMetric,
  summarizeSuite,
} from '../graders';
import type { EvalCaseResult, EvalSuiteSummary, MetricScore } from '../types';

export function runPortfolioDiscoveryEvals(): EvalSuiteSummary {
  // Select 8 diverse workloads: all 6 NEEDS EVIDENCE scenarios + 2 READY scenarios
  const selected = [
    ...SIX_R_EVAL_DATASET.filter((s) => s.expectedReadiness === 'NEEDS EVIDENCE'),
    ...SIX_R_EVAL_DATASET.filter((s) => s.expectedReadiness === 'READY').slice(0, 2),
  ];

  const cases: EvalCaseResult[] = selected.map((scenario, idx) => {
    const isDepQuery = idx % 2 === 1;
    const prompt = isDepQuery
      ? 'Which systems and dependencies are coupled to this workload, and what needs verification?'
      : 'What evidence is still missing or ambiguous before we can decide?';

    const t0 = performance.now();
    try {
      const result = orchestrateAskEmos({
        question: prompt,
        workload: scenario.workload,
        currentStage: 'dna',
      });
      const latencyMs = Math.round((performance.now() - t0) * 1000) / 1000;
      const readiness = evaluateEvidenceReadiness(scenario.workload.dna);
      const combinedText = [result.conclusion, ...result.bullets, result.nextAction, result.evidenceSummary].join(' ');

      const metrics: MetricScore[] = [
        scoreMetric(
          'Correctness',
          result.routedAgents.includes('portfolio-discovery-agent') &&
            result.decisionReadiness === scenario.expectedReadiness
            ? 2
            : 0,
          'deterministic',
          `Routed to ${result.routedAgents.join(', ')} with readiness=${result.decisionReadiness} (expected ${scenario.expectedReadiness}).`,
        ),
        scoreMetric(
          'Evidence Grounding',
          combinedText.includes(scenario.workload.name) &&
            combinedText.includes(`${readiness.completeness}%`)
            ? 2
            : 1,
          'deterministic',
          `Cites workload name and exact verified completeness (${readiness.completeness}%).`,
        ),
        scoreMetric(
          'Missing-Evidence Detection',
          readiness.criticalGaps.length > 0
            ? readiness.criticalGaps.some((g) => combinedText.toLowerCase().includes(g.toLowerCase()))
              ? 2
              : 0
            : /zero.*critical gaps|all critical.*verified|ready/i.test(combinedText)
            ? 2
            : 1,
          'deterministic',
          readiness.criticalGaps.length > 0
            ? `Expected detection of critical gap(s): ${readiness.criticalGaps.join(', ')}.`
            : 'Expected confirmation of zero blocking critical gaps.',
        ),
        scoreMetric(
          'Context',
          result.workloadId === scenario.workload.id && result.stage === 'dna' ? 2 : 0,
          'deterministic',
          `Preserved workloadId=${result.workloadId} and stage=${result.stage}.`,
        ),
        scoreMetric(
          'Dependency Interpretation',
          hasAnyPattern(combinedText, [scenario.workload.knownDependencies, /dependenc|interface|integration|coupled/i]) >= 1
            ? 2
            : 1,
          'rubric-heuristic',
          `Interpreted dependency surface (${scenario.workload.knownDependencies}).`,
        ),
        scoreMetric(
          'Hallucination',
          checkNoUnacceptableClaims(combinedText, scenario.unacceptableClaims),
          'deterministic',
          'Verified zero unacceptable or fabricated claims.',
        ),
        scoreMetric(
          'Actionability',
          result.nextAction.length > 20 && /verify|proceed|enterprise dna|governance|wave/i.test(result.nextAction)
            ? 2
            : 1,
          'rubric-heuristic',
          `Concrete next investigation step: "${result.nextAction}".`,
        ),
      ];

      const normalizedPct = normalizeCaseMetrics(metrics);
      return {
        caseId: `DISC-${String(idx + 1).padStart(2, '0')}`,
        title: `${scenario.scenarioId} (${scenario.expectedReadiness}) — ${isDepQuery ? 'Dependency Analysis' : 'Gap Detection'}`,
        suiteId: 'portfolio-discovery',
        latencyMs,
        success: true,
        metrics,
        normalizedPct,
        passed: metrics.every((m) => m.score >= 1) && normalizedPct >= 85,
      };
    } catch (err) {
      const latencyMs = Math.round((performance.now() - t0) * 1000) / 1000;
      return {
        caseId: `DISC-${String(idx + 1).padStart(2, '0')}`,
        title: scenario.scenarioId,
        suiteId: 'portfolio-discovery',
        latencyMs,
        success: false,
        error: err instanceof Error ? err.message : String(err),
        metrics: [],
        normalizedPct: 0,
        passed: false,
      };
    }
  });

  return summarizeSuite(
    'portfolio-discovery',
    'Portfolio Discovery Agent Evals',
    'Portfolio Discovery Agent',
    'Hybrid (Deterministic gate/grounding checks + Rubric heuristics)',
    cases,
  );
}
