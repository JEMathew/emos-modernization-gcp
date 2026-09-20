// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Dashboard } from '../src/components/Dashboard';
import { ThemeProvider } from '../src/lib/theme';
import { ThemeSelector } from '../src/components/ThemeSelector';
import { SAMPLE_PORTFOLIO } from '../src/data/samplePortfolio';
import { workspaceUrl, readWorkspaceRoute } from '../src/lib/workspaceNavigation';

const backend = vi.hoisted(() => ({ pending: false, fail: '', imported: [] as any[], records: [] as any[] }));
vi.mock('../src/lib/firebase', () => ({
  testConnection: vi.fn(), syncUserProfile: async () => {}, signOut: vi.fn(),
  subscribeToUserInteractions: (_uid: string, success: Function, error: Function) => {
    if (backend.fail === 'history') error(new Error('permission-denied')); else if (!backend.pending) success(backend.records);
    return () => {};
  },
  subscribeToUserImportedWorkloads: (_uid: string, success: Function, error: Function) => {
    if (backend.fail === 'workloads') error(new Error('permission-denied')); else if (!backend.pending) success(backend.imported);
    return () => {};
  },
  subscribeToProgramAlignment: (_uid: string, success: Function, error: Function) => {
    if (backend.fail === 'alignment') error(new Error('permission-denied')); else if (!backend.pending) success(null);
    return () => {};
  },
  saveInteraction: vi.fn(), updateInteraction: vi.fn(), deleteInteraction: vi.fn(),
  saveImportedWorkloads: vi.fn(), deleteImportedWorkload: vi.fn(), clearAllImportedWorkloads: vi.fn(), saveProgramAlignment: vi.fn(),
}));
vi.mock('../src/lib/gemini', () => ({ chatWithGemini: vi.fn(), generateAssessmentMeta: vi.fn() }));
const user = { uid: 'navigation-owner', displayName: 'Test user' } as any;
const display = () => render(<ThemeProvider><Dashboard user={user} /></ThemeProvider>);
const desktopNav = () => screen.getByRole('navigation', { name: 'Workspace navigation' });

beforeEach(() => {
  backend.pending = false; backend.fail = ''; backend.imported = []; backend.records = [];
  window.history.replaceState({}, '', '/app');
  localStorage.clear();
  window.scrollTo = vi.fn();
  Element.prototype.scrollIntoView = vi.fn();
  window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() });
});
afterEach(cleanup);

