import { useMemo } from "react";
import { interpolate, linear } from "@vibeo/core";
import type { KeyframeMap, KeyframeOptions, KeyframeStop } from "./types.js";

interface ParsedStop {
  frame: number;
  value: number;
  easing?: (t: number) => number;
}

function parseStops(keyframes: KeyframeMap): ParsedStop[] {
  const stops: ParsedStop[] = [];
  for (const key of Object.keys(keyframes)) {
    const f = Number(key);
    const raw: KeyframeStop = keyframes[f];
    if (typeof raw === "number") {
      stops.push({ frame: f, value: raw });
    } else {
      stops.push({ frame: f, value: raw.value, easing: raw.easing });
    }
  }
  stops.sort((a, b) => a.frame - b.frame);
  return stops;
}

/**
 * Declarative keyframe animation. Pass in the current frame explicitly.
 *
 * ```ts
 * const y = useKeyframes(frame, { 0: 0, 30: 100, 60: 0 });
 * ```
 *
 * Keyframe values can also include per-segment easing:
 * ```ts
 * const y = useKeyframes(frame, {
 *   0: { value: 0, easing: easeIn },
 *   30: { value: 100 },
 *   60: { value: 0 },
 * });
 * ```
 */
export function useKeyframes(
  frame: number,
  keyframes: KeyframeMap,
  options?: KeyframeOptions,
): number {
  const stops = useMemo(() => parseStops(keyframes), [keyframes]);
  const defaultEasing = options?.easing ?? linear;

  if (stops.length === 0) return 0;
  if (stops.length === 1) return stops[0].value;

  // Clamp at boundaries (no extrapolation beyond first/last keyframe)
  if (frame <= stops[0].frame) return stops[0].value;
  if (frame >= stops[stops.length - 1].frame) return stops[stops.length - 1].value;

  // Find the segment containing the current frame
  let segIdx = 0;
  for (let i = stops.length - 2; i >= 0; i--) {
    if (stops[i].frame <= frame) {
      segIdx = i;
      break;
    }
  }

  const from = stops[segIdx];
  const to = stops[segIdx + 1];

  // Per-segment easing: use the *starting* stop's easing, then default
  const easing = from.easing ?? defaultEasing;

  return interpolate(
    frame,
    [from.frame, to.frame],
    [from.value, to.value],
    { easing, extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
}
