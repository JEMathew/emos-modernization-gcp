// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { EnterpriseDnaView } from '../src/components/EnterpriseDnaView';
import { Navbar } from '../src/components/Navbar';
import { PortfolioPlanView } from '../src/components/PortfolioPlanView';
import { ReflectionWorkspace } from '../src/components/ReflectionWorkspace';
import { SamplePortfolioView } from '../src/components/SamplePortfolioView';
import { TestWalkthroughModal } from '../src/components/TestWalkthroughModal';
import { SAMPLE_PORTFOLIO } from '../src/data/samplePortfolio';
import { ThemeProvider } from '../src/lib/theme';
import type { Interaction, ProgramAlignment } from '../src/types';

const scrollIntoView = vi.fn();

const alignment: ProgramAlignment = {
  userId: 'owner-1',
  programName: 'Apex modernization',
  executiveSponsor: 'CTO',
  securityApprover: 'CISO delegate',
  deliveryOwner: 'Program director',
  businessOutcomes: 'Reduce operating risk',
  targetPlatform: 'Vendor neutral',
  riskTolerance: 'Balanced',
  timeHorizonMonths: 18,
  successMeasures: 'Retire unsupported runtimes',
  updatedAt: '2026-09-10T00:00:00.000Z',
};

const interaction: Interaction = {
  id: 'assessment-1',
  userId: 'owner-1',
  title: 'Customer Analytics Modernization',
  category: 'Legacy Application',
  mode: 'assess',
  content: 'SYNTHETIC RAW WORKLOAD EVIDENCE',
  geminiResponse: '**Recommended 6R Disposition:** Refactor',
  turns: [],
  createdAt: '2026-09-10T00:00:00.000Z',
  updatedAt: '2026-09-10T00:00:00.000Z',
  recommended6R: 'Refactor',
  confidenceScore: 65,
  evidenceCompleteness: 61,
  decisionReadiness: 'NEEDS EVIDENCE',
};

const withTheme = (ui: React.ReactElement) => <ThemeProvider>{ui}</ThemeProvider>;

const workspace = (
  activeInteraction: Interaction | null,
  overrides: Partial<React.ComponentProps<typeof ReflectionWorkspace>> = {},
) => withTheme(
  <ReflectionWorkspace
    activeInteraction={activeInteraction}
    onSaveNew={async () => undefined}
    onSendFollowUp={async () => undefined}
    isProcessing={false}
    saveStatus="idle"
    errorMessage={null}
    {...overrides}
  />,
);

