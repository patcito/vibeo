import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from "react";

interface TimelineState {
  /** Map of compositionId → current frame */
  frames: Record<string, number>;
  playing: boolean;
  playbackRate: number;
}

interface TimelineContextValue extends TimelineState {
  setFrame: (compositionId: string, frame: number) => void;
  setPlaying: (playing: boolean) => void;
  setPlaybackRate: (rate: number) => void;
}

const TimelineContext = createContext<TimelineContextValue | null>(null);

export function TimelineProvider({ children }: { children: ReactNode }) {
  // If already nested inside a TimelineProvider, reuse the parent context
  const parentCtx = useContext(TimelineContext);
  if (parentCtx) {
    return <>{children}</>;
  }

  return <TimelineProviderInner>{children}</TimelineProviderInner>;
}

function TimelineProviderInner({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TimelineState>({
    frames: {},
    playing: false,
    playbackRate: 1,
  });

  const setFrame = useCallback((compositionId: string, frame: number) => {
    setState((prev) => {
      if (prev.frames[compositionId] === frame) return prev;
      return { ...prev, frames: { ...prev.frames, [compositionId]: frame } };
    });
  }, []);

  const setPlaying = useCallback((playing: boolean) => {
    setState((prev) => {
      if (prev.playing === playing) return prev;
      return { ...prev, playing };
    });
  }, []);

  const setPlaybackRate = useCallback((playbackRate: number) => {
    setState((prev) => {
      if (prev.playbackRate === playbackRate) return prev;
      return { ...prev, playbackRate };
    });
  }, []);

  const value = useMemo<TimelineContextValue>(
    () => ({ ...state, setFrame, setPlaying, setPlaybackRate }),
    [state, setFrame, setPlaying, setPlaybackRate],
  );

  return (
    <TimelineContext.Provider value={value}>
      {children}
    </TimelineContext.Provider>
  );
}

export function useTimelineContext(): TimelineContextValue {
  const ctx = useContext(TimelineContext);
  if (!ctx) {
    throw new Error("useTimelineContext must be used within a TimelineProvider");
  }
  return ctx;
}

export { TimelineContext };
