import { useMemo } from "react";
import { getAudioContext, type AudioContextOptions } from "../audio-context.js";

export function useAudioContext(options?: AudioContextOptions): AudioContext | null {
  return useMemo(() => getAudioContext(options), [options?.latencyHint]);
}
