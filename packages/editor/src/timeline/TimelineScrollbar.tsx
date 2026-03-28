import React, { useState, useRef, useEffect, useCallback } from "react";
import { colors } from "../theme/colors.js";

interface TimelineScrollbarProps {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  totalWidth: number;
}

export const TimelineScrollbar: React.FC<TimelineScrollbarProps> = ({
  scrollRef,
  totalWidth,
}) => {
  const barRef = useRef<HTMLDivElement>(null);
  const [scrollFraction, setScrollFraction] = useState(0);
  const [viewRatio, setViewRatio] = useState(1);
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, scrollLeft: 0 });

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;
    const update = () => {
      const vw = scrollEl.clientWidth;
      const ratio = Math.min(1, vw / Math.max(totalWidth, 1));
      const maxScroll = Math.max(0, totalWidth - vw);
      const frac = maxScroll > 0 ? scrollEl.scrollLeft / maxScroll : 0;
      setViewRatio(ratio);
      setScrollFraction(frac);
    };
    update();
    scrollEl.addEventListener("scroll", update);
    const ro = new ResizeObserver(update);
    ro.observe(scrollEl);
    return () => {
      scrollEl.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [scrollRef, totalWidth]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      dragging.current = true;
      dragStart.current = {
        x: e.clientX,
        scrollLeft: scrollRef.current?.scrollLeft ?? 0,
      };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [scrollRef],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      const scrollEl = scrollRef.current;
      const barEl = barRef.current;
      if (!scrollEl || !barEl) return;
      const dx = e.clientX - dragStart.current.x;
      const barWidth = barEl.clientWidth;
      const thumbW = Math.max(viewRatio * barWidth, 20);
      const maxThumbMove = barWidth - thumbW;
      const maxScroll = totalWidth - scrollEl.clientWidth;
      const ratio = maxThumbMove > 0 ? maxScroll / maxThumbMove : 0;
      scrollEl.scrollLeft = dragStart.current.scrollLeft + dx * ratio;
    },
    [scrollRef, totalWidth, viewRatio],
  );

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  if (viewRatio >= 1) return <div style={{ flex: 1 }} />;

  const thumbPercent = Math.max(viewRatio * 100, 5);
  const maxTrack = 100 - thumbPercent;
  const thumbLeft = scrollFraction * maxTrack;

  return (
    <div
      ref={barRef}
      style={{
        flex: 1,
        height: 8,
        backgroundColor: colors.bg,
        borderRadius: 4,
        position: "relative",
        cursor: "pointer",
      }}
    >
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          position: "absolute",
          left: `${thumbLeft}%`,
          width: `${thumbPercent}%`,
          height: "100%",
          backgroundColor: colors.border,
          borderRadius: 4,
          cursor: "grab",
          touchAction: "none",
        }}
      />
    </div>
  );
};
