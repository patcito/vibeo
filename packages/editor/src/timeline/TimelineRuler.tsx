import React from "react";
import { colors } from "../theme/colors.js";
import {
  MONO_FONT,
  TIMELINE_RULER_HEIGHT,
  TRACK_LABEL_WIDTH,
} from "../theme/styles.js";
import { useEditor } from "../state/editor-state.js";

interface TimelineRulerProps {
  pixelsPerFrame: number;
  totalWidth: number;
  fps: number;
  durationInFrames: number;
}

function formatTime(frame: number, fps: number): string {
  const totalSeconds = Math.floor(frame / fps);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export const TimelineRuler: React.FC<TimelineRulerProps> = ({
  pixelsPerFrame,
  totalWidth,
  fps,
  durationInFrames,
}) => {
  const [, dispatch] = useEditor();

  // Find smallest tick interval that gives >= 80px between ticks
  const minTickSpacing = 80;
  const candidates = [
    1, 2, 5, 10, 15, 30,
    fps,
    fps * 2,
    fps * 5,
    fps * 10,
    fps * 30,
    fps * 60,
  ];
  let tickInterval = fps;
  for (const c of candidates) {
    if (c * pixelsPerFrame >= minTickSpacing) {
      tickInterval = c;
      break;
    }
  }

  const ticks: { frame: number; label: string }[] = [];
  for (let f = 0; f <= durationInFrames; f += tickInterval) {
    ticks.push({ frame: f, label: formatTime(f, fps) });
  }

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const frame = Math.max(
      0,
      Math.min(durationInFrames, Math.round(x / pixelsPerFrame)),
    );
    dispatch({ type: "SET_FRAME", frame });
  };

  return (
    <div
      style={{
        display: "flex",
        height: TIMELINE_RULER_HEIGHT,
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      {/* Label spacer */}
      <div
        style={{
          width: TRACK_LABEL_WIDTH,
          flexShrink: 0,
          position: "sticky",
          left: 0,
          zIndex: 3,
          backgroundColor: colors.surface,
          borderRight: `1px solid ${colors.border}`,
        }}
      />

      {/* Ticks area */}
      <div
        onClick={handleClick}
        onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = colors.surfaceHover; el.style.boxShadow = `inset 0 -2px 0 ${colors.accent}`; }}
        onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = colors.surface; el.style.boxShadow = ""; }}
        onMouseDown={(e) => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = colors.border; el.style.boxShadow = `inset 0 -2px 0 ${colors.accentHover}`; }}
        onMouseUp={(e) => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = colors.surfaceHover; el.style.boxShadow = `inset 0 -2px 0 ${colors.accent}`; }}
        style={{
          width: totalWidth,
          position: "relative",
          flexShrink: 0,
          backgroundColor: colors.surface,
          cursor: "pointer",
          userSelect: "none",
          overflow: "hidden",
          transition: "background-color 150ms ease",
        }}
      >
        {ticks.map((tick) => (
          <div
            key={tick.frame}
            style={{
              position: "absolute",
              left: tick.frame * pixelsPerFrame,
              top: 0,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <span
              style={{
                fontFamily: MONO_FONT,
                fontSize: 10,
                color: colors.textMuted,
                paddingLeft: 4,
                paddingTop: 2,
                whiteSpace: "nowrap",
              }}
            >
              {tick.label}
            </span>
            <div
              style={{
                width: 1,
                flex: 1,
                backgroundColor: colors.border,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
