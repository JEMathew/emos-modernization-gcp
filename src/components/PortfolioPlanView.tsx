import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, CheckCircle2, CircleAlert, Download, Flag, Layers3,
  Save, ShieldCheck, Target, Users, Play, BarChart3, BookOpen,
  ArrowRight, AlertTriangle, Check, Sparkles, Lock,
} from 'lucide-react';
import type { Disposition6R, EnterpriseWorkload, Interaction, ProgramAlignment } from '../types';
import { buildExecutiveDecisionHtml, buildMobilizationReadiness, buildModernizationWaves } from '../lib/wavePlanner';
import { buildDefaultLifecycleState } from '../lib/transformationEngine';
import { evaluateEvidenceReadiness } from '../lib/readiness';
import { PLAIN_ENGLISH_6R } from '../config/capabilityCues';
import { JourneyStage } from './JourneyStage';
import { CapabilityCue } from './CapabilityCue';

interface PortfolioPlanViewProps {
  workloads: EnterpriseWorkload[];
  interactions: Interaction[];
  alignment: ProgramAlignment;
  selectedWorkload?: EnterpriseWorkload | null;
  approvedWorkloads?: Record<string, boolean>;
  initialSection?: 'align' | 'waves' | 'mobilize' | 'execute' | 'measure' | 'learn';
  onSectionChange?: (section: 'align' | 'waves' | 'mobilize' | 'execute' | 'measure' | 'learn') => void;
  onSelectWorkload?: (workload: EnterpriseWorkload) => void;
  onApproveWorkload?: (workloadId: string, disposition: Disposition6R) => void;
  onAskAgent?: (question: string) => void;
  onSaveAlignment: (alignment: ProgramAlignment) => Promise<void>;
  onBack: () => void;
}

const SIX_R_SEMANTIC_FRAME: Record<
  Disposition6R,
  {
    executeTitle: string;
    executeSubtitle: string;
    pipelineLabel: string;
    measureSubtitle: string;
    learnSubtitle: string;
  }
> = {
  Retain: {
    executeTitle: 'Govern & Monitor',
    executeSubtitle: 'Confirm operational stability, optimize run-rate, and maintain review horizons without unnecessary migration.',
    pipelineLabel: 'Operational Governance & Monitoring',
    measureSubtitle: 'Verify cost stability, SLA adherence, and zero cutover risk for the retained system.',
    learnSubtitle: 'Capture criteria that validate when keeping a system as-is outperforms migration.',
  },
  Retire: {
    executeTitle: 'Safely Decommission',
    executeSubtitle: 'Transition downstream consumers, secure compliance archives, and verify clean shutdown.',
    pipelineLabel: 'Decommission & Archive Checklist',
    measureSubtitle: 'Verify eliminated run cost, removed EOL vulnerabilities, and zero active consumers.',
    learnSubtitle: 'Capture dependency and archive lessons to make future retirements safer and faster.',
  },
  Rehost: {
    executeTitle: 'Migrate Infrastructure',
    executeSubtitle: 'Prepare the target landing zone, move workload images, and validate cutover parity.',
    pipelineLabel: 'Infrastructure Migration Pipeline',
    measureSubtitle: 'Compare facility TCO savings, cutover duration, and partner interface continuity against target.',
    learnSubtitle: 'Capture network, allowlist, and cutover lessons for upcoming lift-and-shift waves.',
  },
  Replatform: {
    executeTitle: 'Transition Platform',
    executeSubtitle: 'Provision managed target services, convert schemas/data, and validate platform cutover.',
    pipelineLabel: 'Platform Transition Pipeline',
    measureSubtitle: 'Compare 3-year platform TCO, batch/query throughput, and DBA toil against target.',
    learnSubtitle: 'Capture schema conversion and target-state lessons for future replatforming waves.',
  },
  Refactor: {
    executeTitle: 'Transform Architecture',
    executeSubtitle: 'Decompose monolithic boundaries incrementally, validate resilience, and transition traffic safely.',
    pipelineLabel: 'Architecture Transformation Pipeline',
    measureSubtitle: 'Compare release cadence, peak throughput capacity, and dual-run cost variance against target.',
    learnSubtitle: 'Capture decomposition and parallel-run lessons for future architectural transformations.',
  },
  Repurchase: {
    executeTitle: 'Replace & Adopt',
    executeSubtitle: 'Complete commercial SaaS selection, configure SSO/controls, migrate active data, and retire legacy.',
    pipelineLabel: 'SaaS Replacement & Adoption Track',
    measureSubtitle: 'Compare commercial SaaS TCO, compliance SLA readiness, and retired custom code against target.',
    learnSubtitle: 'Capture vendor onboarding and active-vs-archive data split lessons for future SaaS replacements.',
  },
};

