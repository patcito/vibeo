import { useState, useEffect, useRef, useCallback } from "react";

interface UseBufferingOptions {
  playing: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

interface UseBufferingReturn {
  buffering: boolean;
}

function getMediaElements(container: HTMLElement): HTMLMediaElement[] {
  return Array.from(
    container.querySelectorAll<HTMLMediaElement>("video, audio"),
  );
}

function isMediaReady(el: HTMLMediaElement): boolean {
  // readyState >= HAVE_FUTURE_DATA means enough data to play
  return el.readyState >= 3 || el.paused;
}

export function useBuffering({
  playing,
  containerRef,
}: UseBufferingOptions): UseBufferingReturn {
  const [buffering, setBuffering] = useState(false);
  const checkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkBuffering = useCallback(() => {
    const container = containerRef.current;
    if (!container) {
      setBuffering(false);
      return;
    }

    const mediaElements = getMediaElements(container);
    if (mediaElements.length === 0) {
      setBuffering(false);
      return;
    }

    const isBuffering = mediaElements.some((el) => !isMediaReady(el));
    setBuffering(isBuffering);
  }, [containerRef]);

  useEffect(() => {
    if (!playing) {
      setBuffering(false);
      if (checkIntervalRef.current !== null) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
      return;
    }

    checkBuffering();
    checkIntervalRef.current = setInterval(checkBuffering, 200);

    return () => {
      if (checkIntervalRef.current !== null) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, [playing, checkBuffering]);

  return { buffering };
}
