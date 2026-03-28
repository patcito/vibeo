import { useMemo } from "react";
import { useCurrentFrame, interpolate } from "@vibeo/core";

/**
 * Compute the transition progress for a self-contained transition window.
 *
 * Returns a number 0→1 representing where we are in the transition,
 * or `null` if we're outside the transition window.
 *
 * The transition spans frames [0, durationInFrames). Place this hook
 * inside a `<Sequence>` to position it on the timeline.
 */
export function useTransitionProgress(durationInFrames: number): number | null {
  const frame = useCurrentFrame();

  return useMemo(() => {
    if (frame < 0 || frame >= durationInFrames) return null;

    return interpolate(
      frame,
      [0, Math.max(durationInFrames - 1, 1)],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
  }, [frame, durationInFrames]);
}
