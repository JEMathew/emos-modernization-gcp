import { describe, expect, it } from 'vitest';
import { SAMPLE_PORTFOLIO } from '../src/data/samplePortfolio';
import { buildExecutiveDecisionHtml, buildMobilizationReadiness, buildModernizationWaves } from '../src/lib/wavePlanner';
import type { Interaction, ProgramAlignment } from '../src/types';

const alignment: ProgramAlignment = {
  userId: 'alice', programName: 'Core modernization', executiveSponsor: '', securityApprover: '', deliveryOwner: '', businessOutcomes: 'Reduce risk',
  targetPlatform: '', riskTolerance: 'Balanced', timeHorizonMonths: 18, successMeasures: '', updatedAt: new Date(0).toISOString(),
};

describe('deterministic wave planning', () => {
  it('uses governed assessment metadata and preserves evidence blockers', () => {
    const assessment = {
      id: 'a1', userId: 'alice', title: 'Customer Analytics', category: 'Legacy Application', mode: 'assess', content: 'x', geminiResponse: 'x', turns: [],
      createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString(), workloadId: 'customer-analytics',
      recommended6R: 'Refactor', confidenceScore: 65, evidenceCompleteness: 61, decisionReadiness: 'NEEDS EVIDENCE',
    } as Interaction;
    const waves = buildModernizationWaves(SAMPLE_PORTFOLIO, [assessment]);
    const planned = waves.flatMap((wave) => wave.workloads);
    expect(planned).toHaveLength(3);
    expect(planned.find((item) => item.workloadId === 'customer-analytics')).toMatchObject({ disposition: 'Refactor', readiness: 'CONDITIONAL' });
    expect(planned.find((item) => item.workloadId === 'customer-analytics')?.blockers).toContain('Detailed TCO Baseline');
  });

  it('marks missing alignment and evidence as mobilization actions', () => {
    const readiness = buildMobilizationReadiness(alignment, buildModernizationWaves(SAMPLE_PORTFOLIO, []));
    expect(readiness.filter((item) => item.status === 'ACTION REQUIRED').length).toBeGreaterThan(3);
  });

  it('escapes executive inputs and preserves explainable evidence gaps', () => {
    const unsafe = { ...alignment, programName: '<script>alert(1)</script>' };
    const waves = buildModernizationWaves(SAMPLE_PORTFOLIO, []);
    const html = buildExecutiveDecisionHtml(unsafe, waves, buildMobilizationReadiness(unsafe, waves));
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).toContain('Decision basis and gaps');
    expect(html).toContain('Detailed TCO Baseline');
  });
});