describe('standardized authenticated journey', () => {
  beforeAll(() => {
    Element.prototype.scrollIntoView = scrollIntoView;
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
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn() },
    });
  });

  afterEach(() => {
    cleanup();
    scrollIntoView.mockClear();
  });

  it('uses the same navigation labels and order on desktop and mobile', () => {
    const { container } = render(withTheme(
      <Navbar
        user={{ uid: 'owner-1', email: 'owner@example.com' } as any}
        currentView="portfolio"
        assessmentCount={3}
        onNavigate={vi.fn()}
        onNewAssessment={vi.fn()}
        onOpenWalkthrough={vi.fn()}
      />,
    ));

    const desktopNav = container.querySelector('nav')!;
    expect(within(desktopNav).getAllByRole('button').map((button) => button.textContent?.replace(/\s+/g, '')))
      .toEqual(['Portfolio', 'Decisions', 'Plan', 'History3']);

    expect(['mobile-nav-portfolio', 'mobile-nav-decision', 'mobile-nav-plan', 'mobile-nav-history']
      .map((id) => container.querySelector(`#${id}`)?.textContent?.replace(/\s+/g, '')))
      .toEqual(['Portfolio', 'Decisions', 'Plan', 'History3']);

    const newAssessment = screen.getByRole('button', { name: /New Assessment/i });
    expect(newAssessment).toHaveClass('min-h-[36px]', 'text-xs');
    expect(newAssessment).not.toHaveClass('sm:text-sm', 'sm:min-h-[38px]');
  });

  it('shows one compact current-stage marker on each core product surface', () => {
    const { rerender } = render(withTheme(
      <SamplePortfolioView
        onSelectWorkload={vi.fn()}
        onAssessWorkload={vi.fn()}
        onOpenImportModal={vi.fn()}
      />,
    ));
    expect(screen.getByLabelText('Current journey stage: Discover')).toBeInTheDocument();

    rerender(withTheme(
      <EnterpriseDnaView
        workload={SAMPLE_PORTFOLIO[0]}
        onBackToPortfolio={vi.fn()}
        onAssess={vi.fn()}
      />,
    ));
    expect(screen.getByLabelText('Current journey stage: Understand')).toBeInTheDocument();

    rerender(workspace(null));
    expect(screen.getByLabelText('Current journey stage: Decide')).toBeInTheDocument();

    rerender(withTheme(
      <PortfolioPlanView
        workloads={SAMPLE_PORTFOLIO}
        interactions={[]}
        alignment={alignment}
        onSaveAlignment={async () => undefined}
        onBack={vi.fn()}
      />,
    ));
    expect(screen.getByLabelText('Current journey stage: Plan')).toBeInTheDocument();
    const exportPack = screen.getByRole('button', { name: /Export Executive Pack/i });
    expect(exportPack).toHaveClass('min-h-[36px]', 'text-xs', 'self-start', 'sm:self-auto', 'shrink-0', 'whitespace-nowrap');
    expect(exportPack).not.toHaveClass('min-h-[42px]', 'text-sm');
    fireEvent.click(screen.getByRole('button', { name: /3\. Mobilize/i }));
    expect(screen.getByLabelText('Current journey stage: Mobilize')).toBeInTheDocument();
  });

  it('provides one governed initial assessment path', async () => {
    const onSaveNew = vi.fn(async () => undefined);
    render(workspace(null, { onSaveNew }));

    expect(screen.queryByRole('button', { name: /^Assess$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Options$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Decision$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^History$/i })).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Assess this synthetic Java and Oracle workload.' } });
    fireEvent.click(screen.getByRole('button', { name: /Generate 6R Assessment/i }));

    await waitFor(() => expect(onSaveNew).toHaveBeenCalledWith({
      content: 'Assess this synthetic Java and Oracle workload.',
      mode: 'assess',
    }));
  });

  it('keeps raw evidence collapsed and exposes working contextual follow-ups', () => {
    const { container } = render(workspace(interaction, { onOpenPortfolio: vi.fn() }));

    expect(screen.queryByText('SYNTHETIC RAW WORKLOAD EVIDENCE')).not.toBeInTheDocument();
    expect(container.querySelector('#header-portfolio-btn')).not.toBeInTheDocument();

    const evidenceToggle = screen.getByRole('button', { name: /Show Workload Evidence/i });
    expect(evidenceToggle).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(evidenceToggle);
    expect(screen.getByText('SYNTHETIC RAW WORKLOAD EVIDENCE')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Hide Workload Evidence/i })).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(screen.getByRole('button', { name: /Compare Options/i }));
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toMatch(/viable 6R alternatives/i);
    fireEvent.click(screen.getByRole('button', { name: /Executive Summary/i }));
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toMatch(/concise executive summary/i);
  });

  it('opens an existing assessment at the summary and scrolls only for new thread activity', () => {
    const { rerender } = render(workspace(interaction));
    expect(scrollIntoView).not.toHaveBeenCalled();

    rerender(workspace({
      ...interaction,
      turns: [{ role: 'user', content: 'New evidence', timestamp: '2026-09-10T00:01:00.000Z' }],
    }));
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it('uses the canonical five-stage vocabulary in Product Tour', () => {
    render(withTheme(<TestWalkthroughModal isOpen={true} onClose={vi.fn()} />));

    expect(['Discover', 'Understand', 'Decide', 'Plan', 'Mobilize'].map((stage, index) =>
      screen.getByRole('button', { name: `Step ${index + 1}: ${stage}` }),
    )).toHaveLength(5);
    expect(screen.queryByRole('button', { name: /Step 3: Assess/i })).not.toBeInTheDocument();
    expect(screen.getByText(/Trust controls apply throughout/i)).toBeInTheDocument();
  });
});
