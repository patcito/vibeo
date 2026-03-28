import React from "react";
import { colors } from "../theme/colors.js";
import { TOOLBAR_HEIGHT, BORDER_RADIUS, TRANSITION, MONO_FONT, FONT_FAMILY } from "../theme/styles.js";
import { useEditor } from "../state/editor-state.js";

const RATES = [0.25, 0.5, 1, 1.5, 2, 4] as const;

const btnBase: React.CSSProperties = {
  background: "none",
  border: "none",
  color: colors.text,
  fontSize: 15,
  padding: "4px 8px",
  cursor: "pointer",
  borderRadius: BORDER_RADIUS,
  transition: TRANSITION,
  fontFamily: FONT_FAMILY,
  lineHeight: 1,
};

function hoverOn(e: React.MouseEvent) {
  (e.currentTarget as HTMLElement).style.filter = "brightness(1.2)";
}
function hoverOff(e: React.MouseEvent) {
  (e.currentTarget as HTMLElement).style.filter = "";
}
function pressOn(e: React.MouseEvent) {
  (e.currentTarget as HTMLElement).style.filter = "brightness(0.9)";
}

function formatTimecode(frame: number, fps: number): string {
  const totalSeconds = frame / fps;
  const ss = Math.floor(totalSeconds) % 60;
  const mm = Math.floor(totalSeconds / 60) % 60;
  const hh = Math.floor(totalSeconds / 3600);
  const pad2 = (n: number) => String(n).padStart(2, "0");
  return `${pad2(hh)}:${pad2(mm)}:${pad2(ss)}`;
}

export const PlaybackControls: React.FC = () => {
  const [state, dispatch] = useEditor();

  const lastFrame = state.durationInFrames - 1;

  const prevFrame = () =>
    dispatch({ type: "SET_FRAME", frame: Math.max(0, state.frame - 1) });
  const nextFrame = () =>
    dispatch({ type: "SET_FRAME", frame: Math.min(lastFrame, state.frame + 1) });
  const togglePlay = () =>
    dispatch({ type: "SET_PLAYING", playing: !state.playing });
  const toggleLoop = () =>
    dispatch({ type: "SET_LOOP", loop: !state.loop });

  return (
    <div
      style={{
        height: TOOLBAR_HEIGHT,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        backgroundColor: colors.surface,
        borderTop: `1px solid ${colors.border}`,
        borderBottom: `1px solid ${colors.border}`,
        padding: "0 12px",
      }}
    >
      {/* Transport controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
        <button
          title="Previous frame (Left)"
          style={btnBase}
          onClick={prevFrame}
          onMouseEnter={hoverOn}
          onMouseLeave={hoverOff}
          onMouseDown={pressOn}
          onMouseUp={hoverOn}
        >
          |&#x25C0;
        </button>
        <button
          title={state.playing ? "Pause (Space)" : "Play (Space)"}
          style={{ ...btnBase, fontSize: 18 }}
          onClick={togglePlay}
          onMouseEnter={hoverOn}
          onMouseLeave={hoverOff}
          onMouseDown={pressOn}
          onMouseUp={hoverOn}
        >
          {state.playing ? "\u23F8" : "\u25B6"}
        </button>
        <button
          title="Next frame (Right)"
          style={btnBase}
          onClick={nextFrame}
          onMouseEnter={hoverOn}
          onMouseLeave={hoverOff}
          onMouseDown={pressOn}
          onMouseUp={hoverOn}
        >
          &#x25B6;|
        </button>
      </div>

      {/* Timecode display */}
      <div
        style={{
          fontFamily: MONO_FONT,
          fontSize: 12,
          color: colors.text,
          letterSpacing: "0.05em",
          whiteSpace: "nowrap",
        }}
      >
        {formatTimecode(state.frame, state.fps)}
        <span style={{ color: colors.textMuted }}> / </span>
        {formatTimecode(state.durationInFrames, state.fps)}
      </div>

      {/* Playback rate */}
      <select
        value={state.playbackRate}
        onChange={(e) =>
          dispatch({ type: "SET_PLAYBACK_RATE", playbackRate: Number(e.target.value) })
        }
        onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = colors.accent; el.style.backgroundColor = colors.surfaceHover; }}
        onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = colors.border; el.style.backgroundColor = colors.bg; }}
        onMouseDown={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = colors.accentHover; el.style.backgroundColor = colors.surface; }}
        onMouseUp={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = colors.accent; el.style.backgroundColor = colors.surfaceHover; }}
        style={{
          background: colors.bg,
          color: colors.text,
          border: `1px solid ${colors.border}`,
          borderRadius: BORDER_RADIUS,
          padding: "2px 6px",
          fontSize: 11,
          fontFamily: MONO_FONT,
          outline: "none",
          cursor: "pointer",
          transition: TRANSITION,
        }}
      >
        {RATES.map((r) => (
          <option key={r} value={r}>
            {r}x
          </option>
        ))}
      </select>

      {/* Loop toggle */}
      <button
        title="Toggle loop"
        style={{
          ...btnBase,
          color: state.loop ? colors.accent : colors.textMuted,
        }}
        onClick={toggleLoop}
        onMouseEnter={hoverOn}
        onMouseLeave={hoverOff}
        onMouseDown={pressOn}
        onMouseUp={hoverOn}
      >
        &#x27F3;
      </button>
    </div>
  );
};
