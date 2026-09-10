import React from 'react';

export type JourneyStageName = 'Discover' | 'Understand' | 'Decide' | 'Plan' | 'Mobilize';

interface JourneyStageProps {
  stage: JourneyStageName;
  question: string;
  className?: string;
}

export const JourneyStage: React.FC<JourneyStageProps> = ({ stage, question, className = '' }) => (
  <div
    aria-label={`Current journey stage: ${stage}`}
    className={`inline-flex max-w-full items-center gap-2 rounded-full border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] px-3 py-1 text-[11px] font-medium text-[var(--emos-accent)] ${className}`}
  >
    <span className="shrink-0 font-bold uppercase tracking-wider text-[var(--emos-accent-text)]">
      {stage}
    </span>
    <span className="text-[var(--emos-text-muted)]" aria-hidden="true">•</span>
    <span className="min-w-0 truncate">{question}</span>
  </div>
);
