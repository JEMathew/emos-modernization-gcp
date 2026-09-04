import React from 'react';
import {
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Dna,
  Briefcase,
  Cpu,
  Share2,
  DollarSign,
  ShieldCheck,
  Compass,
  ArrowRight,
} from 'lucide-react';
import type { EnterpriseWorkload, DnaField, DnaEvidenceStatus } from '../types';
import { calculateDnaCompleteness } from '../data/samplePortfolio';

interface EnterpriseDnaViewProps {
  workload: EnterpriseWorkload;
  onBackToPortfolio: () => void;
  onAssess: (workload: EnterpriseWorkload) => void;
  isProcessing?: boolean;
}

export const EnterpriseDnaView: React.FC<EnterpriseDnaViewProps> = ({
  workload,
  onBackToPortfolio,
  onAssess,
  isProcessing = false,
}) => {
  const stats = calculateDnaCompleteness(workload.dna);

  const renderStatusBadge = (status: DnaEvidenceStatus) => {
    switch (status) {
      case 'known':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold uppercase tracking-wider">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>VERIFIED</span>
          </span>
        );
      case 'incomplete':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[10px] font-semibold uppercase tracking-wider">
            <HelpCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span>INCOMPLETE</span>
          </span>
        );
      case 'missing':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30 text-[10px] font-semibold uppercase tracking-wider">
            <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
            <span>MISSING</span>
          </span>
        );
    }
  };

  const renderField = (field: DnaField) => {
    const isKnown = field.status === 'known';
    return (
      <div
        key={field.id}
        className={`p-3.5 rounded-xl border transition-all ${
          isKnown
            ? 'bg-[var(--emos-surface)] border-[var(--emos-border-subtle)]'
            : 'bg-[var(--emos-surface-elevated)] border-[var(--emos-accent-border)]'
        }`}
      >
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <span className="text-xs font-semibold text-[var(--emos-text-muted)]">{field.label}</span>
          {renderStatusBadge(field.status)}
        </div>

        <div className="text-sm font-medium text-[var(--emos-text-primary)] break-words">
          {field.value}
        </div>

        {field.detail && (
          <div className="text-[11px] text-[var(--emos-text-secondary)] mt-1.5 leading-relaxed font-sans">
            {field.detail}
          </div>
        )}
      </div>
    );
  };

  return (
    <div id="enterprise-dna-view" className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-5xl mx-auto w-full transition-colors">
      {/* Navigation & Header */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            id="back-to-portfolio-btn"
            onClick={onBackToPortfolio}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] hover:bg-[var(--emos-surface-hover)] text-xs font-medium text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)] transition-colors cursor-pointer min-h-[36px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Enterprise Portfolio</span>
          </button>

          {/* Subtle Journey Indicator with UNDERSTAND highlighted */}
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-[var(--emos-text-muted)] font-mono bg-[var(--emos-bg-tertiary)] px-2.5 py-1 rounded-lg border border-[var(--emos-border-subtle)]">
            <span>DISCOVER</span>
            <span>→</span>
            <span className="text-[var(--emos-accent-text)] font-semibold bg-[var(--emos-accent-subtle)] px-1.5 py-0.5 rounded border border-[var(--emos-accent-border)]">UNDERSTAND</span>
            <span>→</span>
            <span>ASSESS</span>
            <span>→</span>
            <span>DECIDE</span>
            <span>→</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">TRUST</span>
          </div>
        </div>

        {/* Visual Communicator: UNDERSTAND */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--emos-surface)] border border-[var(--emos-border-subtle)] text-[11px] text-[var(--emos-accent)] font-medium">
          <span className="font-bold tracking-wider uppercase text-[var(--emos-accent-text)]">UNDERSTAND</span>
          <span className="text-[var(--emos-text-muted)]">•</span>
          <span>What do we know about this workload, and what evidence is missing?</span>
        </div>

        {/* Workload Hero Banner */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[var(--emos-surface)] border border-[var(--emos-border-subtle)] flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6 shadow-xs">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-[var(--emos-bg-tertiary)] border border-[var(--emos-border-subtle)] text-[10px] font-mono text-[var(--emos-text-secondary)]">
                {workload.type}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-[var(--emos-bg-tertiary)] border border-[var(--emos-border-subtle)] text-[10px] font-mono text-[var(--emos-text-secondary)]">
                {workload.businessCriticality} Criticality
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-[var(--emos-bg-tertiary)] border border-[var(--emos-border-subtle)] text-[10px] font-mono text-[var(--emos-text-secondary)]">
                {workload.hosting}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif text-[var(--emos-text-primary)] tracking-tight flex items-center gap-2">
              <Dna className="w-6 h-6 text-[var(--emos-accent)]" />
              <span>{workload.name} — Enterprise DNA</span>
            </h1>

            <p className="text-xs sm:text-sm text-[var(--emos-text-secondary)] leading-relaxed">
              Structured architectural evidence baseline representing verified enterprise attributes and high-impact missing evidence gaps.
            </p>
          </div>

          {/* Evidence Completeness Score Card */}
          <div className="p-4 rounded-xl bg-[var(--emos-bg-tertiary)] border border-[var(--emos-border-subtle)] min-w-[240px] space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-[var(--emos-text-muted)] font-semibold">
                Evidence Completeness
              </span>
              <span className="font-mono text-lg font-bold text-[var(--emos-accent-text)]">
                {stats.completeness}%
              </span>
            </div>

            {/* Visual Bar */}
            <div className="w-full h-2 bg-[var(--emos-surface)] rounded-full overflow-hidden border border-[var(--emos-border-subtle)]">
              <div
                className="h-full bg-gradient-to-r from-[#A88554] to-[#E5C492] rounded-full"
                style={{ width: `${stats.completeness}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">{stats.knownCount} Verified Known</span>
              <span className="text-rose-600 dark:text-rose-400 font-medium">{stats.missingCount + stats.incompleteCount} Missing/Gaps</span>
            </div>

            <button
              id="assess-from-dna-btn"
              onClick={() => onAssess(workload)}
              disabled={isProcessing}
              className="w-full py-2.5 px-4 rounded-xl bg-[#A88554] hover:bg-[#BCA075] dark:hover:bg-[#E5C492] text-black text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50 active:scale-98 min-h-[40px]"
            >
              <Sparkles className="w-4 h-4 text-black" />
              <span>Assess for Modernization</span>
              <ArrowRight className="w-3.5 h-3.5 text-black" />
            </button>
          </div>
        </div>
      </div>

      {/* Structured DNA Sections (6 Sections) */}
      <div className="space-y-6 sm:space-y-8">
        {/* 1. Business DNA */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--emos-border-subtle)]">
            <Briefcase className="w-4 h-4 text-[var(--emos-accent)]" />
            <h2 className="text-sm font-semibold text-[var(--emos-text-primary)] uppercase tracking-wider">
              1. Business DNA
            </h2>
            <span className="text-xs text-[var(--emos-text-muted)] ml-auto hidden sm:inline">Capability, Criticality & Modernization Drivers</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {workload.dna.business.map(renderField)}
          </div>
        </section>

        {/* 2. Technology DNA */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--emos-border-subtle)]">
            <Cpu className="w-4 h-4 text-[var(--emos-accent)]" />
            <h2 className="text-sm font-semibold text-[var(--emos-text-primary)] uppercase tracking-wider">
              2. Technology DNA
            </h2>
            <span className="text-xs text-[var(--emos-text-muted)] ml-auto hidden sm:inline">Runtime, Database, Hosting & Lifecycle Risk</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {workload.dna.technology.map(renderField)}
          </div>
        </section>

        {/* 3. Dependency DNA */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--emos-border-subtle)]">
            <Share2 className="w-4 h-4 text-[var(--emos-accent)]" />
            <h2 className="text-sm font-semibold text-[var(--emos-text-primary)] uppercase tracking-wider">
              3. Dependency DNA
            </h2>
            <span className="text-xs text-[var(--emos-text-muted)] ml-auto hidden sm:inline">Known Integrations & Data Pipelines</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {workload.dna.dependency.map(renderField)}
          </div>
        </section>

        {/* 4. Economics DNA */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--emos-border-subtle)]">
            <DollarSign className="w-4 h-4 text-[var(--emos-accent)]" />
            <h2 className="text-sm font-semibold text-[var(--emos-text-primary)] uppercase tracking-wider">
              4. Economics DNA
            </h2>
            <span className="text-xs text-[var(--emos-text-muted)] ml-auto hidden sm:inline">Infrastructure, Licensing & TCO Baseline</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {workload.dna.economics.map(renderField)}
          </div>
        </section>

        {/* 5. Data & Risk DNA */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--emos-border-subtle)]">
            <ShieldCheck className="w-4 h-4 text-[var(--emos-accent)]" />
            <h2 className="text-sm font-semibold text-[var(--emos-text-primary)] uppercase tracking-wider">
              5. Data & Risk DNA
            </h2>
            <span className="text-xs text-[var(--emos-text-muted)] ml-auto hidden sm:inline">Data Sensitivity, Volume & Regulatory Mandates</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {workload.dna.dataAndRisk.map(renderField)}
          </div>
        </section>

        {/* 6. Target-State DNA */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--emos-border-subtle)]">
            <Compass className="w-4 h-4 text-[var(--emos-accent)]" />
            <h2 className="text-sm font-semibold text-[var(--emos-text-primary)] uppercase tracking-wider">
              6. Target-State DNA
            </h2>
            <span className="text-xs text-[var(--emos-text-muted)] ml-auto hidden sm:inline">Cloud Strategy, Architectural Mandates & Downtime</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {workload.dna.targetState.map(renderField)}
          </div>
        </section>
      </div>

      {/* Bottom Action Footer */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[var(--emos-surface)] border border-[var(--emos-border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-[var(--emos-text-primary)]">
            Ready to generate the canonical 6R recommendation?
          </div>
          <div className="text-[11px] text-[var(--emos-text-secondary)]">
            EMOS will pass all 18 structured Enterprise DNA attributes directly into the Gemini reasoning engine.
          </div>
        </div>

        <button
          id="bottom-assess-from-dna-btn"
          onClick={() => onAssess(workload)}
          disabled={isProcessing}
          className="py-2.5 px-5 rounded-xl bg-[#A88554] hover:bg-[#BCA075] dark:hover:bg-[#E5C492] text-black text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50 shrink-0 min-h-[38px]"
        >
          <Sparkles className="w-4 h-4 text-black" />
          <span>Assess for Modernization</span>
        </button>
      </div>
    </div>
  );
};
