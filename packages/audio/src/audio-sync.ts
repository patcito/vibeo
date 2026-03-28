export const TARGET_SAMPLE_RATE = 48000;
export const TARGET_CHANNELS = 2;

export function samplesPerFrame(fps: number): number {
  return (TARGET_SAMPLE_RATE * TARGET_CHANNELS) / fps;
}

export function frameToAudioTimestamp(frame: number, fps: number): number {
  return frame * (1000000 / fps);
}

export function audioTimeToFrame(timeInSeconds: number, fps: number): number {
  return Math.floor(timeInSeconds * fps);
}
