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
import { ThemeProvider } from './lib/theme';
import { Sparkles } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthChecking(false);
    });

    return () => unsubscribe();
  }, []);

  if (isAuthChecking) {
    return (
      <ThemeProvider>
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
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      {currentUser ? (
        <Dashboard user={currentUser} />
      ) : (
        <LandingPage onOpenWalkthrough={() => setIsWalkthroughOpen(true)} />
      )}

      <TestWalkthroughModal
        isOpen={isWalkthroughOpen}
        onClose={() => setIsWalkthroughOpen(false)}
      />
    </ThemeProvider>
  );
}
