import React, { useState } from "react";
import type { Clip } from "../types.js";
import { colors } from "../theme/colors.js";
import { FONT_FAMILY, TIMELINE_TRACK_HEIGHT, TRANSITION } from "../theme/styles.js";
import { useEditor } from "../state/editor-state.js";
import { useTimelineDrag } from "../hooks/use-timeline-drag.js";
import { DragGhost } from "./DragGhost.js";

interface TimelineClipProps {
  clip: Clip;
  pixelsPerFrame: number;
}

export const TimelineClip: React.FC<TimelineClipProps> = ({
  clip,
  pixelsPerFrame,
}) => {
  const [state, dispatch] = useEditor();
  const [hovered, setHovered] = useState(false);
  const [cursorStyle, setCursorStyle] = useState<string>("grab");
  const left = clip.from * pixelsPerFrame;
  const width = clip.durationInFrames * pixelsPerFrame;
  const isSelected = state.selectedClipId === clip.id;

  const { dragState, onPointerDown, onPointerMove, onPointerUp, getCursorForEdge } =
    useTimelineDrag(clip, pixelsPerFrame);

  const typeColor =
    clip.type === "scene"
      ? colors.scene
      : clip.type === "audio"
        ? colors.audio
        : colors.subtitle;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dispatch({ type: "SELECT_CLIP", clipId: clip.id });
    onPointerDown(e);
  };

  const handlePointerMoveLocal = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.isDragging) {
      const cursor = getCursorForEdge(e, e.currentTarget);
      setCursorStyle(cursor);
    }
    onPointerMove(e);
  };

  const activeCursor = dragState.isDragging
    ? dragState.mode === "move"
      ? "grabbing"
      : "col-resize"
    : cursorStyle;

  return (
    <>
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMoveLocal}
        onPointerUp={onPointerUp}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        style={{
          position: "absolute",
          left,
          width: Math.max(width, 2),
          top: 2,
          height: TIMELINE_TRACK_HEIGHT - 4,
          backgroundColor: typeColor,
          borderRadius: 4,
          border: isSelected
            ? `2px solid ${colors.accent}`
            : `1px solid ${colors.border}80`,
          boxShadow: isSelected ? `0 0 8px ${colors.accent}66` : undefined,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          cursor: activeCursor,
          fontFamily: FONT_FAMILY,
          fontSize: 11,
          color: colors.text,
          userSelect: "none",
          boxSizing: "border-box",
          opacity: dragState.isDragging ? 0.6 : 1,
          transition: dragState.isDragging ? "none" : TRANSITION,
        }}
      >
        {/* Left resize handle */}
        {hovered && (
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 3,
              height: "100%",
              backgroundColor: `${colors.text}66`,
              borderRadius: "4px 0 0 4px",
              cursor: "col-resize",
            }}
          />
        )}

        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            padding: "0 4px",
          }}
        >
          {clip.name}
        </span>

        {/* Right resize handle */}
        {hovered && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              width: 3,
              height: "100%",
              backgroundColor: `${colors.text}66`,
              borderRadius: "0 4px 4px 0",
              cursor: "col-resize",
            }}
          />
        )}
      </div>

      <DragGhost
        x={dragState.ghostX}
        y={dragState.ghostY}
        width={dragState.ghostWidth}
        color={typeColor}
        visible={dragState.isDragging}
      />
    </>
  );
};
