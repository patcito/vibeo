import React from "react";
import { TIMELINE_TRACK_HEIGHT } from "../theme/styles.js";

interface DragGhostProps {
  x: number;
  y: number;
  width: number;
  color: string;
  visible: boolean;
}

export const DragGhost: React.FC<DragGhostProps> = ({
  x,
  y,
  width,
  color,
  visible,
}) => {
  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: x,
        top: y,
        width: Math.max(width, 2),
        height: TIMELINE_TRACK_HEIGHT - 4,
        backgroundColor: color,
        opacity: 0.4,
        borderRadius: 4,
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  );
};
