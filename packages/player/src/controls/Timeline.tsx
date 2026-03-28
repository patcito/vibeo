import { useRef, useCallback } from "react";

interface TimelineProps {
  currentFrame: number;
  durationInFrames: number;
  firstFrame: number;
  onSeek: (frame: number) => void;
}

export function Timeline({
  currentFrame,
  durationInFrames,
  firstFrame,
  onSeek,
}: TimelineProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const frameFromEvent = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      const bar = barRef.current;
      if (!bar) return currentFrame;
      const rect = bar.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      return Math.round(firstFrame + ratio * (durationInFrames - 1));
    },
    [currentFrame, durationInFrames, firstFrame],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      draggingRef.current = true;
      onSeek(frameFromEvent(e));

      const handleMouseMove = (ev: MouseEvent) => {
        if (draggingRef.current) {
          onSeek(frameFromEvent(ev));
        }
      };

      const handleMouseUp = () => {
        draggingRef.current = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [frameFromEvent, onSeek],
  );

  const progress =
    durationInFrames <= 1
      ? 0
      : ((currentFrame - firstFrame) / (durationInFrames - 1)) * 100;

  return (
    <div
      ref={barRef}
      onMouseDown={handleMouseDown}
      style={{
        flex: 1,
        height: 6,
        background: "rgba(255,255,255,0.2)",
        borderRadius: 3,
        cursor: "pointer",
        position: "relative",
      }}
    >
      <div
        style={{
          width: `${progress}%`,
          height: "100%",
          background: "white",
          borderRadius: 3,
          transition: "width 0.05s linear",
        }}
      />
    </div>
  );
}
