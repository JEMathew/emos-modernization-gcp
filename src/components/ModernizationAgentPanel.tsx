import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Wrench,
  Eye,
  FileSearch,
  BrainCircuit,
  X,
} from 'lucide-react';
import type { EnterpriseWorkload, Interaction, Disposition6R } from '../types';
import { buildDefaultLifecycleState, type WorkloadLifecycleState } from '../lib/transformationEngine';
import { orchestrateAskEmos } from '../lib/agents/orchestrator';
import { askEmosWithGemini, type AskEmosApiResponse } from '../lib/gemini';
import type { AgentToolExecution, SpecialistAgentId } from '../lib/agents/types';
import { CapabilityCue } from './CapabilityCue';
import { SafeMarkdown } from './SafeMarkdown';

export type { AgentToolExecution };

let replySeq = 0;
function nextReplyId(): string {
  replySeq += 1;
  return `agent-reply-${Date.now()}-${replySeq}`;
}

export interface AgentReply {
  id: string;
  question: string;
  conclusion: string;
  bullets: string[];
  nextAction: string;
  evidenceSummary: string;
  reasoningSummary: string;
  toolsCalled: AgentToolExecution[];
  routedAgents?: SpecialistAgentId[];
  handoffOccurred?: boolean;
  governanceIntercepted?: boolean;
  timestamp: string;
  isLiveGemini?: boolean;
  isFallback?: boolean;
  fallbackNotice?: string;
}

interface ModernizationAgentPanelProps {
  workload: EnterpriseWorkload;
  activeInteraction?: Interaction | null;
  lifecycleState?: WorkloadLifecycleState;
  currentStage?: string;
  estateName?: string;
  pendingQuestion?: { id: number; text: string } | null;
  onSendLiveFollowUp?: (interactionId: string, message: string) => Promise<void>;
  askEmosEndpoint?: (params: {
    question: string;
    workload: EnterpriseWorkload;
    currentStage?: string;
    estateName?: string;
    activeInteraction?: Interaction | null;
  }) => Promise<AskEmosApiResponse>;
  onNavigateStage?: (stage: string) => void;
  isProcessing?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  variant?: 'docked' | 'drawer';
}

const CONTEXTUAL_QUESTION_GROUPS = [
  {
    group: 'Decision & Evidence',
    questions: [
      'Why are you recommending this?',
      'Why not another option?',
      'What evidence is missing?',
      'What would change your recommendation?',
      'What are the biggest risks?',
      'Which systems are affected?',
      'Explain this to a business executive.',
      'What should happen next?',
    ],
  },
  {
    group: 'Execution',
    questions: [
      'Why is this blocked?',
      'Which dependency is at risk?',
      'What should happen next in execution?',
    ],
  },
  {
    group: 'Outcomes & Learning',
    questions: [
      'Did we achieve the expected result?',
      'Why did observed results differ from target?',
      'What should we learn?',
    ],
  },
] as const;

export function runGovernedAgentQuery(
  question: string,
  workload: EnterpriseWorkload,
  lifecycle: WorkloadLifecycleState,
  activeInteraction?: Interaction | null,
  currentStage?: string,
): AgentReply {
  const result = orchestrateAskEmos({
    question,
    workload,
    lifecycle,
    activeInteraction,
    currentStage,
  });

  return {
    id: nextReplyId(),
    question: result.question,
    conclusion: result.conclusion,
    bullets: result.bullets,
    nextAction: result.nextAction,
    evidenceSummary: result.evidenceSummary,
    reasoningSummary: result.reasoningSummary,
    toolsCalled: result.toolsCalled,
    routedAgents: result.routedAgents,
    handoffOccurred: result.handoffOccurred,
    governanceIntercepted: result.governanceIntercepted,
    timestamp: result.timestamp,
    isLiveGemini: false,
  };
}

