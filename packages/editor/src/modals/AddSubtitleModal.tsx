import React, { useState, useCallback } from "react";
import { colors } from "../theme/colors.js";
import { BORDER_RADIUS, FONT_FAMILY, TRANSITION } from "../theme/styles.js";
import { useEditor } from "../state/editor-state.js";

interface AddSubtitleModalProps {
  onClose: () => void;
}

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  backgroundColor: colors.modalOverlay,
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  backgroundColor: colors.surface,
  border: `1px solid ${colors.border}`,
  borderRadius: BORDER_RADIUS * 2,
  padding: 24,
  width: 400,
  maxWidth: "90vw",
  fontFamily: FONT_FAMILY,
  color: colors.text,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "6px 10px",
  backgroundColor: colors.bg,
  color: colors.text,
  border: `1px solid ${colors.border}`,
  borderRadius: 4,
  fontSize: 13,
  fontFamily: FONT_FAMILY,
  outline: "none",
  boxSizing: "border-box",
  marginBottom: 12,
  transition: TRANSITION,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  color: colors.textMuted,
  marginBottom: 4,
};

export const AddSubtitleModal: React.FC<AddSubtitleModalProps> = ({
  onClose,
}) => {
  const [, dispatch] = useEditor();
  const [text, setText] = useState("");
  const [startFrame, setStartFrame] = useState(0);
  const [endFrame, setEndFrame] = useState(90);

  const handleAdd = useCallback(() => {
    const trackId = `track-${Date.now()}`;
    const clipId = `clip-${Date.now()}`;
    const duration = Math.max(1, endFrame - startFrame);

    dispatch({
      type: "ADD_TRACK",
      track: {
        id: trackId,
        name: "Subtitles",
        type: "subtitle",
        clips: [],
        visible: true,
        muted: false,
      },
    });

    dispatch({
      type: "ADD_CLIP",
      clip: {
        id: clipId,
        trackId,
        name: text.slice(0, 30) || "Subtitle",
        from: startFrame,
        durationInFrames: duration,
        type: "subtitle",
        data: {
          text,
          fontSize: 24,
          color: colors.text,
          position: "bottom",
        },
      },
    });

    onClose();
  }, [dispatch, text, startFrame, endFrame, onClose]);

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h3
          style={{
            margin: "0 0 16px",
            fontSize: 16,
            fontWeight: 600,
          }}
        >
          Add Subtitle Track
        </h3>

        <label style={labelStyle}>Cue Text</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="Enter subtitle text or paste SRT..."
          style={{ ...inputStyle, resize: "vertical" }}
        />

        <label style={labelStyle}>Start Frame</label>
        <input
          type="number"
          value={startFrame}
          onChange={(e) => setStartFrame(Math.max(0, Number(e.target.value)))}
          min={0}
          style={inputStyle}
        />

        <label style={labelStyle}>End Frame</label>
        <input
          type="number"
          value={endFrame}
          onChange={(e) => setEndFrame(Math.max(1, Number(e.target.value)))}
          min={1}
          style={inputStyle}
        />

        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "flex-end",
            marginTop: 8,
          }}
        >
          <button
            type="button"
            onClick={onClose}
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
            style={{
              padding: "8px 16px",
              backgroundColor: colors.bg,
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: BORDER_RADIUS,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: FONT_FAMILY,
              transition: TRANSITION,
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAdd}
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
            style={{
              padding: "8px 16px",
              backgroundColor: colors.accent,
              color: colors.text,
              border: "none",
              borderRadius: BORDER_RADIUS,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: FONT_FAMILY,
              transition: TRANSITION,
            }}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};
