import React, { useState, useEffect } from "react";
import { colors } from "../theme/colors.js";
import { BORDER_RADIUS, FONT_FAMILY, MONO_FONT, TRANSITION } from "../theme/styles.js";

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
  width: 480,
  maxWidth: "90vw",
  maxHeight: "80vh",
  overflow: "auto",
  fontFamily: FONT_FAMILY,
  color: colors.text,
};

const shortcuts: { key: string; description: string }[] = [
  { key: "Space", description: "Play / Pause" },
  { key: "\u2190", description: "Previous frame" },
  { key: "\u2192", description: "Next frame" },
  { key: "Shift + \u2190", description: "Jump 10 frames back" },
  { key: "Shift + \u2192", description: "Jump 10 frames forward" },
  { key: "Ctrl/\u2318 + Z", description: "Undo" },
  { key: "Ctrl/\u2318 + Shift + Z", description: "Redo" },
  { key: "Delete / Backspace", description: "Delete selected clip" },
  { key: "Escape", description: "Deselect clip" },
  { key: "?", description: "Show keyboard shortcuts" },
];

const kbdStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "2px 8px",
  backgroundColor: colors.bg,
  border: `1px solid ${colors.border}`,
  borderRadius: 4,
  fontFamily: MONO_FONT,
  fontSize: 12,
  color: colors.text,
  whiteSpace: "nowrap",
};

const closeBtnStyle: React.CSSProperties = {
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

export const KeyboardShortcutsModal: React.FC = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT"
      ) {
        return;
      }

      if (e.key === "?" || (e.shiftKey && e.code === "Slash")) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }

      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  if (!open) return null;

  return (
    <div style={overlayStyle} onClick={() => setOpen(false)}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h3
          style={{
            margin: "0 0 20px",
            fontSize: 16,
            fontWeight: 600,
            color: colors.text,
          }}
        >
          Keyboard Shortcuts
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: "10px 16px",
            alignItems: "center",
          }}
        >
          {shortcuts.map((s) => (
            <React.Fragment key={s.key}>
              <span style={kbdStyle}>{s.key}</span>
              <span style={{ fontSize: 13, color: colors.textMuted }}>
                {s.description}
              </span>
            </React.Fragment>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: 20,
          }}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            style={closeBtnStyle}
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
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
