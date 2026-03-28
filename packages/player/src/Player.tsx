import {
  forwardRef,
  useImperativeHandle,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  useState,
} from "react";
import {
  TimelineProvider,
  useTimelineContext,
  CompositionProvider,
  VideoConfigProvider,
} from "@vibeo/core";
import type { VideoConfig } from "@vibeo/core";
import type { PlayerProps, PlayerRef } from "./types.js";
import { usePlayer } from "./use-player.js";
import { usePlaybackLoop } from "./use-playback-loop.js";
import { useBuffering } from "./use-buffering.js";
import { PlayerControls } from "./controls/PlayerControls.js";

interface PlayerInnerProps<T extends Record<string, unknown>>
  extends PlayerProps<T> {
  playerRef: React.Ref<PlayerRef>;
}

function PlayerInner<T extends Record<string, unknown>>({
  component: Component,
  durationInFrames,
  compositionWidth,
  compositionHeight,
  fps,
  controls = false,
  loop: shouldLoop = false,
  autoPlay = false,
  playbackRate: initialPlaybackRate = 1,
  initialFrame = 0,
  inFrame,
  outFrame,
  style,
  className,
  inputProps,
  playerRef,
}: PlayerInnerProps<T>) {
  const firstFrame = inFrame ?? 0;
  const lastFrame = outFrame ?? durationInFrames - 1;
  const containerRef = useRef<HTMLDivElement>(null);

  const timeline = useTimelineContext();

  const videoConfig = useMemo<VideoConfig>(
    () => ({ width: compositionWidth, height: compositionHeight, fps, durationInFrames }),
    [compositionWidth, compositionHeight, fps, durationInFrames],
  );

  const {
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
  } = usePlayer({
    initialFrame: Math.max(firstFrame, Math.min(lastFrame, initialFrame)),
    initialPlaybackRate,
    firstFrame,
    lastFrame,
  });

  // Sync player frame to timeline context
  useEffect(() => {
    timeline.setFrame("__player__", frame);
  }, [frame, timeline]);

  useEffect(() => {
    timeline.setPlaying(playing);
  }, [playing, timeline]);

  useEffect(() => {
    timeline.setPlaybackRate(playbackRate);
  }, [playbackRate, timeline]);

  const getCurrentFrame = useCallback(() => frame, [frame]);

  const onFrameUpdate = useCallback(
    (nextFrame: number) => {
      setFrame(nextFrame);
    },
    [setFrame],
  );

  const onEnded = useCallback(() => {
    pause();
    emitter.emit("ended", undefined as void);
  }, [pause, emitter]);

  const { buffering } = useBuffering({ playing, containerRef });

  // Pause while buffering
  const effectivePlaying = playing && !buffering;

  usePlaybackLoop({
    playing: effectivePlaying,
    fps,
    playbackSpeed: playbackRate,
    actualFirstFrame: firstFrame,
    actualLastFrame: lastFrame,
    shouldLoop,
    getCurrentFrame,
    onFrameUpdate,
    onEnded,
  });

  useImperativeHandle(playerRef, () => ref, [ref]);

  // Auto play
  useEffect(() => {
    if (autoPlay) {
      play();
    }
  }, [autoPlay, play]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") {
        return;
      }

      switch (e.code) {
        case "Space":
          e.preventDefault();
          toggle();
          break;
        case "ArrowRight":
          e.preventDefault();
          seekTo(Math.min(lastFrame, frame + (e.shiftKey ? 5 : 1)));
          break;
        case "ArrowLeft":
          e.preventDefault();
          seekTo(Math.max(firstFrame, frame - (e.shiftKey ? 5 : 1)));
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [toggle, seekTo, frame, firstFrame, lastFrame]);

  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateScale = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0) {
        setScale(rect.width / compositionWidth);
      }
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(el);
    return () => observer.disconnect();
  }, [compositionWidth]);

  const containerStyle = useMemo(
    () => ({
      position: "relative" as const,
      overflow: "hidden" as const,
      background: "black",
      ...style,
    }),
    [style],
  );

  const aspectRatio = compositionWidth / compositionHeight;

  return (
    <div className={className} style={containerStyle}>
      <div
        ref={containerRef}
        style={{
          width: "100%",
          aspectRatio: `${aspectRatio}`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: compositionWidth,
            height: compositionHeight,
            transformOrigin: "top left",
            transform: `scale(${scale})`,
            position: "absolute",
            top: 0,
            left: 0,
          }}
        >
          <VideoConfigProvider config={videoConfig}>
            <Component {...((inputProps ?? {}) as T)} />
          </VideoConfigProvider>
        </div>
      </div>
      {controls && (
        <PlayerControls
          playing={playing}
          currentFrame={frame}
          durationInFrames={lastFrame - firstFrame + 1}
          firstFrame={firstFrame}
          playbackRate={playbackRate}
          fps={fps}
          onToggle={toggle}
          onSeek={seekTo}
          onRateChange={setPlaybackRate}
        />
      )}
    </div>
  );
}

function PlayerWithProviders<T extends Record<string, unknown>>(
  props: PlayerProps<T>,
  ref: React.Ref<PlayerRef>,
) {
  return (
    <TimelineProvider>
      <CompositionProvider>
        <PlayerInner {...props} playerRef={ref} />
      </CompositionProvider>
    </TimelineProvider>
  );
}

export const Player = forwardRef(PlayerWithProviders) as <
  T extends Record<string, unknown> = Record<string, unknown>,
>(
  props: PlayerProps<T> & { ref?: React.Ref<PlayerRef> },
) => React.ReactElement | null;
