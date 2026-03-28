import { useEffect } from "react";
import { useCurrentFrame, useVideoConfig, getMediaTime, msPerFrame } from "@vibeo/core";

export interface UseMediaSyncOptions {
  mediaRef: React.RefObject<HTMLMediaElement | null>;
  playbackRate: number;
  startFrom: number;
  muted: boolean;
  playing: boolean;
}

export function useMediaSync({
  mediaRef,
  playbackRate,
  startFrom,
  muted,
  playing,
}: UseMediaSyncOptions): void {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  useEffect(() => {
    const el = mediaRef.current;
    if (!el) return;

    el.muted = muted;
    el.playbackRate = playbackRate;

    const expectedTime = getMediaTime(frame, fps, playbackRate, startFrom);
    const currentTime = el.currentTime;
    const threshold = (0.3 * msPerFrame(fps)) / 1000;

    // Only seek when drift exceeds threshold — avoid resetting currentTime every frame
    if (Math.abs(currentTime - expectedTime) > threshold) {
      el.currentTime = expectedTime;
    }

    if (playing && el.paused) {
      void el.play();
    } else if (!playing && !el.paused) {
      el.pause();
    }
  }, [frame, fps, playbackRate, startFrom, muted, playing, mediaRef]);
}