export const PortfolioPlanView: React.FC<PortfolioPlanViewProps> = ({
  workloads,
  interactions,
  alignment,
  selectedWorkload,
  approvedWorkloads = {},
  initialSection = 'align',
  onSectionChange,
  onSelectWorkload,
  onApproveWorkload,
  onAskAgent,
  onSaveAlignment,
  onBack,
}) => {
  const [draft, setDraft] = useState(alignment);
  const [activeSection, setActiveSection] = useState<'align' | 'waves' | 'mobilize' | 'execute' | 'measure' | 'learn'>(initialSection);
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
    setActiveSection(initialSection);
  }, [initialSection]);
  useEffect(() => {
    if (selectedWorkload?.id) {
      setActiveWorkloadId(selectedWorkload.id);
    }
  }, [selectedWorkload?.id]);

  const selectSection = (next: 'align' | 'waves' | 'mobilize' | 'execute' | 'measure' | 'learn') => {
    setActiveSection(next);
    onSectionChange?.(next);
  };

  const selectWorkloadById = (workloadId: string) => {
    setActiveWorkloadId(workloadId);
    const matched = workloads.find((w) => w.id === workloadId);
    if (matched) {
      onSelectWorkload?.(matched);
    }
  };

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

  const activeReadiness = useMemo(
    () => (activeWorkload ? evaluateEvidenceReadiness(activeWorkload.dna) : null),
    [activeWorkload],
  );
  const isActiveEvidenceReady = activeReadiness?.decisionReadiness === 'READY';

  // Explicit human approval ONLY — evidence completeness NEVER implies human approval.
  const isApproved = Boolean(
    activeWorkload && isActiveEvidenceReady && approvedWorkloads[activeWorkload.id],
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
    // Defense in depth: NEEDS EVIDENCE workloads can never be approved or enter/advance execution.
    if (!isActiveEvidenceReady) return;
    if (!isApproved) {
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

  const inputClass = 'w-full rounded-lg border border-[var(--emos-border-subtle)] bg-[var(--emos-input-bg)] px-3 py-2 text-sm text-[var(--emos-text-primary)] placeholder-[var(--emos-text-muted)] outline-hidden focus:border-[#4648D4] focus:ring-2 focus:ring-indigo-500/15 transition-colors';

  const activeSixRFrame = lifecycle ? SIX_R_SEMANTIC_FRAME[lifecycle.disposition] : SIX_R_SEMANTIC_FRAME.Replatform;

  const sectionHeaderMeta = useMemo(() => {
    switch (activeSection) {
      case 'mobilize':
        return {
          breadcrumb: 'Decide › Approval & Governance',
          title: 'Approval & Mobilization Governance',
          subtitle: 'Confirm human sign-off and mobilization controls before delivery begins.',
        };
      case 'waves':
        return {
          breadcrumb: 'Transform › Plan',
          title: 'Modernization Wave Plan',
          subtitle: 'Deterministic workload sequencing based on governed 6R disposition, criticality, and evidence readiness.',
        };
      case 'execute':
        return {
          breadcrumb: `Transform › ${activeSixRFrame.executeTitle}`,
          title: activeSixRFrame.executeTitle,
          subtitle: activeSixRFrame.executeSubtitle,
        };
      case 'measure':
        return {
          breadcrumb: 'Outcomes › Measure',
          title: 'Outcome Realization',
          subtitle: activeSixRFrame.measureSubtitle,
        };
      case 'learn':
        return {
          breadcrumb: 'Outcomes › Learn (Outcome Playbook)',
          title: 'Outcome Playbook & Wave Lessons',
          subtitle: activeSixRFrame.learnSubtitle,
        };
      default:
        return {
          breadcrumb: 'Transform › Program Alignment',
          title: 'Program Alignment',
          subtitle: 'Define executive sponsorship, risk tolerance, and target outcomes governing wave sequencing.',
        };
    }
  }, [activeSection, activeSixRFrame]);

  return (
    <main id="portfolio-plan-view" className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5 max-w-[1600px] mx-auto w-full">
      <header className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--emos-text-muted)]">
              <button onClick={onBack} className="inline-flex items-center gap-1 hover:text-[var(--emos-text-primary)] cursor-pointer transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Command Center
              </button>
              <span>›</span>
              <span>Modernization Decision Cockpit</span>
              <span>›</span>
              <span className="text-[var(--emos-text-primary)] font-medium">{sectionHeaderMeta.breadcrumb}</span>
            </div>
            <JourneyStage
              stage={stageMarkerInfo.stage}
              question={stageMarkerInfo.question}
            />
            <h1 className="font-display text-2xl sm:text-[26px] font-bold tracking-tight text-[var(--emos-text-primary)]">
              {sectionHeaderMeta.title}
            </h1>
            <p className="max-w-3xl text-xs sm:text-sm leading-relaxed text-[var(--emos-text-secondary)]">
              {sectionHeaderMeta.subtitle}
            </p>
          </div>
          <button
            onClick={exportPack}
            className="inline-flex min-h-[36px] shrink-0 self-start items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] px-3.5 py-1.5 text-xs font-semibold text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)] hover:bg-[var(--emos-surface-hover)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--emos-accent)] cursor-pointer sm:self-auto"
          >
            <Download className="h-3.5 w-3.5" /> Export Executive Pack
          </button>
        </div>

        {/* Inline Stage Switcher: shown directly only when rendered standalone; collapsed behind progressive disclosure inside WorkspaceShell */}
        {onSectionChange ? (
          <details className="text-xs text-[var(--emos-text-muted)]">
            <summary className="cursor-pointer font-medium hover:text-[var(--emos-text-primary)] inline-flex items-center gap-1.5">
              <span>Program alignment &amp; direct stage jump</span>
            </summary>
            <nav className="mt-2 inline-flex flex-wrap items-center gap-1 rounded-lg border border-[var(--emos-border-subtle)] bg-[var(--emos-bg-tertiary)] p-1" aria-label="Modernization planning sections">
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
                  onClick={() => selectSection(id as typeof activeSection)}
                  className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition cursor-pointer ${
                    activeSection === id
                      ? 'bg-[var(--emos-surface)] text-[var(--emos-accent-text)] font-semibold shadow-2xs ring-1 ring-[var(--emos-border-subtle)]'
                      : 'text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{label as string}</span>
                </button>
              ))}
            </nav>
          </details>
        ) : (
          <nav className="inline-flex flex-wrap items-center gap-1 rounded-lg border border-[var(--emos-border-subtle)] bg-[var(--emos-bg-tertiary)] p-1" aria-label="Modernization planning sections">
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
                onClick={() => selectSection(id as typeof activeSection)}
                className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition cursor-pointer ${
                  activeSection === id
                    ? 'bg-[var(--emos-surface)] text-[var(--emos-accent-text)] font-semibold shadow-2xs ring-1 ring-[var(--emos-border-subtle)]'
                    : 'text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{label as string}</span>
              </button>
            ))}
          </nav>
        )}

        {/* Compact Summary Strip shown ONLY on Plan/Align (removed from Governance/Execute/Measure/Learn to prevent KPI duplication) */}
        {(activeSection === 'align' || activeSection === 'waves') && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ['Portfolio Scope', `${planned.length} workloads`],
              ['Governed Decisions', `${assessedCount}/${planned.length}`],
              ['Decision Ready', `${readyCount}/${planned.length}`],
              ['Mobilization Controls', `${mobilizationReady}/${readiness.length}`],
            ].map(([label, value]) => (
              <div key={label} className="stitch-card px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--emos-text-muted)]">{label}</p>
                <p className="mt-1 font-display text-lg font-bold text-[var(--emos-text-primary)] tabular-nums">{value}</p>
              </div>
            ))}
          </div>
        )}
      </header>

      {/* SECTION 1: ALIGN */}
      {activeSection === 'align' && (
        <section className="stitch-card p-5 sm:p-6 space-y-5">
          <div className="flex items-start gap-3 pb-4 border-b border-[var(--emos-border-subtle)]">
            <div className="rounded-lg border border-[var(--emos-accent-border)] bg-[var(--emos-accent-subtle)] p-2 text-[#4648D4] dark:text-[#818CF8]"><Flag className="w-4 h-4" /></div>
            <div><h2 className="font-display text-base font-bold text-[var(--emos-text-primary)]">Program alignment</h2><p className="text-xs leading-relaxed text-[var(--emos-text-secondary)]">These inputs become the explicit decision context for portfolio sequencing and the executive artifact.</p></div>
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

      {/* SECTION 2: WAVE PLAN — Dominant Visual Object: Horizontal Wave Roadmap */}
      {activeSection === 'waves' && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-[var(--emos-text-secondary)]">
              <strong className="text-[var(--emos-text-primary)]">Deterministic sequencing:</strong> governed 6R disposition, criticality, and verified evidence place each workload into Wave 1 → Wave 2 → Wave 3.
            </p>
            {planned[0] && (
              <button
                type="button"
                onClick={() => {
                  selectWorkloadById(planned[0].workloadId);
                  selectSection('execute');
                }}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-[#4648D4] hover:bg-[#3B3DC2] px-4 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Review / Start Next Wave</span>
              </button>
            )}
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {waves.map((wave, waveIdx) => (
              <article key={wave.id} className="stitch-card p-4 sm:p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-[var(--emos-border-subtle)]">
                    <div>
                      <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[var(--emos-accent-text)]">
                        Wave {wave.order}
                      </p>
                      <h2 className="mt-0.5 font-display text-base font-bold text-[var(--emos-text-primary)]">
                        {wave.name.replace(/^Wave \d · /, '')}
                      </h2>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-[var(--emos-bg)] border border-[var(--emos-border-subtle)] text-[11px] font-mono text-[var(--emos-text-secondary)]">
                      {wave.workloads.length} {wave.workloads.length === 1 ? 'system' : 'systems'}
                    </span>
                  </div>

                  <p className="text-xs leading-relaxed text-[var(--emos-text-secondary)]">{wave.objective}</p>

                  <div className="space-y-2">
                    {wave.workloads.length === 0 && (
                      <p className="rounded-lg bg-[var(--emos-bg)] border border-[var(--emos-border-subtle)] p-3 text-xs text-[var(--emos-text-muted)]">
                        No workloads assigned.
                      </p>
                    )}
                    {wave.workloads.map((item) => (
                      <div
                        key={item.workloadId}
                        className="rounded-lg border border-[var(--emos-border-subtle)] bg-[var(--emos-bg)] p-3 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-xs font-bold text-[var(--emos-text-primary)] truncate">
                            {item.workloadName}
                          </h3>
                          <span
                            className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-mono font-semibold ${
                              item.readiness === 'READY'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-300'
                                : 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-300'
                            }`}
                          >
                            {item.readiness}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2 text-[11px]">
                          <span className="px-2 py-0.5 rounded bg-[var(--emos-accent-subtle)] text-[var(--emos-accent-text)] font-semibold">
                            {item.disposition}
                          </span>
                          <span className="font-mono text-[var(--emos-text-muted)]">{item.evidenceCompleteness}% DNA</span>
                        </div>

                        <details className="text-[11px] text-[var(--emos-text-secondary)]">
                          <summary className="cursor-pointer font-medium text-[var(--emos-text-muted)] hover:text-[var(--emos-text-primary)]">
                            Sequencing rationale {item.blockers.length > 0 ? `(${item.blockers.length} gap${item.blockers.length > 1 ? 's' : ''})` : ''}
                          </summary>
                          <p className="mt-1.5 leading-relaxed">{item.rationale}</p>
                          {item.blockers.length > 0 && (
                            <p className="mt-1 text-amber-700 dark:text-amber-300">Gaps: {item.blockers.join(' · ')}</p>
                          )}
                        </details>

                        <button
                          type="button"
                          onClick={() => {
                            selectWorkloadById(item.workloadId);
                            selectSection('execute');
                          }}
                          className="w-full py-1.5 px-2.5 rounded-md border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] hover:border-[#4648D4] text-[11px] font-semibold text-[var(--emos-accent-text)] inline-flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        >
                          <span>Track Execution &amp; Outcomes</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {waveIdx < waves.length - 1 && (
                  <div className="pt-2 border-t border-[var(--emos-border-subtle)] text-[11px] text-[var(--emos-text-muted)] flex items-center justify-between">
                    <span>Feeds into Wave {wave.order + 1}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 3: GOVERNANCE & MOBILIZATION — Dominant Visual Object: Gate Clearance Bar + Compact Matrix */}
      {activeSection === 'mobilize' && (
        <section aria-label="Governance Gate Clearance" className="space-y-4">
          {/* Active Workload Human Approval Context (connects Decide -> Approval seamlessly to Mobilization Gates) */}
          {activeWorkload && lifecycle && (
            <div className="stitch-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--emos-accent-text)]">
                  Active Workload Approval · {activeWorkload.evidenceCompleteness}% DNA
                </span>
                <p className="text-sm font-display font-bold text-[var(--emos-text-primary)] truncate">
                  {activeWorkload.name} — {lifecycle.plainEnglish} ({lifecycle.disposition})
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {isApproved ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 dark:bg-emerald-500/15 dark:border-emerald-500/30 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Human Approved
                  </span>
                ) : isActiveEvidenceReady ? (
                  <button
                    type="button"
                    onClick={() => onApproveWorkload?.(activeWorkload.id, lifecycle.disposition)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#4648D4] hover:bg-[#3B3DC2] px-3.5 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Approve {activeWorkload.name}</span>
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 dark:bg-amber-500/15 dark:border-amber-500/30 text-xs font-semibold text-amber-700 dark:text-amber-300">
                    <Lock className="w-3.5 h-3.5" />
                    Evidence Gated (NEEDS EVIDENCE)
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Gate Clearance Summary Banner */}
          <div className="stitch-card p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[var(--emos-accent-text)]">
                  Gate Clearance Posture
                </p>
                <h2 className="font-display text-xl font-bold text-[var(--emos-text-primary)] mt-0.5">
                  {mobilizationReady} of {readiness.length} Controls Cleared
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full border text-xs font-semibold ${
                    mobilizationReady === readiness.length
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/15 dark:border-emerald-500/30 dark:text-emerald-300'
                      : 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/15 dark:border-amber-500/30 dark:text-amber-300'
                  }`}
                >
                  {mobilizationReady === readiness.length ? 'Ready to Mobilize' : `${readiness.length - mobilizationReady} Gate(s) Open`}
                </span>
                <button
                  type="button"
                  onClick={() => selectSection(mobilizationReady === readiness.length ? 'waves' : 'align')}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#4648D4] hover:bg-[#3B3DC2] px-3.5 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
                >
                  <span>{mobilizationReady === readiness.length ? 'Continue to Plan' : 'Resolve Open Gate'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="h-2 w-full rounded-full bg-[var(--emos-bg-tertiary)] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#4648D4] transition-all duration-300"
                style={{ width: `${Math.round((mobilizationReady / Math.max(1, readiness.length)) * 100)}%` }}
              />
            </div>
          </div>

          {/* Compact Gate Matrix Table */}
          <div className="stitch-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[var(--emos-bg)] border-b border-[var(--emos-border-subtle)] text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--emos-text-muted)]">
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Control</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Evidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--emos-border-subtle)]">
                  {readiness.map((item) => (
                    <tr key={item.id} className="hover:bg-[var(--emos-surface-elevated)] transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${
                            item.status === 'READY'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-300'
                              : 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-300'
                          }`}
                        >
                          {item.status === 'READY' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <CircleAlert className="w-3.5 h-3.5" />}
                          <span>{item.status}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[var(--emos-text-primary)]">{item.label}</td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[var(--emos-text-muted)]">{item.category}</td>
                      <td className="py-3.5 px-4 text-[var(--emos-text-secondary)] leading-relaxed">{item.evidence}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-[var(--emos-accent-border)] bg-[var(--emos-accent-subtle)] p-4 text-xs leading-relaxed text-[var(--emos-text-secondary)]">
            <ShieldCheck className="h-5 w-5 shrink-0 text-[#4648D4] dark:text-[#818CF8]" />
            <p>
              <strong className="text-[var(--emos-text-primary)]">Scope boundary:</strong> EMOS governs mobilization evidence, readiness gates, transformation progress, and outcome verification. It does not directly mutate external production cloud infrastructure.
            </p>
          </div>
        </section>
      )}

      {/* SHARED WORKLOAD & DISPOSITION SELECTOR FOR EXECUTE / MEASURE / LEARN */}
      {(activeSection === 'execute' || activeSection === 'measure' || activeSection === 'learn') && activeWorkload && lifecycle && (
        <div className="space-y-6">
          {/* Workload & 6R Selector Bar */}
          <div className="stitch-card p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
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
                  onChange={(e) => selectWorkloadById(e.target.value)}
                  className="rounded-lg border border-[var(--emos-border-strong)] bg-[var(--emos-bg)] px-3 py-1.5 text-sm font-semibold text-[var(--emos-text-primary)] focus:outline-hidden focus:border-[#4648D4]"
                >
                  {workloads.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.evidenceCompleteness}% DNA)
                    </option>
                  ))}
                </select>
                <span className="px-2.5 py-1 rounded-full bg-[var(--emos-accent-subtle)] border border-[var(--emos-accent-border)] text-xs font-semibold text-[var(--emos-accent-text)]">
                  {lifecycle.plainEnglish} ({lifecycle.disposition})
                </span>
              </div>
            </div>

            {/* Progressive Disclosure: Read-only 6R Playbook Preview (prevents accidental disposition override chrome) */}
            <details className="text-xs">
              <summary className="cursor-pointer font-medium text-[var(--emos-text-muted)] hover:text-[var(--emos-text-primary)]">
                Preview other 6R playbooks (read-only)
              </summary>
              <div className="mt-2 flex flex-wrap gap-1.5">
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
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-colors cursor-pointer ${
                      lifecycle.disposition === disp
                        ? 'bg-[#4648D4] text-white border-[#4648D4]'
                        : 'bg-[var(--emos-bg)] border-[var(--emos-border-subtle)] text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)] hover:border-[var(--emos-border-strong)]'
                    }`}
                  >
                    {disp}
                  </button>
                ))}
              </div>
            </details>
          </div>

          {/* SECTION 4: EXECUTE WORKSPACE — Above-the-Fold Active Progress + Horizontal Pipeline */}
          {activeSection === 'execute' && (
            <section aria-label="Transformation Execution Workspace" className="space-y-5">
              <div className="stitch-card p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--emos-border-subtle)] pb-3.5">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--emos-accent-text)] font-semibold">
                      {activeSixRFrame.pipelineLabel} · {PLAIN_ENGLISH_6R[lifecycle.disposition].shortAction}
                    </span>
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-[var(--emos-text-primary)] mt-0.5">
                      {activeWorkload.name} — {lifecycle.plainEnglish} ({lifecycle.disposition})
                    </h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {lifecycle.governanceStatus === 'APPROVED' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 dark:bg-emerald-500/15 dark:border-emerald-500/30 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Human Governance Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 dark:bg-amber-500/15 dark:border-amber-500/30 text-xs font-semibold text-amber-700 dark:text-amber-300">
                        <Lock className="w-3.5 h-3.5" />
                        {lifecycle.governanceStatus === 'BLOCKED_EVIDENCE' ? 'Blocked by Evidence Gate' : 'Pending Human Approval'}
                      </span>
                    )}
                    {onAskAgent && (
                      <button
                        type="button"
                        onClick={() => onAskAgent('Why is this blocked?')}
                        className="px-2 py-1 text-xs font-medium text-[var(--emos-accent-text)] hover:underline cursor-pointer"
                      >
                        Why is this blocked? ↗
                      </button>
                    )}
                  </div>
                </div>

                {/* Single Compact Execution Progress & Action Bar (immediately above the fold) */}
                <div className="p-4 rounded-xl bg-[var(--emos-bg)] border border-[var(--emos-border-subtle)] space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                      <span className="font-semibold text-[var(--emos-text-primary)]">
                        Progress: <strong className="font-mono text-[#4648D4] dark:text-[#818CF8]">{lifecycle.overallProgress}%</strong>
                      </span>
                      <span className="text-[var(--emos-text-secondary)]">
                        Active Phase: <strong className="text-[var(--emos-text-primary)]">{lifecycle.currentPhaseLabel}</strong>
                      </span>
                      <span className={lifecycle.activeBlocker ? 'text-amber-700 dark:text-amber-300 font-semibold' : 'text-emerald-700 dark:text-emerald-400 font-semibold'}>
                        {lifecycle.activeBlocker ? '1 Gate Action Required' : '0 Blockers'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!isActiveEvidenceReady ? (
                        <button
                          id="advance-execution-stage-btn"
                          type="button"
                          disabled
                          className="h-8 px-3.5 rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-500/40 text-xs font-semibold inline-flex items-center gap-1.5 opacity-85 cursor-not-allowed"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Evidence Gate Locked (NEEDS EVIDENCE)</span>
                        </button>
                      ) : !isApproved ? (
                        <button
                          id="advance-execution-stage-btn"
                          type="button"
                          onClick={() => onApproveWorkload?.(activeWorkload.id, lifecycle.disposition)}
                          className="h-8 px-3.5 rounded-lg bg-[#4648D4] hover:bg-[#3B3DC2] text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Approve Governance &amp; Start Execution</span>
                        </button>
                      ) : (
                        <button
                          id="advance-execution-stage-btn"
                          type="button"
                          onClick={handleAdvanceExecutionStage}
                          className="h-8 px-3.5 rounded-lg bg-[#4648D4] hover:bg-[#3B3DC2] text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>
                            {lifecycle.activeBlocker && !clearedBlockers[activeWorkload.id]
                              ? 'Resolve Blocker & Proceed'
                              : lifecycle.overallProgress >= 100
                              ? 'Execution Complete · View Outcomes'
                              : 'Complete Current Checkpoint Gate'}
                          </span>
                        </button>
                      )}
                      {isApproved && lifecycle.overallProgress >= 100 && (
                        <button
                          type="button"
                          onClick={() => selectSection('measure')}
                          className="h-8 px-3 rounded-lg border border-[var(--emos-border-strong)] bg-[var(--emos-surface)] text-xs font-semibold cursor-pointer"
                        >
                          Measure Outcomes →
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[var(--emos-bg-tertiary)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#4648D4] transition-all duration-300"
                      style={{ width: `${lifecycle.overallProgress}%` }}
                    />
                  </div>
                </div>

                {/* Progressive Disclosure: Transformation Context (Current -> Decision -> Target) */}
                <details className="text-xs">
                  <summary className="cursor-pointer font-medium text-[var(--emos-text-muted)] hover:text-[var(--emos-text-primary)] select-none">
                    Transformation context (Current → Decision → Target)
                  </summary>
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
                    <div className="p-4 rounded-xl border border-[var(--emos-border-subtle)] bg-[var(--emos-bg)] space-y-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-rose-600 dark:text-rose-400 font-bold">
                        1. Current State
                      </span>
                      <h3 className="text-sm font-bold text-[var(--emos-text-primary)]">{activeWorkload.name}</h3>
                      <p className="text-xs text-[var(--emos-text-secondary)] leading-relaxed">
                        {lifecycle.currentArchSummary}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border-2 border-[#4648D4] bg-[var(--emos-accent-subtle)] flex flex-col justify-center text-center space-y-1.5">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--emos-accent-text)] font-semibold">
                        2. Governed EMOS Decision
                      </span>
                      <h3 className="text-base font-display font-bold text-[var(--emos-text-primary)]">
                        {lifecycle.plainEnglish}
                      </h3>
                      <span className="mx-auto px-2.5 py-0.5 rounded-full bg-[#4648D4] text-white font-mono text-[11px] font-semibold uppercase">
                        {lifecycle.disposition} · {lifecycle.overallProgress}% Complete
                      </span>
                    </div>

                    <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-500/10 space-y-1.5">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-300 font-bold">
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
                </details>
              </div>

              {/* DOMINANT VISUAL OBJECT: Horizontal Connected Transformation Pipeline */}
              <div className="stitch-card p-5 space-y-5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display text-sm font-bold text-[var(--emos-text-primary)]">
                    {activeSixRFrame.pipelineLabel} ({lifecycle.stages.length} Governed Stages)
                  </h3>
                  <span className="text-[11px] text-[var(--emos-text-muted)]">
                    Completed stages recede · Active &amp; blocked stages expand below
                  </span>
                </div>

                {/* Horizontal Connected Stepper */}
                <div className="overflow-x-auto pb-1">
                  <div className="min-w-[680px] grid gap-2" style={{ gridTemplateColumns: `repeat(${lifecycle.stages.length}, minmax(0, 1fr))` }}>
                    {lifecycle.stages.map((stage) => {
                      const isCompleted = stage.status === 'completed';
                      const isInProgress = stage.status === 'in_progress';
                      const isBlocked = stage.status === 'blocked';
                      return (
                        <div
                          key={stage.id}
                          className={`p-3 rounded-xl border transition-all flex flex-col justify-between gap-2 ${
                            isBlocked
                              ? 'bg-rose-50/80 dark:bg-rose-500/15 border-rose-300 dark:border-rose-500/40 ring-2 ring-rose-500/15 shadow-xs'
                              : isInProgress
                              ? 'bg-[var(--emos-surface)] border-[#4648D4] ring-2 ring-indigo-500/15 shadow-sm'
                              : isCompleted
                              ? 'bg-[var(--emos-bg)] border-[var(--emos-border-subtle)] opacity-65'
                              : 'bg-[var(--emos-bg)]/60 border-[var(--emos-border-subtle)] opacity-75'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1.5">
                            <span
                              className={`w-6 h-6 rounded-full font-mono text-[11px] font-bold flex items-center justify-center shrink-0 ${
                                isCompleted
                                  ? 'bg-emerald-600 text-white'
                                  : isBlocked
                                  ? 'bg-rose-600 text-white'
                                  : isInProgress
                                  ? 'bg-[#4648D4] text-white'
                                  : 'bg-[var(--emos-bg-tertiary)] text-[var(--emos-text-muted)]'
                              }`}
                            >
                              {isCompleted ? '✓' : stage.order}
                            </span>
                            <span
                              className={`text-[10px] font-mono font-semibold uppercase ${
                                isBlocked
                                  ? 'text-rose-700 dark:text-rose-300'
                                  : isInProgress
                                  ? 'text-[#4648D4] dark:text-[#818CF8]'
                                  : isCompleted
                                  ? 'text-emerald-700 dark:text-emerald-400'
                                  : 'text-[var(--emos-text-muted)]'
                              }`}
                            >
                              {isCompleted ? 'Done' : isBlocked ? 'Blocked' : isInProgress ? 'Active' : 'Next'}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-[var(--emos-text-primary)] leading-snug">
                            {stage.label}
                          </p>
                          <p className="text-[11px] text-[var(--emos-text-muted)] truncate">{stage.ownerRole}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Focused Detail Card ONLY for Active / Blocked Stage(s) */}
                {lifecycle.stages
                  .filter((s) => s.status === 'in_progress' || s.status === 'blocked')
                  .map((stage) => {
                    const isBlocked = stage.status === 'blocked';
                    return (
                      <div
                        key={`focus-${stage.id}`}
                        className={`p-4 rounded-xl border space-y-2 ${
                          isBlocked
                            ? 'bg-rose-50/70 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/35'
                            : 'bg-[var(--emos-accent-subtle)]/50 border-[var(--emos-accent-border)]'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className="font-display text-sm font-bold text-[var(--emos-text-primary)]">
                            Stage {stage.order}: {stage.label}
                          </h4>
                          <span className="text-xs text-[var(--emos-text-secondary)]">
                            Owner: <strong className="text-[var(--emos-text-primary)]">{stage.ownerRole}</strong>
                          </span>
                        </div>
                        <p className="text-xs text-[var(--emos-text-secondary)]">{stage.description}</p>
                        <div className="pt-2 border-t border-[var(--emos-border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                          <span className="text-[var(--emos-text-secondary)]">
                            <strong className="text-[var(--emos-text-primary)]">Checkpoint Gate:</strong> {stage.gateRequirement} · <strong className="text-[var(--emos-text-primary)]">Deliverable:</strong> {stage.deliverable}
                          </span>
                          {stage.blocker && (
                            <span className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-300 font-semibold">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                              {stage.blocker}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </section>
          )}

          {/* SECTION 5: MEASURE OUTCOMES (Section W) */}
          {activeSection === 'measure' && (
            <section aria-label="Measure Transformation Outcomes" className="space-y-5">
              <div className="stitch-card p-5 sm:p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--emos-border-subtle)] pb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--emos-accent-text)] font-semibold">
                      Benefit Realization · Baseline vs. Target vs. Observed
                    </span>
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-[var(--emos-text-primary)] mt-0.5">
                      Did {activeWorkload.name} ({lifecycle.plainEnglish}) Deliver What We Expected?
                    </h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <span className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30 text-[10px] font-mono font-semibold text-amber-700 dark:text-amber-300">
                      Synthetic / Representative Outcomes
                    </span>
                    <button
                      type="button"
                      onClick={() => selectSection('learn')}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#4648D4] hover:bg-[#3B3DC2] px-3.5 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
                    >
                      <span>Continue to Learn</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* DOMINANT VISUAL OBJECT: Baseline -> Target -> Observed Directional Outcome Shift */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {lifecycle.outcomes.map((metric) => (
                    <article
                      key={metric.id}
                      className="rounded-xl border border-[var(--emos-border-subtle)] bg-[var(--emos-bg)] p-4 flex flex-col justify-between space-y-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[11px] font-mono text-[var(--emos-text-muted)]">{metric.unit}</p>
                          <h3 className="font-display text-sm font-bold text-[var(--emos-text-primary)]">{metric.label}</h3>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full border text-[11px] font-semibold shrink-0 ${
                            metric.status === 'exceeded'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30'
                              : metric.status === 'on_track'
                              ? 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30'
                              : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30'
                          }`}
                        >
                          {metric.status === 'exceeded' ? 'Exceeded' : metric.status === 'on_track' ? 'Met' : 'Variance'}
                        </span>
                      </div>

                      {/* Focal Observed State + Directional Baseline -> Target */}
                      <div className="space-y-2.5">
                        <div className="p-3 rounded-lg bg-[var(--emos-surface)] border border-[var(--emos-accent-border)]">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--emos-accent-text)] block">
                            Observed
                          </span>
                          <strong className="font-display text-lg font-bold text-[var(--emos-text-primary)] mt-0.5 block tabular-nums">
                            {metric.observed}
                          </strong>
                        </div>

                        <div className="flex items-center justify-between gap-2 text-xs px-1">
                          <div>
                            <span className="text-[11px] text-[var(--emos-text-muted)] block">Baseline</span>
                            <strong className="font-mono text-[var(--emos-text-secondary)]">{metric.baseline}</strong>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-[var(--emos-text-muted)] shrink-0" />
                          <div className="text-right">
                            <span className="text-[11px] text-[var(--emos-text-muted)] block">Target</span>
                            <strong className="font-mono text-[var(--emos-text-primary)]">{metric.target}</strong>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-[var(--emos-text-secondary)] pt-2 border-t border-[var(--emos-border-subtle)] leading-relaxed">
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
                    className="px-4 py-2 rounded-lg bg-[#4648D4] hover:bg-[#3B3DC2] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
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
              <div className="stitch-card p-5 sm:p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--emos-border-subtle)] pb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--emos-accent-text)] font-semibold">
                      Closed-Loop Enterprise Memory · Governance Playbook
                    </span>
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-[var(--emos-text-primary)] mt-0.5">
                      What Should We Remember for the Next Decision?
                    </h2>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[var(--emos-bg)] border border-[var(--emos-border-subtle)] text-[10px] font-mono text-[var(--emos-text-secondary)]">
                    Representative archetype lesson · Session-only note (No automated retraining)
                  </span>
                </div>

                {/* DOMINANT VISUAL OBJECT: 3-Step Closed-Loop Flow (Assumption -> Observed Delta -> Next-Wave Rule) */}
                {lifecycle.learnings.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl bg-[var(--emos-bg)] border border-[var(--emos-border-subtle)] p-4 space-y-3"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-11 gap-3 items-stretch text-xs">
                      <div className="lg:col-span-3 p-3.5 rounded-lg bg-[var(--emos-surface)] border border-[var(--emos-border-subtle)] space-y-1">
                        <span className="text-[11px] font-mono uppercase text-[var(--emos-text-muted)] font-semibold block">
                          1. Original Assumption
                        </span>
                        <p className="text-[var(--emos-text-primary)] leading-relaxed">{item.originalAssumption}</p>
                      </div>

                      <div className="lg:col-span-1 flex items-center justify-center text-[var(--emos-text-muted)]">
                        <ArrowRight className="w-4 h-4 rotate-90 lg:rotate-0" />
                      </div>

                      <div className="lg:col-span-3 p-3.5 rounded-lg bg-amber-50/50 dark:bg-amber-500/10 border border-amber-200/80 dark:border-amber-500/30 space-y-1">
                        <span className="text-[11px] font-mono uppercase text-amber-700 dark:text-amber-300 font-semibold block">
                          2. Observed Delta
                        </span>
                        <p className="font-medium text-[var(--emos-text-primary)] leading-relaxed">{item.actualResult}</p>
                        <p className="text-[11px] text-[var(--emos-text-secondary)]">{item.difference}</p>
                      </div>

                      <div className="lg:col-span-1 flex items-center justify-center text-[var(--emos-text-muted)]">
                        <ArrowRight className="w-4 h-4 rotate-90 lg:rotate-0" />
                      </div>

                      <div className="lg:col-span-3 p-3.5 rounded-lg bg-[var(--emos-accent-subtle)] border border-[var(--emos-accent-border)] space-y-1">
                        <span className="text-[11px] font-mono uppercase text-[var(--emos-accent-text)] font-semibold block">
                          3. Next-Wave Rule
                        </span>
                        <p className="font-semibold text-[var(--emos-text-primary)] leading-relaxed">{item.lesson}</p>
                      </div>
                    </div>

                    <details className="text-xs text-[var(--emos-text-secondary)] pt-1">
                      <summary className="cursor-pointer font-medium text-[var(--emos-text-muted)] hover:text-[var(--emos-text-primary)]">
                        Future applicability &amp; wave scope
                      </summary>
                      <p className="mt-1.5 leading-relaxed">{item.futureApplicability}</p>
                    </details>
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
                    className="px-4 py-2 rounded-lg bg-[#4648D4] hover:bg-[#3B3DC2] text-white text-xs font-semibold disabled:opacity-40 cursor-pointer shrink-0"
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
