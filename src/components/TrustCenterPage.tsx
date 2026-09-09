import React from 'react';
import {
  ArrowLeft, BrainCircuit, Database, ExternalLink, FileCode2, KeyRound,
  LockKeyhole, Scale, ShieldCheck,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { ThemeSelector } from './ThemeSelector';
import { EMOS_FACTS } from '../config/productFacts';

interface TrustCenterPageProps {
  onNavigate: (path: string) => void;
}

const TRUST_AREAS = [
  {
    icon: KeyRound,
    title: 'Identity and Access',
    text: 'EMOS uses Google Sign In through Firebase Authentication. The application does not collect or store user passwords.',
    evidence: 'Authenticated requests are verified by the server before protected AI endpoints can be used.',
  },
  {
    icon: LockKeyhole,
    title: 'Owner-Bound Storage',
    text: 'Imported portfolios, assessments and program context are stored under the authenticated user’s Firestore path.',
    evidence: 'Firestore rules check that the authenticated user ID matches the requested document path.',
  },
  {
    icon: BrainCircuit,
    title: 'Deterministic Before Generative',
    text: 'Deterministic application rules—not model prose—calculate evidence completeness and enforce the readiness gate.',
    evidence: 'Model output is reconciled against the canonical 6R taxonomy, structured evidence and calculated completeness.',
  },
  {
    icon: Database,
    title: 'What the Model Sees',
    text: 'Authenticated assessment requests may send sanitized workload evidence to the configured Gemini service through the EMOS server.',
    evidence: 'The public sandbox does not upload data, persist records or call an AI provider.',
  },
  {
    icon: Scale,
    title: 'Vendor-Neutral Decision Boundary',
    text: 'Retain and Retire are evaluated alongside migration paths. A cloud destination is not treated as established unless supporting evidence exists.',
    evidence: 'Evaluation-only expected outcomes from sample files are isolated from the assessment prompt.',
  },
  {
    icon: FileCode2,
    title: 'Inspectable Beta',
    text: `The source repository, automated tests and all ${EMOS_FACTS.walkthroughCount} public learning videos are available for evaluation.`,
    evidence: 'Claims should be assessed against the shipped Beta v1.0 behavior and documented limitations.',
  },
] as const;

export const TrustCenterPage: React.FC<TrustCenterPageProps> = ({ onNavigate }) => {
  const reduceMotion = useReducedMotion();
  return (
    <div className="emos-landing min-h-screen bg-[var(--emos-bg)] text-[var(--emos-text-primary)]">
      <header className="sticky top-0 z-30 border-b border-[var(--emos-border-subtle)] bg-[var(--emos-bg-secondary)]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[88rem] items-center justify-between px-4 sm:px-6 lg:px-8">
          <button onClick={() => onNavigate('/')} className="inline-flex items-center gap-2 text-sm font-semibold"><ArrowLeft className="h-4 w-4" />EMOS Home</button>
          <div className="flex items-center gap-2"><ThemeSelector /><a href="https://github.com/JEMathew/emos-modernization-gcp" target="_blank" rel="noreferrer" className="hidden min-h-10 items-center gap-2 rounded-xl border border-[var(--emos-border-strong)] px-3 text-sm font-semibold sm:inline-flex">Public Repository <ExternalLink className="h-4 w-4" /></a></div>
        </div>
      </header>

      <main>
        <section className="landing-video border-b border-[var(--emos-border-subtle)]">
          <motion.div className="mx-auto max-w-[88rem] px-4 py-14 sm:px-6 lg:px-8 lg:py-20" initial={reduceMotion ? false : { opacity: 0, y: 20 }} animate={reduceMotion ? undefined : { opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--emos-accent-border)] bg-[var(--emos-accent-subtle)] px-3 py-1.5 text-xs font-semibold text-[var(--emos-accent-text)]"><ShieldCheck className="h-4 w-4" />Trust and Evaluation</div>
            <h1 className="mt-5 max-w-4xl font-serif text-4xl font-semibold leading-tight sm:text-6xl">Evaluate the Evidence Behind EMOS.</h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-[var(--emos-text-secondary)] sm:text-lg">A concise view of how the public beta handles identity, portfolio evidence, AI-provider boundaries and decision ownership—plus where the product is not production-ready yet.</p>
          </motion.div>
        </section>

        <section className="mx-auto max-w-[88rem] px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {TRUST_AREAS.map(({ icon: Icon, title, text, evidence }, index) => <motion.article key={title} className="rounded-2xl border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] p-5" initial={reduceMotion ? false : { opacity: 0, y: 18 }} whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }}><Icon className="h-5 w-5 text-[var(--emos-accent)]" /><h2 className="mt-4 font-serif text-2xl font-semibold">{title}</h2><p className="mt-3 text-sm leading-6 text-[var(--emos-text-secondary)]">{text}</p><p className="mt-4 border-t border-[var(--emos-border-subtle)] pt-4 text-xs leading-5 text-[var(--emos-text-muted)]"><strong className="text-[var(--emos-text-primary)]">Evidence:</strong> {evidence}</p></motion.article>)}
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <section className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-6"><h2 className="font-serif text-2xl font-semibold">Current Beta Boundary</h2><ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--emos-text-secondary)]"><li>Use synthetic or sanitized representative data only.</li><li>EMOS provides decision support, not architectural certification or migration authorization.</li><li>It does not provision infrastructure, staff delivery teams or execute migrations.</li><li>No external security certification is claimed for Beta v1.0.</li></ul></section>
            <section className="rounded-2xl border border-[var(--emos-border-strong)] bg-[var(--emos-surface)] p-6"><h2 className="font-serif text-2xl font-semibold">Evaluation and Pricing</h2><p className="mt-4 text-sm leading-6 text-[var(--emos-text-secondary)]">There is no charge to explore the public beta or sandbox. Commercial pricing has not been set. Founding design-partner scope and terms are discussed directly so the evaluation can match the portfolio, evidence and governance context.</p><div className="mt-5 flex flex-wrap gap-3"><button onClick={() => onNavigate('/sandbox')} className="min-h-11 rounded-xl bg-[#A88554] px-4 text-sm font-semibold text-black">Open Public Sandbox</button><a href="mailto:jeasom@gmail.com?subject=EMOS%20Trust%20or%20Design%20Partner%20Question" className="inline-flex min-h-11 items-center rounded-xl border border-[var(--emos-border-strong)] px-4 text-sm font-semibold">Ask a Question</a></div></section>
          </div>

          <div className="mt-8 flex flex-wrap gap-4 text-sm"><button onClick={() => onNavigate('/privacy')} className="font-semibold text-[var(--emos-accent-text)] underline underline-offset-4">Privacy Policy</button><button onClick={() => onNavigate('/terms')} className="font-semibold text-[var(--emos-accent-text)] underline underline-offset-4">Terms of Service</button><a href="https://github.com/JEMathew/emos-modernization-gcp" target="_blank" rel="noreferrer" className="font-semibold text-[var(--emos-accent-text)] underline underline-offset-4">Review the Source and Tests</a></div>
        </section>
      </main>
    </div>
  );
};
