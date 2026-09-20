import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CircleCheck, Clock3, Eye } from 'lucide-react';
import {
  MODERNIZATION_PHASES,
  BUILDING_SUB_STAGES,
  type LifecycleDeliveryState,
  type LifecycleStageDefinition,
} from '../config/productFacts';

interface ModernizationLifecycleProps {
  currentStage?: string;
  onSelectStage?: (stage: LifecycleStageDefinition) => void;
  defaultExpanded?: boolean;
}

const DELIVERY_LABEL: Record<LifecycleDeliveryState, string> = {
  available: 'Available',
  next: 'Building next',
  vision: 'Planned',
};

const DELIVERY_STYLE: Record<LifecycleDeliveryState, string> = {
  available: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  next: 'border-[var(--emos-border-strong)] bg-[var(--emos-bg-tertiary)] text-[var(--emos-text-muted)]',
  vision: 'border-[var(--emos-border-subtle)] bg-[var(--emos-bg-secondary)] text-[var(--emos-text-muted)]',
};

const DELIVERY_ICON = {
  available: CircleCheck,
  next: Clock3,
  vision: Eye,
} as const;

export const ModernizationLifecycle: React.FC<ModernizationLifecycleProps> = ({
  currentStage,
  onSelectStage,
  defaultExpanded = false,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <section
      aria-label="Enterprise modernization lifecycle"
      className="border-b border-[var(--emos-border-subtle)] bg-[var(--emos-bg-secondary)]"
    >
      <div className="mx-auto max-w-[1600px] px-4 py-3 sm:px-6">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="flex shrink-0 items-center justify-between gap-4 xl:w-48">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--emos-text-muted)]">Modernization lifecycle</p>
              <p className="mt-0.5 text-xs font-semibold text-[var(--emos-text-primary)]">15 stages + Mobilize</p>
            </div>
            <button
              type="button"
              aria-expanded={expanded}
              aria-controls="modernization-lifecycle-detail"
              onClick={() => setExpanded((value) => !value)}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[var(--emos-border-strong)] bg-[var(--emos-surface)] px-3 text-[11px] font-semibold text-[var(--emos-text-secondary)] hover:bg-[var(--emos-surface-hover)] xl:hidden"
            >
              {expanded ? 'Hide' : 'View all'}
              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          </div>

          <div className="grid flex-1 grid-cols-2 gap-1.5 sm:grid-cols-5" aria-label="Lifecycle phases">
            {MODERNIZATION_PHASES.map((phase) => {
              const containsCurrent = phase.stages.some((stage) => stage.name === currentStage);
              const unavailable = phase.stages.every((stage) => stage.delivery !== 'available');
              return (
                <div
                  key={phase.number}
                  className={`min-w-0 rounded-lg border px-2.5 py-2 ${containsCurrent
                    ? 'border-[var(--emos-journey-border)] bg-[var(--emos-journey-subtle)] ring-1 ring-[var(--emos-journey-border)]'
                    : unavailable
                    ? 'border-[var(--emos-border-subtle)] bg-[var(--emos-bg-tertiary)]'
                    : 'border-[var(--emos-border-subtle)] bg-[var(--emos-surface)]'
                  }`}
                >
                  <p className="truncate text-[10px] font-bold uppercase tracking-wider text-[var(--emos-text-muted)]">Phase {phase.number}</p>
                  <p className="truncate text-[11px] font-semibold text-[var(--emos-text-primary)]">{phase.name}</p>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            aria-expanded={expanded}
            aria-controls="modernization-lifecycle-detail"
            onClick={() => setExpanded((value) => !value)}
            className="hidden min-h-9 shrink-0 items-center gap-1.5 rounded-lg border border-[var(--emos-border-strong)] bg-[var(--emos-surface)] px-3 text-[11px] font-semibold text-[var(--emos-text-secondary)] hover:bg-[var(--emos-surface-hover)] xl:inline-flex"
          >
            {expanded ? 'Hide lifecycle' : 'View entire lifecycle'}
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>

        {expanded && (
          <div id="modernization-lifecycle-detail" className="mt-4 border-t border-[var(--emos-border-subtle)] pt-4">
            <div className="mb-4 flex flex-wrap items-center gap-2" aria-label="Lifecycle delivery legend">
              {(Object.keys(DELIVERY_LABEL) as LifecycleDeliveryState[]).map((state) => {
                const Icon = DELIVERY_ICON[state];
                return (
                  <span key={state} className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${DELIVERY_STYLE[state]}`}>
                    <Icon className="h-3 w-3" />
                    {DELIVERY_LABEL[state]}
                  </span>
                );
              })}
              <span className="text-[10px] text-[var(--emos-text-muted)]">Unavailable stages remain visible to show the complete operating model.</span>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {MODERNIZATION_PHASES.map((phase) => (
                <div key={phase.number} className="rounded-xl border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--emos-text-muted)]">{phase.number} — {phase.name}</p>
                  <p className="mt-1 text-[11px] font-medium text-[var(--emos-text-secondary)]">{phase.promise}</p>
                  <div className="mt-3 space-y-2">
                    {phase.stages.map((stage) => {
                      const isCurrent = stage.name === currentStage;
                      const isAvailable = stage.delivery === 'available';
                      const content = (
                        <>
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <span className="text-left text-sm font-semibold text-[var(--emos-text-primary)]">
                              {stage.handoff ? 'Handoff' : stage.number}. {stage.name}
                            </span>
                            <span className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-semibold ${DELIVERY_STYLE[stage.delivery]}`}>
                              {DELIVERY_LABEL[stage.delivery]}
                            </span>
                          </div>
                          <ul className="mt-2 space-y-1 text-left text-xs leading-5 text-[var(--emos-text-secondary)]">
                            {stage.subStages.map((subStage) => <li key={subStage}>
                              <span>{subStage}</span>
                              {stage.delivery === 'available' && BUILDING_SUB_STAGES.has(subStage) && <span className="ml-1 font-medium text-[var(--emos-text-muted)]"> · Building next</span>}
                            </li>)}
                          </ul>
                        </>
                      );
                      const className = `block w-full rounded-lg border p-2.5 transition-colors ${isCurrent
                        ? 'border-[var(--emos-journey-border)] bg-[var(--emos-journey-subtle)] ring-1 ring-[var(--emos-journey-border)]'
                        : isAvailable
                        ? 'border-[var(--emos-border-subtle)] bg-[var(--emos-surface-elevated)] hover:border-[var(--emos-border-strong)]'
                        : 'border-[var(--emos-border-subtle)] bg-[var(--emos-bg-secondary)] grayscale'
                      }`;

                      return isAvailable && onSelectStage ? (
                        <button key={stage.name} type="button" onClick={() => { setExpanded(false); onSelectStage(stage); }} aria-current={isCurrent ? 'step' : undefined} className={className}>
                          {content}
                        </button>
                      ) : (
                        <div key={stage.name} aria-current={isCurrent ? 'step' : undefined} aria-disabled={!isAvailable || undefined} className={className}>
                          {content}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
