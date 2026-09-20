import React, { useState, useEffect, useRef } from 'react';
import type { User } from 'firebase/auth';
import { Navbar } from './Navbar';
import { HistorySidebar } from './HistorySidebar';
import { ReflectionWorkspace } from './ReflectionWorkspace';
import { SamplePortfolioView } from './SamplePortfolioView';
import { EnterpriseDnaView } from './EnterpriseDnaView';
import { ImportPortfolioModal } from './ImportPortfolioModal';
import { TestWalkthroughModal } from './TestWalkthroughModal';
import { PortfolioPlanView } from './PortfolioPlanView';
import { ModernizationLifecycle } from './ModernizationLifecycle';
import { CommandCenter } from './CommandCenter';
import { useWorkspaceNavigation, type WorkspaceStage } from '../lib/workspaceNavigation';
import { evaluateEvidenceReadiness } from '../lib/readiness';
import type { Interaction, AssessmentMode, ChatMessage, EnterpriseWorkload, ProgramAlignment } from '../types';
import { SAMPLE_PORTFOLIO, formatWorkloadDnaForAssessment } from '../data/samplePortfolio';
import {
  subscribeToUserInteractions,
  saveInteraction,
  updateInteraction,
  deleteInteraction,
  syncUserProfile,
  testConnection,
  subscribeToUserImportedWorkloads,
  saveImportedWorkloads,
  deleteImportedWorkload,
  clearAllImportedWorkloads,
  saveProgramAlignment,
  subscribeToProgramAlignment,
} from '../lib/firebase';
import { chatWithGemini, generateAssessmentMeta } from '../lib/gemini';

