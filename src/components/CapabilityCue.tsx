import React, { useState, useRef, useEffect, useId } from 'react';
import { HelpCircle, PlayCircle, X } from 'lucide-react';
import { CAPABILITY_CUES, type CapabilityCueDefinition } from '../config/capabilityCues';

interface CapabilityCueProps {
  cueId: string;
  customCue?: CapabilityCueDefinition;
  label?: string;
  showLabel?: boolean;
  onWatchOverview?: (videoSequence: string) => void;
  className?: string;
}

export const CapabilityCue: React.FC<CapabilityCueProps> = ({
  cueId,
  customCue,
  label,
  showLabel = false,
  onWatchOverview,
  className = '',
}) => {
  const cue = customCue || CAPABILITY_CUES[cueId.toLowerCase()];
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const tooltipId = useId();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    const handlePointerDown = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isOpen]);

  if (!cue) return null;

  return (
    <span
      ref={containerRef}
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        aria-label={`About ${label || cue.title}: ${cue.summary}`}
        aria-expanded={isOpen}
        aria-controls={isOpen ? tooltipId : undefined}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={(e) => {
          if (!containerRef.current?.contains(e.relatedTarget as Node)) {
            setIsOpen(false);
          }
        }}
        className="inline-flex items-center gap-1 rounded-md px-1 py-0.5 text-[11px] font-medium text-[var(--emos-text-muted)] hover:text-[var(--emos-accent-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--emos-accent)] transition-colors cursor-pointer"
      >
        {showLabel && <span>{label || cue.title}</span>}
        <HelpCircle className="w-3.5 h-3.5 text-[var(--emos-accent)] shrink-0" aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          id={tooltipId}
          role="dialog"
          aria-label={`${cue.title} explanation`}
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-72 sm:w-80 rounded-2xl border border-[var(--emos-border-strong)] bg-[var(--emos-surface)] p-3.5 shadow-2xl text-left text-xs text-[var(--emos-text-primary)]"
        >
          <div className="flex items-start justify-between gap-2 pb-2 border-b border-[var(--emos-border-subtle)]">
            <div>
              <p className="font-semibold text-[var(--emos-text-primary)]">{cue.title}</p>
              {cue.plainEnglish && (
                <p className="text-[11px] font-medium text-[var(--emos-accent-text)]">{cue.plainEnglish}</p>
              )}
            </div>
            <button
              type="button"
              aria-label={`Close ${cue.title} explanation`}
              onClick={() => setIsOpen(false)}
              className="p-0.5 rounded text-[var(--emos-text-muted)] hover:text-[var(--emos-text-primary)] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="mt-2 text-xs leading-relaxed text-[var(--emos-text-secondary)]">
            {cue.summary}
          </p>

          <dl className="mt-2.5 space-y-1.5 border-t border-[var(--emos-border-subtle)] pt-2 text-[11px]">
            <div>
              <dt className="font-semibold text-[var(--emos-text-primary)] inline">What it is: </dt>
              <dd className="text-[var(--emos-text-secondary)] inline">{cue.whatIsIt}</dd>
            </div>
            <div>
              <dt className="font-semibold text-[var(--emos-text-primary)] inline">Problem solved: </dt>
              <dd className="text-[var(--emos-text-secondary)] inline">{cue.problemSolved}</dd>
            </div>
            <div>
              <dt className="font-semibold text-[var(--emos-text-primary)] inline">When used: </dt>
              <dd className="text-[var(--emos-text-secondary)] inline">{cue.whatHappens}</dd>
            </div>
          </dl>

          {cue.learnMoreVideoSequence && (
            <div className="mt-2.5 pt-2 border-t border-[var(--emos-border-subtle)] flex items-center justify-between">
              <a
                href="/learn"
                onClick={(e) => {
                  if (onWatchOverview) {
                    e.preventDefault();
                    onWatchOverview(cue.learnMoreVideoSequence!);
                  }
                }}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--emos-accent-text)] hover:underline"
              >
                <PlayCircle className="w-3.5 h-3.5 text-[var(--emos-accent)]" />
                <span>Watch 90-sec overview →</span>
              </a>
            </div>
          )}
        </div>
      )}
    </span>
  );
};
