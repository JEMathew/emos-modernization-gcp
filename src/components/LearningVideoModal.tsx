import React, { useEffect, useId, useRef } from 'react';
import { Clock3, ExternalLink, Maximize2, X } from 'lucide-react';
import {
  getDrivePreviewUrl,
  getDriveViewUrl,
  type LearningVideo,
} from '../data/learningVideos';

interface LearningVideoModalProps {
  video: LearningVideo;
  onClose: () => void;
  returnFocusTo: HTMLElement | null;
}

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  'a[href]',
  'iframe',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export const LearningVideoModal: React.FC<LearningVideoModalProps> = ({
  video,
  onClose,
  returnFocusTo,
}) => {
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previewUrl = getDrivePreviewUrl(video.driveFileId);
  const driveViewUrl = getDriveViewUrl(video.driveFileId);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;

      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((element) => !element.hasAttribute('disabled'));

      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      returnFocusTo?.focus();
    };
  }, [onClose, returnFocusTo]);

  const enterFullscreen = () => {
    const requestFullscreen = playerContainerRef.current?.requestFullscreen;
    if (requestFullscreen) {
      void requestFullscreen.call(playerContainerRef.current).catch(() => undefined);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#08111f] text-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-300">
              <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-2 py-1 text-amber-100">
                {video.sequence}
              </span>
              <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1">
                Beta v1.0
              </span>
              {video.duration && (
                <span className="inline-flex items-center gap-1">
                  <Clock3 className="h-3 w-3" aria-hidden="true" />
                  {video.duration}
                </span>
              )}
            </div>
            <h2 id={titleId} className="font-serif text-lg font-bold leading-snug sm:text-2xl">
              {video.title}
            </h2>
            <p className="mt-1 text-xs text-slate-400 sm:text-sm">{video.category}</p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label={`Close video: ${video.title}`}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-slate-200 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="overflow-y-auto">
          <div ref={playerContainerRef} className="aspect-video w-full bg-black">
            {previewUrl && (
              <iframe
                src={previewUrl}
                title={`${video.sequence}: ${video.title} video player`}
                className="h-full w-full border-0"
                allow="encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            )}
          </div>

          <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
            <p className="max-w-2xl text-sm leading-relaxed text-slate-300">{video.description}</p>
            <div className="flex shrink-0 flex-wrap gap-2">
              <button
                type="button"
                onClick={enterFullscreen}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 text-xs font-bold text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <Maximize2 className="h-4 w-4" aria-hidden="true" />
                Full screen
              </button>
              {driveViewUrl && (
                <a
                  href={driveViewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#A88554] to-[#E5C492] px-4 text-xs font-bold text-black transition-opacity hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Open in Google Drive
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
