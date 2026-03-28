import React, { useRef, useCallback } from "react";
import type { Track } from "../types.js";
import { colors } from "../theme/colors.js";
import { FONT_FAMILY, TRACK_LABEL_WIDTH, TRANSITION } from "../theme/styles.js";
import { useEditor } from "../state/editor-state.js";
import { TimelineRuler } from "./TimelineRuler.js";
import { TimelineTrack } from "./TimelineTrack.js";
import { AudioWaveformTrack } from "./AudioWaveformTrack.js";
import { SubtitleTrack } from "./SubtitleTrack.js";
import { TimelineCursor } from "./TimelineCursor.js";
import { TimelineScrollbar } from "./TimelineScrollbar.js";

const BASE_PIXELS_PER_FRAME = 2;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 10;

export const Timeline: React.FC = () => {
  const [state, dispatch] = useEditor();
  const scrollRef = useRef<HTMLDivElement>(null);

  const pixelsPerFrame = BASE_PIXELS_PER_FRAME * state.zoom;
  const totalWidth = state.durationInFrames * pixelsPerFrame;
  const contentWidth = totalWidth + TRACK_LABEL_WIDTH;

  const handleZoomIn = useCallback(() => {
    dispatch({
      type: "SET_ZOOM",
      zoom: Math.min(MAX_ZOOM, state.zoom * 1.5),
    });
  }, [dispatch, state.zoom]);

  const handleZoomOut = useCallback(() => {
    dispatch({
      type: "SET_ZOOM",
      zoom: Math.max(MIN_ZOOM, state.zoom / 1.5),
    });
  }, [dispatch, state.zoom]);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const newZoom =
          e.deltaY < 0
            ? Math.min(MAX_ZOOM, state.zoom * 1.2)
            : Math.max(MIN_ZOOM, state.zoom / 1.2);
        dispatch({ type: "SET_ZOOM", zoom: newZoom });
      }
    },
    [dispatch, state.zoom],
  );

  const renderTrack = (track: Track, index: number) => {
    const props = { track, index, pixelsPerFrame, totalWidth };
    switch (track.type) {
      case "audio":
        return <AudioWaveformTrack key={track.id} {...props} />;
      case "subtitle":
        return <SubtitleTrack key={track.id} {...props} />;
      default:
        return <TimelineTrack key={track.id} {...props} />;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: colors.bg,
      }}
    >
      {/* Scrollable timeline area */}
      <div
        ref={scrollRef}
        onWheel={handleWheel}
        style={{
          flex: 1,
          overflowX: "auto",
          overflowY: "hidden",
          scrollbarWidth: "none",
        }}
      >
        <div
          style={{
            position: "relative",
            width: contentWidth,
            minWidth: "100%",
          }}
        >
          <TimelineRuler
            pixelsPerFrame={pixelsPerFrame}
            totalWidth={totalWidth}
            fps={state.fps}
            durationInFrames={state.durationInFrames}
          />
          {state.tracks.map(renderTrack)}
          <TimelineCursor
            pixelsPerFrame={pixelsPerFrame}
            durationInFrames={state.durationInFrames}
            scrollContainerRef={scrollRef}
          />
        </div>
      </div>

      {/* Footer: scrollbar + zoom controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "4px 8px",
          borderTop: `1px solid ${colors.border}`,
          backgroundColor: colors.surface,
          gap: 8,
          flexShrink: 0,
        }}
      >
        <TimelineScrollbar scrollRef={scrollRef} totalWidth={contentWidth} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            flexShrink: 0,
          }}
        >
          <button
            onClick={handleZoomOut}
            style={zoomBtnStyle}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.filter = "brightness(1.2)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.filter = "";
            }}
            onMouseDown={(e) => {
              (e.currentTarget as HTMLElement).style.filter = "brightness(0.9)";
            }}
            onMouseUp={(e) => {
              (e.currentTarget as HTMLElement).style.filter = "brightness(1.2)";
            }}
          >
            −
          </button>
          <span
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: 11,
              color: colors.textMuted,
              minWidth: 40,
              textAlign: "center",
            }}
          >
            {Math.round(state.zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            style={zoomBtnStyle}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.filter = "brightness(1.2)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.filter = "";
            }}
            onMouseDown={(e) => {
              (e.currentTarget as HTMLElement).style.filter = "brightness(0.9)";
            }}
            onMouseUp={(e) => {
              (e.currentTarget as HTMLElement).style.filter = "brightness(1.2)";
            }}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};

const zoomBtnStyle: React.CSSProperties = {
  width: 24,
  height: 24,
  border: `1px solid ${colors.border}`,
  borderRadius: 4,
  backgroundColor: colors.surface,
  color: colors.text,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 14,
  fontFamily: FONT_FAMILY,
  padding: 0,
  transition: TRANSITION,
};
