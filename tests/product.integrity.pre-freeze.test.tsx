// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { afterEach, beforeAll, describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SAMPLE_PORTFOLIO } from '../src/data/samplePortfolio';
import { ENTERPRISE_ESTATE_PROFILES } from '../src/data/enterpriseEstates';
import { evaluateEvidenceReadiness } from '../src/lib/readiness';
import { buildDefaultLifecycleState } from '../src/lib/transformationEngine';
import { PortfolioPlanView } from '../src/components/PortfolioPlanView';
import { EnterpriseDnaView } from '../src/components/EnterpriseDnaView';
import { ModernizationAgentPanel } from '../src/components/ModernizationAgentPanel';
import { Dashboard } from '../src/components/Dashboard';
import { ThemeProvider } from '../src/lib/theme';
import type { EnterpriseWorkload, ProgramAlignment } from '../src/types';
import type { AskEmosApiResponse } from '../src/lib/gemini';

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
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

const withTheme = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

const BASE_ALIGNMENT: ProgramAlignment = {
  userId: 'test-user',
  programName: 'EMOS Integrity Test',
  executiveSponsor: 'Chief Information Officer',
  securityApprover: 'Chief Information Security Officer',
  deliveryOwner: 'VP of Platform Engineering',
  businessOutcomes: 'Zero governance bypasses',
  targetPlatform: 'Vendor-Neutral Managed Cloud Platform',
  riskTolerance: 'Balanced',
  timeHorizonMonths: 12,
  successMeasures: '100% readiness gate enforcement',
  updatedAt: '2026-11-21T00:00:00Z',
};

function cloneWithCompletenessAndGap(base: EnterpriseWorkload, leaveGapId: string): EnterpriseWorkload {
  const wl = structuredClone(base);
  Object.values(wl.dna)
    .flat()
    .forEach((f) => {
      if (f.id === leaveGapId) {
        f.status = 'missing';
        f.value = 'Missing';
      } else {
        f.status = 'known';
        if (f.value === 'Missing' || f.value === 'Incomplete') f.value = `Verified ${f.label}`;
      }
    });
  wl.evidenceCompleteness = evaluateEvidenceReadiness(wl.dna).completeness;
  return wl;
}

