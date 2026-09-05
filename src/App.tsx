/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from './lib/firebase';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { TestWalkthroughModal } from './components/TestWalkthroughModal';
import { PrivacyPolicyPage } from './components/PrivacyPolicyPage';
import { TermsPage } from './components/TermsPage';
import { ThemeProvider } from './lib/theme';
import { Sparkles } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthChecking(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (currentPath === '/privacy') {
      document.title = 'Privacy Policy — EMOS';
      return;
    }

    if (currentPath === '/terms') {
      document.title = 'Terms of Service — EMOS';
      return;
    }

    document.title = 'EMOS — Enterprise Modernization Operating System';
  }, [currentPath]);

  const navigateTo = (path: string) => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname !== path) {
        window.history.pushState({}, '', path);
      }
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderContent = () => {
    if (currentPath === '/privacy') {
      return <PrivacyPolicyPage user={currentUser} onNavigate={navigateTo} />;
    }

    if (currentPath === '/terms') {
      return <TermsPage user={currentUser} onNavigate={navigateTo} />;
    }

    if (isAuthChecking) {
      return (
        <div className="min-h-screen bg-[var(--emos-bg)] text-[var(--emos-text-primary)] flex flex-col items-center justify-center space-y-5">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#A88554] to-[#E5C492] text-black flex items-center justify-center shadow-2xl shadow-[#A88554]/20 animate-pulse">
            <Sparkles className="w-6 h-6 text-black" />
          </div>
          <div className="space-y-1.5 text-center">
            <p className="font-serif font-bold text-lg text-[var(--emos-text-primary)] tracking-wider">
              EMOS
            </p>
            <p className="text-xs text-[var(--emos-text-muted)]">
              Enterprise Modernization Operating System
            </p>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--emos-text-muted)] font-semibold">
              Initializing secure authentication...
            </p>
          </div>
        </div>
      );
    }

    if (currentUser) {
      return <Dashboard user={currentUser} />;
    }

    return (
      <LandingPage
        onOpenWalkthrough={() => setIsWalkthroughOpen(true)}
        onNavigate={navigateTo}
      />
    );
  };

  return (
    <ThemeProvider>
      {renderContent()}

      <TestWalkthroughModal
        isOpen={isWalkthroughOpen}
        onClose={() => setIsWalkthroughOpen(false)}
      />
    </ThemeProvider>
  );
}
