import React, { useState, useEffect, useCallback } from 'react';
import type { User } from 'firebase/auth';
import { Navbar } from './Navbar';
import { HistorySidebar } from './HistorySidebar';
import { ReflectionWorkspace } from './ReflectionWorkspace';
import { SamplePortfolioView } from './SamplePortfolioView';
import { EnterpriseDnaView } from './EnterpriseDnaView';
import { ImportPortfolioModal } from './ImportPortfolioModal';
import { TestWalkthroughModal } from './TestWalkthroughModal';
import { PortfolioPlanView } from './PortfolioPlanView';
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'portfolio' | 'dna' | 'workspace' | 'plan'>('portfolio');
  const [programAlignment, setProgramAlignment] = useState<ProgramAlignment>(defaultAlignment);
  const [selectedWorkload, setSelectedWorkload] = useState<EnterpriseWorkload | null>(SAMPLE_PORTFOLIO[0]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isMobileHistoryOpen, setIsMobileHistoryOpen] = useState(false);

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
      },
      (error) => {
        console.error("Failed to load user interactions:", error);
        setIsLoadingHistory(false);
        setSaveStatus('error');
        setErrorMessage("Unable to fetch Firestore history. Please check permissions.");
      }
    );

    return () => unsubscribe();
  }, [user.uid]);

  useEffect(() => subscribeToProgramAlignment(
    user.uid,
    (alignment) => setProgramAlignment(alignment ? { ...defaultAlignment, ...alignment, userId: user.uid } : { ...defaultAlignment, userId: user.uid }),
    (error) => console.warn('Could not load program alignment:', error),
  ), [user.uid]);

  // Subscribe to real-time imported workloads for this user
  useEffect(() => {
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
  }, [user.uid]);

  const activeInteraction = interactions.find((i) => i.id === selectedId) || null;

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
    setErrorMessage(null);

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
        trustIndicators: attributes.trustIndicators || chatRes.trustIndicators || {
          inputValidated: true,
          evidenceGrounded: attributes.isGrounded ?? true,
          schemaValidated: true,
          wasRepaired: attributes.wasRepaired,
        },
      };

      // 2. Guaranteed Transaction Verification: persist to Cloud Firestore
      await saveInteraction(user.uid, newInteraction);

      setSelectedId(newId);
      setSaveStatus('saved');
    } catch (err: any) {
      console.error("Failed to generate or save assessment:", err);
      setSaveStatus('error');
      setErrorMessage(err?.message || "Failed to generate assessment or persist to Firestore.");
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
    const allWorkloads = [...SAMPLE_PORTFOLIO, ...importedWorkloads];
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

  // Handler: Import workloads into Firestore
  const handleImportWorkloads = async (newWorkloads: EnterpriseWorkload[]) => {
    try {
      await saveImportedWorkloads(user.uid, newWorkloads);
    } catch (err: any) {
      console.error("Failed to save imported workloads:", err);
      throw err;
    }
  };

  // Handler: Delete single imported workload
  const handleDeleteImportedWorkload = async (workloadId: string) => {
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

    setIsProcessing(true);
    setSaveStatus('saving');
    setErrorMessage(null);

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

      // If follow-up refined the assessment, update canonical attributes consistently
      const updatedAttrs = response.attributes;
      const updatePayload: Partial<Interaction> = {
        turns: updatedTurns,
      };
      if (updatedAttrs.recommended6R) {
        updatePayload.recommended6R = updatedAttrs.recommended6R;
      }
      if (typeof updatedAttrs.confidenceScore === 'number') {
        updatePayload.confidenceScore = updatedAttrs.confidenceScore;
      }
      if (typeof updatedAttrs.evidenceCompleteness === 'number') {
        updatePayload.evidenceCompleteness = updatedAttrs.evidenceCompleteness;
      }
      if (updatedAttrs.decisionReadiness) {
        updatePayload.decisionReadiness = updatedAttrs.decisionReadiness;
      }
      if (updatedAttrs.workloadName) {
        updatePayload.workloadName = updatedAttrs.workloadName;
      }
      if (updatedAttrs.trustIndicators) {
        updatePayload.trustIndicators = updatedAttrs.trustIndicators;
      }

      await updateInteraction(user.uid, interactionId, updatePayload);

      setSaveStatus('saved');
    } catch (err: any) {
      console.error("Failed to process follow-up:", err);
      setSaveStatus('error');
      setErrorMessage(err?.message || "Failed to process follow-up with Gemini.");
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
        setSelectedId(null);
      }
    } catch (err: any) {
      console.error("Failed to delete assessment:", err);
      setSaveStatus('error');
      setErrorMessage("Failed to delete assessment from Firestore.");
    }
  };

  // Handler: Retry Save
  const handleRetrySave = async (interaction: Interaction) => {
    setSaveStatus('saving');
    setErrorMessage(null);
    try {
      await saveInteraction(user.uid, interaction);
      setSaveStatus('saved');
    } catch (err: any) {
      setSaveStatus('error');
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
            onNew={() => {
              setSelectedId(null);
              setCurrentView('workspace');
            }}
            onDelete={handleDelete}
            isLoading={isLoadingHistory}
          />
        </div>

        {/* Mobile / Tablet History Drawer Overlay */}
        {isMobileHistoryOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileHistoryOpen(false)}
            />
            {/* Drawer Container */}
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
                onNew={() => {
                  setSelectedId(null);
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
            onOpenImportModal={() => setIsImportModalOpen(true)}
            onDeleteImportedWorkload={handleDeleteImportedWorkload}
            onClearImportedPortfolio={handleClearImportedPortfolio}
            isProcessing={isProcessing}
            onOpenPlan={() => setCurrentView('plan')}
          />
        )}

        {currentView === 'dna' && selectedWorkload && (
          <EnterpriseDnaView
            workload={selectedWorkload}
            onBackToPortfolio={() => setCurrentView('portfolio')}
            onAssess={handleAssessWorkload}
            isProcessing={isProcessing}
          />
        )}

        {currentView === 'workspace' && (
          <ReflectionWorkspace
            activeInteraction={activeInteraction}
            onSaveNew={handleSaveNew}
            onSendFollowUp={handleSendFollowUp}
            onRetrySave={handleRetrySave}
            onOpenPortfolio={() => setCurrentView('portfolio')}
            onOpenDna={handleOpenDna}
            onToggleMobileHistory={() => setIsMobileHistoryOpen(true)}
            isProcessing={isProcessing}
            saveStatus={saveStatus}
            errorMessage={errorMessage}
          />
        )}

        {currentView === 'plan' && (
          <PortfolioPlanView
            workloads={[...SAMPLE_PORTFOLIO, ...importedWorkloads]}
            interactions={interactions}
            alignment={programAlignment}
            onSaveAlignment={async (alignment) => {
              await saveProgramAlignment(user.uid, alignment);
              setProgramAlignment({ ...alignment, userId: user.uid, updatedAt: new Date().toISOString() });
            }}
            onBack={() => setCurrentView('portfolio')}
          />
        )}
      </div>

      <ImportPortfolioModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportWorkloads}
        userId={user.uid}
      />

      <TestWalkthroughModal
        isOpen={isWalkthroughOpen}
        onClose={() => setIsWalkthroughOpen(false)}
      />
    </div>
  );
};
