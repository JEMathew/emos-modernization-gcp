import React from 'react';
import {
  ArrowLeft,
  Sparkles,
  ShieldAlert,
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
  Info
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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/40 text-emerald-300 border border-emerald-800/60 text-[10px] font-semibold uppercase tracking-wider">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>VERIFIED EVIDENCE</span>
          </span>
        );
      case 'incomplete':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#241B10]/80 text-[#E5A866] border border-[#4A3320] text-[10px] font-semibold uppercase tracking-wider">
            <HelpCircle className="w-3 h-3 text-[#E5A866]" />
            <span>INCOMPLETE EVIDENCE</span>
          </span>
        );
      case 'missing':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#241414]/80 text-rose-300 border border-rose-900/60 text-[10px] font-semibold uppercase tracking-wider">
            <AlertCircle className="w-3 h-3 text-rose-400" />
            <span>MISSING EVIDENCE</span>
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
            ? 'bg-[#121212] border-[#252525]'
            : 'bg-[#141210] border-[#33251A]'
        }`}
      >
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <span className="text-xs font-semibold text-[#BBB]">{field.label}</span>
          {renderStatusBadge(field.status)}
        </div>

        <div className="text-sm font-medium text-white break-words">
          {field.value}
        </div>

        {field.detail && (
          <div className="text-[11px] text-[#777] mt-1.5 leading-relaxed font-sans">
            {field.detail}
          </div>
        )}
      </div>
    );
  };

  return (
    <div id="enterprise-dna-view" className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 max-w-5xl mx-auto w-full">
      {/* Navigation & Header */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            id="back-to-portfolio-btn"
            onClick={onBackToPortfolio}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#2E2E2E] bg-[#141414] hover:bg-[#1A1A1A] text-xs font-medium text-[#AAA] hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Enterprise Portfolio</span>
          </button>

          {/* Subtle Journey Indicator with UNDERSTAND highlighted */}
          <div className="flex items-center gap-1.5 text-[10px] text-[#666] font-mono bg-[#111] px-2.5 py-1 rounded-lg border border-[#222]">
            <span>DISCOVER</span>
            <span>→</span>
            <span className="text-[#E5C492] font-semibold bg-[#221A10] px-1.5 py-0.5 rounded border border-[#443018]">UNDERSTAND</span>
            <span>→</span>
            <span>ASSESS</span>
            <span>→</span>
            <span>DECIDE</span>
            <span>→</span>
            <span>TRUST</span>
          </div>
        </div>

        {/* Visual Communicator: UNDERSTAND */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181818] border border-[#2E2E2E] text-[11px] text-[#A88554] font-medium">
          <span className="font-bold tracking-wider uppercase text-[#E5C492]">UNDERSTAND</span>
          <span className="text-[#555]">•</span>
          <span>What do we know about this workload, and what evidence is missing?</span>
        </div>

        {/* Workload Hero Banner */}
        <div className="p-6 rounded-2xl bg-[#121212] border border-[#262626] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-[#1E1E1E] border border-[#2E2E2E] text-[10px] font-mono text-[#AAA]">
                {workload.type}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-[#1E1E1E] border border-[#2E2E2E] text-[10px] font-mono text-[#AAA]">
                {workload.businessCriticality} Criticality
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-[#1E1E1E] border border-[#2E2E2E] text-[10px] font-mono text-[#AAA]">
                {workload.hosting}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-2">
              <Dna className="w-6 h-6 text-[#A88554]" />
              <span>{workload.name} — Enterprise DNA</span>
            </h1>

            <p className="text-xs sm:text-sm text-[#888] leading-relaxed">
              Structured architectural evidence baseline representing verified enterprise attributes and high-impact missing evidence gaps.
            </p>
          </div>

          {/* Evidence Completeness Score Card */}
          <div className="p-4 rounded-xl bg-[#181818] border border-[#2E2E2E] min-w-[240px] space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-[#777] font-semibold">
                Evidence Completeness
              </span>
              <span className="font-mono text-lg font-bold text-[#E5C492]">
                {stats.completeness}%
              </span>
            </div>

            {/* Visual Bar */}
            <div className="w-full h-2 bg-[#101010] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#A88554] to-[#E5C492] rounded-full"
                style={{ width: `${stats.completeness}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#888]">
              <span className="text-emerald-400 font-medium">{stats.knownCount} Verified Known</span>
              <span className="text-rose-400 font-medium">{stats.missingCount + stats.incompleteCount} Missing/Gaps</span>
            </div>

            <button
              id="assess-from-dna-btn"
              onClick={() => onAssess(workload)}
              disabled={isProcessing}
              className="w-full py-2.5 px-4 rounded-xl bg-[#A88554] hover:bg-[#E5C492] text-black text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50 active:scale-98"
            >
              <Sparkles className="w-4 h-4 text-black" />
              <span>Assess for Modernization</span>
              <ArrowRight className="w-3.5 h-3.5 text-black" />
            </button>
          </div>
        </div>
      </div>

      {/* Structured DNA Sections (6 Sections) */}
      <div className="space-y-8">
        {/* 1. Business DNA */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[#222]">
            <Briefcase className="w-4 h-4 text-[#A88554]" />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
              1. Business DNA
            </h2>
            <span className="text-xs text-[#666] ml-auto">Capability, Criticality & Modernization Drivers</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {workload.dna.business.map(renderField)}
          </div>
        </section>

        {/* 2. Technology DNA */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[#222]">
            <Cpu className="w-4 h-4 text-[#A88554]" />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
              2. Technology DNA
            </h2>
            <span className="text-xs text-[#666] ml-auto">Runtime, Database, Hosting & Lifecycle Risk</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {workload.dna.technology.map(renderField)}
          </div>
        </section>

        {/* 3. Dependency DNA */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[#222]">
            <Share2 className="w-4 h-4 text-[#A88554]" />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
              3. Dependency DNA
            </h2>
            <span className="text-xs text-[#666] ml-auto">Known Integrations & Data Pipelines</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {workload.dna.dependency.map(renderField)}
          </div>
        </section>

        {/* 4. Economics DNA */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[#222]">
            <DollarSign className="w-4 h-4 text-[#A88554]" />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
              4. Economics DNA
            </h2>
            <span className="text-xs text-[#666] ml-auto">Infrastructure, Licensing & TCO Baseline</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {workload.dna.economics.map(renderField)}
          </div>
        </section>

        {/* 5. Data & Risk DNA */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[#222]">
            <ShieldCheck className="w-4 h-4 text-[#A88554]" />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
              5. Data & Risk DNA
            </h2>
            <span className="text-xs text-[#666] ml-auto">Data Sensitivity, Volume & Regulatory Mandates</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {workload.dna.dataAndRisk.map(renderField)}
          </div>
        </section>

        {/* 6. Target-State DNA */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[#222]">
            <Compass className="w-4 h-4 text-[#A88554]" />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
              6. Target-State DNA
            </h2>
            <span className="text-xs text-[#666] ml-auto">Cloud Strategy, Architectural Mandates & Downtime</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {workload.dna.targetState.map(renderField)}
          </div>
        </section>
      </div>

      {/* Bottom Action Footer */}
      <div className="p-5 rounded-2xl bg-[#141414] border border-[#222] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-white">
            Ready to generate the canonical 6R recommendation?
          </div>
          <div className="text-[11px] text-[#888]">
            EMOS will pass all 18 structured Enterprise DNA attributes directly into the Gemini reasoning engine.
          </div>
        </div>

        <button
          id="bottom-assess-from-dna-btn"
          onClick={() => onAssess(workload)}
          disabled={isProcessing}
          className="py-2.5 px-5 rounded-xl bg-[#A88554] hover:bg-[#E5C492] text-black text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50 shrink-0"
        >
          <Sparkles className="w-4 h-4 text-black" />
          <span>Assess for Modernization</span>
        </button>
      </div>
    </div>
  );
};
