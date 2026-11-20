// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '../src/lib/theme';
import { SamplePortfolioView } from '../src/components/SamplePortfolioView';
import { EnterpriseDnaView } from '../src/components/EnterpriseDnaView';
import { ReflectionWorkspace } from '../src/components/ReflectionWorkspace';
import { PortfolioPlanView } from '../src/components/PortfolioPlanView';
import { ModernizationAgentPanel, runGovernedAgentQuery } from '../src/components/ModernizationAgentPanel';
import { CapabilityCue } from '../src/components/CapabilityCue';
import { ImportPortfolioModal } from '../src/components/ImportPortfolioModal';
import { LearningCenterPage } from '../src/components/LearningCenterPage';
import { Dashboard } from '../src/components/Dashboard';
import {
  APEX_AEROSPACE_WORKLOADS,
  FINANCIAL_SERVICES_WORKLOADS,
  ENTERPRISE_ESTATE_PROFILES,
  deriveEvidenceDrivenRecommendation,
} from '../src/data/enterpriseEstates';
import { SAMPLE_PORTFOLIO } from '../src/data/samplePortfolio';
import { SAMPLE_DATASETS } from '../src/data/sampleCsvs';
import { buildDefaultLifecycleState } from '../src/lib/transformationEngine';
import { PLAIN_ENGLISH_6R, CAPABILITY_CUES } from '../src/config/capabilityCues';
import type { Disposition6R, Interaction, ProgramAlignment } from '../src/types';

const withTheme = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

const sampleAlignment: ProgramAlignment = {
  userId: 'user-1',
  programName: 'Apex Enterprise Modernization',
  executiveSponsor: 'CIO',
  securityApprover: 'CISO',
  deliveryOwner: 'VP Engineering',
  businessOutcomes: 'Reduce run cost and retire legacy risk',
  targetPlatform: 'Google Cloud',
  riskTolerance: 'Balanced',
  timeHorizonMonths: 18,
  successMeasures: '30% TCO reduction',
  updatedAt: '2026-09-10T00:00:00.000Z',
};

