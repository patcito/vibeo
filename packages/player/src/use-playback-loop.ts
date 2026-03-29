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

  // Store callbacks in refs so the RAF loop never needs to restart
  const getCurrentFrameRef = useRef(getCurrentFrame);
  getCurrentFrameRef.current = getCurrentFrame;
  const onFrameUpdateRef = useRef(onFrameUpdate);
  onFrameUpdateRef.current = onFrameUpdate;
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;
  const fpsRef = useRef(fps);
  fpsRef.current = fps;
  const speedRef = useRef(playbackSpeed);
  speedRef.current = playbackSpeed;
  const firstRef = useRef(actualFirstFrame);
  firstRef.current = actualFirstFrame;
  const lastRef = useRef(actualLastFrame);
  lastRef.current = actualLastFrame;
  const loopRef = useRef(shouldLoop);
  loopRef.current = shouldLoop;

  useEffect(() => {
    if (!playing) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    startTimeRef.current = 0;
    framesAdvancedRef.current = 0;

    const tick = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
        startFrameRef.current = getCurrentFrameRef.current();
        framesAdvancedRef.current = 0;
      }

      const elapsed = timestamp - startTimeRef.current;
      const { nextFrame, framesToAdvance, hasEnded } = calculateNextFrame({
        time: elapsed,
        currentFrame: startFrameRef.current,
        playbackSpeed: speedRef.current,
        fps: fpsRef.current,
        actualFirstFrame: firstRef.current,
        actualLastFrame: lastRef.current,
        framesAdvanced: framesAdvancedRef.current,
        shouldLoop: loopRef.current,
      });

      if (framesToAdvance !== 0) {
        framesAdvancedRef.current += framesToAdvance;
        onFrameUpdateRef.current(nextFrame);
      }

      if (hasEnded) {
        onEndedRef.current();
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [playing]); // only restart when play state changes
}
