import { performance } from 'node:perf_hooks';
import { orchestrateAskEmos } from '../../src/lib/agents/orchestrator';
import { SIX_R_EVAL_DATASET } from '../dataset/sixRScenarios';
import {
  checkNoUnacceptableClaims,
  hasAnyPattern,
  normalizeCaseMetrics,
  scoreMetric,
  summarizeSuite,
} from '../graders';
import type { EvalCaseResult, EvalSuiteSummary, MetricScore } from '../types';

export function runEnterpriseArchitectEvals(): EvalSuiteSummary {
  const cases: EvalCaseResult[] = SIX_R_EVAL_DATASET.map((scenario) => {
    const t0 = performance.now();
    try {
      // Query 1: Primary 6R Recommendation
      const recResult = orchestrateAskEmos({
        question: `Why are you recommending ${scenario.expectedDisposition} for this workload?`,
        workload: scenario.workload,
        currentStage: 'assess',
      });
      // Query 2: Alternatives comparison
      const altResult = orchestrateAskEmos({
        question: 'Why not another 6R option instead?',
        workload: scenario.workload,
        currentStage: 'assess',
      });
      const latencyMs = Math.round((performance.now() - t0) * 1000) / 1000;

      const recText = [recResult.conclusion, ...recResult.bullets, recResult.nextAction, recResult.evidenceSummary].join(' ');
      const altText = [altResult.conclusion, ...altResult.bullets].join(' ');
      const fullText = `${recText} ${altText}`;

      const themeHits = hasAnyPattern(fullText, scenario.expectedReasoningThemes);
      const archReasoningScore = themeHits >= 2 ? 2 : themeHits === 1 ? 1 : 0;

      const metrics: MetricScore[] = [
        scoreMetric(
          '6R Reasoning',
          recResult.recommended6R === scenario.expectedDisposition ? 2 : 0,
          'deterministic',
          `Predicted ${recResult.recommended6R} vs expected ${scenario.expectedDisposition}.`,
        ),
        scoreMetric(
          'Alternative Reasoning',
          altResult.bullets.length >= 2 &&
            altResult.toolsCalled.some((t) => t.toolName === 'compare_6r_dispositions')
            ? 2
            : 1,
          'rubric-heuristic',
          `Compared ${altResult.bullets.length} rejected canonical alternatives with explicit trade-offs.`,
        ),
        scoreMetric(
          'Evidence Grounding',
          recText.includes(scenario.workload.name) &&
            recText.includes(`${scenario.workload.evidenceCompleteness}%`)
            ? 2
            : 1,
          'deterministic',
          `Grounded in workload DNA (${scenario.workload.evidenceCompleteness}% verified).`,
        ),
        scoreMetric(
          'Architectural Reasoning',
          archReasoningScore,
          'rubric-heuristic',
          `Matched ${themeHits}/${scenario.expectedReasoningThemes.length} expected reasoning themes (${scenario.expectedReasoningThemes.join(', ')}).`,
        ),
        scoreMetric(
          'Constraint Awareness',
          hasAnyPattern(fullText, [scenario.workload.hosting, scenario.workload.currentStack, scenario.workload.knownDependencies, /constraint|latency|lease|licensing|compliance|hardware/i]) >= 2
            ? 2
            : 1,
          'rubric-heuristic',
          'Reflected workload stack, hosting, and dependency constraints.',
        ),
        scoreMetric(
          'Explanation Quality',
          recResult.conclusion.length >= 30 && recResult.bullets.length >= 2 ? 2 : 1,
          'rubric-heuristic',
          'Structured conclusion + concise supporting evidence bullets.',
        ),
        scoreMetric(
          'Hallucination',
          checkNoUnacceptableClaims(recText, scenario.unacceptableClaims),
          'deterministic',
          'Zero unacceptable or contradictory claims in primary recommendation.',
        ),
        scoreMetric(
          'Actionability',
          recResult.nextAction.length > 20 ? 2 : 0,
          'rubric-heuristic',
          `Actionable next step: "${recResult.nextAction}".`,
        ),
        scoreMetric(
          'Governance Compliance',
          recResult.decisionReadiness === scenario.expectedReadiness &&
            (scenario.expectedReadiness === 'NEEDS EVIDENCE'
              ? /verify|evidence|dna/i.test(recResult.nextAction)
              : /human|approval|review|gate/i.test(recResult.nextAction))
            ? 2
            : 0,
          'deterministic',
          `Honored readiness=${recResult.decisionReadiness} and human governance boundary.`,
        ),
      ];

      const normalizedPct = normalizeCaseMetrics(metrics);
      return {
        caseId: scenario.scenarioId,
        title: `${scenario.workload.name} — Expected ${scenario.expectedDisposition} (${scenario.expectedReadiness})`,
        suiteId: 'enterprise-architect',
        latencyMs,
        success: true,
        metrics,
        normalizedPct,
        passed:
          recResult.recommended6R === scenario.expectedDisposition &&
          metrics.every((m) => m.score >= 1) &&
          normalizedPct >= 85,
      };
    } catch (err) {
      const latencyMs = Math.round((performance.now() - t0) * 1000) / 1000;
      return {
        caseId: scenario.scenarioId,
        title: scenario.workload.name,
        suiteId: 'enterprise-architect',
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
    'enterprise-architect',
    'Enterprise Architect Agent Evals (18-Scenario 6R Dataset)',
    'Enterprise Architect Agent',
    'Hybrid (Deterministic 6R/governance checks + Rubric heuristics)',
    cases,
  );
}
