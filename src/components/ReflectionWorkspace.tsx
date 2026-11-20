import React, { useState, useRef, useEffect, useMemo } from 'react';
import { SafeMarkdown } from './SafeMarkdown';
import {
  Sparkles,
  Send,
  ShieldCheck,
  AlertTriangle,
  CornerDownLeft,
  Layers,
  Copy,
  Check,
  RotateCcw,
  GitCompare,
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  Dna,
  ArrowRight,
  ChevronDown,
  Bot,
  Route,
  Server,
  Cloud,
} from 'lucide-react';
import type { Interaction, AssessmentMode, Disposition6R, DecisionReadiness, EnterpriseWorkload } from '../types';
import { SAMPLE_PORTFOLIO, formatWorkloadDnaForAssessment } from '../data/samplePortfolio';
import { deriveEvidenceDrivenRecommendation } from '../data/enterpriseEstates';
import { buildDefaultLifecycleState } from '../lib/transformationEngine';
import { PLAIN_ENGLISH_6R } from '../config/capabilityCues';
import { JourneyStage } from './JourneyStage';
import { CapabilityCue } from './CapabilityCue';

interface ReflectionWorkspaceProps {
  activeInteraction: Interaction | null;
  selectedWorkload?: EnterpriseWorkload | null;
  allWorkloads?: EnterpriseWorkload[];
  activeDecideTab?: 'recommendation' | 'evidence' | 'alternatives' | 'approval';
  onChangeDecideTab?: (tab: 'recommendation' | 'evidence' | 'alternatives' | 'approval') => void;
  isGovernanceApproved?: boolean;
  onApproveGovernance?: (workloadId: string, disposition: Disposition6R) => void;
  onOpenPlanAndExecute?: () => void;
  onToggleAgentPanel?: () => void;
  onAskAgent?: (question: string) => void;
  onSaveNew: (params: {
    content: string;
    mode: AssessmentMode;
    workloadId?: string;
  }) => Promise<void>;
  onSendFollowUp: (interactionId: string, message: string) => Promise<void>;
  onRetrySave?: (interaction: Interaction) => Promise<void>;
  onOpenPortfolio?: () => void;
  onOpenDna?: (workloadNameOrId: string) => void;
  isProcessing: boolean;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  errorMessage: string | null;
  errorKind?: 'reasoning' | 'persistence' | 'guardrail' | null;
}

const EMOS_PROMPT_STARTERS = [
  {
    title: 'Assess Legacy Application',
    text: "We have a business-critical Java 8 and Oracle application with high infrastructure costs and several downstream integrations. Assess it for modernization.",
  },
  {
    title: 'Evaluate Data Platform',
    text: "We have an on-premises enterprise data warehouse with growing cost, scalability constraints and increasing demand for AI/ML workloads. Assess modernization options.",
  },
  {
    title: 'Compare Modernization Options',
    text: "Help me compare the viable modernization strategies for this workload and explain the trade-offs.",
  },
  {
    title: 'Identify Modernization Risks',
    text: "Identify the evidence gaps, dependencies and risks we should understand before making this modernization decision.",
  },
];

const FOLLOW_UP_SHORTCUTS = [
  {
    label: 'Compare Options',
    prompt: 'Compare the viable 6R alternatives for this workload and explain their trade-offs using the current evidence.',
    icon: GitCompare,
  },
  {
    label: 'Executive Summary',
    prompt: 'Create a concise executive summary of this recommendation, its evidence gaps, risks, and the decision required next.',
    icon: FileCheck2,
  },
];

