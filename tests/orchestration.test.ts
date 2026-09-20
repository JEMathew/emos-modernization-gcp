import { describe, expect, it } from 'vitest';
import { EMOS_SPECIALISTS, routeAssessmentRequest } from '../server/orchestration';

describe('server-side EMOS orchestration registry', () => {
  it('keeps one orchestrator and the five bounded specialists', () => {
    expect(EMOS_SPECIALISTS.map((item) => item.id)).toEqual([
      'intake-discovery', 'evidence-dna', 'assessment-economics', 'governance-decision', 'planning-target-state',
    ]);
    expect(EMOS_SPECIALISTS.every((item) => /deterministic/i.test(item.deterministicBoundary))).toBe(true);
  });

  it('routes assessment and decision conversations without granting model approval', () => {
    expect(routeAssessmentRequest('assess', false).specialist.id).toBe('assessment-economics');
    const decision = routeAssessmentRequest('decision', true);
    expect(decision.specialist.id).toBe('governance-decision');
    expect(decision.instruction).toMatch(/cannot approve/i);
  });
});
