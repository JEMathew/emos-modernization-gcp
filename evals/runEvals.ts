import fs from 'node:fs';
import path from 'node:path';
import { computePercentile } from './graders';
import { runPortfolioDiscoveryEvals } from './suites/portfolioDiscoveryEvals';
import { runEnterpriseArchitectEvals } from './suites/enterpriseArchitectEvals';
import { runOrchestrationEvals } from './suites/orchestrationEvals';
import { runAskEmosConversationalEvals } from './suites/askEmosEvals';
import { runGovernanceSafetyEvals } from './suites/governanceSafetyEvals';
import { runEndToEndTaskEvals } from './suites/endToEndTaskEvals';
import type { FullEvalReport } from './types';

function main() {
  const suites = [
    runPortfolioDiscoveryEvals(),
    runEnterpriseArchitectEvals(),
    runOrchestrationEvals(),
    runAskEmosConversationalEvals(),
    runGovernanceSafetyEvals(),
    runEndToEndTaskEvals(),
  ];

  const allCases = suites.flatMap((s) => s.cases);
  const allLatencies = allCases.map((c) => c.latencyMs);
  const successfulInvocations = allCases.filter((c) => c.success).length;
  const failedInvocations = allCases.length - successfulInvocations;

  const report: FullEvalReport = {
    generatedAt: new Date().toISOString(),
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      mode: 'local-deterministic-and-rubric',
    },
    suites,
    systemPerformance: {
      totalEvaluatedInvocations: allCases.length,
      successfulInvocations,
      failedInvocations,
      successRatePct:
        allCases.length > 0 ? Math.round((successfulInvocations / allCases.length) * 1000) / 10 : 0,
      errorRatePct:
        allCases.length > 0 ? Math.round((failedInvocations / allCases.length) * 1000) / 10 : 0,
      avgLatencyMs:
        allLatencies.length > 0
          ? Math.round((allLatencies.reduce((a, b) => a + b, 0) / allLatencies.length) * 1000) / 1000
          : 0,
      p95LatencyMs: computePercentile(allLatencies, 95),
    },
  };

  const reportsDir = path.resolve(process.cwd(), 'evals', 'reports');
  fs.mkdirSync(reportsDir, { recursive: true });
  const reportPath = path.join(reportsDir, 'latest-eval-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');

  console.log('\n======================================================================');
  console.log('EMOS v2 — AGENT, ORCHESTRATION, GOVERNANCE & E2E EVALUATION SUMMARY');
  console.log('======================================================================');
  console.log(`Mode: ${report.environment.mode} | Node ${report.environment.nodeVersion} (${report.environment.platform})`);
  console.log('----------------------------------------------------------------------');

  let anyFailure = false;
  for (const suite of suites) {
    const status = suite.passedCases === suite.totalCases ? 'PASS' : 'NEEDS ATTENTION';
    if (suite.passedCases !== suite.totalCases) anyFailure = true;
    console.log(
      `[${status}] ${suite.category.padEnd(28)} | ${String(suite.passedCases).padStart(2)}/${String(suite.totalCases).padEnd(2)} cases | Score: ${String(suite.normalizedScorePct).padStart(5)}% | Avg: ${suite.avgLatencyMs}ms | P95: ${suite.p95LatencyMs}ms`,
    );
    const metricSummary = Object.entries(suite.metricAverages)
      .map(([k, v]) => `${k}: ${v}%`)
      .join(' · ');
    console.log(`       Metrics: ${metricSummary}`);
    for (const c of suite.cases.filter((x) => !x.passed)) {
      console.log(`       FAIL CASE ${c.caseId}: ${c.title} (${c.normalizedPct}%) ${c.error || ''}`);
    }
  }

  console.log('----------------------------------------------------------------------');
  console.log(
    `Observed Eval Performance: ${report.systemPerformance.successfulInvocations}/${report.systemPerformance.totalEvaluatedInvocations} invocations succeeded (${report.systemPerformance.successRatePct}% success, ${report.systemPerformance.errorRatePct}% error) | Avg ${report.systemPerformance.avgLatencyMs}ms | P95 ${report.systemPerformance.p95LatencyMs}ms`,
  );
  console.log(`Saved JSON report -> ${reportPath}`);
  console.log('======================================================================\n');

  if (anyFailure) {
    process.exitCode = 1;
  }
}

main();
