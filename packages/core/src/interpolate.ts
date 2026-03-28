import { linear } from "./easing.js";
import type { ExtrapolateType, InterpolateOptions } from "./types.js";

function extrapolate(
  value: number,
  inputMin: number,
  inputMax: number,
  outputMin: number,
  outputMax: number,
  type: ExtrapolateType,
): number {
  switch (type) {
    case "identity":
      return value;
    case "clamp":
      // Clamp to the nearest output boundary
      if (value < inputMin) return outputMin;
      return outputMax;
    case "extend": {
      // Continue the linear slope beyond the range
      const slope = (outputMax - outputMin) / (inputMax - inputMin);
      if (value < inputMin) {
        return outputMin + (value - inputMin) * slope;
      }
      return outputMax + (value - inputMax) * slope;
    }
  }
}

function findSegment(input: number, inputRange: readonly number[]): number {
  // For a single-point range there is no segment
  if (inputRange.length === 1) return 0;
  // Find the segment: the rightmost index where inputRange[i] <= input
  for (let i = inputRange.length - 2; i >= 0; i--) {
    if (inputRange[i] <= input) return i;
  }
  return 0;
}

export function interpolate(
  input: number,
  inputRange: readonly number[],
  outputRange: readonly number[],
  options?: InterpolateOptions,
): number {
  if (inputRange.length !== outputRange.length) {
    throw new Error(
      `inputRange (${inputRange.length}) and outputRange (${outputRange.length}) must have the same length`,
    );
  }
  if (inputRange.length < 2) {
    throw new Error("inputRange must have at least 2 elements");
  }

  const easing = options?.easing ?? linear;
  const extrapolateLeft = options?.extrapolateLeft ?? "extend";
  const extrapolateRight = options?.extrapolateRight ?? "extend";

  // Handle out-of-bounds on the left
  if (input < inputRange[0]) {
    return extrapolate(
      input,
      inputRange[0],
      inputRange[1],
      outputRange[0],
      outputRange[1],
      extrapolateLeft,
    );
  }

  // Handle out-of-bounds on the right
  if (input > inputRange[inputRange.length - 1]) {
    const last = inputRange.length - 1;
    return extrapolate(
      input,
      inputRange[last - 1],
      inputRange[last],
      outputRange[last - 1],
      outputRange[last],
      extrapolateRight,
    );
  }

  const seg = findSegment(input, inputRange);

  const inputMin = inputRange[seg];
  const inputMax = inputRange[seg + 1];
  const outputMin = outputRange[seg];
  const outputMax = outputRange[seg + 1];

  // Normalize to 0-1
  const range = inputMax - inputMin;
  const t = range === 0 ? 0 : (input - inputMin) / range;

  // Apply easing
  const easedT = easing(t);

  // Scale to output range
  return outputMin + easedT * (outputMax - outputMin);
}
