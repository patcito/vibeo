import React, { useState, useCallback } from "react";
import { colors } from "../theme/colors.js";
import { BORDER_RADIUS, FONT_FAMILY, TRANSITION } from "../theme/styles.js";
import { useEditor } from "../state/editor-state.js";

interface AddAudioModalProps {
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

export const AddAudioModal: React.FC<AddAudioModalProps> = ({ onClose }) => {
  const [, dispatch] = useEditor();
  const [src, setSrc] = useState("");
  const [volume, setVolume] = useState(1);

  const handleAdd = useCallback(() => {
    const trackId = `track-${Date.now()}`;
    const clipId = `clip-${Date.now()}`;

    dispatch({
      type: "ADD_TRACK",
      track: {
        id: trackId,
        name: "Audio",
        type: "audio",
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
        name: "Audio",
        from: 0,
        durationInFrames: 300,
        type: "audio",
        data: { src, volume },
      },
    });

    onClose();
  }, [dispatch, src, volume, onClose]);

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
          Add Audio Track
        </h3>

        <label style={labelStyle}>Source URL</label>
        <input
          type="text"
          value={src}
          onChange={(e) => setSrc(e.target.value)}
          placeholder="https://example.com/audio.mp3"
          style={inputStyle}
        />

        <label style={labelStyle}>Volume</label>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 12,
          }}
        >
          <input
            type="range"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            min={0}
            max={1}
            step={0.01}
            style={{
              flex: 1,
              accentColor: colors.accent,
              backgroundColor: colors.bg,
              border: `1px solid ${colors.border}`,
              borderRadius: 4,
              height: 6,
            }}
          />
          <span style={{ fontSize: 12, minWidth: 36, textAlign: "right" }}>
            {volume.toFixed(2)}
          </span>
        </div>

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
