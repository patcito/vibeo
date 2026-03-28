import { useTimelineContext } from "../context/timeline-context.js";
import { useCompositionContext } from "../context/composition-context.js";

export function useTimelinePosition(): number {
  const { frames } = useTimelineContext();
  const { currentCompositionId } = useCompositionContext();

  // Inside a Player, there may be no named composition — use the first available frame entry
  if (currentCompositionId) {
    return frames[currentCompositionId] ?? 0;
  }

  // Fallback: return the first frame value in the map (Player sets "__player__" or "player")
  const keys = Object.keys(frames);
  if (keys.length > 0) {
    return frames[keys[0]!] ?? 0;
  }

  return 0;
}
