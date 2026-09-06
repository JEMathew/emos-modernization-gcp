import React, { useState, useRef, useEffect, useMemo } from 'react';
import { SafeMarkdown } from './SafeMarkdown';
import {
  Sparkles,
  Send,
  ShieldCheck,
  AlertTriangle,
  CornerDownLeft,
  Clock,
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
  List
} from 'lucide-react';
import type { Interaction, AssessmentMode, Disposition6R, DecisionReadiness } from '../types';

interface ReflectionWorkspaceProps {
  activeInteraction: Interaction | null;
  onSaveNew: (params: {
    content: string;
    mode: AssessmentMode;
    workloadId?: string;
  }) => Promise<void>;
  onSendFollowUp: (interactionId: string, message: string) => Promise<void>;
  onRetrySave?: (interaction: Interaction) => Promise<void>;
  onOpenPortfolio?: () => void;
  onOpenDna?: (workloadNameOrId: string) => void;
  onToggleMobileHistory?: () => void;
  isProcessing: boolean;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  errorMessage: string | null;
}

// Canonical Prompt Starters specified in requirements
const EMOS_PROMPT_STARTERS = [
  {
    mode: 'assess' as AssessmentMode,
    title: 'Assess Legacy Application',
    text: "We have a business-critical Java 8 and Oracle application with high infrastructure costs and several downstream integrations. Assess it for modernization.",
    category: "Legacy Application"
  },
  {
    mode: 'assess' as AssessmentMode,
    title: 'Evaluate Data Platform',
    text: "We have an on-premises enterprise data warehouse with growing cost, scalability constraints and increasing demand for AI/ML workloads. Assess modernization options.",
    category: "Data Platform"
  },
  {
    mode: 'options' as AssessmentMode,
    title: 'Compare Modernization Options',
    text: "Help me compare the viable modernization strategies for this workload and explain the trade-offs.",
    category: "Architecture Review"
  },
  {
    mode: 'assess' as AssessmentMode,
    title: 'Identify Modernization Risks',
    text: "Identify the evidence gaps, dependencies and risks we should understand before making this modernization decision.",
    category: "Risk Assessment"
  },
];

