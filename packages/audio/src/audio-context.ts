let singletonContext: AudioContext | null = null;

export interface AudioContextOptions {
  latencyHint?: AudioContextLatencyCategory | number;
}

export function getAudioContext(options?: AudioContextOptions): AudioContext | null {
  if (typeof window === "undefined" || typeof AudioContext === "undefined") {
    return null;
  }

  if (singletonContext) {
    return singletonContext;
  }

  singletonContext = new AudioContext({
    sampleRate: 48000,
    latencyHint: options?.latencyHint ?? "interactive",
  });

  return singletonContext;
}

export function destroyAudioContext(): void {
  if (singletonContext) {
    void singletonContext.close();
    singletonContext = null;
  }
}
