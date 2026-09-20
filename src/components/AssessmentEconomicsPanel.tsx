import React, { useMemo } from 'react';
import type { EnterpriseWorkload, Interaction } from '../types';
import { assessWorkloadDeterministically } from '../lib/modernizationDecisioning';

export const AssessmentEconomicsPanel: React.FC<{ workload: EnterpriseWorkload; interaction?: Interaction | null }> = ({ workload, interaction }) => {
  const assessment = useMemo(() => assessWorkloadDeterministically(workload, interaction ?? undefined), [interaction, workload]);
  return <section aria-labelledby="assessment-economics-title" className="space-y-4 border-b border-[var(--emos-border-subtle)] bg-[var(--emos-bg-secondary)] px-4 py-4 sm:px-8">
    <div><h2 id="assessment-economics-title" className="text-sm font-semibold">Deterministic readiness, economics and 6R comparison</h2><p className="mt-1 text-xs text-[var(--emos-text-secondary)]">Calculated from recorded evidence. AI explanation cannot change these scores or approve a decision.</p></div>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">{[
      ['Readiness', `${assessment.readiness}%`], ['Complexity', `${assessment.complexity}/100`], ['Risk', `${assessment.risk}/100`], ['Feasibility', `${assessment.feasibility}/100`], ['Cost baseline', assessment.costBaseline],
    ].map(([label, value]) => <div key={label} className="rounded-lg border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] p-3"><p className="text-[10px] uppercase tracking-wider text-[var(--emos-text-muted)]">{label}</p><p className="mt-1 text-sm font-semibold">{value}</p></div>)}</div>
    <p className="rounded-lg border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] p-3 text-xs text-[var(--emos-text-secondary)]"><strong className="text-[var(--emos-text-primary)]">TCO/value gate:</strong> {assessment.tcoMessage}</p>
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{assessment.options.map((option) => <article key={option.disposition} className="rounded-lg border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] p-3"><div className="flex items-center justify-between gap-2"><h3 className="text-xs font-semibold">{option.disposition}</h3><span className="text-[9px] font-bold text-[var(--emos-journey-text)]">{option.fit}</span></div><p className="mt-2 text-[11px] leading-5 text-[var(--emos-text-secondary)]">{option.basis}</p></article>)}</div>
  </section>;
};
