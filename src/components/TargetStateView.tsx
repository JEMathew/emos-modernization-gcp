import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, CircleAlert, Save, ShieldCheck } from 'lucide-react';
import type { EnterpriseWorkload, GovernanceRecord, TargetStatePlan } from '../types';
import { evaluateEvidenceReadiness } from '../lib/readiness';
import { JourneyStage } from './JourneyStage';

interface TargetStateViewProps {
  workload: EnterpriseWorkload;
  plan: TargetStatePlan;
  governance: GovernanceRecord | null;
  onSave: (plan: TargetStatePlan) => Promise<void>;
  onBack: () => void;
}

export const TargetStateView: React.FC<TargetStateViewProps> = ({ workload, plan, governance, onSave, onBack }) => {
  const [draft, setDraft] = useState(plan);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  useEffect(() => setDraft(plan), [plan]);
  const readiness = useMemo(() => evaluateEvidenceReadiness(workload.dna), [workload]);
  const requirementsComplete = [draft.architecturePattern, draft.platformPattern, draft.availabilityTarget, draft.recoveryTarget, draft.securityRequirements, draft.dataMigrationApproach, draft.cutoverApproach, draft.rollbackPlan, draft.owner].every((value) => value.trim());
  const baselineAllowed = requirementsComplete && governance?.decision === 'APPROVED' && readiness.decisionReadiness === 'READY';
  const inputClass = 'mt-1 w-full rounded-lg border border-[var(--emos-border-subtle)] bg-[var(--emos-input-bg)] px-3 py-2.5 text-sm';
  const save = async (approve = false) => {
    if (approve && !baselineAllowed) return;
    setSaveState('saving');
    try { await onSave({ ...draft, status: approve ? 'BASELINE APPROVED' : 'DRAFT', updatedAt: new Date().toISOString() }); setSaveState('saved'); } catch { setSaveState('error'); }
  };
  return <section className="mx-auto w-full max-w-[1440px] space-y-5 p-4 sm:p-7">
    <button onClick={onBack} className="min-h-11 text-xs text-[var(--emos-text-secondary)]">← Back to mobilization</button>
    <JourneyStage stage="Define Target State" question="What approved architecture and transition baseline will delivery receive?" />
    <header><h1 className="text-2xl font-semibold">Target-state workbench</h1><p className="mt-2 max-w-3xl text-sm text-[var(--emos-text-secondary)]">Define a vendor-neutral, implementation-ready baseline for {workload.name}. This workbench creates a governed handoff; it does not provision infrastructure or execute migration.</p></header>
    <div className="grid gap-3 sm:grid-cols-3">{[
      ['Governed decision', governance?.decision ?? 'NOT RECORDED', governance?.decision === 'APPROVED'],
      ['Evidence gate', readiness.decisionReadiness, readiness.decisionReadiness === 'READY'],
      ['Baseline fields', requirementsComplete ? 'COMPLETE' : 'INCOMPLETE', requirementsComplete],
    ].map(([label, value, pass]) => <article key={String(label)} className="rounded-xl border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] p-4"><div className="flex items-center gap-2">{pass ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <CircleAlert className="h-5 w-5 text-amber-500" />}<p className="text-xs font-semibold">{label}</p></div><p className="mt-2 text-sm font-bold">{String(value)}</p></article>)}</div>
    <form onSubmit={(event) => event.preventDefault()} className="grid gap-4 rounded-2xl border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] p-5 lg:grid-cols-2">
      <label className="text-xs font-semibold">Target architecture pattern<textarea rows={3} maxLength={2000} value={draft.architecturePattern} onChange={(event) => setDraft({ ...draft, architecturePattern: event.target.value })} className={inputClass} placeholder="Describe service boundaries, data flow and integration pattern." /></label>
      <label className="text-xs font-semibold">Platform / landing-zone pattern<textarea rows={3} maxLength={2000} value={draft.platformPattern} onChange={(event) => setDraft({ ...draft, platformPattern: event.target.value })} className={inputClass} placeholder="Describe required platform capabilities without assuming a vendor." /></label>
      <label className="text-xs font-semibold">Availability target<input maxLength={500} value={draft.availabilityTarget} onChange={(event) => setDraft({ ...draft, availabilityTarget: event.target.value })} className={inputClass} placeholder="Availability SLO and resilience tier" /></label>
      <label className="text-xs font-semibold">Recovery target<input maxLength={500} value={draft.recoveryTarget} onChange={(event) => setDraft({ ...draft, recoveryTarget: event.target.value })} className={inputClass} placeholder="RTO / RPO and recovery ownership" /></label>
      <label className="text-xs font-semibold lg:col-span-2">Security and compliance requirements<textarea rows={3} maxLength={2000} value={draft.securityRequirements} onChange={(event) => setDraft({ ...draft, securityRequirements: event.target.value })} className={inputClass} placeholder="Identity, encryption, residency, retention and audit requirements" /></label>
      <label className="text-xs font-semibold">Data migration approach<textarea rows={3} maxLength={2000} value={draft.dataMigrationApproach} onChange={(event) => setDraft({ ...draft, dataMigrationApproach: event.target.value })} className={inputClass} placeholder="Migration units, reconciliation and data-quality controls" /></label>
      <label className="text-xs font-semibold">Cutover approach<textarea rows={3} maxLength={2000} value={draft.cutoverApproach} onChange={(event) => setDraft({ ...draft, cutoverApproach: event.target.value })} className={inputClass} placeholder="Cutover window, checkpoints and business validation" /></label>
      <label className="text-xs font-semibold">Rollback plan<textarea rows={3} maxLength={2000} value={draft.rollbackPlan} onChange={(event) => setDraft({ ...draft, rollbackPlan: event.target.value })} className={inputClass} placeholder="Rollback trigger, recovery point and accountable owner" /></label>
      <label className="text-xs font-semibold">Target-state owner<input maxLength={250} value={draft.owner} onChange={(event) => setDraft({ ...draft, owner: event.target.value })} className={inputClass} placeholder="Accountable architecture owner" /></label>
      <div className="flex flex-col gap-3 border-t border-[var(--emos-border-subtle)] pt-4 lg:col-span-2 sm:flex-row sm:items-center sm:justify-between"><p role="status" className="text-xs text-[var(--emos-text-muted)]">{saveState === 'saved' ? 'Target-state record saved to your private workspace.' : saveState === 'error' ? 'Could not save the target-state record.' : `Status: ${plan.status}`}</p><div className="flex flex-wrap gap-2"><button type="button" onClick={() => save(false)} disabled={saveState === 'saving'} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--emos-border-subtle)] px-4 text-xs font-semibold"><Save className="h-4 w-4" />Save draft</button><button type="button" onClick={() => save(true)} disabled={!baselineAllowed || saveState === 'saving'} title={!baselineAllowed ? 'Approved governance, decision-ready evidence and all fields are required.' : undefined} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#A88554] px-4 text-xs font-bold text-black disabled:cursor-not-allowed disabled:opacity-40"><ShieldCheck className="h-4 w-4" />Approve delivery baseline</button></div></div>
    </form>
    <div className="rounded-xl border border-[var(--emos-border-subtle)] bg-[var(--emos-bg-tertiary)] p-4 text-xs text-[var(--emos-text-secondary)]"><strong className="text-[var(--emos-text-primary)]">Next lifecycle boundary:</strong> Execute, Validate and Transition remain Planned. This baseline authorizes no production change.</div>
  </section>;
};
