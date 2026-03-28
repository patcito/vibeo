import React from "react";
import { Sequence } from "@vibeo/core";
import { Audio } from "@vibeo/audio";
import { useAudioData } from "@vibeo/effects";
import type { TrackProps, AudioMixProps } from "./types.js";

/**
 * Compute a crossfade volume curve.
 * Returns a value from 0 to 1 that fades in over durationInFrames starting at startFrame.
 */
export function crossfadeVolume(
  frame: number,
  startFrame: number,
  durationInFrames: number,
): number {
  if (durationInFrames <= 0) return 1;
  const progress = (frame - startFrame) / durationInFrames;
  return Math.max(0, Math.min(1, progress));
}

/**
 * Wrapper component for declarative audio mixing.
 * Renders child <Track> components.
 */
export function AudioMix({ children }: AudioMixProps): React.ReactNode {
  return <>{children}</>;
}

/** Amplitude threshold below which a track is considered silent. */
const DUCK_SILENCE_THRESHOLD = 0.01;

/**
 * Individual audio track within an <AudioMix>.
 *
 * Supports static volume, per-frame volume curves, delayed start,
 * and automatic ducking when another track is playing.
 *
 * `startAt` delays when the track begins in the composition — the audio
 * media always plays from time 0 (not trimmed).
 *
 * Ducking uses real per-frame amplitude analysis of the duckWhen source
 * to determine when to lower volume.
 */
export function Track({
  src,
  volume = 1,
  pan: _pan = 0,
  startAt = 0,
  duckWhen,
  duckAmount = 0.7,
}: TrackProps): React.ReactNode {
  // Analyze ducking source for real per-frame activity.
  // Hook must be called unconditionally; when duckWhen is not set we
  // analyze our own src (result is unused but keeps hook call order stable).
  const duckAnalysis = useAudioData(duckWhen ?? src);

  // Compute effective volume.
  // `f` is the Sequence-relative frame (0-based from startAt).
  // Translate back to composition frame for the user's volume callback.
  const computeVolume = (f: number): number => {
    const compositionFrame = f + startAt;
    let vol: number;
    if (typeof volume === "function") {
      vol = volume(compositionFrame);
    } else {
      vol = volume;
    }

    // Apply ducking only when the duck-when source has real audio activity
    if (
      duckWhen &&
      duckAnalysis &&
      duckAnalysis.amplitude > DUCK_SILENCE_THRESHOLD
    ) {
      vol *= 1 - duckAmount;
    }

    return Math.max(0, Math.min(1, vol));
  };

  // Wrap Audio in a Sequence so that useCurrentFrame() inside Audio returns 0
  // at startAt. This makes getMediaTime compute media time from the beginning
  // of the audio file, rather than from the absolute composition frame.
  return (
    <Sequence from={startAt} layout="none">
      <Audio src={src} volume={computeVolume} />
    </Sequence>
  );
}