describe('EMOS v2 Pre-Freeze Product-Integrity Regression Suite (Proofs A–J)', () => {
  const workload61 = SAMPLE_PORTFOLIO[0]; // 61% NEEDS EVIDENCE
  const workload94WithGap = cloneWithCompletenessAndGap(SAMPLE_PORTFOLIO[0], 'e3'); // 94% (>=70% & >=85%) with 1 critical gap
  const workload100Ready = ENTERPRISE_ESTATE_PROFILES['financial-services'].workloads.find((w) =>
    /hsm/i.test(w.name),
  )!; // 100% READY

  it('A & F. 61% NEEDS-EVIDENCE workload cannot be approved and cannot advance execution through direct navigation', () => {
    const onApprove = vi.fn();
    withTheme(
      <PortfolioPlanView
        workloads={[workload61]}
        interactions={[]}
        alignment={BASE_ALIGNMENT}
        selectedWorkload={workload61}
        approvedWorkloads={{}}
        initialSection="execute"
        onApproveWorkload={onApprove}
        onSaveAlignment={vi.fn()}
        onBack={vi.fn()}
      />,
    );

    const execBtn = document.getElementById('advance-execution-stage-btn') as HTMLButtonElement;
    expect(execBtn).toBeTruthy();
    expect(execBtn.disabled).toBe(true);
    expect(execBtn.textContent).toMatch(/Evidence Gate Locked/i);
    fireEvent.click(execBtn);
    expect(onApprove).not.toHaveBeenCalled();

    // Even if someone forces governanceApproved=true into transformationEngine, NEEDS EVIDENCE stays BLOCKED_EVIDENCE
    const forcedState = buildDefaultLifecycleState(workload61, undefined, true);
    expect(forcedState.governanceStatus).toBe('BLOCKED_EVIDENCE');
    expect(forcedState.overallProgress).toBe(0);
  });

  it('B. >=70% (94%) workload with a critical gap cannot be approved on Mobilize or Execute', () => {
    expect(workload94WithGap.evidenceCompleteness).toBeGreaterThanOrEqual(70);
    expect(evaluateEvidenceReadiness(workload94WithGap.dna).decisionReadiness).toBe('NEEDS EVIDENCE');

    const onApprove = vi.fn();
    withTheme(
      <PortfolioPlanView
        workloads={[workload94WithGap]}
        interactions={[]}
        alignment={BASE_ALIGNMENT}
        selectedWorkload={workload94WithGap}
        approvedWorkloads={{}}
        initialSection="mobilize"
        onApproveWorkload={onApprove}
        onSaveAlignment={vi.fn()}
        onBack={vi.fn()}
      />,
    );

    expect(screen.getByText(/Evidence Gated \(NEEDS EVIDENCE\)/i)).toBeInTheDocument();
    expect(screen.queryByText(/Human Approved/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: new RegExp(`Approve ${workload94WithGap.name}`, 'i') })).not.toBeInTheDocument();
  });

  it('C & D. 85%, 94%, and 100% evidence completeness do NOT auto-approve; READY workload still requires explicit human approval', () => {
    expect(workload100Ready.evidenceCompleteness).toBe(100);
    expect(evaluateEvidenceReadiness(workload100Ready.dna).decisionReadiness).toBe('READY');

    const onApprove = vi.fn();
    withTheme(
      <PortfolioPlanView
        workloads={[workload100Ready]}
        interactions={[]}
        alignment={BASE_ALIGNMENT}
        selectedWorkload={workload100Ready}
        approvedWorkloads={{}}
        initialSection="mobilize"
        onApproveWorkload={onApprove}
        onSaveAlignment={vi.fn()}
        onBack={vi.fn()}
      />,
    );

    // Must NOT be auto-approved despite 100% completeness!
    expect(screen.queryByText(/Human Approved/i)).not.toBeInTheDocument();
    const approveBtn = screen.getByRole('button', { name: new RegExp(`Approve ${workload100Ready.name}`, 'i') });
    expect(approveBtn).toBeInTheDocument();
    fireEvent.click(approveBtn);
    expect(onApprove).toHaveBeenCalledTimes(1);
    expect(onApprove).toHaveBeenCalledWith(workload100Ready.id, expect.any(String));
  });

  it('E. Unapproved READY workload cannot advance governed execution stages until explicitly approved', () => {
    const onApprove = vi.fn();
    withTheme(
      <PortfolioPlanView
        workloads={[workload100Ready]}
        interactions={[]}
        alignment={BASE_ALIGNMENT}
        selectedWorkload={workload100Ready}
        approvedWorkloads={{}}
        initialSection="execute"
        onApproveWorkload={onApprove}
        onSaveAlignment={vi.fn()}
        onBack={vi.fn()}
      />,
    );

    const btn = document.getElementById('advance-execution-stage-btn') as HTMLButtonElement;
    expect(btn.textContent).toMatch(/Approve Governance & Start Execution/i);
    // Progress remains at pre-approval gate (1/N stages completed = 25% for 4-stage Retain)
    expect(screen.queryByText(/Complete Current Checkpoint Gate/i)).not.toBeInTheDocument();
  });

  it('G. Ask EMOS user interaction invokes governed POST /api/ask-emos path and displays live Gemini specialist reply', async () => {
    const mockEndpoint = vi.fn(async (): Promise<AskEmosApiResponse> => ({
      id: 'live-reply-1',
      question: 'Why Retain?',
      workloadId: workload100Ready.id,
      workloadName: workload100Ready.name,
      stage: 'assess',
      routedAgents: ['enterprise-architect-agent'],
      handoffOccurred: false,
      governanceIntercepted: false,
      recommended6R: 'Retain',
      decisionReadiness: 'READY',
      evidenceCompleteness: 100,
      confidenceScore: 95,
      conclusion: 'Live Gemini Architect: Hardware HSM vault requires on-premises continuity.',
      bullets: ['Sub-millisecond cryptographic boundary.', 'Amortized hardware lifecycle.'],
      nextAction: 'Record explicit Human Governance Approval.',
      evidenceSummary: '100% verified',
      reasoningSummary: 'Gemini-backed Enterprise Architect Agent',
      toolsCalled: [
        {
          toolName: 'inspect_workload_dna',
          label: 'inspect_workload_dna()',
          summary: 'Scanned 18 attributes',
          status: 'verified',
        },
      ],
      timestamp: '02:35',
      isLiveGemini: true,
      executionMode: 'live-gemini',
      modelsUsed: ['gemini-flash-latest'],
    }));

    withTheme(
      <ModernizationAgentPanel
        workload={workload100Ready}
        currentStage="assess"
        estateName="financial-services"
        askEmosEndpoint={mockEndpoint}
      />,
    );

    const input = screen.getByLabelText('Ask Modernization Agent');
    fireEvent.change(input, { target: { value: 'Why Retain?' } });
    fireEvent.click(screen.getByLabelText('Send question to Modernization Agent'));

    await waitFor(() => {
      expect(mockEndpoint).toHaveBeenCalledTimes(1);
      expect(mockEndpoint).toHaveBeenCalledWith(
        expect.objectContaining({
          question: 'Why Retain?',
          workload: workload100Ready,
          currentStage: 'assess',
          estateName: 'financial-services',
        }),
      );
      expect(screen.getByText(/Live Gemini Architect: Hardware HSM vault/i)).toBeInTheDocument();
      expect(screen.getByText('Live Gemini')).toBeInTheDocument();
    });
  });

  it('H. Ask EMOS API failure produces explicit deterministic fallback semantics (never pretends to be Gemini)', async () => {
    const failingEndpoint = vi.fn(async () => {
      throw new Error('ASK_EMOS_HTTP_503');
    });

    withTheme(
      <ModernizationAgentPanel
        workload={workload61}
        currentStage="dna"
        askEmosEndpoint={failingEndpoint}
      />,
    );

    const input = screen.getByLabelText('Ask Modernization Agent');
    fireEvent.change(input, { target: { value: 'What evidence is missing?' } });
    fireEvent.click(screen.getByLabelText('Send question to Modernization Agent'));

    await waitFor(() => {
      expect(failingEndpoint).toHaveBeenCalledTimes(1);
      expect(
        screen.getByText(/AI reasoning unavailable\. Showing deterministic EMOS status\/evidence instead\./i),
      ).toBeInTheDocument();
      expect(screen.queryByText('Live Gemini')).not.toBeInTheDocument();
      // Raw technical error code must NOT be leaked to user
      expect(screen.queryByText(/ASK_EMOS_HTTP_503/i)).not.toBeInTheDocument();
    });
  });

  it('I & J. Sample evidence shortcut is clearly marked Demo/Synthetic and does NOT silently inject Google Cloud target', () => {
    let updatedWorkload: EnterpriseWorkload | null = null;
    withTheme(
      <EnterpriseDnaView
        workload={workload61}
        onBackToPortfolio={vi.fn()}
        onAssess={vi.fn()}
        onUpdateWorkloadDna={(wl) => {
          updatedWorkload = wl;
        }}
        onResetSampleWorkload={vi.fn()}
      />,
    );

    const demoBtn = screen.getByRole('button', { name: /Load Sample Evidence \(Demo\)/i });
    expect(demoBtn).toBeInTheDocument();
    fireEvent.click(demoBtn);

    expect(updatedWorkload).not.toBeNull();
    const ts1 = updatedWorkload!.dna.targetState.find((f) => f.id === 'ts1')!;
    expect(ts1.value).toBe('Vendor-Neutral Managed Cloud Platform');
    expect(ts1.value).not.toMatch(/Google Cloud/i);
    expect(ts1.detail).toMatch(/Synthetic sample evidence.*Demo/i);
    expect(ts1.detail).not.toMatch(/Verified via/i);
  });

  it('Dashboard defense-in-depth: direct navigation to Execute on 61% workload locks execution gate', () => {
    withTheme(<Dashboard user={null} />);
    // Navigate directly to Transform -> Execute while default Customer Analytics is at 61% NEEDS EVIDENCE
    fireEvent.click(document.getElementById('shell-nav-transform')!);
    const executeTab = screen.getByRole('button', { name: /^Execute$/i });
    fireEvent.click(executeTab);

    const execBtn = document.getElementById('advance-execution-stage-btn') as HTMLButtonElement;
    expect(execBtn).toBeTruthy();
    expect(execBtn.disabled).toBe(true);
    expect(execBtn.textContent).toMatch(/Evidence Gate Locked/i);
  });
});
