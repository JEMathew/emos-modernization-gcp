import React, { useState } from 'react';
import { useReducedMotion } from 'motion/react';

const ASSET_ROOT = '/assets/emos';
const CONCEPT_NOTICE = 'Product concept visuals using synthetic enterprise data.';
const PRODUCTION_CAPTURE_NOTICE = 'Captured from the live EMOS public evaluation sandbox using synthetic enterprise data.';

export function EmosHeroVisual() {
  const reduceMotion = useReducedMotion();
  const [videoFailed, setVideoFailed] = useState(false);

  return (
    <figure className="relative overflow-hidden rounded-[2rem] border border-[var(--emos-border-strong)] bg-[var(--emos-surface)] p-3 shadow-2xl shadow-black/15">
      <div className="relative overflow-hidden rounded-[1.45rem] bg-[#0b1220]">
        <img
          src={`${ASSET_ROOT}/emos-product-hero-production-v2.png`}
          alt="Live EMOS evaluation sandbox showing an evidence-led modernization decision."
          width={1920}
          height={1080}
          fetchPriority="high"
          className="block h-auto w-full"
        />
        {reduceMotion === false && !videoFailed && (
          <video
            className="absolute inset-0 h-full w-full object-contain"
            src={`${ASSET_ROOT}/emos-product-demo-v2.mp4`}
            poster={`${ASSET_ROOT}/emos-product-hero-production-v2.png`}
            aria-label="Silent walkthrough of the live EMOS public evaluation sandbox"
            aria-describedby="emos-hero-concept-caption"
            autoPlay
            muted
            loop
            playsInline
            controls
            preload="none"
            onError={() => setVideoFailed(true)}
          />
        )}
      </div>
      <figcaption id="emos-hero-concept-caption" className="px-2 pb-2 pt-4 text-xs leading-5 text-[var(--emos-text-muted)]">
        {PRODUCTION_CAPTURE_NOTICE} The walkthrough shows evidence quality, alternatives and the human decision gate.
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
