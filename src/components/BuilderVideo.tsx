import React, { useEffect, useRef, useState } from 'react';

const base = '/assets/emos/emos-why-exists';

export function BuilderVideo() {
  const video = useRef<HTMLVideoElement>(null);
  const [alternate, setAlternate] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!waiting) return;
    const timer = window.setTimeout(() => {
      setMessage('Playback is taking longer than expected. Try the other format or open the MP4 directly.');
    }, 10000);
    return () => window.clearTimeout(timer);
  }, [waiting]);

  const playWithSound = async () => {
    const player = video.current;
    if (!player) return;
    player.muted = false;
    if (player.volume === 0) player.volume = 1;
    setMessage('');
    setWaiting(true);
    try {
      await player.play();
    } catch {
      setWaiting(false);
      setMessage('Playback could not start. Try the other format or open the MP4 directly.');
    }
  };

  const clearWaiting = () => { setWaiting(false); setMessage(''); };

  return <div>
    <div className="overflow-hidden rounded-3xl border border-[var(--emos-border-strong)] bg-[var(--emos-surface)] shadow-xl">
      <video key={String(alternate)} ref={video} className="aspect-video w-full bg-[var(--emos-bg-tertiary)]"
        controls playsInline preload="none" poster={`${base}-poster.webp`}
        aria-label="Why EMOS exists narrated video"
        onWaiting={() => setWaiting(true)} onStalled={() => setWaiting(true)}
        onPlaying={clearWaiting} onTimeUpdate={clearWaiting} onPause={() => setWaiting(false)}
        onEnded={() => setWaiting(false)}
        onError={() => { setWaiting(false); setMessage('This format could not play. Try the other format or open the MP4 directly.'); }}>
        {/* H.264/AAC first; retain WebM as a fallback and an explicit recovery option. */}
        <source src={`${base}.${alternate ? 'webm' : 'mp4'}`} type={alternate ? 'video/webm' : 'video/mp4'} />
        <source src={`${base}.${alternate ? 'mp4' : 'webm'}`} type={alternate ? 'video/mp4' : 'video/webm'} />
        <track kind="captions" src="/assets/emos/emos-why-captions.en.vtt" srcLang="en" label="English" default />
        Your browser does not support the video tag.
      </video>
    </div>
    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
      <button type="button" onClick={playWithSound} className="rounded-lg border border-[var(--emos-border-strong)] px-4 py-2 text-[var(--emos-accent-text)]">Play with sound</button>
      <a href={`${base}.mp4`} target="_blank" rel="noreferrer" className="underline underline-offset-4">Open MP4 video</a>
    </div>
    {message && <div className="mt-3 text-sm" role="status">
      <p>{message}</p>
      <button type="button" className="mt-2 underline underline-offset-4" onClick={() => {
        setAlternate(value => !value); setWaiting(false); setMessage('');
      }}>Try other format</button>
    </div>}
  </div>;
}
