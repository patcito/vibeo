import type { CSSProperties, ReactNode } from "react";
import { useTimelinePosition } from "./hooks/use-timeline-position.js";
import { useSequenceContext } from "./context/sequence-context.js";
import { SequenceContext } from "./context/sequence-context.js";

interface SequenceProps {
  children: ReactNode;
  from?: number;
  durationInFrames?: number;
  name?: string;
  layout?: "none" | "absolute-fill";
}

export function Sequence({
  children,
  from = 0,
  durationInFrames = Infinity,
  name,
  layout = "absolute-fill",
}: SequenceProps) {
  const absoluteFrame = useTimelinePosition();
  const parentSequence = useSequenceContext();

  const parentCumulatedFrom = parentSequence?.cumulatedFrom ?? 0;
  const parentRelativeFrom = parentSequence?.relativeFrom ?? 0;

  const actualFrom = parentCumulatedFrom + parentRelativeFrom + from;

  // Only render children when absoluteFrame is within [actualFrom, actualFrom + durationInFrames)
  if (absoluteFrame < actualFrom || absoluteFrame >= actualFrom + durationInFrames) {
    return null;
  }

  const contextValue = {
    cumulatedFrom: parentCumulatedFrom + parentRelativeFrom,
    relativeFrom: from,
    durationInFrames,
  };

  const style: CSSProperties | undefined =
    layout === "absolute-fill"
      ? {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }
      : undefined;

  const content = (
    <SequenceContext.Provider value={contextValue}>
      {children}
    </SequenceContext.Provider>
  );

  if (layout === "none") {
    return content;
  }

  return (
    <div style={style} data-sequence-name={name}>
      {content}
    </div>
  );
}