export const ReflectionWorkspace: React.FC<ReflectionWorkspaceProps> = ({
  activeInteraction,
  selectedWorkload,
  allWorkloads,
  activeDecideTab,
  onChangeDecideTab,
  isGovernanceApproved = false,
  onApproveGovernance,
  onOpenPlanAndExecute,
  onToggleAgentPanel,
  onAskAgent,
  onSaveNew,
  onSendFollowUp,
  onRetrySave,
  onOpenPortfolio,
  onOpenDna,
  isProcessing,
  saveStatus,
  errorMessage,
  errorKind = null,
}) => {
  const [draftContent, setDraftContent] = useState('');
  const [followUpInput, setFollowUpInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isEvidenceExpanded, setIsEvidenceExpanded] = useState(false);
  const [showCompareAlternatives, setShowCompareAlternatives] = useState(false);
  const [isFullReasoningExpanded, setIsFullReasoningExpanded] = useState(false);
  const [internalDecideTab, setInternalDecideTab] = useState<'recommendation' | 'evidence' | 'alternatives' | 'approval'>('recommendation');

  const currentDecideTab = activeDecideTab ?? internalDecideTab;
  const setDecideTab = (tab: 'recommendation' | 'evidence' | 'alternatives' | 'approval') => {
    setInternalDecideTab(tab);
    onChangeDecideTab?.(tab);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const followUpInputRef = useRef<HTMLInputElement>(null);
  const previousThreadRef = useRef<{ id: string | null; turnCount: number }>({ id: null, turnCount: 0 });

  useEffect(() => {
    const currentId = activeInteraction?.id || null;
    const currentTurnCount = activeInteraction?.turns?.length || 0;
    const previous = previousThreadRef.current;

    if (currentId && previous.id === currentId && (isProcessing || currentTurnCount > previous.turnCount)) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

    previousThreadRef.current = { id: currentId, turnCount: currentTurnCount };
  }, [activeInteraction?.id, activeInteraction?.turns?.length, isProcessing]);

  useEffect(() => {
    setIsEvidenceExpanded(false);
    setShowCompareAlternatives(false);
  }, [activeInteraction?.id]);

  const metrics = useMemo(() => {
    if (!activeInteraction) return null;
    if (
      !activeInteraction.recommended6R ||
      typeof activeInteraction.confidenceScore !== 'number' ||
      typeof activeInteraction.evidenceCompleteness !== 'number' ||
      !activeInteraction.decisionReadiness
    ) return null;

    const disposition = activeInteraction.recommended6R as Disposition6R;
    const confidence = activeInteraction.confidenceScore;
    const completeness = activeInteraction.evidenceCompleteness;
    const readiness = activeInteraction.decisionReadiness as DecisionReadiness;

    return { disposition, confidence, completeness, readiness };
  }, [activeInteraction]);

  const resolvedWorkload = useMemo(() => {
    const pool = allWorkloads && allWorkloads.length > 0 ? allWorkloads : SAMPLE_PORTFOLIO;

    // 1. Always prioritize matching the active assessment interaction so title & Workload Profile stay in sync
    if (activeInteraction) {
      if (activeInteraction.workloadId) {
        const byId = pool.find((w) => w.id.toLowerCase() === activeInteraction.workloadId!.toLowerCase());
        if (byId) return byId;
      }
      const matchHint = (activeInteraction.workloadName || activeInteraction.title || '').toLowerCase();
      if (matchHint) {
        const byName = pool.find(
          (w) =>
            matchHint === w.name.toLowerCase() ||
            matchHint.includes(w.name.toLowerCase()) ||
            w.name.toLowerCase().includes(matchHint),
        );
        if (byName) return byName;
      }
    }

    // 2. Fallback to explicitly selected workload or first workload in pool
    if (selectedWorkload) return selectedWorkload;
    return pool[0];
  }, [selectedWorkload, allWorkloads, activeInteraction]);

  const derivedSummary = useMemo(
    () => deriveEvidenceDrivenRecommendation(resolvedWorkload),
    [resolvedWorkload],
  );

  const lifecyclePreview = useMemo(
    () =>
      buildDefaultLifecycleState(
        resolvedWorkload,
        metrics?.disposition || derivedSummary.recommended6R,
        isGovernanceApproved,
      ),
    [resolvedWorkload, metrics?.disposition, derivedSummary.recommended6R, isGovernanceApproved],
  );

  // Honest 6R comparison rows: real computed confidence ONLY for Recommended 6R; zero arbitrary bar widths for alternatives
  const calibrated6RRows = useMemo(() => {
    if (!metrics) return [];
    const primaryPlain = PLAIN_ENGLISH_6R[metrics.disposition] || PLAIN_ENGLISH_6R.Replatform;
    const primaryRow = {
      disposition: metrics.disposition,
      plainEnglish: primaryPlain.shortAction,
      isRecommended: true,
      barWidth: Math.max(20, Math.min(100, metrics.confidence)),
      scoreLabel: `${metrics.confidence}% grounded`,
      rationale: derivedSummary.topReasons[0],
    };
    const altRows = derivedSummary.alternatives
      .filter((a) => a.disposition !== metrics.disposition)
      .map((alt) => ({
        disposition: alt.disposition,
        plainEnglish: alt.plainEnglish,
        isRecommended: false,
        barWidth: null as number | null,
        scoreLabel: 'Not selected',
        rationale: alt.whyNot,
      }));
    return [primaryRow, ...altRows];
  }, [metrics, derivedSummary]);

  const handleDraftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftContent.trim() || isProcessing) return;

    const contentToSubmit = draftContent;
    try {
      await onSaveNew({
        content: contentToSubmit,
        mode: 'assess',
      });
      setDraftContent('');
    } catch {
      // Keep draft in buffer on error
    }
  };

  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpInput.trim() || !activeInteraction || isProcessing) return;

    const message = followUpInput.trim();
    try {
      setFollowUpInput('');
      await onSendFollowUp(activeInteraction.id, message);
    } catch {
      setFollowUpInput(message);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleDraftSubmit(e);
    }
  };

  const get6RBadgeStyle = (disposition: string) => {
    switch (disposition?.toLowerCase()) {
      case 'replatform':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/30';
      case 'refactor':
        return 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-500/30';
      case 'rehost':
        return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30';
      case 'repurchase':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30';
      case 'retire':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30';
      case 'retain':
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/15 dark:text-slate-300 dark:border-slate-500/30';
      default:
        return 'bg-[var(--emos-accent-subtle)] text-[var(--emos-accent-text)] border-[var(--emos-accent-border)]';
    }
  };

  return (
    <div id="modernization-workspace" className="flex-1 flex flex-col h-full lg:h-[calc(100vh-3.5rem)] bg-[var(--emos-bg)] overflow-hidden text-[var(--emos-text-primary)] transition-colors">
      {/* Error / Sync Banner (rendered ONLY when saving, saved, or error — eliminates permanent 36px idle chrome) */}
      {saveStatus !== 'idle' && (
        <div className="px-4 sm:px-6 py-2 border-b border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] flex items-center justify-between text-xs shrink-0">
          <div className="flex items-start gap-2 min-w-0">
            {saveStatus === 'saving' && (
              <span className="inline-flex items-center gap-2 text-[var(--emos-text-secondary)] truncate">
                <span className="w-2 h-2 rounded-full bg-[#4648D4] animate-pulse shrink-0" />
                Processing Assessment Securely...
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium truncate">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                Assessment Synced &amp; Isolated to Firestore
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="inline-flex items-start gap-1.5 text-rose-600 dark:text-rose-400 font-medium whitespace-normal leading-5" role="alert">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>
                  {errorKind === 'reasoning' ? 'AI reasoning unavailable — ' : errorKind === 'guardrail' ? 'Guardrail rejected — ' : 'Sync issue — '}
                  {errorMessage || (errorKind === 'reasoning'
                    ? 'Your saved assessment data is unaffected. Try again from the message box.'
                    : errorKind === 'guardrail'
                    ? 'The AI response did not satisfy EMOS decision guardrails. No assessment changes were saved.'
                    : 'Could not save assessment to Firestore.')}
                </span>
              </span>
            )}
          </div>
          {saveStatus === 'error' && errorKind !== 'reasoning' && errorKind !== 'guardrail' && activeInteraction && onRetrySave && (
            <button
              id="retry-save-btn"
              onClick={() => onRetrySave(activeInteraction)}
              className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer hover:bg-rose-700 shrink-0"
            >
              <RotateCcw className="w-3 h-3" /> Retry Save
            </button>
          )}
        </div>
      )}

      {/* Main Workspace Body */}
      {activeInteraction ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Single Compact Assessment Header (eliminates redundant 44px Executive 6R Decision Bar) */}
          <div className="px-4 sm:px-6 lg:px-8 py-3 bg-[var(--emos-surface)] border-b border-[var(--emos-border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <JourneyStage stage="Decide" question="What should we do with this workload, and why?" />
                {metrics && (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold ${
                      metrics.readiness === 'READY'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30'
                        : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30'
                    }`}
                  >
                    {metrics.readiness === 'READY' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    <span>{metrics.completeness}% DNA · {metrics.readiness}</span>
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-display font-bold tracking-tight text-[var(--emos-text-primary)] truncate">
                {activeInteraction.title}
              </h2>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {onOpenDna && (activeInteraction.workloadId || activeInteraction.workloadName) && (
                <button
                  id="header-view-dna-btn"
                  onClick={() => onOpenDna(activeInteraction.workloadId || activeInteraction.workloadName || '')}
                  className="h-8 px-3 rounded-lg border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] hover:bg-[var(--emos-surface-hover)] text-[var(--emos-accent-text)] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="View Structured Enterprise DNA Evidence Profile"
                >
                  <Dna className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">View Evidence</span>
                </button>
              )}

              <button
                id="copy-assessment-btn"
                onClick={() =>
                  copyToClipboard(
                    `# ${activeInteraction.title}\n\n## Modernization Scope & Evidence:\n${activeInteraction.content}\n\n## EMOS Assessment:\n${activeInteraction.geminiResponse}`,
                    'full'
                  )
                }
                className="h-8 px-3 rounded-lg border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] hover:bg-[var(--emos-surface-hover)] text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedId === 'full' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === 'full' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {activeInteraction.trustIndicators?.wasRepaired && (
            <div className="px-4 sm:px-6 lg:px-8 py-1.5 bg-amber-50/70 dark:bg-amber-500/10 border-b border-amber-200 dark:border-amber-500/30 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-1.5 shrink-0">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Taxonomy Guardrail: Output repaired to adhere strictly to canonical 6R enterprise standard.</span>
            </div>
          )}

          {/* Wide 12-Column Stitch Executive Decision Canvas */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-[1400px] mx-auto space-y-6">
              {metrics && (() => {
                const plainInfo = PLAIN_ENGLISH_6R[metrics.disposition] || PLAIN_ENGLISH_6R.Replatform;
                const targetCloudField = resolvedWorkload.dna.targetState.find((f) => f.id === 'ts1');
                const targetArchField = resolvedWorkload.dna.targetState.find((f) => f.id === 'ts2');
                const downtimeField = resolvedWorkload.dna.targetState.find((f) => f.id === 'ts3');

                return (
                  <>
                    {/* Contextual Sub-Navigation (shown inline only when rendered standalone outside WorkspaceShell) */}
                    {!onChangeDecideTab && (
                      <nav aria-label="Decision sections" className="inline-flex flex-wrap items-center gap-1 p-1 rounded-lg border border-[var(--emos-border-subtle)] bg-[var(--emos-bg-tertiary)] text-xs">
                        {(
                          [
                            ['recommendation', 'Recommendation'],
                            ['evidence', 'Evidence'],
                            ['alternatives', 'Alternatives'],
                            ['approval', 'Approval'],
                          ] as const
                        ).map(([id, label]) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setDecideTab(id)}
                            className={`h-7 px-3 rounded-md font-medium transition-colors cursor-pointer ${
                              currentDecideTab === id
                                ? 'bg-[var(--emos-surface)] text-[var(--emos-accent-text)] font-semibold shadow-2xs ring-1 ring-[var(--emos-border-subtle)]'
                                : 'text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)]'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </nav>
                    )}

                    {/* TAB 1: RECOMMENDATION (Default — Takeaway → Top 3 Proof Points → Action) */}
                    {currentDecideTab === 'recommendation' && (
                      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
                        <section
                          aria-label="Executive Decision Summary"
                          className="xl:col-span-7 stitch-card p-5 sm:p-6 flex flex-col justify-between space-y-5"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  Recommended Disposition
                                </span>
                                <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-bold uppercase ${get6RBadgeStyle(metrics.disposition)}`}>
                                  {metrics.disposition}
                                </span>
                                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[var(--emos-text-muted)]">
                                  <span>{metrics.completeness}%</span>
                                  <span>DNA ·</span>
                                  <span>{metrics.readiness}</span>
                                </span>
                              </div>

                              <h3 className="font-display text-2xl sm:text-3xl font-bold text-[var(--emos-text-primary)] tracking-tight">
                                {plainInfo.plainEnglish}
                              </h3>
                              <p className="text-xs sm:text-sm text-[var(--emos-text-secondary)]">
                                {resolvedWorkload.name} · {plainInfo.tagline}
                              </p>
                            </div>

                            <div className="px-4 py-3 rounded-xl bg-[var(--emos-accent-subtle)] border border-[var(--emos-accent-border)] text-center shrink-0 min-w-[130px]">
                              <span className="font-mono text-2xl font-bold text-[#4648D4] dark:text-[#818CF8] block tabular-nums">
                                {metrics.confidence}%
                              </span>
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--emos-accent-text)]">
                                Grounded Score
                              </span>
                            </div>
                          </div>

                          <div className="p-3.5 rounded-xl bg-[var(--emos-bg)] border border-[var(--emos-border-subtle)] text-xs">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--emos-text-muted)] font-semibold block">
                              Expected Business Impact
                            </span>
                            <span className="font-semibold text-[var(--emos-text-primary)] mt-1 block">
                              {derivedSummary.expectedImpact}
                            </span>
                          </div>

                          {/* ONE Primary CTA + Max 2 Secondary Actions */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--emos-border-subtle)]">
                            <div>
                              {metrics.readiness === 'READY' ? (
                                !isGovernanceApproved ? (
                                  <button
                                    id="approve-governance-decision-btn"
                                    type="button"
                                    onClick={() => onApproveGovernance?.(resolvedWorkload.id, metrics.disposition)}
                                    className="h-9 px-4 rounded-lg bg-[#4648D4] hover:bg-[#3B3DC2] text-white text-xs font-semibold inline-flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
                                  >
                                    <ShieldCheck className="w-4 h-4" />
                                    <span>Approve Decision &amp; Proceed to Plan/Execute</span>
                                  </button>
                                ) : (
                                  <button
                                    id="proceed-to-execution-btn"
                                    type="button"
                                    onClick={onOpenPlanAndExecute}
                                    className="h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
                                  >
                                    <Route className="w-4 h-4" />
                                    <span>Approved · Open Transformation Execution</span>
                                    <ArrowRight className="w-4 h-4" />
                                  </button>
                                )
                              ) : (
                                <button
                                  id="remediate-evidence-cta-btn"
                                  type="button"
                                  onClick={() => onOpenDna?.(activeInteraction.workloadId || activeInteraction.workloadName || resolvedWorkload.id)}
                                  className="h-9 px-4 rounded-lg bg-[#4648D4] hover:bg-[#3B3DC2] text-white text-xs font-semibold inline-flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
                                >
                                  <Dna className="w-4 h-4" />
                                  <span>Review Decision &amp; Verify Missing Evidence</span>
                                </button>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setDecideTab('alternatives')}
                                className="h-8 px-3 rounded-lg border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] hover:bg-[var(--emos-surface-hover)] text-xs font-semibold text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)] cursor-pointer transition-colors"
                              >
                                Compare All 6R Options
                              </button>
                              <button
                                type="button"
                                onClick={() => setDecideTab('evidence')}
                                className="h-8 px-3 rounded-lg border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] hover:bg-[var(--emos-surface-hover)] text-xs font-semibold text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)] cursor-pointer transition-colors"
                              >
                                Inspect Evidence
                              </button>
                              {onAskAgent && (
                                <button
                                  type="button"
                                  onClick={() => onAskAgent(`Why are you recommending ${metrics.disposition}?`)}
                                  className="px-2 py-1 text-xs font-medium text-[var(--emos-accent-text)] hover:underline cursor-pointer"
                                >
                                  Why {metrics.disposition}? ↗
                                </button>
                              )}
                            </div>
                          </div>
                        </section>

                        <section className="xl:col-span-5 stitch-card p-5 space-y-3.5">
                          <h3 className="font-display text-sm font-bold text-[var(--emos-text-primary)]">
                            Why? (Top 3 Evidence-Backed Reasons)
                          </h3>
                          <ol className="space-y-2.5">
                            {derivedSummary.topReasons.map((reason, idx) => (
                              <li
                                key={idx}
                                className="p-3.5 rounded-xl bg-[var(--emos-bg)] border border-[var(--emos-border-subtle)] space-y-1"
                              >
                                <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-[#4648D4] dark:text-[#818CF8]">
                                  <span>0{idx + 1}</span>
                                  <span className="uppercase tracking-wider">Grounded Proof Point</span>
                                </div>
                                <p className="text-xs text-[var(--emos-text-primary)] leading-relaxed">
                                  {reason}
                                </p>
                              </li>
                            ))}
                          </ol>
                        </section>
                      </div>
                    )}

                    {/* TAB 2: EVIDENCE (Completeness, Missing Evidence, Architecture Vector) */}
                    {currentDecideTab === 'evidence' && (
                      <div className="space-y-5">
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
                          <section className="xl:col-span-5 stitch-card p-5 flex flex-col justify-between space-y-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--emos-text-muted)]">
                                  Evidence Completeness
                                </span>
                                <span className="px-2 py-0.5 rounded bg-[var(--emos-bg)] border border-[var(--emos-border-subtle)] text-[10px] font-mono text-[var(--emos-text-secondary)]">
                                  {resolvedWorkload.businessCriticality} Criticality
                                </span>
                              </div>
                              <h4 className="font-display text-lg font-bold text-[var(--emos-text-primary)]">
                                {resolvedWorkload.name}
                              </h4>
                              <p className="text-xs text-[var(--emos-text-secondary)]">
                                {resolvedWorkload.businessCapability} · {resolvedWorkload.currentStack}
                              </p>
                            </div>

                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-[var(--emos-text-muted)] font-medium">Verified DNA</span>
                                <span className="font-mono font-bold text-[#4648D4] dark:text-[#818CF8]">{metrics.completeness}%</span>
                              </div>
                              <div className="relative h-2 rounded-full bg-[var(--emos-bg-tertiary)] overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${metrics.readiness === 'READY' ? 'bg-emerald-500' : 'bg-[#4648D4]'}`}
                                  style={{ width: `${metrics.completeness}%` }}
                                />
                              </div>
                              <div className="flex justify-between text-[10px] font-mono text-[var(--emos-text-muted)]">
                                <span>0%</span>
                                <span>70% Gate Threshold</span>
                                <span>100%</span>
                              </div>
                            </div>

                            {derivedSummary.criticalGaps.length > 0 ? (
                              <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 space-y-1.5 text-xs">
                                <p className="font-semibold text-amber-800 dark:text-amber-300">Missing Critical Evidence</p>
                                <ul className="list-disc list-inside text-[11px] text-[var(--emos-text-secondary)] space-y-0.5">
                                  {derivedSummary.criticalGaps.map((g) => (
                                    <li key={g}>{g}</li>
                                  ))}
                                </ul>
                              </div>
                            ) : (
                              <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                                All critical Dependency, Economics, and Target-State evidence verified.
                              </div>
                            )}

                            {onOpenDna && (
                              <button
                                type="button"
                                onClick={() => onOpenDna(resolvedWorkload.id)}
                                className="h-9 px-4 rounded-lg bg-[#4648D4] hover:bg-[#3B3DC2] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                              >
                                <Dna className="w-3.5 h-3.5" />
                                <span>{derivedSummary.criticalGaps.length > 0 ? 'Resolve Evidence Gaps in DNA' : 'Inspect Enterprise DNA'}</span>
                              </button>
                            )}
                          </section>

                          <section className="xl:col-span-7 stitch-card p-5 space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <h3 className="font-display text-sm font-bold text-[var(--emos-text-primary)]">
                                  Architecture Modernization Vector
                                </h3>
                                <p className="text-xs text-[var(--emos-text-secondary)]">
                                  Current state vs. governed target direction derived from verified Enterprise DNA.
                                </p>
                              </div>
                              <span className="px-2.5 py-0.5 rounded-full bg-[var(--emos-accent-subtle)] text-[10px] font-mono font-semibold text-[var(--emos-accent-text)]">
                                {metrics.disposition} · {plainInfo.shortAction}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-stretch">
                              <div className="md:col-span-5 p-4 rounded-xl bg-[var(--emos-bg)] border border-[var(--emos-border-subtle)] space-y-2.5">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--emos-text-muted)] inline-flex items-center gap-1.5">
                                  <Server className="w-3.5 h-3.5" /> Current State
                                </span>
                                <p className="text-xs font-semibold text-[var(--emos-text-primary)] leading-relaxed">
                                  {lifecyclePreview.currentArchSummary}
                                </p>
                                <div className="space-y-1 pt-2 border-t border-[var(--emos-border-subtle)] text-[11px] text-[var(--emos-text-secondary)]">
                                  <p><strong>Stack:</strong> {resolvedWorkload.currentStack}</p>
                                  <p><strong>Hosting:</strong> {resolvedWorkload.hosting}</p>
                                  <p><strong>Dependencies:</strong> {resolvedWorkload.knownDependencies}</p>
                                </div>
                              </div>

                              <div className="md:col-span-1 flex items-center justify-center">
                                <div className="w-8 h-8 rounded-full bg-[var(--emos-accent-subtle)] border border-[var(--emos-accent-border)] text-[#4648D4] dark:text-[#818CF8] flex items-center justify-center">
                                  <ArrowRight className="w-4 h-4 rotate-90 md:rotate-0" />
                                </div>
                              </div>

                              <div className="md:col-span-5 p-4 rounded-xl bg-indigo-50/40 dark:bg-indigo-500/10 border border-[var(--emos-accent-border)] space-y-2.5">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--emos-accent-text)] inline-flex items-center gap-1.5">
                                  <Cloud className="w-3.5 h-3.5" /> Target Direction
                                </span>
                                <p className="text-xs font-semibold text-[var(--emos-text-primary)] leading-relaxed">
                                  {lifecyclePreview.targetArchSummary}
                                </p>
                                <div className="space-y-1 pt-2 border-t border-[var(--emos-accent-border)]/60 text-[11px] text-[var(--emos-text-secondary)]">
                                  <p><strong>Target Platform:</strong> {targetCloudField?.value || 'Unverified'}</p>
                                  <p><strong>Constraints:</strong> {targetArchField?.value || 'Unverified'}</p>
                                  <p><strong>Downtime:</strong> {downtimeField?.value || 'Unverified'}</p>
                                </div>
                              </div>
                            </div>
                          </section>
                        </div>
                      </div>
                    )}

                    {/* TAB 3: ALTERNATIVES (All 6 Canonical 6R Options — Honest Comparison) */}
                    {currentDecideTab === 'alternatives' && (
                      <section className="stitch-card p-5 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <h3 className="font-display text-sm font-bold text-[var(--emos-text-primary)]">
                              Why Not the Alternative 6R Dispositions?
                            </h3>
                            <p className="text-xs text-[var(--emos-text-secondary)]">
                              All six canonical modernization paths evaluated against current Enterprise DNA evidence.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setDecideTab('recommendation')}
                            className="text-xs font-semibold text-[#4648D4] dark:text-[#818CF8] hover:underline cursor-pointer"
                          >
                            ← Back to Recommendation
                          </button>
                        </div>

                        <div className="divide-y divide-[var(--emos-border-subtle)]">
                          {calibrated6RRows.map((row) => (
                            <div key={row.disposition} className={`py-3 first:pt-0 last:pb-0 space-y-1.5 ${row.isRecommended ? '' : 'opacity-85'}`}>
                              <div className="flex items-center justify-between gap-2 text-xs">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span
                                    className={`px-2 py-0.5 rounded-md border text-[11px] font-mono font-bold uppercase ${
                                      row.isRecommended
                                        ? get6RBadgeStyle(row.disposition)
                                        : 'bg-[var(--emos-bg)] border-[var(--emos-border-subtle)] text-[var(--emos-text-secondary)]'
                                    }`}
                                  >
                                    {row.disposition}
                                  </span>
                                  <span className="font-semibold text-[var(--emos-text-primary)] truncate">
                                    {row.plainEnglish}
                                  </span>
                                  {row.isRecommended && (
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-semibold uppercase tracking-wider">
                                      Recommended
                                    </span>
                                  )}
                                </div>
                                <span
                                  className={`font-mono text-[11px] font-semibold shrink-0 ${
                                    row.isRecommended ? 'text-emerald-700 dark:text-emerald-400' : 'text-[var(--emos-text-muted)]'
                                  }`}
                                >
                                  {row.scoreLabel}
                                </span>
                              </div>

                              {row.isRecommended && row.barWidth !== null && (
                                <div className="h-1.5 w-full rounded-full bg-[var(--emos-bg-tertiary)] overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-emerald-600 transition-all duration-300"
                                    style={{ width: `${row.barWidth}%` }}
                                  />
                                </div>
                              )}

                              <p className="text-xs text-[var(--emos-text-secondary)] leading-relaxed">
                                {row.rationale}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="pt-3 border-t border-[var(--emos-border-subtle)] flex flex-wrap items-center justify-between gap-3">
                          {metrics.readiness === 'READY' ? (
                            !isGovernanceApproved ? (
                              <button
                                type="button"
                                onClick={() => onApproveGovernance?.(resolvedWorkload.id, metrics.disposition)}
                                className="h-9 px-4 rounded-lg bg-[#4648D4] hover:bg-[#3B3DC2] text-white text-xs font-semibold inline-flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
                              >
                                <ShieldCheck className="w-4 h-4" />
                                <span>Approve Decision &amp; Proceed to Plan/Execute</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={onOpenPlanAndExecute}
                                className="h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
                              >
                                <Route className="w-4 h-4" />
                                <span>Approved · Open Transformation Execution</span>
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            )
                          ) : (
                            <button
                              type="button"
                              onClick={() => onOpenDna?.(resolvedWorkload.id)}
                              className="h-9 px-4 rounded-lg bg-[#4648D4] hover:bg-[#3B3DC2] text-white text-xs font-semibold inline-flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
                            >
                              <Dna className="w-4 h-4" />
                              <span>Review Decision &amp; Verify Missing Evidence</span>
                            </button>
                          )}
                        </div>
                      </section>
                    )}

                    {/* TAB 4: APPROVAL (Human Governance & Decision Commitment Gate) */}
                    {currentDecideTab === 'approval' && (
                      <section className="stitch-card p-5 space-y-4">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-display text-sm font-bold text-[var(--emos-text-primary)] inline-flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-[#4648D4] dark:text-[#818CF8]" />
                            <span>Governance &amp; Decision Commitment Gate</span>
                          </h3>
                          <span className="text-[10px] font-mono uppercase text-[var(--emos-text-muted)]">
                            Agent → EMOS → Human
                          </span>
                        </div>

                        <div className="divide-y divide-[var(--emos-border-subtle)] text-xs">
                          {[
                            {
                              label: 'Structured 18-Attribute Evidence Check',
                              detail: `${metrics.completeness}% verified in Enterprise DNA`,
                              done: metrics.completeness >= 70,
                              statusText: metrics.completeness >= 70 ? 'VERIFIED' : 'BELOW 70%',
                            },
                            {
                              label: 'Deterministic Readiness Gate',
                              detail: derivedSummary.criticalGaps.length === 0 ? 'Zero blocking critical gaps' : `${derivedSummary.criticalGaps.length} critical gap(s) open`,
                              done: metrics.readiness === 'READY',
                              statusText: metrics.readiness,
                            },
                            {
                              label: 'Human Architect Approval',
                              detail: isGovernanceApproved ? 'Approved to proceed into Plan & Execute' : 'Awaiting explicit human sign-off',
                              done: isGovernanceApproved,
                              statusText: isGovernanceApproved ? 'APPROVED' : 'ACTION NEEDED',
                            },
                          ].map((gate) => (
                            <div key={gate.label} className="py-2.5 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5 min-w-0">
                                {gate.done ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                ) : (
                                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                                )}
                                <div className="min-w-0">
                                  <p className="font-semibold text-[var(--emos-text-primary)]">{gate.label}</p>
                                  <p className="text-[11px] text-[var(--emos-text-secondary)] truncate">{gate.detail}</p>
                                </div>
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 ${
                                  gate.done
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                                    : 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
                                }`}
                              >
                                {gate.statusText}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-3 border-t border-[var(--emos-border-subtle)] flex flex-wrap items-center justify-between gap-3">
                          {metrics.readiness === 'READY' ? (
                            !isGovernanceApproved ? (
                              <button
                                type="button"
                                onClick={() => onApproveGovernance?.(resolvedWorkload.id, metrics.disposition)}
                                className="h-9 px-4 rounded-lg bg-[#4648D4] hover:bg-[#3B3DC2] text-white text-xs font-semibold inline-flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
                              >
                                <ShieldCheck className="w-4 h-4" />
                                <span>Approve Decision</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={onOpenPlanAndExecute}
                                className="h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
                              >
                                <Route className="w-4 h-4" />
                                <span>Continue to Plan</span>
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            )
                          ) : (
                            <button
                              type="button"
                              onClick={() => onOpenDna?.(resolvedWorkload.id)}
                              className="h-9 px-4 rounded-lg bg-[#4648D4] hover:bg-[#3B3DC2] text-white text-xs font-semibold inline-flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
                            >
                              <Dna className="w-4 h-4" />
                              <span>Resolve Blocking Evidence Gate</span>
                            </button>
                          )}
                        </div>
                      </section>
                    )}
                  </>
                );
              })()}

              {/* Progressive Disclosure: User Workload Evidence (Collapsed by default per tests/journey.ux.test.tsx) */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2">
                  <button
                    id="toggle-workload-evidence-btn"
                    type="button"
                    onClick={() => setIsEvidenceExpanded((expanded) => !expanded)}
                    aria-expanded={isEvidenceExpanded}
                    className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--emos-text-muted)] transition-colors hover:text-[var(--emos-text-primary)] cursor-pointer"
                  >
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isEvidenceExpanded ? 'rotate-180' : ''}`} aria-hidden="true" />
                    <span>{isEvidenceExpanded ? 'Hide' : 'Show'} Workload Evidence</span>
                  </button>
                  <div className="h-[1px] flex-1 bg-[var(--emos-border-subtle)]" />
                  <button
                    onClick={() => copyToClipboard(activeInteraction.content, 'user-initial')}
                    className="text-[var(--emos-text-muted)] hover:text-[var(--emos-text-primary)] p-1 transition-colors cursor-pointer"
                    title="Copy workload evidence"
                  >
                    {copiedId === 'user-initial' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {isEvidenceExpanded && (
                  <div className="stitch-card p-4 sm:p-5">
                    <p className="text-sm leading-relaxed text-[var(--emos-text-primary)] whitespace-pre-wrap font-sans">
                      {activeInteraction.content}
                    </p>
                  </div>
                )}
              </div>

              {/* Progressive Disclosure: Full Architectural Reasoning & Audit Record */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2">
                  <button
                    id="toggle-full-reasoning-btn"
                    type="button"
                    onClick={() => setIsFullReasoningExpanded((prev) => !prev)}
                    aria-expanded={isFullReasoningExpanded}
                    className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--emos-accent-text)] transition-colors hover:underline cursor-pointer"
                  >
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isFullReasoningExpanded ? 'rotate-180' : ''}`} aria-hidden="true" />
                    <span>{isFullReasoningExpanded ? 'Hide' : 'Show'} Full Architectural Reasoning &amp; Audit Record</span>
                  </button>
                  <div className="h-[1px] flex-1 bg-[var(--emos-border-subtle)]" />
                  <button
                    onClick={() => copyToClipboard(activeInteraction.geminiResponse, 'gemini-initial')}
                    className="text-[var(--emos-text-muted)] hover:text-[var(--emos-accent-text)] p-1 transition-colors cursor-pointer"
                    title="Copy assessment"
                  >
                    {copiedId === 'gemini-initial' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className={`stitch-card p-5 sm:p-6 relative transition-all ${!isFullReasoningExpanded ? 'max-h-52 overflow-hidden' : ''}`}>
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--emos-border-subtle)]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[var(--emos-text-primary)]">Modernization Agent · Gemini</span>
                      <span className="text-[10px] bg-[var(--emos-accent-subtle)] text-[var(--emos-accent-text)] px-2.5 py-0.5 rounded-full border border-[var(--emos-accent-border)] font-medium uppercase tracking-wider">
                        {activeInteraction.mode === 'options' ? 'Options Comparison' : activeInteraction.mode === 'decision' ? 'Executive Decision' : '6R Assessment'}
                      </span>
                    </div>
                    <span className="text-[11px] text-[var(--emos-text-muted)]">Canonical 6R Taxonomy</span>
                  </div>

                  <div className="text-sm leading-relaxed text-[var(--emos-text-primary)] font-sans space-y-3 prose dark:prose-invert max-w-none prose-headings:text-[var(--emos-text-primary)] prose-strong:text-[var(--emos-text-primary)] prose-a:text-[var(--emos-accent)] prose-p:text-[var(--emos-text-primary)] prose-li:text-[var(--emos-text-primary)]">
                    <SafeMarkdown>{activeInteraction.geminiResponse}</SafeMarkdown>
                  </div>

                  {!isFullReasoningExpanded && (
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[var(--emos-surface)] via-[var(--emos-surface)]/95 to-transparent flex items-end justify-center pb-3">
                      <button
                        type="button"
                        onClick={() => setIsFullReasoningExpanded(true)}
                        className="px-3.5 py-1.5 rounded-lg border border-[var(--emos-accent-border)] bg-[var(--emos-surface)] text-xs font-semibold text-[var(--emos-accent-text)] shadow-xs cursor-pointer hover:bg-[var(--emos-accent-subtle)]"
                      >
                        Expand Full 6-Part Architectural Analysis
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Subsequent Assessment Turns */}
              {activeInteraction.turns && activeInteraction.turns.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-[var(--emos-border-subtle)]">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-[0.15em] text-[var(--emos-text-muted)] font-semibold">
                      Assessment Dialogue &amp; Evidence Updates
                    </span>
                    <div className="h-[1px] flex-1 bg-[var(--emos-border-subtle)]" />
                  </div>

                  {activeInteraction.turns.map((turn, index) => {
                    const isUser = turn.role === 'user';
                    return (
                      <div key={index} className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-[10px] text-[var(--emos-text-muted)]">
                          <span className="uppercase tracking-wider font-semibold text-[var(--emos-text-secondary)]">
                            {isUser ? 'Architect / You' : 'EMOS Analysis'}
                          </span>
                          <span>
                            {new Date(turn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div
                          className={`p-4 rounded-xl border text-sm leading-relaxed ${
                            isUser
                              ? 'bg-[var(--emos-surface)] border-[var(--emos-border-subtle)]'
                              : 'bg-[var(--emos-surface-elevated)] border-[var(--emos-border-subtle)]'
                          }`}
                        >
                          {isUser ? (
                            <p className="whitespace-pre-wrap">{turn.content}</p>
                          ) : (
                            <div className="space-y-2 prose dark:prose-invert max-w-none prose-headings:text-[var(--emos-text-primary)] prose-p:text-[var(--emos-text-primary)] prose-li:text-[var(--emos-text-primary)]">
                              <SafeMarkdown>{turn.content}</SafeMarkdown>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Active processing indicator */}
              {isProcessing && (
                <div className="stitch-card p-4 flex items-center gap-3 animate-pulse">
                  <div className="w-4 h-4 border-2 border-[var(--emos-border-subtle)] border-t-[#4648D4] rounded-full animate-spin shrink-0" />
                  <span className="text-xs text-[var(--emos-text-secondary)]">
                    EMOS Modernization Agent is synthesizing workload evidence and evaluating 6R dispositions...
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Follow-up Question Composer */}
          <footer className="p-3.5 sm:px-6 border-t border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] shrink-0">
            <div className="max-w-[1400px] mx-auto">
              <div className="mb-2 flex flex-wrap items-center gap-2" aria-label="Suggested decision follow-ups">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--emos-text-muted)]">Next:</span>
                {FOLLOW_UP_SHORTCUTS.map(({ label, prompt, icon: Icon }) => (
                  <button
                    key={label}
                    type="button"
                    disabled={isProcessing}
                    onClick={() => {
                      setFollowUpInput(prompt);
                      followUpInputRef.current?.focus();
                    }}
                    className="inline-flex min-h-[30px] items-center gap-1.5 rounded-lg border border-[var(--emos-border-subtle)] bg-[var(--emos-bg)] px-2.5 py-1 text-[11px] font-medium text-[var(--emos-text-secondary)] transition-colors hover:border-[var(--emos-accent-border)] hover:text-[var(--emos-accent-text)] disabled:opacity-50 cursor-pointer"
                  >
                    <Icon className="h-3.5 w-3.5 text-[#4648D4] dark:text-[#818CF8]" aria-hidden="true" />
                    {label}
                  </button>
                ))}
              </div>
              <form onSubmit={handleFollowUpSubmit} className="relative">
                <input
                  id="followup-input"
                  ref={followUpInputRef}
                  type="text"
                  placeholder="Ask Modernization Agent or provide additional modernization evidence..."
                  value={followUpInput}
                  onChange={(e) => setFollowUpInput(e.target.value)}
                  disabled={isProcessing}
                  className="w-full bg-[var(--emos-input-bg)] border border-[var(--emos-border-subtle)] rounded-lg py-2.5 px-4 pr-12 text-sm focus:outline-hidden focus:border-[#4648D4] focus:ring-2 focus:ring-indigo-500/15 transition-colors placeholder-[var(--emos-text-muted)] text-[var(--emos-text-primary)] min-h-[42px]"
                />
                <button
                  id="followup-submit-btn"
                  type="submit"
                  disabled={!followUpInput.trim() || isProcessing}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#4648D4] text-white rounded-md flex items-center justify-center hover:bg-[#3B3DC2] disabled:opacity-40 transition-colors cursor-pointer"
                  title="Send Evidence Update"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </footer>
        </div>
      ) : (
        /* New Assessment Composer View */
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col items-center">
          <div className="w-full max-w-3xl space-y-6 my-auto py-4">
            <div className="flex justify-center">
              <JourneyStage stage="Decide" question="What should we do with this workload, and why?" />
            </div>

            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--emos-accent-subtle)] border border-[var(--emos-accent-border)] text-[11px] text-[var(--emos-accent-text)] font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>EMOS Modernization Workspace · Canonical 6R Engine</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-[var(--emos-text-primary)] tracking-tight">
                What workload would you like to assess?
              </h2>
              <p className="text-xs sm:text-sm text-[var(--emos-text-secondary)] max-w-xl mx-auto leading-relaxed">
                Evaluate workloads across canonical 6R dispositions grounded in deterministic Enterprise DNA evidence completeness.
              </p>
            </div>

            {selectedWorkload && (
              <div className="stitch-card p-4 border-[#4648D4]/40 bg-[var(--emos-accent-subtle)]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5 min-w-0">
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--emos-accent-text)]">
                    Selected Workload Context · {selectedWorkload.evidenceCompleteness}% DNA
                  </span>
                  <h4 className="text-sm font-display font-bold text-[var(--emos-text-primary)] truncate">
                    {selectedWorkload.name}
                  </h4>
                  <p className="text-[11px] text-[var(--emos-text-secondary)] truncate">
                    {selectedWorkload.businessCapability} · {selectedWorkload.currentStack}
                  </p>
                </div>
                <button
                  id="assess-selected-workload-cta"
                  type="button"
                  disabled={isProcessing}
                  onClick={() =>
                    void onSaveNew({
                      content: formatWorkloadDnaForAssessment(selectedWorkload),
                      mode: 'assess',
                      workloadId: selectedWorkload.id,
                    })
                  }
                  className="h-9 px-4 rounded-lg bg-[#4648D4] hover:bg-[#3B3DC2] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 shadow-xs transition-colors shrink-0 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Assess {selectedWorkload.name}</span>
                </button>
              </div>
            )}

            {onOpenPortfolio && (
              <div className="stitch-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--emos-accent-subtle)] border border-[var(--emos-accent-border)] flex items-center justify-center shrink-0 mt-0.5">
                    <Layers className="w-4 h-4 text-[#4648D4] dark:text-[#818CF8]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-[var(--emos-text-primary)]">
                      Start from Structured Enterprise DNA
                    </h4>
                    <p className="text-[11px] text-[var(--emos-text-secondary)] mt-0.5 leading-relaxed">
                      Explore candidate workloads across Apex Aerospace and Financial Services with deterministic evidence completeness profiles.
                    </p>
                  </div>
                </div>

                <button
                  id="composer-portfolio-btn"
                  type="button"
                  onClick={onOpenPortfolio}
                  className="h-8 px-3 rounded-lg border border-[var(--emos-accent-border)] bg-[var(--emos-accent-subtle)] hover:bg-[#4648D4] hover:text-white text-[var(--emos-accent-text)] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                >
                  <span>Sample Portfolio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-[0.14em] text-[var(--emos-text-muted)] font-semibold block">
                Modernization Prompt Starters
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {EMOS_PROMPT_STARTERS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setDraftContent(item.text);
                      textareaRef.current?.focus();
                    }}
                    className="stitch-card stitch-card-hover p-3.5 text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--emos-text-primary)] group-hover:text-[var(--emos-accent-text)] mb-1">
                      <Sparkles className="w-3 h-3 text-[#4648D4] dark:text-[#818CF8]" />
                      <span>{item.title}</span>
                    </div>
                    <p className="text-[11px] text-[var(--emos-text-secondary)] line-clamp-2 leading-relaxed">{item.text}</p>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleDraftSubmit} className="space-y-4">
              <div className="stitch-card focus-within:border-[#4648D4] overflow-hidden transition-all">
                <textarea
                  id="assessment-entry-textarea"
                  ref={textareaRef}
                  value={draftContent}
                  onChange={(e) => setDraftContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isProcessing}
                  placeholder="Describe the application or data platform to modernize (e.g., current stack, hosting environment, business criticality, infrastructure/licensing costs, and scaling constraints)... Press Ctrl+Enter or Cmd+Enter to assess..."
                  rows={6}
                  className="w-full p-4 text-sm text-[var(--emos-text-primary)] placeholder-[var(--emos-text-muted)] bg-transparent focus:outline-hidden resize-none leading-relaxed"
                />

                <div className="px-4 py-3 bg-[var(--emos-bg)] border-t border-[var(--emos-border-subtle)] flex items-center justify-between text-xs text-[var(--emos-text-muted)]">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="truncate font-mono text-[11px]">
                      {draftContent.length} chars · {draftContent.trim() ? draftContent.trim().split(/\s+/).length : 0} words
                    </span>
                    <span className="hidden sm:inline-flex items-center gap-1 text-[11px]">
                      <CornerDownLeft className="w-3 h-3" /> ⌘/Ctrl+Enter
                    </span>
                  </div>

                  <button
                    id="submit-assessment-btn"
                    type="submit"
                    disabled={!draftContent.trim() || isProcessing}
                    className="h-9 px-4 rounded-lg bg-[#4648D4] hover:bg-[#3B3DC2] text-white font-semibold text-xs flex items-center gap-2 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        <span>Analyzing Architecture...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Generate 6R Assessment</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
