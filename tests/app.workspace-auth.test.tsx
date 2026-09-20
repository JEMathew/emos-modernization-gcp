// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import React, { useState } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import App from '../src/App';

const authState = vi.hoisted(() => ({ callback: (_user: any) => {} }));
vi.mock('firebase/auth', () => ({ onAuthStateChanged: (_auth: unknown, callback: any) => { authState.callback = callback; return () => {}; } }));
vi.mock('../src/lib/firebase', () => ({ auth: {}, processRedirectResult: async () => null, getFriendlyAuthErrorMessage: () => 'Sign-in error', POST_AUTH_ROUTE_KEY: 'emos-post-auth-route' }));
vi.mock('../src/components/LandingPage', () => ({ LandingPage: () => <h1>Sign in</h1> }));
vi.mock('../src/components/Dashboard', () => ({ Dashboard: ({ user }: any) => {
  const [draft, setDraft] = useState('');
  return <><h1>Account {user.uid}</h1><input aria-label="Private draft" value={draft} onChange={e => setDraft(e.target.value)} /></>;
} }));
beforeEach(() => {
  window.history.replaceState({}, '', '/app/workloads/example/dna');
  window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() });
});
afterEach(cleanup);
it('keeps private deep links behind resolved authentication and clears local workspace state between accounts', () => {
  render(<App />);
  expect(screen.queryByLabelText('Private draft')).not.toBeInTheDocument();
  act(() => authState.callback(null));
  expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
  act(() => authState.callback({ uid: 'owner-a' }));
  fireEvent.change(screen.getByLabelText('Private draft'), { target: { value: 'Owner A private draft' } });
  act(() => authState.callback({ uid: 'owner-b' }));
  expect(screen.getByRole('heading', { name: 'Account owner-b' })).toBeInTheDocument();
  expect(screen.getByLabelText('Private draft')).toHaveValue('');
  expect(window.location.pathname).toBe('/app/workloads/example/dna');
  act(() => authState.callback(null));
  expect(screen.queryByLabelText('Private draft')).not.toBeInTheDocument();
});
