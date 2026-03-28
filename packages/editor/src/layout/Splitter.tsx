import React, { useCallback, useRef } from "react";
import { colors } from "../theme/colors.js";

interface SplitterProps {
  direction: "horizontal" | "vertical";
  onResize: (delta: number) => void;
}

export const Splitter: React.FC<SplitterProps> = ({ direction, onResize }) => {
  const dragging = useRef(false);
  const lastPos = useRef(0);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      dragging.current = true;
      lastPos.current = direction === "horizontal" ? e.clientX : e.clientY;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [direction],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      const current = direction === "horizontal" ? e.clientX : e.clientY;
      const delta = current - lastPos.current;
      lastPos.current = current;
      onResize(delta);
    },
    [direction, onResize],
  );

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const isHorizontal = direction === "horizontal";

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{
        width: isHorizontal ? 4 : "100%",
        height: isHorizontal ? "100%" : 4,
        cursor: isHorizontal ? "col-resize" : "row-resize",
        backgroundColor: colors.border,
        flexShrink: 0,
        userSelect: "none",
        touchAction: "none",
      }}
    />
  );
};
