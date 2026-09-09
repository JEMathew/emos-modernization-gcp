import { describe, expect, it } from 'vitest';
import type { EnterpriseDna } from '../src/types';
import { SAMPLE_PORTFOLIO } from '../src/data/samplePortfolio';
import { EMOS_FACTS } from '../src/config/productFacts';
import { applySyntheticEvidenceStage, evaluateEvidenceReadiness, READINESS_DEMO_STAGES } from '../src/lib/readiness';
import { buildEvidenceActionPlanCsv } from '../src/lib/sampleDecisionBrief';

function allKnownDna(): EnterpriseDna {
  const dna = structuredClone(SAMPLE_PORTFOLIO[0].dna);
  Object.values(dna).flat().forEach((field) => {
    field.status = 'known';
    field.value = field.value === 'Missing' ? 'Verified for evaluation' : field.value;
  });
  return dna;
}

function markMissing(dna: EnterpriseDna, ids: string[]): EnterpriseDna {
  const copy = structuredClone(dna);
  Object.values(copy).flat().forEach((field) => {
    if (ids.includes(field.id)) {
      field.status = 'missing';
      field.value = 'Missing';
    }
  });
  return copy;
}

describe('labelled evidence-readiness evaluation set', () => {
  it('blocks the shipped 61% Apex workload', () => {
    const result = evaluateEvidenceReadiness(SAMPLE_PORTFOLIO[0].dna);
    expect(result.completeness).toBe(61);
    expect(result.decisionReadiness).toBe('NEEDS EVIDENCE');
    expect(result.criticalGaps).toContain('Detailed TCO Baseline');
  });

  it('blocks the nearest score below the 70% boundary even when critical fields are known', () => {
    const result = evaluateEvidenceReadiness(markMissing(allKnownDna(), ['b1', 'b2', 'b3', 't1', 't2', 't3']));
    expect(result.completeness).toBe(67);
    expect(result.thresholdMet).toBe(false);
    expect(result.criticalGaps).toHaveLength(0);
    expect(result.decisionReadiness).toBe('NEEDS EVIDENCE');
  });

  it('passes the nearest score above the boundary when no critical gap remains', () => {
    const result = evaluateEvidenceReadiness(markMissing(allKnownDna(), ['b1', 'b2', 'b3', 't1', 't2']));
    expect(result.completeness).toBe(72);
    expect(result.completeness).toBeGreaterThanOrEqual(EMOS_FACTS.readinessThreshold);
    expect(result.criticalGaps).toHaveLength(0);
    expect(result.decisionReadiness).toBe('READY');
  });

  it('blocks a score above the threshold when a critical target-state gap remains', () => {
    const result = evaluateEvidenceReadiness(markMissing(allKnownDna(), ['ts2']));
    expect(result.completeness).toBe(94);
    expect(result.thresholdMet).toBe(true);
    expect(result.criticalGaps).toEqual(['Target Architecture Constraints']);
    expect(result.decisionReadiness).toBe('NEEDS EVIDENCE');
  });

  it('returns READY for a complete record and remains deterministic across repeated runs', () => {
    const dna = allKnownDna();
    const first = evaluateEvidenceReadiness(dna);
    const second = evaluateEvidenceReadiness(dna);
    expect(first).toEqual(second);
    expect(first).toMatchObject({ completeness: 100, decisionReadiness: 'READY', criticalGaps: [] });
  });

  it('has zero false-ready outcomes across the labelled blocking cases', () => {
    const labelledBlockedCases = [
      SAMPLE_PORTFOLIO[0].dna,
      markMissing(allKnownDna(), ['b1', 'b2', 'b3', 't1', 't2', 't3']),
      markMissing(allKnownDna(), ['ts2']),
      markMissing(allKnownDna(), ['e3']),
      markMissing(allKnownDna(), ['d2']),
    ];
    expect(labelledBlockedCases.filter((dna) => evaluateEvidenceReadiness(dna).decisionReadiness === 'READY')).toHaveLength(0);
  });

  it('demonstrates that the threshold is necessary but not sufficient across the public stages', () => {
    const results = READINESS_DEMO_STAGES.map((_stage, index) =>
      evaluateEvidenceReadiness(applySyntheticEvidenceStage(SAMPLE_PORTFOLIO[0].dna, index)),
    );

    expect(results.map((result) => result.completeness)).toEqual([61, 67, 78, 89]);
    expect(results.map((result) => result.decisionReadiness)).toEqual([
      'NEEDS EVIDENCE',
      'NEEDS EVIDENCE',
      'NEEDS EVIDENCE',
      'READY',
    ]);
    expect(results[2].thresholdMet).toBe(true);
    expect(results[2].criticalGaps).toEqual(['Dependency Details', 'Migration Downtime Tolerance']);
    expect(results[3].criticalGaps).toHaveLength(0);
  });

  it('exports unresolved evidence as an assignable CSV action plan', () => {
    const csv = buildEvidenceActionPlanCsv(SAMPLE_PORTFOLIO[0]);
    expect(csv).toContain('"Dimension","Evidence Gap","Current Status","Owner","Evidence Source","Due Date"');
    expect(csv).toContain('"Economics","Detailed TCO Baseline","missing"');
    expect(csv).toContain('"Dependencies","Dependency Details","incomplete"');
    expect(csv).not.toContain('"Business","Business Capability"');
  });
});
