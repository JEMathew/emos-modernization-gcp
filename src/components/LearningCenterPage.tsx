import React, { useCallback, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Library,
  Map,
  Play,
  Search,
  ShieldCheck,
  Sparkles,
  VideoOff,
} from 'lucide-react';
import { LearningVideoModal } from './LearningVideoModal';
import { ThemeSelector } from './ThemeSelector';
import {
  CURRENT_BETA_CAPABILITIES,
  FUTURE_ROADMAP_CAPABILITIES,
  LEARNING_CATEGORIES,
  LEARNING_VIDEOS,
  type LearningCategory,
  type LearningVideo,
} from '../data/learningVideos';

interface LearningCenterPageProps {
  onNavigate: (path: string) => void;
  videos?: readonly LearningVideo[];
}

type CategoryFilter = 'All Categories' | LearningCategory;

export const LearningCenterPage: React.FC<LearningCenterPageProps> = ({
  onNavigate,
  videos = LEARNING_VIDEOS,
}) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('All Categories');
  const [selectedVideo, setSelectedVideo] = useState<LearningVideo | null>(null);
  const playbackTriggerRef = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();

  const filteredVideos = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    return videos.filter((video) => {
      const matchesCategory = category === 'All Categories' || video.category === category;
      const searchableText = [
        video.sequence,
        video.title,
        video.description,
        video.category,
        video.fileName,
        ...video.tags,
      ]
        .join(' ')
        .toLocaleLowerCase();

      return matchesCategory && (!normalizedQuery || searchableText.includes(normalizedQuery));
    });
  }, [category, query, videos]);

  const groupedVideos = LEARNING_CATEGORIES.map((group) => ({
    category: group,
    videos: filteredVideos.filter((video) => video.category === group),
  })).filter((group) => group.videos.length > 0);

  const navigate = (path: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    onNavigate(path);
  };

  const openVideo = (video: LearningVideo, trigger: HTMLElement) => {
    playbackTriggerRef.current = trigger;
    setSelectedVideo(video);
  };

  const closeVideo = useCallback(() => setSelectedVideo(null), []);

  return (
    <div className="emos-landing min-h-screen bg-[var(--emos-bg)] text-[var(--emos-text-primary)] font-sans transition-colors">
      <header className="sticky top-0 z-30 border-b border-[var(--emos-border-subtle)] bg-[var(--emos-bg-secondary)]/88 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[88rem] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <a
            href="/"
            onClick={navigate('/')}
            className="group flex min-w-0 items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--emos-accent)]"
            aria-label="Return to EMOS home"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#A88554] to-[#E5C492] shadow-md transition-transform group-hover:scale-105">
              <Sparkles className="h-4 w-4 text-black" aria-hidden="true" />
            </span>
            <span className="truncate font-serif text-base font-bold tracking-wider">EMOS</span>
            <span className="hidden rounded-full border border-[var(--emos-accent-border)] bg-[var(--emos-accent-subtle)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--emos-accent-text)] sm:inline">
              Learning Center
            </span>
          </a>

          <div className="flex items-center gap-2">
            <a
              href="/"
              onClick={navigate('/')}
              className="hidden min-h-10 items-center gap-1.5 rounded-xl border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] px-3 text-xs font-semibold text-[var(--emos-text-secondary)] transition-colors hover:text-[var(--emos-text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--emos-accent)] sm:inline-flex"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              EMOS Home
            </a>
            <ThemeSelector />
          </div>
        </div>
      </header>

      <main>
        <section className="landing-scene landing-video relative overflow-hidden border-b border-[var(--emos-border-subtle)]">
          <div className="pointer-events-none absolute inset-0 landing-grid opacity-40" aria-hidden="true" />
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto max-w-[88rem] px-4 py-14 sm:px-6 sm:py-16 lg:px-8"
          >
            <div className="max-w-4xl space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--emos-accent-border)] bg-[var(--emos-accent-subtle)] px-3 py-1.5 text-xs font-semibold text-[var(--emos-accent-text)]">
                <Library className="h-3.5 w-3.5" aria-hidden="true" />
                Beta v1.0 Publicly Live · No EMOS Sign-In Required
              </div>
              <h1 className="font-serif text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                See EMOS in Motion
              </h1>
              <p className="max-w-3xl text-base leading-8 text-[var(--emos-text-secondary)]">
                Follow the evidence-to-decision journey from portfolio discovery and Enterprise DNA through explainable 6R recommendations, governance, wave planning and mobilization readiness.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href="#catalogue"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#A88554] to-[#E5C492] px-5 text-sm font-bold text-black transition-all hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--emos-accent)]"
                >
                  Browse All 20 Lessons
                </a>
              </div>
            </div>
          </motion.div>
        </section>

        <section id="catalogue" className="mx-auto max-w-[88rem] scroll-mt-24 px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
          <div className="mb-7 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--emos-accent-text)]">
                Beta Walkthrough Catalogue
              </p>
              <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight">Choose a Learning Path</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--emos-text-secondary)]">
                For a concise end-to-end journey, watch 00 and then F10 → F11 → F12 → F03 → F04 → F19.
              </p>
            </div>
            <label className="relative block w-full lg:max-w-sm">
              <span className="sr-only">Search learning videos</span>
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--emos-text-muted)]"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search lessons, topics, or filenames"
                aria-label="Search learning videos"
                className="min-h-11 w-full rounded-xl border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] py-2.5 pl-10 pr-3 text-sm text-[var(--emos-text-primary)] outline-none placeholder:text-[var(--emos-text-muted)] focus:border-[var(--emos-accent)] focus:ring-2 focus:ring-[var(--emos-accent-subtle)]"
              />
            </label>
          </div>

          <div
            role="tablist"
            aria-label="Filter videos by category"
            className="mb-9 flex snap-x gap-2 overflow-x-auto pb-2"
          >
            {(['All Categories', ...LEARNING_CATEGORIES] as CategoryFilter[]).map((filter) => (
              <button
                key={filter}
                type="button"
                role="tab"
                aria-selected={category === filter}
                aria-controls="learning-video-results"
                onClick={() => setCategory(filter)}
                className={`min-h-10 shrink-0 snap-start rounded-xl border px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--emos-accent)] ${
                  category === filter
                    ? 'border-[var(--emos-accent-border)] bg-[var(--emos-accent-subtle)] text-[var(--emos-accent-text)]'
                    : 'border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)]'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div id="learning-video-results" aria-live="polite">
            <p className="sr-only">{filteredVideos.length} learning videos shown</p>
            {groupedVideos.length > 0 ? (
              <div className="space-y-12">
                {groupedVideos.map((group) => (
                  <section key={group.category} aria-labelledby={`category-${group.category.replaceAll(' ', '-').toLowerCase()}`}>
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <h3
                        id={`category-${group.category.replaceAll(' ', '-').toLowerCase()}`}
                        className="font-serif text-xl font-bold sm:text-2xl"
                      >
                        {group.category}
                      </h3>
                      <span className="shrink-0 text-xs text-[var(--emos-text-muted)]">
                        {group.videos.length} {group.videos.length === 1 ? 'lesson' : 'lessons'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                      {group.videos.map((video) => (
                        <motion.article
                          key={video.sequence}
                          data-testid={`video-${video.sequence.toLowerCase()}`}
                          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                          viewport={{ once: true, amount: 0.12 }}
                          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                          whileHover={reduceMotion ? undefined : { y: -5 }}
                          className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] shadow-sm hover:shadow-xl"
                        >
                          <img
                            src={video.thumbnailUrl}
                            alt={`${video.sequence}: ${video.title}`}
                            loading="lazy"
                            className="aspect-video w-full bg-[#08152a] object-cover"
                          />
                          <div className="flex flex-1 flex-col gap-3 p-5">
                            <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                              <span className="rounded-full border border-[var(--emos-accent-border)] bg-[var(--emos-accent-subtle)] px-2 py-1 text-[var(--emos-accent-text)]">
                                {video.sequence}
                              </span>
                              <span className="rounded-full border border-[var(--emos-border-subtle)] bg-[var(--emos-bg-tertiary)] px-2 py-1 text-[var(--emos-text-secondary)]">
                                Beta v1.0
                              </span>
                              {video.duration && (
                                <span className="inline-flex items-center gap-1 text-[var(--emos-text-muted)]">
                                  <Clock3 className="h-3 w-3" aria-hidden="true" />
                                  {video.duration}
                                </span>
                              )}
                            </div>
                            <h4 id={`video-title-${video.sequence}`} className="font-serif text-lg font-bold leading-snug">
                              {video.title}
                            </h4>
                            <p className="text-xs font-semibold text-[var(--emos-accent-text)]">{video.category}</p>
                            <p className="text-sm leading-relaxed text-[var(--emos-text-secondary)]">
                              {video.description}
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {video.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-md bg-[var(--emos-bg-tertiary)] px-2 py-1 text-[10px] font-medium text-[var(--emos-text-muted)]"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <code className="mt-auto block break-all rounded-lg border border-[var(--emos-code-border)] bg-[var(--emos-code-bg)] px-3 py-2 text-[10px] text-[var(--emos-text-muted)]">
                              File: {video.fileName}
                            </code>
                            {video.driveFileId ? (
                              <button
                                type="button"
                                onClick={(event) => openVideo(video, event.currentTarget)}
                                aria-label={`Play ${video.sequence}: ${video.title} in EMOS`}
                                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#A88554] to-[#E5C492] px-4 text-xs font-bold text-black transition-opacity hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--emos-accent)]"
                              >
                                <Play className="h-3.5 w-3.5" aria-hidden="true" />
                                Play in EMOS
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled
                                aria-label={`Video temporarily unavailable for ${video.sequence}: ${video.title}`}
                                className="inline-flex min-h-10 cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-[var(--emos-border-subtle)] bg-[var(--emos-bg-tertiary)] px-4 text-xs font-bold text-[var(--emos-text-muted)] opacity-75"
                              >
                                <VideoOff className="h-3.5 w-3.5" aria-hidden="true" />
                                Temporarily unavailable
                              </button>
                            )}
                          </div>
                        </motion.article>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <div role="status" className="rounded-2xl border border-dashed border-[var(--emos-border-strong)] p-10 text-center">
                <Search className="mx-auto h-7 w-7 text-[var(--emos-text-muted)]" aria-hidden="true" />
                <h3 className="mt-3 font-serif text-lg font-bold">No matching lessons</h3>
                <p className="mt-1 text-sm text-[var(--emos-text-secondary)]">
                  Clear the search or choose another learning category.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="border-y border-[var(--emos-border-subtle)] bg-[var(--emos-bg-secondary)]">
          <div className="mx-auto grid max-w-[88rem] gap-6 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
            <motion.article initial={reduceMotion ? false : { opacity: 0, x: -16 }} whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.45 }} className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-6">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                <h2 className="font-serif text-xl font-bold">Implemented in Beta v1.0</h2>
              </div>
              <ul className="mt-5 space-y-3 text-sm leading-relaxed text-[var(--emos-text-secondary)]">
                {CURRENT_BETA_CAPABILITIES.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.article>

            <motion.article initial={reduceMotion ? false : { opacity: 0, x: 16 }} whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.45 }} className="rounded-2xl border border-violet-500/25 bg-violet-500/5 p-6">
              <div className="flex items-center gap-2 text-violet-700 dark:text-violet-300">
                <Map className="h-5 w-5" aria-hidden="true" />
                <h2 className="font-serif text-xl font-bold">Future EMOS Roadmap</h2>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-[var(--emos-text-muted)]">
                These capabilities describe the broader product direction and are not claimed as implemented in this beta.
              </p>
              <ul className="mt-5 space-y-3 text-sm leading-relaxed text-[var(--emos-text-secondary)]">
                {FUTURE_ROADMAP_CAPABILITIES.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <Map className="mt-0.5 h-4 w-4 shrink-0 text-violet-600 dark:text-violet-300" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.article>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--emos-border-subtle)] bg-[var(--emos-bg-secondary)] px-4 py-8 text-xs text-[var(--emos-text-muted)] sm:px-6">
        <div className="mx-auto flex max-w-[88rem] flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-center sm:text-left">
            <span className="font-serif font-bold text-[var(--emos-text-primary)]">EMOS</span> — Enterprise Modernization Operating System · Public Beta v1.0
          </p>
          <nav aria-label="Learning Center footer" className="flex flex-wrap justify-center gap-5">
            <a href="/" onClick={navigate('/')} className="font-medium hover:text-[var(--emos-text-primary)] hover:underline">Home</a>
            <a href="/sandbox" onClick={navigate('/sandbox')} className="font-medium hover:text-[var(--emos-text-primary)] hover:underline">Public Sandbox</a>
            <a href="/trust" onClick={navigate('/trust')} className="font-medium hover:text-[var(--emos-text-primary)] hover:underline">Trust &amp; Evaluation</a>
            <a href="/privacy" onClick={navigate('/privacy')} className="font-medium hover:text-[var(--emos-text-primary)] hover:underline">Privacy Policy</a>
            <a href="/terms" onClick={navigate('/terms')} className="font-medium hover:text-[var(--emos-text-primary)] hover:underline">Terms of Service</a>
          </nav>
        </div>
      </footer>

      {selectedVideo && (
        <LearningVideoModal
          video={selectedVideo}
          onClose={closeVideo}
          returnFocusTo={playbackTriggerRef.current}
        />
      )}
    </div>
  );
};
