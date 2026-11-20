// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ThemeProvider } from '../src/lib/theme';
import App from '../src/App';
import { Dashboard } from '../src/components/Dashboard';

const withTheme = (ui: React.ReactElement) => <ThemeProvider>{ui}</ThemeProvider>;

describe('EMOS v2 Post-Convergence Interaction Integrity & Regression Suite', () => {
  afterEach(() => {
    cleanup();
  });
  beforeEach(() => {
    window.history.replaceState({}, '', '/workspace');
    window.scrollTo = vi.fn() as any;
    (globalThis as any).IntersectionObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
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

  it('renders the 4-job Level 1 navigation and contextual Level 2 sub-navigation cleanly', () => {
    render(withTheme(<Dashboard user={null} />));

    // Level 1: 4 primary business jobs
    expect(screen.getByRole('button', { name: /01\s*Understand/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /02\s*Decide/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /03\s*Transform/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /04\s*Outcomes/i })).toBeInTheDocument();

    // Level 2 under Understand
    expect(screen.getByRole('button', { name: /^Overview$/i })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: /^Portfolio\s*\d*$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Enterprise DNA$/i })).toBeInTheDocument();

    // Switch to Transform -> Plan | Execute
    fireEvent.click(screen.getByRole('button', { name: /03\s*Transform/i }));
    expect(screen.getByRole('button', { name: /^Plan$/i })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: /^Execute$/i })).toBeInTheDocument();

    // Inline stage switch to Execute syncs Level 1 & Level 2 active state (P1-1)
    fireEvent.click(screen.getByRole('button', { name: /4\. Execute/i }));
    expect(screen.getByRole('button', { name: /^Execute$/i })).toHaveAttribute('aria-current', 'page');

    // Inline stage switch to Measure syncs Level 1 to Outcomes & Level 2 to Measure (P1-1)
    fireEvent.click(screen.getByRole('button', { name: /5\. Measure/i }));
    expect(screen.getByRole('button', { name: /04\s*Outcomes/i })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: /^Measure$/i })).toHaveAttribute('aria-current', 'page');
  });

  it('maintains workload context continuity across Portfolio -> DNA -> Decide -> Execute -> Agent (P1-2)', () => {
    render(withTheme(<Dashboard user={null} />));

    // Switch estate in top bar -> Portfolio updates synchronously (Defect #6)
    fireEvent.click(screen.getByRole('button', { name: /^Portfolio\s*\d*$/i }));
    const estateSelect = screen.getByLabelText('Select enterprise estate');
    fireEvent.change(estateSelect, { target: { value: 'financial-services' } });
    // Appears in both the top-bar Active Workload Context Pill and the Portfolio Systems Registry
    expect(screen.getAllByText('Fixed Income Clearing & Settlement Engine').length).toBeGreaterThanOrEqual(2);

    // Switch back to Apex Aerospace and open Transform -> Execute
    fireEvent.change(estateSelect, { target: { value: 'apex-aerospace' } });
    fireEvent.click(screen.getByRole('button', { name: /03\s*Transform/i }));
    fireEvent.click(screen.getByRole('button', { name: /^Execute$/i }));

    // Switch workload inside PortfolioPlanView -> must sync upward to top-bar pill and Modernization Agent
    const workloadSelect = screen.getByLabelText('Select workload for transformation lifecycle');
    fireEvent.change(workloadSelect, { target: { value: 'enterprise-data-warehouse' } });

    // Single global Agent entry ("Ask EMOS ⌘J") — no duplicate "Agent Drawer" button
    expect(screen.queryByRole('button', { name: /Agent Drawer/i })).not.toBeInTheDocument();
    expect(screen.getByText(/Local Evaluation/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Sign in$/i })).toBeInTheDocument();

    // Open Modernization Agent via single subtle Ask EMOS ⌘J control
    fireEvent.click(screen.getByRole('button', { name: /Ask EMOS/i }));
    expect(screen.getByText(/Grounded in Enterprise Data Warehouse/i)).toBeInTheDocument();
    // Agent prompts auto-adapt to Execution stage (Defect #4)
    expect(screen.getByRole('button', { name: /^Why is this blocked\?$/i })).toBeInTheDocument();

    // Navigate to Decide -> must retain Enterprise Data Warehouse context rather than dropping it (Defect #2)
    fireEvent.click(screen.getByRole('button', { name: /02\s*Decide/i }));
    expect(screen.getByRole('button', { name: /Assess Enterprise Data Warehouse/i })).toBeInTheDocument();
  });

  it('preserves workspace state across Workspace -> Learning Center -> Back to Workspace (P1-3)', () => {
    render(<App />);

    // Change estate to Global Financial Services and navigate to Transform -> Plan
    const estateSelect = screen.getByLabelText('Select enterprise estate') as HTMLSelectElement;
    fireEvent.change(estateSelect, { target: { value: 'financial-services' } });
    fireEvent.click(screen.getByRole('button', { name: /03\s*Transform/i }));
    expect(screen.getByRole('heading', { name: /Modernization Wave Plan/i })).toBeInTheDocument();

    // Navigate to Learning Center via SPA link in sidebar utility
    fireEvent.click(screen.getByRole('link', { name: /Learning Center/i }));
    expect(screen.getByRole('heading', { name: /See EMOS in Motion/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start Guided Journey/i })).toBeInTheDocument();

    // Return to Workspace -> previous estate and view must still be intact
    fireEvent.click(screen.getByRole('link', { name: /Back to Workspace/i }));
    expect(screen.getByRole('heading', { name: /Modernization Wave Plan/i })).toBeInTheDocument();
    expect((screen.getByLabelText('Select enterprise estate') as HTMLSelectElement).value).toBe('financial-services');
  });

  it('enforces state-aware DNA CTA hierarchy, 6R Execute framing, and contextual Ask EMOS triggers', () => {
    render(withTheme(<Dashboard user={null} />));

    // Open Enterprise DNA for default gated workload (61% NEEDS EVIDENCE)
    fireEvent.click(screen.getByRole('button', { name: /^Enterprise DNA$/i }));
    expect(screen.getByRole('button', { name: /Load Sample Evidence \(Demo\)/i })).toBeInTheDocument();

    // Contextual Ask EMOS trigger on DNA ("What's missing?") opens the single Modernization Agent
    fireEvent.click(screen.getByRole('button', { name: /What's missing\?/i }));
    expect(screen.getByRole('heading', { name: /^Modernization Agent$/i })).toBeInTheDocument();
    expect(screen.getByText(/Q: What evidence is missing\?/i)).toBeInTheDocument();

    // Resolving evidence gaps flips DNA to READY and promotes header Assess for Modernization to Primary Indigo
    fireEvent.click(screen.getByRole('button', { name: /Load Sample Evidence \(Demo\)/i }));
    expect(screen.queryByRole('button', { name: /Load Sample Evidence \(Demo\)/i })).not.toBeInTheDocument();
    const headerAssessBtn = document.getElementById('assess-from-dna-btn');
    expect(headerAssessBtn).toBeInTheDocument();
    expect(headerAssessBtn?.className).toContain('bg-[#4648D4]');

    // Execute screen shows disposition-specific eyebrow & contextual "Why is this blocked?" trigger
    fireEvent.click(screen.getByRole('button', { name: /03\s*Transform/i }));
    fireEvent.click(screen.getByRole('button', { name: /^Execute$/i }));
    fireEvent.click(screen.getByRole('button', { name: /Why is this blocked\? ↗/i }));
    expect(screen.getByText(/Q: Why is this blocked\?/i)).toBeInTheDocument();
  });
});
