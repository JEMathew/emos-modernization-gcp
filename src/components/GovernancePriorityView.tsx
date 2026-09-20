import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, CircleAlert, Save, Scale, ShieldCheck } from 'lucide-react';
import type { EnterpriseWorkload, GovernanceRecord, HumanDecision, Interaction, ProgramAlignment } from '../types';
import { evaluateEvidenceReadiness } from '../lib/readiness';
import { prioritizationScore } from '../lib/modernizationDecisioning';
import { JourneyStage } from './JourneyStage';

interface GovernancePriorityViewProps {
  stage: 'Govern' | 'Prioritize';
  workloads: EnterpriseWorkload[];
  interactions: Interaction[];
  alignment: ProgramAlignment;
  selectedWorkload: EnterpriseWorkload | null;
  record: GovernanceRecord | null;
  onSelectWorkload: (id: string) => void;
  onSave: (record: GovernanceRecord) => Promise<void>;
  onStage: (stage: 'Govern' | 'Prioritize' | 'Plan') => void;
}

function assessmentFor(workload: EnterpriseWorkload, interactions: Interaction[]) {
  return interactions.filter((item) => item.workloadId === workload.id).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
}

export const GovernancePriorityView: React.FC<GovernancePriorityViewProps> = ({ stage, workloads, interactions, alignment, selectedWorkload, record, onSelectWorkload, onSave, onStage }) => {
  const active = selectedWorkload ?? workloads[0] ?? null;
  const assessment = active ? assessmentFor(active, interactions) : undefined;
  const [approver, setApprover] = useState(record?.approver ?? alignment.securityApprover);
  const [rationale, setRationale] = useState(record?.rationale ?? '');
  const [exception, setException] = useState(record?.exception ?? '');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const ranked = useMemo(() => workloads.map((workload) => {
    const interaction = assessmentFor(workload, interactions);
    return { workload, interaction, ...prioritizationScore(workload, interaction, alignment) };
  }).sort((a, b) => b.score - a.score || a.workload.name.localeCompare(b.workload.name)), [alignment, interactions, workloads]);
  useEffect(() => {
    setApprover(record?.approver ?? alignment.securityApprover);
    setRationale(record?.rationale ?? '');
    setException(record?.exception ?? '');
    setSaveState('idle');
  }, [active?.id, alignment.securityApprover, record]);
  if (!active) return <section className="p-6"><h1 className="text-xl font-semibold">No workloads to govern</h1><p className="mt-2 text-sm text-[var(--emos-text-secondary)]">Import an inventory or select the synthetic portfolio first.</p></section>;
  const evidence = evaluateEvidenceReadiness(active.dna);
  const gates = [
    { label: 'Architecture review', pass: Boolean(assessment), detail: assessment ? `${assessment.recommended6R} assessment recorded.` : 'Create a governed 6R assessment.' },
    { label: 'Security gate', pass: Boolean(alignment.securityApprover.trim()), detail: alignment.securityApprover.trim() || 'Assign the security approver in Align.' },
    { label: 'Compliance evidence', pass: active.dna.dataAndRisk.find((field) => field.id === 'dr3')?.status === 'known', detail: active.dna.dataAndRisk.find((field) => field.id === 'dr3')?.value || 'Compliance constraints are missing.' },
    { label: 'Evidence gate', pass: evidence.decisionReadiness === 'READY', detail: evidence.decisionReadiness === 'READY' ? `${evidence.completeness}% evidence; ready for human review.` : `Critical gaps: ${evidence.criticalGaps.join(' · ') || 'evidence below threshold'}.` },
  ];
  const approvalAllowed = gates.every((gate) => gate.pass) && Boolean(approver.trim()) && Boolean(assessment);

  const saveDecision = async (decision: HumanDecision) => {
    if (decision === 'APPROVED' && !approvalAllowed) return;
    if (!assessment) return;
    const now = new Date().toISOString();
    const actor = approver.trim() || 'Authenticated reviewer';
    const decisionEvent = { id: `audit_${Date.now()}_decision`, action: decision, actor, rationale: rationale.trim() || 'No rationale recorded.', createdAt: now } as const;
    const exceptionEvent = exception.trim()
      ? [{ id: `audit_${Date.now()}_exception`, action: 'EXCEPTION RECORDED' as const, actor, rationale: exception.trim(), createdAt: now }]
      : [];
    const next: GovernanceRecord = {
      userId: record?.userId ?? '', workloadId: active.id, assessmentId: assessment.id, decision,
      approver: approver.trim(), rationale: rationale.trim(), exception: exception.trim(), updatedAt: now,
      audit: [...(record?.audit ?? []), decisionEvent, ...exceptionEvent].slice(-20),
    };
    setSaveState('saving');
    try { await onSave(next); setSaveState('saved'); } catch { setSaveState('error'); }
  };

  return <section className="mx-auto w-full max-w-[1440px] space-y-5 p-4 sm:p-7">
    <JourneyStage stage={stage} question={stage === 'Govern' ? 'Which controls must pass before a human decision?' : 'Which workloads should be funded and sequenced first?'} />
    <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between"><div><h1 className="text-2xl font-semibold">{stage === 'Govern' ? 'Governance and human decision' : 'Portfolio prioritization'}</h1><p className="mt-1 max-w-3xl text-sm text-[var(--emos-text-secondary)]">{stage === 'Govern' ? 'Architecture, security, compliance and evidence gates remain explicit. AI cannot approve or waive a gate.' : 'A transparent value-versus-effort score proposes order; dependency evidence and human funding decisions remain visible.'}</p></div><div className="flex gap-2"><button onClick={() => onStage('Govern')} aria-current={stage === 'Govern' ? 'page' : undefined} className="min-h-11 rounded-lg border border-[var(--emos-border-subtle)] px-3 text-xs font-semibold">Govern</button><button onClick={() => onStage('Prioritize')} aria-current={stage === 'Prioritize' ? 'page' : undefined} className="min-h-11 rounded-lg border border-[var(--emos-border-subtle)] px-3 text-xs font-semibold">Prioritize</button></div></header>

    {stage === 'Prioritize' ? <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-[var(--emos-border-subtle)]"><table className="w-full min-w-[760px] text-left text-xs"><thead className="bg-[var(--emos-bg-tertiary)] text-[var(--emos-text-secondary)]"><tr><th className="p-3">Rank / workload</th><th className="p-3">Priority</th><th className="p-3">Value</th><th className="p-3">Effort</th><th className="p-3">Risk reduction</th><th className="p-3">Dependency confidence</th><th className="p-3">6R / readiness</th></tr></thead><tbody>{ranked.map((item, index) => <tr key={item.workload.id} className="border-t border-[var(--emos-border-subtle)]"><td className="p-3"><button onClick={() => onSelectWorkload(item.workload.id)} className="min-h-11 text-left font-semibold text-[var(--emos-journey-text)]">{index + 1}. {item.workload.name}</button></td><td className="p-3 font-bold">{item.score}</td><td className="p-3">{item.value}</td><td className="p-3">{item.effort}</td><td className="p-3">{item.riskReduction}</td><td className="p-3">{item.dependencyConfidence}%</td><td className="p-3">{item.interaction?.recommended6R ?? 'Assessment required'}<span className="block text-[10px] text-[var(--emos-text-muted)]">{item.interaction?.decisionReadiness ?? 'Not assessed'}</span></td></tr>)}</tbody></table></div>
      <p className="text-xs text-[var(--emos-text-muted)]">Score = value 35% + inverse effort 20% + risk reduction 20% + dependency confidence 15% + alignment confidence 10%. It is decision support, not an automated funding decision.</p>
      <button onClick={() => onStage('Plan')} className="min-h-11 font-semibold text-[var(--emos-journey-text)]">Continue to Plan →</button>
    </div> : <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
      <div className="space-y-4">
        <label className="block text-xs font-semibold">Workload<select aria-label="Governed workload" value={active.id} onChange={(event) => onSelectWorkload(event.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] px-3">{workloads.map((workload) => <option key={workload.id} value={workload.id}>{workload.name}</option>)}</select></label>
        <div className="grid gap-3 sm:grid-cols-2">{gates.map((gate) => <article key={gate.label} className="rounded-xl border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] p-4"><div className="flex items-center gap-2">{gate.pass ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <CircleAlert className="h-5 w-5 text-amber-500" />}<h2 className="text-sm font-semibold">{gate.label}</h2></div><p className="mt-2 text-xs leading-5 text-[var(--emos-text-secondary)]">{gate.detail}</p></article>)}</div>
        <div className="rounded-xl border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] p-4"><h2 className="flex items-center gap-2 text-sm font-semibold"><Scale className="h-4 w-4" />Decision boundary</h2><p className="mt-2 text-xs text-[var(--emos-text-secondary)]">Approval is enabled only when all deterministic gates pass and a named approver is recorded. Rejection and requests for more evidence remain available for human reviewers.</p></div>
      </div>
      <form className="space-y-4 rounded-xl border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] p-5" onSubmit={(event) => event.preventDefault()}>
        <h2 className="flex items-center gap-2 text-base font-semibold"><ShieldCheck className="h-5 w-5 text-[var(--emos-journey-text)]" />Human review record</h2>
        <label className="block text-xs font-semibold">Named approver<input value={approver} maxLength={250} onChange={(event) => setApprover(event.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-[var(--emos-border-subtle)] bg-[var(--emos-input-bg)] px-3" /></label>
        <label className="block text-xs font-semibold">Decision rationale<textarea value={rationale} maxLength={2000} onChange={(event) => setRationale(event.target.value)} rows={4} className="mt-1 w-full rounded-lg border border-[var(--emos-border-subtle)] bg-[var(--emos-input-bg)] p-3" /></label>
        <label className="block text-xs font-semibold">Exception / waiver request (optional)<textarea value={exception} maxLength={2000} onChange={(event) => setException(event.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-[var(--emos-border-subtle)] bg-[var(--emos-input-bg)] p-3" /></label>
        <div className="grid gap-2 sm:grid-cols-3"><button type="button" disabled={!approvalAllowed || saveState === 'saving'} onClick={() => saveDecision('APPROVED')} title={!approvalAllowed ? 'All governance gates and a named approver are required.' : undefined} className="min-h-11 rounded-lg bg-emerald-600 px-3 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">Approve</button><button type="button" disabled={!assessment || saveState === 'saving'} onClick={() => saveDecision('MORE EVIDENCE')} className="min-h-11 rounded-lg border border-amber-500/40 px-3 text-xs font-semibold">More evidence</button><button type="button" disabled={!assessment || saveState === 'saving'} onClick={() => saveDecision('REJECTED')} className="min-h-11 rounded-lg border border-rose-500/40 px-3 text-xs font-semibold">Reject</button></div>
        <p role="status" className="text-xs text-[var(--emos-text-muted)]">{saveState === 'saved' ? 'Governance record saved to your owner-scoped workspace.' : saveState === 'error' ? 'Could not save the governance record.' : record ? `Current status: ${record.decision}` : 'No human decision recorded.'}</p>
        {record?.audit.length ? <div className="border-t border-[var(--emos-border-subtle)] pt-3"><h3 className="text-xs font-semibold">Audit history</h3><ul className="mt-2 space-y-2">{record.audit.slice().reverse().map((event) => <li key={event.id} className="text-[11px] text-[var(--emos-text-secondary)]"><strong>{event.action}</strong> · {event.actor} · {new Date(event.createdAt).toLocaleString()}<span className="block">{event.rationale}</span></li>)}</ul></div> : null}
      </form>
    </div>}
  </section>;
};
