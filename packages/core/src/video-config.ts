import type { VideoConfig } from "./types.js";

export function validateVideoConfig(config: VideoConfig): void {
  if (typeof config.width !== "number" || config.width <= 0 || !Number.isFinite(config.width)) {
    throw new Error(`width must be a positive number, got ${config.width}`);
  }
  if (typeof config.height !== "number" || config.height <= 0 || !Number.isFinite(config.height)) {
    throw new Error(`height must be a positive number, got ${config.height}`);
  }
  if (typeof config.fps !== "number" || config.fps <= 0 || !Number.isFinite(config.fps)) {
    throw new Error(`fps must be a positive number, got ${config.fps}`);
  }
  if (
    typeof config.durationInFrames !== "number" ||
    config.durationInFrames <= 0 ||
    !Number.isInteger(config.durationInFrames)
  ) {
    throw new Error(
      `durationInFrames must be a positive integer, got ${config.durationInFrames}`,
    );
  }
}
