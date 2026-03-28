import type { VolumeFunction } from "./types.js";

function clamp01(value: number): number {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

export function evaluateVolume(
  frame: number,
  volume: number | VolumeFunction,
  mediaVolume: number,
): number {
  const raw = typeof volume === "function" ? volume(frame) : volume;
  return clamp01(raw * mediaVolume);
}

export function buildVolumeArray(
  durationInFrames: number,
  startsAt: number,
  volume: number | VolumeFunction,
  mediaVolume: number,
): number[] {
  const result: number[] = [];
  for (let i = 0; i < durationInFrames; i++) {
    result.push(evaluateVolume(i + startsAt, volume, mediaVolume));
  }
  return result;
}
