// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, beforeAll, afterEach } from 'vitest';
import { ThemeProvider } from '../src/lib/theme';
import { PrivacyPolicyPage } from '../src/components/PrivacyPolicyPage';
import { TermsPage } from '../src/components/TermsPage';
import { LandingPage } from '../src/components/LandingPage';
import App from '../src/App';

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('Public Governance Routes (/privacy & /terms)', () => {
  beforeAll(() => {
    window.scrollTo = vi.fn();
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

  beforeEach(() => {
    window.history.pushState({}, '', '/');
  });

  it('renders Privacy Policy page while signed out with appropriate heading and mandatory disclosure sections', () => {
    const onNavigate = vi.fn();
    renderWithTheme(<PrivacyPolicyPage user={null} onNavigate={onNavigate} />);

    // Page Heading & Effective Dates
    const headings = screen.getAllByRole('heading', { name: /Privacy Policy/i });
    expect(headings.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Effective date: September 6, 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/Last updated: September 6, 2026/i)).toBeInTheDocument();

    // Mandatory Privacy Criteria per specifications
    // 1. Google Sign-In & federated authentication (zero password collection)
    expect(screen.getByText(/1\. Google Sign-In & Federated Identity/i)).toBeInTheDocument();
    expect(screen.getByText(/does not collect, handle, or store user passwords/i)).toBeInTheDocument();
    expect(screen.getByText(/display name, email address, profile photo URL/i)).toBeInTheDocument();
    expect(screen.getByText(/Firebase account creation timestamp/i)).toBeInTheDocument();
    expect(screen.getByText(/The browser sends a Firebase authentication token to the EMOS server so the server can verify the signed-in user/i)).toBeInTheDocument();

    // 2. Portfolio and assessment inputs & warning against sensitive production data
    expect(screen.getByText(/2\. Portfolio and Assessment Inputs/i)).toBeInTheDocument();
    expect(screen.getByText(/Enterprise DNA technical attributes/i)).toBeInTheDocument();
    expect(screen.getByText(/Do not submit production credentials, private keys, database connection strings/i)).toBeInTheDocument();

    // 3. Gemini processing & server-side configuration
    expect(screen.getByText(/3\. Gemini Processing & Server-Side Execution/i)).toBeInTheDocument();
    expect(screen.getByText(/EMOS may use one of its configured Google Gemini models to complete a request/i)).toBeInTheDocument();
    expect(screen.getByText(/Gemini API credentials are configured server-side and are not intentionally included in browser code or application responses/i)).toBeInTheDocument();

    // 4. User-owned Firestore data & technical details disclosure
    expect(screen.getByText(/4\. Data Storage and Architectural Roles/i)).toBeInTheDocument();
    expect(screen.getByText(/Technical details: Firestore collection paths and rule enforcement/i)).toBeInTheDocument();
    expect(screen.getAllByText(/users\/\{userId\}\/interactions\/\{interactionId\}/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/request\.auth\.uid == userId/i)).toBeInTheDocument();

    // 5. Retention & active storage deletion options
    expect(screen.getByText(/5\. Data Deletion Scope & Operational Realities/i)).toBeInTheDocument();
    expect(screen.getByText(/Individual Assessment Deletion:/i)).toBeInTheDocument();
    expect(screen.getByText(/deleteDoc/i)).toBeInTheDocument();

    // 6. Support contact
    expect(screen.getByText(/6\. Support & Inquiries/i)).toBeInTheDocument();
    expect(screen.getByText('jeasom@gmail.com')).toBeInTheDocument();

    // Negative assertions: Ensure non-hardened phrases and exact model names are absent
    expect(screen.queryByText(/zero cross-tenant leakage/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/permanently removes the document/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/permanently deletes/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/never delivered/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/gemini-3\.6-flash/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/gemini-3\.1-flash-lite/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/gemini-3\.7-flash/i)).not.toBeInTheDocument();

    // Accessibility check for navigation buttons
    expect(screen.getAllByRole('button', { name: /Terms of Service/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('button', { name: /Sign In with Google/i })).toBeInTheDocument();
  });

  it('renders Terms of Service page while signed out with appropriate heading and mandatory terms sections', () => {
    const onNavigate = vi.fn();
    renderWithTheme(<TermsPage user={null} onNavigate={onNavigate} />);

    // Page Heading
    const headings = screen.getAllByRole('heading', { name: /Terms of Service/i });
    expect(headings.length).toBeGreaterThanOrEqual(1);

    // Mandatory Terms Criteria per specifications
    // 1. Decision-support and ideathon demonstration
    expect(screen.getByText(/1\. Decision-Support and Ideathon Demonstration/i)).toBeInTheDocument();
    expect(screen.getByText(/exploratory decision-intelligence prototype/i)).toBeInTheDocument();

    // 2. Recommendations are advisory heuristics, not professional/migration advice
    expect(screen.getByText(/2\. No Professional or Migration-Execution Advice/i)).toBeInTheDocument();
    expect(screen.getByText(/strictly advisory heuristics/i)).toBeInTheDocument();
    expect(screen.getByText(/Not Architectural Guarantees/i)).toBeInTheDocument();

    // 3. User responsibility for decisions and submitted data
    expect(screen.getByText(/3\. User Responsibility for Decisions and Submitted Data/i)).toBeInTheDocument();
    expect(screen.getByText(/Ownership of Decisions/i)).toBeInTheDocument();

    // 4. Acceptable use policy
    expect(screen.getByText(/4\. Acceptable Use Policy/i)).toBeInTheDocument();

    // 5. Availability & As-Is disclaimer
    expect(screen.getByText(/5\. Service Availability and "As-Is" Disclaimer/i)).toBeInTheDocument();
    expect(screen.getByText(/No Availability Warranties/i)).toBeInTheDocument();

    // 6. Contact and questions
    expect(screen.getByText(/6\. Questions and Inquiries/i)).toBeInTheDocument();
    expect(screen.getByText('jeasom@gmail.com')).toBeInTheDocument();

    // Accessible navigation
    expect(screen.getAllByRole('button', { name: /Privacy Policy/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('button', { name: /Sign In with Google/i })).toBeInTheDocument();
  });

  it('displays visible footer links to /privacy and /terms on the signed-out landing page', () => {
    const onNavigate = vi.fn();
    renderWithTheme(<LandingPage onOpenWalkthrough={vi.fn()} onNavigate={onNavigate} />);

    const privacyLink = screen.getByRole('link', { name: /Privacy Policy/i });
    const termsLink = screen.getByRole('link', { name: /Terms of Service/i });

    expect(privacyLink).toBeInTheDocument();
    expect(privacyLink).toHaveAttribute('href', '/privacy');

    expect(termsLink).toBeInTheDocument();
    expect(termsLink).toHaveAttribute('href', '/terms');

    // Click triggers navigation handler
    fireEvent.click(privacyLink);
    expect(onNavigate).toHaveBeenCalledWith('/privacy');

    fireEvent.click(termsLink);
    expect(onNavigate).toHaveBeenCalledWith('/terms');
  });

  it('renders public /privacy route directly in App without requiring Google Sign-In', () => {
    window.history.pushState({}, '', '/privacy');
    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: /Privacy Policy/i })).toBeInTheDocument();
    expect(screen.getByText(/1\. Google Sign-In & Federated Identity/i)).toBeInTheDocument();
  });

  it('renders public /terms route directly in App without requiring Google Sign-In', () => {
    window.history.pushState({}, '', '/terms');
    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: /Terms of Service/i })).toBeInTheDocument();
    expect(screen.getByText(/1\. Decision-Support and Ideathon Demonstration/i)).toBeInTheDocument();
  });

  it('updates the document title when entering and leaving a public legal route', () => {
    window.history.pushState({}, '', '/privacy');
    render(<App />);
    expect(document.title).toBe('Privacy Policy — EMOS');

    fireEvent.click(screen.getByRole('button', { name: /Return to Home/i }));
    expect(document.title).toBe('EMOS — Enterprise Modernization Operating System');
  });
});