describe('EMOS v2 Full-Lifecycle Autonomous Implementation', () => {
  beforeAll(() => {
    window.scrollTo = vi.fn();
    Element.prototype.scrollIntoView = vi.fn();
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('represents Apex Aerospace (10,000+ assets) and Financial Services using the same unified engine', () => {
    const apex = ENTERPRISE_ESTATE_PROFILES['apex-aerospace'];
    const fin = ENTERPRISE_ESTATE_PROFILES['financial-services'];

    expect(apex.totalAssetsRepresented).toBeGreaterThanOrEqual(10000);
    expect(apex.domains.length).toBeGreaterThanOrEqual(6);
    expect(fin.domains.length).toBeGreaterThanOrEqual(5);
    expect(APEX_AEROSPACE_WORKLOADS).toHaveLength(6);
    expect(FINANCIAL_SERVICES_WORKLOADS).toHaveLength(6);

    // Ensure no proprietary real-company data claims
    expect(apex.disclaimer).toMatch(/wholly synthetic/i);
  });

  it('derives all six 6R dispositions from evidence across the enterprise estates without hardcoded input labels', () => {
    for (const ds of SAMPLE_DATASETS) {
      expect(ds.csvContent).not.toContain('expected_6r');
      expect(ds.csvContent).not.toContain('expected_reason');
    }

    const allWorkloads = [...APEX_AEROSPACE_WORKLOADS, ...FINANCIAL_SERVICES_WORKLOADS];
    const derivedDispositions = new Set(allWorkloads.map((w) => deriveEvidenceDrivenRecommendation(w).recommended6R));

    expect(derivedDispositions.has('Retain')).toBe(true);
    expect(derivedDispositions.has('Retire')).toBe(true);
    expect(derivedDispositions.has('Rehost')).toBe(true);
    expect(derivedDispositions.has('Replatform')).toBe(true);
    expect(derivedDispositions.has('Refactor')).toBe(true);
    expect(derivedDispositions.has('Repurchase')).toBe(true);
  });

  it('renders Command Center KPIs, 4 Start entry paths, and Spatial Portfolio Topology view', () => {
    const onChangeEstate = vi.fn();
    withTheme(
      <SamplePortfolioView
        onSelectWorkload={vi.fn()}
        onAssessWorkload={vi.fn()}
        onOpenImportModal={vi.fn()}
        onChangeEstate={onChangeEstate}
      />,
    );

    // Command Center KPIs
    expect(screen.getByLabelText('Command Center Attention Summary')).toBeInTheDocument();
    expect(screen.getByText(/What Needs My Attention\?/i)).toBeInTheDocument();

    // 4 Start Entry Paths
    expect(screen.getByText('Explore Apex Aerospace')).toBeInTheDocument();
    expect(screen.getByText('Explore Financial Services')).toBeInTheDocument();
    expect(screen.getByText('Upload Your Portfolio')).toBeInTheDocument();
    expect(screen.getByText('Connect Enterprise Sources')).toBeInTheDocument();

    // Switch to Financial Services
    fireEvent.click(screen.getByText('Explore Financial Services'));
    expect(onChangeEstate).toHaveBeenCalledWith('financial-services');
    expect(screen.getByText('Fixed Income Clearing & Settlement Engine')).toBeInTheDocument();

    // Switch to Spatial Topology view
    fireEvent.click(screen.getByRole('button', { name: /Spatial Topology/i }));
    expect(screen.getByLabelText('Spatial Portfolio Domain Topology')).toBeInTheDocument();
  });

  it('supports controlled evidence verification, individual attribute editing, Reset Sample, and Spatial DNA graph', () => {
    const onUpdateWorkloadDna = vi.fn();
    const onResetSampleWorkload = vi.fn();
    const edw = structuredClone(SAMPLE_PORTFOLIO[1]); // Enterprise Data Warehouse (61% NEEDS EVIDENCE)

    withTheme(
      <EnterpriseDnaView
        workload={edw}
        onBackToPortfolio={vi.fn()}
        onAssess={vi.fn()}
        onUpdateWorkloadDna={onUpdateWorkloadDna}
        onResetSampleWorkload={onResetSampleWorkload}
      />,
    );

    expect(screen.getByText('61%')).toBeInTheDocument();
    expect(screen.getByText('Gate: NEEDS EVIDENCE')).toBeInTheDocument();

    // Click Verify Evidence (Google Cloud Target) -> jumps from 61% NEEDS EVIDENCE to 100% READY
    fireEvent.click(screen.getByRole('button', { name: /Verify Evidence \(Google Cloud Target\)/i }));
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('Gate: READY')).toBeInTheDocument();
    expect(onUpdateWorkloadDna).toHaveBeenCalled();

    // Switch to Spatial DNA Graph and back to 2D Structured View
    fireEvent.click(screen.getByRole('button', { name: /Spatial DNA Graph/i }));
    expect(screen.getByLabelText('Spatial Enterprise DNA Relationship Topology')).toBeInTheDocument();
    expect(screen.getByText('Central System Object')).toBeInTheDocument();

    // Reset Sample
    fireEvent.click(screen.getByRole('button', { name: /Reset Sample/i }));
    expect(onResetSampleWorkload).toHaveBeenCalledWith(edw.id);
  });

  it('builds complete end-to-end transformation workflows, outcomes, and learnings for all 6 Rs', () => {
    const dispositions: Disposition6R[] = ['Retain', 'Retire', 'Rehost', 'Replatform', 'Refactor', 'Repurchase'];

    for (const disp of dispositions) {
      const state = buildDefaultLifecycleState(SAMPLE_PORTFOLIO[0], disp, true);
      expect(state.disposition).toBe(disp);
      expect(state.plainEnglish).toBe(PLAIN_ENGLISH_6R[disp].plainEnglish);
      expect(state.stages.map((s) => s.label)).toEqual(PLAIN_ENGLISH_6R[disp].stages);
      expect(state.outcomes.length).toBeGreaterThanOrEqual(3);
      expect(state.learnings.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('renders Execute, Measure, and Learn workspaces in PortfolioPlanView and advances execution stages', () => {
    const onApproveWorkload = vi.fn();
    withTheme(
      <PortfolioPlanView
        workloads={APEX_AEROSPACE_WORKLOADS}
        interactions={[]}
        alignment={sampleAlignment}
        approvedWorkloads={{ 'customer-analytics': true }}
        onApproveWorkload={onApproveWorkload}
        onSaveAlignment={async () => undefined}
        onBack={vi.fn()}
      />,
    );

    // Switch to 4. Execute
    fireEvent.click(screen.getByRole('button', { name: /4\. Execute/i }));
    expect(screen.getByLabelText('Current journey stage: Execute')).toBeInTheDocument();
    expect(screen.getByLabelText('Transformation Execution Workspace')).toBeInTheDocument();
    expect(screen.getByText(/1\. Current State/i)).toBeInTheDocument();
    expect(screen.getByText(/2\. Governed EMOS Decision/i)).toBeInTheDocument();
    expect(screen.getByText(/3\. Target State/i)).toBeInTheDocument();

    // Switch across all 6R disposition tabs in Execute view
    fireEvent.click(screen.getByRole('button', { name: 'Retire' }));
    expect(screen.getByText(/Consumer Transition/i)).toBeInTheDocument();

    // Switch to 5. Measure
    fireEvent.click(screen.getByRole('button', { name: /5\. Measure/i }));
    expect(screen.getByLabelText('Current journey stage: Measure')).toBeInTheDocument();
    expect(screen.getByLabelText('Measure Transformation Outcomes')).toBeInTheDocument();
    expect(screen.getAllByText('Baseline').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Target').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Observed').length).toBeGreaterThan(0);

    // Switch to 6. Learn
    fireEvent.click(screen.getByRole('button', { name: /6\. Learn/i }));
    expect(screen.getByLabelText('Current journey stage: Learn')).toBeInTheDocument();
    expect(screen.getByLabelText('Capture Transformation Learning')).toBeInTheDocument();
    expect(screen.getByText(/1\. Original Assumption/i)).toBeInTheDocument();

    // Record a new lesson learned
    fireEvent.change(screen.getByLabelText('Record lesson learned'), {
      target: { value: 'Verify partner allowlists 14 days before cutover.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Record Lesson into Playbook/i }));
    expect(screen.getByText('Verify partner allowlists 14 days before cutover.')).toBeInTheDocument();
  });

  it('implements one governed Modernization Agent with tool trace and 1 conclusion + max 3 bullets + 1 next action', () => {
    const wl = SAMPLE_PORTFOLIO[1];
    const lifecycle = buildDefaultLifecycleState(wl, 'Replatform', false);
    const reply = runGovernedAgentQuery('Why not another option?', wl, lifecycle);

    expect(reply.conclusion.length).toBeGreaterThan(10);
    expect(reply.bullets.length).toBeLessThanOrEqual(3);
    expect(reply.nextAction.length).toBeGreaterThan(10);
    expect(reply.toolsCalled.some((t) => t.toolName === 'inspect_workload_dna')).toBe(true);
    expect(reply.toolsCalled.some((t) => t.toolName === 'compare_6r_dispositions')).toBe(true);

    withTheme(<ModernizationAgentPanel workload={wl} lifecycleState={lifecycle} />);
    expect(screen.getByText('Modernization Agent')).toBeInTheDocument();
    expect(screen.getByText(/Agent Recommends → EMOS Validates → Human Approves/i)).toBeInTheDocument();

    // Drill-down buttons: Explain More, Show Evidence, Show Reasoning
    fireEvent.click(screen.getByRole('button', { name: /Show Reasoning/i }));
    expect(screen.getByText(/Agent Tool Trace & Guardrail Verification/i)).toBeInTheDocument();
    expect(screen.getByText(/inspect_workload_dna\(\)/i)).toBeInTheDocument();
  });

  it('provides keyboard and tap accessible Capability Cues for all core concepts and 6Rs', () => {
    expect(Object.keys(CAPABILITY_CUES)).toEqual(
      expect.arrayContaining([
        'enterprise-dna',
        'modernization-agent',
        'evidence-readiness',
        'retain',
        'retire',
        'rehost',
        'replatform',
        'refactor',
        'repurchase',
        'governance',
        'execute',
        'measure',
        'learn',
      ]),
    );

    withTheme(<CapabilityCue cueId="replatform" showLabel={true} />);
    const trigger = screen.getByRole('button', { name: /About Replatform/i });
    fireEvent.click(trigger);

    expect(screen.getByRole('dialog', { name: /Replatform explanation/i })).toBeInTheDocument();
    expect(screen.getByText(/Move it to a better platform/i)).toBeInTheDocument();
    expect(screen.getByText(/What it is:/i)).toBeInTheDocument();
    expect(screen.getByText(/Problem solved:/i)).toBeInTheDocument();

    // Escape closes dialog
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders Plain-English decision summary hero in ReflectionWorkspace with Top 3 reasons and Compare All 6R Options', () => {
    const readyInteraction: Interaction = {
      id: 'int-ready-1',
      userId: 'user-1',
      title: 'Enterprise Data Warehouse Modernization',
      category: 'Data Platform',
      mode: 'assess',
      content: 'Verified EDW evidence',
      geminiResponse: '**Recommended 6R Disposition:** Replatform',
      turns: [],
      createdAt: '2026-09-10T00:00:00.000Z',
      updatedAt: '2026-09-10T00:00:00.000Z',
      workloadId: 'enterprise-data-warehouse',
      recommended6R: 'Replatform',
      confidenceScore: 92,
      evidenceCompleteness: 94,
      decisionReadiness: 'READY',
    };

    const onApproveGovernance = vi.fn();
    withTheme(
      <ReflectionWorkspace
        activeInteraction={readyInteraction}
        selectedWorkload={SAMPLE_PORTFOLIO[1]}
        onApproveGovernance={onApproveGovernance}
        onSaveNew={async () => undefined}
        onSendFollowUp={async () => undefined}
        isProcessing={false}
        saveStatus="saved"
        errorMessage={null}
      />,
    );

    expect(screen.getByLabelText('Executive Decision Summary')).toBeInTheDocument();
    expect(screen.getByText('Move it to a better platform')).toBeInTheDocument();
    expect(screen.getByText(/Why\? \(Top 3 Evidence-Backed Reasons\)/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Compare All 6R Options/i }));
    expect(screen.getByText(/Why Not the Alternative 6R Dispositions\?/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Approve Decision & Proceed to Plan\/Execute/i }));
    expect(onApproveGovernance).toHaveBeenCalledWith('enterprise-data-warehouse', 'Replatform');
  });

  it('shows Here is What EMOS Understood summary before raw tables on portfolio upload', async () => {
    withTheme(
      <ImportPortfolioModal
        isOpen={true}
        onClose={vi.fn()}
        onImportSuccess={async () => undefined}
        userId="user-1"
      />,
    );

    const csvFile = new File(
      [SAMPLE_DATASETS[0].csvContent],
      'diversified-enterprise-portfolio.csv',
      { type: 'text/csv' },
    );
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [csvFile] } });

    await waitFor(() => {
      expect(screen.getByText(/Here's What EMOS Understood/i)).toBeInTheDocument();
    });
    expect(screen.getByText('Systems Discovered')).toBeInTheDocument();
    expect(screen.getByText('Business Capabilities')).toBeInTheDocument();
    expect(screen.getByText('Ready for Assessment')).toBeInTheDocument();
    expect(screen.getByText('Need More Evidence')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Review Portfolio \(5\)/i })).toBeInTheDocument();
  });

  it('deep-tests Replatform end-to-end: 61% NEEDS EVIDENCE -> Verify Evidence -> 100% READY -> Assess -> Approve -> Execute -> Measure -> Learn', () => {
    withTheme(<Dashboard user={null} />);

    // 1. Start in Portfolio & Command Center (Apex Aerospace)
    expect(screen.getByLabelText('Command Center Attention Summary')).toBeInTheDocument();
    expect(screen.getByText('Enterprise Data Warehouse')).toBeInTheDocument();

    // 2. Open Enterprise DNA for Enterprise Data Warehouse (61% NEEDS EVIDENCE)
    const edwCardButtons = screen.getAllByRole('button', { name: /View Enterprise DNA/i });
    fireEvent.click(edwCardButtons[1]); // 2nd card is Enterprise Data Warehouse

    expect(screen.getByLabelText('Current journey stage: Understand')).toBeInTheDocument();
    expect(screen.getByText('61%')).toBeInTheDocument();
    expect(screen.getByText('Gate: NEEDS EVIDENCE')).toBeInTheDocument();

    // 3. Verify missing critical evidence with Google Cloud target strategy -> 100% READY
    fireEvent.click(screen.getByRole('button', { name: /Verify Evidence \(Google Cloud Target\)/i }));
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('Gate: READY')).toBeInTheDocument();

    // 4. Click Assess for Modernization -> transitions to 6R Decision Workspace with Replatform READY
    fireEvent.click(screen.getAllByRole('button', { name: /Assess for Modernization/i })[0]);
    expect(screen.getByLabelText('Executive Decision Summary')).toBeInTheDocument();
    expect(screen.getByText('Move it to a better platform')).toBeInTheDocument();

    // 5. Approve Decision & Proceed to Plan/Execute -> confirms approval, then open Transformation Execution
    fireEvent.click(screen.getByRole('button', { name: /Approve Decision & Proceed to Plan\/Execute/i }));
    const openExecBtn = screen.getByRole('button', { name: /Approved · Open Transformation Execution/i });
    expect(openExecBtn).toBeInTheDocument();
    fireEvent.click(openExecBtn);

    fireEvent.click(screen.getByRole('button', { name: /4\. Execute/i }));
    expect(screen.getByLabelText('Transformation Execution Workspace')).toBeInTheDocument();

    // Select Enterprise Data Warehouse in the lifecycle workload selector
    fireEvent.change(screen.getByLabelText('Select workload for transformation lifecycle'), {
      target: { value: 'enterprise-data-warehouse' },
    });
    expect(screen.getAllByText(/Prepare Target Platform/i).length).toBeGreaterThan(0);

    // 6. Complete active checkpoint gate in Execute workspace
    const advanceButtons = screen.getAllByRole('button', {
      name: /Complete Current Checkpoint Gate|Resolve Blocker & Proceed/i,
    });
    expect(advanceButtons.length).toBeGreaterThan(0);
    fireEvent.click(advanceButtons[0]);

    // 7. Inspect 5. Measure and 6. Learn for Replatform
    fireEvent.click(screen.getByRole('button', { name: /5\. Measure/i }));
    expect(screen.getByLabelText('Measure Transformation Outcomes')).toBeInTheDocument();
    expect(screen.getByText('3-Year Platform TCO')).toBeInTheDocument();
    expect(screen.getByText('Analytical / Batch Throughput')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /6\. Learn/i }));
    expect(screen.getByLabelText('Capture Transformation Learning')).toBeInTheDocument();
  });

  it('deep-tests Retire end-to-end and smoke-tests Retain, Rehost, Refactor, and Repurchase across Execute, Measure, and Learn', () => {
    const retireWorkload = APEX_AEROSPACE_WORKLOADS.find(
      (w) => deriveEvidenceDrivenRecommendation(w).recommended6R === 'Retire',
    )!;
    const retireRec = deriveEvidenceDrivenRecommendation(retireWorkload);
    expect(retireRec.recommended6R).toBe('Retire');
    expect(retireRec.plainEnglish).toBe('Safely shut it down');
    expect(retireRec.decisionReadiness).toBe('READY');

    withTheme(
      <PortfolioPlanView
        workloads={APEX_AEROSPACE_WORKLOADS}
        interactions={[]}
        alignment={sampleAlignment}
        approvedWorkloads={{ [retireWorkload.id]: true }}
        onApproveWorkload={vi.fn()}
        onSaveAlignment={async () => undefined}
        onBack={vi.fn()}
      />,
    );

    // Switch to 4. Execute and select the Retire workload
    fireEvent.click(screen.getByRole('button', { name: /4\. Execute/i }));
    fireEvent.change(screen.getByLabelText('Select workload for transformation lifecycle'), {
      target: { value: retireWorkload.id },
    });
    expect(screen.getByText('Safely shut it down')).toBeInTheDocument();
    expect(screen.getByText('Consumer Transition')).toBeInTheDocument();
    expect(screen.getByText('Decommission')).toBeInTheDocument();
    expect(screen.getByText('Validate Closure')).toBeInTheDocument();

    // Complete Archive stage checkpoint in Retire workflow
    const advanceBtn = screen.getAllByRole('button', {
      name: /Complete Current Checkpoint Gate|Resolve Blocker & Proceed/i,
    })[0];
    fireEvent.click(advanceBtn);

    // Check Measure for Retire
    fireEvent.click(screen.getByRole('button', { name: /5\. Measure/i }));
    expect(screen.getByText('Annual Run & License Cost')).toBeInTheDocument();
    expect(screen.getByText('EOL Security Vulnerabilities')).toBeInTheDocument();

    // Smoke-test Retain, Rehost, Refactor, and Repurchase in Execute view
    fireEvent.click(screen.getByRole('button', { name: /4\. Execute/i }));

    fireEvent.click(screen.getByRole('button', { name: 'Retain' }));
    expect(screen.getByText('Keep it as-is')).toBeInTheDocument();
    expect(screen.getAllByText(/Review Outcome/i).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'Rehost' }));
    expect(screen.getByText('Move it largely unchanged')).toBeInTheDocument();
    expect(screen.getAllByText(/Prepare Destination/i).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'Refactor' }));
    expect(screen.getByText('Redesign parts of it')).toBeInTheDocument();
    expect(screen.getAllByText(/Redesign\/Decompose/i).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'Repurchase' }));
    expect(screen.getByText('Replace it with another product')).toBeInTheDocument();
    expect(screen.getAllByText(/Select Replacement/i).length).toBeGreaterThan(0);
  });

  it('renders Learning Center with 16 90-second capability & 6R topic guides, interactive transcripts, and responsive viewports', () => {
    withTheme(<LearningCenterPage onNavigate={vi.fn()} />);

    expect(screen.getByLabelText('90-Second Capability and 6R Topic Guides')).toBeInTheDocument();
    expect(screen.getByText('What is EMOS?')).toBeInTheDocument();
    expect(screen.getByText('Modernization Agent')).toBeInTheDocument();
    expect(screen.getByText('Replatform (Move it to a better platform)')).toBeInTheDocument();
    expect(screen.getByText('Retire (Safely shut it down)')).toBeInTheDocument();
    expect(screen.getByText('Outcomes & Learning')).toBeInTheDocument();

    // Toggle interactive transcript on a topic guide
    const transcriptButtons = screen.getAllByRole('button', { name: /Transcript/i });
    expect(transcriptButtons.length).toBe(16);
    fireEvent.click(transcriptButtons[0]);
    expect(screen.getByRole('button', { name: /Hide Transcript/i })).toBeInTheDocument();

    // Verify responsive viewports (1440px, 1280px, 1024px, 768px, 375px)
    for (const width of [1440, 1280, 1024, 768, 375]) {
      window.innerWidth = width;
      fireEvent(window, new Event('resize'));
      expect(screen.getByLabelText('90-Second Capability and 6R Topic Guides')).toBeInTheDocument();
    }
  });
});