export const ModernizationAgentPanel: React.FC<ModernizationAgentPanelProps> = ({
  workload,
  activeInteraction,
  lifecycleState,
  currentStage,
  estateName,
  pendingQuestion,
  onSendLiveFollowUp,
  askEmosEndpoint = askEmosWithGemini,
  onNavigateStage,
  isProcessing = false,
  isOpen = true,
  onClose,
  variant = 'docked',
}) => {
  const computedLifecycle = useMemo(
    () =>
      lifecycleState ||
      buildDefaultLifecycleState(
        workload,
        activeInteraction?.recommended6R as Disposition6R | undefined,
      ),
    [workload, activeInteraction?.recommended6R, lifecycleState],
  );

  const [input, setInput] = useState('');
  const [isQueryingAi, setIsQueryingAi] = useState(false);
  const [activeGroup, setActiveGroup] = useState<number>(() =>
    currentStage === 'execute' ? 1 : currentStage === 'measure' || currentStage === 'learn' ? 2 : 0
  );
  const [replies, setReplies] = useState<AgentReply[]>(() => [
    runGovernedAgentQuery('Why are you recommending this?', workload, computedLifecycle, activeInteraction, currentStage),
  ]);
  const [expandedDetail, setExpandedDetail] = useState<Record<string, 'more' | 'evidence' | 'reasoning' | null>>({});
  const scrollEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentStage === 'execute') {
      setActiveGroup(1);
    } else if (currentStage === 'measure' || currentStage === 'learn') {
      setActiveGroup(2);
    } else if (currentStage) {
      setActiveGroup(0);
    }
  }, [currentStage]);

  const lastHandledQuestionIdRef = useRef<number | null>(null);

  useEffect(() => {
    setReplies([
      runGovernedAgentQuery('Why are you recommending this?', workload, computedLifecycle, activeInteraction, currentStage),
    ]);
    setExpandedDetail({});
  }, [workload.id, workload.evidenceCompleteness, computedLifecycle.disposition, computedLifecycle.governanceStatus]);

  const executeAsk = async (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed) return;
    setInput('');

    const baselineReply = runGovernedAgentQuery(trimmed, workload, computedLifecycle, activeInteraction, currentStage);

    // Deterministic governance interception runs before any server/LLM call
    if (baselineReply.governanceIntercepted) {
      setReplies((prev) => [...prev, baselineReply]);
      setTimeout(() => scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 60);
      return;
    }

    const pendingId = baselineReply.id;
    setReplies((prev) => [...prev, baselineReply]);
    setIsQueryingAi(true);
    try {
      const apiResult = await askEmosEndpoint({
        question: trimmed,
        workload,
        currentStage,
        estateName,
        activeInteraction,
      });

      const isFallback = apiResult.executionMode === 'deterministic-fallback';
      const updatedReply: AgentReply = {
        id: pendingId,
        question: apiResult.question || trimmed,
        conclusion: apiResult.conclusion,
        bullets: apiResult.bullets,
        nextAction: apiResult.nextAction,
        evidenceSummary: apiResult.evidenceSummary,
        reasoningSummary: apiResult.reasoningSummary,
        toolsCalled: apiResult.toolsCalled,
        routedAgents: apiResult.routedAgents,
        handoffOccurred: apiResult.handoffOccurred,
        governanceIntercepted: apiResult.governanceIntercepted,
        timestamp: apiResult.timestamp || baselineReply.timestamp,
        isLiveGemini: apiResult.executionMode === 'live-gemini',
        isFallback,
        fallbackNotice: isFallback
          ? 'AI reasoning unavailable. Showing deterministic EMOS status/evidence instead.'
          : undefined,
      };
      setReplies((prev) => prev.map((r) => (r.id === pendingId ? updatedReply : r)));
    } catch {
      // Explicit deterministic fallback contract — never silently pretend to be Gemini
      setReplies((prev) =>
        prev.map((r) =>
          r.id === pendingId
            ? {
                ...r,
                isLiveGemini: false,
                isFallback: true,
                fallbackNotice: 'AI reasoning unavailable. Showing deterministic EMOS status/evidence instead.',
              }
            : r,
        ),
      );
    } finally {
      setIsQueryingAi(false);
    }

    if (activeInteraction && onSendLiveFollowUp) {
      try {
        await onSendLiveFollowUp(activeInteraction.id, trimmed);
      } catch {
        // Non-blocking sync
      }
    }
    setTimeout(() => scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 60);
  };

  useEffect(() => {
    if (!pendingQuestion || lastHandledQuestionIdRef.current === pendingQuestion.id) return;
    lastHandledQuestionIdRef.current = pendingQuestion.id;
    void executeAsk(pendingQuestion.text);
  }, [pendingQuestion, workload, computedLifecycle, activeInteraction, currentStage]);

  if (!isOpen) return null;

  const handleAsk = async (questionText: string) => {
    await executeAsk(questionText);
  };

  const toggleDetail = (id: string, tab: 'more' | 'evidence' | 'reasoning') => {
    setExpandedDetail((prev) => ({
      ...prev,
      [id]: prev[id] === tab ? null : tab,
    }));
  };

  return (
    <aside
      aria-label="Modernization Agent"
      className={`flex flex-col bg-[var(--emos-bg)] text-[var(--emos-text-primary)] border-l border-[var(--emos-border-subtle)] ${
        variant === 'drawer' ? 'w-full max-w-md h-full shadow-2xl' : 'w-full lg:w-96 shrink-0 h-full'
      }`}
    >
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-[var(--emos-border-subtle)] flex items-center justify-between gap-2 bg-[var(--emos-surface)]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#4648D4] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <h3 className="text-xs font-bold tracking-wide text-[var(--emos-text-primary)] truncate">
                Modernization Agent
              </h3>
              <CapabilityCue cueId="modernization-agent" />
            </div>
            <p className="text-[10px] text-[var(--emos-text-muted)] truncate">
              Grounded in {workload.name} ({workload.evidenceCompleteness}% DNA)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
            <ShieldCheck className="w-3 h-3" />
            Bounded
          </span>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Modernization Agent panel"
              className="p-1 rounded-lg text-[var(--emos-text-muted)] hover:text-[var(--emos-text-primary)] hover:bg-[var(--emos-surface-hover)] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Governed Agent Boundary Notice */}
      <div className="px-4 py-2 bg-[var(--emos-bg-tertiary)] border-b border-[var(--emos-border-subtle)] flex items-center justify-between text-[10px] text-[var(--emos-text-secondary)]">
        <span>Agent Recommends → EMOS Validates → Human Approves</span>
        <span className="font-mono font-bold text-[var(--emos-accent-text)]">{computedLifecycle.plainEnglish}</span>
      </div>

      {/* Replies Stream */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
        {replies.map((reply) => {
          const activeTab = expandedDetail[reply.id] || null;
          return (
            <div
              key={reply.id}
              className="rounded-2xl border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] p-3.5 space-y-2.5 shadow-2xs"
            >
              {/* User Question */}
              <div className="flex items-center justify-between gap-2 text-[11px] font-semibold text-[var(--emos-accent-text)]">
                <span>Q: {reply.question}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {reply.isLiveGemini && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-[9px] font-mono text-emerald-700 dark:text-emerald-300">
                      Live Gemini
                    </span>
                  )}
                  <span className="text-[10px] font-normal text-[var(--emos-text-muted)]">{reply.timestamp}</span>
                </div>
              </div>

              {reply.isFallback && reply.fallbackNotice && (
                <div
                  role="status"
                  className="px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-[11px] text-amber-800 dark:text-amber-200 flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{reply.fallbackNotice}</span>
                </div>
              )}

              {/* 1 Insight (Conclusion + Max 3 Bullets) */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--emos-text-muted)] block">
                  Insight
                </span>
                <p className="text-xs font-semibold leading-relaxed text-[var(--emos-text-primary)]">
                  {reply.conclusion}
                </p>
                <ul className="space-y-1.5 text-xs text-[var(--emos-text-secondary)]">
                  {reply.bullets.map((b, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 leading-snug">
                      <span className="text-[var(--emos-accent)] font-bold mt-0.5">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 1 Recommended Next Action (Actionable when supported) */}
              <div className="p-2.5 rounded-xl bg-[var(--emos-accent-subtle)] border border-[var(--emos-accent-border)] text-[11px] space-y-2">
                <div>
                  <span className="font-bold uppercase tracking-wider text-[10px] text-[var(--emos-accent-text)] block">
                    Recommended Next Action
                  </span>
                  <span className="text-[var(--emos-text-primary)] font-medium mt-0.5 block">
                    {reply.nextAction}
                  </span>
                </div>
                {onNavigateStage && (
                  <button
                    type="button"
                    onClick={() => {
                      const actionLower = reply.nextAction.toLowerCase();
                      if (actionLower.includes('enterprise dna') || actionLower.includes('verify')) {
                        onNavigateStage('dna');
                      } else if (actionLower.includes('approval') || actionLower.includes('governance')) {
                        onNavigateStage('governance');
                      } else if (actionLower.includes('learning') || actionLower.includes('playbook')) {
                        onNavigateStage('learn');
                      } else {
                        onNavigateStage('execute');
                      }
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#4648D4] hover:bg-[#3B3DC2] text-white text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    <span>Take Recommended Action</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Progressive Disclosure Drill-Down Buttons: Explain More | Show Evidence | Show Reasoning */}
              <div className="pt-1.5 border-t border-[var(--emos-border-subtle)] flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => toggleDetail(reply.id, 'more')}
                  aria-expanded={activeTab === 'more'}
                  className={`px-2 py-1 rounded-lg text-[10px] font-semibold inline-flex items-center gap-1 border transition-colors cursor-pointer ${
                    activeTab === 'more'
                      ? 'bg-[var(--emos-accent-subtle)] border-[var(--emos-accent-border)] text-[var(--emos-accent-text)]'
                      : 'bg-[var(--emos-bg-tertiary)] border-[var(--emos-border-subtle)] text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)]'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>Explain More</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleDetail(reply.id, 'evidence')}
                  aria-expanded={activeTab === 'evidence'}
                  className={`px-2 py-1 rounded-lg text-[10px] font-semibold inline-flex items-center gap-1 border transition-colors cursor-pointer ${
                    activeTab === 'evidence'
                      ? 'bg-[var(--emos-accent-subtle)] border-[var(--emos-accent-border)] text-[var(--emos-accent-text)]'
                      : 'bg-[var(--emos-bg-tertiary)] border-[var(--emos-border-subtle)] text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)]'
                  }`}
                >
                  <FileSearch className="w-3 h-3" />
                  <span>Show Evidence</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleDetail(reply.id, 'reasoning')}
                  aria-expanded={activeTab === 'reasoning'}
                  className={`px-2 py-1 rounded-lg text-[10px] font-semibold inline-flex items-center gap-1 border transition-colors cursor-pointer ${
                    activeTab === 'reasoning'
                      ? 'bg-[var(--emos-accent-subtle)] border-[var(--emos-accent-border)] text-[var(--emos-accent-text)]'
                      : 'bg-[var(--emos-bg-tertiary)] border-[var(--emos-border-subtle)] text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)]'
                  }`}
                >
                  <BrainCircuit className="w-3 h-3" />
                  <span>Show Reasoning</span>
                </button>
              </div>

              {/* Drill-down Drawer Content */}
              {activeTab === 'more' && (
                <div className="p-2.5 rounded-xl bg-[var(--emos-bg-tertiary)] border border-[var(--emos-border-subtle)] text-[11px] text-[var(--emos-text-secondary)] space-y-1.5">
                  <p className="font-semibold text-[var(--emos-text-primary)]">Detailed Context</p>
                  <p>
                    Current State: <strong>{computedLifecycle.currentArchSummary}</strong>
                  </p>
                  <p>
                    Target State: <strong>{computedLifecycle.targetArchSummary}</strong>
                  </p>
                  {activeInteraction?.geminiResponse && (
                    <details className="mt-1">
                      <summary className="cursor-pointer font-semibold text-[var(--emos-accent-text)]">
                        View Full Gemini Narrative
                      </summary>
                      <div className="mt-2 max-h-48 overflow-y-auto text-[11px]">
                        <SafeMarkdown>{activeInteraction.geminiResponse}</SafeMarkdown>
                      </div>
                    </details>
                  )}
                </div>
              )}

              {activeTab === 'evidence' && (
                <div className="p-2.5 rounded-xl bg-[var(--emos-bg-tertiary)] border border-[var(--emos-border-subtle)] text-[11px] text-[var(--emos-text-secondary)] space-y-1">
                  <p className="font-semibold text-[var(--emos-text-primary)]">Grounded Enterprise DNA Evidence</p>
                  <p>{reply.evidenceSummary}</p>
                </div>
              )}

              {activeTab === 'reasoning' && (
                <div className="p-2.5 rounded-xl bg-[var(--emos-bg-tertiary)] border border-[var(--emos-border-subtle)] text-[11px] text-[var(--emos-text-secondary)] space-y-1.5">
                  <p className="font-semibold text-[var(--emos-text-primary)]">Agent Tool Trace & Guardrail Verification</p>
                  <p>{reply.reasoningSummary}</p>
                  <div className="space-y-1 pt-1">
                    {reply.toolsCalled.map((t, i) => (
                      <div key={i} className="flex items-start gap-1.5 font-mono text-[10px]">
                        <Wrench className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                        <span>
                          <strong>{t.label}:</strong> {t.summary}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {(isProcessing || isQueryingAi) && (
          <div className="p-3 rounded-xl bg-[var(--emos-surface)] border border-[var(--emos-border-subtle)] flex items-center gap-2 text-xs text-[var(--emos-text-secondary)] animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-[var(--emos-accent)]" />
            <span>Modernization Agent is evaluating evidence...</span>
          </div>
        )}
        <div ref={scrollEndRef} />
      </div>

      {/* Contextual Question Shortcuts */}
      <div className="p-3 border-t border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] space-y-2">
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {CONTEXTUAL_QUESTION_GROUPS.map((g, idx) => (
            <button
              key={g.group}
              type="button"
              onClick={() => setActiveGroup(idx)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                activeGroup === idx
                  ? 'bg-[#4648D4] text-white'
                  : 'bg-[var(--emos-bg-tertiary)] text-[var(--emos-text-muted)] hover:text-[var(--emos-text-primary)]'
              }`}
            >
              {g.group}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {CONTEXTUAL_QUESTION_GROUPS[activeGroup].questions.slice(0, 3).map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => handleAsk(q)}
              className="px-2.5 py-1.5 rounded-lg border border-[var(--emos-border-subtle)] bg-[var(--emos-bg)] hover:border-[var(--emos-accent-border)] hover:text-[var(--emos-accent-text)] text-[11px] text-[var(--emos-text-secondary)] text-left transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              <ChevronRight className="w-3 h-3 text-[#4648D4] dark:text-[#818CF8] shrink-0" />
              <span>{q}</span>
            </button>
          ))}
        </div>

        {/* Ask EMOS Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk(input);
          }}
          className="relative"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask Modernization Agent about ${workload.name}...`}
            aria-label="Ask Modernization Agent"
            className="w-full rounded-xl border border-[var(--emos-border-subtle)] bg-[var(--emos-input-bg)] py-2 pl-3 pr-9 text-xs text-[var(--emos-text-primary)] placeholder-[var(--emos-text-muted)] focus:outline-hidden focus:border-[var(--emos-accent)] min-h-[38px]"
          />
          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            aria-label="Send question to Modernization Agent"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-[#4648D4] hover:bg-[#3B3DC2] text-white flex items-center justify-center disabled:opacity-40 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </aside>
  );
};
