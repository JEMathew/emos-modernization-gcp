import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, CheckCircle2, CircleAlert, Download, Flag, Layers3, Route,
  Save, ShieldCheck, Target, Users,
} from 'lucide-react';
import type { EnterpriseWorkload, Interaction, ProgramAlignment } from '../types';
import { buildExecutiveDecisionHtml, buildMobilizationReadiness, buildModernizationWaves } from '../lib/wavePlanner';

interface PortfolioPlanViewProps {
  workloads: EnterpriseWorkload[];
  interactions: Interaction[];
  alignment: ProgramAlignment;
  onSaveAlignment: (alignment: ProgramAlignment) => Promise<void>;
  onBack: () => void;
}

export const PortfolioPlanView: React.FC<PortfolioPlanViewProps> = ({
  workloads, interactions, alignment, onSaveAlignment, onBack,
}) => {
  const [draft, setDraft] = useState(alignment);
  const [activeSection, setActiveSection] = useState<'align' | 'waves' | 'mobilize'>('align');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  useEffect(() => setDraft(alignment), [alignment]);

  const waves = useMemo(() => buildModernizationWaves(workloads, interactions), [workloads, interactions]);
  const readiness = useMemo(() => buildMobilizationReadiness(draft, waves), [draft, waves]);
  const planned = waves.flatMap((wave) => wave.workloads);
  const readyCount = planned.filter((item) => item.readiness === 'READY').length;
  const assessedCount = planned.filter((item) => item.disposition !== 'Assessment required').length;
  const mobilizationReady = readiness.filter((item) => item.status === 'READY').length;

  const save = async () => {
    setSaveState('saving');
    try {
      await onSaveAlignment(draft);
      setSaveState('saved');
    } catch {
      setSaveState('error');
    }
  };

  const exportPack = () => {
    const html = buildExecutiveDecisionHtml(draft, waves, readiness);
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(draft.programName || 'emos-modernization').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-executive-decision-pack.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const inputClass = 'w-full rounded-xl border border-[var(--emos-border-subtle)] bg-[var(--emos-input-bg)] px-3 py-2.5 text-sm text-[var(--emos-text-primary)] placeholder-[var(--emos-text-muted)] outline-hidden focus:border-[var(--emos-accent)]';

  return (
    <main id="portfolio-plan-view" className="flex-1 overflow-y-auto p-4 sm:p-7 space-y-6 max-w-6xl mx-auto w-full">
      <header className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <button onClick={onBack} className="inline-flex items-center gap-1.5 text-xs text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)] cursor-pointer">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to portfolio
            </button>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--emos-accent-border)] bg-[var(--emos-accent-subtle)] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--emos-accent-text)]">
              <Route className="w-3.5 h-3.5" /> Plan → Mobilize
            </div>
            <h1 className="font-serif text-3xl text-[var(--emos-text-primary)]">Modernization Decision Cockpit</h1>
            <p className="max-w-3xl text-sm leading-relaxed text-[var(--emos-text-secondary)]">
              Align program intent, convert governed 6R decisions into deterministic waves, and expose the mobilization actions required before delivery begins.
            </p>
          </div>
          <button onClick={exportPack} className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-[#A88554] px-4 py-2.5 text-sm font-semibold text-black shadow-sm transition hover:bg-[#BCA075] cursor-pointer">
            <Download className="w-4 h-4" /> Export Executive Pack
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ['Portfolio scope', `${planned.length} workloads`],
            ['Governed decisions', `${assessedCount}/${planned.length}`],
            ['Decision ready', `${readyCount}/${planned.length}`],
            ['Mobilization controls', `${mobilizationReady}/${readiness.length}`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] p-3">
              <p className="text-[10px] uppercase tracking-wider text-[var(--emos-text-muted)]">{label}</p>
              <p className="mt-1 text-lg font-semibold text-[var(--emos-text-primary)]">{value}</p>
            </div>
          ))}
        </div>

        <nav className="grid grid-cols-3 rounded-xl border border-[var(--emos-border-subtle)] bg-[var(--emos-bg-tertiary)] p-1" aria-label="Modernization planning sections">
          {[
            ['align', '1. Align', Target], ['waves', '2. Wave Plan', Layers3], ['mobilize', '3. Mobilize', Users],
          ].map(([id, label, Icon]) => (
            <button key={id as string} onClick={() => setActiveSection(id as typeof activeSection)} className={`flex min-h-[40px] items-center justify-center gap-2 rounded-lg px-2 text-xs font-semibold transition cursor-pointer ${activeSection === id ? 'border border-[var(--emos-border-strong)] bg-[var(--emos-surface)] text-[var(--emos-accent-text)] shadow-xs' : 'text-[var(--emos-text-secondary)]'}`}>
              <Icon className="w-4 h-4" /> {label as string}
            </button>
          ))}
        </nav>
      </header>

      {activeSection === 'align' && (
        <section className="rounded-2xl border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] p-5 sm:p-6 space-y-5">
          <div className="flex items-start gap-3">
            <div className="rounded-xl border border-[var(--emos-accent-border)] bg-[var(--emos-accent-subtle)] p-2 text-[var(--emos-accent)]"><Flag className="w-5 h-5" /></div>
            <div><h2 className="text-lg font-semibold">Program alignment</h2><p className="text-xs leading-relaxed text-[var(--emos-text-secondary)]">These inputs become the explicit decision context for portfolio sequencing and the executive artifact.</p></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 text-xs font-medium">Program name<input className={inputClass} value={draft.programName} maxLength={250} onChange={(e) => setDraft({ ...draft, programName: e.target.value })} placeholder="Enterprise Modernization 2027" /></label>
            <label className="space-y-1.5 text-xs font-medium">Executive sponsor<input className={inputClass} value={draft.executiveSponsor} maxLength={250} onChange={(e) => setDraft({ ...draft, executiveSponsor: e.target.value })} placeholder="CTO / Transformation sponsor" /></label>
            <label className="space-y-1.5 text-xs font-medium">Security approver<input className={inputClass} value={draft.securityApprover} maxLength={250} onChange={(e) => setDraft({ ...draft, securityApprover: e.target.value })} placeholder="CISO delegate / Risk owner" /></label>
            <label className="space-y-1.5 text-xs font-medium">Delivery owner<input className={inputClass} value={draft.deliveryOwner} maxLength={250} onChange={(e) => setDraft({ ...draft, deliveryOwner: e.target.value })} placeholder="Program director / Platform lead" /></label>
            <label className="space-y-1.5 text-xs font-medium sm:col-span-2">Business outcomes<textarea className={inputClass} rows={3} value={draft.businessOutcomes} maxLength={4000} onChange={(e) => setDraft({ ...draft, businessOutcomes: e.target.value })} placeholder="Reduce run cost, retire unsupported technology, improve release frequency..." /></label>
            <label className="space-y-1.5 text-xs font-medium">Target platform strategy<input className={inputClass} value={draft.targetPlatform} maxLength={500} onChange={(e) => setDraft({ ...draft, targetPlatform: e.target.value })} placeholder="Vendor neutral / GCP / AWS / Azure" /></label>
            <label className="space-y-1.5 text-xs font-medium">Risk tolerance<select className={inputClass} value={draft.riskTolerance} onChange={(e) => setDraft({ ...draft, riskTolerance: e.target.value as ProgramAlignment['riskTolerance'] })}><option>Conservative</option><option>Balanced</option><option>Accelerated</option></select></label>
            <label className="space-y-1.5 text-xs font-medium">Time horizon (months)<input className={inputClass} type="number" min={1} max={120} value={draft.timeHorizonMonths} onChange={(e) => setDraft({ ...draft, timeHorizonMonths: Math.max(1, Math.min(120, Number(e.target.value) || 1)) })} /></label>
            <label className="space-y-1.5 text-xs font-medium">Success measures<input className={inputClass} value={draft.successMeasures} maxLength={4000} onChange={(e) => setDraft({ ...draft, successMeasures: e.target.value })} placeholder="20% run-cost reduction; 100% EOL remediation" /></label>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-[var(--emos-border-subtle)] pt-4">
            <p className={`text-xs ${saveState === 'error' ? 'text-rose-500' : 'text-[var(--emos-text-muted)]'}`}>{saveState === 'saved' ? 'Alignment saved to your private Firestore workspace.' : saveState === 'error' ? 'Could not save alignment.' : 'Owner-isolated program context'}</p>
            <button onClick={save} disabled={saveState === 'saving'} className="inline-flex min-h-[38px] items-center gap-2 rounded-xl border border-[var(--emos-accent-border)] bg-[var(--emos-accent-subtle)] px-4 py-2 text-xs font-semibold text-[var(--emos-accent-text)] disabled:opacity-50 cursor-pointer"><Save className="w-4 h-4" />{saveState === 'saving' ? 'Saving...' : 'Save alignment'}</button>
          </div>
        </section>
      )}

      {activeSection === 'waves' && (
        <section className="space-y-4">
          <div className="rounded-xl border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] p-4 text-xs leading-relaxed text-[var(--emos-text-secondary)]">
            <strong className="text-[var(--emos-text-primary)]">Deterministic sequencing:</strong> governed 6R disposition, business criticality, dependency complexity, and verified evidence determine placement. Missing assessments and evidence stay visible as gates.
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {waves.map((wave) => (
              <article key={wave.id} className="rounded-2xl border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] p-4 space-y-4">
                <div><p className="text-[10px] font-mono uppercase tracking-wider text-[var(--emos-accent-text)]">Sequence {wave.order}</p><h2 className="mt-1 text-base font-semibold">{wave.name.replace(/^Wave \d · /, '')}</h2><p className="mt-1 text-[11px] leading-relaxed text-[var(--emos-text-secondary)]">{wave.objective}</p></div>
                <div className="space-y-3">
                  {wave.workloads.length === 0 && <p className="rounded-xl bg-[var(--emos-bg-tertiary)] p-3 text-xs text-[var(--emos-text-muted)]">No workloads assigned.</p>}
                  {wave.workloads.map((item) => (
                    <div key={item.workloadId} className="rounded-xl border border-[var(--emos-border-subtle)] bg-[var(--emos-bg-tertiary)] p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2"><h3 className="text-sm font-semibold">{item.workloadName}</h3><span className={`shrink-0 rounded border px-2 py-0.5 text-[9px] font-bold ${item.readiness === 'READY' ? 'border-emerald-500/30 text-emerald-600' : 'border-amber-500/30 text-amber-600'}`}>{item.readiness}</span></div>
                      <div className="flex justify-between text-[10px] text-[var(--emos-text-muted)]"><span>{item.disposition}</span><span>{item.evidenceCompleteness}% evidence</span></div>
                      <p className="text-[10px] leading-relaxed text-[var(--emos-text-secondary)]">{item.rationale}</p>
                      {item.blockers.length > 0 && <p className="text-[10px] text-amber-700 dark:text-amber-300">Gaps: {item.blockers.join(' · ')}</p>}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {activeSection === 'mobilize' && (
        <section className="grid gap-4 md:grid-cols-2">
          {readiness.map((item) => (
            <article key={item.id} className="flex gap-3 rounded-2xl border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] p-4">
              {item.status === 'READY' ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" /> : <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />}
              <div className="space-y-1"><p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--emos-accent-text)]">{item.category} · {item.status}</p><h2 className="text-sm font-semibold">{item.label}</h2><p className="text-xs leading-relaxed text-[var(--emos-text-secondary)]">{item.evidence}</p></div>
            </article>
          ))}
          <div className="md:col-span-2 flex items-start gap-3 rounded-xl border border-[var(--emos-accent-border)] bg-[var(--emos-accent-subtle)] p-4 text-xs leading-relaxed text-[var(--emos-text-secondary)]">
            <ShieldCheck className="h-5 w-5 shrink-0 text-[var(--emos-accent)]" /><p><strong className="text-[var(--emos-text-primary)]">Scope boundary:</strong> EMOS prepares governed mobilization evidence and readiness gates. It does not provision landing zones, staff delivery teams, or execute migrations.</p>
          </div>
        </section>
      )}
    </main>
  );
};
