import React from 'react';
import { Sparkles, LogOut, Plus, ShieldCheck, Database, User as UserIcon, Layers, FileText } from 'lucide-react';
import type { User } from 'firebase/auth';
import { signOut } from '../lib/firebase';

interface NavbarProps {
  user: User | null;
  currentView: 'portfolio' | 'dna' | 'workspace';
  selectedId?: string | null;
  assessmentCount?: number;
  onNavigate: (view: 'portfolio' | 'decision-intelligence' | 'assessments') => void;
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
    <header id="app-header" className="border-b border-[#222] bg-[#0F0F0F]/95 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#A88554] to-[#E5C492] flex items-center justify-center shadow-lg shadow-[#A88554]/15 shrink-0">
            <Sparkles className="w-4 h-4 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-white tracking-wider text-base sm:text-lg">
                EMOS
              </span>
              <span className="text-xs text-[#888] hidden md:inline font-normal">
                Enterprise Modernization Operating System
              </span>
              <span className="text-[10px] font-sans uppercase tracking-wider text-[#A88554] font-medium px-2 py-0.5 rounded bg-[#A88554]/10 border border-[#A88554]/20 hidden sm:inline">
                Decision Intelligence
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-[#777]">
              <span className="md:hidden text-[#999] font-normal">
                Enterprise Modernization Operating System •
              </span>
              <span className="inline-flex items-center gap-1 text-[#A88554] font-medium">
                <ShieldCheck className="w-3 h-3" /> 6R Enterprise Architecture
              </span>
              <span className="text-[#333]">•</span>
              <span className="inline-flex items-center gap-1 text-[#777]">
                <Database className="w-3 h-3 text-[#555]" /> Cloud Firestore
              </span>
            </div>
          </div>
        </div>

        {/* Lightweight Navigation: Portfolio, Decision Intelligence, Assessments */}
        <nav className="hidden sm:flex items-center gap-1 p-1 bg-[#141414] border border-[#262626] rounded-xl">
          <button
            id="nav-tab-portfolio"
            onClick={() => onNavigate('portfolio')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentView === 'portfolio' || currentView === 'dna'
                ? 'bg-[#222] text-[#E5C492] border border-[#333] shadow-sm'
                : 'text-[#888] hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#A88554]" />
            <span>Portfolio</span>
          </button>

          <button
            id="nav-tab-decision-intel"
            onClick={() => onNavigate('decision-intelligence')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentView === 'workspace' && !selectedId
                ? 'bg-[#222] text-[#E5C492] border border-[#333] shadow-sm'
                : 'text-[#888] hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#A88554]" />
            <span>Decision Intelligence</span>
          </button>

          <button
            id="nav-tab-assessments"
            onClick={() => onNavigate('assessments')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentView === 'workspace' && selectedId
                ? 'bg-[#222] text-[#E5C492] border border-[#333] shadow-sm'
                : 'text-[#888] hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-[#A88554]" />
            <span>Assessments</span>
            {assessmentCount !== undefined && assessmentCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#181818] border border-[#2E2E2E] text-[10px] text-[#AAA]">
                {assessmentCount}
              </span>
            )}
          </button>
        </nav>

        {/* Actions & User */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="walkthrough-btn"
            onClick={onOpenWalkthrough}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#333] bg-[#151515] text-[#999] hover:text-white hover:border-[#444] text-xs font-medium transition-colors"
            title="View Interactive Test Scenarios & Verification"
          >
            Verification & Test Guide
          </button>

          <button
            id="nav-new-assessment-btn"
            onClick={onNewAssessment}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#A88554] hover:bg-[#E5C492] text-black text-xs sm:text-sm font-medium transition-all shadow-md active:scale-98 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Assessment</span>
            <span className="sm:hidden">New</span>
          </button>

          {user && (
            <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-[#222]">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-8 h-8 rounded-full border border-[#333] object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#1A1A1A] border border-[#333] flex items-center justify-center text-[#A88554] font-serif text-sm font-semibold">
                  {user.displayName ? user.displayName.slice(0, 1).toUpperCase() : <UserIcon className="w-4 h-4" />}
                </div>
              )}

              <div className="hidden lg:block text-left max-w-[130px]">
                <p className="text-xs font-semibold text-white truncate">
                  {user.displayName || 'Authenticated User'}
                </p>
                <p className="text-[10px] text-[#777] truncate">{user.email}</p>
              </div>

              <button
                id="sign-out-btn"
                onClick={() => signOut()}
                className="p-2 rounded-xl text-[#555] hover:text-white hover:bg-[#1A1A1A] transition-colors cursor-pointer"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
