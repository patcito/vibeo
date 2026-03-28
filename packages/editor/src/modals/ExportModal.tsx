import React, { useState } from "react";
import { colors } from "../theme/colors.js";
import { BORDER_RADIUS, FONT_FAMILY, TRANSITION, MONO_FONT } from "../theme/styles.js";
import { useEditor } from "../state/editor-state.js";

interface ExportModalProps {
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
  width: 460,
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
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const primaryBtnStyle: React.CSSProperties = {
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
};

const secondaryBtnStyle: React.CSSProperties = {
  padding: "8px 16px",
  backgroundColor: colors.bg,
  color: colors.text,
  border: `1px solid ${colors.border}`,
  borderRadius: BORDER_RADIUS,
  fontSize: 13,
  cursor: "pointer",
  fontFamily: FONT_FAMILY,
  transition: TRANSITION,
};

function hoverOn(e: React.MouseEvent) {
  (e.currentTarget as HTMLElement).style.filter = "brightness(1.2)";
}
function hoverOff(e: React.MouseEvent) {
  (e.currentTarget as HTMLElement).style.filter = "";
}
function pressOn(e: React.MouseEvent) {
  (e.currentTarget as HTMLElement).style.filter = "brightness(0.9)";
}

export const ExportModal: React.FC<ExportModalProps> = ({ onClose }) => {
  const [state] = useEditor();
  const [codec, setCodec] = useState("h264");
  const [outputFilename, setOutputFilename] = useState("output.mp4");
  const [startFrame, setStartFrame] = useState(0);
  const [endFrame, setEndFrame] = useState(state.durationInFrames - 1);
  const [quality, setQuality] = useState(80);
  const [concurrency, setConcurrency] = useState(4);

  const handleRender = () => {
    // Placeholder — in Phase 7 this will call renderVideo() from @vibeo/cli
    onClose();
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h3
          style={{
            margin: "0 0 20px",
            fontSize: 16,
            fontWeight: 600,
            color: colors.text,
          }}
        >
          Export / Render
        </h3>

        {/* Codec */}
        <label style={labelStyle}>Codec</label>
        <select
          value={codec}
          onChange={(e) => setCodec(e.target.value)}
          style={{ ...inputStyle, cursor: "pointer" }}
        >
          <option value="h264">H.264 (MP4)</option>
          <option value="h265">H.265 (MP4)</option>
          <option value="vp9">VP9 (WebM)</option>
          <option value="prores">ProRes</option>
        </select>

        {/* Output filename */}
        <label style={labelStyle}>Output Filename</label>
        <input
          type="text"
          value={outputFilename}
          onChange={(e) => setOutputFilename(e.target.value)}
          style={inputStyle}
        />

        {/* Frame range */}
        <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Start Frame</label>
            <input
              type="number"
              value={startFrame}
              onChange={(e) =>
                setStartFrame(Math.max(0, Number(e.target.value)))
              }
              min={0}
              max={endFrame}
              style={{ ...inputStyle, marginBottom: 0, fontFamily: MONO_FONT }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>End Frame</label>
            <input
              type="number"
              value={endFrame}
              onChange={(e) =>
                setEndFrame(
                  Math.min(
                    state.durationInFrames - 1,
                    Math.max(startFrame, Number(e.target.value)),
                  ),
                )
              }
              min={startFrame}
              max={state.durationInFrames - 1}
              style={{ ...inputStyle, marginBottom: 0, fontFamily: MONO_FONT }}
            />
          </div>
        </div>

        {/* Quality */}
        <label style={labelStyle}>Quality ({quality})</label>
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
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            min={0}
            max={100}
            step={1}
            style={{
              flex: 1,
              accentColor: colors.accent,
              backgroundColor: colors.bg,
              border: `1px solid ${colors.border}`,
              borderRadius: 4,
              height: 6,
            }}
          />
          <span
            style={{
              fontSize: 12,
              color: colors.text,
              minWidth: 32,
              textAlign: "right",
              fontFamily: MONO_FONT,
            }}
          >
            {quality}
          </span>
        </div>

        {/* Concurrency */}
        <label style={labelStyle}>Concurrency</label>
        <input
          type="number"
          value={concurrency}
          onChange={(e) =>
            setConcurrency(Math.max(1, Math.min(32, Number(e.target.value))))
          }
          min={1}
          max={32}
          style={{ ...inputStyle, fontFamily: MONO_FONT }}
        />

        {/* Actions */}
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
            style={secondaryBtnStyle}
            onMouseEnter={hoverOn}
            onMouseLeave={hoverOff}
            onMouseDown={pressOn}
            onMouseUp={hoverOn}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleRender}
            style={primaryBtnStyle}
            onMouseEnter={hoverOn}
            onMouseLeave={hoverOff}
            onMouseDown={pressOn}
            onMouseUp={hoverOn}
          >
            Render
          </button>
        </div>
      </div>
    </div>
  );
};
