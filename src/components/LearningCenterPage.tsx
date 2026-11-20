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

import type { User } from 'firebase/auth';

interface LearningCenterPageProps {
  user?: User | null;
  onNavigate: (path: string) => void;
  videos?: readonly LearningVideo[];
}

const LIFECYCLE_TOPIC_GUIDES = [
  { id: 'what-is-emos', title: 'What is EMOS?', duration: '1:30', summary: 'Overview of the vendor-neutral Enterprise Modernization Operating System.', videoSeq: '00', transcript: 'EMOS connects fragmented estate evidence, deterministic readiness scoring, governed 6R decisions, wave planning, execution tracking, and outcome measurement in one operating system.' },
  { id: 'product-vision', title: 'Product Vision', duration: '1:45', summary: 'How EMOS governs the full Strategy → Discover → DNA → Decide → Execute → Measure → Learn loop.', videoSeq: '00', transcript: 'Rather than stopping at static assessment decks, EMOS treats the 6R disposition as a routing decision into governed execution, benefit realization, and continuous learning.' },
  { id: 'getting-started', title: 'Getting Started', duration: '1:15', summary: 'Choose Apex Aerospace, Financial Services, or upload your own CSV/JSON portfolio.', videoSeq: 'F01', transcript: 'Start immediately with the 10,000+ asset Apex Aerospace estate, the Financial Services estate, or upload a sanitized CSV/JSON inventory.' },
  { id: 'portfolio-upload', title: 'Portfolio Upload', duration: '1:30', summary: 'How EMOS validates CSV/JSON facts and summarizes what it understood before showing tables.', videoSeq: 'F13', transcript: 'EMOS checks required schema keys, neutralizes spreadsheet formula injection, and displays Systems Discovered, Business Capabilities, Completeness, Ready count, and Missing Evidence.' },
  { id: 'enterprise-dna', title: 'Enterprise DNA', duration: '1:40', summary: '18 attributes across 6 dimensions in 2D list and interactive Spatial Relationship views.', videoSeq: 'F11', transcript: 'Enterprise DNA structures Business, Technology, Dependency, Economics, Data & Risk, and Target-State evidence and lets you verify high-value attributes.' },
  { id: 'modernization-agent', title: 'Modernization Agent', duration: '1:50', summary: 'How one governed Modernization Agent investigates evidence and answers contextual questions.', videoSeq: 'F03', transcript: 'The Modernization Agent inspects DNA, evaluates the readiness gate, compares all 6 dispositions, and returns 1 concise conclusion, up to 3 bullets, and 1 next action.' },
  { id: '6r-overview', title: '6R Overview', duration: '1:35', summary: 'Plain-English actions mapped to Retain, Retire, Rehost, Replatform, Refactor, and Repurchase.', videoSeq: 'F18', transcript: 'Every recommendation is presented in plain English first—Keep it as-is, Safely shut it down, Move it largely unchanged, Move it to a better platform, Redesign parts of it, or Replace it.' },
  { id: 'retain', title: 'Retain (Keep it as-is)', duration: '1:20', summary: 'Keep → Optimize → Monitor → Review Outcome → Learn workflow for hardware-bound or stable systems.', videoSeq: 'F08', transcript: 'Retain protects mission-critical shop-floor MES and vault systems where migration introduces latency risk or negative ROI.' },
  { id: 'retire', title: 'Retire (Safely shut it down)', duration: '1:30', summary: 'Approve → Consumer Transition → Archive → Decommission → Validate Closure → Measure Savings → Learn.', videoSeq: 'F04', transcript: 'Retire verifies downstream consumers are transitioned and historical archives are secured before shutting down redundant servers.' },
  { id: 'rehost', title: 'Rehost (Move it largely unchanged)', duration: '1:25', summary: 'Approve → Prepare Destination → Move → Validate → Cutover → Stabilize → Measure → Learn.', videoSeq: 'F03', transcript: 'Rehost accelerates data-center and colocation exits for modern Linux/VM workloads without risky code rewrites.' },
  { id: 'replatform', title: 'Replatform (Move it to a better platform)', duration: '1:45', summary: 'Approve → Prepare Target Platform → Transform/Migrate → Validate → Cutover → Optimize → Measure → Learn.', videoSeq: 'F04', transcript: 'Replatform shifts legacy data warehouses and databases to managed cloud platforms like Google Cloud BigQuery once target-state evidence is verified.' },
  { id: 'refactor', title: 'Refactor (Redesign parts of it)', duration: '1:40', summary: 'Approve → Redesign/Decompose → Implement → Test → Transition → Stabilize → Measure → Learn.', videoSeq: 'F05', transcript: 'Refactor decomposes high-criticality monoliths into cloud-native and event-driven services with strangler-fig safety gates.' },
  { id: 'repurchase', title: 'Repurchase (Replace it with another product)', duration: '1:25', summary: 'Approve → Select Replacement → Configure → Migrate Data/Users → Transition → Retire Previous → Measure → Learn.', videoSeq: 'F04', transcript: 'Repurchase replaces high-maintenance custom commodity tools with compliant commercial SaaS platforms.' },
  { id: 'governance', title: 'Governance', duration: '1:30', summary: 'Agent Recommends → EMOS Validates → Human Approves → Action Proceeds.', videoSeq: 'F06', transcript: 'Model confidence cannot override the deterministic 70% completeness and zero-critical-gap readiness gate.' },
  { id: 'execution', title: 'Execution', duration: '1:40', summary: 'Track disposition-specific transformation stages, active blockers, and checkpoint gates.', videoSeq: 'F19', transcript: 'The Execution Workspace highlights the current transformation phase, surfaces blockers, and recedes completed milestones.' },
  { id: 'outcomes-learning', title: 'Outcomes & Learning', duration: '1:45', summary: 'Compare Baseline vs. Target vs. Observed metrics and record lessons for future waves.', videoSeq: 'F19', transcript: 'Measure compares expected and observed results, while Learn captures assumption variances into the governance playbook.' },
] as const;

