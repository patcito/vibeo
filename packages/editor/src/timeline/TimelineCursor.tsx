import React, { useCallback, useRef } from "react";
import { colors } from "../theme/colors.js";
import { TRACK_LABEL_WIDTH } from "../theme/styles.js";
import { useEditor } from "../state/editor-state.js";

interface TimelineCursorProps {
  pixelsPerFrame: number;
  durationInFrames: number;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

export const TimelineCursor: React.FC<TimelineCursorProps> = ({
  pixelsPerFrame,
  durationInFrames,
  scrollContainerRef,
}) => {
  const [state, dispatch] = useEditor();
  const dragging = useRef(false);

  const left = state.frame * pixelsPerFrame + TRACK_LABEL_WIDTH;

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    e.stopPropagation();
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      const scrollEl = scrollContainerRef.current;
      if (!scrollEl) return;
      const rect = scrollEl.getBoundingClientRect();
      const contentX = e.clientX - rect.left + scrollEl.scrollLeft;
      const frame = Math.round(
        (contentX - TRACK_LABEL_WIDTH) / pixelsPerFrame,
      );
      const clamped = Math.max(0, Math.min(durationInFrames, frame));
      dispatch({ type: "SET_FRAME", frame: clamped });
    },
    [scrollContainerRef, pixelsPerFrame, durationInFrames, dispatch],
  );

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        left,
        top: 0,
        bottom: 0,
        width: 1,
        backgroundColor: colors.accent,
        pointerEvents: "none",
        zIndex: 10,
      }}
    >
      {/* Draggable triangle handle */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{
          position: "absolute",
          top: 0,
          left: -6,
          width: 13,
          height: 14,
          cursor: "ew-resize",
          pointerEvents: "auto",
          touchAction: "none",
        }}
      >
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderTop: `10px solid ${colors.accent}`,
          }}
        />
      </div>
    </div>
  );
};
