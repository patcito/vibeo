import { useTimelinePosition } from "./use-timeline-position.js";
import { useSequenceContext } from "../context/sequence-context.js";

export function useCurrentFrame(): number {
  const absoluteFrame = useTimelinePosition();
  const sequenceContext = useSequenceContext();

  if (!sequenceContext) {
    return absoluteFrame;
  }

  return absoluteFrame - (sequenceContext.cumulatedFrom + sequenceContext.relativeFrom);
}
