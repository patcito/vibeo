import type { FrameRange } from "./types.js";

/**
 * Parse a frame range string like "10-50" or "25" into a [start, end] tuple.
 * Returns null if the input is null or empty.
 */
export function parseFrameRange(
  input: string | null,
  durationInFrames: number,
): FrameRange | null {
  if (input === null || input.trim() === "") {
    return null;
  }

  const trimmed = input.trim();

  if (trimmed.includes("-")) {
    const [startStr, endStr] = trimmed.split("-");
    const start = parseInt(startStr!, 10);
    const end = parseInt(endStr!, 10);

    if (isNaN(start) || isNaN(end)) {
      throw new Error(`Invalid frame range: "${input}". Expected format: "start-end"`);
    }

    validateFrameRange([start, end], durationInFrames);
    return [start, end];
  }

  const singleFrame = parseInt(trimmed, 10);
  if (isNaN(singleFrame)) {
    throw new Error(`Invalid frame range: "${input}". Expected a number or "start-end"`);
  }

  validateFrameRange([singleFrame, singleFrame], durationInFrames);
  return [singleFrame, singleFrame];
}

/**
 * Get the real frame range to render, accounting for optional user-specified range.
 */
export function getRealFrameRange(
  durationInFrames: number,
  frameRange: FrameRange | null,
): FrameRange {
  if (frameRange === null) {
    return [0, durationInFrames - 1];
  }
  return frameRange;
}

/**
 * Validate that a frame range is within bounds and well-formed.
 */
export function validateFrameRange(
  range: FrameRange,
  durationInFrames: number,
): void {
  const [start, end] = range;

  if (!Number.isInteger(start) || !Number.isInteger(end)) {
    throw new Error(`Frame range values must be integers. Got [${start}, ${end}]`);
  }

  if (start < 0) {
    throw new Error(`Frame range start must be >= 0. Got ${start}`);
  }

  if (end < start) {
    throw new Error(
      `Frame range end (${end}) must be >= start (${start})`,
    );
  }

  if (end >= durationInFrames) {
    throw new Error(
      `Frame range end (${end}) exceeds duration (${durationInFrames} frames). ` +
        `Max allowed end frame is ${durationInFrames - 1}`,
    );
  }
}