describe('authenticated workspace navigation', () => {
  it('opens Command Center with grounded sample counts and drill-down that survives remount', () => {
    const app = display();
    expect(screen.getByRole('heading', { name: 'Command Center' })).toBeInTheDocument();
    const w = SAMPLE_PORTFOLIO[0];
    fireEvent.click(screen.getByRole('button', { name: new RegExp(w.name + '.*evidence', 'i') }));
    expect(window.location.pathname).toBe(`/app/workloads/${w.id}/dna`);
    expect(screen.getByRole('heading', { name: `${w.name} — Enterprise DNA` })).toBeInTheDocument();
    app.unmount(); display();
    expect(screen.getByRole('heading', { name: `${w.name} — Enterprise DNA` })).toBeInTheDocument();
    fireEvent.click(within(desktopNav()).getByRole('button', { name: 'Overview' }));
    expect(window.location.search).toContain(`workload=${w.id}`);
    expect(screen.getByRole('heading', { name: 'Command Center' })).toBeInTheDocument();
  });
  it('opens the actual Align, Plan and Mobilize sections and follows browser history events', () => {
    display();
    fireEvent.click(screen.getByRole('button', { name: /Continue to Align/i }));
    expect(window.location.search).toBe('?stage=align');
    expect(screen.getByRole('textbox', { name: 'Program name' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Wave Plan' }));
    expect(window.location.pathname + window.location.search).toBe('/app/plan');
    expect(screen.getByLabelText('Current journey stage: Plan')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Mobilize' }));
    expect(window.location.search).toBe('?stage=mobilize');
    expect(screen.getByLabelText('Current journey stage: Mobilize')).toBeInTheDocument();
    act(() => { window.history.replaceState({}, '', '/app/plan?stage=align'); window.dispatchEvent(new PopStateEvent('popstate')); });
    expect(screen.getByRole('textbox', { name: 'Program name' })).toBeInTheDocument();
  });
  it('retains imported portfolio context through workload, overview and portfolio navigation', () => {
    backend.imported = [{ ...SAMPLE_PORTFOLIO[0], id: 'imported-1', name: 'My workload', source: 'imported' }];
    window.history.replaceState({}, '', '/app/workloads/imported-1/dna?portfolio=imported');
    display();
    expect(screen.getByRole('heading', { name: 'My workload — Enterprise DNA' })).toBeInTheDocument();
    fireEvent.click(within(desktopNav()).getByRole('button', { name: 'Overview' }));
    expect(screen.getByLabelText('Active portfolio')).toHaveValue('imported');
    fireEvent.click(within(desktopNav()).getByRole('button', { name: 'Portfolio' }));
    expect(screen.getByRole('heading', { name: 'My workload' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: SAMPLE_PORTFOLIO[0].name })).not.toBeInTheDocument();
  });
  it('makes all available stages navigable, keeps future stages inert, and opens Assess with workload evidence', () => {
    display();
    fireEvent.click(screen.getByRole('button', { name: /View entire lifecycle/i }));
    expect(screen.queryByRole('button', { name: /6\. Govern/i })).not.toBeInTheDocument();
    expect(screen.getByText(/6\. Govern/i).closest('[aria-disabled="true"]')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /4\. Assess/i }));
    expect(screen.getByLabelText('Current journey stage: Assess')).toBeInTheDocument();
    expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toContain(SAMPLE_PORTFOLIO[0].name);
    expect(screen.getByRole('button', { name: /View entire lifecycle/i })).toHaveAttribute('aria-expanded', 'false');
  });
  it.each(['/app/workloads/missing/dna', '/app/decision?assessment=missing', '/app/not-a-workspace'])('handles unavailable direct links without showing another record: %s', path => {
    window.history.replaceState({}, '', path); display();
    expect(screen.getByRole('heading', { name: 'Workspace unavailable' })).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Return to Command Center' }));
    expect(screen.getByRole('heading', { name: 'Command Center' })).toBeInTheDocument();
  });
  it('shows a loading state while subscriptions are unresolved', () => {
    backend.pending = true; display();
    expect(screen.getByRole('status')).toHaveTextContent('Loading your portfolio');
    expect(screen.queryByText('Workloads in scope')).not.toBeInTheDocument();
  });
  it.each(['history', 'alignment', 'workloads'])('does not show fabricated empty data after %s read fails', type => {
    backend.fail = type; display();
    expect(screen.getByRole('alert')).toHaveTextContent('could not be loaded');
    expect(screen.getByRole('button', { name: 'Reload workspace' })).toBeInTheDocument();
    expect(screen.queryByText('Workloads in scope')).not.toBeInTheDocument();
  });
  it('shows an empty imported portfolio without mixing in sample records', () => {
    display();
    fireEvent.change(screen.getByLabelText('Active portfolio'), { target: { value: 'imported' } });
    expect(screen.getByText(/No imported workloads yet/)).toBeInTheDocument();
    expect(screen.queryByText(SAMPLE_PORTFOLIO[0].name)).not.toBeInTheDocument();
  });
  it('round trips encoded workload IDs and rejects malformed paths without throwing', () => {
    const url = new URL(workspaceUrl('dna', { portfolio: 'imported', workloadId: 'CRM / EU', assessmentId: null }), 'https://example.test');
    expect(readWorkspaceRoute(url).workloadId).toBe('CRM / EU');
    expect(() => readWorkspaceRoute({ pathname: '/app/workloads/%ZZ/dna', search: '' })).not.toThrow();
  });
});

describe('appearance keyboard and persistence', () => {
  it('supports arrows, selection, Escape, and reload persistence', () => {
    const app = render(<ThemeProvider><ThemeSelector /></ThemeProvider>);
    const trigger = screen.getByRole('button', { name: /Appearance: System/ });
    fireEvent.click(trigger);
    expect(screen.getByRole('menuitemradio', { name: 'System' })).toHaveFocus();
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Home' });
    expect(screen.getByRole('menuitemradio', { name: 'Light' })).toHaveFocus();
    fireEvent.click(screen.getByRole('menuitemradio', { name: 'Dark' }));
    expect(localStorage.getItem('emos-theme')).toBe('dark');
    expect(document.documentElement).toHaveClass('dark');
    expect(trigger).toHaveFocus();
    app.unmount(); render(<ThemeProvider><ThemeSelector /></ThemeProvider>);
    fireEvent.click(screen.getByRole('button', { name: /Appearance: Dark/ }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Appearance: Dark/ })).toHaveFocus();
  });
});
