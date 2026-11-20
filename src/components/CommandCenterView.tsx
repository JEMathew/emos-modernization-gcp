import React, { useMemo } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Dna,
  GitBranch,
  Layers,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Route,
  Play,
  BarChart3,
  BookOpen,
  FileText,
} from 'lucide-react';
import type { Disposition6R, EnterpriseWorkload, Interaction, ProgramAlignment } from '../types';
import {
  ENTERPRISE_ESTATE_PROFILES,
  deriveEvidenceDrivenRecommendation,
  type EnterpriseSampleId,
} from '../data/enterpriseEstates';
import { buildMobilizationReadiness, buildModernizationWaves } from '../lib/wavePlanner';
import { CapabilityCue } from './CapabilityCue';
import type { ShellNavTarget } from './WorkspaceShell';

interface CommandCenterViewProps {
  activeEstateId: EnterpriseSampleId;
  workloads: EnterpriseWorkload[];
  interactions: Interaction[];
  approvedWorkloads: Record<string, boolean>;
  alignment: ProgramAlignment;
  searchQuery?: string;
  onSelectWorkloadForDna: (workload: EnterpriseWorkload) => void;
  onAssessWorkload: (workload: EnterpriseWorkload) => void;
  onApproveWorkload: (workloadId: string, disposition: Disposition6R) => void;
  onReviewPriorityDecisions?: () => void;
  onNavigate: (target: ShellNavTarget) => void;
  onOpenImportModal: () => void;
  isProcessing?: boolean;
}

const DISPOSITION_COLORS: Record<Disposition6R, { bar: string; dot: string; badge: string }> = {
  Replatform: {
    bar: 'bg-[#4648D4]',
    dot: 'bg-[#4648D4]',
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/30',
  },
  Refactor: {
    bar: 'bg-violet-500',
    dot: 'bg-violet-500',
    badge: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-500/30',
  },
  Rehost: {
    bar: 'bg-sky-500',
    dot: 'bg-sky-500',
    badge: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30',
  },
  Repurchase: {
    bar: 'bg-teal-500',
    dot: 'bg-teal-500',
    badge: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/15 dark:text-teal-300 dark:border-teal-500/30',
  },
  Retain: {
    bar: 'bg-slate-400',
    dot: 'bg-slate-400',
    badge: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/15 dark:text-slate-300 dark:border-slate-500/30',
  },
  Retire: {
    bar: 'bg-rose-500',
    dot: 'bg-rose-500',
    badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30',
  },
};

