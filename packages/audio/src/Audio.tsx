import { useRef, useEffect, useCallback } from "react";
import { useCurrentFrame, useVideoConfig, useTimelineContext } from "@vibeo/core";
import { useMediaSync } from "./hooks/use-media-sync.js";
import { useMediaInTimeline } from "./hooks/use-media-in-timeline.js";
import type { MediaProps } from "./types.js";

export function Audio({
  src,
  volume = 1,
  playbackRate = 1,
  startFrom = 0,
  endAt,
  muted = false,
  loop = false,
}: MediaProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { playing } = useTimelineContext();

  const { isInRange } = useMediaInTimeline({
    startFrom,
    endAt,
    playbackRate,
    volume,
    mediaVolume: 1,
    totalMediaDurationInFrames: durationInFrames,
  });

  useMediaSync({
    mediaRef: audioRef,
    playbackRate,
    startFrom,
    muted,
    playing,
  });

  const onLoadedData = useCallback(() => {
    // Media is ready
  }, []);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.loop = loop;
  }, [loop]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || muted) return;

    const vol = typeof volume === "function" ? volume(frame) : volume;
    el.volume = Math.max(0, Math.min(1, vol));
  }, [frame, volume, muted]);

  if (!isInRange) {
    return null;
  }

  return (
    <audio
      ref={audioRef}
      src={src}
      preload="auto"
      onLoadedData={onLoadedData}
    />
  );
}
