import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, CheckCircle2, CircleAlert, Download, Flag, Layers3,
  Save, ShieldCheck, Target, Users, Play, BarChart3, BookOpen,
  ArrowRight, AlertTriangle, Check, Sparkles, Lock,
} from 'lucide-react';
import type { Disposition6R, EnterpriseWorkload, Interaction, ProgramAlignment } from '../types';
import { buildExecutiveDecisionHtml, buildMobilizationReadiness, buildModernizationWaves } from '../lib/wavePlanner';
import { buildDefaultLifecycleState } from '../lib/transformationEngine';
import { PLAIN_ENGLISH_6R } from '../config/capabilityCues';
import { JourneyStage } from './JourneyStage';
import { CapabilityCue } from './CapabilityCue';

interface PortfolioPlanViewProps {
  workloads: EnterpriseWorkload[];
  interactions: Interaction[];
  alignment: ProgramAlignment;
  selectedWorkload?: EnterpriseWorkload | null;
  approvedWorkloads?: Record<string, boolean>;
  onApproveWorkload?: (workloadId: string, disposition: Disposition6R) => void;
  onSaveAlignment: (alignment: ProgramAlignment) => Promise<void>;
  onBack: () => void;
}

export const PortfolioPlanView: React.FC<PortfolioPlanViewProps> = ({
  workloads,
  interactions,
  alignment,
  selectedWorkload,
  approvedWorkloads = {},
  onApproveWorkload,
  onSaveAlignment,
  onBack,
}) => {
  const [draft, setDraft] = useState(alignment);
  const [activeSection, setActiveSection] = useState<'align' | 'waves' | 'mobilize' | 'execute' | 'measure' | 'learn'>('align');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [activeWorkloadId, setActiveWorkloadId] = useState<string>(
    selectedWorkload?.id || workloads[0]?.id || 'customer-analytics'
  );
  const [selectedDispositionOverride, setSelectedDispositionOverride] = useState<Record<string, Disposition6R>>({});
  const [completedStageProgress, setCompletedStageProgress] = useState<Record<string, number>>({});
  const [clearedBlockers, setClearedBlockers] = useState<Record<string, boolean>>({});
  const [capturedLearningNotes, setCapturedLearningNotes] = useState<Record<string, string[]>>({});
  const [newLessonInput, setNewLessonInput] = useState('');

  useEffect(() => setDraft(alignment), [alignment]);
  useEffect(() => {
    if (selectedWorkload?.id) {
      setActiveWorkloadId(selectedWorkload.id);
    }
  }, [selectedWorkload?.id]);

  const waves = useMemo(() => buildModernizationWaves(workloads, interactions), [workloads, interactions]);
  const readiness = useMemo(() => buildMobilizationReadiness(draft, waves), [draft, waves]);
  const planned = waves.flatMap((wave) => wave.workloads);
  const readyCount = planned.filter((item) => item.readiness === 'READY').length;
  const assessedCount = planned.filter((item) => item.disposition !== 'Assessment required').length;
  const mobilizationReady = readiness.filter((item) => item.status === 'READY').length;

  const activeWorkload = useMemo(
    () => workloads.find((w) => w.id === activeWorkloadId) || workloads[0],
    [workloads, activeWorkloadId],
  );

  const latestAssessment = useMemo(() => {
    if (!activeWorkload) return undefined;
    return interactions
      .filter((i) => i.workloadId === activeWorkload.id || i.workloadName?.toLowerCase() === activeWorkload.name.toLowerCase())
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
  }, [activeWorkload, interactions]);

  const isApproved = Boolean(
    activeWorkload &&
    (approvedWorkloads[activeWorkload.id] || activeWorkload.evidenceCompleteness >= 85)
  );

  const lifecycle = useMemo(() => {
    if (!activeWorkload) return null;
    const override = selectedDispositionOverride[activeWorkload.id] || (latestAssessment?.recommended6R as Disposition6R | undefined);
    return buildDefaultLifecycleState(
      activeWorkload,
      override,
      isApproved,
      completedStageProgress[activeWorkload.id],
      clearedBlockers[activeWorkload.id],
    );
  }, [activeWorkload, selectedDispositionOverride, latestAssessment?.recommended6R, isApproved, completedStageProgress, clearedBlockers]);

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

  const handleAdvanceExecutionStage = () => {
    if (!activeWorkload || !lifecycle) return;
    if (!isApproved) {
      onApproveWorkload?.(activeWorkload.id, lifecycle.disposition);
      return;
    }
    if (lifecycle.activeBlocker && !clearedBlockers[activeWorkload.id]) {
      setClearedBlockers((prev) => ({ ...prev, [activeWorkload.id]: true }));
      return;
    }
    const currentCompleted = lifecycle.stages.filter((s) => s.status === 'completed').length;
    setCompletedStageProgress((prev) => ({
      ...prev,
      [activeWorkload.id]: Math.min(lifecycle.stages.length, currentCompleted + 1),
    }));
  };

  const handleAddLearningNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonInput.trim() || !activeWorkload) return;
    setCapturedLearningNotes((prev) => ({
      ...prev,
      [activeWorkload.id]: [...(prev[activeWorkload.id] || []), newLessonInput.trim()],
    }));
    setNewLessonInput('');
  };

  const stageMarkerInfo = useMemo(() => {
    switch (activeSection) {
      case 'mobilize':
        return { stage: 'Mobilize' as const, question: 'What must be ready before delivery begins?' };
      case 'execute':
        return { stage: 'Execute' as const, question: 'How is the approved transformation progressing across gates?' };
      case 'measure':
        return { stage: 'Measure' as const, question: 'Did this modernization deliver the expected business benefit?' };
      case 'learn':
        return { stage: 'Learn' as const, question: 'What should we remember and apply to the next modernization decision?' };
      default:
        return { stage: 'Plan' as const, question: 'How should governed decisions be sequenced and funded?' };
    }
  }, [activeSection]);

  const inputClass = 'w-full rounded-xl border border-[var(--emos-border-subtle)] bg-[var(--emos-input-bg)] px-3 py-2.5 text-sm text-[var(--emos-text-primary)] placeholder-[var(--emos-text-muted)] outline-hidden focus:border-[var(--emos-accent)]';

  return (
    <main id="portfolio-plan-view" className="flex-1 overflow-y-auto p-4 sm:p-7 space-y-6 max-w-6xl mx-auto w-full">
      <header className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <button onClick={onBack} className="inline-flex items-center gap-1.5 text-xs text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)] cursor-pointer">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to portfolio
            </button>
            <JourneyStage
              stage={stageMarkerInfo.stage}
              question={stageMarkerInfo.question}
            />
            <h1 className="font-serif text-3xl text-[var(--emos-text-primary)]">Modernization Decision Cockpit</h1>
            <p className="max-w-3xl text-sm leading-relaxed text-[var(--emos-text-secondary)]">
              Align program intent, convert governed 6R decisions into deterministic waves, execute disposition-specific transformations, measure realized outcomes, and capture organizational learning.
            </p>
          </div>
          <button
            onClick={exportPack}
            className="inline-flex min-h-[36px] shrink-0 self-start items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-[#A88554] px-3 py-1.5 text-xs font-semibold text-black shadow-sm transition-colors hover:bg-[#BCA075] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--emos-accent)] cursor-pointer sm:self-auto"
          >
            <Download className="h-4 w-4" /> Export Executive Pack
          </button>
        </div>

        {/* 4 Primary KPIs */}
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

        {/* Full-Lifecycle Navigation Tabs (Plan IS NOT THE ENDPOINT: Align -> Waves -> Mobilize -> Execute -> Measure -> Learn) */}
        <nav className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1 rounded-xl border border-[var(--emos-border-subtle)] bg-[var(--emos-bg-tertiary)] p-1" aria-label="Modernization planning sections">
          {[
            ['align', '1. Align', Target],
            ['waves', '2. Wave Plan', Layers3],
            ['mobilize', '3. Mobilize', Users],
            ['execute', '4. Execute', Play],
            ['measure', '5. Measure', BarChart3],
            ['learn', '6. Learn', BookOpen],
          ].map(([id, label, Icon]) => (
            <button
              key={id as string}
              onClick={() => setActiveSection(id as typeof activeSection)}
              className={`flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-semibold transition cursor-pointer ${
                activeSection === id
                  ? 'border border-[var(--emos-border-strong)] bg-[var(--emos-surface)] text-[var(--emos-accent-text)] shadow-xs'
                  : 'text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)]'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{label as string}</span>
            </button>
          ))}
        </nav>
      </header>

      {/* SECTION 1: ALIGN */}
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

      {/* SECTION 2: WAVE PLAN */}
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
                      <button
                        type="button"
                        onClick={() => {
                          setActiveWorkloadId(item.workloadId);
                          setActiveSection('execute');
                        }}
                        className="mt-1 w-full py-1.5 px-2.5 rounded-lg border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] hover:border-[var(--emos-accent)] text-[11px] font-semibold text-[var(--emos-accent-text)] inline-flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>Track Execution &amp; Outcomes</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 3: MOBILIZE */}
      {activeSection === 'mobilize' && (
        <section className="grid gap-4 md:grid-cols-2">
          {readiness.map((item) => (
            <article key={item.id} className="flex gap-3 rounded-2xl border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] p-4">
              {item.status === 'READY' ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" /> : <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />}
              <div className="space-y-1"><p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--emos-accent-text)]">{item.category} · {item.status}</p><h2 className="text-sm font-semibold">{item.label}</h2><p className="text-xs leading-relaxed text-[var(--emos-text-secondary)]">{item.evidence}</p></div>
            </article>
          ))}
          <div className="md:col-span-2 flex items-start gap-3 rounded-xl border border-[var(--emos-accent-border)] bg-[var(--emos-accent-subtle)] p-4 text-xs leading-relaxed text-[var(--emos-text-secondary)]">
            <ShieldCheck className="h-5 w-5 shrink-0 text-[var(--emos-accent)]" /><p><strong className="text-[var(--emos-text-primary)]">Scope boundary:</strong> EMOS governs mobilization evidence, readiness gates, transformation progress, and outcome verification. It does not directly mutate external production cloud infrastructure.</p>
          </div>
        </section>
      )}

      {/* SHARED WORKLOAD & DISPOSITION SELECTOR FOR EXECUTE / MEASURE / LEARN */}
      {(activeSection === 'execute' || activeSection === 'measure' || activeSection === 'learn') && activeWorkload && lifecycle && (
        <div className="space-y-6">
          {/* Workload & 6R Selector Bar */}
          <div className="p-4 rounded-2xl border border-[var(--emos-border-strong)] bg-[var(--emos-surface)] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--emos-accent-text)] font-bold">
                  Active Transformation System
                </span>
                <CapabilityCue cueId={activeSection} />
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <select
                  aria-label="Select workload for transformation lifecycle"
                  value={activeWorkload.id}
                  onChange={(e) => setActiveWorkloadId(e.target.value)}
                  className="rounded-xl border border-[var(--emos-border-strong)] bg-[var(--emos-bg-secondary)] px-3 py-1.5 text-sm font-semibold text-[var(--emos-text-primary)]"
                >
                  {workloads.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.evidenceCompleteness}% DNA)
                    </option>
                  ))}
                </select>
                <span className="px-2.5 py-1 rounded-lg bg-[var(--emos-accent-subtle)] border border-[var(--emos-accent-border)] text-xs font-bold text-[var(--emos-accent-text)]">
                  {lifecycle.plainEnglish} ({lifecycle.disposition})
                </span>
              </div>
            </div>

            {/* Inspect All 6R Transformation Workflows Selector */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--emos-text-muted)] block">
                Inspect 6R Transformation Workflow:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(['Retain', 'Retire', 'Rehost', 'Replatform', 'Refactor', 'Repurchase'] as Disposition6R[]).map((disp) => (
                  <button
                    key={disp}
                    type="button"
                    onClick={() =>
                      setSelectedDispositionOverride((prev) => ({
                        ...prev,
                        [activeWorkload.id]: disp,
                      }))
                    }
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                      lifecycle.disposition === disp
                        ? 'bg-[#A88554] text-black border-[#A88554]'
                        : 'bg-[var(--emos-bg-tertiary)] border-[var(--emos-border-subtle)] text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)]'
                    }`}
                  >
                    {disp}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 4: EXECUTE WORKSPACE (Section V & N3) */}
          {activeSection === 'execute' && (
            <section aria-label="Transformation Execution Workspace" className="space-y-5">
              {/* Visual Transformation Story Hero (Section N3: CURRENT -> EMOS DECISION -> TARGET) */}
              <div className="rounded-3xl border border-[var(--emos-border-strong)] bg-[var(--emos-surface)] p-5 sm:p-6 shadow-md space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--emos-border-subtle)] pb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--emos-accent-text)] font-bold">
                      Spatial Transformation Story · {PLAIN_ENGLISH_6R[lifecycle.disposition].shortAction}
                    </span>
                    <h2 className="font-serif text-2xl font-bold text-[var(--emos-text-primary)] mt-0.5">
                      {activeWorkload.name} — {lifecycle.plainEnglish} ({lifecycle.disposition})
                    </h2>
                  </div>

                  {/* Governance Sign-Off Badge */}
                  <div className="flex items-center gap-2">
                    {lifecycle.governanceStatus === 'APPROVED' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="w-4 h-4" />
                        Human Governance Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs font-bold text-amber-700 dark:text-amber-300">
                        <Lock className="w-4 h-4" />
                        {lifecycle.governanceStatus === 'BLOCKED_EVIDENCE' ? 'Blocked by Evidence Gate' : 'Pending Human Approval'}
                      </span>
                    )}
                  </div>
                </div>

                {/* 3-Column Current -> Decision -> Target Spatial Flow */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
                  <div className="p-4 rounded-2xl border border-rose-500/25 bg-rose-500/[0.05] space-y-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-rose-500 font-bold">
                      1. Current State
                    </span>
                    <h3 className="text-sm font-bold text-[var(--emos-text-primary)]">{activeWorkload.name}</h3>
                    <p className="text-xs text-[var(--emos-text-secondary)] leading-relaxed">
                      {lifecycle.currentArchSummary}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border-2 border-[var(--emos-accent)] bg-[var(--emos-accent-subtle)] flex flex-col justify-center text-center space-y-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--emos-accent-text)] font-bold">
                      2. Governed EMOS Decision
                    </span>
                    <h3 className="text-base font-serif font-bold text-[var(--emos-text-primary)]">
                      {lifecycle.plainEnglish}
                    </h3>
                    <span className="mx-auto px-2.5 py-0.5 rounded-full bg-[#A88554] text-black font-mono text-[10px] font-bold uppercase">
                      {lifecycle.disposition} · {lifecycle.overallProgress}% Complete
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.06] space-y-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">
                      3. Target State
                    </span>
                    <h3 className="text-sm font-bold text-[var(--emos-text-primary)]">
                      {lifecycle.disposition === 'Retire' ? 'Decommissioned & Archived' : 'Target Architecture'}
                    </h3>
                    <p className="text-xs text-[var(--emos-text-secondary)] leading-relaxed">
                      {lifecycle.targetArchSummary}
                    </p>
                  </div>
                </div>

                {/* 4 Execution KPIs + Agent Alert + ONE Primary CTA */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-[var(--emos-bg-tertiary)] border border-[var(--emos-border-subtle)]">
                    <span className="text-[10px] font-mono uppercase text-[var(--emos-text-muted)]">Overall Progress</span>
                    <p className="text-lg font-bold font-mono text-[var(--emos-accent-text)] mt-0.5">{lifecycle.overallProgress}%</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--emos-bg-tertiary)] border border-[var(--emos-border-subtle)]">
                    <span className="text-[10px] font-mono uppercase text-[var(--emos-text-muted)]">Current Phase</span>
                    <p className="text-sm font-bold text-[var(--emos-text-primary)] mt-1 truncate">{lifecycle.currentPhaseLabel}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--emos-bg-tertiary)] border border-[var(--emos-border-subtle)]">
                    <span className="text-[10px] font-mono uppercase text-[var(--emos-text-muted)]">Next Gate</span>
                    <p className="text-xs font-semibold text-[var(--emos-text-secondary)] mt-1 truncate" title={lifecycle.nextGateLabel}>
                      {lifecycle.nextGateLabel}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--emos-bg-tertiary)] border border-[var(--emos-border-subtle)]">
                    <span className="text-[10px] font-mono uppercase text-[var(--emos-text-muted)]">Blockers</span>
                    <p className={`text-xs font-bold mt-1 ${lifecycle.activeBlocker ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {lifecycle.activeBlocker ? '1 Gate Action Required' : '0 Blockers'}
                    </p>
                  </div>
                </div>

                {/* Agent Alert & Primary Execution Action */}
                <div className="p-4 rounded-2xl bg-[var(--emos-bg-secondary)] border border-[var(--emos-border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5 text-xs">
                    <Sparkles className="w-4 h-4 text-[var(--emos-accent)] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[var(--emos-text-primary)]">Modernization Agent Status: </span>
                      <span className="text-[var(--emos-text-secondary)]">{lifecycle.agentAlert}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      id="advance-execution-stage-btn"
                      type="button"
                      onClick={handleAdvanceExecutionStage}
                      className="px-4 py-2 rounded-xl bg-[#A88554] hover:bg-[#BCA075] text-black text-xs font-bold inline-flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
                    >
                      <Check className="w-4 h-4" />
                      <span>
                        {!isApproved
                          ? 'Approve Governance & Start Execution'
                          : lifecycle.activeBlocker && !clearedBlockers[activeWorkload.id]
                          ? 'Resolve Blocker & Proceed'
                          : lifecycle.overallProgress >= 100
                          ? 'Execution Complete · View Outcomes'
                          : 'Complete Current Checkpoint Gate'}
                      </span>
                    </button>
                    {lifecycle.overallProgress >= 100 && (
                      <button
                        type="button"
                        onClick={() => setActiveSection('measure')}
                        className="px-3 py-2 rounded-xl border border-[var(--emos-border-strong)] bg-[var(--emos-surface)] text-xs font-semibold cursor-pointer"
                      >
                        Measure Outcomes →
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Transformation Timeline Hero: Completed recedes, Current comes forward, Blocked receives attention */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--emos-text-muted)]">
                  {lifecycle.disposition} Transformation Timeline ({lifecycle.stages.length} Governed Stages)
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {lifecycle.stages.map((stage) => {
                    const isCompleted = stage.status === 'completed';
                    const isInProgress = stage.status === 'in_progress';
                    const isBlocked = stage.status === 'blocked';
                    return (
                      <div
                        key={stage.id}
                        className={`rounded-2xl border p-4 transition-all ${
                          isBlocked
                            ? 'bg-amber-500/10 border-amber-500/40 ring-1 ring-amber-500/30 shadow-md'
                            : isInProgress
                            ? 'bg-[var(--emos-surface-elevated)] border-[var(--emos-accent)] ring-2 ring-[var(--emos-accent-border)] shadow-lg'
                            : isCompleted
                            ? 'bg-[var(--emos-surface)]/65 border-[var(--emos-border-subtle)] opacity-75'
                            : 'bg-[var(--emos-surface)] border-[var(--emos-border-subtle)]'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`w-7 h-7 rounded-full font-mono text-xs font-bold flex items-center justify-center shrink-0 ${
                                isCompleted
                                  ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40'
                                  : isBlocked
                                  ? 'bg-amber-500 text-black'
                                  : isInProgress
                                  ? 'bg-[#A88554] text-black'
                                  : 'bg-[var(--emos-bg-tertiary)] text-[var(--emos-text-muted)]'
                              }`}
                            >
                              {isCompleted ? '✓' : stage.order}
                            </span>
                            <div>
                              <h4 className="text-sm font-bold text-[var(--emos-text-primary)]">
                                {stage.label}
                              </h4>
                              <p className="text-xs text-[var(--emos-text-secondary)]">{stage.description}</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 shrink-0 text-[10px]">
                            <span className="px-2 py-0.5 rounded bg-[var(--emos-bg-tertiary)] border border-[var(--emos-border-subtle)] text-[var(--emos-text-secondary)]">
                              Owner: {stage.ownerRole}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded font-mono font-bold uppercase ${
                                isCompleted
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
                                  : isBlocked
                                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                                  : isInProgress
                                  ? 'bg-[var(--emos-accent-subtle)] text-[var(--emos-accent-text)]'
                                  : 'bg-[var(--emos-bg-tertiary)] text-[var(--emos-text-muted)]'
                              }`}
                            >
                              {stage.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>

                        {(isInProgress || isBlocked) && (
                          <div className="mt-3 pt-2.5 border-t border-[var(--emos-border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                            <span className="text-[var(--emos-text-secondary)]">
                              <strong>Checkpoint Gate:</strong> {stage.gateRequirement} · <strong>Deliverable:</strong> {stage.deliverable}
                            </span>
                            {stage.blocker && (
                              <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300 font-semibold">
                                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                {stage.blocker}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* SECTION 5: MEASURE OUTCOMES (Section W) */}
          {activeSection === 'measure' && (
            <section aria-label="Measure Transformation Outcomes" className="space-y-5">
              <div className="rounded-3xl border border-[var(--emos-border-strong)] bg-[var(--emos-surface)] p-5 sm:p-6 space-y-5 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--emos-border-subtle)] pb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--emos-accent-text)] font-bold">
                      Benefit Realization · Baseline vs. Target vs. Observed
                    </span>
                    <h2 className="font-serif text-2xl font-bold text-[var(--emos-text-primary)] mt-0.5">
                      Did {activeWorkload.name} ({lifecycle.plainEnglish}) Deliver What We Expected?
                    </h2>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-mono font-semibold text-amber-700 dark:text-amber-300">
                    Synthetic / Representative Outcomes
                  </span>
                </div>

                {/* 3 Important Metrics Cards: BASELINE | TARGET | OBSERVED */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {lifecycle.outcomes.map((metric) => (
                    <article
                      key={metric.id}
                      className="rounded-2xl border border-[var(--emos-border-subtle)] bg-[var(--emos-bg-secondary)] p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[10px] font-mono uppercase text-[var(--emos-text-muted)]">{metric.unit}</p>
                          <h3 className="text-sm font-bold text-[var(--emos-text-primary)]">{metric.label}</h3>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            metric.status === 'exceeded'
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                              : metric.status === 'on_track'
                              ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30'
                              : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {metric.status === 'exceeded' ? 'Exceeded Target' : metric.status === 'on_track' ? 'Target Met' : 'Minor Variance'}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                        <div className="p-2 rounded-xl bg-[var(--emos-surface)] border border-[var(--emos-border-subtle)]">
                          <span className="text-[9px] uppercase text-[var(--emos-text-muted)] block">Baseline</span>
                          <strong className="text-xs font-mono text-[var(--emos-text-secondary)] mt-0.5 block">{metric.baseline}</strong>
                        </div>
                        <div className="p-2 rounded-xl bg-[var(--emos-surface)] border border-[var(--emos-border-subtle)]">
                          <span className="text-[9px] uppercase text-[var(--emos-text-muted)] block">Target</span>
                          <strong className="text-xs font-mono text-[var(--emos-text-primary)] mt-0.5 block">{metric.target}</strong>
                        </div>
                        <div className="p-2 rounded-xl bg-[var(--emos-accent-subtle)] border border-[var(--emos-accent-border)]">
                          <span className="text-[9px] uppercase text-[var(--emos-accent-text)] font-bold block">Observed</span>
                          <strong className="text-xs font-mono text-[var(--emos-accent-text)] mt-0.5 block">{metric.observed}</strong>
                        </div>
                      </div>

                      <p className="text-xs text-[var(--emos-text-secondary)] pt-1 border-t border-[var(--emos-border-subtle)]">
                        {metric.deltaSummary}
                      </p>
                    </article>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--emos-border-subtle)]">
                  <p className="text-xs text-[var(--emos-text-muted)]">
                    Note: Outcome metrics shown above are representative synthetic benchmarks for this transformation archetype.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveSection('learn')}
                    className="px-4 py-2 rounded-xl bg-[#A88554] text-black text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Capture Learning for Future Waves</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* SECTION 6: CONTINUOUS LEARNING (Section W) */}
          {activeSection === 'learn' && (
            <section aria-label="Capture Transformation Learning" className="space-y-5">
              <div className="rounded-3xl border border-[var(--emos-border-strong)] bg-[var(--emos-surface)] p-5 sm:p-6 space-y-5 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--emos-border-subtle)] pb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--emos-accent-text)] font-bold">
                      Closed-Loop Enterprise Memory · Governance Playbook
                    </span>
                    <h2 className="font-serif text-2xl font-bold text-[var(--emos-text-primary)] mt-0.5">
                      What Should We Remember for the Next Decision?
                    </h2>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[var(--emos-bg-tertiary)] border border-[var(--emos-border-subtle)] text-[10px] font-mono text-[var(--emos-text-secondary)]">
                    Human-Governed Evidence Feedback (No Autonomous Model Retraining)
                  </span>
                </div>

                {lifecycle.learnings.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 p-4 rounded-2xl bg-[var(--emos-bg-secondary)] border border-[var(--emos-border-subtle)] text-xs"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase text-[var(--emos-text-muted)] font-bold">1. Original Assumption</span>
                      <p className="text-[var(--emos-text-primary)] leading-relaxed">{item.originalAssumption}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase text-[var(--emos-text-muted)] font-bold">2. Actual Result</span>
                      <p className="text-[var(--emos-text-primary)] leading-relaxed">{item.actualResult}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase text-amber-600 dark:text-amber-400 font-bold">3. Difference / Variance</span>
                      <p className="text-[var(--emos-text-secondary)] leading-relaxed">{item.difference}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase text-emerald-600 dark:text-emerald-400 font-bold">4. Captured Lesson</span>
                      <p className="font-semibold text-[var(--emos-text-primary)] leading-relaxed">{item.lesson}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase text-[var(--emos-accent-text)] font-bold">5. Future Applicability</span>
                      <p className="text-[var(--emos-text-secondary)] leading-relaxed">{item.futureApplicability}</p>
                    </div>
                  </div>
                ))}

                {/* User-Added Learning Notes */}
                {(capturedLearningNotes[activeWorkload.id] || []).length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--emos-accent-text)]">
                      Architect Lessons Recorded in This Session:
                    </p>
                    <ul className="space-y-1.5">
                      {(capturedLearningNotes[activeWorkload.id] || []).map((note, idx) => (
                        <li
                          key={idx}
                          className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-[var(--emos-text-primary)] flex items-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Form to record new architectural learning */}
                <form onSubmit={handleAddLearningNote} className="flex flex-col sm:flex-row gap-2.5 pt-2 border-t border-[var(--emos-border-subtle)]">
                  <input
                    type="text"
                    value={newLessonInput}
                    onChange={(e) => setNewLessonInput(e.target.value)}
                    placeholder={`Record a new lesson learned from ${activeWorkload.name} (${lifecycle.disposition}) for future waves...`}
                    aria-label="Record lesson learned"
                    className="flex-1 rounded-xl border border-[var(--emos-border-subtle)] bg-[var(--emos-input-bg)] px-3.5 py-2 text-xs text-[var(--emos-text-primary)] placeholder-[var(--emos-text-muted)] focus:outline-hidden focus:border-[var(--emos-accent)] min-h-[38px]"
                  />
                  <button
                    type="submit"
                    disabled={!newLessonInput.trim()}
                    className="px-4 py-2 rounded-xl bg-[#A88554] text-black text-xs font-bold disabled:opacity-40 cursor-pointer shrink-0"
                  >
                    Record Lesson into Playbook
                  </button>
                </form>
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  );
};
