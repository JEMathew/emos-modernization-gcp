import React, { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, CircleAlert, Filter, ShieldCheck, Sparkles } from 'lucide-react';
import type { DnaEvidenceStatus, EnterpriseWorkload } from '../types';
import { evaluateEvidenceReadiness } from '../lib/readiness';
import { JourneyStage } from './JourneyStage';

interface EvidenceWorkbenchProps {
  workload: EnterpriseWorkload;
  onBack: () => void;
  onAssess: (workload: EnterpriseWorkload) => void;
  isProcessing?: boolean;
}

const labels: Record<string, string> = {
  business: 'Business', technology: 'Technology', dependency: 'Dependencies', economics: 'Economics',
  dataAndRisk: 'Data & risk', targetState: 'Target state',
};

export const EvidenceWorkbench: React.FC<EvidenceWorkbenchProps> = ({ workload, onBack, onAssess, isProcessing }) => {
  const [filter, setFilter] = useState<'all' | DnaEvidenceStatus>('all');
  const readiness = useMemo(() => evaluateEvidenceReadiness(workload.dna), [workload]);
  const evidence = useMemo(() => Object.entries(workload.dna).flatMap(([dimension, fields]) => fields.map((field) => ({
    ...field,
    dimension: labels[dimension] ?? dimension,
    source: workload.source === 'imported'
      ? `${workload.importMetadata?.fileName ?? 'Imported inventory'} · record ${workload.importMetadata?.rowNumber ?? 'reviewed'}`
      : 'EMOS synthetic sample · demonstration only',
  }))).filter((item) => filter === 'all' || item.status === filter), [filter, workload]);

  return <section className="mx-auto w-full max-w-[1440px] space-y-6 p-4 sm:p-7">
    <button onClick={onBack} className="inline-flex min-h-11 items-center gap-2 text-xs text-[var(--emos-text-secondary)]"><ArrowLeft className="h-4 w-4" />Back to Enterprise DNA</button>
    <header className="space-y-3">
      <JourneyStage stage="Understand" question="Which facts are verified, incomplete or missing—and who should close each gap?" />
      <div className="flex flex-col gap-4 rounded-2xl border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] p-5 lg:flex-row lg:items-end lg:justify-between">
        <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--emos-journey-text)]">Evidence workbench</p><h1 className="mt-1 text-2xl font-semibold">{workload.name}</h1><p className="mt-2 max-w-3xl text-sm text-[var(--emos-text-secondary)]">Trace every assessment fact to its source. Imported values remain untrusted evidence until a responsible human verifies them.</p></div>
        <div className="grid min-w-[260px] grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-xl bg-[var(--emos-bg-tertiary)] p-3"><strong className="block text-lg">{readiness.completeness}%</strong><span className="whitespace-nowrap">complete</span></div>
          <div className="rounded-xl bg-[var(--emos-bg-tertiary)] p-3"><strong className="block text-lg">{readiness.knownCount}</strong><span className="whitespace-nowrap">verified</span></div>
          <div className="rounded-xl bg-[var(--emos-bg-tertiary)] p-3"><strong className="block text-lg">{readiness.totalCount - readiness.knownCount}</strong><span className="whitespace-nowrap">gaps</span></div>
        </div>
      </div>
    </header>

    <div className="flex flex-wrap items-center gap-2" aria-label="Evidence filters"><Filter className="h-4 w-4" aria-hidden="true" />{(['all', 'known', 'incomplete', 'missing'] as const).map((status) => <button key={status} onClick={() => setFilter(status)} aria-pressed={filter === status} className={`min-h-11 rounded-lg border px-3 text-xs font-semibold ${filter === status ? 'border-[var(--emos-journey-border)] bg-[var(--emos-journey-subtle)] text-[var(--emos-journey-text)]' : 'border-[var(--emos-border-subtle)] bg-[var(--emos-surface)]'}`}>{status === 'all' ? 'All evidence' : status}</button>)}</div>

    <div className="grid gap-3 lg:grid-cols-2">
      {evidence.map((item) => <article key={`${item.dimension}-${item.id}`} className="rounded-xl border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] p-4">
        <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--emos-text-muted)]">{item.dimension}</p><h2 className="mt-1 text-sm font-semibold">{item.label}</h2></div><span className={`rounded border px-2 py-1 text-[10px] font-bold uppercase ${item.status === 'known' ? 'border-emerald-500/30 text-emerald-600' : item.status === 'missing' ? 'border-rose-500/30 text-rose-600' : 'border-amber-500/30 text-amber-600'}`}>{item.status}</span></div>
        <p className="mt-3 break-words text-sm">{item.value || 'No value supplied'}</p>
        {item.detail && <p className="mt-1 text-xs text-[var(--emos-text-secondary)]">{item.detail}</p>}
        <dl className="mt-4 grid gap-2 border-t border-[var(--emos-border-subtle)] pt-3 text-xs sm:grid-cols-2"><div><dt className="font-semibold">Source</dt><dd className="mt-1 break-words text-[var(--emos-text-secondary)]">{item.source}</dd></div><div><dt className="font-semibold">Remediation</dt><dd className="mt-1 text-[var(--emos-text-secondary)]">{item.status === 'known' ? 'Retain source and revalidate at decision review.' : `Assign an evidence owner and verify ${item.label.toLowerCase()}.`}</dd></div></dl>
      </article>)}
    </div>

    <div className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${readiness.decisionReadiness === 'READY' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-amber-500/30 bg-amber-500/5'}`}>
      <div className="flex items-start gap-3">{readiness.decisionReadiness === 'READY' ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <CircleAlert className="h-5 w-5 text-amber-500" />}<div><h2 className="text-sm font-semibold">{readiness.decisionReadiness === 'READY' ? 'Evidence gate ready for human review' : 'Assessment may proceed, but approval remains blocked'}</h2><p className="mt-1 text-xs text-[var(--emos-text-secondary)]">{readiness.criticalGaps.length ? `Critical gaps: ${readiness.criticalGaps.join(' · ')}` : 'No critical evidence gaps remain. A human must still review the decision.'}</p></div></div>
      <button onClick={() => onAssess(workload)} disabled={isProcessing} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#A88554] px-4 text-xs font-bold text-black disabled:opacity-50"><Sparkles className="h-4 w-4" />Assess evidence</button>
    </div>
    <p className="flex items-center gap-2 text-xs text-[var(--emos-text-muted)]"><ShieldCheck className="h-4 w-4" />Unverified imported text stays inert and is never allowed to authorize a modernization decision.</p>
  </section>;
};
