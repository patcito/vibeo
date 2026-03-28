import type { CSSProperties } from "react";
import type { TransitionState } from "../types.js";

/**
 * Clip-path wipe transition.
 * Uses CSS `clip-path: inset()` to reveal childB over childA.
 */
export function wipe(state: TransitionState): {
  childA: CSSProperties;
  childB: CSSProperties;
} {
  const { progress, direction } = state;
  const pct = `${progress * 100}%`;

  // childB is revealed via clip-path from the given direction
  let clipPath: string;

  switch (direction) {
    case "left":
      // Wipe from left: reveal B from the left side
      clipPath = `inset(0 ${100 - progress * 100}% 0 0)`;
      break;
    case "right":
      // Wipe from right: reveal B from the right side
      clipPath = `inset(0 0 0 ${100 - progress * 100}%)`;
      break;
    case "up":
      // Wipe from top: reveal B from the top
      clipPath = `inset(0 0 ${100 - progress * 100}% 0)`;
      break;
    case "down":
      // Wipe from bottom: reveal B from the bottom
      clipPath = `inset(${100 - progress * 100}% 0 0 0)`;
      break;
  }

  return {
    childA: {},
    childB: { clipPath },
  };
}
