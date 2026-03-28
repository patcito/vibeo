import React, { useRef, useEffect, useState } from "react";
import { Player } from "@vibeo/player";
import type { PlayerRef } from "@vibeo/player";
import { colors } from "../theme/colors.js";
import { useEditor } from "../state/editor-state.js";
import { useCompositions } from "../EditorProvider.js";

export const Canvas: React.FC = () => {
  const [state, dispatch] = useEditor();
  const compositions = useCompositions();
  const playerRef = useRef<PlayerRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const activeComp =
    compositions.find((c) => c.id === state.activeCompositionId) ??
    compositions[0];

  // Measure container for fit-to-space scaling
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Sync editor frame → Player when not playing
  useEffect(() => {
    if (!state.playing && playerRef.current) {
      playerRef.current.seekTo(state.frame);
    }
  }, [state.frame, state.playing]);

  // Sync Player → editor when playing
  useEffect(() => {
    const ref = playerRef.current;
    if (!ref) return;

    if (state.playing) {
      ref.play();
      let rafId: number;
      const sync = () => {
        if (!ref.isPlaying()) {
          dispatch({ type: "SET_PLAYING", playing: false });
          return;
        }
        const f = ref.getCurrentFrame();
        dispatch({ type: "SET_FRAME", frame: f });
        rafId = requestAnimationFrame(sync);
      };
      rafId = requestAnimationFrame(sync);
      return () => {
        cancelAnimationFrame(rafId);
      };
    } else {
      ref.pause();
    }
  }, [state.playing, dispatch]);

  // Sync playback rate to Player
  useEffect(() => {
    playerRef.current?.setPlaybackRate(state.playbackRate);
  }, [state.playbackRate]);

  if (!activeComp) {
    return (
      <div
        ref={containerRef}
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.bg,
          color: colors.textMuted,
          fontSize: 14,
        }}
      >
        No compositions available
      </div>
    );
  }

  // Calculate fit-to-space dimensions
  const aspectRatio = activeComp.width / activeComp.height;
  const padding = 24;
  const availW = Math.max(0, containerSize.width - padding * 2);
  const availH = Math.max(0, containerSize.height - padding * 2);
  let playerWidth = availW;
  let playerHeight = playerWidth / aspectRatio;
  if (playerHeight > availH) {
    playerHeight = availH;
    playerWidth = playerHeight * aspectRatio;
  }

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        backgroundColor: colors.bg,
        backgroundImage: `
          linear-gradient(45deg, ${colors.surface} 25%, transparent 25%, transparent 75%, ${colors.surface} 75%),
          linear-gradient(45deg, ${colors.surface} 25%, transparent 25%, transparent 75%, ${colors.surface} 75%)
        `,
        backgroundSize: "16px 16px",
        backgroundPosition: "0 0, 8px 8px",
      }}
    >
      {containerSize.width > 0 && (
        <Player
          ref={playerRef}
          component={activeComp.component}
          durationInFrames={activeComp.durationInFrames}
          compositionWidth={activeComp.width}
          compositionHeight={activeComp.height}
          fps={activeComp.fps}
          controls={false}
          loop={state.loop}
          playbackRate={state.playbackRate}
          initialFrame={state.frame}
          style={{ width: playerWidth, height: playerHeight }}
        />
      )}
    </div>
  );
};
