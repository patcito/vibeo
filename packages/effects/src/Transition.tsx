import React, { type CSSProperties, type ReactNode, Children } from "react";
import { useCurrentFrame, interpolate } from "@vibeo/core";
import type { TransitionProps, TransitionState, TransitionType as TType } from "./types.js";
import { fade } from "./transitions/fade.js";
import { wipe } from "./transitions/wipe.js";
import { slide } from "./transitions/slide.js";
import { dissolve } from "./transitions/dissolve.js";

const transitionFns: Record<
  TType,
  (state: TransitionState) => { childA: CSSProperties; childB: CSSProperties }
> = {
  fade,
  wipe,
  slide,
  dissolve,
};

const containerStyle: CSSProperties = {
  position: "relative",
  width: "100%",
  height: "100%",
  overflow: "hidden",
};

const layerStyle: CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
};

/**
 * Transition between two children.
 *
 * The component IS the crossfade window — `durationInFrames` is how many
 * frames the blend lasts. Place it inside a `<Sequence>` to position it
 * on the timeline.
 *
 * ```tsx
 * <Transition type="fade" durationInFrames={15}>
 *   <SceneA />
 *   <SceneB />
 * </Transition>
 * ```
 *
 * - Before frame 0: only first child is rendered.
 * - Frames 0 … durationInFrames-1: both children rendered with blend.
 * - After durationInFrames: only second child is rendered.
 */
export function Transition({
  type,
  durationInFrames,
  timing = "in-and-out",
  direction = "left",
  children,
}: TransitionProps): ReactNode {
  const frame = useCurrentFrame();

  const childArray = Children.toArray(children);
  if (childArray.length !== 2) {
    throw new Error(`<Transition> expects exactly 2 children, got ${childArray.length}`);
  }

  const [childA, childB] = childArray;

  // Before transition window: only childA
  if (frame < 0) {
    return <>{childA}</>;
  }

  // After transition window: only childB
  if (frame >= durationInFrames) {
    return <>{childB}</>;
  }

  // During transition: compute progress 0→1
  // All frames inside [0, durationInFrames) render both children with blend
  const progress = interpolate(
    frame,
    [0, Math.max(durationInFrames - 1, 1)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const state: TransitionState = { progress, timing, direction };
  const fn = transitionFns[type];
  const styles = fn(state);

  return (
    <div style={containerStyle}>
      <div style={{ ...layerStyle, ...styles.childA }}>{childA}</div>
      <div style={{ ...layerStyle, ...styles.childB }}>{childB}</div>
    </div>
  );
}
