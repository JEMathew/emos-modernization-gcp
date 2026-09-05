import React, { useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Lock,
  Database,
  BrainCircuit,
  Trash2,
  Mail,
  ArrowLeft,
  FileText,
  FileCode2,
  ExternalLink
} from 'lucide-react';
import type { User } from 'firebase/auth';
import { ThemeSelector } from './ThemeSelector';
import { signInWithGoogle } from '../lib/firebase';

interface PrivacyPolicyPageProps {
  user: User | null;
  onNavigate: (path: string) => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ user, onNavigate }) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      onNavigate('/');
    } catch (err: any) {
      console.error('Sign in failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--emos-bg)] text-[var(--emos-text-primary)] flex flex-col selection:bg-[#A88554] selection:text-black font-sans transition-colors">
      {/* Header */}
      <header className="border-b border-[var(--emos-border-subtle)] bg-[var(--emos-bg-secondary)]/95 backdrop-blur-md sticky top-0 z-30 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              id="privacy-nav-brand-btn"
              onClick={() => onNavigate('/')}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
              title="Return to EMOS Home"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#A88554] to-[#E5C492] text-black flex items-center justify-center font-serif font-bold text-sm shadow-md group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4 text-black" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold tracking-wider text-[var(--emos-text-primary)] text-base">
                    EMOS
                  </span>
                  <span className="text-[10px] font-sans uppercase tracking-wider text-[var(--emos-accent-text)] font-medium px-2 py-0.5 rounded bg-[var(--emos-accent-subtle)] border border-[var(--emos-accent-border)] hidden sm:inline">
                    Trust & Governance
                  </span>
                </div>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <nav className="hidden sm:flex items-center gap-1 p-1 bg-[var(--emos-bg-tertiary)] border border-[var(--emos-border-subtle)] rounded-xl text-xs font-medium">
              <button
                id="privacy-header-policy-btn"
                onClick={() => onNavigate('/privacy')}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-[var(--emos-surface)] text-[var(--emos-accent-text)] border border-[var(--emos-border-strong)] font-semibold shadow-xs cursor-pointer"
              >
                Privacy Policy
              </button>
              <button
                id="privacy-header-terms-btn"
                onClick={() => onNavigate('/terms')}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)] transition-colors cursor-pointer"
              >
                Terms of Service
              </button>
            </nav>

            <ThemeSelector />

            {user ? (
              <button
                id="privacy-header-dashboard-btn"
                onClick={() => onNavigate('/')}
                className="text-xs sm:text-sm font-semibold bg-[var(--emos-surface)] hover:bg-[var(--emos-surface-hover)] text-[var(--emos-text-primary)] px-3.5 py-1.5 rounded-xl border border-[var(--emos-border-subtle)] transition-all flex items-center gap-1.5 cursor-pointer min-h-[34px]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Back to</span> Workspace
              </button>
            ) : (
              <button
                id="privacy-header-signin-btn"
                onClick={handleSignIn}
                className="text-xs sm:text-sm font-semibold bg-[#A88554] hover:bg-[#BCA075] dark:hover:bg-[#E5C492] text-black px-3.5 sm:px-4 py-1.5 rounded-xl transition-all flex items-center gap-2 shadow-sm cursor-pointer min-h-[34px]"
              >
                Sign In with Google
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="space-y-10">
          {/* Breadcrumb & Title */}
          <div className="space-y-3">
            <button
              id="privacy-back-link"
              onClick={() => onNavigate('/')}
              className="inline-flex items-center gap-1.5 text-xs text-[var(--emos-accent)] hover:text-[var(--emos-accent-text)] font-semibold cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to {user ? 'Workspace' : 'Home'}</span>
            </button>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[var(--emos-accent-text)] px-2.5 py-0.5 rounded bg-[var(--emos-accent-subtle)] border border-[var(--emos-accent-border)] font-semibold">
                Privacy Disclosure
              </span>
              <span className="text-xs text-[var(--emos-text-muted)] font-mono">
                EMOS Ideathon Demonstration
              </span>
              <span className="text-xs text-[var(--emos-text-muted)] font-mono">
                • Effective date: September 6, 2026 • Last updated: September 6, 2026
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[var(--emos-text-primary)] tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-sm sm:text-base text-[var(--emos-text-secondary)] leading-relaxed max-w-3xl">
              This Privacy Policy explains how the Enterprise Modernization Operating System (EMOS) processes, stores, and protects portfolio architecture inputs, modernization assessments, and authentication data during ideathon demonstration and evaluation use.
            </p>
          </div>

          {/* Quick Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[var(--emos-surface)] border border-[var(--emos-border-subtle)] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--emos-text-primary)]">
                <ShieldCheck className="w-4 h-4 text-[var(--emos-accent)] shrink-0" />
                <span>Google Sign-In</span>
              </div>
              <p className="text-xs text-[var(--emos-text-secondary)] leading-relaxed">
                Federated authentication without passwords. Profile details and identifiers are stored for session display.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--emos-surface)] border border-[var(--emos-border-subtle)] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--emos-text-primary)]">
                <Lock className="w-4 h-4 text-[var(--emos-accent)] shrink-0" />
                <span>Path Access Control</span>
              </div>
              <p className="text-xs text-[var(--emos-text-secondary)] leading-relaxed">
                Firestore security rules enforce access to document paths matching the authenticated user ID.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--emos-surface)] border border-[var(--emos-border-subtle)] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--emos-text-primary)]">
                <Trash2 className="w-4 h-4 text-[var(--emos-accent)] shrink-0" />
                <span>Active Storage Deletion</span>
              </div>
              <p className="text-xs text-[var(--emos-text-secondary)] leading-relaxed">
                Delete selected assessments or imported workloads from active Cloud Firestore collections.
              </p>
            </div>
          </div>

          {/* Detailed Policy Sections */}
          <div className="space-y-8 text-sm text-[var(--emos-text-secondary)] leading-relaxed">
            {/* Section 1: Authentication & Identity */}
            <section id="section-authentication" className="p-6 rounded-2xl bg-[var(--emos-surface)] border border-[var(--emos-border-subtle)] space-y-3">
              <div className="flex items-center gap-2.5 text-base font-serif font-bold text-[var(--emos-text-primary)]">
                <ShieldCheck className="w-5 h-5 text-[var(--emos-accent)]" />
                <h2>1. Google Sign-In & Federated Identity</h2>
              </div>
              <p>
                EMOS relies on Firebase Authentication with Google Sign-In for federated identity management. When you sign in:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-1 text-xs sm:text-sm">
                <li>Authentication is handled by Google and Firebase through standard browser popups.</li>
                <li>EMOS <strong>does not collect, handle, or store user passwords</strong> in application databases or custom server code.</li>
                <li>EMOS stores the following Google account profile data in Cloud Firestore: your display name, email address, profile photo URL, unique user identifier (<code className="font-mono text-xs px-1 py-0.5 rounded bg-[var(--emos-code-bg)] border border-[var(--emos-code-border)]">userId</code> / <code className="font-mono text-xs px-1 py-0.5 rounded bg-[var(--emos-code-bg)] border border-[var(--emos-code-border)]">uid</code>), Firebase account creation timestamp, and last active timestamp.</li>
                <li>The browser sends a Firebase authentication token to the EMOS server so the server can verify the signed-in user.</li>
              </ul>
            </section>

            {/* Section 2: Portfolio and Assessment Inputs */}
            <section id="section-inputs" className="p-6 rounded-2xl bg-[var(--emos-surface)] border border-[var(--emos-border-subtle)] space-y-3">
              <div className="flex items-center gap-2.5 text-base font-serif font-bold text-[var(--emos-text-primary)]">
                <FileCode2 className="w-5 h-5 text-[var(--emos-accent)]" />
                <h2>2. Portfolio and Assessment Inputs</h2>
              </div>
              <p>
                To evaluate modernization readiness across the 6R dispositions (Retain, Retire, Rehost, Replatform, Refactor, Repurchase), you may supply technical workload details:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-1 text-xs sm:text-sm">
                <li>Workload identifiers, application names, and architectural descriptions.</li>
                <li>Enterprise DNA technical attributes (e.g., runtime frameworks, databases, dependencies, criticality, and target platforms).</li>
                <li>Portfolio inventory data (CSV uploads of application lists and technical attributes).</li>
                <li>Interactive modernization prompts, evaluation questions, and follow-up discussion text.</li>
                <li>Program alignment configuration, including program name, sponsors, outcomes, risk tolerance, and time horizon.</li>
              </ul>
              <p className="text-xs text-[var(--emos-text-muted)] bg-[var(--emos-bg-tertiary)] p-3 rounded-xl border border-[var(--emos-border-subtle)]">
                <strong>Demonstration Environment Notice:</strong> EMOS is an exploratory ideathon decision-support prototype. Do not submit production credentials, private keys, database connection strings, confidential business secrets, or non-public personal information.
              </p>
            </section>

            {/* Section 3: Gemini Processing & Infrastructure */}
            <section id="section-gemini" className="p-6 rounded-2xl bg-[var(--emos-surface)] border border-[var(--emos-border-subtle)] space-y-3">
              <div className="flex items-center gap-2.5 text-base font-serif font-bold text-[var(--emos-text-primary)]">
                <BrainCircuit className="w-5 h-5 text-[var(--emos-accent)]" />
                <h2>3. Gemini Processing & Server-Side Execution</h2>
              </div>
              <p>
                When you initiate an assessment, request title generation, or ask multi-turn follow-up questions:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-1 text-xs sm:text-sm">
                <li>Your submitted portfolio data, Enterprise DNA attributes, assessment prompt content, and conversation history are sent over HTTPS from your browser to the EMOS application server running on Cloud Run.</li>
                <li>The EMOS server validates and fences the input, redacts recognized credential patterns, and proxies the prompt to Google Gemini via the Google GenAI SDK.</li>
                <li>EMOS may use one of its configured Google Gemini models to complete a request.</li>
                <li>Google Gemini processes the submitted context to produce structured 6R recommendations, confidence scores, evidence completeness analysis, and architectural rationale.</li>
                <li>Gemini API credentials are configured server-side and are not intentionally included in browser code or application responses.</li>
              </ul>
            </section>

            {/* Section 4: Data Storage & Service Separation */}
            <section id="section-isolation" className="p-6 rounded-2xl bg-[var(--emos-surface)] border border-[var(--emos-border-subtle)] space-y-3">
              <div className="flex items-center gap-2.5 text-base font-serif font-bold text-[var(--emos-text-primary)]">
                <Database className="w-5 h-5 text-[var(--emos-accent)]" />
                <h2>4. Data Storage and Architectural Roles</h2>
              </div>
              <p>
                To understand how your information is handled, EMOS distinguishes among four separate architectural components:
              </p>
              <div className="space-y-3 pt-1">
                <div className="p-3.5 rounded-xl bg-[var(--emos-bg-tertiary)] border border-[var(--emos-border-subtle)]">
                  <h3 className="text-xs font-bold text-[var(--emos-text-primary)] uppercase tracking-wider mb-1">
                    A. Data Stored by EMOS in Cloud Firestore
                  </h3>
                  <p className="text-xs text-[var(--emos-text-secondary)]">
                    Application records including user profiles, modernization assessments, imported portfolio workloads, and executive program alignment settings are stored in Cloud Firestore. Access to these records is restricted by Firestore security rules to the authenticated user ID.
                  </p>
                  <details className="mt-3 text-xs">
                    <summary className="cursor-pointer font-semibold text-[var(--emos-accent-text)] hover:underline select-none">
                      Technical details: Firestore collection paths and rule enforcement
                    </summary>
                    <div className="mt-2 p-3 rounded-lg bg-[var(--emos-surface)] border border-[var(--emos-border-subtle)] space-y-1.5">
                      <p className="text-xs text-[var(--emos-text-secondary)]">
                        Records are organized in per-user paths:
                      </p>
                      <ul className="list-disc list-inside space-y-0.5 pl-1 text-[11px] text-[var(--emos-text-muted)] font-mono">
                        <li>users/&#123;userId&#125; (profile details and timestamps)</li>
                        <li>users/&#123;userId&#125;/interactions/&#123;interactionId&#125; (assessments and 6R evaluations)</li>
                        <li>users/&#123;userId&#125;/importedWorkloads/&#123;workloadId&#125; (imported application portfolio)</li>
                        <li>users/&#123;userId&#125;/programContext/alignment (executive modernization goals)</li>
                      </ul>
                      <p className="text-[11px] text-[var(--emos-text-muted)] pt-1">
                        Firestore security rules (firestore.rules) restrict read, write, and delete operations to paths where request.auth.uid == userId.
                      </p>
                    </div>
                  </details>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--emos-bg-tertiary)] border border-[var(--emos-border-subtle)]">
                  <h3 className="text-xs font-bold text-[var(--emos-text-primary)] uppercase tracking-wider mb-1">
                    B. Content Processed by Google Gemini
                  </h3>
                  <p className="text-xs text-[var(--emos-text-secondary)]">
                    Workload attributes, assessment inputs, and chat queries are transmitted to Google Gemini to generate advisory assessments. This content is processed in transit according to Google Cloud API terms.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--emos-bg-tertiary)] border border-[var(--emos-border-subtle)]">
                  <h3 className="text-xs font-bold text-[var(--emos-text-primary)] uppercase tracking-wider mb-1">
                    C. Authentication Handled by Firebase & Google
                  </h3>
                  <p className="text-xs text-[var(--emos-text-secondary)]">
                    Sign-in credentials, federated Google tokens, and authentication cookies are managed directly by Google Identity and Firebase Authentication infrastructure.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--emos-bg-tertiary)] border border-[var(--emos-border-subtle)]">
                  <h3 className="text-xs font-bold text-[var(--emos-text-primary)] uppercase tracking-wider mb-1">
                    D. Operational Information Retained by Infrastructure Providers
                  </h3>
                  <p className="text-xs text-[var(--emos-text-secondary)]">
                    Underlying hosting and cloud infrastructure providers (such as Google Cloud Run, Cloud Logging, and Firebase) may automatically capture standard operational telemetry, including access timestamps, IP addresses, HTTP status codes, and server console output.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 5: Deletion Scope & Limitations */}
            <section id="section-retention" className="p-6 rounded-2xl bg-[var(--emos-surface)] border border-[var(--emos-border-subtle)] space-y-3">
              <div className="flex items-center gap-2.5 text-base font-serif font-bold text-[var(--emos-text-primary)]">
                <Trash2 className="w-5 h-5 text-[var(--emos-accent)]" />
                <h2>5. Data Deletion Scope & Operational Realities</h2>
              </div>
              <p>
                The EMOS application provides explicit controls within the user interface to manage active Firestore records:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-1 text-xs sm:text-sm">
                <li><strong>Individual Assessment Deletion:</strong> Clicking the trash icon on an assessment in the History Sidebar executes a Firestore <code className="font-mono text-xs px-1 py-0.5 rounded bg-[var(--emos-code-bg)] border border-[var(--emos-code-border)]">deleteDoc</code> operation for that specific interaction document under <code className="font-mono text-xs px-1 py-0.5 rounded bg-[var(--emos-code-bg)] border border-[var(--emos-code-border)]">users/&#123;userId&#125;/interactions/&#123;interactionId&#125;</code>.</li>
                <li><strong>Imported Workload Deletion:</strong> Deleting a single workload or clearing the imported portfolio deletes the corresponding documents from <code className="font-mono text-xs px-1 py-0.5 rounded bg-[var(--emos-code-bg)] border border-[var(--emos-code-border)]">users/&#123;userId&#125;/importedWorkloads</code> in active Firestore storage.</li>
                <li><strong>Scope Limitations:</strong> Deleting an individual assessment or workload removes only that specific active Firestore document. It does <strong>not</strong> delete:
                  <ul className="list-disc list-inside space-y-0.5 pl-4 mt-1 text-xs text-[var(--emos-text-muted)]">
                    <li>Your user profile document (<code className="font-mono text-[11px] px-1 py-0.5 rounded bg-[var(--emos-code-bg)] border border-[var(--emos-code-border)]">users/&#123;userId&#125;</code>) or account record in Firebase Authentication;</li>
                    <li>Other saved assessments or other imported workloads;</li>
                    <li>Your program alignment data (<code className="font-mono text-[11px] px-1 py-0.5 rounded bg-[var(--emos-code-bg)] border border-[var(--emos-code-border)]">users/&#123;userId&#125;/programContext/alignment</code>);</li>
                    <li>Server access logs, runtime telemetry, or provider-managed database snapshots and backups.</li>
                  </ul>
                </li>
                <li><strong>No Deletion Guarantees Across Upstream Services:</strong> Deletion controls in EMOS operate exclusively on active Cloud Firestore documents. EMOS does not warrant automated deletion from provider logs, cached network layers, or cloud infrastructure backups.</li>
              </ul>
            </section>

            {/* Section 6: Support Contact */}
            <section id="section-contact" className="p-6 rounded-2xl bg-[var(--emos-surface)] border border-[var(--emos-border-subtle)] space-y-3">
              <div className="flex items-center gap-2.5 text-base font-serif font-bold text-[var(--emos-text-primary)]">
                <Mail className="w-5 h-5 text-[var(--emos-accent)]" />
                <h2>6. Support & Inquiries</h2>
              </div>
              <p>
                For questions regarding this demonstration prototype or inquiries about recorded assessment data:
              </p>
              <div className="p-4 rounded-xl bg-[var(--emos-bg-tertiary)] border border-[var(--emos-border-subtle)] space-y-2">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[var(--emos-text-primary)]">
                  <Mail className="w-4 h-4 text-[var(--emos-accent)]" />
                  <a
                    href="mailto:jeasom@gmail.com"
                    className="text-[var(--emos-accent)] hover:text-[var(--emos-accent-text)] underline underline-offset-4"
                  >
                    jeasom@gmail.com
                  </a>
                </div>
                <p className="text-xs text-[var(--emos-text-muted)]">
                  Project: EMOS (Enterprise Modernization Operating System) • Ideathon Demonstration
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--emos-border-subtle)] py-8 px-4 sm:px-6 bg-[var(--emos-bg-secondary)] text-xs text-[var(--emos-text-muted)] transition-colors">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif font-semibold text-[var(--emos-text-primary)]">EMOS</span>
            <span>—</span>
            <span>Enterprise Modernization Operating System</span>
            <span className="hidden md:inline">• Ideathon Demonstration</span>
          </div>
          <div className="flex items-center gap-6">
            <button
              id="privacy-footer-privacy-btn"
              onClick={() => onNavigate('/privacy')}
              className="text-[var(--emos-accent-text)] font-semibold hover:underline underline-offset-4 cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              id="privacy-footer-terms-btn"
              onClick={() => onNavigate('/terms')}
              className="text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)] hover:underline underline-offset-4 transition-colors font-medium cursor-pointer"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
