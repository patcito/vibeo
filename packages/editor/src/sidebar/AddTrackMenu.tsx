import React, { useState } from "react";
import { colors } from "../theme/colors.js";
import { BORDER_RADIUS, FONT_FAMILY, TRANSITION } from "../theme/styles.js";
import { AddSceneModal } from "../modals/AddSceneModal.js";
import { AddAudioModal } from "../modals/AddAudioModal.js";
import { AddSubtitleModal } from "../modals/AddSubtitleModal.js";

interface AddTrackMenuProps {
  onClose: () => void;
}

type ModalType = "scene" | "audio" | "subtitle" | null;

const menuItemStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "8px 16px",
  backgroundColor: "transparent",
  color: colors.text,
  border: "none",
  fontSize: 13,
  cursor: "pointer",
  textAlign: "left",
  fontFamily: FONT_FAMILY,
  transition: TRANSITION,
};

export const AddTrackMenu: React.FC<AddTrackMenuProps> = ({ onClose }) => {
  const [openModal, setOpenModal] = useState<ModalType>(null);

  const handleItemClick = (type: ModalType) => {
    setOpenModal(type);
    onClose();
  };

  return (
    <>
      <div
        style={{
          position: "absolute",
          bottom: "100%",
          left: 16,
          right: 16,
          marginBottom: 4,
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: BORDER_RADIUS,
          overflow: "hidden",
          zIndex: 100,
          boxShadow: `0 4px 12px ${colors.shadow}`,
        }}
      >
        {(
          [
            ["scene", "🎬 Add Scene"],
            ["audio", "🎵 Add Audio Track"],
            ["subtitle", "📝 Add Subtitle Track"],
          ] as const
        ).map(([type, label]) => (
          <button
            key={type}
            type="button"
            onClick={() => handleItemClick(type)}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.filter =
                "brightness(1.2)";
              (e.currentTarget as HTMLElement).style.backgroundColor =
                colors.surfaceHover;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.filter = "";
              (e.currentTarget as HTMLElement).style.backgroundColor =
                "transparent";
            }}
            onMouseDown={(e) => {
              (e.currentTarget as HTMLElement).style.filter =
                "brightness(0.9)";
            }}
            onMouseUp={(e) => {
              (e.currentTarget as HTMLElement).style.filter =
                "brightness(1.2)";
            }}
            style={menuItemStyle}
          >
            {label}
          </button>
        ))}
      </div>

      {openModal === "scene" && (
        <AddSceneModal onClose={() => setOpenModal(null)} />
      )}
      {openModal === "audio" && (
        <AddAudioModal onClose={() => setOpenModal(null)} />
      )}
      {openModal === "subtitle" && (
        <AddSubtitleModal onClose={() => setOpenModal(null)} />
      )}
    </>
  );
};