export const ReflectionWorkspace: React.FC<ReflectionWorkspaceProps> = ({
  activeInteraction,
  onSaveNew,
  onSendFollowUp,
  onRetrySave,
  onOpenPortfolio,
  onOpenDna,
  onToggleMobileHistory,
  isProcessing,
  saveStatus,
  errorMessage,
}) => {
  const [draftContent, setDraftContent] = useState('');
  const [selectedMode, setSelectedMode] = useState<AssessmentMode>('assess');
  const [followUpInput, setFollowUpInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    if (activeInteraction) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeInteraction?.turns?.length, isProcessing]);

  // Render only complete, persisted canonical metrics; never infer a second assessment.
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

  // Handle draft submission
  const handleDraftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftContent.trim() || isProcessing) return;

    const contentToSubmit = draftContent;
    try {
      await onSaveNew({
        content: contentToSubmit,
        mode: selectedMode,
      });
      setDraftContent('');
    } catch {
      // Keep draft in buffer on error as mandated by directives
    }
  };

  // Handle follow up submission
  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpInput.trim() || !activeInteraction || isProcessing) return;

    const message = followUpInput.trim();
    try {
      setFollowUpInput('');
      await onSendFollowUp(activeInteraction.id, message);
    } catch {
      setFollowUpInput(message); // restore on error
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
        return 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30';
      case 'refactor':
        return 'bg-purple-500/10 text-purple-800 dark:text-purple-300 border-purple-500/30';
      case 'rehost':
        return 'bg-sky-500/10 text-sky-800 dark:text-sky-300 border-sky-500/30';
      case 'repurchase':
        return 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30';
      case 'retire':
        return 'bg-rose-500/10 text-rose-800 dark:text-rose-300 border-rose-500/30';
      case 'retain':
        return 'bg-stone-500/10 text-stone-800 dark:text-stone-300 border-stone-500/30';
      default:
        return 'bg-[var(--emos-accent-subtle)] text-[var(--emos-accent-text)] border-[var(--emos-accent-border)]';
    }
  };

  return (
    <div id="modernization-workspace" className="flex-1 flex flex-col h-full lg:h-[calc(100vh-4rem)] bg-[var(--emos-bg)] overflow-hidden text-[var(--emos-text-primary)] transition-colors">
      {/* Top Status & Sync Bar */}
      <div className="px-4 sm:px-6 py-2.5 border-b border-[var(--emos-border-subtle)] bg-[var(--emos-bg-secondary)] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 min-w-0">
          {saveStatus === 'saving' && (
            <span className="inline-flex items-center gap-2 text-[var(--emos-text-secondary)] truncate">
              <span className="w-2 h-2 rounded-full bg-[var(--emos-accent)] animate-pulse shrink-0" />
              Persisting Assessment to Cloud Firestore...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="inline-flex items-center gap-1.5 text-[var(--emos-accent)] font-medium truncate">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              Assessment Synced & Isolated to Firestore
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="inline-flex items-center gap-1.5 text-rose-500 font-medium truncate">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              Sync issue: {errorMessage || 'Could not save assessment to Firestore.'}
            </span>
          )}
          {saveStatus === 'idle' && (
            <span className="text-[var(--emos-text-muted)] text-[11px] uppercase tracking-wider flex items-center gap-1.5 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              EMOS Modernization Assessment • Canonical 6R Engine
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onToggleMobileHistory && (
            <button
              onClick={onToggleMobileHistory}
              className="lg:hidden px-2.5 py-1 rounded-lg border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] hover:bg-[var(--emos-surface-hover)] text-[var(--emos-text-secondary)] text-[11px] font-medium flex items-center gap-1 transition-colors"
            >
              <List className="w-3.5 h-3.5 text-[var(--emos-accent)]" />
              <span>History</span>
            </button>
          )}

          {saveStatus === 'error' && activeInteraction && onRetrySave && (
            <button
              id="retry-save-btn"
              onClick={() => onRetrySave(activeInteraction)}
              className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer hover:bg-rose-700"
            >
              <RotateCcw className="w-3 h-3" /> Retry Save
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace Body */}
      {activeInteraction ? (
        /* Active Modernization Assessment View */
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header of Active Assessment */}
          <div className="px-4 sm:px-8 py-3.5 sm:py-4 bg-[var(--emos-bg-secondary)] border-b border-[var(--emos-border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--emos-surface)] border border-[var(--emos-border-subtle)] text-[10px] text-[var(--emos-accent)] font-medium">
                  <span className="font-bold tracking-wider uppercase text-[var(--emos-accent-text)]">DECIDE</span>
                  <span className="text-[var(--emos-text-muted)]">•</span>
                  <span>What should we do with this workload, why, and how trustworthy is the decision?</span>
                </span>
                <span className="text-[11px] text-[var(--emos-text-muted)] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[var(--emos-text-muted)]" />
                  {new Date(activeInteraction.createdAt).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-serif font-semibold tracking-tight text-[var(--emos-text-primary)]">
                {activeInteraction.title}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {/* Journey Indicator */}
              <div className="hidden xl:flex items-center gap-1 text-[10px] text-[var(--emos-text-muted)] font-mono bg-[var(--emos-bg-tertiary)] px-2 py-1 rounded-lg border border-[var(--emos-border-subtle)] mr-1">
                <span>DISCOVER</span>
                <span>→</span>
                <span>UNDERSTAND</span>
                <span>→</span>
                <span className="text-[var(--emos-accent-text)] font-semibold bg-[var(--emos-accent-subtle)] px-1.5 py-0.5 rounded border border-[var(--emos-accent-border)]">DECIDE</span>
                <span>→</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">TRUST</span>
              </div>

              {onOpenDna && (activeInteraction.workloadId || activeInteraction.workloadName) && (
                <button
                  id="header-view-dna-btn"
                  onClick={() => onOpenDna(activeInteraction.workloadId || activeInteraction.workloadName || '')}
                  className="px-3 py-1.5 rounded-xl border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] hover:bg-[var(--emos-surface-hover)] hover:border-[var(--emos-accent-border)] text-[var(--emos-accent-text)] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer min-h-[36px]"
                  title="View Structured Enterprise DNA Evidence Profile"
                >
                  <Dna className="w-3.5 h-3.5 text-[var(--emos-accent)]" />
                  <span className="hidden sm:inline">Enterprise DNA</span>
                </button>
              )}

              {onOpenPortfolio && (
                <button
                  id="header-portfolio-btn"
                  onClick={onOpenPortfolio}
                  className="px-3 py-1.5 rounded-xl border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] hover:bg-[var(--emos-surface-hover)] hover:border-[var(--emos-border-strong)] text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer min-h-[36px]"
                  title="Return to Sample Enterprise Portfolio"
                >
                  <Layers className="w-3.5 h-3.5 text-[var(--emos-accent)]" />
                  <span className="hidden sm:inline">Portfolio</span>
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
                className="px-3 py-1.5 rounded-xl border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] hover:bg-[var(--emos-surface-hover)] hover:border-[var(--emos-border-strong)] text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer min-h-[36px]"
              >
                {copiedId === 'full' ? <Check className="w-3.5 h-3.5 text-[var(--emos-accent)]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === 'full' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Executive 6R Decision Bar (Visually Emphasized Metrics - Responsive Desktop/Tablet/Mobile) */}
          {metrics && (
            <div className="px-4 sm:px-8 py-3 bg-[var(--emos-bg-tertiary)] border-b border-[var(--emos-border-subtle)] shrink-0 transition-colors">
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-4 text-xs">
                {/* Recommended 6R */}
                <div className="p-2 sm:p-0 rounded-lg sm:rounded-none bg-[var(--emos-surface)] sm:bg-transparent border sm:border-0 border-[var(--emos-border-subtle)] flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-[var(--emos-text-muted)] font-semibold">Recommended 6R:</span>
                  <span className={`px-2.5 py-1 rounded-md border font-bold text-xs uppercase tracking-wider ${get6RBadgeStyle(metrics.disposition)}`}>
                    {metrics.disposition}
                  </span>
                </div>

                <div className="h-4 w-[1px] bg-[var(--emos-border-subtle)] hidden sm:block" />

                {/* Confidence Score */}
                <div className="p-2 sm:p-0 rounded-lg sm:rounded-none bg-[var(--emos-surface)] sm:bg-transparent border sm:border-0 border-[var(--emos-border-subtle)] flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-[var(--emos-text-muted)] font-semibold">Confidence:</span>
                  <span className="font-mono font-bold text-[var(--emos-text-primary)] bg-[var(--emos-surface)] px-2 py-0.5 rounded border border-[var(--emos-border-subtle)]">
                    {metrics.confidence}%
                  </span>
                </div>

                <div className="h-4 w-[1px] bg-[var(--emos-border-subtle)] hidden sm:block" />

                {/* Evidence Completeness */}
                <div className="p-2 sm:p-0 rounded-lg sm:rounded-none bg-[var(--emos-surface)] sm:bg-transparent border sm:border-0 border-[var(--emos-border-subtle)] flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-[var(--emos-text-muted)] font-semibold">Evidence:</span>
                  <span className="font-mono font-bold text-[var(--emos-accent-text)] bg-[var(--emos-surface)] px-2 py-0.5 rounded border border-[var(--emos-border-subtle)]">
                    {metrics.completeness}%
                  </span>
                </div>

                <div className="h-4 w-[1px] bg-[var(--emos-border-subtle)] hidden sm:block" />

                {/* Decision Readiness */}
                <div className="p-2 sm:p-0 rounded-lg sm:rounded-none bg-[var(--emos-surface)] sm:bg-transparent border sm:border-0 border-[var(--emos-border-subtle)] flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 col-span-1">
                  <span className="text-[10px] uppercase tracking-wider text-[var(--emos-text-muted)] font-semibold">Readiness:</span>
                  {metrics.readiness === 'READY' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[11px] font-bold tracking-wide">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> READY
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[11px] font-bold tracking-wide">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> NEEDS EVIDENCE
                    </span>
                  )}
                </div>

                <div className="h-4 w-[1px] bg-[var(--emos-border-subtle)] hidden sm:block" />

                {/* Guardrails Trust Indicator */}
                <div className="p-2 sm:p-0 rounded-lg sm:rounded-none bg-[var(--emos-surface)] sm:bg-transparent border sm:border-0 border-[var(--emos-border-subtle)] flex items-center gap-1.5 col-span-2 sm:col-span-1">
                  <span className="inline-flex items-center gap-1 text-[11px] text-[var(--emos-text-muted)] font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Guardrails Active</span>
                  </span>
                </div>
              </div>
              {activeInteraction.trustIndicators?.wasRepaired && (
                <div className="mt-2 text-[10px] text-[var(--emos-text-muted)] flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                  <span>Taxonomy Guardrail: Output repaired to adhere strictly to canonical 6R enterprise standard.</span>
                </div>
              )}
            </div>
          )}

          {/* Conversation & Assessment Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-3xl mx-auto w-full">
            {/* User Modernization Scope / Evidence */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--emos-text-muted)] font-semibold">
                  Modernization Scope & Evidence
                </span>
                <div className="h-[1px] flex-1 bg-[var(--emos-border-subtle)]" />
                <button
                  onClick={() => copyToClipboard(activeInteraction.content, 'user-initial')}
                  className="text-[var(--emos-text-muted)] hover:text-[var(--emos-text-primary)] p-1 transition-colors cursor-pointer"
                  title="Copy workload evidence"
                >
                  {copiedId === 'user-initial' ? <Check className="w-3.5 h-3.5 text-[var(--emos-accent)]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="p-4 sm:p-5 rounded-2xl bg-[var(--emos-surface)] border border-[var(--emos-border-subtle)]">
                <p className="text-sm sm:text-base leading-relaxed text-[var(--emos-text-primary)] whitespace-pre-wrap font-sans">
                  {activeInteraction.content}
                </p>
              </div>
            </div>

            {/* Initial Gemini Modernization Assessment */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--emos-accent)] font-semibold">
                  EMOS Modernization Assessment
                </span>
                <div className="h-[1px] flex-1 bg-[var(--emos-accent-border)]" />
                <button
                  onClick={() => copyToClipboard(activeInteraction.geminiResponse, 'gemini-initial')}
                  className="text-[var(--emos-text-muted)] hover:text-[var(--emos-accent)] p-1 transition-colors cursor-pointer"
                  title="Copy assessment"
                >
                  {copiedId === 'gemini-initial' ? <Check className="w-3.5 h-3.5 text-[var(--emos-accent)]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="bg-[var(--emos-surface-elevated)] border border-[var(--emos-border-subtle)] p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-md relative">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--emos-border-subtle)]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[var(--emos-text-primary)]">Gemini 3.6 Flash</span>
                    <span className="text-[10px] bg-[var(--emos-accent-subtle)] text-[var(--emos-accent-text)] px-2.5 py-0.5 rounded-full border border-[var(--emos-accent-border)] font-medium uppercase tracking-wider">
                      {activeInteraction.mode === 'options' ? 'Options Comparison' : activeInteraction.mode === 'decision' ? 'Executive Decision' : '6R Assessment'}
                    </span>
                  </div>
                  <span className="text-[11px] text-[var(--emos-text-muted)]">Canonical 6R Taxonomy</span>
                </div>

                <div className="text-sm sm:text-base leading-relaxed text-[var(--emos-text-primary)] font-sans space-y-3 prose dark:prose-invert max-w-none prose-headings:text-[var(--emos-text-primary)] prose-headings:font-serif prose-headings:tracking-tight prose-strong:text-[var(--emos-text-primary)] prose-a:text-[var(--emos-accent)] prose-p:text-[var(--emos-text-primary)] prose-li:text-[var(--emos-text-primary)]">
                  <SafeMarkdown>{activeInteraction.geminiResponse}</SafeMarkdown>
                </div>
              </div>
            </div>

            {/* Subsequent Assessment Turns */}
            {activeInteraction.turns && activeInteraction.turns.length > 0 && (
              <div className="space-y-5 pt-4 border-t border-[var(--emos-border-subtle)]">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--emos-text-muted)] font-semibold">
                    Assessment Dialogue & Evidence Updates
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
                        className={`p-4 sm:p-5 rounded-2xl border text-sm leading-relaxed ${
                          isUser
                            ? 'bg-[var(--emos-surface)] border-[var(--emos-border-subtle)] text-[var(--emos-text-primary)]'
                            : 'bg-[var(--emos-surface-elevated)] border-[var(--emos-border-subtle)] text-[var(--emos-text-primary)] relative shadow-sm'
                        }`}
                      >
                        {isUser ? (
                          <p className="whitespace-pre-wrap">{turn.content}</p>
                        ) : (
                          <div className="space-y-2 prose dark:prose-invert max-w-none prose-headings:text-[var(--emos-text-primary)] prose-headings:font-serif prose-p:text-[var(--emos-text-primary)] prose-li:text-[var(--emos-text-primary)]">
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
              <div className="p-5 rounded-2xl bg-[var(--emos-surface-elevated)] border border-[var(--emos-border-subtle)] flex items-center gap-3 animate-pulse">
                <div className="w-4 h-4 border-2 border-[var(--emos-border-subtle)] border-t-[var(--emos-accent)] rounded-full animate-spin shrink-0" />
                <span className="text-xs text-[var(--emos-text-secondary)]">
                  EMOS is synthesizing workload evidence and evaluating 6R modernization dispositions...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Follow-up Question Composer */}
          <footer className="p-4 sm:p-6 border-t border-[var(--emos-border-subtle)] bg-[var(--emos-bg-secondary)] shrink-0">
            <form onSubmit={handleFollowUpSubmit} className="max-w-3xl mx-auto w-full relative">
              <input
                id="followup-input"
                type="text"
                placeholder="Provide additional modernization evidence or ask about this decision..."
                value={followUpInput}
                onChange={(e) => setFollowUpInput(e.target.value)}
                disabled={isProcessing}
                className="w-full bg-[var(--emos-input-bg)] border border-[var(--emos-border-subtle)] rounded-2xl py-3 sm:py-3.5 px-5 pr-14 text-sm focus:outline-hidden focus:border-[var(--emos-accent)] focus:ring-1 focus:ring-[var(--emos-accent)] transition-colors placeholder-[var(--emos-text-muted)] text-[var(--emos-text-primary)] min-h-[44px]"
              />
              <button
                id="followup-submit-btn"
                type="submit"
                disabled={!followUpInput.trim() || isProcessing}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-[#A88554] text-black rounded-xl flex items-center justify-center hover:bg-[#BCA075] dark:hover:bg-[#E5C492] disabled:opacity-40 transition-colors cursor-pointer shadow-sm min-w-[36px] min-h-[36px]"
                title="Send Evidence Update"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <p className="text-center text-[10px] text-[var(--emos-text-muted)] mt-2.5">
              Canonical 6R Taxonomy: Retain • Retire • Rehost • Replatform • Refactor • Repurchase
            </p>
          </footer>
        </div>
      ) : (
        /* New Assessment Composer View */
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col items-center">
          <div className="w-full max-w-3xl space-y-6 sm:space-y-8 my-auto py-4 sm:py-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--emos-surface)] border border-[var(--emos-border-subtle)] text-[11px] text-[var(--emos-accent)] font-medium mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>EMOS Modernization Workspace • Enterprise Modernization Operating System</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-serif text-[var(--emos-text-primary)] tracking-tight">
                What workload would you like to assess?
              </h2>
              <p className="text-xs sm:text-sm text-[var(--emos-text-secondary)] max-w-xl mx-auto leading-relaxed">
                Turn fragmented enterprise modernization evidence into explainable, evidence-aware decisions. Assess workloads across canonical 6R dispositions grounded in deterministic Enterprise DNA evidence completeness.
              </p>
            </div>

            {/* Assessment Mode Selector */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 p-1.5 bg-[var(--emos-bg-tertiary)] border border-[var(--emos-border-subtle)] rounded-2xl max-w-lg mx-auto">
              <button
                id="mode-assess-btn"
                type="button"
                onClick={() => setSelectedMode('assess')}
                className={`py-2 px-2 sm:px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[38px] ${
                  selectedMode === 'assess'
                    ? 'bg-[var(--emos-surface)] text-[var(--emos-accent-text)] border border-[var(--emos-border-strong)] shadow-xs'
                    : 'text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)]'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--emos-accent)]" />
                <span>Assess</span>
              </button>
              <button
                id="mode-options-btn"
                type="button"
                onClick={() => setSelectedMode('options')}
                className={`py-2 px-2 sm:px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[38px] ${
                  selectedMode === 'options'
                    ? 'bg-[var(--emos-surface)] text-[var(--emos-accent-text)] border border-[var(--emos-border-strong)] shadow-xs'
                    : 'text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)]'
                }`}
              >
                <GitCompare className="w-3.5 h-3.5 text-[var(--emos-accent)]" />
                <span className="truncate">Options</span>
              </button>
              <button
                id="mode-decision-btn"
                type="button"
                onClick={() => setSelectedMode('decision')}
                className={`py-2 px-2 sm:px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[38px] ${
                  selectedMode === 'decision'
                    ? 'bg-[var(--emos-surface)] text-[var(--emos-accent-text)] border border-[var(--emos-border-strong)] shadow-xs'
                    : 'text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)]'
                }`}
              >
                <FileCheck2 className="w-3.5 h-3.5 text-[var(--emos-accent)]" />
                <span className="truncate">Decision</span>
              </button>
            </div>

            {/* Sample Portfolio Callout Banner */}
            {onOpenPortfolio && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[var(--emos-accent-subtle)] to-[var(--emos-surface-elevated)] border border-[var(--emos-accent-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[var(--emos-surface)] border border-[var(--emos-accent-border)] flex items-center justify-center shrink-0 mt-0.5">
                    <Layers className="w-4 h-4 text-[var(--emos-accent)]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-[var(--emos-text-primary)]">
                      Start from Structured Enterprise DNA
                    </h4>
                    <p className="text-[11px] text-[var(--emos-text-secondary)] mt-0.5 leading-relaxed">
                      Explore 3 candidate workloads with deterministic evidence completeness profiles, missing evidence gap tracking, and 1-click assessment.
                    </p>
                  </div>
                </div>

                <button
                  id="composer-portfolio-btn"
                  type="button"
                  onClick={onOpenPortfolio}
                  className="px-3.5 py-2 rounded-xl bg-[var(--emos-surface)] hover:bg-[var(--emos-surface-hover)] border border-[var(--emos-accent-border)] text-[var(--emos-accent-text)] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-xs min-h-[38px]"
                >
                  <span>Sample Portfolio</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[var(--emos-accent)]" />
                </button>
              </div>
            )}

            {/* Canonical Prompt Starters */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--emos-text-muted)] font-semibold block">
                Modernization Prompt Starters
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {EMOS_PROMPT_STARTERS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedMode(item.mode);
                      setDraftContent(item.text);
                      textareaRef.current?.focus();
                    }}
                    className="p-3.5 rounded-xl bg-[var(--emos-surface)] border border-[var(--emos-border-subtle)] hover:border-[var(--emos-accent-border)] hover:bg-[var(--emos-surface-hover)] text-left transition-all group cursor-pointer shadow-xs"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--emos-text-primary)] group-hover:text-[var(--emos-accent-text)] mb-1">
                      <Sparkles className="w-3 h-3 text-[var(--emos-accent)] group-hover:scale-110 transition-transform" />
                      <span>{item.title}</span>
                    </div>
                    <p className="text-[11px] text-[var(--emos-text-secondary)] line-clamp-2 leading-relaxed">{item.text}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Draft Textarea */}
            <form onSubmit={handleDraftSubmit} className="space-y-4">
              <div className="bg-[var(--emos-surface)] border border-[var(--emos-border-subtle)] focus-within:border-[var(--emos-accent)] rounded-2xl shadow-md overflow-hidden transition-all">
                <textarea
                  id="assessment-entry-textarea"
                  ref={textareaRef}
                  value={draftContent}
                  onChange={(e) => setDraftContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isProcessing}
                  placeholder="Describe the application or data platform to modernize (e.g., current stack, hosting environment, business criticality, infrastructure/licensing costs, and scaling constraints)... Press Ctrl+Enter or Cmd+Enter to assess..."
                  rows={7}
                  className="w-full p-4 sm:p-5 text-sm text-[var(--emos-text-primary)] placeholder-[var(--emos-text-muted)] bg-transparent focus:outline-hidden resize-none leading-relaxed"
                />

                <div className="px-4 sm:px-5 py-3 bg-[var(--emos-bg-tertiary)] border-t border-[var(--emos-border-subtle)] flex items-center justify-between text-xs text-[var(--emos-text-muted)]">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="truncate">
                      {draftContent.length} chars • {draftContent.trim() ? draftContent.trim().split(/\s+/).length : 0} words
                    </span>
                    <span className="hidden sm:inline text-[var(--emos-border-subtle)]">|</span>
                    <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-[var(--emos-text-muted)]">
                      <CornerDownLeft className="w-3 h-3 text-[var(--emos-text-muted)]" /> ⌘/Ctrl+Enter
                    </span>
                  </div>

                  <button
                    id="submit-assessment-btn"
                    type="submit"
                    disabled={!draftContent.trim() || isProcessing}
                    className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[#A88554] hover:bg-[#BCA075] dark:hover:bg-[#E5C492] text-black font-semibold text-xs sm:text-sm flex items-center gap-2 disabled:opacity-50 transition-all shadow-sm active:scale-98 cursor-pointer min-h-[38px]"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                        <span>Analyzing Architecture...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-black" />
                        <span>Assess with Gemini</span>
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
