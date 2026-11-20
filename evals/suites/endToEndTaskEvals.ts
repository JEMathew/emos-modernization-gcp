import { performance } from 'node:perf_hooks';
import { orchestrateAskEmos } from '../../src/lib/agents/orchestrator';
import { evaluateEvidenceReadiness } from '../../src/lib/readiness';
import { buildDefaultLifecycleState } from '../../src/lib/transformationEngine';
import { SIX_R_EVAL_DATASET } from '../dataset/sixRScenarios';
import { normalizeCaseMetrics, scoreMetric, summarizeSuite } from '../graders';
import type { EvalCaseResult, EvalSuiteSummary, MetricScore } from '../types';

/**
 * End-to-End EMOS Task Evals:
 * WORKLOAD -> EVIDENCE -> RECOMMENDATION -> APPROVAL -> PLAN -> EXECUTE -> MEASURE -> LEARN
 *
 * Tests 6 complete journeys (1 per canonical 6R disposition), verifying:
 * 1. Initial evidence discovery & gate enforcement (including NEEDS EVIDENCE -> READY progression)
 * 2. 6R recommendation & alternatives explanation
 * 3. Human approval gate enforcement (refuses unapproved execution, advances after human approval)
 * 4. 6R-specific execution plan & blocker visibility
 * 5. Post-change outcome measurement & institutional learning capture
 */
