import type { CSSProperties } from "react";
import type { TransitionState } from "../types.js";

/**
 * Transform-based slide transition.
 * childA slides out, childB slides in from the given direction.
 */
export function slide(state: TransitionState): {
  childA: CSSProperties;
  childB: CSSProperties;
} {
  const { progress, direction } = state;

  let transformA: string;
  let transformB: string;

  switch (direction) {
    case "left":
      // A slides out to the left, B slides in from the right
      transformA = `translateX(${-progress * 100}%)`;
      transformB = `translateX(${(1 - progress) * 100}%)`;
      break;
    case "right":
      // A slides out to the right, B slides in from the left
      transformA = `translateX(${progress * 100}%)`;
      transformB = `translateX(${-(1 - progress) * 100}%)`;
      break;
    case "up":
      // A slides out upward, B slides in from below
      transformA = `translateY(${-progress * 100}%)`;
      transformB = `translateY(${(1 - progress) * 100}%)`;
      break;
    case "down":
      // A slides out downward, B slides in from above
      transformA = `translateY(${progress * 100}%)`;
      transformB = `translateY(${-(1 - progress) * 100}%)`;
      break;
  }

  return {
    childA: { transform: transformA },
    childB: { transform: transformB },
  };
}
