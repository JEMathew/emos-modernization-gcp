import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle, ArrowRight, BrainCircuit, CheckCircle2, CirclePlay, ExternalLink,
  FileSearch, Gauge, Github, Library, Linkedin, Lock, Mail, Menu, Route,
  ShieldCheck, Sparkles, Target, Users, X,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from 'motion/react';
import { signInWithGoogle, getFriendlyAuthErrorMessage } from '../lib/firebase';
import { LEARNING_VIDEOS, getDriveViewUrl } from '../data/learningVideos';
import { SAMPLE_PORTFOLIO } from '../data/samplePortfolio';
import { EMOS_FACTS, LANDING_NAVIGATION, MODERNIZATION_LIFECYCLE } from '../config/productFacts';
import { evaluateEvidenceReadiness } from '../lib/readiness';
import { downloadSampleDecisionBrief } from '../lib/sampleDecisionBrief';
import { ThemeSelector } from './ThemeSelector';

interface LandingPageProps {
  onOpenWalkthrough: () => void;
  onNavigate?: (path: string) => void;
  initialAuthError?: string | null;
}

type LandingSection = 'home' | 'how-it-works' | 'why-emos' | 'scenario' | 'vision' | 'founder' | 'design-partner';

const EMOS_NAV = LANDING_NAVIGATION.emos as readonly { id: LandingSection; label: string }[];
const ABOUT_NAV = LANDING_NAVIGATION.about as readonly { id: LandingSection; label: string }[];

const LANDING_SECTION_IDS = new Set<LandingSection>([
  'home', 'how-it-works', 'why-emos', 'scenario', 'vision', 'founder', 'design-partner',
]);

function getInitialLandingSection(): LandingSection {
  if (typeof window === 'undefined') return 'home';
  const section = window.location.hash.replace('#', '') as LandingSection;
  return LANDING_SECTION_IDS.has(section) ? section : 'home';
}

const SIX_R_PATHS = [
  ['Retain', 'Keep Value in Place'],
  ['Retire', 'Remove Needless Cost'],
  ['Rehost', 'Move With Minimal Change'],
  ['Replatform', 'Improve the Foundation'],
  ['Refactor', 'Redesign for the Goal'],
  ['Repurchase', 'Replace With a Product'],
];

const EVIDENCE_DIMENSIONS = [
  ['Business', '3', 'Capability · Criticality · Modernization Drivers'],
  ['Technology', '4', 'Runtime · Database · Hosting · Lifecycle Risk'],
  ['Dependency', '2', 'Integrations · Interface Details'],
  ['Economics', '3', 'Infrastructure · Licensing · TCO Baseline'],
  ['Data & Risk', '3', 'Sensitivity · Volume · Compliance'],
  ['Target State', '3', 'Platform · Architecture · Downtime'],
];

const ROADMAP_PHASES = [
  {
    label: 'Demonstrated in Beta',
    status: 'LIVE',
    stages: MODERNIZATION_LIFECYCLE.slice(0, 5),
    detail: 'Connect intent to a portfolio, structure evidence, calculate completeness, explain alternatives and prevent unsupported decisions from passing the readiness gate.',
  },
  {
    label: 'Building Next',
    status: 'NEXT',
    stages: MODERNIZATION_LIFECYCLE.slice(5, 9),
    detail: 'Deepen approvals, auditability, prioritization, dependency-aware sequencing and target-state definition for enterprise programs.',
  },
  {
    label: 'Full Product Vision',
    status: 'VISION',
    stages: MODERNIZATION_LIFECYCLE.slice(9),
    detail: 'Govern delivery with partners, reconcile realized value with the approved case and use outcomes to improve the next decision.',
  },
];

const SCENARIO_WORKLOAD = SAMPLE_PORTFOLIO[0];
const SCENARIO_READINESS = evaluateEvidenceReadiness(SCENARIO_WORKLOAD.dna);

const FEATURED_VIDEOS = ['00', 'F08', 'F19']
  .map((sequence) => LEARNING_VIDEOS.find((video) => video.sequence === sequence))
  .filter((video): video is (typeof LEARNING_VIDEOS)[number] => Boolean(video));

const FEATURED_VIDEO_TITLES: Record<string, string> = {
  '00': 'EMOS Beta Introduction',
  F08: 'Preserve Cloud-Platform Neutrality',
  F19: 'Plan and Mobilize the Modernization Program',
};

const STATUS_STYLES: Record<string, string> = {
  LIVE: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  NEXT: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  VISION: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
};

function GoogleIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  );
}

