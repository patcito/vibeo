import type { ReactNode } from "react";
import { TimelineProvider } from "./context/timeline-context.js";
import { CompositionProvider } from "./context/composition-context.js";

interface VibeoRootProps {
  children: ReactNode;
}

export function VibeoRoot({ children }: VibeoRootProps) {
  return (
    <TimelineProvider>
      <CompositionProvider>
        {children}
      </CompositionProvider>
    </TimelineProvider>
  );
}
