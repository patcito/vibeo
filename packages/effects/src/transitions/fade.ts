import type { CSSProperties } from "react";
import type { TransitionState } from "../types.js";

/**
 * Opacity-based fade transition.
 * progress 0→1: childA opacity 1→0, childB opacity 0→1
 */
export function fade(state: TransitionState): {
  childA: CSSProperties;
  childB: CSSProperties;
} {
  const { progress, timing } = state;

  let opacityA: number;
  let opacityB: number;

  switch (timing) {
    case "in-and-out":
      // Crossfade: both change simultaneously
      opacityA = 1 - progress;
      opacityB = progress;
      break;
    case "in":
      // B fades in over A (A stays fully visible)
      opacityA = 1;
      opacityB = progress;
      break;
    case "out":
      // A fades out revealing B (B stays fully visible underneath)
      opacityA = 1 - progress;
      opacityB = 1;
      break;
  }

  return {
    childA: { opacity: opacityA },
    childB: { opacity: opacityB },
  };
}
