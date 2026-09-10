// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, fireEvent, cleanup, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, beforeAll, afterEach } from 'vitest';
import { ThemeProvider } from '../src/lib/theme';
import { PrivacyPolicyPage } from '../src/components/PrivacyPolicyPage';
import { TermsPage } from '../src/components/TermsPage';
import { LandingPage } from '../src/components/LandingPage';
import { Navbar } from '../src/components/Navbar';
import { HistorySidebar } from '../src/components/HistorySidebar';
import { TestWalkthroughModal } from '../src/components/TestWalkthroughModal';
import { PublicSandboxPage } from '../src/components/PublicSandboxPage';
import App, { consumePostAuthRoute } from '../src/App';

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('Public Governance Routes (/privacy & /terms)', () => {
  beforeAll(() => {
    window.scrollTo = vi.fn();
    class MockIntersectionObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
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
    window.sessionStorage.clear();
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

  it('renders the public evaluation sandbox without requiring Google Sign-In', () => {
    window.history.pushState({}, '', '/sandbox');
    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: /See EMOS Refuse False Certainty/i })).toBeInTheDocument();
    expect(screen.getByText(/Read-Only · Synthetic Data · No Sign-In/i)).toBeInTheDocument();
    expect(screen.getAllByText('61%').length).toBeGreaterThan(0);
    expect(screen.getAllByText('70%').length).toBeGreaterThan(0);
    expect(screen.queryByText(/Initializing secure authentication/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /Decision Gate/i }));
    expect(screen.getByText(/No 6R Disposition Should Be Approved Yet/i)).toBeInTheDocument();
    expect(screen.getByText(/Model confidence cannot override this calculated gate/i)).toBeInTheDocument();
  });

  it('shows the necessary-but-not-sufficient gate as synthetic evidence improves', () => {
    renderWithTheme(<PublicSandboxPage onNavigate={vi.fn()} />);
    fireEvent.click(screen.getByRole('tab', { name: /Evidence/i }));

    fireEvent.click(screen.getByRole('button', { name: /Define Target Strategy/i }));
    expect(screen.getAllByText('78%').length).toBeGreaterThan(0);
    expect(screen.getByText(/Dependency Details · Migration Downtime Tolerance/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /Decision Gate/i }));
    expect(screen.getByText(/No 6R Disposition Should Be Approved Yet/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /Evidence/i }));
    fireEvent.click(screen.getByRole('button', { name: /Close Critical Gaps/i }));
    fireEvent.click(screen.getByRole('tab', { name: /Decision Gate/i }));
    expect(screen.getAllByText('89%').length).toBeGreaterThan(0);
    expect(screen.getByText(/Ready for Human Review—Not Automatically Approved/i)).toBeInTheDocument();
  });

  it('continues into the authenticated product after a successful sandbox sign-in', async () => {
    const onNavigate = vi.fn();
    renderWithTheme(<PublicSandboxPage onNavigate={onNavigate} onSignIn={async () => ({ uid: 'test-user' })} />);

    fireEvent.click(screen.getByRole('button', { name: /Continue With Google/i }));

    await waitFor(() => expect(onNavigate).toHaveBeenCalledWith('/'));
    expect(window.sessionStorage.getItem('emos-post-auth-route')).toBeNull();
  });

  it('consumes the bounded post-auth route used after a mobile redirect', () => {
    window.sessionStorage.setItem('emos-post-auth-route', '/');
    expect(consumePostAuthRoute(window.sessionStorage)).toBe('/');
    expect(consumePostAuthRoute(window.sessionStorage)).toBeNull();
  });

  it('renders a public Trust and Evaluation page with honest beta boundaries', () => {
    window.history.pushState({}, '', '/trust');
    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: /Evaluate the Evidence Behind EMOS/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /What the Model Sees/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Current Beta Boundary/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Readiness-Gate Conformance Suite/i })).toBeInTheDocument();
    expect(screen.getByText(/not proof of real-world decision accuracy/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Open Data-Control Questions/i })).toBeInTheDocument();
    expect(screen.getByText(/Commercial pricing has not been set/i)).toBeInTheDocument();
    expect(screen.queryByText(/Initializing secure authentication/i)).not.toBeInTheDocument();
  });

  it('opens the responsive navigation and routes directly to the Scenario experience', () => {
    renderWithTheme(<LandingPage onOpenWalkthrough={vi.fn()} onNavigate={vi.fn()} />);

    const menuButton = screen.getByRole('button', { name: /Open Navigation Menu/i });
    fireEvent.click(menuButton);

    const mobileNav = screen.getByRole('navigation', { name: /Mobile Landing Page Navigation/i });
    expect(mobileNav).toBeInTheDocument();
    expect(within(mobileNav).getByRole('link', { name: /Public Sandbox/i })).toHaveAttribute('href', '/sandbox');
    expect(within(mobileNav).getByRole('link', { name: /Trust and Evaluation/i })).toHaveAttribute('href', '/trust');

    fireEvent.click(within(mobileNav).getByRole('link', { name: /^Scenario$/i }));
    expect(window.location.hash).toBe('#scenario');
    expect(screen.getByRole('heading', { name: /The Initiative the Estate Is Blocking/i })).toBeInTheDocument();
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('honours the Scenario hash on direct load and browser navigation', () => {
    window.history.pushState({}, '', '/#scenario');
    renderWithTheme(<LandingPage onOpenWalkthrough={vi.fn()} onNavigate={vi.fn()} />);
    expect(screen.getByRole('heading', { name: /The Initiative the Estate Is Blocking/i })).toBeInTheDocument();

    window.history.pushState({}, '', '/#why-emos');
    fireEvent(window, new PopStateEvent('popstate'));
    expect(screen.getByRole('heading', { name: /Optimized for Your Business Outcomes/i })).toBeInTheDocument();
  });

  it('updates the document title when entering and leaving a public legal route', () => {
    window.history.pushState({}, '', '/privacy');
    render(<App />);
    expect(document.title).toBe('Privacy Policy — EMOS');

    fireEvent.click(screen.getByRole('button', { name: /Return to Home/i }));
    expect(document.title).toBe('EMOS — Enterprise Modernization Operating System');
  });

  it('renders updated user-facing product copy and excludes absolute or ungrounded claims on the Landing Page', () => {
    const onOpenWalkthrough = vi.fn();
    renderWithTheme(<LandingPage onOpenWalkthrough={onOpenWalkthrough} onNavigate={vi.fn()} />);
    const chooseMenuItem = (menu: 'EMOS' | 'About', item: RegExp) => {
      fireEvent.click(screen.getAllByRole('button', { name: menu })[0]);
      fireEvent.click(screen.getAllByRole('menuitem', { name: item })[0]);
    };

    // Required user-facing copy
    const productTourButton = screen.getByRole('button', { name: /^Product Tour$/i });
    expect(productTourButton).toBeInTheDocument();
    expect(productTourButton).toHaveClass('border', 'bg-[var(--emos-surface)]');
    expect(screen.getByRole('link', { name: /Explore Without Sign-In/i })).toHaveAttribute('href', '/sandbox');
    expect(screen.getByText(/Beta v1\.0 Publicly Live/i)).toBeInTheDocument();
    expect(screen.getAllByText(/19 Walkthroughs \+ Introduction/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Enterprise Modernization/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: /Your legacy estate is blocking business initiatives you have already committed to\./i })).toBeInTheDocument();
    expect(screen.getByText(/EMOS helps leaders decide what to modernize and sequence the work—and is being built to measure whether it delivered the promised business outcome\./i)).toBeInTheDocument();
    expect(screen.getByText(/Watch the evidence become a decision\./i)).toBeInTheDocument();

    chooseMenuItem('EMOS', /^How It Works$/i);
    expect(screen.getAllByText(/Evidence Before Action\./i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Six Dimensions · Eighteen Attributes/i)).toBeInTheDocument();
    expect(screen.getByText(/Nothing Hand-Waved\. Every gap remains visible\./i)).toBeInTheDocument();

    chooseMenuItem('EMOS', /^Why EMOS$/i);
    expect(screen.getByRole('heading', { name: /Optimized for your business outcomes—not a provider's cloud consumption\./i })).toBeInTheDocument();
    expect(screen.getByText(/Independent of any cloud or platform vendor, it recommends the best-fit future state without benefiting from increased platform consumption\./i)).toBeInTheDocument();
    expect(screen.getAllByText(/^Retain$/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^Retire$/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^Rehost$/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^Replatform$/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^Refactor$/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^Repurchase$/i).length).toBeGreaterThan(0);

    chooseMenuItem('About', /^Vision$/i);
    expect(screen.getByText(/Full Product Vision/i)).toBeInTheDocument();
    expect(screen.getByText(/^Learn$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Reassess$/i)).toBeInTheDocument();
    expect(screen.getByText(/A vendor-neutral operating system for enterprise modernization/i)).toBeInTheDocument();

    chooseMenuItem('About', /^Founder$/i);
    expect(screen.getByText(/Built by someone who had this problem/i)).toBeInTheDocument();
    expect(screen.getAllByText(/16\+ Years/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/3\+ Years Building, Shipping and Launching Products into New Markets/i)).toBeInTheDocument();
    expect(screen.getByText(/Modern Data Platforms: Cloud Data Warehouse on GCP and Data Lakehouse on AWS/i)).toBeInTheDocument();
    expect(screen.getByText(/1\+ Year Leading Data Products/i)).toBeInTheDocument();
    expect(screen.getByText(/Established the First Product Management Community of Practice at Boeing India and Tally/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Connect With Jincen E Mathew on LinkedIn/i })).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/jincenmathew/',
    );

    fireEvent.click(screen.getAllByRole('link', { name: /^Design Partner$/i })[0]);
    expect(screen.getByText(/Become a founding design partner/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Confirm Design Partner Interest by Email/i })).toHaveAttribute(
      'href',
      expect.stringContaining('to=jeasom@gmail.com'),
    );
    expect(screen.getByRole('link', { name: 'jeasom@gmail.com' })).toHaveAttribute(
      'href',
      expect.stringContaining('mailto:jeasom@gmail.com'),
    );

    // Absolute claims must be absent
    expect(screen.queryByText(/Zero Cross-Tenant Leakage/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Owner-Locked Firestore/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Test Scenarios/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Architecture & Tests/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Review Security Test Specs/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Never turns weak evidence/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/zero password storage/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/ensuring enterprise-grade credential management/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Ideathon Release/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Decision Intelligence/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /5-Minute Tour/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /View Guided Tour/i })).not.toBeInTheDocument();

    // The single product-tour entry point triggers the walkthrough.
    fireEvent.click(screen.getByRole('link', { name: /EMOS Enterprise Modernization Operating System/i }));
    fireEvent.click(screen.getByRole('button', { name: /^Product Tour$/i }));
    expect(onOpenWalkthrough).toHaveBeenCalledTimes(1);
  });

  it('renders Product Tour in authenticated navigation and triggers walkthrough', () => {
    const onOpenWalkthrough = vi.fn();
    renderWithTheme(
      <Navbar
        user={{ uid: 'test-user', email: 'test@example.com' } as any}
        currentView="portfolio"
        onNavigate={vi.fn()}
        onNewAssessment={vi.fn()}
        onOpenWalkthrough={onOpenWalkthrough}
        assessmentCount={3}
      />
    );

    const guideBtn = screen.getByRole('button', { name: /Product Tour/i });
    expect(guideBtn).toBeInTheDocument();
    expect(screen.getAllByText(/^Decisions$/i)).toHaveLength(2);
    expect(screen.getAllByText(/^History$/i)).toHaveLength(2);
    expect(screen.queryByText(/6R Recommendations/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^Assessments$/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/6R Decision Model/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/6R Enterprise Architecture/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^Enterprise Modernization$/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Verification & Test Guide/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Guide & Validation/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Decision Intelligence/i)).not.toBeInTheDocument();

    fireEvent.click(guideBtn);
    expect(onOpenWalkthrough).toHaveBeenCalledTimes(1);
  });

  it('presents legacy assessment categories with current user-facing labels', () => {
    renderWithTheme(
      <HistorySidebar
        interactions={[
          {
            id: 'application-1', userId: 'test-user', title: 'Legacy Core', category: 'Legacy Application',
            mode: 'assess', content: 'Assess the legacy core.', geminiResponse: '', turns: [],
            createdAt: '2026-09-10T00:00:00.000Z', updatedAt: '2026-09-10T00:00:00.000Z',
          },
          {
            id: 'problem-1', userId: 'test-user', title: 'Earlier Review', category: 'Problem Solving',
            mode: 'reflection', content: 'Review the architecture issue.', geminiResponse: '', turns: [],
            createdAt: '2026-09-10T00:00:00.000Z', updatedAt: '2026-09-10T00:00:00.000Z',
          },
        ]}
        selectedId={null}
        onSelect={vi.fn()}
        onDelete={vi.fn()}
        isLoading={false}
      />
    );

    expect(screen.getAllByText(/^Application$/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^Architecture Review$/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/^Legacy Application$/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^Problem Solving$/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^New Assessment$/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: /^Architecture Review$/i })[0]);
    expect(screen.getByText('Earlier Review')).toBeInTheDocument();
    expect(screen.queryByText('Legacy Core')).not.toBeInTheDocument();
  });

  it('renders the focused EMOS Product Tour and progressively disclosed Technical Reference', () => {
    const onClose = vi.fn();
    renderWithTheme(<TestWalkthroughModal isOpen={true} onClose={onClose} />);

    // Title and view tabs
    expect(screen.getByRole('heading', { name: /EMOS Product Tour/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Product Tour$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Evaluation Evidence/i })).toBeInTheDocument();

    // Default view: one focused step rather than a text-heavy list.
    expect(screen.getByText(/Choose a workload/i)).toBeInTheDocument();
    expect(screen.queryByText(/Inspect Enterprise DNA/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Next step/i }));
    expect(screen.getByText(/Inspect Enterprise DNA/i)).toBeInTheDocument();
    expect(screen.queryByText(/Choose a workload/i)).not.toBeInTheDocument();

    // Switch to evaluation-only evidence.
    fireEvent.click(screen.getByRole('button', { name: /Evaluation Evidence/i }));
    expect(screen.getByText(/For evaluators and technical reviewers/i)).toBeInTheDocument();
    expect(screen.getByText(/not part of the normal end-user assessment workflow/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Test Coverage/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Data Access Controls/i })).toBeInTheDocument();
    expect(screen.queryByText(/zero executable risk/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/zero prompt injection bypass/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/zero layout shifting/i)).not.toBeInTheDocument();

    // Switch to security rules tab
    fireEvent.click(screen.getByRole('button', { name: /Data Access Controls/i }));
    expect(screen.getByText(/Owner-Bound Access Control/i)).toBeInTheDocument();
    expect(screen.getByText(/Firestore security rules reject attempts to access document paths that do not match the authenticated user ID\./i)).toBeInTheDocument();

    // Absolute guarantee language must be absent
    expect(screen.queryByText(/Owner-Bound Isolation Guarantee/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/guarantee/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/zero insecure defaults/i)).not.toBeInTheDocument();
  });
});
