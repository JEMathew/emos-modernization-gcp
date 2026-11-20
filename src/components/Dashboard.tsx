import React, { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { Navbar } from './Navbar';
import { HistorySidebar } from './HistorySidebar';
import { ReflectionWorkspace } from './ReflectionWorkspace';
import { SamplePortfolioView } from './SamplePortfolioView';
import { EnterpriseDnaView } from './EnterpriseDnaView';
import { ImportPortfolioModal } from './ImportPortfolioModal';
import { TestWalkthroughModal } from './TestWalkthroughModal';
import { PortfolioPlanView } from './PortfolioPlanView';
import { ModernizationAgentPanel } from './ModernizationAgentPanel';
import type { Interaction, AssessmentMode, ChatMessage, EnterpriseWorkload, ProgramAlignment, Disposition6R } from '../types';
import { SAMPLE_PORTFOLIO, formatWorkloadDnaForAssessment } from '../data/samplePortfolio';
import {
  APEX_AEROSPACE_WORKLOADS,
  FINANCIAL_SERVICES_WORKLOADS,
  deriveEvidenceDrivenRecommendation,
  type EnterpriseSampleId,
} from '../data/enterpriseEstates';
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
import { Bot } from 'lucide-react';

interface DashboardProps {
  user?: User | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ user = null }) => {
  const effectiveUid = user?.uid || 'local-evaluation-session';

  const defaultAlignment: ProgramAlignment = {
    userId: effectiveUid,
    programName: 'Enterprise Modernization Program',
    executiveSponsor: 'Chief Information Officer',
    securityApprover: 'Chief Information Security Officer',
    deliveryOwner: 'VP of Platform Engineering',
    businessOutcomes: 'Reduce legacy run cost, eliminate EOL technology risk, and unlock governed cloud analytics.',
    targetPlatform: 'Google Cloud / Vendor-Governed Hybrid',
    riskTolerance: 'Balanced',
    timeHorizonMonths: 18,
    successMeasures: '30% run-cost reduction; 100% critical EOL remediation',
    updatedAt: new Date(0).toISOString(),
  };

  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [importedWorkloads, setImportedWorkloads] = useState<EnterpriseWorkload[]>([]);
  const [activeEstateId, setActiveEstateId] = useState<EnterpriseSampleId>('apex-aerospace');
  const [apexWorkloads, setApexWorkloads] = useState<EnterpriseWorkload[]>(() => structuredClone(APEX_AEROSPACE_WORKLOADS));
  const [financialWorkloads, setFinancialWorkloads] = useState<EnterpriseWorkload[]>(() => structuredClone(FINANCIAL_SERVICES_WORKLOADS));
  const [approvedWorkloads, setApprovedWorkloads] = useState<Record<string, boolean>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'portfolio' | 'dna' | 'workspace' | 'plan'>('portfolio');
  const [programAlignment, setProgramAlignment] = useState<ProgramAlignment>(defaultAlignment);
  const [selectedWorkload, setSelectedWorkload] = useState<EnterpriseWorkload | null>(SAMPLE_PORTFOLIO[0]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(Boolean(user));
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorKind, setErrorKind] = useState<'reasoning' | 'persistence' | 'guardrail' | null>(null);
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isMobileHistoryOpen, setIsMobileHistoryOpen] = useState(false);
  const [isAgentOpen, setIsAgentOpen] = useState(false);

  // Sync user profile and test connection on mount when authenticated
  useEffect(() => {
    if (!user) {
      setIsLoadingHistory(false);
      return;
    }
    testConnection(user.uid);
    syncUserProfile(user).catch((err) => {
      console.warn("Could not sync user profile:", err);
    });
  }, [user]);

  // Subscribe to real-time interactions for this user
  useEffect(() => {
    if (!user) {
      setIsLoadingHistory(false);
      return;
    }
    setIsLoadingHistory(true);
    const unsubscribe = subscribeToUserInteractions(
      user.uid,
      (data) => {
        setInteractions(data);
        setIsLoadingHistory(false);
      },
      (error) => {
        console.error("Failed to load user interactions:", error);
        setIsLoadingHistory(false);
        setSaveStatus('error');
        setErrorKind('persistence');
        setErrorMessage("Unable to fetch Firestore history. Please check permissions.");
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  useEffect(() => {
    if (!user) return;
    return subscribeToProgramAlignment(
      user.uid,
      (alignment) => setProgramAlignment(alignment ? { ...defaultAlignment, ...alignment, userId: user.uid } : { ...defaultAlignment, userId: user.uid }),
      (error) => console.warn('Could not load program alignment:', error),
    );
  }, [user?.uid]);

  // Subscribe to real-time imported workloads for this user
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToUserImportedWorkloads(
      user.uid,
      (workloads) => {
        setImportedWorkloads(workloads);
      },
      (error) => {
        console.error("Failed to load user imported workloads:", error);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const activeInteraction = interactions.find((i) => i.id === selectedId) || null;
  const activeEstateList = activeEstateId === 'financial-services' ? financialWorkloads : apexWorkloads;
  const allWorkloads = [...apexWorkloads, ...financialWorkloads, ...importedWorkloads];

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [currentView, selectedId]);

  const handleUpdateWorkloadDna = (updated: EnterpriseWorkload) => {
    setSelectedWorkload(updated);
    setApexWorkloads((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
    setFinancialWorkloads((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
    setImportedWorkloads((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
  };

  const handleResetSampleWorkload = (workloadId: string) => {
    const origApex = APEX_AEROSPACE_WORKLOADS.find((w) => w.id === workloadId);
    const origFin = FINANCIAL_SERVICES_WORKLOADS.find((w) => w.id === workloadId);
    const original = origApex || origFin;
    if (original) {
      const cloned = structuredClone(original);
      handleUpdateWorkloadDna(cloned);
    }
  };

  const handleApproveGovernance = (workloadId: string, _disposition: Disposition6R) => {
    setApprovedWorkloads((prev) => ({ ...prev, [workloadId]: true }));
  };

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
    setCurrentView('workspace');
    setIsProcessing(true);
    setSaveStatus('saving');
    setErrorKind(null);
    setErrorMessage(null);

    let failureKind: 'reasoning' | 'persistence' = 'reasoning';

    const matchedWorkload = workloadId ? allWorkloads.find((w) => w.id === workloadId) : selectedWorkload || undefined;

    // When exploring in local unauthenticated evaluation session, generate deterministic governed assessment locally
    if (!user) {
      const targetWl = matchedWorkload || SAMPLE_PORTFOLIO[0];
      const rec = deriveEvidenceDrivenRecommendation(targetWl);
      const newId = `assessment_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const now = new Date().toISOString();
      const targetCloud = targetWl.dna.targetState.find((f) => f.id === 'ts1');
      const targetCloudLabel = targetCloud?.status === 'known' ? targetCloud.value : 'Vendor-Neutral Target Platform (Target Cloud Strategy Unverified)';

      const localResponse = [
        '### MODERNIZATION ASSESSMENT',
        `**Workload / Application:** ${targetWl.name}`,
        `**Current-State Summary:** ${targetWl.currentStack} hosted on ${targetWl.hosting} (${targetWl.businessCriticality} criticality; ${targetWl.knownDependencies}).`,
        `**Recommended 6R Disposition:** ${rec.recommended6R}`,
        `**Confidence Score:** ${rec.confidenceScore}%`,
        `**Evidence Completeness:** ${rec.evidenceCompleteness}%`,
        `**Decision Readiness:** ${rec.decisionReadiness}`,
        '',
        '#### 1. Recommendation Rationale',
        `EMOS recommends **${rec.plainEnglish} (${rec.recommended6R})** based on ${rec.evidenceCompleteness}% verified Enterprise DNA evidence. ${rec.topReasons.join(' ')}`,
        '',
        '#### 2. Key Evidence',
        `- **Current Stack & Hosting:** ${targetWl.currentStack} (${targetWl.hosting})`,
        `- **Dependencies:** ${targetWl.knownDependencies}`,
        `- **Target Platform Strategy:** ${targetCloudLabel}`,
        `- **Expected Impact:** ${rec.expectedImpact}`,
        '',
        '#### 3. Alternatives Considered',
        ...rec.alternatives.slice(0, 3).map((a) => `- **${a.disposition} (${a.plainEnglish})**: ${a.whyNot}`),
        '',
        '#### 4. Key Risks & Assumptions',
        ...rec.keyRisks.map((r) => `- ${r}`),
        '',
        '#### 5. Missing Evidence Gaps',
        ...(rec.criticalGaps.length > 0
          ? rec.criticalGaps.map((g) => `- **Critical Gap:** ${g}`)
          : ['- All critical Dependency, TCO Baseline, and Target-State evidence attributes are verified.']),
        '',
        '#### 6. Recommended Next Actions',
        rec.decisionReadiness === 'READY'
          ? '- Record Human Governance Approval and proceed to transformation execution stages.'
          : `- Verify missing critical evidence (${rec.criticalGaps.join(', ')}) in Enterprise DNA before governance approval.`,
      ].join('\n');

      const newInteraction: Interaction = {
        id: newId,
        userId: effectiveUid,
        title: `${targetWl.name} — ${rec.plainEnglish} (${rec.recommended6R})`,
        category: `${targetWl.type} Assessment`,
        mode,
        content,
        geminiResponse: localResponse,
        turns: [],
        createdAt: now,
        updatedAt: now,
        workloadId: targetWl.id,
        workloadName: targetWl.name,
        recommended6R: rec.recommended6R,
        confidenceScore: rec.confidenceScore,
        evidenceCompleteness: rec.evidenceCompleteness,
        decisionReadiness: rec.decisionReadiness,
        trustIndicators: {
          inputValidated: true,
          evidenceGrounded: true,
          schemaValidated: true,
          wasRepaired: false,
        },
      };

      setInteractions((prev) => [newInteraction, ...prev]);
      setSelectedId(newId);
      setSaveStatus('saved');
      setIsProcessing(false);
      return;
    }

    try {
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

      setSelectedId(newId);
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
    setSelectedWorkload(workload);
    const formattedContent = formatWorkloadDnaForAssessment(workload);
    await handleSaveNew({
      content: formattedContent,
      mode: 'assess',
      workloadId: workload.id,
    });
  };

  // Handler: Select workload to view Enterprise DNA
  const handleSelectWorkloadForDna = (workload: EnterpriseWorkload) => {
    setSelectedWorkload(workload);
    setCurrentView('dna');
  };

  // Handler: Open DNA by ID or Name from Workspace
  const handleOpenDna = (workloadNameOrId: string) => {
    const found = allWorkloads.find(
      (w) =>
        w.id.toLowerCase() === workloadNameOrId.toLowerCase() ||
        w.name.toLowerCase() === workloadNameOrId.toLowerCase() ||
        workloadNameOrId.toLowerCase().includes(w.name.toLowerCase()) ||
        w.name.toLowerCase().includes(workloadNameOrId.toLowerCase())
    ) || allWorkloads[0];
    setSelectedWorkload(found);
    setCurrentView('dna');
  };

  // Handler: Import workloads into Firestore (or local memory if unauthenticated)
  const handleImportWorkloads = async (newWorkloads: EnterpriseWorkload[]) => {
    if (!user) {
      setImportedWorkloads((prev) => [...newWorkloads, ...prev]);
      return;
    }
    try {
      await saveImportedWorkloads(user.uid, newWorkloads);
    } catch (err: any) {
      console.error("Failed to save imported workloads:", err);
      throw err;
    }
  };

  // Handler: Delete single imported workload
  const handleDeleteImportedWorkload = async (workloadId: string) => {
    if (!user) {
      setImportedWorkloads((prev) => prev.filter((w) => w.id !== workloadId));
      return;
    }
    try {
      await deleteImportedWorkload(user.uid, workloadId);
      if (selectedWorkload?.id === workloadId) {
        setSelectedWorkload(SAMPLE_PORTFOLIO[0]);
      }
    } catch (err: any) {
      console.error("Failed to delete imported workload:", err);
      setErrorMessage("Failed to delete workload from Firestore.");
    }
  };

  // Handler: Clear all imported workloads
  const handleClearImportedPortfolio = async () => {
    if (!user) {
      setImportedWorkloads([]);
      return;
    }
    try {
      await clearAllImportedWorkloads(user.uid, importedWorkloads);
      setSelectedWorkload(SAMPLE_PORTFOLIO[0]);
    } catch (err: any) {
      console.error("Failed to clear imported portfolio:", err);
      setErrorMessage("Failed to clear imported workloads from Firestore.");
    }
  };

  // Handler: Multi-Turn Follow-Up Discussion
  const handleSendFollowUp = async (interactionId: string, message: string) => {
    const current = interactions.find((i) => i.id === interactionId);
    if (!current) return;

    const now = new Date().toISOString();
    const matchedWorkload = current.workloadId ? allWorkloads.find((w) => w.id === current.workloadId) : selectedWorkload || SAMPLE_PORTFOLIO[0];

    if (!user) {
      const rec = deriveEvidenceDrivenRecommendation(matchedWorkload || SAMPLE_PORTFOLIO[0]);
      const reply = [
        `**Conclusion:** For **${matchedWorkload?.name || current.title}**, EMOS maintains **${rec.plainEnglish} (${rec.recommended6R})** at **${current.confidenceScore ?? rec.confidenceScore}%** confidence (${current.decisionReadiness ?? rec.decisionReadiness}).`,
        '',
        ...rec.topReasons.map((r) => `- ${r}`),
        '',
        `**Recommended Next Action:** ${
          (current.decisionReadiness || rec.decisionReadiness) === 'READY'
            ? 'Approve Human Governance sign-off and advance transformation execution stages.'
            : `Verify remaining critical evidence gaps (${rec.criticalGaps.join(', ')}) in Enterprise DNA.`
        }`,
      ].join('\n');

      const updatedTurns: ChatMessage[] = [
        ...(current.turns || []),
        { role: 'user', content: message, timestamp: now },
        { role: 'model', content: reply, timestamp: new Date().toISOString(), modelUsed: 'emos-governed-agent' },
      ];
      setInteractions((prev) =>
        prev.map((item) => (item.id === interactionId ? { ...item, turns: updatedTurns, updatedAt: new Date().toISOString() } : item))
      );
      setSaveStatus('saved');
      return;
    }

    setIsProcessing(true);
    setSaveStatus('saving');
    setErrorKind(null);
    setErrorMessage(null);

    let failureKind: 'reasoning' | 'persistence' = 'reasoning';

    const historyList: ChatMessage[] = [
      { role: 'user', content: current.content, timestamp: current.createdAt },
      { role: 'model', content: current.geminiResponse, timestamp: current.createdAt },
      ...(current.turns || []),
    ];

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
    if (!user) {
      setInteractions((prev) => prev.filter((i) => i.id !== interactionId));
      if (selectedId === interactionId) setSelectedId(null);
      return;
    }
    try {
      await deleteInteraction(user.uid, interactionId);
      if (selectedId === interactionId) {
        setSelectedId(null);
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
    if (!user) return;
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

  return (
    <div className="min-h-screen bg-[var(--emos-bg)] text-[var(--emos-text-primary)] flex flex-col font-sans selection:bg-[#A88554] selection:text-black transition-colors">
      <Navbar
        user={user}
        currentView={currentView}
        selectedId={selectedId}
        assessmentCount={interactions.length}
        onNavigate={(view) => {
          if (view === 'portfolio') {
            setCurrentView('portfolio');
            setIsMobileHistoryOpen(false);
          } else if (view === 'decision-intelligence') {
            setSelectedId(null);
            setCurrentView('workspace');
            setIsMobileHistoryOpen(false);
          } else if (view === 'assessments') {
            if (window.innerWidth < 1024) {
              setIsMobileHistoryOpen(true);
            } else {
              if (!selectedId && interactions.length > 0) {
                setSelectedId(interactions[0].id);
              }
            }
            setCurrentView('workspace');
          } else if (view === 'plan') {
            setCurrentView('plan');
            setIsMobileHistoryOpen(false);
          }
        }}
        onNewAssessment={() => {
          setSelectedId(null);
          setCurrentView('workspace');
          setIsMobileHistoryOpen(false);
        }}
        onOpenWalkthrough={() => setIsWalkthroughOpen(true)}
      />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden max-w-7xl w-full mx-auto border-x border-[var(--emos-border-subtle)] relative">
        {/* Desktop History Sidebar */}
        <div className="hidden lg:flex w-80 shrink-0 h-full">
          <HistorySidebar
            interactions={interactions}
            selectedId={currentView === 'workspace' ? selectedId : null}
            currentView={currentView}
            onOpenPortfolio={() => setCurrentView('portfolio')}
            onSelect={(id) => {
              setSelectedId(id);
              setCurrentView('workspace');
            }}
            onDelete={handleDelete}
            isLoading={isLoadingHistory}
          />
        </div>

        {/* Mobile / Tablet History Drawer Overlay */}
        {isMobileHistoryOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileHistoryOpen(false)}
            />
            <div className="relative w-full max-w-xs sm:max-w-sm h-full bg-[var(--emos-bg-secondary)] shadow-2xl z-50 flex flex-col">
              <HistorySidebar
                interactions={interactions}
                selectedId={currentView === 'workspace' ? selectedId : null}
                currentView={currentView}
                onOpenPortfolio={() => {
                  setCurrentView('portfolio');
                  setIsMobileHistoryOpen(false);
                }}
                onSelect={(id) => {
                  setSelectedId(id);
                  setCurrentView('workspace');
                  setIsMobileHistoryOpen(false);
                }}
                onDelete={handleDelete}
                isLoading={isLoadingHistory}
                onCloseMobile={() => setIsMobileHistoryOpen(false)}
              />
            </div>
          </div>
        )}

        {currentView === 'portfolio' && (
          <SamplePortfolioView
            onSelectWorkload={handleSelectWorkloadForDna}
            onAssessWorkload={handleAssessWorkload}
            importedWorkloads={importedWorkloads}
            activeEstateId={activeEstateId}
            onChangeEstate={(id) => {
              setActiveEstateId(id);
              if (id === 'financial-services') {
                setSelectedWorkload(financialWorkloads[0]);
              } else {
                setSelectedWorkload(apexWorkloads[0]);
              }
            }}
            estateWorkloads={activeEstateList}
            interactions={interactions}
            onOpenImportModal={() => setIsImportModalOpen(true)}
            onOpenPlan={() => setCurrentView('plan')}
            onDeleteImportedWorkload={handleDeleteImportedWorkload}
            onClearImportedPortfolio={handleClearImportedPortfolio}
            isProcessing={isProcessing}
          />
        )}

        {currentView === 'dna' && selectedWorkload && (
          <EnterpriseDnaView
            workload={selectedWorkload}
            onBackToPortfolio={() => setCurrentView('portfolio')}
            onAssess={handleAssessWorkload}
            onUpdateWorkloadDna={handleUpdateWorkloadDna}
            onResetSampleWorkload={handleResetSampleWorkload}
            isProcessing={isProcessing}
          />
        )}

        {currentView === 'workspace' && (
          <ReflectionWorkspace
            activeInteraction={activeInteraction}
            selectedWorkload={selectedWorkload}
            isGovernanceApproved={Boolean(selectedWorkload && approvedWorkloads[selectedWorkload.id])}
            onApproveGovernance={(wlId, disp) => handleApproveGovernance(wlId, disp)}
            onOpenPlanAndExecute={() => setCurrentView('plan')}
            onToggleAgentPanel={() => setIsAgentOpen((prev) => !prev)}
            onSaveNew={handleSaveNew}
            onSendFollowUp={handleSendFollowUp}
            onRetrySave={handleRetrySave}
            onOpenPortfolio={() => setCurrentView('portfolio')}
            onOpenDna={handleOpenDna}
            isProcessing={isProcessing}
            saveStatus={saveStatus}
            errorMessage={errorMessage}
            errorKind={errorKind}
          />
        )}

        {currentView === 'plan' && (
          <PortfolioPlanView
            workloads={[...activeEstateList, ...importedWorkloads]}
            interactions={interactions}
            alignment={programAlignment}
            selectedWorkload={selectedWorkload}
            approvedWorkloads={approvedWorkloads}
            onApproveWorkload={handleApproveGovernance}
            onSaveAlignment={async (alignment) => {
              if (user) {
                await saveProgramAlignment(user.uid, alignment);
              }
              setProgramAlignment({ ...alignment, userId: effectiveUid, updatedAt: new Date().toISOString() });
            }}
            onBack={() => setCurrentView('portfolio')}
          />
        )}

        {/* Collapsible Right-Hand Modernization Agent Panel */}
        {isAgentOpen && selectedWorkload && (
          <div className="fixed inset-y-0 right-0 z-40 flex lg:static lg:z-auto">
            <ModernizationAgentPanel
              workload={selectedWorkload}
              activeInteraction={activeInteraction}
              onSendLiveFollowUp={handleSendFollowUp}
              isProcessing={isProcessing}
              isOpen={isAgentOpen}
              onClose={() => setIsAgentOpen(false)}
              variant="drawer"
            />
          </div>
        )}
      </div>

      {/* Floating Modernization Agent Launcher Button */}
      {!isAgentOpen && selectedWorkload && (
        <button
          id="floating-agent-toggle-btn"
          type="button"
          onClick={() => setIsAgentOpen(true)}
          aria-label="Open Modernization Agent"
          className="fixed bottom-5 right-5 z-30 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#A88554] to-[#E5C492] px-4 py-2.5 text-xs font-bold text-black shadow-2xl hover:scale-103 transition-transform cursor-pointer"
        >
          <Bot className="w-4 h-4" />
          <span>Ask Modernization Agent</span>
        </button>
      )}

      <ImportPortfolioModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportWorkloads}
        userId={effectiveUid}
      />

      <TestWalkthroughModal
        isOpen={isWalkthroughOpen}
        onClose={() => setIsWalkthroughOpen(false)}
      />
    </div>
  );
};
