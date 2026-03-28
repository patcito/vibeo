export interface CalculateNextFrameInput {
  time: number;
  currentFrame: number;
  playbackSpeed: number;
  fps: number;
  actualFirstFrame: number;
  actualLastFrame: number;
  framesAdvanced: number;
  shouldLoop: boolean;
}

export interface CalculateNextFrameResult {
  nextFrame: number;
  framesToAdvance: number;
  hasEnded: boolean;
}

export function calculateNextFrame({
  time,
  currentFrame,
  playbackSpeed,
  fps,
  actualFirstFrame,
  actualLastFrame,
  framesAdvanced,
  shouldLoop,
}: CalculateNextFrameInput): CalculateNextFrameResult {
  const op = playbackSpeed < 0 ? Math.ceil : Math.floor;
  const framesToAdvance =
    op((time * playbackSpeed * fps) / 1000) - framesAdvanced;
  const nextFrame = framesToAdvance + currentFrame;

  let hasEnded = false;

  // Forward playback boundary
  if (playbackSpeed > 0 && nextFrame > actualLastFrame) {
    if (shouldLoop) {
      return {
        nextFrame: actualFirstFrame,
        framesToAdvance,
        hasEnded: false,
      };
    }
    return {
      nextFrame: actualLastFrame,
      framesToAdvance,
      hasEnded: true,
    };
  }

  // Reverse playback boundary
  if (playbackSpeed < 0 && nextFrame < actualFirstFrame) {
    if (shouldLoop) {
      return {
        nextFrame: actualLastFrame,
        framesToAdvance,
        hasEnded: false,
      };
    }
    return {
      nextFrame: actualFirstFrame,
      framesToAdvance,
      hasEnded: true,
    };
  }

  return { nextFrame, framesToAdvance, hasEnded };
}
