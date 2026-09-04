import React, { useState, useRef, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
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
  HelpCircle,
  Server,
  Database,
  ArrowRight,
  Dna
} from 'lucide-react';
import type { Interaction, AssessmentMode, Disposition6R, DecisionReadiness } from '../types';
import { extractAssessmentAttributes } from '../lib/gemini';

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

  // Extract structured decision intelligence metrics dynamically (Single Source of Truth)
  const metrics = useMemo(() => {
    if (!activeInteraction) return null;

    // Determine target assessment text (checks if a follow-up turn refined the assessment, else initial response)
    const turns = activeInteraction.turns || [];
    const lastAssessmentTurn = [...turns].reverse().find(
      (t) => t.role === 'model' && (t.content.includes('MODERNIZATION ASSESSMENT') || t.content.includes('Recommended 6R'))
    );
    const targetText = lastAssessmentTurn?.content || activeInteraction.geminiResponse || '';

    // Extract attributes directly from the detailed assessment text
    const textAttrs = extractAssessmentAttributes(targetText);

    // Strictly prioritize the values from the detailed assessment text to guarantee 100% mathematical and optical consistency
    const disposition = textAttrs.recommended6R || (activeInteraction.recommended6R as Disposition6R) || 'Replatform';
    const confidence = typeof textAttrs.confidenceScore === 'number'
      ? textAttrs.confidenceScore
      : (typeof activeInteraction.confidenceScore === 'number' ? activeInteraction.confidenceScore : undefined);
    const completeness = typeof textAttrs.evidenceCompleteness === 'number'
      ? textAttrs.evidenceCompleteness
      : (typeof activeInteraction.evidenceCompleteness === 'number' ? activeInteraction.evidenceCompleteness : undefined);
    const readiness = textAttrs.decisionReadiness || (activeInteraction.decisionReadiness as DecisionReadiness);

    return {
      disposition,
      confidence: typeof confidence === 'number' ? confidence : (readiness === 'READY' ? 85 : 55),
      completeness: typeof completeness === 'number' ? completeness : (readiness === 'READY' ? 80 : 35),
      readiness: readiness || ((typeof confidence === 'number' && confidence >= 80) ? 'READY' : 'NEEDS EVIDENCE'),
    };
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
        return 'bg-amber-950/40 text-amber-300 border-amber-800/80';
      case 'refactor':
        return 'bg-purple-950/40 text-purple-300 border-purple-800/80';
      case 'rehost':
        return 'bg-sky-950/40 text-sky-300 border-sky-800/80';
      case 'repurchase':
        return 'bg-emerald-950/40 text-emerald-300 border-emerald-800/80';
      case 'retire':
        return 'bg-rose-950/40 text-rose-300 border-rose-800/80';
      case 'retain':
        return 'bg-stone-800 text-stone-300 border-stone-700';
      default:
        return 'bg-[#181818] text-[#E5C492] border-[#3D3222]';
    }
  };

  return (
    <div id="modernization-workspace" className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-[#0A0A0A] overflow-hidden text-[#D4D4D4]">
      {/* Top Status & Sync Bar */}
      <div className="px-6 py-2.5 border-b border-[#222] bg-[#0F0F0F] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {saveStatus === 'saving' && (
            <span className="inline-flex items-center gap-2 text-[#999]">
              <span className="w-2 h-2 rounded-full bg-[#A88554] animate-pulse" />
              Persisting Assessment to Cloud Firestore...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="inline-flex items-center gap-1.5 text-[#A88554] font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              Assessment Synced & Isolated to Firestore
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="inline-flex items-center gap-1.5 text-rose-400 font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              Sync issue: {errorMessage || 'Could not save assessment to Firestore.'}
            </span>
          )}
          {saveStatus === 'idle' && (
            <span className="text-[#666] text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              EMOS Decision Intelligence • Canonical 6R Modernization Engine
            </span>
          )}
        </div>

        {saveStatus === 'error' && activeInteraction && onRetrySave && (
          <button
            id="retry-save-btn"
            onClick={() => onRetrySave(activeInteraction)}
            className="px-2.5 py-1 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> Retry Save
          </button>
        )}
      </div>

      {/* Main Workspace Body */}
      {activeInteraction ? (
        /* Active Modernization Assessment View */
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header of Active Assessment */}
          <div className="px-6 sm:px-10 py-4 bg-[#0F0F0F] border-b border-[#222] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#181818] border border-[#2E2E2E] text-[10px] text-[#A88554] font-medium">
                  <span className="font-bold tracking-wider uppercase text-[#E5C492]">DECIDE</span>
                  <span className="text-[#555]">•</span>
                  <span>What should we do with this workload, why, and how trustworthy is the decision?</span>
                </span>
                <span className="text-[11px] text-[#666] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#555]" />
                  {new Date(activeInteraction.createdAt).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-serif font-semibold tracking-tight text-white">
                {activeInteraction.title}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {/* Journey Indicator */}
              <div className="hidden lg:flex items-center gap-1 text-[10px] text-[#666] font-mono bg-[#111] px-2 py-1 rounded-lg border border-[#222] mr-1">
                <span>DISCOVER</span>
                <span>→</span>
                <span>UNDERSTAND</span>
                <span>→</span>
                <span className="text-[#E5C492] font-semibold bg-[#221A10] px-1.5 py-0.5 rounded border border-[#443018]">DECIDE</span>
                <span>→</span>
                <span className="text-emerald-400">TRUST</span>
              </div>
              {onOpenDna && (activeInteraction.workloadId || activeInteraction.workloadName) && (
                <button
                  id="header-view-dna-btn"
                  onClick={() => onOpenDna(activeInteraction.workloadId || activeInteraction.workloadName || '')}
                  className="px-3 py-1.5 rounded-xl border border-[#333] bg-[#151515] hover:bg-[#1A1A1A] hover:border-[#A88554]/50 text-[#E5C492] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="View Structured Enterprise DNA Evidence Profile"
                >
                  <Dna className="w-3.5 h-3.5 text-[#A88554]" />
                  <span className="hidden sm:inline">Enterprise DNA</span>
                </button>
              )}

              {onOpenPortfolio && (
                <button
                  id="header-portfolio-btn"
                  onClick={onOpenPortfolio}
                  className="px-3 py-1.5 rounded-xl border border-[#333] bg-[#151515] hover:bg-[#1A1A1A] hover:border-[#444] text-[#888] hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Return to Sample Enterprise Portfolio"
                >
                  <Layers className="w-3.5 h-3.5 text-[#888]" />
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
                className="px-3 py-1.5 rounded-xl border border-[#333] bg-[#151515] hover:bg-[#1A1A1A] hover:border-[#444] text-[#888] hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedId === 'full' ? <Check className="w-3.5 h-3.5 text-[#A88554]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === 'full' ? 'Copied' : 'Copy Assessment'}</span>
              </button>
            </div>
          </div>

          {/* Executive 6R Decision Bar (Visually Emphasized Metrics) */}
          {metrics && (
            <div className="px-6 sm:px-10 py-3 bg-[#121212] border-b border-[#222] flex flex-wrap items-center gap-4 text-xs shrink-0">
              {/* Recommended 6R */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider text-[#666] font-semibold">Recommended 6R:</span>
                <span className={`px-2.5 py-1 rounded-md border font-bold text-xs uppercase tracking-wider ${get6RBadgeStyle(metrics.disposition)}`}>
                  {metrics.disposition}
                </span>
              </div>

              <div className="h-4 w-[1px] bg-[#2A2A2A] hidden sm:block" />

              {/* Confidence Score */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider text-[#666] font-semibold">Confidence:</span>
                <span className="font-mono font-bold text-white bg-[#1A1A1A] px-2 py-0.5 rounded border border-[#2E2E2E]">
                  {metrics.confidence}%
                </span>
              </div>

              <div className="h-4 w-[1px] bg-[#2A2A2A] hidden sm:block" />

              {/* Evidence Completeness */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider text-[#666] font-semibold">Evidence:</span>
                <span className="font-mono font-bold text-[#AAA] bg-[#1A1A1A] px-2 py-0.5 rounded border border-[#2E2E2E]">
                  {metrics.completeness}%
                </span>
              </div>

              <div className="h-4 w-[1px] bg-[#2A2A2A] hidden sm:block" />

              {/* Decision Readiness */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider text-[#666] font-semibold">Decision Readiness:</span>
                {metrics.readiness === 'READY' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-950/40 text-emerald-300 border border-emerald-800 text-[11px] font-bold tracking-wide">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> READY
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#241C10] text-[#E5C492] border border-[#4A3B22] text-[11px] font-bold tracking-wide">
                    <AlertCircle className="w-3.5 h-3.5 text-[#E5C492]" /> NEEDS EVIDENCE
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Conversation & Assessment Stream */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 max-w-3xl mx-auto w-full">
            {/* User Modernization Scope / Evidence */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#666] font-semibold">
                  Modernization Scope & Evidence
                </span>
                <div className="h-[1px] flex-1 bg-[#222]" />
                <button
                  onClick={() => copyToClipboard(activeInteraction.content, 'user-initial')}
                  className="text-[#555] hover:text-white p-1 transition-colors cursor-pointer"
                  title="Copy workload evidence"
                >
                  {copiedId === 'user-initial' ? <Check className="w-3.5 h-3.5 text-[#A88554]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="p-5 rounded-2xl bg-[#141414] border border-[#222]">
                <p className="text-sm sm:text-base leading-relaxed text-[#CCC] whitespace-pre-wrap font-sans">
                  {activeInteraction.content}
                </p>
              </div>
            </div>

            {/* Initial Gemini Modernization Assessment */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#A88554] font-semibold">
                  EMOS Decision Intelligence
                </span>
                <div className="h-[1px] flex-1 bg-[#A88554]/20" />
                <button
                  onClick={() => copyToClipboard(activeInteraction.geminiResponse, 'gemini-initial')}
                  className="text-[#555] hover:text-[#A88554] p-1 transition-colors cursor-pointer"
                  title="Copy assessment"
                >
                  {copiedId === 'gemini-initial' ? <Check className="w-3.5 h-3.5 text-[#A88554]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="bg-[#0F0F0F] border border-[#222] p-6 sm:p-8 rounded-3xl shadow-2xl relative">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#222]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">Gemini 3.6 Flash</span>
                    <span className="text-[10px] bg-[#181818] text-[#A88554] px-2.5 py-0.5 rounded-full border border-[#333] font-medium uppercase tracking-wider">
                      {activeInteraction.mode === 'options' ? 'Options Comparison' : activeInteraction.mode === 'decision' ? 'Executive Decision' : '6R Assessment'}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#666]">Canonical 6R Taxonomy</span>
                </div>

                <div className="text-sm sm:text-base leading-relaxed text-[#D4D4D4] font-sans space-y-3 prose prose-invert max-w-none prose-headings:text-white prose-headings:font-serif prose-headings:tracking-tight prose-strong:text-white prose-a:text-[#A88554]">
                  <ReactMarkdown>{activeInteraction.geminiResponse}</ReactMarkdown>
                </div>
              </div>
            </div>

            {/* Subsequent Assessment Turns */}
            {activeInteraction.turns && activeInteraction.turns.length > 0 && (
              <div className="space-y-6 pt-4 border-t border-[#1C1C1C]">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#666] font-semibold">
                    Assessment Dialogue & Evidence Updates
                  </span>
                  <div className="h-[1px] flex-1 bg-[#222]" />
                </div>

                {activeInteraction.turns.map((turn, index) => {
                  const isUser = turn.role === 'user';
                  return (
                    <div key={index} className="flex flex-col gap-2">
                      <div className="flex items-center justify-between text-[10px] text-[#555]">
                        <span className="uppercase tracking-wider font-semibold text-[#888]">
                          {isUser ? 'Architect / You' : 'EMOS Analysis'}
                        </span>
                        <span>
                          {new Date(turn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div
                        className={`p-5 rounded-2xl border text-sm leading-relaxed ${
                          isUser
                            ? 'bg-[#151515] border-[#222] text-[#CCC]'
                            : 'bg-[#0F0F0F] border-[#222] text-[#D4D4D4] relative shadow-lg'
                        }`}
                      >
                        {isUser ? (
                          <p className="whitespace-pre-wrap">{turn.content}</p>
                        ) : (
                          <div className="space-y-2 prose prose-invert max-w-none prose-headings:text-white prose-headings:font-serif">
                            <ReactMarkdown>{turn.content}</ReactMarkdown>
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
              <div className="p-6 rounded-2xl bg-[#0F0F0F] border border-[#222] flex items-center gap-3 animate-pulse">
                <div className="w-4 h-4 border-2 border-[#333] border-t-[#A88554] rounded-full animate-spin shrink-0" />
                <span className="text-xs text-[#888]">
                  EMOS is synthesizing workload evidence and evaluating 6R modernization dispositions...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Follow-up Question Composer */}
          <footer className="p-6 sm:p-8 border-t border-[#222] bg-[#0A0A0A] shrink-0">
            <form onSubmit={handleFollowUpSubmit} className="max-w-3xl mx-auto w-full relative">
              <input
                id="followup-input"
                type="text"
                placeholder="Provide additional modernization evidence or ask about this decision..."
                value={followUpInput}
                onChange={(e) => setFollowUpInput(e.target.value)}
                disabled={isProcessing}
                className="w-full bg-[#111] border border-[#333] rounded-2xl py-3.5 sm:py-4 px-6 pr-16 text-sm focus:outline-hidden focus:border-[#A88554] focus:ring-1 focus:ring-[#A88554] transition-colors placeholder-[#555] text-[#D4D4D4]"
              />
              <button
                id="followup-submit-btn"
                type="submit"
                disabled={!followUpInput.trim() || isProcessing}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 bg-[#A88554] text-black rounded-xl flex items-center justify-center hover:bg-[#E5C492] disabled:opacity-40 transition-colors cursor-pointer shadow-md"
                title="Send Evidence Update"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <p className="text-center text-[10px] text-[#555] mt-3">
              Canonical 6R Taxonomy: Retain • Retire • Rehost • Replatform • Refactor • Repurchase
            </p>
          </footer>
        </div>
      ) : (
        /* New Assessment Composer View */
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 flex flex-col items-center">
          <div className="w-full max-w-3xl space-y-8 my-auto py-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181818] border border-[#333] text-[11px] text-[#A88554] font-medium mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>EMOS Decision Intelligence • Enterprise Modernization Operating System</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-serif text-white tracking-tight">
                What workload would you like to assess?
              </h2>
              <p className="text-xs sm:text-sm text-[#888] max-w-xl mx-auto leading-relaxed">
                Turn fragmented enterprise modernization evidence into explainable, evidence-aware decisions. Assess workloads across canonical 6R dispositions grounded in deterministic Enterprise DNA evidence completeness.
              </p>
            </div>

            {/* Assessment Mode Selector */}
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-[#141414] border border-[#222] rounded-2xl max-w-lg mx-auto">
              <button
                id="mode-assess-btn"
                type="button"
                onClick={() => setSelectedMode('assess')}
                className={`py-2 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  selectedMode === 'assess'
                    ? 'bg-[#222] text-[#E5C492] border border-[#333] shadow-sm'
                    : 'text-[#666] hover:text-[#BBB]'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#A88554]" />
                <span>Assess</span>
              </button>
              <button
                id="mode-options-btn"
                type="button"
                onClick={() => setSelectedMode('options')}
                className={`py-2 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  selectedMode === 'options'
                    ? 'bg-[#222] text-[#E5C492] border border-[#333] shadow-sm'
                    : 'text-[#666] hover:text-[#BBB]'
                }`}
              >
                <GitCompare className="w-3.5 h-3.5 text-[#A88554]" />
                <span>Explore Options</span>
              </button>
              <button
                id="mode-decision-btn"
                type="button"
                onClick={() => setSelectedMode('decision')}
                className={`py-2 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  selectedMode === 'decision'
                    ? 'bg-[#222] text-[#E5C492] border border-[#333] shadow-sm'
                    : 'text-[#666] hover:text-[#BBB]'
                }`}
              >
                <FileCheck2 className="w-3.5 h-3.5 text-[#A88554]" />
                <span>Generate Decision</span>
              </button>
            </div>

            {/* Sample Portfolio Callout Banner */}
            {onOpenPortfolio && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#171410] to-[#121212] border border-[#33251A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#221A12] border border-[#443020] flex items-center justify-center shrink-0 mt-0.5">
                    <Layers className="w-4 h-4 text-[#A88554]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">
                      Start from Structured Enterprise DNA
                    </h4>
                    <p className="text-[11px] text-[#888] mt-0.5 leading-relaxed">
                      Explore 3 candidate workloads with deterministic evidence completeness profiles, missing evidence gap tracking, and 1-click assessment.
                    </p>
                  </div>
                </div>

                <button
                  id="composer-portfolio-btn"
                  type="button"
                  onClick={onOpenPortfolio}
                  className="px-3.5 py-2 rounded-xl bg-[#1F1810] hover:bg-[#2A2015] border border-[#A88554]/40 hover:border-[#A88554] text-[#E5C492] text-xs font-medium flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-xs"
                >
                  <span>Sample Portfolio</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#A88554]" />
                </button>
              </div>
            )}

            {/* Canonical Prompt Starters */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#555] font-semibold block">
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
                    className="p-3.5 rounded-xl bg-[#121212] border border-[#222] hover:border-[#333] hover:bg-[#161616] text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#DDD] group-hover:text-white mb-1">
                      <Sparkles className="w-3 h-3 text-[#A88554] group-hover:scale-110 transition-transform" />
                      <span>{item.title}</span>
                    </div>
                    <p className="text-[11px] text-[#777] line-clamp-2 leading-relaxed">{item.text}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Draft Textarea */}
            <form onSubmit={handleDraftSubmit} className="space-y-4">
              <div className="bg-[#0F0F0F] border border-[#262626] focus-within:border-[#A88554] rounded-2xl shadow-2xl overflow-hidden transition-all">
                <textarea
                  id="assessment-entry-textarea"
                  ref={textareaRef}
                  value={draftContent}
                  onChange={(e) => setDraftContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isProcessing}
                  placeholder="Describe the application or data platform to modernize (e.g., current stack, hosting environment, business criticality, infrastructure/licensing costs, and scaling constraints)... Press Ctrl+Enter or Cmd+Enter to assess..."
                  rows={8}
                  className="w-full p-5 text-sm text-[#E5E5E5] placeholder-[#555] bg-transparent focus:outline-hidden resize-none leading-relaxed"
                />

                <div className="px-5 py-3.5 bg-[#141414] border-t border-[#222] flex items-center justify-between text-xs text-[#666]">
                  <div className="flex items-center gap-3">
                    <span>
                      {draftContent.length} characters • {draftContent.trim() ? draftContent.trim().split(/\s+/).length : 0} words
                    </span>
                    <span className="hidden sm:inline text-[#333]">|</span>
                    <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-[#555]">
                      <CornerDownLeft className="w-3 h-3 text-[#777]" /> Press ⌘/Ctrl+Enter
                    </span>
                  </div>

                  <button
                    id="submit-assessment-btn"
                    type="submit"
                    disabled={!draftContent.trim() || isProcessing}
                    className="px-5 py-2.5 rounded-xl bg-[#A88554] hover:bg-[#E5C492] text-black font-semibold text-xs sm:text-sm flex items-center gap-2 disabled:opacity-50 transition-all shadow-md active:scale-98 cursor-pointer"
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

