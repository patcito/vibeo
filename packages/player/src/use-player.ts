import { useState, useCallback, useMemo, useRef } from "react";
import { PlayerEventEmitter } from "./events.js";
import type { PlayerRef } from "./types.js";

interface UsePlayerOptions {
  initialFrame: number;
  initialPlaybackRate: number;
  firstFrame: number;
  lastFrame: number;
}

interface UsePlayerReturn {
  frame: number;
  playing: boolean;
  playbackRate: number;
  emitter: PlayerEventEmitter;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seekTo: (frame: number) => void;
  setPlaybackRate: (rate: number) => void;
  setFrame: (frame: number) => void;
  ref: PlayerRef;
}

export function usePlayer({
  initialFrame,
  initialPlaybackRate,
  firstFrame,
  lastFrame,
}: UsePlayerOptions): UsePlayerReturn {
  const [frame, setFrameState] = useState(initialFrame);
  const [playing, setPlaying] = useState(false);
  const [playbackRate, setPlaybackRateState] = useState(initialPlaybackRate);
  const emitter = useMemo(() => new PlayerEventEmitter(), []);

  const frameRef = useRef(frame);
  const playingRef = useRef(playing);
  const playbackRateRef = useRef(playbackRate);

  const setFrame = useCallback(
    (f: number) => {
      const clamped = Math.max(firstFrame, Math.min(lastFrame, f));
      frameRef.current = clamped;
      setFrameState(clamped);
      emitter.emit("framechange", { frame: clamped });
    },
    [firstFrame, lastFrame, emitter],
  );

  const play = useCallback(() => {
    playingRef.current = true;
    setPlaying(true);
    emitter.emit("play", undefined as void);
  }, [emitter]);

  const pause = useCallback(() => {
    playingRef.current = false;
    setPlaying(false);
    emitter.emit("pause", undefined as void);
  }, [emitter]);

  const toggle = useCallback(() => {
    if (playingRef.current) {
      pause();
    } else {
      play();
    }
  }, [play, pause]);

  const seekTo = useCallback(
    (f: number) => {
      setFrame(f);
      emitter.emit("seeked", { frame: f });
    },
    [setFrame, emitter],
  );

  const setPlaybackRate = useCallback(
    (rate: number) => {
      playbackRateRef.current = rate;
      setPlaybackRateState(rate);
      emitter.emit("ratechange", { rate });
    },
    [emitter],
  );

  const ref: PlayerRef = useMemo(
    () => ({
      play,
      pause,
      toggle,
      seekTo,
      getCurrentFrame: () => frameRef.current,
      isPlaying: () => playingRef.current,
      getPlaybackRate: () => playbackRateRef.current,
      setPlaybackRate,
    }),
    [play, pause, toggle, seekTo, setPlaybackRate],
  );

  return {
    frame,
    playing,
    playbackRate,
    emitter,
    play,
    pause,
    toggle,
    seekTo,
    setPlaybackRate,
    setFrame,
    ref,
  };
}
