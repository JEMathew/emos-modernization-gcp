import { describe, expect, it } from 'vitest';
import { parseGovernanceAudit, serializeGovernanceAudit } from '../src/lib/governanceAudit';
import type { GovernanceAuditEvent } from '../src/types';

const event = (id: string, rationale = 'Reviewed by the architecture board.'): GovernanceAuditEvent => ({
  id,
  action: 'MORE EVIDENCE',
  actor: 'Named reviewer',
  rationale,
  createdAt: new Date(0).toISOString(),
});

describe('governance audit serialization', () => {
  it('preserves valid bounded events', () => {
    expect(parseGovernanceAudit(serializeGovernanceAudit([event('one')]))).toEqual([event('one')]);
  });

  it('keeps valid JSON within the Firestore rule bound', () => {
    const serialized = serializeGovernanceAudit(Array.from({ length: 20 }, (_, index) => event(String(index), 'x'.repeat(2000))));
    expect(serialized.length).toBeLessThanOrEqual(12000);
    expect(() => JSON.parse(serialized)).not.toThrow();
    expect(parseGovernanceAudit(serialized).length).toBeGreaterThan(0);
  });

  it('rejects malformed or forged audit payloads', () => {
    expect(parseGovernanceAudit('{broken')).toEqual([]);
    expect(parseGovernanceAudit(JSON.stringify({ action: 'APPROVED' }))).toEqual([]);
    expect(parseGovernanceAudit(JSON.stringify([{ ...event('bad'), action: 'AUTO APPROVED' }]))).toEqual([]);
  });
});