type CategoryFilter = 'All Categories' | LearningCategory;

export const LearningCenterPage: React.FC<LearningCenterPageProps> = ({
  user = null,
  onNavigate,
  videos = LEARNING_VIDEOS,
}) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('All Categories');
  const [selectedVideo, setSelectedVideo] = useState<LearningVideo | null>(null);
  const [activeTranscriptId, setActiveTranscriptId] = useState<string | null>(null);
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
      <header className="sticky top-0 z-30 border-b border-[var(--emos-border-subtle)] bg-[var(--emos-surface)]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[88rem] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <a
            href="/"
            onClick={navigate('/')}
            className="group flex min-w-0 items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--emos-accent)]"
            aria-label="Return to EMOS home"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#4648D4] text-white shadow-xs transition-colors">
              <Sparkles className="h-4 w-4 text-white" aria-hidden="true" />
            </span>
            <span className="truncate font-display text-base font-bold tracking-tight">EMOS</span>
            <span className="hidden rounded-full border border-[var(--emos-accent-border)] bg-[var(--emos-accent-subtle)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--emos-accent-text)] sm:inline">
              Learning Center
            </span>
          </a>

          <div className="flex items-center gap-2">
            {user && (
              <span className="hidden md:inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                Signed in as {user.displayName || user.email}
              </span>
            )}
            <a
              href="/workspace"
              onClick={navigate('/workspace')}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-[#4648D4] hover:bg-[#3B3DC2] px-3.5 text-xs font-semibold text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--emos-accent)]"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Back to Workspace</span>
            </a>
            <a
              href="/"
              onClick={navigate('/')}
              className="hidden min-h-9 items-center gap-1.5 rounded-lg border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] px-3 text-xs font-semibold text-[var(--emos-text-secondary)] transition-colors hover:text-[var(--emos-text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--emos-accent)] sm:inline-flex"
            >
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
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    const introVideo = videos.find((v) => v.sequence === '00') || videos[0];
                    if (introVideo?.driveFileId) {
                      openVideo(introVideo, e.currentTarget);
                    }
                  }}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#4648D4] hover:bg-[#3B3DC2] px-5 text-sm font-semibold text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--emos-accent)] cursor-pointer"
                >
                  <Play className="h-4 w-4" aria-hidden="true" />
                  <span>Start Guided Journey</span>
                </button>
                <a
                  href="#catalogue"
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] hover:bg-[var(--emos-surface-hover)] px-4 text-sm font-semibold text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)] transition-colors"
                >
                  Browse All 20 Lessons
                </a>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Task / Role-Based Learning Paths aligned to Canonical 4-Stage EMOS Model */}
        <section aria-label="Task and role-based learning paths" className="mx-auto max-w-[88rem] px-4 pt-10 sm:px-6 lg:px-8">
          <div className="mb-4">
            <p className="text-[11px] font-mono font-semibold uppercase tracking-[0.12em] text-[var(--emos-accent-text)]">
              Task &amp; Role-Based Learning
            </p>
            <h2 className="mt-1 font-display text-xl font-bold text-[var(--emos-text-primary)]">
              Learn by Modernization Stage
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {[
              {
                stage: '01 · Understand',
                role: 'Leaders & Architects',
                desc: 'Explore portfolios, upload CSV/JSON inventories, and inspect Enterprise DNA.',
                seq: 'F10',
              },
              {
                stage: '02 · Decide',
                role: 'Solution Architects',
                desc: 'Verify evidence gates, compare all 6Rs, and govern human approval.',
                seq: 'F03',
              },
              {
                stage: '03 · Transform',
                role: 'Program & Platform Teams',
                desc: 'Sequence waves, clear mobilization gates, and track execution stages.',
                seq: 'F19',
              },
              {
                stage: '04 · Outcomes',
                role: 'Executives & Delivery Leads',
                desc: 'Measure Baseline vs. Target vs. Observed impact and capture wave lessons.',
                seq: 'F04',
              },
            ].map((path) => {
              const targetVideo = videos.find((v) => v.sequence === path.seq) || videos[0];
              return (
                <div
                  key={path.stage}
                  className="stitch-card p-4 flex flex-col justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-[var(--emos-text-muted)]">
                      <span className="font-bold text-[var(--emos-accent-text)] uppercase">{path.stage}</span>
                      <span>{path.role}</span>
                    </div>
                    <p className="text-xs text-[var(--emos-text-secondary)] leading-relaxed">{path.desc}</p>
                  </div>
                  {targetVideo?.driveFileId && (
                    <button
                      type="button"
                      onClick={(e) => openVideo(targetVideo, e.currentTarget)}
                      className="self-start inline-flex items-center gap-1.5 text-xs font-semibold text-[#4648D4] dark:text-[#818CF8] hover:underline cursor-pointer"
                    >
                      <Play className="w-3 h-3" />
                      <span>Watch {path.seq} Lesson</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
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
                            <details className="mt-auto text-[11px] text-[var(--emos-text-muted)]">
                              <summary className="cursor-pointer font-medium hover:text-[var(--emos-text-secondary)]">
                                Reference metadata
                              </summary>
                              <code className="mt-1.5 block break-all rounded-md border border-[var(--emos-code-border)] bg-[var(--emos-code-bg)] px-2.5 py-1.5 text-[11px] text-[var(--emos-text-muted)]">
                                File: {video.fileName}
                              </code>
                            </details>
                            {video.driveFileId ? (
                              <button
                                type="button"
                                onClick={(event) => openVideo(video, event.currentTarget)}
                                aria-label={`Play ${video.sequence}: ${video.title} in EMOS`}
                                className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-[#4648D4] hover:bg-[#3B3DC2] px-4 text-xs font-semibold text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--emos-accent)] cursor-pointer"
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

        <section aria-label="90-Second Capability and 6R Topic Guides" className="mx-auto max-w-[88rem] px-4 pb-12 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-[var(--emos-border-strong)] bg-[var(--emos-surface)] p-6 space-y-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--emos-accent-text)]">
                90-Second Capability &amp; 6R Topic Guides
              </p>
              <h2 className="mt-1 font-serif text-2xl font-bold">
                Full Lifecycle &amp; 6R Reference (With Captions &amp; Transcripts)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {LIFECYCLE_TOPIC_GUIDES.map((guide) => {
                const matchedVideo = videos.find((v) => v.sequence === guide.videoSeq) || videos[0];
                const isTranscriptOpen = activeTranscriptId === guide.id;
                return (
                  <div
                    key={guide.id}
                    className="rounded-2xl border border-[var(--emos-border-subtle)] bg-[var(--emos-bg-secondary)] p-4 flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-mono text-[var(--emos-text-muted)]">
                        <span className="px-2 py-0.5 rounded bg-[var(--emos-accent-subtle)] text-[var(--emos-accent-text)] font-bold">
                          CC · Captions
                        </span>
                        <span>{guide.duration}</span>
                      </div>
                      <h3 className="text-sm font-bold text-[var(--emos-text-primary)]">{guide.title}</h3>
                      <p className="text-xs text-[var(--emos-text-secondary)] leading-relaxed">{guide.summary}</p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-[var(--emos-border-subtle)]">
                      <div className="flex items-center justify-between gap-2">
                        {matchedVideo?.driveFileId && (
                          <button
                            type="button"
                            onClick={(e) => openVideo(matchedVideo, e.currentTarget)}
                            className="px-2.5 py-1 rounded-lg bg-[#4648D4] hover:bg-[#3B3DC2] text-white text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Play className="w-3 h-3" />
                            <span>Watch</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setActiveTranscriptId(isTranscriptOpen ? null : guide.id)}
                          aria-expanded={isTranscriptOpen}
                          className="px-2.5 py-1 rounded-lg border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] text-[11px] font-semibold text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)] cursor-pointer"
                        >
                          {isTranscriptOpen ? 'Hide Transcript' : 'Transcript'}
                        </button>
                      </div>

                      {isTranscriptOpen && (
                        <p className="p-2.5 rounded-xl bg-[var(--emos-surface)] border border-[var(--emos-border-subtle)] text-[11px] text-[var(--emos-text-secondary)] leading-relaxed">
                          {guide.transcript}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
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
