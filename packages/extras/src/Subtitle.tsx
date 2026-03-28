import React from "react";
import { useSubtitle } from "./hooks/use-subtitle.js";
import type { SubtitleProps } from "./types.js";

const positionStyles: Record<string, React.CSSProperties> = {
  top: { top: "5%", bottom: "auto" },
  center: { top: "50%", bottom: "auto", transform: "translateY(-50%)" },
  bottom: { bottom: "5%", top: "auto" },
};

/**
 * Renders subtitle cues synchronized to the current frame.
 *
 * Supports SRT and VTT formats. Fades cues in/out over 3 frames.
 */
export function Subtitle({
  src,
  format = "auto",
  style,
  position = "bottom",
  fontSize = 24,
  color = "white",
  outlineColor = "black",
  outlineWidth = 2,
}: SubtitleProps): React.ReactNode {
  const { activeCue, opacity } = useSubtitle(src, format);

  if (!activeCue) return null;

  const ow = outlineWidth;
  const oc = outlineColor;
  const textShadow = `${ow}px ${ow}px 0 ${oc}, -${ow}px ${ow}px 0 ${oc}, ${ow}px -${ow}px 0 ${oc}, -${ow}px -${ow}px 0 ${oc}`;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
        ...positionStyles[position],
        ...style,
      }}
    >
      <div
        style={{
          fontSize,
          color,
          textShadow,
          textAlign: "center",
          opacity,
          transition: "none",
          maxWidth: "80%",
          lineHeight: 1.4,
        }}
        dangerouslySetInnerHTML={{ __html: activeCue.text }}
      />
    </div>
  );
}
