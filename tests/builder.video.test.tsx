// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { BuilderVideo } from '../src/components/BuilderVideo';

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.useRealTimers(); });

it('uses MP4 first with captions, controls, a poster and no autoplay', () => {
  render(<BuilderVideo />);
  const video = screen.getByLabelText('Why EMOS exists narrated video');
  expect(video.querySelector('source')).toHaveAttribute('type', 'video/mp4');
  expect(video).toHaveAttribute('controls');
  expect(video).toHaveAttribute('playsinline');
  expect(video).toHaveAttribute('preload', 'none');
  expect(video).not.toHaveAttribute('autoplay');
  expect(video).not.toHaveAttribute('muted');
  expect(video.querySelector('track')).toHaveAttribute('default');
});

it('explicitly unmutes only when the visitor requests sound', async () => {
  const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
  render(<BuilderVideo />);
  const video = screen.getByLabelText('Why EMOS exists narrated video') as HTMLVideoElement;
  video.muted = true; video.volume = 0;
  await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Play with sound' })));
  expect(play).toHaveBeenCalledOnce();
  expect(video.muted).toBe(false); expect(video.volume).toBe(1);
});

it('offers a fresh alternate-format player after a media error', () => {
  render(<BuilderVideo />);
  fireEvent.error(screen.getByLabelText('Why EMOS exists narrated video'));
  expect(screen.getByRole('status')).toHaveTextContent('could not play');
  fireEvent.click(screen.getByRole('button', { name: 'Try other format' }));
  expect(screen.getByLabelText('Why EMOS exists narrated video').querySelector('source')).toHaveAttribute('type', 'video/webm');
  expect(screen.getByRole('link', { name: 'Open MP4 video' })).toHaveAttribute('href', '/assets/emos/emos-why-exists.mp4');
});

it('offers recovery for prolonged buffering and clears it when playback resumes', () => {
  vi.useFakeTimers(); render(<BuilderVideo />);
  const video = screen.getByLabelText('Why EMOS exists narrated video');
  fireEvent.waiting(video);
  act(() => vi.advanceTimersByTime(10000));
  expect(screen.getByRole('status')).toHaveTextContent('longer than expected');
  fireEvent.playing(video);
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});

it('handles rejected play requests without an unhandled promise', async () => {
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockRejectedValue(new Error('not supported'));
  render(<BuilderVideo />);
  await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Play with sound' })));
  expect(screen.getByRole('status')).toHaveTextContent('could not start');
});
