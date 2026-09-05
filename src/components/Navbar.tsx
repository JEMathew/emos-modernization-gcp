import React from 'react';
import { Sparkles, LogOut, Plus, ShieldCheck, Database, User as UserIcon, Layers, FileText, Route } from 'lucide-react';
import type { User } from 'firebase/auth';
import { signOut } from '../lib/firebase';
import { ThemeSelector } from './ThemeSelector';

interface NavbarProps {
  user: User | null;
  currentView: 'portfolio' | 'dna' | 'workspace' | 'plan';
  selectedId?: string | null;
  assessmentCount?: number;
  onNavigate: (view: 'portfolio' | 'decision-intelligence' | 'assessments' | 'plan') => void;
  onNewAssessment: () => void;
  onOpenWalkthrough: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  currentView,
  selectedId,
  assessmentCount,
  onNavigate,
  onNewAssessment,
  onOpenWalkthrough,
}) => {
  return (
    <header id="app-header" className="border-b border-[var(--emos-border-subtle)] bg-[var(--emos-bg-secondary)]/95 backdrop-blur-md sticky top-0 z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#A88554] to-[#E5C492] flex items-center justify-center shadow-lg shadow-[#A88554]/15 shrink-0">
            <Sparkles className="w-4 h-4 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-serif font-bold text-[var(--emos-text-primary)] tracking-wider text-base sm:text-lg">
                EMOS
              </span>
              <span className="text-xs text-[var(--emos-text-muted)] hidden md:inline font-normal">
                Enterprise Modernization Operating System
              </span>
              <span className="text-[10px] font-sans uppercase tracking-wider text-[var(--emos-accent)] font-medium px-2 py-0.5 rounded bg-[var(--emos-accent-subtle)] border border-[var(--emos-accent-border)] hidden sm:inline">
                Decision Intelligence
              </span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] text-[var(--emos-text-muted)]">
              <span className="md:hidden text-[var(--emos-text-muted)] font-normal">
                Enterprise Modernization Operating System •
              </span>
              <span className="inline-flex items-center gap-1 text-[var(--emos-accent)] font-medium">
                <ShieldCheck className="w-3 h-3" /> 6R Enterprise Architecture
              </span>
              <span className="hidden sm:inline text-[var(--emos-border-strong)]">•</span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[var(--emos-text-muted)]">
                <Database className="w-3 h-3 text-[var(--emos-text-muted)]" /> Cloud Firestore
              </span>
            </div>
          </div>
        </div>

        {/* Desktop / Tablet Navigation: Portfolio, Decision Intelligence, Assessments */}
        <nav className="hidden md:flex items-center gap-1 p-1 bg-[var(--emos-bg-tertiary)] border border-[var(--emos-border-subtle)] rounded-xl">
          <button
            id="nav-tab-portfolio"
            onClick={() => onNavigate('portfolio')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentView === 'portfolio' || currentView === 'dna'
                ? 'bg-[var(--emos-surface)] text-[var(--emos-accent-text)] border border-[var(--emos-border-strong)] shadow-xs'
                : 'text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[var(--emos-accent)]" />
            <span>Portfolio</span>
          </button>

          <button
            id="nav-tab-plan"
            onClick={() => onNavigate('plan')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentView === 'plan'
                ? 'bg-[var(--emos-surface)] text-[var(--emos-accent-text)] border border-[var(--emos-border-strong)] shadow-xs'
                : 'text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)]'
            }`}
          >
            <Route className="w-3.5 h-3.5 text-[var(--emos-accent)]" />
            <span>Plan</span>
          </button>

          <button
            id="nav-tab-decision-intel"
            onClick={() => onNavigate('decision-intelligence')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentView === 'workspace' && !selectedId
                ? 'bg-[var(--emos-surface)] text-[var(--emos-accent-text)] border border-[var(--emos-border-strong)] shadow-xs'
                : 'text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--emos-accent)]" />
            <span>Decision Intelligence</span>
          </button>

          <button
            id="nav-tab-assessments"
            onClick={() => onNavigate('assessments')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentView === 'workspace' && selectedId
                ? 'bg-[var(--emos-surface)] text-[var(--emos-accent-text)] border border-[var(--emos-border-strong)] shadow-xs'
                : 'text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)]'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-[var(--emos-accent)]" />
            <span>Assessments</span>
            {assessmentCount !== undefined && assessmentCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[var(--emos-bg-secondary)] border border-[var(--emos-border-subtle)] text-[10px] text-[var(--emos-text-muted)]">
                {assessmentCount}
              </span>
            )}
          </button>
        </nav>

        {/* Actions & User */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <button
            id="walkthrough-btn"
            onClick={onOpenWalkthrough}
            className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)] hover:border-[var(--emos-border-strong)] text-xs font-medium transition-colors"
            title="View Interactive Test Scenarios & Verification"
          >
            Verification & Test Guide
          </button>

          <button
            id="nav-new-assessment-btn"
            onClick={onNewAssessment}
            className="inline-flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-[#A88554] hover:bg-[#BCA075] dark:hover:bg-[#E5C492] text-black text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-98 cursor-pointer min-h-[36px] sm:min-h-[38px]"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Assessment</span>
            <span className="sm:hidden">New</span>
          </button>

          {/* Theme Appearance Control */}
          <ThemeSelector />

          {user && (
            <div className="flex items-center gap-2 sm:gap-3 pl-1.5 sm:pl-2.5 border-l border-[var(--emos-border-subtle)]">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[var(--emos-border-subtle)] object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[var(--emos-surface-elevated)] border border-[var(--emos-border-subtle)] flex items-center justify-center text-[var(--emos-accent)] font-serif text-xs sm:text-sm font-semibold">
                  {user.displayName ? user.displayName.slice(0, 1).toUpperCase() : <UserIcon className="w-4 h-4" />}
                </div>
              )}

              <div className="hidden lg:block text-left max-w-[120px]">
                <p className="text-xs font-semibold text-[var(--emos-text-primary)] truncate">
                  {user.displayName || 'Authenticated User'}
                </p>
                <p className="text-[10px] text-[var(--emos-text-muted)] truncate">{user.email}</p>
              </div>

              <button
                id="sign-out-btn"
                onClick={() => signOut()}
                className="p-1.5 sm:p-2 rounded-xl text-[var(--emos-text-muted)] hover:text-[var(--emos-text-primary)] hover:bg-[var(--emos-surface-hover)] transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Secondary Navigation Row (320px - 767px) */}
      <div className="md:hidden border-t border-[var(--emos-border-subtle)] px-2 py-1.5 bg-[var(--emos-bg-tertiary)] flex items-center justify-around gap-1">
        <button
          id="mobile-nav-portfolio"
          onClick={() => onNavigate('portfolio')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all min-h-[40px] cursor-pointer ${
            currentView === 'portfolio' || currentView === 'dna'
              ? 'bg-[var(--emos-surface)] text-[var(--emos-accent-text)] border border-[var(--emos-border-strong)] shadow-xs'
              : 'text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)]'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-[var(--emos-accent)]" />
          <span>Portfolio</span>
        </button>

        <button
          id="mobile-nav-plan"
          onClick={() => onNavigate('plan')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all min-h-[40px] cursor-pointer ${
            currentView === 'plan'
              ? 'bg-[var(--emos-surface)] text-[var(--emos-accent-text)] border border-[var(--emos-border-strong)] shadow-xs'
              : 'text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)]'
          }`}
        >
          <Route className="w-3.5 h-3.5 text-[var(--emos-accent)]" />
          <span>Plan</span>
        </button>

        <button
          id="mobile-nav-decision"
          onClick={() => onNavigate('decision-intelligence')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all min-h-[40px] cursor-pointer ${
            currentView === 'workspace' && !selectedId
              ? 'bg-[var(--emos-surface)] text-[var(--emos-accent-text)] border border-[var(--emos-border-strong)] shadow-xs'
              : 'text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[var(--emos-accent)]" />
          <span>Decision Intel</span>
        </button>

        <button
          id="mobile-nav-assessments"
          onClick={() => onNavigate('assessments')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all min-h-[40px] cursor-pointer ${
            currentView === 'workspace' && selectedId
              ? 'bg-[var(--emos-surface)] text-[var(--emos-accent-text)] border border-[var(--emos-border-strong)] shadow-xs'
              : 'text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)]'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-[var(--emos-accent)]" />
          <span>Assessments</span>
          {assessmentCount !== undefined && assessmentCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-[var(--emos-bg-secondary)] border border-[var(--emos-border-subtle)] text-[10px] text-[var(--emos-text-muted)]">
              {assessmentCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
