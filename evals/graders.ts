import type { EvalCaseResult, EvalMethod, EvalSuiteSummary, MetricScore, RubricScore } from './types';

export function scoreMetric(
  metric: string,
  score: RubricScore,
  method: EvalMethod,
  rationale: string,
): MetricScore {
  return { metric, score, maxScore: 2, method, rationale };
}

export function normalizeCaseMetrics(metrics: MetricScore[]): number {
  if (metrics.length === 0) return 0;
  const sum = metrics.reduce((acc, m) => acc + m.score, 0);
  const max = metrics.reduce((acc, m) => acc + m.maxScore, 0);
  return Math.round((sum / max) * 1000) / 10;
}

export function hasAnyPattern(text: string, patterns: (string | RegExp)[]): number {
  const lower = text.toLowerCase();
  let hits = 0;
  for (const p of patterns) {
    if (typeof p === 'string') {
      if (lower.includes(p.toLowerCase())) hits++;
    } else if (p.test(lower)) {
      hits++;
    }
  }
  return hits;
}

export function checkNoUnacceptableClaims(text: string, unacceptableClaims: string[]): RubricScore {
  const lower = text.toLowerCase();
  for (const claim of unacceptableClaims) {
    if (lower.includes(claim.toLowerCase())) {
      return 0;
    }
  }
  return 2;
}

export function computePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.ceil((percentile / 100) * sorted.length) - 1);
  return Math.round(sorted[Math.max(0, idx)] * 1000) / 1000;
}

export function summarizeSuite(
  suiteId: string,
  suiteName: string,
  category: EvalSuiteSummary['category'],
  gradingMethod: string,
  cases: EvalCaseResult[],
): EvalSuiteSummary {
  const totalCases = cases.length;
  const passedCases = cases.filter((c) => c.passed).length;
  const failedRuns = cases.filter((c) => !c.success).length;
  const latencies = cases.map((c) => c.latencyMs);
  const avgLatencyMs =
    latencies.length > 0
      ? Math.round((latencies.reduce((a, b) => a + b, 0) / latencies.length) * 1000) / 1000
      : 0;
  const p95LatencyMs = computePercentile(latencies, 95);

  const totalScore = cases.reduce(
    (sum, c) => sum + c.metrics.reduce((ms, m) => ms + m.score, 0),
    0,
  );
  const totalMax = cases.reduce(
    (sum, c) => sum + c.metrics.reduce((ms, m) => ms + m.maxScore, 0),
    0,
  );
  const normalizedScorePct = totalMax > 0 ? Math.round((totalScore / totalMax) * 1000) / 10 : 0;

  const metricBuckets: Record<string, { score: number; max: number }> = {};
  for (const c of cases) {
    for (const m of c.metrics) {
      if (!metricBuckets[m.metric]) {
        metricBuckets[m.metric] = { score: 0, max: 0 };
      }
      metricBuckets[m.metric].score += m.score;
      metricBuckets[m.metric].max += m.maxScore;
    }
  }

  const metricAverages: Record<string, number> = {};
  for (const [metric, bucket] of Object.entries(metricBuckets)) {
    metricAverages[metric] =
      bucket.max > 0 ? Math.round((bucket.score / bucket.max) * 1000) / 10 : 0;
  }

  return {
    suiteId,
    suiteName,
    category,
    gradingMethod,
    totalCases,
    passedCases,
    normalizedScorePct,
    avgLatencyMs,
    p95LatencyMs,
    errorRatePct: totalCases > 0 ? Math.round((failedRuns / totalCases) * 1000) / 10 : 0,
    metricAverages,
    cases,
  };
}
