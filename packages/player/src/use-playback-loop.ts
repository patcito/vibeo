import { useRef, useCallback, useEffect } from "react";
import { calculateNextFrame } from "./calculate-next-frame.js";

interface UsePlaybackLoopOptions {
  playing: boolean;
  fps: number;
  playbackSpeed: number;
  actualFirstFrame: number;
  actualLastFrame: number;
  shouldLoop: boolean;
  getCurrentFrame: () => number;
  onFrameUpdate: (frame: number) => void;
  onEnded: () => void;
}

export function usePlaybackLoop({
  playing,
  fps,
  playbackSpeed,
  actualFirstFrame,
  actualLastFrame,
  shouldLoop,
  getCurrentFrame,
  onFrameUpdate,
  onEnded,
}: UsePlaybackLoopOptions): void {
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const framesAdvancedRef = useRef<number>(0);
  const startFrameRef = useRef<number>(0);

  const tick = useCallback(
    (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
        startFrameRef.current = getCurrentFrame();
        framesAdvancedRef.current = 0;
      }

      const elapsed = timestamp - startTimeRef.current;
      const { nextFrame, framesToAdvance, hasEnded } = calculateNextFrame({
        time: elapsed,
        currentFrame: startFrameRef.current,
        playbackSpeed,
        fps,
        actualFirstFrame,
        actualLastFrame,
        framesAdvanced: framesAdvancedRef.current,
        shouldLoop,
      });

      if (framesToAdvance !== 0) {
        framesAdvancedRef.current += framesToAdvance;
        onFrameUpdate(nextFrame);
      }

      if (hasEnded) {
        onEnded();
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    },
    [
      fps,
      playbackSpeed,
      actualFirstFrame,
      actualLastFrame,
      shouldLoop,
      getCurrentFrame,
      onFrameUpdate,
      onEnded,
    ],
  );

  useEffect(() => {
    if (playing) {
      startTimeRef.current = 0;
      framesAdvancedRef.current = 0;
      rafRef.current = requestAnimationFrame(tick);
    } else {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    }

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [playing, tick]);
}
