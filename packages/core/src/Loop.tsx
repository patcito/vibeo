import type { ReactNode } from "react";
import { useCurrentFrame } from "./hooks/use-current-frame.js";
import { LoopContext } from "./context/loop-context.js";
import { Sequence } from "./Sequence.js";

interface LoopProps {
  children: ReactNode;
  durationInFrames: number;
  times?: number;
  layout?: "none" | "absolute-fill";
}

export function Loop({
  children,
  durationInFrames,
  times = Infinity,
  layout,
}: LoopProps) {
  const currentFrame = useCurrentFrame();
  const iteration = Math.floor(currentFrame / durationInFrames);

  if (iteration >= times) {
    return null;
  }

  const loopContextValue = {
    iteration,
    durationInFrames,
  };

  return (
    <LoopContext.Provider value={loopContextValue}>
      <Sequence
        from={iteration * durationInFrames}
        durationInFrames={durationInFrames}
        layout={layout}
      >
        {children}
      </Sequence>
    </LoopContext.Provider>
  );
}