function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function StageMarker({ number, label }: { number: string; label: string }) {
  return (
    <div className="mb-5 flex items-center gap-3 text-sm font-semibold text-[var(--emos-accent-text)]">
      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--emos-accent-border)] bg-[var(--emos-accent-subtle)] font-mono text-xs">{number}</span>
      <span>{label}</span>
    </div>
  );
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenWalkthrough, onNavigate, initialAuthError }) => {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(initialAuthError ?? null);
  const [activeSection, setActiveSection] = useState<LandingSection>(getInitialLandingSection);
  const [openMenu, setOpenMenu] = useState<'emos' | 'about' | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const journeyRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: journeyRef, offset: ['start start', 'end end'] });
  const progress = useSpring(scrollYProgress, { stiffness: 100, damping: 25, restDelta: 0.001 });

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      setAuthError(null);
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Sign in failed:', err);
      if (err?.code !== 'auth/popup-closed-by-user') setAuthError(getFriendlyAuthErrorMessage(err));
    } finally {
      setIsSigningIn(false);
    }
  };

  const navigate = (event: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (onNavigate) {
      event.preventDefault();
      onNavigate(path);
    }
  };

  useEffect(() => {
    const syncSectionFromHash = () => setActiveSection(getInitialLandingSection());
    window.addEventListener('hashchange', syncSectionFromHash);
    window.addEventListener('popstate', syncSectionFromHash);
    return () => {
      window.removeEventListener('hashchange', syncSectionFromHash);
      window.removeEventListener('popstate', syncSectionFromHash);
    };
  }, []);

  useEffect(() => {
    const closeMenus = (event: PointerEvent) => {
      if (!(event.target as Element).closest('[data-landing-menu]')) setOpenMenu(null);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenMenu(null);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('pointerdown', closeMenus);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeMenus);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  const selectSection = (event: React.MouseEvent<HTMLAnchorElement>, section: LandingSection) => {
    event.preventDefault();
    const nextUrl = section === 'home' ? window.location.pathname : `#${section}`;
    window.history.pushState({}, '', nextUrl);
    setActiveSection(section);
    setOpenMenu(null);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  const navLinkClass = (section: LandingSection) => [
    'whitespace-nowrap rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors',
    activeSection === section
      ? 'bg-[var(--emos-accent-subtle)] text-[var(--emos-accent-text)]'
      : 'text-[var(--emos-text-secondary)] hover:bg-[var(--emos-surface-hover)] hover:text-[var(--emos-text-primary)]',
  ].join(' ');

  const renderMenuGroup = (
    menu: 'emos' | 'about',
    label: string,
    items: readonly { id: LandingSection; label: string }[],
  ) => {
    const isActive = items.some(({ id }) => id === activeSection);
    return (
      <div className="relative" data-landing-menu>
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={openMenu === menu}
          onClick={() => setOpenMenu((current) => current === menu ? null : menu)}
          className={[
            'inline-flex min-h-9 items-center gap-1 rounded-lg px-3 text-xs font-semibold transition-colors',
            isActive ? 'bg-[var(--emos-accent-subtle)] text-[var(--emos-accent-text)]' : 'text-[var(--emos-text-secondary)] hover:bg-[var(--emos-surface-hover)]',
          ].join(' ')}
        >
          {label}
          <motion.span aria-hidden="true" animate={{ rotate: openMenu === menu ? 45 : 0 }} className="text-base font-normal">+</motion.span>
        </button>
        <AnimatePresence>
          {openMenu === menu && (
            <motion.div
              role="menu"
              initial={reduceMotion ? false : { opacity: 0, y: -8, scale: 0.98 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="absolute left-0 top-11 z-50 w-52 rounded-2xl border border-[var(--emos-border-strong)] bg-[var(--emos-surface)] p-2 shadow-2xl"
            >
              {items.map(({ id, label: itemLabel }) => <a key={id} role="menuitem" href={id === 'home' ? '/' : `#${id}`} onClick={(event) => selectSection(event, id)} aria-current={activeSection === id ? 'page' : undefined} className={`${navLinkClass(id)} block w-full`}>{itemLabel}</a>)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="emos-landing min-h-screen bg-[var(--emos-bg)] text-[var(--emos-text-primary)] selection:bg-[#A88554] selection:text-black font-sans transition-colors">
      <motion.div aria-hidden="true" className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-gradient-to-r from-[#A88554] via-[#E5C492] to-[#7DD3FC]" style={{ scaleX: progress }} />

      <header className="sticky top-0 z-40 border-b border-[var(--emos-border-subtle)] bg-[var(--emos-bg-secondary)]/88 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[88rem] items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="/" onClick={(event) => selectSection(event, 'home')} className="flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--emos-accent)]">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#A88554] to-[#E5C492] text-black shadow-md"><Sparkles className="h-4 w-4" /></span>
            <span className="leading-tight">
              <span className="block font-serif text-base font-bold tracking-wider">EMOS</span>
              <span className="hidden text-[10px] text-[var(--emos-text-muted)] sm:block">Enterprise Modernization Operating System</span>
            </span>
          </a>
          <nav className="hidden items-center gap-1 xl:flex" aria-label="Landing page navigation">
            {renderMenuGroup('emos', 'EMOS', EMOS_NAV)}
            <a id="landing-header-learn-link" href="/learn" onClick={(event) => navigate(event, '/learn')} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-[var(--emos-text-secondary)] transition-colors hover:bg-[var(--emos-surface-hover)] hover:text-[var(--emos-text-primary)]"><Library className="h-3.5 w-3.5" />Learning Center</a>
            <a href="/trust" onClick={(event) => navigate(event, '/trust')} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-[var(--emos-text-secondary)] transition-colors hover:bg-[var(--emos-surface-hover)] hover:text-[var(--emos-text-primary)]"><ShieldCheck className="h-3.5 w-3.5" />Trust</a>
            {renderMenuGroup('about', 'About', ABOUT_NAV)}
            <a href="#design-partner" onClick={(event) => selectSection(event, 'design-partner')} aria-current={activeSection === 'design-partner' ? 'page' : undefined} className="ml-1 whitespace-nowrap rounded-lg border border-[var(--emos-accent-border)] bg-[var(--emos-accent-subtle)] px-3 py-2 text-xs font-semibold text-[var(--emos-accent-text)]">Design Partner</a>
          </nav>
          <div className="flex items-center gap-2.5">
            <ThemeSelector />
            <button id="landing-header-signin-btn" onClick={handleSignIn} disabled={isSigningIn} className="hidden min-h-[34px] rounded-xl bg-[#A88554] px-3.5 text-xs font-semibold text-black hover:bg-[#BCA075] disabled:opacity-75 sm:block sm:text-sm">{isSigningIn ? 'Connecting…' : 'Sign In With Google'}</button>
            <button type="button" aria-label="Open Navigation Menu" aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen((current) => !current)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--emos-border-strong)] bg-[var(--emos-surface)] xl:hidden">{mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
          </div>
        </div>
        <AnimatePresence>
          {mobileMenuOpen && <motion.nav className="absolute inset-x-0 top-16 z-50 max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-[var(--emos-border-strong)] bg-[var(--emos-bg-secondary)] p-4 shadow-2xl xl:hidden" aria-label="Mobile Landing Page Navigation" initial={reduceMotion ? false : { opacity: 0, y: -10 }} animate={reduceMotion ? undefined : { opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
            <div className="mx-auto grid max-w-2xl gap-5 sm:grid-cols-2">
              <div><p className="px-3 text-xs font-semibold uppercase tracking-wider text-[var(--emos-text-muted)]">EMOS</p><div className="mt-2 grid gap-1">{EMOS_NAV.map(({ id, label }) => <a key={id} href={id === 'home' ? '/' : `#${id}`} onClick={(event) => selectSection(event, id)} className={`${navLinkClass(id)} block text-sm`}>{label}</a>)}</div></div>
              <div><p className="px-3 text-xs font-semibold uppercase tracking-wider text-[var(--emos-text-muted)]">Evaluate</p><div className="mt-2 grid gap-1"><a id="landing-mobile-learn-link" href="/learn" onClick={(event) => { setMobileMenuOpen(false); navigate(event, '/learn'); }} className="flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-[var(--emos-text-secondary)]"><Library className="h-4 w-4" />Learning Center</a><a href="/sandbox" onClick={(event) => { setMobileMenuOpen(false); navigate(event, '/sandbox'); }} className="flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-[var(--emos-text-secondary)]"><Sparkles className="h-4 w-4" />Public Sandbox</a><a href="/trust" onClick={(event) => { setMobileMenuOpen(false); navigate(event, '/trust'); }} className="flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-[var(--emos-text-secondary)]"><ShieldCheck className="h-4 w-4" />Trust and Evaluation</a></div></div>
              <div><p className="px-3 text-xs font-semibold uppercase tracking-wider text-[var(--emos-text-muted)]">About</p><div className="mt-2 grid gap-1">{ABOUT_NAV.map(({ id, label }) => <a key={id} href={`#${id}`} onClick={(event) => selectSection(event, id)} className={`${navLinkClass(id)} block text-sm`}>{label}</a>)}</div></div>
              <div className="grid content-end gap-2"><a href="#design-partner" onClick={(event) => selectSection(event, 'design-partner')} className="flex min-h-11 items-center justify-center rounded-xl border border-[var(--emos-accent-border)] bg-[var(--emos-accent-subtle)] px-4 text-sm font-semibold text-[var(--emos-accent-text)]">Become a Design Partner</a><button onClick={handleSignIn} className="min-h-11 rounded-xl bg-[#A88554] px-4 text-sm font-semibold text-black sm:hidden">Sign In With Google</button></div>
            </div>
          </motion.nav>}
        </AnimatePresence>
      </header>

      <main ref={journeyRef} id="top" className="relative overflow-hidden">
        <div className="pointer-events-none absolute bottom-0 left-[max(1.5rem,calc(50%-42rem))] top-24 z-10 hidden w-px bg-[var(--emos-border-subtle)] xl:block" aria-hidden="true">
          <motion.div className="h-full origin-top bg-gradient-to-b from-[#E5C492] via-[#7DD3FC] to-[#A88554]" style={{ scaleY: progress }} />
        </div>

        <AnimatePresence initial={false}>
          <motion.div
            key={activeSection}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
        {activeSection === 'home' && <section className="landing-scene landing-hero relative" aria-labelledby="landing-title">
          <div className="pointer-events-none absolute inset-0 landing-grid opacity-50" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-[88rem] gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-12 lg:px-8 lg:py-16">
            <Reveal>
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[var(--emos-accent-border)] bg-[var(--emos-accent-subtle)] px-3.5 py-1.5 text-xs font-semibold text-[var(--emos-accent-text)]">
                <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" /></span>
                Beta v1.0 Publicly Live · Vendor-Neutral Product Vision
              </div>
              <h1 id="landing-title" className="max-w-4xl font-serif text-4xl font-semibold leading-[1.04] tracking-tight sm:text-6xl lg:text-[3.65rem] xl:text-[4.1rem]">Your Legacy Estate is Blocking Business Initiatives You Have Already Committed to.</h1>
              <p className="mt-7 max-w-2xl text-base leading-8 text-[var(--emos-text-secondary)] sm:text-lg">EMOS helps leaders decide what to modernize and sequence the work—and is being built to measure whether it delivered the promised business outcome.</p>
              {authError && <div className="mt-6 flex max-w-xl items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-700 dark:text-rose-300"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{authError}</span></div>}
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a href="/sandbox" onClick={(event) => navigate(event, '/sandbox')} className="group inline-flex min-h-[50px] items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#A88554] to-[#E5C492] px-6 text-sm font-semibold text-black shadow-lg transition-all hover:-translate-y-0.5 sm:text-base"><Sparkles className="h-5 w-5" />Explore Without Sign-In<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></a>
                <button id="primary-google-signin-btn" onClick={handleSignIn} disabled={isSigningIn} className="group flex min-h-[50px] items-center justify-center gap-3 rounded-xl border border-[var(--emos-border-strong)] bg-[var(--emos-surface)] px-5 text-sm font-semibold transition-all hover:-translate-y-0.5 disabled:opacity-75"><GoogleIcon />{isSigningIn ? 'Authenticating…' : 'Use Your Portfolio'}</button>
                <button id="learn-more-walkthrough-btn" onClick={onOpenWalkthrough} className="min-h-[50px] rounded-xl px-4 text-sm font-semibold text-[var(--emos-text-secondary)] transition-all hover:bg-[var(--emos-surface-hover)] hover:text-[var(--emos-text-primary)]">Product Tour</button>
              </div>
              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[var(--emos-text-muted)]">
                <span className="inline-flex items-center gap-1.5"><CirclePlay className="h-3.5 w-3.5 text-[var(--emos-accent)]" />{EMOS_FACTS.learningLibraryLabel}</span>
                <span className="inline-flex items-center gap-1.5"><Github className="h-3.5 w-3.5 text-[var(--emos-accent)]" />Public Repository Under CI</span>
                <span className="inline-flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-[var(--emos-accent)]" />Google Sign In</span>
              </div>
            </Reveal>

            <Reveal delay={0.16} className="relative">
              <div className="landing-orbit absolute -inset-10 rounded-full border border-[var(--emos-accent-border)] opacity-40" aria-hidden="true" />
              <aside className="relative overflow-hidden rounded-[2rem] border border-[var(--emos-border-strong)] bg-[var(--emos-surface)]/95 p-3 shadow-2xl shadow-black/15 backdrop-blur" aria-label="Animated modernization evidence flow">
                <div className="rounded-[1.45rem] border border-[var(--emos-border-subtle)] bg-[var(--emos-bg-secondary)] p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div><p className="text-xs font-semibold text-[var(--emos-accent-text)]">Live Decision Brief</p><h2 className="mt-1 font-serif text-2xl font-semibold">Evidence Before Action</h2></div>
                    <motion.div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--emos-accent-border)] bg-[var(--emos-accent-subtle)] text-[var(--emos-accent)]" initial={reduceMotion ? false : { scale: 0.85, rotate: -8 }} animate={reduceMotion ? undefined : { scale: [0.85, 1.08, 1], rotate: [-8, 3, 0] }} transition={{ duration: 1.2, delay: 0.4 }}><BrainCircuit className="h-5 w-5" /></motion.div>
                  </div>
                  <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                    <div className="space-y-2">
                      {['Java 8', 'Oracle', '7 Integrations'].map((item, index) => <motion.div key={item} className="rounded-xl border border-rose-500/20 bg-rose-500/[0.06] px-3 py-2.5 text-xs font-medium" initial={reduceMotion ? false : { opacity: 0, x: -20 }} animate={reduceMotion ? undefined : { opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.45 + index * 0.16 }}><span className="mr-2 text-rose-500">●</span>{item}</motion.div>)}
                    </div>
                    <div className="relative hidden h-28 w-20 items-center justify-center sm:flex" aria-hidden="true"><div className="absolute h-px w-full bg-[var(--emos-border-strong)]" /><motion.div className="absolute h-2.5 w-2.5 rounded-full bg-[#E5C492] shadow-[0_0_18px_#E5C492]" initial={reduceMotion ? false : { x: -32, opacity: 0 }} animate={reduceMotion ? undefined : { x: [-32, 0, 32], opacity: [0, 1, 0.3] }} transition={{ duration: 1.6, delay: 0.9 }} /></div>
                    <motion.div className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.08] p-4" initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }} animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 1.2 }}>
                      <div className="flex items-end justify-between"><span className="text-xs text-[var(--emos-text-muted)]">Completeness</span><span className="font-mono text-3xl font-semibold text-amber-600 dark:text-amber-300">61%</span></div>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--emos-bg-tertiary)]"><motion.div className="h-full rounded-full bg-gradient-to-r from-[#A88554] to-amber-400" initial={{ width: reduceMotion ? '61%' : '0%' }} animate={{ width: '61%' }} transition={{ duration: 1.1, delay: 1.25 }} /></div>
                      <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold tracking-wider text-amber-700 dark:text-amber-300"><AlertCircle className="h-3 w-3" />NEEDS EVIDENCE</div>
                    </motion.div>
                  </div>
                  <div className="mt-5 border-t border-[var(--emos-border-subtle)] pt-4"><p className="text-[11px] text-[var(--emos-text-muted)]">Blocked By</p><div className="mt-2 flex flex-wrap gap-2">{['TCO Baseline', 'Target Architecture', 'Downtime Tolerance'].map((gap) => <span key={gap} className="rounded-full border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] px-2.5 py-1 text-[10px]">{gap}</span>)}</div></div>
                </div>
              </aside>
            </Reveal>
          </div>
        </section>}

        {activeSection === 'how-it-works' && <section id="how-it-works" className="landing-scene bg-[var(--emos-bg-secondary)]">
          <div className="mx-auto max-w-[88rem] px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <Reveal><StageMarker number="02" label="How It Works" /><h2 className="font-serif text-4xl font-semibold leading-tight sm:text-5xl">Evidence Before Action.</h2></Reveal>
              <Reveal delay={0.08}><p className="max-w-3xl text-base leading-8 text-[var(--emos-text-secondary)]">EMOS structures eighteen attributes across six dimensions, calculates completeness in code and names what is missing. It can explain a 6R recommendation, but model confidence cannot override the readiness gate.</p></Reveal>
            </div>
            <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                [FileSearch, 'Structure Evidence', 'Record verified facts and missing information.'],
                [Gauge, 'Calculate Completeness', 'Score readiness deterministically in code.'],
                [ShieldCheck, 'Apply the Gate', 'Stop thin evidence from becoming a decision.'],
                [Route, 'Explain the 6R', 'Show rationale, alternatives and risks.'],
              ].map(([Icon, title, text], index) => <Reveal key={String(title)} delay={index * 0.06}><motion.article whileHover={reduceMotion ? undefined : { y: -5 }} className="h-full rounded-2xl border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] p-5 transition-shadow hover:shadow-lg"><div className="flex items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--emos-border-subtle)] bg-[var(--emos-bg-tertiary)] text-[var(--emos-accent)]">{React.createElement(Icon as React.ElementType, { className: 'h-4 w-4' })}</span><div><p className="font-mono text-[10px] text-[var(--emos-text-muted)]">0{index + 1}</p><h3 className="font-serif text-lg font-semibold">{String(title)}</h3></div></div><p className="mt-3 text-sm leading-6 text-[var(--emos-text-secondary)]">{String(text)}</p></motion.article></Reveal>)}
            </div>
            <Reveal className="mt-7 rounded-2xl border border-[var(--emos-accent-border)] bg-[var(--emos-accent-subtle)] p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div><p className="text-xs font-semibold text-[var(--emos-accent-text)]">Six Dimensions · Eighteen Attributes</p><p className="mt-1 text-sm text-[var(--emos-text-secondary)]">Nothing Hand-Waved. Every gap remains visible.</p></div>
                <div className="flex max-w-4xl flex-wrap gap-2">{EVIDENCE_DIMENSIONS.map(([name, count, detail]) => <span key={name} title={detail} className="rounded-full border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] px-3 py-2 text-xs"><strong>{count}</strong> · {name}</span>)}</div>
              </div>
            </Reveal>
            </div>
        </section>}

        {activeSection === 'why-emos' && <section id="why-emos" className="landing-scene landing-neutral bg-[var(--emos-bg-secondary)]">
          <div className="mx-auto grid max-w-[88rem] gap-10 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8">
            <Reveal><StageMarker number="01" label="Why EMOS" /><h2 className="font-serif text-4xl font-semibold leading-tight sm:text-5xl">Optimized for Your Business Outcomes—Not a Provider&apos;s Cloud Consumption.</h2><p className="mt-5 text-base leading-8 text-[var(--emos-text-secondary)]">EMOS evaluates every modernization path—including Retain and Retire—against the same evidence, risks, costs and intended outcomes. Independent of any cloud or platform vendor, it recommends the best-fit future state without benefiting from increased platform consumption.</p><p className="mt-6 border-l-2 border-[var(--emos-accent)] pl-4 font-serif text-2xl font-semibold leading-tight">The Practitioner Can Defend the Decision—and the Buyer Can Defend the Investment.</p></Reveal>
            <Reveal delay={0.12} className="rounded-[2rem] border border-[var(--emos-border-strong)] bg-[var(--emos-surface)] p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[var(--emos-border-subtle)] pb-5"><div><p className="text-xs text-[var(--emos-text-muted)]">Decision Compass</p><h3 className="mt-1 font-serif text-2xl font-semibold">Every Path Earns Its Place.</h3></div><Target className="h-6 w-6 text-[var(--emos-accent)]" /></div>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">{SIX_R_PATHS.map(([label, detail], index) => <motion.div key={label} initial={reduceMotion ? false : { opacity: 0, scale: 0.85 }} whileInView={reduceMotion ? undefined : { opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.07 }} whileHover={reduceMotion ? undefined : { y: -4 }} className={['rounded-2xl border p-4', index < 2 ? 'border-[#A88554]/40 bg-[#A88554]/10' : 'border-[var(--emos-border-subtle)] bg-[var(--emos-bg-secondary)]'].join(' ')}><p className="text-sm font-semibold">{label}</p><p className="mt-1 text-[11px] leading-5 text-[var(--emos-text-muted)]">{detail}</p></motion.div>)}</div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">{['Equal Consideration', 'Evidence Over Ecosystem', 'Outcome Accountability'].map((item) => <div key={item} className="flex items-center gap-2 text-xs text-[var(--emos-text-secondary)]"><CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--emos-accent)]" />{item}</div>)}</div>
            </Reveal>
          </div>
        </section>}

        {activeSection === 'scenario' && <section id="scenario" className="landing-scene">
          <div className="mx-auto max-w-[88rem] px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
              <Reveal><StageMarker number="03" label="Wholly Synthetic Scenario" /><h2 className="font-serif text-4xl font-semibold leading-tight sm:text-5xl">The Initiative the Estate Is Blocking</h2><p className="mt-5 text-base leading-8 text-[var(--emos-text-secondary)]">Apex Aerospace Manufacturing has committed to unified customer analytics. A Java 8 and Oracle workload stands in the way—with seven integrations, no verified TCO baseline and no recorded downtime tolerance.</p><div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap"><a href="/sandbox" onClick={(event) => navigate(event, '/sandbox')} className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#A88554] px-5 text-sm font-semibold text-black">Open This Scenario <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></a><a href="/learn" onClick={(event) => navigate(event, '/learn')} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[var(--emos-border-strong)] bg-[var(--emos-surface)] px-5 text-sm font-semibold"><CirclePlay className="h-4 w-4" />Watch the Walkthrough</a><button onClick={() => downloadSampleDecisionBrief(SCENARIO_WORKLOAD)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-[var(--emos-text-secondary)] hover:bg-[var(--emos-surface-hover)]"><FileSearch className="h-4 w-4" />Download Decision Brief</button></div></Reveal>

              <Reveal delay={0.1} className="overflow-hidden rounded-[1.75rem] border border-[var(--emos-border-strong)] bg-[var(--emos-surface)] shadow-2xl">
                <div className="flex items-center justify-between border-b border-[var(--emos-border-subtle)] bg-[var(--emos-bg-secondary)] px-5 py-4"><div><p className="text-xs font-semibold text-[var(--emos-accent-text)]">EMOS Decision Gate</p><p className="mt-1 text-sm font-medium">Customer Analytics · Java 8 + Oracle</p></div><ShieldCheck className="h-5 w-5 text-[var(--emos-accent)]" /></div>
                <div className="p-5 sm:p-6">
                  <div className="grid grid-cols-3 gap-3">{[[`${SCENARIO_READINESS.completeness}%`, 'Current'], [`${EMOS_FACTS.readinessThreshold}%`, 'Minimum'], [`${SCENARIO_READINESS.knownCount}/${SCENARIO_READINESS.totalCount}`, 'Verified']].map(([value, label]) => <div key={label} className="rounded-xl border border-[var(--emos-border-subtle)] bg-[var(--emos-bg-secondary)] p-3 text-center"><p className="font-mono text-xl font-semibold sm:text-2xl">{value}</p><p className="mt-1 text-[11px] text-[var(--emos-text-muted)]">{label}</p></div>)}</div>
                  <div className="relative mt-6 h-2 rounded-full bg-[var(--emos-border-subtle)]"><motion.div className="h-full rounded-full bg-amber-500" initial={reduceMotion ? false : { width: 0 }} animate={{ width: `${SCENARIO_READINESS.completeness}%` }} transition={{ duration: 0.75 }} /><span className="absolute -top-2 h-6 w-px bg-[var(--emos-text-primary)]" style={{ left: `${EMOS_FACTS.readinessThreshold}%` }} aria-hidden="true" /></div>
                  <div className="mt-2 flex justify-between text-[11px] text-[var(--emos-text-muted)]"><span>Evidence Supplied</span><span>{EMOS_FACTS.readinessThreshold}% Readiness Threshold</span></div>
                  <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-mono text-sm font-bold text-amber-700 dark:text-amber-300">{SCENARIO_READINESS.decisionReadiness}</p><span className="text-xs text-[var(--emos-text-muted)]">Model Confidence Cannot Override This Gate</span></div><p className="mt-3 text-sm leading-6 text-[var(--emos-text-secondary)]"><strong className="text-[var(--emos-text-primary)]">Conclusion:</strong> No 6R disposition should be approved yet. Reaching {EMOS_FACTS.readinessThreshold}% is necessary but not sufficient; unresolved critical gaps still block human review.</p></div>
                  <div className="mt-5"><p className="text-xs font-semibold text-[var(--emos-text-primary)]">Evidence Required Next</p><div className="mt-3 flex flex-wrap gap-2">{SCENARIO_READINESS.criticalGaps.slice(0, 4).map((gap) => <span key={gap} className="rounded-full border border-rose-500/25 bg-rose-500/10 px-2.5 py-1.5 text-xs text-rose-700 dark:text-rose-300">{gap}</span>)}</div></div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>}

        {activeSection === 'home' && <section className="landing-scene landing-video border-t border-[var(--emos-border-subtle)] bg-[var(--emos-bg-secondary)]">
          <div className="mx-auto max-w-[88rem] px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <Reveal className="max-w-3xl"><StageMarker number="▶" label="See the Beta in Motion" /><h2 className="font-serif text-4xl font-semibold leading-tight sm:text-5xl">Watch the Evidence Become a Decision.</h2><p className="mt-4 max-w-2xl text-base leading-7 text-[var(--emos-text-secondary)]">The {EMOS_FACTS.learningLibraryLabel} library shows the real beta behavior—without requiring sign-in.</p></Reveal>
              <Reveal><a href="/learn" onClick={(event) => navigate(event, '/learn')} className="inline-flex min-h-[46px] items-center gap-2 rounded-xl border border-[var(--emos-border-strong)] bg-[var(--emos-surface)] px-4 text-sm font-semibold transition-all hover:-translate-y-0.5">Browse All Walkthroughs <ArrowRight className="h-4 w-4" /></a></Reveal>
            </div>
            <div className="-mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0 lg:pb-0">
              {FEATURED_VIDEOS.map((video, index) => {
                const href = getDriveViewUrl(video.driveFileId) || '/learn';
                return <Reveal key={video.sequence} delay={index * 0.08} className="w-[82vw] shrink-0 snap-start sm:w-[22rem] lg:w-auto"><motion.a href={href} target={href === '/learn' ? undefined : '_blank'} rel={href === '/learn' ? undefined : 'noreferrer'} whileHover={reduceMotion ? undefined : { y: -6 }} className="group grid h-full overflow-hidden rounded-2xl border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] shadow-sm hover:shadow-xl sm:grid-rows-[auto_1fr]"><div className="relative aspect-[16/8] overflow-hidden bg-[var(--emos-bg-tertiary)]"><img src={video.thumbnailUrl} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]" /><div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" /><span className="absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-black shadow-xl"><CirclePlay className="h-4 w-4" /></span><span className="absolute bottom-3 right-3 rounded-full bg-black/70 px-2 py-1 font-mono text-[10px] text-white">{video.duration || video.sequence}</span></div><div className="p-4 sm:p-5"><p className="text-xs font-semibold text-[var(--emos-accent-text)]">{video.category}</p><h3 className="mt-1 font-serif text-lg font-semibold leading-snug">{FEATURED_VIDEO_TITLES[video.sequence] || video.title}</h3><span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold">Watch Video <ExternalLink className="h-3.5 w-3.5" /></span></div></motion.a></Reveal>;
              })}
            </div>
          </div>
        </section>}

        {activeSection === 'vision' && <section id="vision" className="landing-scene">
          <div className="mx-auto max-w-[88rem] px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <Reveal><StageMarker number="05" label="Company and Product Vision" /><h2 className="font-serif text-4xl font-semibold leading-tight sm:text-5xl">A Vendor-Neutral Operating System for Enterprise Modernization</h2></Reveal>
              <Reveal delay={0.08}><p className="text-base leading-8 text-[var(--emos-text-secondary)]">EMOS connects committed business initiatives to the legacy systems blocking them—and is being built to govern the full lifecycle continuously, rather than as disconnected projects.</p></Reveal>
            </div>
            <div className="mt-9 grid gap-4 lg:grid-cols-3">
              {ROADMAP_PHASES.map(({ label, status, stages, detail }, index) => <Reveal key={label} delay={index * 0.08}><motion.article whileHover={reduceMotion ? undefined : { y: -5 }} className="h-full rounded-2xl border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] p-5 sm:p-6"><div className="flex items-center justify-between gap-3"><h3 className="font-serif text-xl font-semibold">{label}</h3><span className={['rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold tracking-wider', STATUS_STYLES[status]].join(' ')}>{status}</span></div><div className="mt-5 flex flex-wrap gap-2">{stages.map((stage) => <span key={stage} className="rounded-full border border-[var(--emos-border-subtle)] bg-[var(--emos-bg-secondary)] px-2.5 py-1.5 text-xs">{stage}</span>)}</div><p className="mt-5 text-sm leading-6 text-[var(--emos-text-secondary)]">{detail}</p></motion.article></Reveal>)}
            </div>
            <Reveal className="mt-5"><details className="group rounded-2xl border border-[var(--emos-border-strong)] bg-[var(--emos-bg-secondary)] p-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold"><span>Honest Scope · What EMOS Does Not Do Yet</span><span className="text-[var(--emos-accent)] transition-transform group-open:rotate-45">+</span></summary><div className="mt-4 grid gap-3 border-t border-[var(--emos-border-subtle)] pt-4 text-sm text-[var(--emos-text-secondary)] sm:grid-cols-2">{['It does not automatically discover your entire estate.', 'It does not execute migrations.', 'It does not yet reconcile planned outcomes with realized value.', 'It has no customers yet and is recruiting its first design partners.'].map((item) => <div key={item} className="flex items-start gap-2"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--emos-accent)]" />{item}</div>)}</div></details></Reveal>
          </div>
        </section>}

        {activeSection === 'founder' && <section id="founder" className="landing-scene landing-founder bg-[var(--emos-bg-secondary)]">
          <div className="mx-auto grid max-w-[88rem] gap-8 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[0.72fr_1.28fr] lg:items-center lg:px-8">
            <Reveal><StageMarker number="06" label="Founder" /><div className="rounded-3xl border border-[var(--emos-border-strong)] bg-[var(--emos-surface)] p-6 shadow-xl"><div className="flex items-center justify-between"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#876637] to-[#E5C492] font-serif text-2xl font-semibold text-black">JM</div><a href="https://www.linkedin.com/in/jincenmathew/" target="_blank" rel="noreferrer" aria-label="Connect With Jincen E Mathew on LinkedIn" title="Connect With Jincen E Mathew on LinkedIn" className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#0A66C2]/30 bg-[#0A66C2]/10 text-[#0A66C2] transition-all hover:-translate-y-0.5 hover:bg-[#0A66C2] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A66C2]"><Linkedin className="h-5 w-5" aria-hidden="true" /></a></div><h2 className="mt-5 font-serif text-3xl font-semibold">Jincen E Mathew</h2><p className="mt-1 text-sm leading-6 text-[var(--emos-text-muted)]">Founder · Bengaluru, India · {EMOS_FACTS.founderExperience} Years Building, Shipping, Launching and Taking Enterprise Products to Market</p><dl className="mt-5 grid gap-4 border-t border-[var(--emos-border-subtle)] pt-5 sm:grid-cols-2 lg:grid-cols-1">{[
              ['Oracle', '5 Years Leading GTM for Oracle Technology Stack and Engineered Systems'],
              ['Tally', '3+ Years Building, Shipping and Launching Products into New Markets'],
              ['Boeing', '6 Years Building a 0→1 Modernization-Governance Product Across 5,000+ Applications · Modern Data Platforms: Cloud Data Warehouse on GCP and Data Lakehouse on AWS'],
              ['Autodesk', '1+ Year Leading Data Products Enabling Product-Led Growth and Go-to-Market Initiatives'],
              ['Communities', 'Established the First Product Management Community of Practice at Boeing India and Tally'],
            ].map(([label, value]) => <div key={label}><dt className="text-sm font-semibold text-[var(--emos-accent-text)]">{label}</dt><dd className="mt-1 text-sm leading-6 text-[var(--emos-text-secondary)]">{value}</dd></div>)}</dl></div></Reveal>
            <Reveal delay={0.1}><h2 className="font-serif text-4xl font-semibold leading-tight sm:text-5xl">Built by Someone Who Had This Problem</h2><div className="mt-5 space-y-4 text-base leading-8 text-[var(--emos-text-secondary)]"><p>Across {EMOS_FACTS.founderExperience} years at Oracle, Tally, Boeing and Autodesk, I have built, shipped and launched enterprise products—and led the go-to-market work required to take them into established and new markets. At Boeing, I spent six years building a product that governed modernization across {EMOS_FACTS.governedApplications} applications and led two modern data-platform initiatives: a Cloud Data Warehouse on GCP and a Data Lakehouse on AWS.</p><p>The constraint was never migration tooling. It was proving that the evidence justified committing millions of dollars and years to changing a system.</p><p className="font-serif text-3xl font-semibold leading-tight text-[var(--emos-text-primary)]">EMOS Is the Product I Needed and Could Not Buy.</p><p className="text-sm leading-7">I am building it solo. Design partners work directly with the person writing the product and determining what gets built next.</p></div></Reveal>
          </div>
        </section>}

        {activeSection === 'design-partner' && <section id="design-partner" className="landing-scene landing-partner relative">
          <div className="pointer-events-none absolute inset-0 landing-grid opacity-30" aria-hidden="true" />
          <div className="relative mx-auto max-w-[88rem] px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
            <Reveal className="overflow-hidden rounded-[2rem] border border-[var(--emos-accent-border)] bg-[var(--emos-surface)] shadow-2xl">
              <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
                <div className="p-7 sm:p-9 lg:p-10"><StageMarker number="07" label="Design Partner Program" /><h2 className="font-serif text-4xl font-semibold leading-tight sm:text-5xl">Become a Founding Design Partner</h2><p className="mt-5 max-w-2xl text-base leading-8 text-[var(--emos-text-secondary)]">Bring a sanitized, representative portfolio—or model a stuck initiative with synthetic data. In one working session, EMOS produces an evidence-gap assessment and explainable recommendation; you tell me where it fails a real architecture review.</p><div className="mt-7 flex flex-col gap-3 sm:flex-row"><a href="https://mail.google.com/mail/?view=cm&fs=1&to=jeasom@gmail.com&su=EMOS%20Design%20Partner%20Interest&body=Hi%20Jincen%2C%0A%0AI%27m%20interested%20in%20becoming%20an%20EMOS%20design%20partner.%0A%0AName%3A%0AOrganization%3A%0ARole%3A%0APortfolio%20size%3A%0AModernization%20initiative%3A%0ACurrent%20decision%20process%3A%0AIntended%20business%20outcome%3A%0ABuyer%20or%20budget%20owner%3A%0AData%20or%20security%20restrictions%3A" target="_blank" rel="noreferrer" aria-label="Confirm Design Partner Interest by Email" className="group inline-flex min-h-[50px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#A88554] to-[#E5C492] px-6 text-sm font-semibold text-black shadow-lg transition-all hover:-translate-y-0.5"><Mail className="h-4 w-4" />Confirm Interest by Email <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></a><a href="/sandbox" onClick={(event) => navigate(event, '/sandbox')} className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-xl border border-[var(--emos-border-strong)] bg-[var(--emos-bg-secondary)] px-5 text-sm font-semibold"><Sparkles className="h-4 w-4" />Evaluate Without Sign-In</a></div><p className="mt-4 text-sm leading-6 text-[var(--emos-text-muted)]">There is no charge to explore the public beta or sandbox. Commercial pricing has not been set. Prefer another email client? Write to <a className="font-semibold text-[var(--emos-accent-text)] underline underline-offset-4" href="mailto:jeasom@gmail.com?subject=EMOS%20Design%20Partner%20Interest">jeasom@gmail.com</a>.</p></div>
                <div className="border-t border-[var(--emos-border-subtle)] bg-[var(--emos-bg-secondary)] p-7 sm:p-10 lg:border-l lg:border-t-0 lg:p-12"><div className="flex items-center gap-3"><Users className="h-6 w-6 text-[var(--emos-accent)]" /><p className="font-serif text-2xl font-semibold">I Am Looking for Three.</p></div><ul className="mt-8 space-y-4">{['A Tailored Evidence-Gap and Modernization Assessment', 'Direct Influence Over the Product Roadmap', 'Early Access to New Capabilities', 'Founding-Customer Terms When EMOS Becomes Commercial'].map((benefit) => <li key={benefit} className="flex items-start gap-3 text-sm leading-6 text-[var(--emos-text-secondary)]"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--emos-accent)]" />{benefit}</li>)}</ul><div className="mt-8 rounded-2xl border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] p-5"><p className="text-xs font-semibold text-[var(--emos-accent-text)]">The Evidence I Need in Return</p><p className="mt-2 text-sm leading-6 text-[var(--emos-text-secondary)]">Where the recommendation is wrong, what evidence it missed and whether the output would support a real buying decision.</p></div></div>
              </div>
            </Reveal>
          </div>
        </section>}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="border-t border-[var(--emos-border-subtle)] bg-[var(--emos-bg-secondary)] px-4 py-8 text-xs text-[var(--emos-text-muted)] sm:px-6">
        <div className="mx-auto flex max-w-[88rem] flex-col items-center justify-between gap-5 sm:flex-row">
          <div className="flex items-center gap-2 text-center sm:text-left"><span className="font-serif font-semibold text-[var(--emos-text-primary)]">EMOS</span><span>·</span><span>Enterprise Modernization Operating System</span><span className="hidden md:inline">· Beta v1.0</span></div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <a id="footer-learn-link" href="/learn" onClick={(event) => navigate(event, '/learn')} className="font-medium text-[var(--emos-text-secondary)] hover:underline">Learning Center</a>
            <a href="/sandbox" onClick={(event) => navigate(event, '/sandbox')} className="font-medium text-[var(--emos-text-secondary)] hover:underline">Public Sandbox</a>
            <a href="/trust" onClick={(event) => navigate(event, '/trust')} className="font-medium text-[var(--emos-text-secondary)] hover:underline">Trust</a>
            <a id="footer-privacy-link" href="/privacy" onClick={(event) => navigate(event, '/privacy')} className="font-medium text-[var(--emos-text-secondary)] hover:underline">Privacy Policy</a>
            <a id="footer-terms-link" href="/terms" onClick={(event) => navigate(event, '/terms')} className="font-medium text-[var(--emos-text-secondary)] hover:underline">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
