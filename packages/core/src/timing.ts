import { interpolate } from "./interpolate.js";

export function msPerFrame(fps: number): number {
  return 1000 / fps;
}

export function frameToTime(frame: number, fps: number): number {
  return (frame * msPerFrame(fps)) / 1000;
}

export function timeToFrame(time: number, fps: number): number {
  return Math.floor(time * fps);
}

export function getMediaTime(
  frame: number,
  fps: number,
  playbackRate: number,
  startFrom: number,
): number {
  const mapped = interpolate(
    frame,
    [-1, startFrom, startFrom + 1],
    [-1, startFrom, startFrom + playbackRate],
  );
  return (mapped * msPerFrame(fps)) / 1000;
}