export const CommandCenterView: React.FC<CommandCenterViewProps> = ({
  activeEstateId,
  workloads,
  interactions,
  approvedWorkloads,
  alignment,
  searchQuery = '',
  onSelectWorkloadForDna,
  onAssessWorkload,
  onApproveWorkload,
  onReviewPriorityDecisions,
  onNavigate,
  onOpenImportModal,
  isProcessing = false,
}) => {
  const profile = ENTERPRISE_ESTATE_PROFILES[activeEstateId === 'financial-services' ? 'financial-services' : 'apex-aerospace'];

  const evaluated = useMemo(
    () =>
      workloads.map((w) => ({
        workload: w,
        rec: deriveEvidenceDrivenRecommendation(w),
        isApproved: Boolean(approvedWorkloads[w.id]),
      })),
    [workloads, approvedWorkloads],
  );

  const filteredEvaluated = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return evaluated;
    return evaluated.filter(
      ({ workload, rec }) =>
        workload.name.toLowerCase().includes(q) ||
        workload.businessCapability.toLowerCase().includes(q) ||
        workload.currentStack.toLowerCase().includes(q) ||
        rec.recommended6R.toLowerCase().includes(q),
    );
  }, [evaluated, searchQuery]);

  const avgCompleteness = useMemo(
    () =>
      workloads.length > 0
        ? Math.round(workloads.reduce((acc, w) => acc + w.evidenceCompleteness, 0) / workloads.length)
        : 0,
    [workloads],
  );

  const readyCount = evaluated.filter((e) => e.rec.decisionReadiness === 'READY').length;
  const needsEvidenceCount = evaluated.length - readyCount;
  const approvedCount = evaluated.filter((e) => e.isApproved).length;

  const waves = useMemo(() => buildModernizationWaves(workloads, interactions), [workloads, interactions]);
  const mobilizationReadiness = useMemo(
    () => buildMobilizationReadiness(alignment, waves),
    [alignment, waves],
  );
  const mobilizationReadyCount = mobilizationReadiness.filter((r) => r.status === 'READY').length;

  // Real deterministic 6R distribution across active workloads
  const distribution6R = useMemo(() => {
    const counts: Record<Disposition6R, number> = {
      Replatform: 0,
      Refactor: 0,
      Rehost: 0,
      Repurchase: 0,
      Retain: 0,
      Retire: 0,
    };
    evaluated.forEach(({ rec }) => {
      counts[rec.recommended6R] += 1;
    });
    const total = Math.max(1, evaluated.length);
    return (['Replatform', 'Refactor', 'Rehost', 'Repurchase', 'Retain', 'Retire'] as Disposition6R[])
      .map((disposition) => ({
        disposition,
        count: counts[disposition],
        pct: Math.round((counts[disposition] / total) * 100),
      }))
      .filter((item) => item.count > 0);
  }, [evaluated]);

  const lifecycleStages: {
    id: string;
    label: string;
    status: 'done' | 'active' | 'pending';
    meta: string;
    target: ShellNavTarget;
  }[] = [
    { id: 'strategy', label: 'Strategy', status: 'done', meta: 'Aligned', target: 'plan' },
    { id: 'discover', label: 'Discover', status: 'done', meta: `${workloads.length} in scope`, target: 'portfolio' },
    { id: 'dna', label: 'Enterprise DNA', status: 'done', meta: `${avgCompleteness}% avg`, target: 'dna' },
    { id: 'assess', label: 'Assess', status: needsEvidenceCount > 0 ? 'active' : 'done', meta: `${needsEvidenceCount} gated`, target: 'dna' },
    { id: 'decide', label: 'Decide', status: 'active', meta: `${readyCount} ready`, target: 'decisions' },
    { id: 'govern', label: 'Govern', status: approvedCount > 0 ? 'done' : 'pending', meta: `${approvedCount} approved`, target: 'governance' },
    { id: 'plan', label: 'Plan', status: 'pending', meta: `${waves.length} waves`, target: 'plan' },
    { id: 'execute', label: 'Execute', status: 'pending', meta: 'Workflows', target: 'execute' },
    { id: 'measure', label: 'Measure', status: 'pending', meta: 'Outcomes', target: 'measure' },
    { id: 'learn', label: 'Learn', status: 'pending', meta: 'Playbook', target: 'learn' },
  ];

  return (
    <main id="command-center-view" className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 max-w-[1600px] mx-auto w-full space-y-6">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--emos-text-muted)] mb-1">
            <span>Command Center</span>
            <span>›</span>
            <span className="text-[var(--emos-text-primary)] font-medium">Executive Overview</span>
            <span className="px-2 py-0.5 rounded-full bg-[var(--emos-accent-subtle)] border border-[var(--emos-accent-border)] text-[10px] font-mono font-semibold text-[var(--emos-accent-text)]">
              EMOS Core v2.0
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-[26px] font-bold text-[var(--emos-text-primary)] tracking-tight">
            Modernization Command Center
          </h1>
          <p className="text-xs sm:text-sm text-[var(--emos-text-secondary)] mt-0.5">
            {profile.name} · {profile.strategicObjective}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenImportModal}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] hover:bg-[var(--emos-surface-hover)] text-xs font-semibold text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)] transition-colors cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5 text-[var(--emos-text-muted)]" />
            <span>Import Portfolio</span>
          </button>
          <button
            type="button"
            onClick={() => (onReviewPriorityDecisions ? onReviewPriorityDecisions() : onNavigate('decisions'))}
            disabled={isProcessing}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#4648D4] hover:bg-[#3B3DC2] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Review Priority Decisions</span>
          </button>
        </div>
      </div>

      {/* 4 Core Portfolio KPIs (Restrained Executive Strip) */}
      <section aria-label="Command Center Attention Summary" className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="stitch-card p-4">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--emos-text-muted)]">
            <span>Estate Scope</span>
            <Layers className="w-3.5 h-3.5 text-[var(--emos-text-muted)]" />
          </div>
          <p className="mt-1.5 font-display text-2xl font-bold text-[var(--emos-text-primary)] tabular-nums">
            {profile.totalAssetsRepresented.toLocaleString()}+
          </p>
          <p className="mt-0.5 text-xs text-[var(--emos-text-secondary)]">
            <span className="font-mono font-semibold text-[#4648D4] dark:text-[#818CF8]">{workloads.length}</span> active · {profile.annualTechSpendBaseline}
          </p>
        </div>

        <div className="stitch-card p-4">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--emos-text-muted)]">
            <span>Avg DNA Readiness</span>
            <Dna className="w-3.5 h-3.5 text-[#4648D4] dark:text-[#818CF8]" />
          </div>
          <p className="mt-1.5 font-display text-2xl font-bold text-[var(--emos-text-primary)] tabular-nums">
            {avgCompleteness}%
          </p>
          <p className="mt-0.5 text-xs text-[var(--emos-text-secondary)]">
            Verified across 18 attributes
          </p>
        </div>

        <div className="stitch-card p-4">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--emos-text-muted)]">
            <span>Evidence Gated</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <p className="mt-1.5 font-display text-2xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
            {needsEvidenceCount}
          </p>
          <p className="mt-0.5 text-xs text-[var(--emos-text-secondary)]">
            Blocked below 70% or critical gap
          </p>
        </div>

        <div className="stitch-card p-4">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--emos-text-muted)]">
            <span>Decision Ready</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="mt-1.5 font-display text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {readyCount} / {workloads.length}
          </p>
          <p className="mt-0.5 text-xs text-[var(--emos-text-secondary)]">
            {approvedCount} human approved · {interactions.length} assessed
          </p>
        </div>
      </section>

      {/* DOMINANT VISUAL OBJECT: Portfolio Gate / Readiness Flow + 6R Allocation */}
      <section aria-label="Portfolio Gate and Readiness Flow" className="stitch-card p-5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-sm font-bold text-[var(--emos-text-primary)]">
              Portfolio Gate &amp; Readiness Flow
            </h2>
            <p className="text-xs text-[var(--emos-text-secondary)]">
              Where the active estate sits across evidence verification, governance sign-off, and transformation.
            </p>
          </div>
          <span className="text-[11px] font-mono text-[var(--emos-text-muted)]">
            Representative synthetic baseline · {profile.name}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 items-stretch">
          {[
            { label: 'In Scope', count: workloads.length, sub: 'Cataloged', tone: 'neutral', target: 'portfolio' as ShellNavTarget },
            { label: 'Needs Evidence', count: needsEvidenceCount, sub: 'Action required', tone: needsEvidenceCount > 0 ? 'amber' : 'neutral', target: 'dna' as ShellNavTarget },
            { label: 'Decision Ready', count: readyCount, sub: 'Gate cleared', tone: 'indigo', target: 'decisions' as ShellNavTarget },
            { label: 'Human Approved', count: approvedCount, sub: 'Signed off', tone: approvedCount > 0 ? 'emerald' : 'neutral', target: 'governance' as ShellNavTarget },
            { label: 'In Transformation', count: approvedCount, sub: `${waves.length} waves sequenced`, tone: 'neutral', target: 'execute' as ShellNavTarget },
          ].map((stage, idx) => (
            <button
              key={stage.label}
              type="button"
              onClick={() => onNavigate(stage.target)}
              className={`relative p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                stage.tone === 'amber'
                  ? 'bg-amber-50/70 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/35'
                  : stage.tone === 'indigo'
                  ? 'bg-[var(--emos-accent-subtle)] border-[var(--emos-accent-border)]'
                  : stage.tone === 'emerald'
                  ? 'bg-emerald-50/70 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/35'
                  : 'bg-[var(--emos-bg)] border-[var(--emos-border-subtle)] hover:border-[var(--emos-border-strong)]'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--emos-text-muted)]">
                <span>0{idx + 1} · {stage.label}</span>
                {idx < 4 && <ArrowRight className="w-3 h-3 hidden sm:block opacity-50" />}
              </div>
              <p
                className={`mt-1.5 font-display text-2xl font-bold tabular-nums ${
                  stage.tone === 'amber'
                    ? 'text-amber-700 dark:text-amber-300'
                    : stage.tone === 'indigo'
                    ? 'text-[#4648D4] dark:text-[#818CF8]'
                    : stage.tone === 'emerald'
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : 'text-[var(--emos-text-primary)]'
                }`}
              >
                {stage.count}
              </p>
              <p className="mt-0.5 text-[11px] text-[var(--emos-text-secondary)]">{stage.sub}</p>
            </button>
          ))}
        </div>

        {/* Progressive Disclosure: Derived 6R Portfolio Mix */}
        <details className="pt-3 border-t border-[var(--emos-border-subtle)] group">
          <summary className="flex items-center justify-between text-xs cursor-pointer list-none">
            <span className="font-semibold text-[var(--emos-text-secondary)] group-hover:text-[var(--emos-text-primary)]">
              Derived 6R Portfolio Mix ({distribution6R.map((d) => `${d.count} ${d.disposition}`).join(' · ')})
            </span>
            <span className="text-[11px] font-medium text-[#4648D4] dark:text-[#818CF8]">
              Show breakdown
            </span>
          </summary>
          <div className="pt-3 space-y-2.5">
            <div className="h-5 w-full rounded-md overflow-hidden flex gap-0.5 bg-[var(--emos-bg-tertiary)]">
              {distribution6R.map(({ disposition, pct }) => (
                <div
                  key={disposition}
                  style={{ width: `${Math.max(pct, 8)}%` }}
                  title={`${disposition}: ${pct}%`}
                  className={`${DISPOSITION_COLORS[disposition].bar} h-full flex items-center justify-center text-[11px] font-mono font-semibold text-white`}
                >
                  {pct >= 14 ? `${pct}%` : ''}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                {distribution6R.map(({ disposition, count, pct }) => (
                  <span key={disposition} className="inline-flex items-center gap-1.5 text-[var(--emos-text-secondary)]">
                    <span className={`w-2 h-2 rounded-xs ${DISPOSITION_COLORS[disposition].dot}`} />
                    <span className="font-medium text-[var(--emos-text-primary)]">{disposition}</span>
                    <span className="font-mono text-[11px] text-[var(--emos-text-muted)]">
                      {count} ({pct}%)
                    </span>
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => onNavigate('plan')}
                className="text-xs font-semibold text-[#4648D4] dark:text-[#818CF8] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Open Wave Plan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </details>
      </section>

      {/* Main 12-Col Analytical Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left 8 Columns: Urgent Decision Gateways + Estate 6R Distribution */}
        <div className="xl:col-span-8 space-y-6">
          {/* Urgent Decision Gateways */}
          <section className="stitch-card overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--emos-border-subtle)] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-2 h-2 rounded-full ${needsEvidenceCount > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  aria-hidden="true"
                />
                <h2 className="font-display text-sm font-bold text-[var(--emos-text-primary)]">
                  Urgent Decision Gateways
                </h2>
                <span
                  className={`px-2 py-0.5 rounded-full border text-[11px] font-semibold ${
                    needsEvidenceCount > 0
                      ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30'
                  }`}
                >
                  {needsEvidenceCount > 0 ? `${needsEvidenceCount} Evidence Gated` : 'All Gate-Ready'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('portfolio')}
                className="text-xs font-semibold text-[#4648D4] dark:text-[#818CF8] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Portfolio ({workloads.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-[var(--emos-border-subtle)]">
              {filteredEvaluated.map(({ workload, rec, isApproved }) => {
                const dispStyle = DISPOSITION_COLORS[rec.recommended6R];
                const isReady = rec.decisionReadiness === 'READY';
                return (
                  <div
                    key={workload.id}
                    className="p-4 sm:p-5 hover:bg-[var(--emos-surface-elevated)] transition-colors flex flex-col gap-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-display text-base font-bold text-[var(--emos-text-primary)]">
                            {workload.name}
                          </h3>
                          <span className="px-2 py-0.5 rounded bg-[var(--emos-bg-tertiary)] text-[10px] font-mono text-[var(--emos-text-muted)]">
                            {workload.id}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full border text-[10px] font-mono font-bold uppercase ${dispStyle.badge}`}>
                            {rec.recommended6R} · {rec.confidenceScore}%
                          </span>
                          <CapabilityCue cueId={rec.recommended6R.toLowerCase()} />
                        </div>
                        <p className="text-xs text-[var(--emos-text-secondary)]">
                          <strong className="text-[var(--emos-text-primary)]">{workload.businessCapability}</strong> · {workload.currentStack} · {workload.hosting}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => onSelectWorkloadForDna(workload)}
                          className="h-8 px-3 rounded-lg border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] hover:bg-[var(--emos-surface-hover)] hover:border-[var(--emos-border-strong)] text-xs font-semibold text-[var(--emos-text-primary)] inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Dna className="w-3.5 h-3.5 text-[#4648D4] dark:text-[#818CF8]" />
                          <span>View Enterprise DNA</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onAssessWorkload(workload)}
                          disabled={isProcessing}
                          className="h-8 px-3 rounded-lg bg-[#4648D4] hover:bg-[#3B3DC2] text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors disabled:opacity-50"
                        >
                          <span>Review Decision</span>
                        </button>
                      </div>
                    </div>

                    {/* Signal Chips Row */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md border font-medium ${
                          isReady
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30'
                            : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30'
                        }`}
                      >
                        {isReady ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        <span>
                          {workload.evidenceCompleteness}% DNA · {rec.decisionReadiness}
                        </span>
                      </span>

                      <span className="px-2.5 py-1 rounded-md bg-[var(--emos-bg)] border border-[var(--emos-border-subtle)] text-[var(--emos-text-secondary)] truncate max-w-md">
                        {rec.criticalGaps.length > 0
                          ? `Missing: ${rec.criticalGaps.slice(0, 2).join(', ')}`
                          : workload.modernizationSignals[0]}
                      </span>

                      {isApproved && (
                        <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30 font-semibold">
                          Human Approved
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredEvaluated.length === 0 && (
                <div className="p-8 text-center text-xs text-[var(--emos-text-muted)]">
                  No workloads match "{searchQuery}". Clear search in the top bar to see all workloads.
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right 4 Columns: Governance & Release Gates + Continuous Learning Loop */}
        <div className="xl:col-span-4 space-y-6">
          {/* Governance & Release Gates */}
          <section className="stitch-card p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#4648D4] dark:text-[#818CF8]" />
                <h2 className="font-display text-sm font-bold text-[var(--emos-text-primary)]">
                  Governance &amp; Release Gates
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[var(--emos-accent-subtle)] text-[10px] font-semibold text-[var(--emos-accent-text)]">
                Human-in-Loop
              </span>
            </div>

            <div className="space-y-3">
              {/* Gate 1: Deterministic Readiness Gate */}
              <div className="p-3.5 rounded-xl bg-[var(--emos-bg)] border border-[var(--emos-border-subtle)] space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[var(--emos-text-primary)]">
                    70% Evidence Readiness Gate
                  </span>
                  <span className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    {readyCount}/{workloads.length} Ready
                  </span>
                </div>
                <p className="text-[11px] text-[var(--emos-text-secondary)] leading-relaxed">
                  Model confidence cannot override deterministic completeness or unresolved critical gaps.
                </p>
              </div>

              {/* Gate 2: Pending Human Approvals */}
              <div className="p-3.5 rounded-xl bg-[var(--emos-bg)] border border-[var(--emos-border-subtle)] space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[var(--emos-text-primary)]">
                    Architect Approval Queue
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-[var(--emos-accent-text)]">
                    {approvedCount} Approved
                  </span>
                </div>
                {evaluated
                  .filter((e) => e.rec.decisionReadiness === 'READY' && !e.isApproved)
                  .slice(0, 2)
                  .map(({ workload, rec }) => (
                    <div
                      key={workload.id}
                      className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--emos-border-subtle)] text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-[var(--emos-text-primary)] truncate">{workload.name}</p>
                        <p className="text-[10px] text-[var(--emos-text-muted)]">{rec.plainEnglish} ({rec.recommended6R})</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onApproveWorkload(workload.id, rec.recommended6R)}
                        className="px-2.5 py-1 rounded-md border border-[var(--emos-accent-border)] bg-[var(--emos-surface)] hover:bg-[var(--emos-accent-subtle)] text-[11px] font-semibold text-[var(--emos-accent-text)] cursor-pointer shrink-0"
                      >
                        Approve
                      </button>
                    </div>
                  ))}
                {evaluated.filter((e) => e.rec.decisionReadiness === 'READY' && !e.isApproved).length === 0 && (
                  <p className="text-[11px] text-[var(--emos-text-muted)]">
                    Verify missing evidence on gated workloads to unlock human approval.
                  </p>
                )}
              </div>

              {/* Gate 3: Mobilization Controls */}
              <div className="p-3.5 rounded-xl bg-[var(--emos-bg)] border border-[var(--emos-border-subtle)] space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[var(--emos-text-primary)]">
                    Mobilization Readiness Controls
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-[var(--emos-text-secondary)]">
                    {mobilizationReadyCount}/{mobilizationReadiness.length} Ready
                  </span>
                </div>
                <p className="text-[11px] text-[var(--emos-text-secondary)]">
                  Sponsor: {alignment.executiveSponsor} · Security: {alignment.securityApprover}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('governance')}
              className="w-full py-2 rounded-lg border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] hover:bg-[var(--emos-surface-hover)] text-xs font-semibold text-[var(--emos-text-primary)] inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <span>Open Governance &amp; Mobilization</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </section>

          {/* Progressive Disclosure: Continuous Learning & Closed Loop */}
          <details className="stitch-card p-4 group">
            <summary className="flex items-center justify-between gap-2 cursor-pointer list-none">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#4648D4] dark:text-[#818CF8]" />
                <h2 className="font-display text-sm font-bold text-[var(--emos-text-primary)]">
                  Continuous Learning Loop
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[var(--emos-bg)] border border-[var(--emos-border-subtle)] text-[10px] font-semibold text-[var(--emos-text-muted)]">
                Human Playbook
              </span>
            </summary>

            <div className="mt-4 space-y-4">
              {/* Clean 5-Node Visual Loop */}
              <div className="p-3.5 rounded-xl bg-[var(--emos-bg)] border border-[var(--emos-border-subtle)] flex items-center justify-between gap-1 text-center">
                {[
                  { label: 'Evidence', icon: Dna, nav: 'dna' as ShellNavTarget },
                  { label: 'Decision', icon: GitBranch, nav: 'decisions' as ShellNavTarget },
                  { label: 'Execute', icon: Play, nav: 'execute' as ShellNavTarget },
                  { label: 'Measure', icon: BarChart3, nav: 'measure' as ShellNavTarget },
                  { label: 'Learn', icon: BookOpen, nav: 'learn' as ShellNavTarget },
                ].map(({ label, icon: Icon, nav }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => onNavigate(nav)}
                    className="flex flex-col items-center gap-1 group/node cursor-pointer"
                  >
                    <span className="w-7 h-7 rounded-full bg-[var(--emos-surface)] border border-[var(--emos-border-subtle)] group-hover/node:border-[#4648D4] flex items-center justify-center text-[#4648D4] dark:text-[#818CF8] transition-colors">
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[10px] font-medium text-[var(--emos-text-secondary)] group-hover/node:text-[var(--emos-text-primary)]">
                      {label}
                    </span>
                  </button>
                ))}
              </div>

              <p className="text-xs text-[var(--emos-text-secondary)] leading-relaxed">
                Observed outcome variances from executed waves are captured into the human-governed modernization playbook for future decisions—with zero autonomous model retraining.
              </p>

              <button
                type="button"
                onClick={() => onNavigate('learn')}
                className="w-full py-2 rounded-lg border border-[var(--emos-accent-border)] bg-[var(--emos-accent-subtle)] hover:bg-[#4648D4] hover:text-white text-xs font-semibold text-[var(--emos-accent-text)] inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <span>Open Learning Playbook</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </details>
        </div>
      </div>
    </main>
  );
};
