import { useMemo } from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  calculateMediaDuration,
  useSequenceContext,
} from "@vibeo/core";
import { buildVolumeArray } from "../volume.js";
import type { VolumeFunction } from "../types.js";

export interface MediaTimelineInfo {
  durationInFrames: number;
  startFrame: number;
  volumes: number[];
  isInRange: boolean;
}

export interface UseMediaInTimelineOptions {
  startFrom: number;
  endAt: number | undefined;
  playbackRate: number;
  volume: number | VolumeFunction;
  mediaVolume: number;
  totalMediaDurationInFrames: number;
}

export function useMediaInTimeline({
  startFrom,
  endAt,
  playbackRate,
  volume,
  mediaVolume,
  totalMediaDurationInFrames,
}: UseMediaInTimelineOptions): MediaTimelineInfo {
  const frame = useCurrentFrame();
  const { fps, durationInFrames: compositionDuration } = useVideoConfig();
  const sequenceContext = useSequenceContext();

  const startFrame = sequenceContext
    ? sequenceContext.cumulatedFrom + sequenceContext.relativeFrom
    : 0;

  const durationInFrames = useMemo(
    () =>
      calculateMediaDuration(
        endAt ?? totalMediaDurationInFrames,
        playbackRate,
        startFrom,
      ),
    [endAt, totalMediaDurationInFrames, playbackRate, startFrom],
  );

  const effectiveDuration = Math.min(
    durationInFrames,
    compositionDuration - startFrame,
  );

  const volumes = useMemo(
    () => buildVolumeArray(effectiveDuration, startFrame, volume, mediaVolume),
    [effectiveDuration, startFrame, volume, mediaVolume],
  );

  const isInRange = frame >= 0 && frame < effectiveDuration;

  return { durationInFrames: effectiveDuration, startFrame, volumes, isInRange };
}
