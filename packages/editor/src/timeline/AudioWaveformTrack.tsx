import React, { useRef, useEffect } from "react";
import type { Track } from "../types.js";
import { colors } from "../theme/colors.js";
import {
  FONT_FAMILY,
  TIMELINE_TRACK_HEIGHT,
  TRACK_LABEL_WIDTH,
} from "../theme/styles.js";
import { useEditor } from "../state/editor-state.js";
import { TimelineClip } from "./TimelineClip.js";
import type { TimelineTrackProps } from "./TimelineTrack.js";

const BAR_WIDTH = 2;
const BAR_GAP = 1;
const BAR_STEP = BAR_WIDTH + BAR_GAP;

const AudioWaveformCanvas: React.FC<{
  width: number;
  height: number;
  amplitudes?: number[];
}> = ({ width, height, amplitudes }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const barCount = Math.floor(width / BAR_STEP);

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, colors.audio);
    gradient.addColorStop(1, colors.audio + "bb");
    ctx.fillStyle = gradient;

    for (let i = 0; i < barCount; i++) {
      const x = i * BAR_STEP;
      let amp: number;
      if (amplitudes && amplitudes.length > 0) {
        const idx = Math.floor((i / barCount) * amplitudes.length);
        amp = amplitudes[Math.min(idx, amplitudes.length - 1)]!;
      } else {
        // Placeholder: flat bars at ~40% height with slight variation
        amp = 0.3 + Math.sin(i * 0.3) * 0.1;
      }
      const barHeight = Math.max(2, amp * (height - 4));
      const y = (height - barHeight) / 2;
      ctx.fillRect(x, y, BAR_WIDTH, barHeight);
    }
  }, [width, height, amplitudes]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width,
        height,
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none",
      }}
    />
  );
};

export const AudioWaveformTrack: React.FC<TimelineTrackProps> = ({
  track,
  index,
  pixelsPerFrame,
  totalWidth,
}) => {
  const [, dispatch] = useEditor();
  const bgColor = index % 2 === 0 ? colors.surface : colors.bg;

  return (
    <div
      style={{
        display: "flex",
        height: TIMELINE_TRACK_HEIGHT,
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      {/* Track label */}
      <div
        style={{
          width: TRACK_LABEL_WIDTH,
          flexShrink: 0,
          position: "sticky",
          left: 0,
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          gap: 2,
          padding: "0 4px",
          fontSize: 10,
          fontFamily: FONT_FAMILY,
          color: colors.textMuted,
          backgroundColor: bgColor,
          borderRight: `1px solid ${colors.border}`,
          userSelect: "none",
          overflow: "hidden",
        }}
      >
        <span
          style={{
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {track.name}
        </span>
        <span
          onClick={() =>
            dispatch({ type: "TOGGLE_TRACK_VISIBLE", trackId: track.id })
          }
          onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = colors.surfaceHover; el.style.transform = "scale(1.15)"; }}
          onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = ""; el.style.transform = ""; }}
          onMouseDown={(e) => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = colors.border; el.style.transform = "scale(0.9)"; }}
          onMouseUp={(e) => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = colors.surfaceHover; el.style.transform = "scale(1.15)"; }}
          style={{
            cursor: "pointer",
            opacity: track.visible ? 1 : 0.3,
            fontSize: 12,
            borderRadius: 4,
            padding: "2px",
            transition: "all 150ms ease",
          }}
        >
          👁
        </span>
        <span
          onClick={() =>
            dispatch({ type: "TOGGLE_TRACK_MUTED", trackId: track.id })
          }
          onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = colors.surfaceHover; el.style.transform = "scale(1.15)"; }}
          onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = ""; el.style.transform = ""; }}
          onMouseDown={(e) => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = colors.border; el.style.transform = "scale(0.9)"; }}
          onMouseUp={(e) => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = colors.surfaceHover; el.style.transform = "scale(1.15)"; }}
          style={{
            cursor: "pointer",
            opacity: track.muted ? 0.3 : 1,
            fontSize: 12,
            borderRadius: 4,
            padding: "2px",
            transition: "all 150ms ease",
          }}
        >
          🔊
        </span>
      </div>

      {/* Clips area with waveform */}
      <div
        style={{
          width: totalWidth,
          position: "relative",
          flexShrink: 0,
          backgroundColor: bgColor,
        }}
      >
        {track.clips.map((clip) => {
          const clipWidth = clip.durationInFrames * pixelsPerFrame;
          const clipLeft = clip.from * pixelsPerFrame;
          const amplitudes: number[] | undefined = clip.data?.amplitudes;

          return (
            <React.Fragment key={clip.id}>
              <TimelineClip clip={clip} pixelsPerFrame={pixelsPerFrame} />
              <div
                style={{
                  position: "absolute",
                  left: clipLeft,
                  top: 2,
                  width: Math.max(clipWidth, 2),
                  height: TIMELINE_TRACK_HEIGHT - 4,
                  pointerEvents: "none",
                  overflow: "hidden",
                  borderRadius: 4,
                }}
              >
                <AudioWaveformCanvas
                  width={Math.max(clipWidth, 2)}
                  height={TIMELINE_TRACK_HEIGHT - 4}
                  amplitudes={amplitudes}
                />
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
