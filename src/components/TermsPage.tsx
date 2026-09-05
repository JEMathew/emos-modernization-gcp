import React, { useEffect } from 'react';
import {
  Sparkles,
  Scale,
  AlertTriangle,
  FileCheck2,
  CheckCircle2,
  Server,
  ArrowLeft,
  Mail,
  ShieldAlert
} from 'lucide-react';
import type { User } from 'firebase/auth';
import { ThemeSelector } from './ThemeSelector';
import { signInWithGoogle } from '../lib/firebase';

interface TermsPageProps {
  user: User | null;
  onNavigate: (path: string) => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ user, onNavigate }) => {
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
              id="terms-nav-brand-btn"
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
                id="terms-header-policy-btn"
                onClick={() => onNavigate('/privacy')}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)] transition-colors cursor-pointer"
              >
                Privacy Policy
              </button>
              <button
                id="terms-header-terms-btn"
                onClick={() => onNavigate('/terms')}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-[var(--emos-surface)] text-[var(--emos-accent-text)] border border-[var(--emos-border-strong)] font-semibold shadow-xs cursor-pointer"
              >
                Terms of Service
              </button>
            </nav>

            <ThemeSelector />

            {user ? (
              <button
                id="terms-header-dashboard-btn"
                onClick={() => onNavigate('/')}
                className="text-xs sm:text-sm font-semibold bg-[var(--emos-surface)] hover:bg-[var(--emos-surface-hover)] text-[var(--emos-text-primary)] px-3.5 py-1.5 rounded-xl border border-[var(--emos-border-subtle)] transition-all flex items-center gap-1.5 cursor-pointer min-h-[34px]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Back to</span> Workspace
              </button>
            ) : (
              <button
                id="terms-header-signin-btn"
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
              id="terms-back-link"
              onClick={() => onNavigate('/')}
              className="inline-flex items-center gap-1.5 text-xs text-[var(--emos-accent)] hover:text-[var(--emos-accent-text)] font-semibold cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to {user ? 'Workspace' : 'Home'}</span>
            </button>
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[var(--emos-accent-text)] px-2.5 py-0.5 rounded bg-[var(--emos-accent-subtle)] border border-[var(--emos-accent-border)] font-semibold">
                Usage Terms
              </span>
              <span className="text-xs text-[var(--emos-text-muted)] font-mono">
                EMOS Ideathon Demonstration
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[var(--emos-text-primary)] tracking-tight">
              Terms of Service
            </h1>
            <p className="text-sm sm:text-base text-[var(--emos-text-secondary)] leading-relaxed max-w-3xl">
              These Terms of Service govern your access to and use of the Enterprise Modernization Operating System (EMOS) demonstration application. By accessing or using EMOS, you acknowledge and agree to these terms.
            </p>
          </div>

          {/* Core Tenet Callouts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[var(--emos-surface)] border border-[var(--emos-border-subtle)] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--emos-text-primary)]">
                <FileCheck2 className="w-4 h-4 text-[var(--emos-accent)] shrink-0" />
                <span>Ideathon Demonstration</span>
              </div>
              <p className="text-xs text-[var(--emos-text-secondary)] leading-relaxed">
                EMOS is an AI-native decision intelligence prototype created for ideathon evaluation and concept exploration.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--emos-surface)] border border-[var(--emos-border-subtle)] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--emos-text-primary)]">
                <AlertTriangle className="w-4 h-4 text-[#A88554] shrink-0" />
                <span>Advisory Heuristics Only</span>
              </div>
              <p className="text-xs text-[var(--emos-text-secondary)] leading-relaxed">
                6R dispositions and readiness scores are decision-support heuristics, not certified migration engineering advice.
              </p>
            </div>
          </div>

          {/* Detailed Terms Sections */}
          <div className="space-y-8 text-sm text-[var(--emos-text-secondary)] leading-relaxed">
            {/* Section 1: Nature of the Service */}
            <section id="terms-section-demonstration" className="p-6 rounded-2xl bg-[var(--emos-surface)] border border-[var(--emos-border-subtle)] space-y-3">
              <div className="flex items-center gap-2.5 text-base font-serif font-bold text-[var(--emos-text-primary)]">
                <Scale className="w-5 h-5 text-[var(--emos-accent)]" />
                <h2>1. Decision-Support and Ideathon Demonstration</h2>
              </div>
              <p>
                The Enterprise Modernization Operating System (EMOS) is designed and made available as a <strong>decision-support and ideathon demonstration prototype</strong>.
              </p>
              <ul className="list-disc list-inside space-y-1 pl-1 text-xs sm:text-sm">
                <li>EMOS illustrates how AI-assisted workflows, Enterprise DNA evidence completeness tracking, and multi-turn architectural inquiry can structure legacy migration evaluations.</li>
                <li>The system is an exploratory decision-intelligence prototype, not a commercial SaaS enterprise deployment or licensed migration product.</li>
                <li>Features, evaluation models, prompt structures, and user interface elements may evolve, change, or be updated as part of prototype iteration.</li>
              </ul>
            </section>

            {/* Section 2: Non-Professional Advice Disclaimer */}
            <section id="terms-section-disclaimer" className="p-6 rounded-2xl bg-[var(--emos-surface)] border border-[var(--emos-border-subtle)] space-y-3">
              <div className="flex items-center gap-2.5 text-base font-serif font-bold text-[var(--emos-text-primary)]">
                <AlertTriangle className="w-5 h-5 text-[var(--emos-accent)]" />
                <h2>2. No Professional or Migration-Execution Advice</h2>
              </div>
              <p>
                Modernization assessments, 6R classifications (Retain, Retire, Rehost, Replatform, Refactor, Repurchase), confidence scores, missing evidence flags, and wave planning sequences generated by EMOS or the underlying Gemini generative models are <strong>strictly advisory heuristics</strong>.
              </p>
              <ul className="list-disc list-inside space-y-1 pl-1 text-xs sm:text-sm">
                <li><strong>Not Architectural Guarantees:</strong> Outputs do not constitute certified engineering plans, formal architectural blueprints, or migration-execution specifications.</li>
                <li><strong>No Professional Warranties:</strong> Recommendations are not legal, compliance, financial, risk-underwriting, or certified professional migration advice.</li>
                <li><strong>Deterministic Verification Required:</strong> Enterprise modernization involves complex infrastructure dependencies, legacy runtime behavior, security boundaries, and regulatory constraints. You must independently test, audit, and validate any architecture decision with qualified domain experts before executing any production changes or code migrations.</li>
              </ul>
            </section>

            {/* Section 3: User Responsibilities */}
            <section id="terms-section-responsibilities" className="p-6 rounded-2xl bg-[var(--emos-surface)] border border-[var(--emos-border-subtle)] space-y-3">
              <div className="flex items-center gap-2.5 text-base font-serif font-bold text-[var(--emos-text-primary)]">
                <CheckCircle2 className="w-5 h-5 text-[var(--emos-accent)]" />
                <h2>3. User Responsibility for Decisions and Submitted Data</h2>
              </div>
              <p>
                As a user of the EMOS demonstration environment, you remain fully responsible for your use of the system:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-1 text-xs sm:text-sm">
                <li><strong>Ownership of Decisions:</strong> You retain sole decision-making responsibility for any architectural choices, migration planning, infrastructure investments, or code refactorings you undertake.</li>
                <li><strong>Data Appropriateness:</strong> You are responsible for the content of all portfolio inventories, application descriptions, CSV files, and prompts submitted to EMOS. You must have all necessary rights and permissions to submit such materials.</li>
                <li><strong>Prohibited Data:</strong> You must not upload or input production secrets, database credentials, cryptographic private keys, regulated health data, payment card records, or confidential non-public personal information into this prototype.</li>
              </ul>
            </section>

            {/* Section 4: Acceptable Use */}
            <section id="terms-section-acceptable-use" className="p-6 rounded-2xl bg-[var(--emos-surface)] border border-[var(--emos-border-subtle)] space-y-3">
              <div className="flex items-center gap-2.5 text-base font-serif font-bold text-[var(--emos-text-primary)]">
                <ShieldAlert className="w-5 h-5 text-[var(--emos-accent)]" />
                <h2>4. Acceptable Use Policy</h2>
              </div>
              <p>
                You agree to use EMOS solely for lawful demonstration, evaluation, and ideathon review purposes. You agree not to:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-1 text-xs sm:text-sm">
                <li>Attempt to bypass, subvert, or probe authentication controls, authorization checks, or Firestore security rules.</li>
                <li>Perform automated scraping, denial-of-service, or volumetric load testing against demonstration servers or API proxies.</li>
                <li>Inject prompt-injection exploits, malicious scripts, or deceptive payloads intended to compromise model safety or server integrity.</li>
                <li>Use the service to generate deceptive, harmful, or unlawful content.</li>
              </ul>
            </section>

            {/* Section 5: Availability & Disclaimer of Warranties */}
            <section id="terms-section-availability" className="p-6 rounded-2xl bg-[var(--emos-surface)] border border-[var(--emos-border-subtle)] space-y-3">
              <div className="flex items-center gap-2.5 text-base font-serif font-bold text-[var(--emos-text-primary)]">
                <Server className="w-5 h-5 text-[var(--emos-accent)]" />
                <h2>5. Service Availability and "As-Is" Disclaimer</h2>
              </div>
              <p>
                EMOS is provided on an <strong>"AS IS" and "AS AVAILABLE" basis</strong> without warranty of any kind, whether express, implied, statutory, or otherwise.
              </p>
              <ul className="list-disc list-inside space-y-1 pl-1 text-xs sm:text-sm">
                <li><strong>No Availability Warranties:</strong> There are no service level agreements (SLAs), uptime guarantees, or commitments to continuous, error-free operation.</li>
                <li><strong>Demonstration Maintenance:</strong> Demonstration instances, databases, or API proxies may be restarted, suspended, modified, or discontinued at any time without notice.</li>
                <li><strong>Limitation of Liability:</strong> To the maximum extent permitted by applicable law, the project authors and maintainers shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use this demonstration service or reliance on its outputs.</li>
              </ul>
            </section>

            {/* Section 6: Contact & Inquiries */}
            <section id="terms-section-contact" className="p-6 rounded-2xl bg-[var(--emos-surface)] border border-[var(--emos-border-subtle)] space-y-3">
              <div className="flex items-center gap-2.5 text-base font-serif font-bold text-[var(--emos-text-primary)]">
                <Mail className="w-5 h-5 text-[var(--emos-accent)]" />
                <h2>6. Questions and Inquiries</h2>
              </div>
              <p>
                If you have questions regarding these Terms of Service or the EMOS demonstration prototype, please contact:
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
              id="terms-footer-privacy-btn"
              onClick={() => onNavigate('/privacy')}
              className="text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)] hover:underline underline-offset-4 transition-colors font-medium cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              id="terms-footer-terms-btn"
              onClick={() => onNavigate('/terms')}
              className="text-[var(--emos-accent-text)] font-semibold hover:underline underline-offset-4 cursor-pointer"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
