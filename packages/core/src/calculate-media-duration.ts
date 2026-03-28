export function calculateMediaDuration(
  totalDurationInFrames: number,
  playbackRate: number,
  trimBefore?: number,
  trimAfter?: number,
): number {
  const effectiveTrimAfter = trimAfter ?? totalDurationInFrames;
  const effectiveTrimBefore = trimBefore ?? 0;
  const duration = effectiveTrimAfter - effectiveTrimBefore;
  return Math.floor(duration / playbackRate);
}
