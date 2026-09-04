import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Lock,
  MessageSquareText,
  Clock,
  ArrowRight,
  BrainCircuit,
  Database,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase';

interface LandingPageProps {
  onOpenWalkthrough: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenWalkthrough }) => {
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
    <div className="min-h-screen bg-[#0A0A0A] text-[#D4D4D4] flex flex-col selection:bg-[#A88554] selection:text-black font-sans">
      {/* Top Banner */}
      <header className="border-b border-[#222] bg-[#0A0A0A]/90 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#A88554] to-[#E5C492] text-black flex items-center justify-center font-serif font-bold text-sm shadow-md">
              <Sparkles className="w-4 h-4 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold tracking-wider text-white text-base">
                  EMOS
                </span>
                <span className="text-xs text-[#888] hidden md:inline font-normal">
                  Enterprise Modernization Operating System
                </span>
                <span className="text-[10px] font-sans uppercase tracking-wider text-[#A88554] font-medium px-2 py-0.5 rounded bg-[#A88554]/10 border border-[#A88554]/20 hidden sm:inline">
                  Decision Intelligence
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="landing-walkthrough-nav-btn"
              onClick={onOpenWalkthrough}
              className="text-xs font-medium text-[#888] hover:text-white px-3 py-1.5 rounded-xl border border-[#333] bg-[#141414] hover:bg-[#1A1A1A] transition-colors cursor-pointer"
            >
              Test Scenarios
            </button>
            <button
              id="landing-header-signin-btn"
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="text-xs sm:text-sm font-semibold bg-[#A88554] hover:bg-[#E5C492] text-black px-4 py-1.5 rounded-xl transition-all flex items-center gap-2 shadow-md cursor-pointer"
            >
              {isSigningIn ? 'Connecting...' : 'Sign In with Google'}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#151515] border border-[#333] text-[#A88554] text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#A88554]" />
            <span>Ideathon Release: Decision Intelligence • Enterprise Modernization Operating System</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif tracking-tight text-white max-w-3xl mx-auto leading-tight">
            Turn fragmented enterprise modernization evidence into explainable, evidence-aware decisions.
          </h1>

          <p className="text-base sm:text-lg text-[#777] max-w-2xl mx-auto font-normal leading-relaxed">
            Continuous modernization from intelligence to governed action to measurable outcomes. Assess enterprise workloads across canonical 6R dispositions (Retain, Retire, Rehost, Replatform, Refactor, Repurchase) grounded in deterministic Enterprise DNA evidence completeness.
          </p>

          {authError && (
            <div className="max-w-md mx-auto p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-start gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{authError}</span>
            </div>
          )}

          {/* Primary Action */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="primary-google-signin-btn"
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#A88554] to-[#E5C492] hover:opacity-95 text-black font-semibold text-sm sm:text-base flex items-center justify-center gap-3 transition-all shadow-xl active:scale-98 disabled:opacity-75 cursor-pointer"
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
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-[#333] bg-[#141414] hover:bg-[#1A1A1A] text-[#CCC] hover:text-white text-sm font-medium transition-colors cursor-pointer"
            >
              Architecture & Tests
            </button>
          </div>

          <div className="pt-2 flex items-center justify-center gap-6 text-xs text-[#666]">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#A88554]" /> Canonical 6R Decisions
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#A88554]" /> Owner-Locked Firestore
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#A88554]" /> Multi-Turn Evidence Continuity
            </span>
          </div>
        </div>

        {/* Core Pillars Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-2xl bg-[#0F0F0F] border border-[#222] shadow-xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-[#A88554]">
              <BrainCircuit className="w-5 h-5 text-[#A88554]" />
            </div>
            <h3 className="font-serif text-white text-base">Canonical 6R Modernization Engine</h3>
            <p className="text-[#777] text-xs leading-relaxed">
              Synthesizes legacy codebases and data platforms strictly into Retain, Retire, Rehost, Replatform, Refactor, or Repurchase with explicit rationale.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0F0F0F] border border-[#222] shadow-xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-[#A88554]">
              <Lock className="w-5 h-5 text-[#A88554]" />
            </div>
            <h3 className="font-serif text-white text-base">Zero Cross-Tenant Leakage</h3>
            <p className="text-[#777] text-xs leading-relaxed">
              Strict Attribute-Based Access Control (ABAC) in Cloud Firestore guarantees that enterprise assessments are locked to <code className="bg-[#181818] border border-[#2A2A2A] text-[#A88554] px-1 py-0.5 rounded text-[11px]">/users/&#123;uid&#125;</code>.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0F0F0F] border border-[#222] shadow-xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-[#A88554]">
              <Clock className="w-5 h-5 text-[#A88554]" />
            </div>
            <h3 className="font-serif text-white text-base">Evidence & Risk Discovery</h3>
            <p className="text-[#777] text-xs leading-relaxed">
              Never turns weak evidence into falsely confident advice. Identifies critical missing data, dependency risks, and evaluates decision readiness.
            </p>
          </div>
        </div>

        {/* Security Assurance Banner */}
        <div className="mt-8 p-5 rounded-2xl bg-[#0F0F0F] border border-[#222] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-[#A88554] shrink-0" />
            <div className="text-xs text-[#777]">
              <span className="font-medium text-[#BBB]">Federated Identity Governance:</span> Employs Google Sign-In with zero password storage in application code, ensuring enterprise-grade credential management.
            </div>
          </div>
          <button
            id="test-guide-link"
            onClick={onOpenWalkthrough}
            className="text-xs font-semibold text-[#A88554] underline underline-offset-4 hover:text-[#E5C492] shrink-0 cursor-pointer"
          >
            Review Security Test Specs →
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1C1C1C] py-6 text-center text-xs text-[#555]">
        EMOS — Enterprise Modernization Operating System • Ideathon Release: Decision Intelligence
      </footer>
    </div>
  );
};
