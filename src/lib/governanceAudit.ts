import type { GovernanceAuditEvent } from '../types';

const actions = new Set<GovernanceAuditEvent['action']>([
  'DRAFT', 'APPROVED', 'REJECTED', 'MORE EVIDENCE', 'EXCEPTION RECORDED',
]);

function boundedEvent(value: unknown): GovernanceAuditEvent | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Record<string, unknown>;
  if (
    typeof candidate.id !== 'string' ||
    typeof candidate.action !== 'string' ||
    !actions.has(candidate.action as GovernanceAuditEvent['action']) ||
    typeof candidate.actor !== 'string' ||
    typeof candidate.rationale !== 'string' ||
    typeof candidate.createdAt !== 'string'
  ) return null;
  return {
    id: candidate.id.slice(0, 100),
    action: candidate.action as GovernanceAuditEvent['action'],
    actor: candidate.actor.slice(0, 250),
    rationale: candidate.rationale.slice(0, 2000),
    createdAt: candidate.createdAt.slice(0, 100),
  };
}

export function serializeGovernanceAudit(audit: GovernanceAuditEvent[]): string {
  const accepted: GovernanceAuditEvent[] = [];
  for (const event of audit.slice(-20).reverse()) {
    const bounded = boundedEvent(event);
    if (!bounded) continue;
    const candidate = [bounded, ...accepted];
    if (JSON.stringify(candidate).length > 12000) break;
    accepted.unshift(bounded);
  }
  return JSON.stringify(accepted);
}

export function parseGovernanceAudit(value: unknown): GovernanceAuditEvent[] {
  if (typeof value !== 'string' || value.length > 12000) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(boundedEvent).filter((event): event is GovernanceAuditEvent => Boolean(event)).slice(-20);
  } catch {
    return [];
  }
}
