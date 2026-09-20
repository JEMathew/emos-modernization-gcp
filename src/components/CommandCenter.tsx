import React from 'react';
import { ArrowRight, CircleAlert, Layers, UploadCloud } from 'lucide-react';
import type { EnterpriseWorkload, Interaction, ProgramAlignment } from '../types';
import type { WorkspaceStage } from '../lib/workspaceNavigation';
import { evaluateEvidenceReadiness } from '../lib/readiness';

interface Props {
  workloads: EnterpriseWorkload[];
  interactions: Interaction[];
  alignment: ProgramAlignment;
  isLoading: boolean;
  isProcessing: boolean;
  isSynthetic: boolean;
  onStage: (stage: WorkspaceStage) => void;
  onWorkload: (workload: EnterpriseWorkload) => void;
  onImport: () => void;
}

export function CommandCenter({ workloads, interactions, alignment, isLoading, isProcessing, isSynthetic, onStage, onWorkload, onImport }: Props) {
  const evidence = workloads.map(workload => ({ workload, readiness: evaluateEvidenceReadiness(workload.dna) }));
  const needsEvidence = evidence.filter(item => item.readiness.decisionReadiness !== 'READY');
  const assessedIds = new Set(interactions.filter(item => item.workloadId && workloads.some(w => w.id === item.workloadId)).map(item => item.workloadId));
  const hasIntent = Boolean(alignment.businessOutcomes.trim() && alignment.executiveSponsor.trim());
  const nextStage: WorkspaceStage = !hasIntent ? 'Align' : workloads.length === 0 ? 'Discover' : needsEvidence.length ? 'Understand' : 'Assess';
  const nextCopy = {
    Align: 'Confirm the business outcome and executive sponsor.',
    Discover: 'Bring an inventory into your portfolio.',
    Understand: 'Review the gaps before requesting a recommendation.',
    Assess: 'Assess a workload using its recorded evidence.',
  };

  return (
    <section className="mx-auto w-full max-w-[1440px] space-y-6 p-4 sm:p-7" aria-labelledby="command-center-title">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--emos-accent-text)]">Portfolio overview</p>
        <h1 id="command-center-title" className="text-2xl font-semibold sm:text-3xl">Command Center</h1>
        <p className="max-w-2xl text-sm leading-6 text-[var(--emos-text-secondary)]">Connect your business intent, evidence and decisions. Choose a stage to continue the modernization journey.</p>
      </header>
      {isLoading ? <p role="status" className="text-sm">Loading your portfolio and saved decisions…</p> : <>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Portfolio summary">
          {[
            ['Workloads in scope', workloads.length],
            ['Need evidence', needsEvidence.length],
            ['Workloads assessed', assessedIds.size],
            ['Evidence ready for review', workloads.length - needsEvidence.length],
          ].map(([label, value], index) => <div key={label} className="relative overflow-hidden rounded-xl border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] p-4">
            <span className={`absolute inset-y-0 left-0 w-1 ${index === 1 ? 'bg-amber-500' : index === 3 ? 'bg-emerald-500' : 'bg-[var(--emos-journey)]'}`} aria-hidden="true" />
            <p className="text-xs text-[var(--emos-text-secondary)]">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p>
          </div>)}
        </div>
        <p className="text-xs text-[var(--emos-text-secondary)]">{isSynthetic ? 'Synthetic sample portfolio — these are demonstration workloads.' : 'Your imported portfolio — counts include only the selected portfolio.'} Evidence readiness does not imply human approval.</p>
        <section className="flex flex-col gap-4 rounded-xl border border-[var(--emos-accent-border)] bg-[var(--emos-accent-subtle)] p-5 sm:flex-row sm:items-center sm:justify-between" aria-label="Next recommended action">
          <div><p className="text-xs font-semibold text-[var(--emos-accent-text)]">Next action · {nextStage}</p><h2 className="mt-1 text-lg font-semibold">{nextCopy[nextStage]}</h2><p className="mt-2 text-xs text-[var(--emos-text-secondary)]">Decisions remain with your team. AI recommendations require evidence and review.</p></div>
          <button className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#A88554] px-4 text-sm font-semibold text-black" onClick={() => onStage(nextStage)}>Continue to {nextStage}<ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
        </section>
        <div className="grid gap-5 lg:grid-cols-3">
          <section className="rounded-xl border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] p-5 lg:col-span-2" aria-labelledby="attention-title">
            <h2 id="attention-title" className="flex items-center gap-2 text-base font-semibold"><CircleAlert className="h-4 w-4 text-[var(--emos-accent)]" aria-hidden="true" />Evidence to review</h2>
            {workloads.length === 0 ? <div className="mt-4 space-y-3"><p className="text-sm text-[var(--emos-text-secondary)]">No imported workloads yet. Start with a supported CSV or JSON inventory.</p><button onClick={onImport} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[var(--emos-accent-text)]"><UploadCloud className="h-4 w-4" />Import inventory</button></div> : needsEvidence.length === 0 ? <p className="mt-4 text-sm">The evidence gate is met. Review the assessment before approving any decision.</p> : <ul className="mt-3 divide-y divide-[var(--emos-border-subtle)]">
              {needsEvidence.slice(0, 3).map(({ workload, readiness }) => <li key={workload.id}>
                <button onClick={() => onWorkload(workload)} className="flex min-h-16 w-full items-center justify-between gap-3 py-4 text-left">
                  <span className="min-w-0"><span className="block break-words text-sm font-semibold">{workload.name}</span><span className="mt-1 block text-xs leading-5 text-[var(--emos-text-secondary)]">{readiness.completeness}% evidence · {readiness.criticalGaps.length} critical gaps · Needs evidence</span></span><ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                </button>
              </li>)}
            </ul>}
            <button onClick={() => onStage('Discover')} className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[var(--emos-accent-text)]"><Layers className="h-4 w-4" aria-hidden="true" />Browse portfolio</button>
          </section>
          <section className="space-y-4 rounded-xl border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] p-5" aria-label="Decision and planning workspaces">
            <h2 className="text-base font-semibold">Move the work forward</h2>
            {(['Assess', 'Decide', 'Plan', 'Mobilize'] as const).map(stage => <button key={stage} onClick={() => onStage(stage)} className="flex min-h-11 w-full items-center justify-between rounded-lg border border-[var(--emos-border-subtle)] px-3 text-sm">{stage}<ArrowRight className="h-4 w-4" aria-hidden="true" /></button>)}
            <p role="status" className="text-xs leading-5 text-[var(--emos-text-secondary)]">AI activity: {isProcessing ? 'Processing your request.' : 'Idle. Starts only when you request an assessment or follow-up.'}</p>
          </section>
        </div>
      </>}
    </section>
  );
}
