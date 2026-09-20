import React, { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';

const ASSET_ROOT = '/assets/emos';
const CONCEPT_NOTICE = 'Product concept visuals using synthetic enterprise data.';
const PRODUCTION_CAPTURE_NOTICE = 'Captured from the live EMOS public evaluation sandbox using synthetic enterprise data.';

type NetworkInformationLike = {
  effectiveType?: string;
  saveData?: boolean;
  addEventListener?: (type: 'change', listener: () => void) => void;
  removeEventListener?: (type: 'change', listener: () => void) => void;
};

const POSTER = `${ASSET_ROOT}/emos-product-hero-production-v2-performance.webp`;
const POSTER_PNG_FALLBACK = `${ASSET_ROOT}/emos-product-hero-production-v2.png`;
const WALKTHROUGH = `${ASSET_ROOT}/emos-product-demo-v2-performance.mp4`;

export function hasConstrainedNetwork(connection: NetworkInformationLike | undefined): boolean {
  return Boolean(connection?.saveData || connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g');
}

function getConnection() {
  return (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
}

export function EmosHeroVisual() {
  const reduceMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [playbackRequested, setPlaybackRequested] = useState(false);
  const [inViewport, setInViewport] = useState(true);
  const [constrainedNetwork, setConstrainedNetwork] = useState(() => hasConstrainedNetwork(getConnection()));
  const [smallViewport, setSmallViewport] = useState(() => window.matchMedia?.('(max-width: 639px)').matches ?? false);
  const motionAllowed = reduceMotion === false;
  const canAutoplay = motionAllowed && !constrainedNetwork && !smallViewport;

  useEffect(() => {
    const connection = getConnection();
    const updateConnection = () => setConstrainedNetwork(hasConstrainedNetwork(connection));
    connection?.addEventListener?.('change', updateConnection);
    return () => connection?.removeEventListener?.('change', updateConnection);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia?.('(max-width: 639px)');
    if (!mediaQuery) return undefined;
    const updateViewport = () => setSmallViewport(mediaQuery.matches);
    updateViewport();
    mediaQuery.addEventListener?.('change', updateViewport);
    return () => mediaQuery.removeEventListener?.('change', updateViewport);
  }, []);

  useEffect(() => {
    if (!canAutoplay || videoFailed) return undefined;
    const timer = window.setTimeout(() => {
      setShouldLoadVideo(true);
      setPlaybackRequested(true);
    }, 800);
    return () => window.clearTimeout(timer);
  }, [canAutoplay, videoFailed]);

  useEffect(() => {
    const element = visualRef.current;
    if (!element) return undefined;
    const updateViewportVisibility = () => {
      const rect = element.getBoundingClientRect();
      setInViewport(rect.bottom > 0 && rect.top < window.innerHeight);
    };
    updateViewportVisibility();
    window.addEventListener('scroll', updateViewportVisibility, { passive: true });
    window.addEventListener('resize', updateViewportVisibility);
    const observer = 'IntersectionObserver' in window
      ? new IntersectionObserver(([entry]) => setInViewport(entry.isIntersecting), { threshold: 0.1 })
      : undefined;
    observer?.observe(element);
    return () => {
      window.removeEventListener('scroll', updateViewportVisibility);
      window.removeEventListener('resize', updateViewportVisibility);
      observer?.disconnect();
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || videoFailed) return;
    if (playbackRequested && inViewport) {
      void video.play().then(() => setVideoReady(true)).catch(() => setVideoFailed(true));
      return;
    }
    video.pause();
  }, [inViewport, playbackRequested, shouldLoadVideo, videoFailed]);

  const togglePlayback = () => {
    if (videoFailed) {
      setVideoFailed(false);
      setVideoReady(false);
    }
    setShouldLoadVideo(true);
    setPlaybackRequested((requested) => !requested || videoFailed);
  };

  const showPlaybackControl = motionAllowed;

  return (
    <figure className="relative overflow-hidden rounded-[2rem] border border-[var(--emos-border-strong)] bg-[var(--emos-surface)] p-3 shadow-2xl shadow-black/15">
      <div ref={visualRef} className="relative overflow-hidden rounded-[1.45rem] bg-[#0b1220]">
        <picture>
          <source srcSet={POSTER} type="image/webp" />
          <img
            src={POSTER_PNG_FALLBACK}
            alt="Live EMOS evaluation sandbox showing an evidence-led modernization decision."
            width={1920}
            height={1080}
            fetchPriority="high"
            className="block h-auto w-full"
          />
        </picture>
        {shouldLoadVideo && !videoFailed && (
          <video
            ref={videoRef}
            data-testid="emos-hero-video"
            className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-300 ${videoReady ? 'opacity-100' : 'opacity-0'}`}
            src={WALKTHROUGH}
            poster={POSTER_PNG_FALLBACK}
            aria-label="Silent walkthrough of the live EMOS public evaluation sandbox"
            aria-describedby="emos-hero-concept-caption"
            muted
            loop
            playsInline
            preload="metadata"
            onCanPlay={() => setVideoReady(true)}
            onError={() => {
              setVideoFailed(true);
              setVideoReady(false);
              setPlaybackRequested(false);
            }}
          />
        )}
        {showPlaybackControl && (
          <button
            type="button"
            onClick={togglePlayback}
            aria-pressed={playbackRequested && !videoFailed}
            aria-describedby="emos-hero-concept-caption"
            className="absolute bottom-4 right-4 min-h-11 rounded-full border border-white/25 bg-[#0b1220]/90 px-4 text-sm font-semibold text-white shadow-lg backdrop-blur transition hover:bg-[#17223a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {playbackRequested && !videoFailed ? 'Pause walkthrough' : 'Play walkthrough'}
          </button>
        )}
      </div>
      <figcaption id="emos-hero-concept-caption" className="px-2 pb-2 pt-4 text-xs leading-5 text-[var(--emos-text-muted)]">
        {PRODUCTION_CAPTURE_NOTICE} The walkthrough shows evidence quality, alternatives and the human decision gate. {reduceMotion === true ? 'Motion is disabled for your reduced-motion preference.' : constrainedNetwork ? 'Playback is held to respect your data-saving or slow-network preference.' : smallViewport ? 'On smaller screens, playback starts only when you request it.' : 'The silent walkthrough starts after the page is usable and pauses when it leaves view.'}
      </figcaption>
    </figure>
  );
}

export function EmosProductVisuals() {
  return (
    <div className="mt-10 border-t border-[var(--emos-border-subtle)] pt-8">
      <h3 className="font-serif text-2xl font-semibold">Platform Preview</h3>
      <p className="mt-2 text-sm leading-6 text-[var(--emos-text-muted)]">
        {CONCEPT_NOTICE} These illustrate the product vision; the interactive scenario above demonstrates current beta behavior.
      </p>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {[
          { title: 'EMOS Command Center', file: 'emos-command-center-dashboard-v1.png', description: 'Portfolio overview concept with evidence quality, decision readiness and modernization planning.' },
          { title: 'Enterprise DNA', file: 'emos-enterprise-dna-v1.png', description: 'Workload concept showing Legacy Order Management dependencies, evidence gaps and readiness.' },
        ].map(({ title, file, description }) => (
          <figure key={file} className="overflow-hidden rounded-2xl border border-[var(--emos-border-strong)] bg-[var(--emos-surface)]">
            <img src={`${ASSET_ROOT}/${file}`} alt={description} width={1376} height={768} loading="lazy" decoding="async" className="block h-auto w-full" />
            <figcaption className="p-5">
              <p className="font-serif text-xl font-semibold">{title}</p>
              <p className="mt-2 text-xs leading-5 text-[var(--emos-text-muted)]">{description}</p>
              <a href={`${ASSET_ROOT}/${file}`} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-semibold text-[var(--emos-accent-text)] underline underline-offset-4">View {title} visual</a>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
