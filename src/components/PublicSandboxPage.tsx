import React, { useMemo, useState } from 'react';
import {
  AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Download, FileCheck2,
  ListChecks, LockKeyhole, Printer, Scale, ShieldCheck, Sparkles,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { SAMPLE_PORTFOLIO } from '../data/samplePortfolio';
import { EMOS_FACTS } from '../config/productFacts';
import { applySyntheticEvidenceStage, evaluateEvidenceReadiness, READINESS_DEMO_STAGES } from '../lib/readiness';
import { buildSampleDecisionBrief, downloadEvidenceActionPlan, downloadSampleDecisionBrief } from '../lib/sampleDecisionBrief';
import { getFriendlyAuthErrorMessage, POST_AUTH_ROUTE_KEY, signInWithGoogle } from '../lib/firebase';
import { ThemeSelector } from './ThemeSelector';

interface PublicSandboxPageProps {
  onNavigate: (path: string) => void;
  onSignIn?: () => Promise<unknown | null>;
}

const STEPS = ['Business Context', 'Evidence', '6R Alternatives', 'Decision Gate'] as const;

const ALTERNATIVES = [
  ['Retain', 'Does not resolve the committed analytics and scalability outcome.'],
  ['Retire', 'Not supportable while a high-criticality capability still depends on the workload.'],
  ['Rehost', 'Could move infrastructure while preserving Oracle cost and architectural constraints.'],
  ['Replatform', 'Plausible, but target-platform, TCO and cutover evidence remain incomplete.'],
  ['Refactor', 'Plausible for scalability, but dependency and downtime constraints are unresolved.'],
  ['Repurchase', 'No verified commercial-product fit or replacement evidence has been supplied.'],
] as const;

export const PublicSandboxPage: React.FC<PublicSandboxPageProps> = ({ onNavigate, onSignIn }) => {
  const [step, setStep] = useState(0);
  const [evidenceStage, setEvidenceStage] = useState(0);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();
  const workload = SAMPLE_PORTFOLIO[0];
  const demoDna = useMemo(() => applySyntheticEvidenceStage(workload.dna, evidenceStage), [workload, evidenceStage]);
  const readiness = useMemo(() => evaluateEvidenceReadiness(demoDna), [demoDna]);
  const demoWorkload = useMemo(() => ({ ...workload, dna: demoDna, evidenceCompleteness: readiness.completeness }), [workload, demoDna, readiness.completeness]);
  const dimensions = useMemo(() => [
    ['Business', demoDna.business],
    ['Technology', demoDna.technology],
    ['Dependencies', demoDna.dependency],
    ['Economics', demoDna.economics],
    ['Data & Risk', demoDna.dataAndRisk],
    ['Target State', demoDna.targetState],
  ] as const, [demoDna]);

  const handleSignIn = async () => {
    setAuthError(null);
    setIsSigningIn(true);
    window.sessionStorage.setItem(POST_AUTH_ROUTE_KEY, '/');
    try {
      const user = await (onSignIn ?? signInWithGoogle)();
      if (user) {
        window.sessionStorage.removeItem(POST_AUTH_ROUTE_KEY);
        onNavigate('/');
      }
    } catch (error) {
      window.sessionStorage.removeItem(POST_AUTH_ROUTE_KEY);
      setAuthError(getFriendlyAuthErrorMessage(error));
      setIsSigningIn(false);
    }
  };

  const openPrintableBrief = () => {
    const url = URL.createObjectURL(new Blob([buildSampleDecisionBrief(demoWorkload)], { type: 'text/html;charset=utf-8' }));
    window.open(url, '_blank', 'noopener,noreferrer');
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  return (
    <div className="emos-landing min-h-screen bg-[var(--emos-bg)] text-[var(--emos-text-primary)]">
      <header className="sticky top-0 z-40 border-b border-[var(--emos-border-subtle)] bg-[var(--emos-bg-secondary)]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[88rem] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <button onClick={() => onNavigate('/')} className="inline-flex items-center gap-2 rounded-lg text-sm font-semibold"><ArrowLeft className="h-4 w-4" />EMOS Home</button>
          <div className="hidden items-center gap-2 text-xs text-[var(--emos-text-muted)] sm:flex"><LockKeyhole className="h-4 w-4 text-emerald-500" />Read-Only · Synthetic Data · No Sign-In</div>
          <div className="flex items-center gap-2"><ThemeSelector /><button onClick={handleSignIn} disabled={isSigningIn} className="rounded-xl bg-[#A88554] px-4 py-2 text-sm font-semibold text-black disabled:cursor-wait disabled:opacity-70">{isSigningIn ? 'Connecting…' : 'Continue With Google'}</button></div>
        </div>
      </header>

      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 landing-grid opacity-40" />
        <section className="relative mx-auto max-w-[88rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="grid gap-7 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300"><Sparkles className="h-3.5 w-3.5" />Public Evaluation Sandbox</div>
              <h1 className="mt-5 font-serif text-4xl font-semibold leading-tight sm:text-5xl">See EMOS Refuse False Certainty.</h1>
              <p className="mt-5 text-base leading-7 text-[var(--emos-text-secondary)]">Explore the Apex Aerospace scenario using the same deterministic evidence-readiness logic as the beta. Nothing is uploaded, stored or sent to an AI provider.</p>

              <div className="mt-7 rounded-2xl border border-[var(--emos-border-strong)] bg-[var(--emos-surface)] p-5">
                <p className="text-xs font-semibold text-[var(--emos-accent-text)]">Committed Business Initiative</p>
                <h2 className="mt-2 font-serif text-2xl font-semibold">Unified Customer Analytics</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--emos-text-secondary)]">Blocked by Customer Analytics: Java 8 + Oracle, on-premises, high criticality, seven downstream integrations.</p>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {[[`${readiness.completeness}%`, 'Evidence'], [`${readiness.knownCount}/${readiness.totalCount}`, 'Verified'], [`${EMOS_FACTS.readinessThreshold}%`, 'Minimum']].map(([value, label]) => <div key={label} className="rounded-xl border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] p-3 text-center"><p className="font-mono text-xl font-semibold">{value}</p><p className="mt-1 text-[11px] text-[var(--emos-text-muted)]">{label}</p></div>)}
              </div>

              <p className="mt-3 text-xs leading-5 text-[var(--emos-text-muted)]"><strong className="text-[var(--emos-text-primary)]">Necessary, Not Sufficient:</strong> {EMOS_FACTS.readinessThreshold}% is the minimum evidence threshold. Every critical evidence gap must also be closed before a record becomes ready for human review.</p>

              <div className="mt-5 flex flex-wrap gap-2">
                <button onClick={() => downloadSampleDecisionBrief(demoWorkload)} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#A88554] px-4 text-sm font-semibold text-black"><Download className="h-4 w-4" />Download Brief</button>
                <button onClick={openPrintableBrief} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--emos-border-strong)] bg-[var(--emos-surface)] px-4 text-sm font-semibold"><Printer className="h-4 w-4" />Print / Save as PDF</button>
                <button onClick={() => downloadEvidenceActionPlan(demoWorkload)} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--emos-border-strong)] bg-[var(--emos-surface)] px-4 text-sm font-semibold"><ListChecks className="h-4 w-4" />Download Evidence Plan</button>
              </div>
              <p className="mt-3 text-xs leading-5 text-[var(--emos-text-muted)]">The downloadable HTML brief is portable and print-ready. Use Print / Save as PDF for a governance-ready PDF copy.</p>
              {authError && <div role="alert" className="mt-4 rounded-xl border border-rose-500/25 bg-rose-500/10 p-3 text-sm text-rose-700 dark:text-rose-200">{authError}</div>}
            </div>

            <div className="overflow-hidden rounded-[1.75rem] border border-[var(--emos-border-strong)] bg-[var(--emos-surface)] shadow-2xl">
              <div className="border-b border-[var(--emos-border-subtle)] bg-[var(--emos-bg-secondary)] p-3 sm:p-4">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="tablist" aria-label="Sandbox decision journey">
                  {STEPS.map((label, index) => <button key={label} role="tab" aria-selected={step === index} onClick={() => setStep(index)} className={`min-h-10 rounded-xl px-2 text-xs font-semibold transition ${step === index ? 'bg-[var(--emos-accent-subtle)] text-[var(--emos-accent-text)] ring-1 ring-[var(--emos-accent-border)]' : 'text-[var(--emos-text-secondary)] hover:bg-[var(--emos-surface-hover)]'}`}><span className="mr-1 font-mono text-[10px]">0{index + 1}</span>{label}</button>)}
                </div>
              </div>

              <div className="min-h-[33rem] p-5 sm:p-7">
                <AnimatePresence initial={false}>
                  <motion.div key={step} initial={reduceMotion ? false : { opacity: 0, x: 18 }} animate={reduceMotion ? undefined : { opacity: 1, x: 0 }} exit={reduceMotion ? undefined : { opacity: 0, x: -12 }} transition={{ duration: 0.22 }}>
                    {step === 0 && <section><p className="text-xs font-semibold text-[var(--emos-accent-text)]">Why Now</p><h2 className="mt-2 font-serif text-3xl font-semibold">The Estate Cannot Support the Committed Initiative</h2><div className="mt-6 space-y-3">{[['Outcome', 'Faster, unified customer analytics'], ['Constraint', 'Legacy Java 8 and Oracle estate'], ['Exposure', 'High cost, scale limits and seven integrations'], ['Decision', 'Choose a future state without assuming a cloud destination']].map(([label, value]) => <div key={label} className="grid gap-1 rounded-xl border border-[var(--emos-border-subtle)] bg-[var(--emos-bg-secondary)] p-4 sm:grid-cols-[7rem_1fr]"><strong className="text-sm">{label}</strong><span className="text-sm text-[var(--emos-text-secondary)]">{value}</span></div>)}</div></section>}

                    {step === 1 && <section><p className="text-xs font-semibold text-[var(--emos-accent-text)]">Controlled Synthetic Evidence Exercise</p><h2 className="mt-2 font-serif text-3xl font-semibold">Watch the Gate Change as Evidence Improves</h2><p className="mt-3 text-sm leading-6 text-[var(--emos-text-secondary)]">Choose a stage to add predefined synthetic evidence. The calculation updates in code; no AI provider is called.</p><div className="mt-5 grid gap-2 sm:grid-cols-2" aria-label="Synthetic evidence stages">{READINESS_DEMO_STAGES.map((stage, index) => <button key={stage.id} onClick={() => setEvidenceStage(index)} aria-pressed={evidenceStage === index} className={`rounded-xl border p-3 text-left transition ${evidenceStage === index ? 'border-[var(--emos-accent-border)] bg-[var(--emos-accent-subtle)]' : 'border-[var(--emos-border-subtle)] bg-[var(--emos-bg-secondary)] hover:border-[var(--emos-border-strong)]'}`}><span className="font-mono text-[10px] text-[var(--emos-accent-text)]">STAGE 0{index + 1}</span><strong className="mt-1 block text-sm">{stage.label}</strong><span className="mt-1 block text-xs leading-5 text-[var(--emos-text-muted)]">{stage.summary}</span></button>)}</div><div className="mt-5 grid gap-3 sm:grid-cols-2">{dimensions.map(([label, fields]) => { const known = fields.filter((field) => field.status === 'known').length; return <div key={label} className="rounded-xl border border-[var(--emos-border-subtle)] bg-[var(--emos-bg-secondary)] p-4"><div className="flex items-center justify-between"><strong className="text-sm">{label}</strong><span className="font-mono text-xs text-[var(--emos-accent-text)]">{known}/{fields.length}</span></div><div className="mt-3 h-1.5 rounded-full bg-[var(--emos-border-subtle)]"><motion.div className="h-full rounded-full bg-[#A88554]" initial={reduceMotion ? false : { width: 0 }} animate={{ width: `${(known / fields.length) * 100}%` }} transition={{ duration: 0.55 }} /></div></div>; })}</div><div className={`mt-5 rounded-xl border p-4 text-sm ${readiness.criticalGaps.length === 0 ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200' : 'border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-200'}`}><strong>{readiness.criticalGaps.length === 0 ? 'Critical gaps closed.' : 'Critical gaps:'}</strong>{readiness.criticalGaps.length > 0 && ` ${readiness.criticalGaps.join(' · ')}`}</div></section>}

                    {step === 2 && <section><p className="text-xs font-semibold text-[var(--emos-accent-text)]">Why Not the Alternatives?</p><h2 className="mt-2 font-serif text-3xl font-semibold">Every Path Must Earn Its Place</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{ALTERNATIVES.map(([label, reason]) => <div key={label} className={`rounded-xl border p-4 ${label === 'Replatform' || label === 'Refactor' ? 'border-[#A88554]/40 bg-[#A88554]/10' : 'border-[var(--emos-border-subtle)] bg-[var(--emos-bg-secondary)]'}`}><div className="flex items-center gap-2"><Scale className="h-4 w-4 text-[var(--emos-accent)]" /><strong className="text-sm">{label}</strong></div><p className="mt-2 text-xs leading-5 text-[var(--emos-text-secondary)]">{reason}</p></div>)}</div></section>}

                    {step === 3 && <section><p className="text-xs font-semibold text-[var(--emos-accent-text)]">Deterministic Readiness Result</p><h2 className="mt-2 font-serif text-3xl font-semibold">Evidence Before Approval</h2><div className={`mt-6 rounded-2xl border p-5 ${readiness.decisionReadiness === 'READY' ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-amber-500/30 bg-amber-500/10'}`}><div className="flex flex-wrap items-end justify-between gap-3"><div><p className={`font-mono text-4xl font-semibold ${readiness.decisionReadiness === 'READY' ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}`}>{readiness.completeness}%</p><p className="mt-1 text-xs text-[var(--emos-text-muted)]">Current Evidence Completeness</p></div><div className={`rounded-full border bg-[var(--emos-surface)] px-3 py-1.5 font-mono text-xs font-bold ${readiness.decisionReadiness === 'READY' ? 'border-emerald-500/30 text-emerald-700 dark:text-emerald-300' : 'border-amber-500/30 text-amber-700 dark:text-amber-300'}`}>{readiness.decisionReadiness}</div></div><div className="mt-5 h-2 rounded-full bg-[var(--emos-border-subtle)]"><motion.div className={`h-full rounded-full ${readiness.decisionReadiness === 'READY' ? 'bg-emerald-500' : 'bg-amber-500'}`} initial={reduceMotion ? false : { width: 0 }} animate={{ width: `${readiness.completeness}%` }} transition={{ duration: 0.7 }} /></div><div className="mt-2 flex justify-between text-[11px] text-[var(--emos-text-muted)]"><span>0%</span><span>{EMOS_FACTS.readinessThreshold}% Minimum</span><span>100%</span></div></div><div className={`mt-5 flex gap-3 rounded-xl border p-4 ${readiness.decisionReadiness === 'READY' ? 'border-emerald-500/25 bg-emerald-500/10' : 'border-rose-500/25 bg-rose-500/10'}`}>{readiness.decisionReadiness === 'READY' ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" /> : <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />}<div><strong className="text-sm">{readiness.decisionReadiness === 'READY' ? 'Ready for Human Review—Not Automatically Approved' : 'No 6R Disposition Should Be Approved Yet'}</strong><p className="mt-1 text-xs leading-5 text-[var(--emos-text-secondary)]">{readiness.decisionReadiness === 'READY' ? `The ${EMOS_FACTS.readinessThreshold}% minimum is met and every critical gap is closed. A decision owner must still review the evidence, alternatives and risks.` : `Reaching ${EMOS_FACTS.readinessThreshold}% is necessary, but unresolved dependency, TCO or target-state gaps can still block readiness. Validate the named gaps, rerun the gate and request human review.`}</p></div></div><div className="mt-5 flex items-center gap-2 text-xs text-[var(--emos-text-muted)]"><ShieldCheck className="h-4 w-4 text-emerald-500" />Model confidence cannot override this calculated gate.</div></section>}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="flex items-center justify-between border-t border-[var(--emos-border-subtle)] bg-[var(--emos-bg-secondary)] p-4">
                <button disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))} className="min-h-10 rounded-xl px-3 text-sm font-semibold disabled:opacity-35">Previous</button>
                <span className="text-xs text-[var(--emos-text-muted)]">{step + 1} of {STEPS.length}</span>
                {step < STEPS.length - 1 ? <button onClick={() => setStep((current) => Math.min(STEPS.length - 1, current + 1))} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#A88554] px-4 text-sm font-semibold text-black">Next <ArrowRight className="h-4 w-4" /></button> : <button onClick={handleSignIn} disabled={isSigningIn} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#A88554] px-4 text-sm font-semibold text-black disabled:cursor-wait disabled:opacity-70">{isSigningIn ? 'Connecting…' : 'Use Your Portfolio'} <FileCheck2 className="h-4 w-4" /></button>}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
