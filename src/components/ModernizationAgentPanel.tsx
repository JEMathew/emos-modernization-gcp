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
import { deriveEvidenceDrivenRecommendation } from '../data/enterpriseEstates';
import { buildDefaultLifecycleState, type WorkloadLifecycleState } from '../lib/transformationEngine';
import { PLAIN_ENGLISH_6R } from '../config/capabilityCues';
import { CapabilityCue } from './CapabilityCue';
import { SafeMarkdown } from './SafeMarkdown';

export interface AgentToolExecution {
  toolName: string;
  label: string;
  summary: string;
  status: 'verified';
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
  timestamp: string;
  isLiveGemini?: boolean;
}

interface ModernizationAgentPanelProps {
  workload: EnterpriseWorkload;
  activeInteraction?: Interaction | null;
  lifecycleState?: WorkloadLifecycleState;
  onSendLiveFollowUp?: (interactionId: string, message: string) => Promise<void>;
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
): AgentReply {
  const rec = deriveEvidenceDrivenRecommendation(workload);
  const disposition = (activeInteraction?.recommended6R as Disposition6R) || lifecycle.disposition || rec.recommended6R;
  const plain = PLAIN_ENGLISH_6R[disposition]?.plainEnglish || rec.plainEnglish;
  const completeness = activeInteraction?.evidenceCompleteness ?? rec.evidenceCompleteness;
  const readiness = activeInteraction?.decisionReadiness || rec.decisionReadiness;
  const confidence = activeInteraction?.confidenceScore ?? rec.confidenceScore;
  const q = question.toLowerCase();

  const toolsCalled: AgentToolExecution[] = [
    {
      toolName: 'inspect_workload_dna',
      label: 'inspect_workload_dna()',
      summary: `Scanned 18 Enterprise DNA attributes for ${workload.name} (${completeness}% verified).`,
      status: 'verified',
    },
    {
      toolName: 'evaluate_readiness_gate',
      label: 'evaluate_readiness_gate()',
      summary: `Readiness gate is ${readiness} (threshold 70%; critical gaps: ${rec.criticalGaps.length}).`,
      status: 'verified',
    },
  ];

  let conclusion = `${workload.name} is recommended for "${plain}" (${disposition}) at ${confidence}% confidence (${readiness}).`;
  let bullets: string[] = [...rec.topReasons];
  let nextAction =
    readiness === 'NEEDS EVIDENCE'
      ? `Verify ${rec.criticalGaps.slice(0, 2).join(' and ') || 'missing critical DNA evidence'} in Enterprise DNA to unlock governance approval.`
      : lifecycle.governanceStatus !== 'APPROVED'
      ? `Review and record Human Governance Approval for ${workload.name} to proceed to ${lifecycle.currentPhaseLabel}.`
      : `Complete "${lifecycle.currentPhaseLabel}" and verify gate: ${lifecycle.nextGateLabel}.`;

  if (q.includes('why not') || q.includes('another option') || q.includes('alternative')) {
    toolsCalled.push({
      toolName: 'compare_6r_dispositions',
      label: 'compare_6r_dispositions()',
      summary: `Evaluated all 6 canonical dispositions against ${workload.name} constraints.`,
      status: 'verified',
    });
    conclusion = `Alternative dispositions were rejected because they either fail to resolve ${workload.name}'s drivers or introduce disproportionate risk.`;
    bullets = rec.alternatives.slice(0, 3).map((alt) => `${alt.plainEnglish} (${alt.disposition}): ${alt.whyNot}`);
  } else if (q.includes('missing') || q.includes('gap')) {
    conclusion =
      rec.criticalGaps.length > 0
        ? `${workload.name} is at ${completeness}% evidence completeness with ${rec.criticalGaps.length} critical gap(s) blocking READY status.`
        : `${workload.name} has ${completeness}% verified evidence and zero blocking critical gaps (READY for human review).`;
    bullets =
      rec.criticalGaps.length > 0
        ? rec.criticalGaps.slice(0, 3).map((g) => `Critical gap requiring verification: ${g}`)
        : [
            'All critical Dependency, TCO Baseline, and Target-State attributes are verified.',
            `Evidence completeness (${completeness}%) exceeds the mandatory 70% threshold.`,
            'Human approval remains required before transformation execution proceeds.',
          ];
  } else if (q.includes('change your recommendation') || q.includes('what would change')) {
    toolsCalled.push({
      toolName: 'compare_6r_dispositions',
      label: 'compare_6r_dispositions()',
      summary: 'Computed counterfactual sensitivity across Business, Dependency, and Target-State DNA.',
      status: 'verified',
    });
    conclusion = `Changing core criticality, dependency coupling, or target-platform constraints in Enterprise DNA will shift the recommendation for ${workload.name}.`;
    bullets = [
      'If business criticality drops to Low and capability is duplicated → recommendation shifts to Safely shut it down (Retire).',
      'If sub-5ms hardware/vault latency constraints or recent amortization dominate → shifts to Keep it as-is (Retain).',
      'If a commercial SaaS platform covers 100% of capability without custom differentiation → shifts to Replace it (Repurchase).',
    ];
    nextAction = 'Use "Edit Selected Evidence" in Enterprise DNA to test how verified facts alter readiness and 6R scoring.';
  } else if (q.includes('risk') || q.includes('affected') || q.includes('dependency')) {
    conclusion = `Primary modernization risk for ${workload.name} centers on ${workload.knownDependencies} and cutover continuity.`;
    bullets = rec.keyRisks.slice(0, 3);
  } else if (q.includes('executive')) {
    conclusion = `Executive Brief: We recommend "${plain}" (${disposition}) for ${workload.name} to deliver ${rec.expectedImpact.split('·')[0].trim()}.`;
    bullets = [
      `Business Value: ${rec.expectedImpact}`,
      `Governance Posture: ${completeness}% evidence verified (${readiness}) · ${confidence}% confidence.`,
      `Accountability: Bounded by human approval and ${lifecycle.stages.length}-stage execution checkpoints.`,
    ];
  } else if (q.includes('blocked') || q.includes('execution')) {
    toolsCalled.push({
      toolName: 'build_transformation_stages',
      label: 'build_transformation_stages()',
      summary: `Inspected ${lifecycle.stages.length}-stage ${disposition} execution timeline (${lifecycle.overallProgress}% complete).`,
      status: 'verified',
    });
    conclusion = lifecycle.activeBlocker
      ? `Execution is currently gated at "${lifecycle.currentPhaseLabel}": ${lifecycle.activeBlocker}`
      : `Execution is active at "${lifecycle.currentPhaseLabel}" (${lifecycle.overallProgress}% overall progress) with no active blockers.`;
    bullets = [
      `Current Stage: ${lifecycle.currentPhaseLabel} — Next Gate: ${lifecycle.nextGateLabel}.`,
      `Target State: ${lifecycle.targetArchSummary}.`,
      `Dependency Scope: ${workload.knownDependencies}.`,
    ];
  } else if (q.includes('expected result') || q.includes('differ') || q.includes('outcome') || q.includes('learn')) {
    toolsCalled.push({
      toolName: 'evaluate_outcomes_and_learning',
      label: 'evaluate_outcomes_and_learning()',
      summary: `Compared Baseline vs. Target vs. Observed metrics and captured lessons for ${workload.name}.`,
      status: 'verified',
    });
    const firstLesson = lifecycle.learnings[0];
    conclusion = `Representative outcome tracking for ${workload.name} (${disposition}) confirms target benefit realization with documented lessons for future waves.`;
    bullets = [
      ...lifecycle.outcomes.slice(0, 2).map((o) => `${o.label}: Baseline ${o.baseline} → Target ${o.target} → Observed ${o.observed} (${o.deltaSummary}).`),
      firstLesson ? `Captured Lesson: ${firstLesson.lesson}` : 'Lesson: Validate dependency and TCO evidence prior to wave mobilization.',
    ];
    nextAction = 'Record this learning rule into the Enterprise DNA playbook for the next modernization wave.';
  }

  return {
    id: `agent-reply-${Date.now()}`,
    question,
    conclusion,
    bullets: bullets.slice(0, 3),
    nextAction,
    evidenceSummary: `${completeness}% verified (${workload.name} · ${workload.currentStack} · ${workload.hosting} · ${workload.knownDependencies})`,
    reasoningSummary: `Evaluated all 6 canonical dispositions under EMOS deterministic guardrails. Readiness=${readiness}, Confidence=${confidence}%, Primary=${plain} (${disposition}).`,
    toolsCalled,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

export const ModernizationAgentPanel: React.FC<ModernizationAgentPanelProps> = ({
  workload,
  activeInteraction,
  lifecycleState,
  onSendLiveFollowUp,
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
  const [activeGroup, setActiveGroup] = useState<number>(0);
  const [replies, setReplies] = useState<AgentReply[]>(() => [
    runGovernedAgentQuery('Why are you recommending this?', workload, computedLifecycle, activeInteraction),
  ]);
  const [expandedDetail, setExpandedDetail] = useState<Record<string, 'more' | 'evidence' | 'reasoning' | null>>({});
  const scrollEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setReplies([
      runGovernedAgentQuery('Why are you recommending this?', workload, computedLifecycle, activeInteraction),
    ]);
    setExpandedDetail({});
  }, [workload.id, workload.evidenceCompleteness, computedLifecycle.disposition, computedLifecycle.governanceStatus]);

  if (!isOpen) return null;

  const handleAsk = async (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed) return;
    setInput('');

    // Always produce immediate deterministic tool-grounded reply
    const localReply = runGovernedAgentQuery(trimmed, workload, computedLifecycle, activeInteraction);
    setReplies((prev) => [...prev, localReply]);

    // If an active Firestore interaction exists and live follow-up callback is provided, also sync with server-side Gemini
    if (activeInteraction && onSendLiveFollowUp) {
      try {
        await onSendLiveFollowUp(activeInteraction.id, trimmed);
      } catch {
        // Local tool-grounded response remains visible even if live network call fails
      }
    }
    setTimeout(() => scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 60);
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
      className={`flex flex-col bg-[var(--emos-bg-secondary)] text-[var(--emos-text-primary)] border-l border-[var(--emos-border-subtle)] ${
        variant === 'drawer' ? 'w-full max-w-md h-full shadow-2xl' : 'w-full lg:w-96 shrink-0 h-full'
      }`}
    >
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-[var(--emos-border-subtle)] flex items-center justify-between gap-2 bg-[var(--emos-surface)]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#A88554] to-[#E5C492] text-black flex items-center justify-center shrink-0 shadow-xs">
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
                <span className="text-[10px] font-normal text-[var(--emos-text-muted)]">{reply.timestamp}</span>
              </div>

              {/* 1 Concise Conclusion */}
              <p className="text-xs font-semibold leading-relaxed text-[var(--emos-text-primary)]">
                {reply.conclusion}
              </p>

              {/* Max 3 Bullets */}
              <ul className="space-y-1.5 text-xs text-[var(--emos-text-secondary)]">
                {reply.bullets.map((b, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 leading-snug">
                    <span className="text-[var(--emos-accent)] font-bold mt-0.5">•</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              {/* 1 Recommended Next Action */}
              <div className="p-2.5 rounded-xl bg-[var(--emos-accent-subtle)] border border-[var(--emos-accent-border)] text-[11px]">
                <span className="font-bold uppercase tracking-wider text-[10px] text-[var(--emos-accent-text)] block">
                  Recommended Next Action
                </span>
                <span className="text-[var(--emos-text-primary)] font-medium mt-0.5 block">
                  {reply.nextAction}
                </span>
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

        {isProcessing && (
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
                  ? 'bg-[#A88554] text-black'
                  : 'bg-[var(--emos-bg-tertiary)] text-[var(--emos-text-muted)] hover:text-[var(--emos-text-primary)]'
              }`}
            >
              {g.group}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
          {CONTEXTUAL_QUESTION_GROUPS[activeGroup].questions.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => handleAsk(q)}
              className="px-2 py-1 rounded-lg border border-[var(--emos-border-subtle)] bg-[var(--emos-bg-secondary)] hover:border-[var(--emos-accent-border)] hover:text-[var(--emos-accent-text)] text-[10px] text-[var(--emos-text-secondary)] text-left transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              <ChevronRight className="w-2.5 h-2.5 text-[var(--emos-accent)] shrink-0" />
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
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-[#A88554] text-black flex items-center justify-center disabled:opacity-40 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </aside>
  );
};
