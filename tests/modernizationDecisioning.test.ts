import { describe, expect, it } from 'vitest';
import { SAMPLE_PORTFOLIO } from '../src/data/samplePortfolio';
import { assessWorkloadDeterministically, prioritizationScore } from '../src/lib/modernizationDecisioning';
import type { Interaction, ProgramAlignment } from '../src/types';

const interaction: Interaction = {
  id: 'assessment-1', userId: 'owner', title: 'Assessment', category: 'Architecture Review', mode: 'assess',
  content: 'bounded evidence', geminiResponse: 'grounded explanation', turns: [], createdAt: '2026-09-20T00:00:00.000Z', updatedAt: '2026-09-20T00:00:00.000Z',
  recommended6R: 'Replatform', confidenceScore: 60, evidenceCompleteness: 61, decisionReadiness: 'NEEDS EVIDENCE',
};
const alignment: ProgramAlignment = {
  userId: 'owner', programName: 'Program', executiveSponsor: 'CTO', securityApprover: 'CISO', deliveryOwner: 'Director',
  businessOutcomes: 'Reduce operating risk', targetPlatform: 'Vendor neutral', riskTolerance: 'Balanced', timeHorizonMonths: 18,
  successMeasures: 'Reduce unsupported runtimes', updatedAt: '2026-09-20T00:00:00.000Z',
};

describe('deterministic modernization decisioning', () => {
  it('keeps missing TCO visible and all canonical 6R options in the comparison', () => {
    const result = assessWorkloadDeterministically(SAMPLE_PORTFOLIO[0], interaction);
    expect(result.costBaseline).toBe('MISSING');
    expect(result.tcoMessage).toMatch(/blocked/i);
    expect(result.options.map((option) => option.disposition)).toEqual(['Retain', 'Retire', 'Rehost', 'Replatform', 'Refactor', 'Repurchase']);
    expect(result.options.find((option) => option.disposition === 'Replatform')?.fit).toBe('LEADING');
  });

  it('returns a bounded, repeatable portfolio priority score', () => {
    const first = prioritizationScore(SAMPLE_PORTFOLIO[0], interaction, alignment);
    const second = prioritizationScore(SAMPLE_PORTFOLIO[0], interaction, alignment);
    expect(first).toEqual(second);
    expect(first.score).toBeGreaterThanOrEqual(0);
    expect(first.score).toBeLessThanOrEqual(100);
  });
});
