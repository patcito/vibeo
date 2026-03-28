import React from "react";
import type { Track } from "../types.js";
import { colors } from "../theme/colors.js";
import {
  FONT_FAMILY,
  TIMELINE_TRACK_HEIGHT,
  TRACK_LABEL_WIDTH,
} from "../theme/styles.js";
import { useEditor } from "../state/editor-state.js";
import { TimelineClip } from "./TimelineClip.js";

export interface TimelineTrackProps {
  track: Track;
  index: number;
  pixelsPerFrame: number;
  totalWidth: number;
}

export const TimelineTrack: React.FC<TimelineTrackProps> = ({
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

      {/* Clips area */}
      <div
        style={{
          width: totalWidth,
          position: "relative",
          flexShrink: 0,
          backgroundColor: bgColor,
        }}
      >
        {track.clips.map((clip) => (
          <TimelineClip
            key={clip.id}
            clip={clip}
            pixelsPerFrame={pixelsPerFrame}
          />
        ))}
      </div>
    </div>
  );
};
