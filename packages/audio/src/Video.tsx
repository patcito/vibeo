import { useRef, useEffect, useCallback, type CSSProperties } from "react";
import { useCurrentFrame, useVideoConfig, useTimelineContext } from "@vibeo/core";
import { useMediaSync } from "./hooks/use-media-sync.js";
import { useMediaInTimeline } from "./hooks/use-media-in-timeline.js";
import type { MediaProps } from "./types.js";

export interface VideoProps extends MediaProps {
  style?: CSSProperties;
  className?: string;
}

export function Video({
  src,
  volume = 1,
  playbackRate = 1,
  startFrom = 0,
  endAt,
  muted = false,
  loop = false,
  style,
  className,
}: VideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
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
    mediaRef: videoRef,
    playbackRate,
    startFrom,
    muted,
    playing,
  });

  const onLoadedData = useCallback(() => {
    // Media loaded, poster frame is available
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.loop = loop;
  }, [loop]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || muted) return;

    const vol = typeof volume === "function" ? volume(frame) : volume;
    el.volume = Math.max(0, Math.min(1, vol));
  }, [frame, volume, muted]);

  if (!isInRange) {
    return null;
  }

  return (
    <video
      ref={videoRef}
      src={src}
      preload="auto"
      onLoadedData={onLoadedData}
      style={style}
      className={className}
    />
  );
}
