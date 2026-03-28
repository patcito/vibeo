import { useCompositionContext } from "../context/composition-context.js";
import { useVideoConfigContext } from "../context/video-config-context.js";
import type { VideoConfig } from "../types.js";

export function useVideoConfig(): VideoConfig {
  // Prefer direct VideoConfigContext (set by Player) over composition lookup
  const directConfig = useVideoConfigContext();
  if (directConfig) {
    return directConfig;
  }

  const { compositions, currentCompositionId } = useCompositionContext();
  if (!currentCompositionId) {
    throw new Error("No current composition set. useVideoConfig must be used inside a composition.");
  }
  const composition = compositions.get(currentCompositionId);
  if (!composition) {
    throw new Error(`Composition "${currentCompositionId}" not found`);
  }
  return {
    width: composition.width,
    height: composition.height,
    fps: composition.fps,
    durationInFrames: composition.durationInFrames,
  };
}
