import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Lock,
  Clock,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase';
import { ThemeSelector } from './ThemeSelector';

interface LandingPageProps {
  onOpenWalkthrough: () => void;
  onNavigate?: (path: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenWalkthrough, onNavigate }) => {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      setAuthError(null);
      await signInWithGoogle();
    } catch (err: any) {
      console.error("Sign in failed:", err);
      // Popup closed by user or standard web auth prompt
      if (err?.code !== 'auth/popup-closed-by-user') {
        setAuthError(err?.message || "Failed to complete Google Sign-In. Please ensure popups are enabled and retry.");
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--emos-bg)] text-[var(--emos-text-primary)] flex flex-col selection:bg-[#A88554] selection:text-black font-sans transition-colors">
      {/* Top Banner */}
      <header className="border-b border-[var(--emos-border-subtle)] bg-[var(--emos-bg-secondary)]/90 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#A88554] to-[#E5C492] text-black flex items-center justify-center font-serif font-bold text-sm shadow-md">
              <Sparkles className="w-4 h-4 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold tracking-wider text-[var(--emos-text-primary)] text-base">
                  EMOS
                </span>
                <span className="text-xs text-[var(--emos-text-secondary)] hidden md:inline font-normal">
                  Enterprise Modernization Operating System
                </span>
                <span className="text-[10px] font-sans uppercase tracking-wider text-[var(--emos-accent-text)] font-medium px-2 py-0.5 rounded bg-[var(--emos-accent-subtle)] border border-[var(--emos-accent-border)] hidden sm:inline">
                  Decision Intelligence
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <ThemeSelector />

            <button
              id="landing-walkthrough-nav-btn"
              onClick={onOpenWalkthrough}
              className="text-xs font-medium text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)] px-3 py-1.5 rounded-xl border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] hover:bg-[var(--emos-surface-hover)] transition-colors cursor-pointer hidden sm:inline-flex min-h-[34px] items-center"
            >
              5-Minute Tour
            </button>
            <button
              id="landing-header-signin-btn"
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="text-xs sm:text-sm font-semibold bg-[#A88554] hover:bg-[#BCA075] dark:hover:bg-[#E5C492] text-black px-3.5 sm:px-4 py-1.5 rounded-xl transition-all flex items-center gap-2 shadow-sm cursor-pointer min-h-[34px]"
            >
              {isSigningIn ? 'Connecting...' : 'Sign In with Google'}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--emos-surface)] border border-[var(--emos-border-subtle)] text-[var(--emos-accent-text)] text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[var(--emos-accent)]" />
            <span>Ideathon Release: Decision Intelligence • Enterprise Modernization Operating System</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif tracking-tight text-[var(--emos-text-primary)] max-w-3xl mx-auto leading-tight">
            Turn fragmented enterprise modernization evidence into explainable, evidence-aware decisions.
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-[var(--emos-text-secondary)] max-w-2xl mx-auto font-normal leading-relaxed">
            Continuous modernization from intelligence to governed action to measurable outcomes. Assess enterprise workloads across canonical 6R dispositions (Retain, Retire, Rehost, Replatform, Refactor, Repurchase) based on structured Enterprise DNA evidence and clearly identified gaps.
          </p>

          {authError && (
            <div className="max-w-md mx-auto p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{authError}</span>
            </div>
          )}

          {/* Primary Action */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="primary-google-signin-btn"
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#A88554] to-[#E5C492] hover:opacity-95 text-black font-semibold text-sm sm:text-base flex items-center justify-center gap-3 transition-all shadow-md active:scale-98 disabled:opacity-75 cursor-pointer min-h-[44px]"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isSigningIn ? 'Authenticating with Google...' : 'Enter EMOS Workspace with Google'}</span>
              <ArrowRight className="w-4 h-4 text-black/70" />
            </button>

            <button
              id="learn-more-walkthrough-btn"
              onClick={onOpenWalkthrough}
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] hover:bg-[var(--emos-surface-hover)] text-[var(--emos-text-primary)] text-sm font-medium transition-colors cursor-pointer min-h-[44px]"
            >
              View Guided Tour
            </button>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-[var(--emos-text-muted)]">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--emos-accent)]" /> Evidence-Grounded 6R Recommendations
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--emos-accent)]" /> User-Isolated Storage
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--emos-accent)]" /> Multi-Turn Evidence Continuity
            </span>
          </div>
        </div>

        {/* Core Pillars Grid */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          <div className="p-5 sm:p-6 rounded-2xl bg-[var(--emos-surface)] border border-[var(--emos-border-subtle)] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--emos-bg-tertiary)] border border-[var(--emos-border-subtle)] flex items-center justify-center text-[var(--emos-accent)]">
              <BrainCircuit className="w-5 h-5 text-[var(--emos-accent)]" />
            </div>
            <h3 className="font-serif text-[var(--emos-text-primary)] text-base font-semibold">Canonical 6R Modernization Engine</h3>
            <p className="text-[var(--emos-text-secondary)] text-xs leading-relaxed">
              Synthesizes legacy codebases and data platforms strictly into Retain, Retire, Rehost, Replatform, Refactor, or Repurchase with explicit rationale.
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-[var(--emos-surface)] border border-[var(--emos-border-subtle)] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--emos-bg-tertiary)] border border-[var(--emos-border-subtle)] flex items-center justify-center text-[var(--emos-accent)]">
              <Lock className="w-5 h-5 text-[var(--emos-accent)]" />
            </div>
            <h3 className="font-serif text-[var(--emos-text-primary)] text-base font-semibold">User-Isolated Data Access</h3>
            <p className="text-[var(--emos-text-secondary)] text-xs leading-relaxed">
              Firestore security rules restrict database reads and writes to records associated with the authenticated user ID.
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-[var(--emos-surface)] border border-[var(--emos-border-subtle)] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--emos-bg-tertiary)] border border-[var(--emos-border-subtle)] flex items-center justify-center text-[var(--emos-accent)]">
              <Clock className="w-5 h-5 text-[var(--emos-accent)]" />
            </div>
            <h3 className="font-serif text-[var(--emos-text-primary)] text-base font-semibold">Evidence & Risk Discovery</h3>
            <p className="text-[var(--emos-text-secondary)] text-xs leading-relaxed">
              Highlights weak evidence instead of treating it as high-confidence support. Identifies critical missing data, dependency risks, and evaluates decision readiness.
            </p>
          </div>
        </div>

        {/* Security Assurance Banner */}
        <div className="mt-6 sm:mt-8 p-4 sm:p-5 rounded-2xl bg-[var(--emos-surface)] border border-[var(--emos-border-subtle)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-[var(--emos-accent)] shrink-0" />
            <div className="text-xs text-[var(--emos-text-secondary)]">
              <span className="font-medium text-[var(--emos-text-primary)]">Federated Identity Governance:</span> Uses Google Sign-In so account passwords are handled by Google and Firebase Authentication rather than collected by EMOS application code.
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--emos-border-subtle)] py-8 px-4 sm:px-6 bg-[var(--emos-bg-secondary)] text-xs text-[var(--emos-text-muted)] transition-colors">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span className="font-serif font-semibold text-[var(--emos-text-primary)]">EMOS</span>
            <span>—</span>
            <span>Enterprise Modernization Operating System</span>
            <span className="hidden md:inline">• Ideathon Demonstration</span>
          </div>
          <div className="flex items-center gap-6">
            <a
              id="footer-privacy-link"
              href="/privacy"
              onClick={(e) => {
                if (onNavigate) {
                  e.preventDefault();
                  onNavigate('/privacy');
                }
              }}
              className="text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)] hover:underline underline-offset-4 transition-colors font-medium"
            >
              Privacy Policy
            </a>
            <a
              id="footer-terms-link"
              href="/terms"
              onClick={(e) => {
                if (onNavigate) {
                  e.preventDefault();
                  onNavigate('/terms');
                }
              }}
              className="text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)] hover:underline underline-offset-4 transition-colors font-medium"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