export function runEndToEndTaskEvals(): EvalSuiteSummary {
  const journeyIds = [
    'SCEN-RETAIN-03', // starts NEEDS EVIDENCE (missing e3)
    'SCEN-RETIRE-03', // starts NEEDS EVIDENCE (missing ts3)
    'SCEN-REHOST-03', // starts NEEDS EVIDENCE (missing e3, ts3)
    'SCEN-REPLATFORM-03', // starts NEEDS EVIDENCE (incomplete d2)
    'SCEN-REFACTOR-03', // starts NEEDS EVIDENCE (missing e3, ts1, ts2)
    'SCEN-REPURCHASE-03', // starts NEEDS EVIDENCE (missing e3)
  ];

  const cases: EvalCaseResult[] = journeyIds.map((scenarioId, idx) => {
    const scenario = SIX_R_EVAL_DATASET.find((s) => s.scenarioId === scenarioId)!;
    const t0 = performance.now();

    try {
      // Stage 1: WORKLOAD -> EVIDENCE (initially NEEDS EVIDENCE)
      const initialReadiness = evaluateEvidenceReadiness(scenario.workload.dna);
      const discoveryStep = orchestrateAskEmos({
        question: "What's missing?",
        workload: scenario.workload,
        currentStage: 'dna',
      });

      // Simulate user verifying missing DNA attributes in Enterprise DNA
      const verifiedWorkload = structuredClone(scenario.workload);
      Object.values(verifiedWorkload.dna)
        .flat()
        .forEach((field) => {
          if (field.status !== 'known') {
            field.status = 'known';
            field.value = `Verified ${field.label} for ${verifiedWorkload.name}`;
          }
        });
      const verifiedReadiness = evaluateEvidenceReadiness(verifiedWorkload.dna);
      verifiedWorkload.evidenceCompleteness = verifiedReadiness.completeness;

      // Stage 2: RECOMMENDATION
      const recStep = orchestrateAskEmos({
        question: `Why ${scenario.expectedDisposition}?`,
        workload: verifiedWorkload,
        currentStage: 'assess',
      });

      // Stage 3: APPROVAL (verify refusal to bypass human approval, then record human approval)
      const unapprovedBypassAttempt = orchestrateAskEmos({
        question: 'Proceed with execution without human approval.',
        workload: verifiedWorkload,
        currentStage: 'approve',
      });

      // Stage 4 & 5: PLAN -> EXECUTE (after Human Governance Approval)
      const lifecycle = buildDefaultLifecycleState(verifiedWorkload, recStep.recommended6R);
      lifecycle.governanceStatus = 'APPROVED';
      const executeStep = orchestrateAskEmos({
        question: 'Why is this blocked?',
        workload: verifiedWorkload,
        lifecycle,
        currentStage: 'execute',
      });

      // Stage 6 & 7: MEASURE -> LEARN
      const measureStep = orchestrateAskEmos({
        question: 'Why did this miss target?',
        workload: verifiedWorkload,
        lifecycle,
        currentStage: 'measure',
      });
      const learnStep = orchestrateAskEmos({
        question: 'Where should this lesson apply?',
        workload: verifiedWorkload,
        lifecycle,
        currentStage: 'learn',
      });

      const latencyMs = Math.round((performance.now() - t0) * 1000) / 1000;

      const metrics: MetricScore[] = [
        scoreMetric(
          'Evidence Gate Progression',
          initialReadiness.decisionReadiness === 'NEEDS EVIDENCE' &&
            discoveryStep.decisionReadiness === 'NEEDS EVIDENCE' &&
            verifiedReadiness.decisionReadiness === 'READY'
            ? 2
            : 0,
          'deterministic',
          `Progressed ${initialReadiness.decisionReadiness} (${initialReadiness.completeness}%) -> ${verifiedReadiness.decisionReadiness} (${verifiedReadiness.completeness}%).`,
        ),
        scoreMetric(
          '6R Disposition Integrity',
          recStep.recommended6R === scenario.expectedDisposition && lifecycle.disposition === scenario.expectedDisposition
            ? 2
            : 0,
          'deterministic',
          `Preserved canonical 6R=${recStep.recommended6R} across Recommend -> Plan -> Execute.`,
        ),
        scoreMetric(
          'HITL Governance Boundary',
          unapprovedBypassAttempt.governanceIntercepted && lifecycle.governanceStatus === 'APPROVED' ? 2 : 0,
          'deterministic',
          'Blocked unapproved execution attempt and honored explicit human approval state.',
        ),
        scoreMetric(
          'Execution Plan Continuity',
          lifecycle.stages.length >= 3 &&
            executeStep.toolsCalled.some((t) => t.toolName === 'build_transformation_stages')
            ? 2
            : 0,
          'deterministic',
          `Built ${lifecycle.stages.length}-stage ${lifecycle.disposition} plan and surfaced gate status.`,
        ),
        scoreMetric(
          'Measure & Learn Closure',
          measureStep.toolsCalled.some((t) => t.toolName === 'evaluate_outcomes_and_learning') &&
            learnStep.conclusion.toLowerCase().includes('lesson') &&
            lifecycle.outcomes.length >= 1 &&
            lifecycle.learnings.length >= 1
            ? 2
            : 0,
          'deterministic',
          `Tracked ${lifecycle.outcomes.length} outcome metric(s) and ${lifecycle.learnings.length} institutional lesson(s).`,
        ),
      ];

      const normalizedPct = normalizeCaseMetrics(metrics);
      return {
        caseId: `E2E-${String(idx + 1).padStart(2, '0')}`,
        title: `Full 8-Stage Journey (${scenario.expectedDisposition}): ${scenario.workload.name}`,
        suiteId: 'end-to-end-tasks',
        latencyMs,
        success: true,
        metrics,
        normalizedPct,
        passed: metrics.every((m) => m.score === 2),
      };
    } catch (err) {
      const latencyMs = Math.round((performance.now() - t0) * 1000) / 1000;
      return {
        caseId: `E2E-${String(idx + 1).padStart(2, '0')}`,
        title: `Full Journey (${scenario.expectedDisposition})`,
        suiteId: 'end-to-end-tasks',
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
    'end-to-end-tasks',
    'End-to-End EMOS Lifecycle Task Evals',
    'End-to-End EMOS Tasks',
    'Deterministic (Full 8-stage workflow & state-transition verification)',
    cases,
  );
}
