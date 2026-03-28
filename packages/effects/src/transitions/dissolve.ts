import type { CSSProperties } from "react";
import type { TransitionState } from "../types.js";

/**
 * Pixel dissolve transition.
 * Uses mix-blend-mode and animated opacity for a dissolve effect.
 */
export function dissolve(state: TransitionState): {
  childA: CSSProperties;
  childB: CSSProperties;
} {
  const { progress } = state;

  return {
    childA: {
      opacity: 1 - progress,
    },
    childB: {
      opacity: progress,
      mixBlendMode: "screen" as const,
    },
  };
}