interface DashboardProps {
  user: User;
}

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const { route, navigate } = useWorkspaceNavigation();
  const mainRef = useRef<HTMLElement>(null);
  const defaultAlignment: ProgramAlignment = {
    userId: user.uid,
    programName: 'Enterprise Modernization Program',
    executiveSponsor: '',
    securityApprover: '',
    deliveryOwner: '',
    businessOutcomes: '',
    targetPlatform: '',
    riskTolerance: 'Balanced',
    timeHorizonMonths: 18,
    successMeasures: '',
    updatedAt: new Date(0).toISOString(),
  };
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [importedWorkloads, setImportedWorkloads] = useState<EnterpriseWorkload[]>([]);
  const selectedId = route.assessmentId;
  const currentView = route.view;
  const [programAlignment, setProgramAlignment] = useState<ProgramAlignment>(defaultAlignment);
  const [isLoadingWorkloads, setIsLoadingWorkloads] = useState(true);
  const [isLoadingAlignment, setIsLoadingAlignment] = useState(true);
  const [dataErrors, setDataErrors] = useState<Record<string, string>>({});
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorKind, setErrorKind] = useState<'reasoning' | 'persistence' | 'guardrail' | null>(null);
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const workloads = route.portfolio === 'imported' ? importedWorkloads : SAMPLE_PORTFOLIO;
  const selectedWorkload = route.workloadId ? workloads.find(w => w.id === route.workloadId) ?? null : workloads[0] ?? null;
  const workloadReadiness = selectedWorkload ? evaluateEvidenceReadiness(selectedWorkload.dna) : null;
  const isLoading = isLoadingHistory || isLoadingWorkloads || isLoadingAlignment;
  const clearDataError = (key: string) => setDataErrors(errors => { const next = { ...errors }; delete next[key]; return next; });

  // Sync user profile and test connection on mount
  useEffect(() => {
    testConnection(user.uid);
    syncUserProfile(user).catch((err) => {
      console.warn("Could not sync user profile:", err);
    });
  }, [user]);

  // Subscribe to real-time interactions for this user
  useEffect(() => {
    setIsLoadingHistory(true);
    const unsubscribe = subscribeToUserInteractions(
      user.uid,
      (data) => {
        setInteractions(data);
        setIsLoadingHistory(false);
        clearDataError('history');
      },
      (error) => {
        console.error("Failed to load user interactions:", error);
        setIsLoadingHistory(false);
        setDataErrors(errors => ({ ...errors, history: 'Saved decisions could not be loaded. Check your connection or account permissions and reload.' }));
        setSaveStatus('error');
        setErrorKind('persistence');
        setErrorMessage("Unable to fetch Firestore history. Please check permissions.");
      }
    );

    return () => unsubscribe();
  }, [user.uid]);

  useEffect(() => subscribeToProgramAlignment(
    user.uid,
    (alignment) => {
      setProgramAlignment(alignment ? { ...defaultAlignment, ...alignment, userId: user.uid } : { ...defaultAlignment, userId: user.uid });
      setIsLoadingAlignment(false);
      clearDataError('alignment');
    },
    () => {
      setIsLoadingAlignment(false);
      setDataErrors(errors => ({ ...errors, alignment: 'Program alignment could not be loaded. Reload before making changes.' }));
    },
  ), [user.uid]);

  // Subscribe to real-time imported workloads for this user
  useEffect(() => {
    const unsubscribe = subscribeToUserImportedWorkloads(
      user.uid,
      (workloads) => {
        setImportedWorkloads(workloads);
        setIsLoadingWorkloads(false);
        clearDataError('workloads');
      },
      (error) => {
        console.error("Failed to load user imported workloads:", error);
        setIsLoadingWorkloads(false);
        setDataErrors(errors => ({ ...errors, workloads: 'Imported inventory could not be loaded. Check your connection or account permissions and reload.' }));
      }
    );

    return () => unsubscribe();
  }, [user.uid]);

  const activeInteraction = interactions.find((i) => i.id === selectedId) || null;

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    mainRef.current?.focus({ preventScroll: true });
    document.title = `${currentView === 'overview' ? 'Command Center' : route.stage ?? 'Decision history'} — EMOS`;
  }, [currentView, selectedId, route.stage, route.workloadId]);

  // Handler: Create and Save New Assessment
  const handleSaveNew = async ({
    content,
    mode,
    workloadId,
  }: {
    content: string;
    mode: AssessmentMode;
    workloadId?: string;
  }) => {
    navigate('workspace', { stage: 'Assess', workloadId: workloadId ?? null });
    const requestUrl = window.location.href;
    setIsProcessing(true);
    setSaveStatus('saving');
    setErrorKind(null);
    setErrorMessage(null);

    let failureKind: 'reasoning' | 'persistence' = 'reasoning';

    try {
      const allWorkloads = [...SAMPLE_PORTFOLIO, ...importedWorkloads];
      const matchedWorkload = workloadId ? allWorkloads.find(w => w.id === workloadId) : undefined;

      // 1. Generate Gemini AI assessment & metadata in parallel with deterministic grounding
      const [chatRes, metaRes] = await Promise.all([
        chatWithGemini({
          message: content,
          history: [],
          mode,
          deterministicCompleteness: matchedWorkload?.evidenceCompleteness,
          workloadDna: matchedWorkload?.dna,
        }),
        generateAssessmentMeta(content),
      ]);

      if (chatRes.type !== 'assessment') {
        throw new Error('Expected initial modernization assessment response.');
      }

      // Consume the server-reconciled assessment and metadata as one canonical result.
      const attributes = chatRes.attributes;

      const newId = `assessment_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const now = new Date().toISOString();

      const newInteraction: Interaction = {
        id: newId,
        userId: user.uid,
        title: metaRes.title || attributes.workloadName || matchedWorkload?.name || 'Modernization Assessment',
        category: metaRes.category || (matchedWorkload ? `${matchedWorkload.type} Assessment` : 'Architecture Assessment'),
        mode,
        content: chatRes.sanitizedInput,
        geminiResponse: chatRes.response,
        turns: [],
        createdAt: now,
        updatedAt: now,
        workloadId: workloadId,
        workloadName: attributes.workloadName || metaRes.workloadName || matchedWorkload?.name,
        recommended6R: attributes.recommended6R,
        confidenceScore: attributes.confidenceScore,
        evidenceCompleteness: attributes.evidenceCompleteness,
        decisionReadiness: attributes.decisionReadiness,
        trustIndicators: {
          inputValidated: true,
          evidenceGrounded: attributes.isGrounded ?? attributes.trustIndicators?.evidenceGrounded ?? chatRes.trustIndicators?.evidenceGrounded ?? true,
          schemaValidated: true,
          wasRepaired: attributes.wasRepaired ?? attributes.trustIndicators?.wasRepaired ?? chatRes.trustIndicators?.wasRepaired,
        },
      };

      // 2. Guaranteed Transaction Verification: persist to Cloud Firestore
      failureKind = 'persistence';
      await saveInteraction(user.uid, newInteraction);
      setInteractions(previous => previous.some(item => item.id === newId) ? previous : [newInteraction, ...previous]);

      if (window.location.href === requestUrl) {
        navigate('workspace', { stage: 'Decide', workloadId: workloadId ?? null, assessmentId: newId });
      }
      setSaveStatus('saved');
      setErrorKind(null);
    } catch (err: any) {
      console.error("Failed to generate or save assessment:", err);
      const isGuardrail = err?.code === 'AI_GUARDRAIL_REJECTED' || (typeof err?.message === 'string' && err.message.toLowerCase().includes('guardrail'));
      const resolvedErrorKind: 'reasoning' | 'persistence' | 'guardrail' = isGuardrail ? 'guardrail' : failureKind;
      setSaveStatus('error');
      setErrorKind(resolvedErrorKind);
      setErrorMessage(err?.message || (resolvedErrorKind === 'reasoning'
        ? "AI reasoning is unavailable. Your saved assessment data is unaffected."
        : resolvedErrorKind === 'guardrail'
        ? "The AI response did not satisfy EMOS decision guardrails. No assessment changes were saved."
        : "Could not save the assessment to Firestore."));
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  // Handler: Assess from Sample Portfolio or Enterprise DNA
  const handleAssessWorkload = async (workload: EnterpriseWorkload) => {
    const formattedContent = formatWorkloadDnaForAssessment(workload);
    await handleSaveNew({
      content: formattedContent,
      mode: 'assess',
      workloadId: workload.id,
    });
  };

  // Handler: Select workload to view Enterprise DNA
  const handleSelectWorkloadForDna = (workload: EnterpriseWorkload) => {
    navigate('dna', { workloadId: workload.id, portfolio: workload.source === 'imported' || importedWorkloads.includes(workload) ? 'imported' : 'sample' });
  };

  // Handler: Open DNA by ID or Name from Workspace
  const handleOpenDna = (workloadNameOrId: string) => {
    const allWorkloads = [...SAMPLE_PORTFOLIO, ...importedWorkloads];
    const found = allWorkloads.find(
      (w) =>
        w.id.toLowerCase() === workloadNameOrId.toLowerCase() ||
        w.name.toLowerCase() === workloadNameOrId.toLowerCase() ||
        workloadNameOrId.toLowerCase().includes(w.name.toLowerCase()) ||
        w.name.toLowerCase().includes(workloadNameOrId.toLowerCase())
    );
    if (found) handleSelectWorkloadForDna(found);
  };

  // Handler: Import workloads into Firestore
  const handleImportWorkloads = async (newWorkloads: EnterpriseWorkload[]) => {
    await saveImportedWorkloads(user.uid, newWorkloads);
    setImportedWorkloads(previous => [...newWorkloads, ...previous.filter(record => !newWorkloads.some(item => item.id === record.id))]);
  };

  // Handler: Delete single imported workload
  const handleDeleteImportedWorkload = async (workloadId: string) => {
    try {
      await deleteImportedWorkload(user.uid, workloadId);
      if (selectedWorkload?.id === workloadId) {
        navigate('portfolio', { workloadId: null });
      }
    } catch (err: any) {
      console.error("Failed to delete imported workload:", err);
      setErrorMessage("Failed to delete workload from Firestore.");
    }
  };

  // Handler: Clear all imported workloads
  const handleClearImportedPortfolio = async () => {
    try {
      await clearAllImportedWorkloads(user.uid, importedWorkloads);
      navigate('portfolio', { workloadId: null });
    } catch (err: any) {
      console.error("Failed to clear imported portfolio:", err);
      setErrorMessage("Failed to clear imported workloads from Firestore.");
    }
  };

  // Handler: Multi-Turn Follow-Up Discussion
  const handleSendFollowUp = async (interactionId: string, message: string) => {
    const current = interactions.find((i) => i.id === interactionId);
    if (!current) return;

    setIsProcessing(true);
    setSaveStatus('saving');
    setErrorKind(null);
    setErrorMessage(null);

    let failureKind: 'reasoning' | 'persistence' = 'reasoning';

    const now = new Date().toISOString();

    // Prepare full conversation history for context continuity
    const historyList: ChatMessage[] = [
      { role: 'user', content: current.content, timestamp: current.createdAt },
      { role: 'model', content: current.geminiResponse, timestamp: current.createdAt },
      ...(current.turns || []),
    ];

    const allWorkloads = [...SAMPLE_PORTFOLIO, ...importedWorkloads];
    const matchedWorkload = current.workloadId ? allWorkloads.find(w => w.id === current.workloadId) : undefined;

    try {
      const response = await chatWithGemini({
        message,
        history: historyList,
        mode: current.mode,
        deterministicCompleteness: current.evidenceCompleteness ?? matchedWorkload?.evidenceCompleteness,
        workloadDna: matchedWorkload?.dna,
      });

      const updatedTurns: ChatMessage[] = [
        ...(current.turns || []),
        { role: 'user', content: response.sanitizedInput, timestamp: now },
        {
          role: 'model',
          content: response.response,
          timestamp: new Date().toISOString(),
          modelUsed: response.modelUsed,
        },
      ];

      // Requirement 5: Follow-up prose must never modify:
      // recommended6R, confidenceScore, evidenceCompleteness, decisionReadiness.
      // Canonical assessment state may change only through a validated structured evidence update followed by deterministic recalculation.
      const updatePayload: Partial<Interaction> = {
        turns: updatedTurns,
      };

      failureKind = 'persistence';
      await updateInteraction(user.uid, interactionId, updatePayload);

      setSaveStatus('saved');
      setErrorKind(null);
    } catch (err: any) {
      console.error("Failed to process follow-up:", err);
      const isGuardrail = err?.code === 'AI_GUARDRAIL_REJECTED' || (typeof err?.message === 'string' && err.message.toLowerCase().includes('guardrail'));
      const resolvedErrorKind: 'reasoning' | 'persistence' | 'guardrail' = isGuardrail ? 'guardrail' : failureKind;
      setSaveStatus('error');
      setErrorKind(resolvedErrorKind);
      setErrorMessage(err?.message || (resolvedErrorKind === 'reasoning'
        ? "AI reasoning is unavailable. Your saved assessment data is unaffected."
        : resolvedErrorKind === 'guardrail'
        ? "The AI response did not satisfy EMOS decision guardrails. No assessment changes were saved."
        : "Could not save the follow-up to Firestore."));
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  // Handler: Delete interaction
  const handleDelete = async (interactionId: string) => {
    try {
      await deleteInteraction(user.uid, interactionId);
      if (selectedId === interactionId) {
        navigate('history');
      }
    } catch (err: any) {
      console.error("Failed to delete assessment:", err);
      setSaveStatus('error');
      setErrorKind('persistence');
      setErrorMessage("Failed to delete assessment from Firestore.");
    }
  };

  // Handler: Retry Save
  const handleRetrySave = async (interaction: Interaction) => {
    setSaveStatus('saving');
    setErrorKind(null);
    setErrorMessage(null);
    try {
      await saveInteraction(user.uid, interaction);
      setSaveStatus('saved');
      setErrorKind(null);
    } catch (err: any) {
      setSaveStatus('error');
      setErrorKind('persistence');
      setErrorMessage(err?.message || "Retry save failed.");
    }
  };

  const selectStage = (stage: WorkspaceStage) => {
    if (stage === 'Discover') navigate('portfolio');
    else if (stage === 'Understand') navigate(selectedWorkload ? 'dna' : 'portfolio', { workloadId: selectedWorkload?.id ?? null });
    else if (stage === 'Assess' || stage === 'Decide') {
      const latest = interactions.find(item => item.workloadId === selectedWorkload?.id);
      navigate('workspace', { stage, workloadId: selectedWorkload?.id ?? null, assessmentId: stage === 'Decide' ? latest?.id ?? null : null });
    } else navigate('plan', { stage });
  };
  const openInteraction = (id: string) => {
    const interaction = interactions.find(item => item.id === id);
    const imported = importedWorkloads.some(w => w.id === interaction?.workloadId);
    navigate('workspace', { stage: 'Decide', assessmentId: id, workloadId: interaction?.workloadId ?? null, portfolio: imported ? 'imported' : 'sample' });
  };
  const stageGuidance = {
    Align: ['Define the outcome and accountable owners.', 'Business goals, sponsor and success measures', 'Confirm investment intent', 'Saved program alignment', 'Discover'],
    Discover: ['Choose the workloads in scope.', 'Supported CSV/JSON inventory or synthetic samples', 'Confirm ownership and scope', 'Portfolio inventory', 'Understand'],
    Understand: ['Inspect the evidence and its gaps.', 'Workload DNA, dependencies, cost and risk', 'Identify evidence to verify', 'Evidence baseline and gap list', 'Assess'],
    Assess: ['Generate a recommendation from evidence.', 'Workload evidence and business context', 'Review the recommendation and assumptions', 'Saved 6R assessment', 'Decide'],
    Decide: ['Review options and the evidence gate.', 'Saved assessment and supporting evidence', 'Human review; approval workflow is building next', 'Decision summary and follow-up discussion', 'Govern'],
    Plan: ['Sequence the portfolio into delivery waves.', 'Saved decisions and program alignment', 'Review wave order and funding assumptions', 'Wave plan and executive pack', 'Mobilize'],
    Mobilize: ['Review the governed delivery handoff.', 'Owners, wave plan and readiness controls', 'Resolve outstanding readiness actions', 'Mobilization checklist and executive pack', 'Define Target State'],
  } as const;
  const guidance = route.stage ? stageGuidance[route.stage] : null;
  const missingWorkload = (currentView === 'dna' || currentView === 'workspace') && Boolean(route.workloadId) && !selectedWorkload && !isLoadingWorkloads;
  const missingAssessment = Boolean(selectedId) && !activeInteraction && !isLoadingHistory;
  const contextMismatch = Boolean(activeInteraction?.workloadId && route.workloadId && activeInteraction.workloadId !== route.workloadId);
  const blocked = !route.known || missingWorkload || missingAssessment || contextMismatch;
  const dataFailed = Object.keys(dataErrors).length > 0;
  const evidenceLabel = currentView === 'workspace' && activeInteraction?.evidenceCompleteness !== undefined
    ? `${activeInteraction.evidenceCompleteness}% · ${activeInteraction.decisionReadiness === 'READY' ? 'Ready for human review' : 'Needs evidence'}`
    : route.workloadId && workloadReadiness ? `${workloadReadiness.completeness}% · ${workloadReadiness.decisionReadiness === 'READY' ? 'Ready for human review' : 'Needs evidence'}` : 'Select a workload to inspect evidence';

  return (
    <div className="emos-app min-h-screen bg-[var(--emos-bg)] text-[var(--emos-text-primary)] font-sans">
      <a href="#workspace-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-[var(--emos-surface)] focus:p-3">Skip to workspace</a>
      <Navbar
        user={user}
        currentView={currentView}
        selectedId={selectedId}
        assessmentCount={interactions.length}
        onNavigate={(view) => {
          if (view === 'decision-intelligence') selectStage('Decide');
          else if (view === 'assessments') navigate('history');
          else navigate(view);
        }}
        onNewAssessment={() => navigate('workspace', { stage: 'Assess', workloadId: null })}
        onOpenWalkthrough={() => setIsWalkthroughOpen(true)}
      />
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <nav aria-label="Workspace breadcrumb" className="flex min-w-0 flex-wrap items-center gap-2 text-xs">
          <button className="min-h-11 font-semibold text-[var(--emos-accent-text)]" onClick={() => navigate('overview')}>Command Center</button>
          {currentView !== 'overview' && <><span aria-hidden="true">/</span><button className="min-h-11" onClick={() => navigate('portfolio')}>Portfolio</button></>}
          {route.workloadId && <><span aria-hidden="true">/</span><span className="break-words">{selectedWorkload?.name ?? 'Workload unavailable'}</span></>}
          {route.stage && <><span aria-hidden="true">/</span><span aria-current="page">{route.stage}</span></>}
          {currentView === 'history' && <><span aria-hidden="true">/</span><span aria-current="page">History</span></>}
        </nav>
        <label className="flex shrink-0 items-center gap-2 text-xs text-[var(--emos-text-secondary)]">
          Portfolio
          <select aria-label="Active portfolio" value={route.portfolio} onChange={event => navigate('overview', { portfolio: event.target.value as 'sample' | 'imported', workloadId: null })} className="min-h-11 rounded-lg border border-[var(--emos-border-strong)] bg-[var(--emos-surface)] px-3 text-[var(--emos-text-primary)]">
            <option value="sample">Sample · Synthetic data</option><option value="imported">My imported portfolio</option>
          </select>
        </label>
      </div>
      <ModernizationLifecycle currentStage={route.stage} onSelectStage={stage => selectStage(stage.name as WorkspaceStage)} />
      <main ref={mainRef} id="workspace-content" tabIndex={-1} className="mx-auto min-w-0 max-w-7xl outline-none">
        {dataFailed && <section role="alert" className="m-4 space-y-2 rounded-xl border border-[var(--emos-border-strong)] bg-[var(--emos-surface)] p-5">
          <h1 className="text-lg font-semibold">Your workspace could not be loaded</h1>
          {Object.entries(dataErrors).map(([key, message]) => <p key={key} className="text-sm">{message}</p>)}
          <button onClick={() => window.location.reload()} className="min-h-11 text-sm font-semibold text-[var(--emos-accent-text)]">Reload workspace</button>
        </section>}
        {!dataFailed && blocked && <section className="space-y-3 p-6" role="status"><h1 className="text-xl font-semibold">Workspace unavailable</h1><p className="text-sm">This link is invalid, has been removed, or is not available to your account. Choose a workload or saved decision to continue.</p><button className="min-h-11 text-[var(--emos-accent-text)]" onClick={() => navigate('overview', { workloadId: null })}>Return to Command Center</button></section>}
        {!dataFailed && !blocked && <>
          {guidance && <details className="mx-4 mt-4 rounded-xl border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] p-4 sm:mx-6">
            <summary className="cursor-pointer text-sm font-medium">{route.stage} · {guidance[0]} <span className="mt-1 block text-xs font-normal text-[var(--emos-text-secondary)]">Evidence: {isLoading ? 'Loading…' : evidenceLabel} · View inputs, outputs and next step</span></summary>
            <dl className="mt-4 grid gap-4 text-xs sm:grid-cols-2 lg:grid-cols-3">
              {[
                ['Inputs', guidance[1]], ['Decision required', guidance[2]], ['Outputs', guidance[3]],
                ['AI activity', isProcessing ? 'Processing your request' : 'Idle — runs on request'],
                ['Next stage', guidance[4]],
                ['Context', route.workloadId ? selectedWorkload?.name ?? 'Loading workload' : route.portfolio === 'sample' ? 'Synthetic sample portfolio' : programAlignment.programName],
              ].map(([label, value]) => <div key={label}><dt className="font-semibold">{label}</dt><dd className="mt-1 leading-5 text-[var(--emos-text-secondary)]">{value}</dd></div>)}
            </dl>
            {guidance[4] === 'Govern' || guidance[4] === 'Define Target State' ? <p className="mt-3 text-xs text-[var(--emos-text-secondary)]">{guidance[4]} · Building next</p> : <button className="mt-3 min-h-11 text-sm font-semibold text-[var(--emos-accent-text)]" onClick={() => selectStage(guidance[4] as WorkspaceStage)}>Continue to {guidance[4]}</button>}
          </details>}
          {currentView === 'overview' && <CommandCenter workloads={workloads} interactions={interactions} alignment={programAlignment} isLoading={isLoading} isProcessing={isProcessing} isSynthetic={route.portfolio === 'sample'} onStage={selectStage} onWorkload={handleSelectWorkloadForDna} onImport={() => setIsImportModalOpen(true)} />}
          {isLoading && currentView !== 'overview' ? <p role="status" className="p-6 text-sm">Loading your saved workspace…</p> : <>
            {currentView === 'portfolio' && <SamplePortfolioView
              onSelectWorkload={handleSelectWorkloadForDna} onAssessWorkload={handleAssessWorkload}
              importedWorkloads={importedWorkloads} onOpenImportModal={() => setIsImportModalOpen(true)}
              onDeleteImportedWorkload={handleDeleteImportedWorkload} onClearImportedPortfolio={handleClearImportedPortfolio}
              isProcessing={isProcessing} portfolioSource={route.portfolio}
              onPortfolioSourceChange={portfolio => navigate('portfolio', { portfolio, workloadId: null })}
            />}
            {currentView === 'dna' && selectedWorkload && <EnterpriseDnaView workload={selectedWorkload} onBackToPortfolio={() => navigate('portfolio')} onAssess={handleAssessWorkload} isProcessing={isProcessing} />}
            {currentView === 'workspace' && <ReflectionWorkspace
              activeInteraction={activeInteraction} onSaveNew={handleSaveNew} onSendFollowUp={handleSendFollowUp}
              onRetrySave={handleRetrySave} onOpenPortfolio={() => navigate('portfolio')} onOpenDna={handleOpenDna}
              isProcessing={isProcessing} saveStatus={saveStatus} errorMessage={errorMessage} errorKind={errorKind}
              stage={route.stage === 'Assess' ? 'Assess' : 'Decide'}
              workload={route.workloadId ? selectedWorkload : null}
            />}
            {currentView === 'history' && <section className="p-4 sm:p-7"><h1 className="mb-4 text-2xl font-semibold">Decision history</h1><HistorySidebar interactions={interactions} selectedId={null} onSelect={openInteraction} onDelete={handleDelete} isLoading={isLoadingHistory} /></section>}
            {currentView === 'plan' && <PortfolioPlanView
              workloads={workloads} interactions={interactions} alignment={programAlignment}
              section={route.stage === 'Align' ? 'align' : route.stage === 'Mobilize' ? 'mobilize' : 'waves'}
              onSectionChange={section => selectStage(section === 'align' ? 'Align' : section === 'mobilize' ? 'Mobilize' : 'Plan')}
              onSaveAlignment={async (alignment) => {
                await saveProgramAlignment(user.uid, alignment);
                setProgramAlignment({ ...alignment, userId: user.uid, updatedAt: new Date().toISOString() });
              }}
              onBack={() => navigate('portfolio')}
            />}
          </>}
        </>}
      </main>
      <ImportPortfolioModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onImportSuccess={handleImportWorkloads} userId={user.uid}
        existingWorkloadIds={importedWorkloads.map(workload => workload.id)}
        onContinue={() => navigate('portfolio', { portfolio: 'imported', workloadId: null })} />
      <TestWalkthroughModal isOpen={isWalkthroughOpen} onClose={() => setIsWalkthroughOpen(false)} />
    </div>
  );
};
