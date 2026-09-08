import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Clock,
  Library,
  Lock,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { signInWithGoogle, getFriendlyAuthErrorMessage } from '../lib/firebase';
import { ThemeSelector } from './ThemeSelector';

interface LandingPageProps {
  onOpenWalkthrough: () => void;
  onNavigate?: (path: string) => void;
  initialAuthError?: string | null;
}

const SIX_R_PATHS = [
  { label: 'Retain', detail: 'Keep value in place' },
  { label: 'Retire', detail: 'Remove needless cost' },
  { label: 'Rehost', detail: 'Move with minimal change' },
  { label: 'Replatform', detail: 'Improve the foundation' },
  { label: 'Refactor', detail: 'Redesign for the goal' },
  { label: 'Repurchase', detail: 'Replace with a product' },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenWalkthrough,
  onNavigate,
  initialAuthError,
}) => {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(initialAuthError ?? null);

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      setAuthError(null);
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Sign in failed:', err);
      if (err?.code !== 'auth/popup-closed-by-user') {
        setAuthError(getFriendlyAuthErrorMessage(err));
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--emos-bg)] text-[var(--emos-text-primary)] selection:bg-[#A88554] selection:text-black font-sans transition-colors">
      <header className="sticky top-0 z-20 border-b border-[var(--emos-border-subtle)] bg-[var(--emos-bg-secondary)]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#A88554] to-[#E5C492] text-black shadow-md">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-base font-bold tracking-wider">EMOS</span>
              <span className="hidden text-xs font-normal text-[var(--emos-text-secondary)] md:inline">
                Enterprise Modernization Operating System
              </span>
              <span className="hidden rounded-full border border-[var(--emos-accent-border)] bg-[var(--emos-accent-subtle)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--emos-accent-text)] sm:inline">
                Vendor-neutral vision
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <a
              id="landing-header-learn-link"
              href="/learn"
              onClick={(event) => {
                if (onNavigate) {
                  event.preventDefault();
                  onNavigate('/learn');
                }
              }}
              className="hidden min-h-[34px] items-center gap-1.5 rounded-xl border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] px-3 text-xs font-semibold text-[var(--emos-text-secondary)] transition-colors hover:text-[var(--emos-text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--emos-accent)] sm:inline-flex"
            >
              <Library className="h-3.5 w-3.5" aria-hidden="true" />
              Learn
            </a>
            <ThemeSelector />
            <button
              id="landing-header-signin-btn"
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="flex min-h-[34px] cursor-pointer items-center gap-2 rounded-xl bg-[#A88554] px-3.5 py-1.5 text-xs font-semibold text-black shadow-sm transition-all hover:bg-[#BCA075] disabled:opacity-75 sm:px-4 sm:text-sm dark:hover:bg-[#E5C492]"
            >
              {isSigningIn ? 'Connecting...' : 'Sign In with Google'}
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-[var(--emos-border-subtle)]">
          <div className="pointer-events-none absolute -left-40 top-8 h-80 w-80 rounded-full bg-[var(--emos-accent-subtle)] blur-3xl" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-16 lg:px-8 lg:py-24">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--emos-accent-border)] bg-[var(--emos-accent-subtle)] px-3.5 py-1.5 text-xs font-semibold text-[var(--emos-accent-text)]">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Public Beta • Vendor-neutral product vision</span>
              </div>

              <h1 className="max-w-3xl font-serif text-4xl font-semibold leading-[1.08] tracking-tight text-[var(--emos-text-primary)] sm:text-5xl lg:text-6xl">
                Your legacy estate is blocking business initiatives you have already committed to.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--emos-text-secondary)] sm:text-lg">
                EMOS helps leaders decide what to modernize, sequences the work, and measures whether it delivered.
              </p>

              {authError && (
                <div className="mt-6 flex max-w-xl items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-left text-xs text-rose-700 dark:text-rose-300">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" aria-hidden="true" />
                  <span>{authError}</span>
                </div>
              )}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  id="primary-google-signin-btn"
                  onClick={handleSignIn}
                  disabled={isSigningIn}
                  className="flex min-h-[48px] w-full cursor-pointer items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#A88554] to-[#E5C492] px-6 py-3.5 text-sm font-semibold text-black shadow-md transition-all hover:opacity-95 active:scale-[0.98] disabled:opacity-75 sm:w-auto sm:text-base"
                >
                  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>{isSigningIn ? 'Authenticating with Google...' : 'Enter EMOS Workspace with Google'}</span>
                  <ArrowRight className="h-4 w-4 text-black/70" aria-hidden="true" />
                </button>

                <button
                  id="learn-more-walkthrough-btn"
                  onClick={onOpenWalkthrough}
                  className="min-h-[48px] w-full cursor-pointer rounded-xl border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] px-5 py-3.5 text-sm font-semibold text-[var(--emos-text-primary)] transition-colors hover:bg-[var(--emos-surface-hover)] sm:w-auto"
                >
                  Explore Product Tour
                </button>
              </div>

              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[var(--emos-text-muted)]">
                {['Evidence-grounded 6R', 'Human-governed decisions', 'User-isolated storage'].map((item) => (
                  <span key={item} className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[var(--emos-accent)]" aria-hidden="true" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <aside className="relative rounded-[28px] border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] p-3 shadow-2xl shadow-black/10 sm:p-4" aria-label="Vendor-neutral modernization decision example">
              <div className="rounded-2xl border border-[var(--emos-border-subtle)] bg-[var(--emos-bg-secondary)] p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4 border-b border-[var(--emos-border-subtle)] pb-5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--emos-accent-text)]">Vendor-neutral decision brief</p>
                    <h2 className="mt-2 font-serif text-2xl font-semibold">One outcome. Six viable paths.</h2>
                  </div>
                  <div className="rounded-xl border border-[var(--emos-accent-border)] bg-[var(--emos-accent-subtle)] p-2.5">
                    <BrainCircuit className="h-5 w-5 text-[var(--emos-accent)]" aria-hidden="true" />
                  </div>
                </div>

                <div className="grid gap-3 py-5 sm:grid-cols-2">
                  <div className="rounded-xl border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--emos-text-muted)]">Business commitment</p>
                    <p className="mt-2 text-sm font-semibold">Connected customer growth</p>
                  </div>
                  <div className="rounded-xl border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--emos-text-muted)]">Legacy blocker</p>
                    <p className="mt-2 text-sm font-semibold">Ageing analytics estate</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {SIX_R_PATHS.map((path) => (
                    <div key={path.label} className="rounded-xl border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] p-3">
                      <p className="text-sm font-semibold text-[var(--emos-text-primary)]">{path.label}</p>
                      <p className="mt-1 text-[10px] leading-snug text-[var(--emos-text-muted)]">{path.detail}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-xl border border-[var(--emos-accent-border)] bg-[var(--emos-accent-subtle)] p-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--emos-accent-text)]">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    Outcome accountability
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-[var(--emos-text-secondary)]">
                    Connect the recommendation to its evidence, rejected alternatives, expected value, and measured result.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="bg-[var(--emos-bg-secondary)]">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-16">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--emos-accent-text)]">Why EMOS</p>
                <h2 className="mt-3 max-w-3xl font-serif text-3xl font-semibold leading-tight sm:text-4xl">
                  Optimized for your business outcomes — not a provider&apos;s cloud consumption.
                </h2>
              </div>
              <p className="text-sm leading-7 text-[var(--emos-text-secondary)] sm:text-base">
                EMOS evaluates every modernization path — including Retain and Retire — against the same evidence, risks, costs, and outcomes. Independent of any cloud or platform vendor, it recommends the best-fit future state without benefiting from increased platform consumption.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {[
                ['Equal consideration', 'All six paths compete on consistent criteria.'],
                ['Evidence over ecosystem', 'The recommendation follows enterprise context, not a preferred platform.'],
                ['Outcome accountability', 'Expected value remains visible after the decision is made.'],
              ].map(([title, description], index) => (
                <div key={title} className="rounded-2xl border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] p-5">
                  <span className="font-serif text-sm font-semibold text-[var(--emos-accent-text)]">0{index + 1}</span>
                  <h3 className="mt-4 text-sm font-semibold">{title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-[var(--emos-text-secondary)]">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="mb-8 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--emos-accent-text)]">Built for governed decisions</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold sm:text-4xl">From fragmented evidence to a decision leaders can defend.</h2>
          </div>

          <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
            <div className="space-y-3 rounded-2xl border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] p-5 shadow-xs sm:p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--emos-border-subtle)] bg-[var(--emos-bg-tertiary)] text-[var(--emos-accent)]">
                <BrainCircuit className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="font-serif text-base font-semibold">Canonical 6R Modernization Engine</h3>
              <p className="text-xs leading-relaxed text-[var(--emos-text-secondary)]">
                Evaluates legacy applications and data platforms across Retain, Retire, Rehost, Replatform, Refactor, and Repurchase with explicit rationale.
              </p>
            </div>

            <div className="space-y-3 rounded-2xl border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] p-5 shadow-xs sm:p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--emos-border-subtle)] bg-[var(--emos-bg-tertiary)] text-[var(--emos-accent)]">
                <Lock className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="font-serif text-base font-semibold">User-Isolated Data Access</h3>
              <p className="text-xs leading-relaxed text-[var(--emos-text-secondary)]">
                Firestore security rules restrict database reads and writes to records associated with the authenticated user ID.
              </p>
            </div>

            <div className="space-y-3 rounded-2xl border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] p-5 shadow-xs sm:p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--emos-border-subtle)] bg-[var(--emos-bg-tertiary)] text-[var(--emos-accent)]">
                <Clock className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="font-serif text-base font-semibold">Evidence and Risk Discovery</h3>
              <p className="text-xs leading-relaxed text-[var(--emos-text-secondary)]">
                Surfaces weak evidence, missing data, dependency risks, and decision blockers before high-risk modernization choices move forward.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-2xl border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] p-4 sm:mt-8 sm:flex-row sm:items-center sm:p-5">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 shrink-0 text-[var(--emos-accent)]" aria-hidden="true" />
              <div className="text-xs text-[var(--emos-text-secondary)]">
                <span className="font-medium text-[var(--emos-text-primary)]">Federated Identity Governance:</span>{' '}
                Uses Google Sign-In so account passwords are handled by Google and Firebase Authentication rather than collected by EMOS application code.
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--emos-border-subtle)] bg-[var(--emos-bg-secondary)] px-4 py-8 text-xs text-[var(--emos-text-muted)] transition-colors sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span className="font-serif font-semibold text-[var(--emos-text-primary)]">EMOS</span>
            <span>—</span>
            <span>Enterprise Modernization Operating System</span>
            <span className="hidden md:inline">• Public Beta</span>
          </div>
          <div className="flex items-center gap-6">
            <a
              id="footer-learn-link"
              href="/learn"
              onClick={(event) => {
                if (onNavigate) {
                  event.preventDefault();
                  onNavigate('/learn');
                }
              }}
              className="font-medium text-[var(--emos-text-secondary)] transition-colors hover:text-[var(--emos-text-primary)] hover:underline underline-offset-4"
            >
              Learning Center
            </a>
            <a
              id="footer-privacy-link"
              href="/privacy"
              onClick={(event) => {
                if (onNavigate) {
                  event.preventDefault();
                  onNavigate('/privacy');
                }
              }}
              className="font-medium text-[var(--emos-text-secondary)] transition-colors hover:text-[var(--emos-text-primary)] hover:underline underline-offset-4"
            >
              Privacy Policy
            </a>
            <a
              id="footer-terms-link"
              href="/terms"
              onClick={(event) => {
                if (onNavigate) {
                  event.preventDefault();
                  onNavigate('/terms');
                }
              }}
              className="font-medium text-[var(--emos-text-secondary)] transition-colors hover:text-[var(--emos-text-primary)] hover:underline underline-offset-4"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
