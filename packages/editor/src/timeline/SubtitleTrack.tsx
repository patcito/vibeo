import React, { useState, useRef, useCallback } from "react";
import type { Clip } from "../types.js";
import { colors } from "../theme/colors.js";
import {
  FONT_FAMILY,
  TIMELINE_TRACK_HEIGHT,
  TRACK_LABEL_WIDTH,
} from "../theme/styles.js";
import { useEditor } from "../state/editor-state.js";
import { TimelineClip } from "./TimelineClip.js";
import type { TimelineTrackProps } from "./TimelineTrack.js";

const SubtitleCue: React.FC<{
  clip: Clip;
  pixelsPerFrame: number;
}> = ({ clip, pixelsPerFrame }) => {
  const [, dispatch] = useEditor();
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const cueText: string = clip.data?.text || clip.name;
  const displayText = cueText.length > 20 ? cueText.slice(0, 20) + "\u2026" : cueText;

  const clipWidth = clip.durationInFrames * pixelsPerFrame;
  const clipLeft = clip.from * pixelsPerFrame;

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setEditText(cueText);
      setEditing(true);
      setTimeout(() => textareaRef.current?.focus(), 0);
    },
    [cueText],
  );

  const saveEdit = useCallback(() => {
    setEditing(false);
    dispatch({
      type: "UPDATE_CLIP",
      clipId: clip.id,
      updates: { data: { text: editText } },
    });
  }, [clip.id, dispatch, editText]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setEditing(false);
      } else if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        saveEdit();
      }
    },
    [saveEdit],
  );

  if (editing) {
    return (
      <div
        style={{
          position: "absolute",
          left: clipLeft,
          top: 2,
          width: Math.max(clipWidth, 60),
          height: TIMELINE_TRACK_HEIGHT - 4,
          zIndex: 10,
        }}
      >
        <textarea
          ref={textareaRef}
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={saveEdit}
          onKeyDown={handleKeyDown}
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: colors.surface,
            color: colors.text,
            border: `2px solid ${colors.accent}`,
            borderRadius: 4,
            fontSize: 10,
            fontFamily: FONT_FAMILY,
            padding: "2px 4px",
            resize: "none",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>
    );
  }

  return (
    <div
      onDoubleClick={handleDoubleClick}
      style={{
        position: "absolute",
        left: clipLeft,
        top: 2,
        width: Math.max(clipWidth, 2),
        height: TIMELINE_TRACK_HEIGHT - 4,
        backgroundColor: colors.subtitle,
        borderRadius: 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        cursor: "pointer",
        fontSize: 10,
        fontFamily: FONT_FAMILY,
        color: colors.bg,
        fontWeight: 500,
        userSelect: "none",
        boxSizing: "border-box",
      }}
    >
      <span
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          padding: "0 3px",
        }}
      >
        {displayText}
      </span>
    </div>
  );
};

export const SubtitleTrack: React.FC<TimelineTrackProps> = ({
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

      {/* Subtitle cues area */}
      <div
        style={{
          width: totalWidth,
          position: "relative",
          flexShrink: 0,
          backgroundColor: bgColor,
        }}
      >
        {track.clips.map((clip) => (
          <SubtitleCue
            key={clip.id}
            clip={clip}
            pixelsPerFrame={pixelsPerFrame}
          />
        ))}
      </div>
    </div>
  );
};
