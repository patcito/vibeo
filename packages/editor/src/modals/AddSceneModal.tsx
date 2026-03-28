import React, { useState, useCallback } from "react";
import { colors } from "../theme/colors.js";
import { BORDER_RADIUS, FONT_FAMILY, TRANSITION } from "../theme/styles.js";
import { useEditor } from "../state/editor-state.js";

interface AddSceneModalProps {
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

export const AddSceneModal: React.FC<AddSceneModalProps> = ({ onClose }) => {
  const [, dispatch] = useEditor();
  const [name, setName] = useState("New Scene");
  const [duration, setDuration] = useState(150);
  const [template, setTemplate] = useState("blank");

  const handleAdd = useCallback(() => {
    const trackId = `track-${Date.now()}`;
    const clipId = `clip-${Date.now()}`;

    dispatch({
      type: "ADD_TRACK",
      track: {
        id: trackId,
        name,
        type: "scene",
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
        name,
        from: 0,
        durationInFrames: duration,
        type: "scene",
        data: { template },
      },
    });

    onClose();
  }, [dispatch, name, duration, template, onClose]);

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
          Add Scene
        </h3>

        <label style={labelStyle}>Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />

        <label style={labelStyle}>Duration (frames)</label>
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(Math.max(1, Number(e.target.value)))}
          min={1}
          style={inputStyle}
        />

        <label style={labelStyle}>Template</label>
        <select
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          style={{ ...inputStyle, cursor: "pointer" }}
        >
          <option value="blank">Blank</option>
          <option value="text">Text</option>
          <option value="gradient">Gradient</option>
        </select>

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
