import React, { useCallback, useState } from "react";
import { colors } from "../theme/colors.js";
import { BORDER_RADIUS, FONT_FAMILY, TRANSITION } from "../theme/styles.js";
import { useEditor } from "../state/editor-state.js";
import {
  NumberInput,
  TextInput,
  TextAreaInput,
  SliderInput,
  ToggleInput,
  SelectInput,
  ColorInput,
} from "./PropEditor.js";
import { ExportModal } from "../modals/ExportModal.js";
import type { Clip, EditorAction } from "../types.js";

const sectionHeader: React.CSSProperties = {
  padding: "12px 16px",
  fontSize: 13,
  fontWeight: 600,
  color: colors.textMuted,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  borderBottom: `1px solid ${colors.border}`,
};

const sectionBody: React.CSSProperties = {
  padding: "12px 16px",
};

function findSelectedClip(
  tracks: { clips: Clip[] }[],
  clipId: string | null,
): Clip | null {
  if (!clipId) return null;
  for (const track of tracks) {
    const clip = track.clips.find((c) => c.id === clipId);
    if (clip) return clip;
  }
  return null;
}

const SceneClipProps: React.FC<{ clip: Clip; dispatch: React.Dispatch<EditorAction> }> = ({
  clip,
  dispatch,
}) => {
  const data = clip.data ?? {};
  return (
    <>
      <NumberInput
        label="Width"
        value={data.width ?? 1920}
        onChange={() => {}}
        readOnly
      />
      <NumberInput
        label="Height"
        value={data.height ?? 1080}
        onChange={() => {}}
        readOnly
      />
      <NumberInput
        label="FPS"
        value={data.fps ?? 30}
        onChange={() => {}}
        readOnly
      />
    </>
  );
};

const AudioClipProps: React.FC<{ clip: Clip; dispatch: React.Dispatch<EditorAction> }> = ({
  clip,
  dispatch,
}) => {
  const data = clip.data ?? {};
  return (
    <>
      <TextInput
        label="Source"
        value={data.src ?? ""}
        onChange={(src) =>
          dispatch({ type: "UPDATE_CLIP", clipId: clip.id, updates: { data: { src } } })
        }
      />
      <SliderInput
        label="Volume"
        value={data.volume ?? 1}
        onChange={(volume) =>
          dispatch({ type: "UPDATE_CLIP", clipId: clip.id, updates: { data: { volume } } })
        }
        min={0}
        max={1}
        step={0.01}
      />
      <NumberInput
        label="Playback Rate"
        value={data.playbackRate ?? 1}
        onChange={(playbackRate) =>
          dispatch({ type: "UPDATE_CLIP", clipId: clip.id, updates: { data: { playbackRate } } })
        }
        min={0.1}
        max={4}
        step={0.1}
      />
      <ToggleInput
        label="Muted"
        value={data.muted ?? false}
        onChange={(muted) =>
          dispatch({ type: "UPDATE_CLIP", clipId: clip.id, updates: { data: { muted } } })
        }
      />
    </>
  );
};

const SubtitleClipProps: React.FC<{ clip: Clip; dispatch: React.Dispatch<EditorAction> }> = ({
  clip,
  dispatch,
}) => {
  const data = clip.data ?? {};
  return (
    <>
      <TextAreaInput
        label="Text"
        value={data.text ?? ""}
        onChange={(text) =>
          dispatch({ type: "UPDATE_CLIP", clipId: clip.id, updates: { data: { text } } })
        }
      />
      <NumberInput
        label="Font Size"
        value={data.fontSize ?? 24}
        onChange={(fontSize) =>
          dispatch({ type: "UPDATE_CLIP", clipId: clip.id, updates: { data: { fontSize } } })
        }
        min={8}
        max={120}
      />
      <ColorInput
        label="Color"
        value={data.color ?? colors.text}
        onChange={(color) =>
          dispatch({ type: "UPDATE_CLIP", clipId: clip.id, updates: { data: { color } } })
        }
      />
      <SelectInput
        label="Position"
        value={data.position ?? "bottom"}
        onChange={(position) =>
          dispatch({ type: "UPDATE_CLIP", clipId: clip.id, updates: { data: { position } } })
        }
        options={[
          { value: "top", label: "Top" },
          { value: "bottom", label: "Bottom" },
        ]}
      />
    </>
  );
};

export const PropertiesPanel: React.FC = () => {
  const [state, dispatch] = useEditor();
  const clip = findSelectedClip(state.tracks, state.selectedClipId);
  const [showExportModal, setShowExportModal] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "auto",
      }}
    >
      <div style={sectionHeader}>
        Properties{clip ? ` — ${clip.name}` : ""}
      </div>

      <div style={sectionBody}>
        {clip ? (
          <>
            {/* Common fields */}
            <TextInput
              label="Name"
              value={clip.name}
              onChange={(name) =>
                dispatch({ type: "UPDATE_CLIP", clipId: clip.id, updates: { name } })
              }
            />
            <NumberInput
              label="From Frame"
              value={clip.from}
              onChange={(from) =>
                dispatch({
                  type: "MOVE_CLIP",
                  clipId: clip.id,
                  from: Math.max(0, from),
                })
              }
              min={0}
            />
            <NumberInput
              label="Duration (frames)"
              value={clip.durationInFrames}
              onChange={(dur) =>
                dispatch({
                  type: "RESIZE_CLIP",
                  clipId: clip.id,
                  from: clip.from,
                  durationInFrames: Math.max(1, dur),
                })
              }
              min={1}
            />

            {/* Type-specific */}
            {clip.type === "scene" && (
              <SceneClipProps clip={clip} dispatch={dispatch} />
            )}
            {clip.type === "audio" && (
              <AudioClipProps clip={clip} dispatch={dispatch} />
            )}
            {clip.type === "subtitle" && (
              <SubtitleClipProps clip={clip} dispatch={dispatch} />
            )}
          </>
        ) : (
          <>
            {/* Composition info */}
            <div
              style={{
                fontSize: 13,
                color: colors.text,
                marginBottom: 16,
              }}
            >
              <div style={{ marginBottom: 8, color: colors.textMuted, fontSize: 11 }}>
                COMPOSITION
              </div>
              <div style={{ marginBottom: 6 }}>
                Canvas: {state.compositionWidth} × {state.compositionHeight}
              </div>
              <div style={{ marginBottom: 6 }}>
                Duration: {state.durationInFrames} frames
              </div>
              <div>FPS: {state.fps}</div>
            </div>
          </>
        )}
      </div>

      {/* Export section */}
      <div
        style={{
          marginTop: "auto",
          borderTop: `1px solid ${colors.border}`,
          padding: "12px 16px",
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: colors.textMuted,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: 10,
          }}
        >
          Export
        </div>
        <SelectInput
          label="Codec"
          value="h264"
          onChange={() => {}}
          options={[
            { value: "h264", label: "MP4 (H.264)" },
            { value: "h265", label: "MP4 (H.265)" },
            { value: "vp9", label: "WebM (VP9)" },
            { value: "prores", label: "ProRes" },
          ]}
        />
        <button
          type="button"
          onClick={() => setShowExportModal(true)}
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
            width: "100%",
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
          Render video
        </button>
      </div>

      {showExportModal && (
        <ExportModal onClose={() => setShowExportModal(false)} />
      )}
    </div>
  );
};
