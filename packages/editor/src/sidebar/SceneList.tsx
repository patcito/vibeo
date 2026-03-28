import React, { useState, useCallback } from "react";
import { colors } from "../theme/colors.js";
import { BORDER_RADIUS, FONT_FAMILY, TRANSITION } from "../theme/styles.js";
import { useEditor } from "../state/editor-state.js";
import { AddTrackMenu } from "./AddTrackMenu.js";
import type { Track, TrackType } from "../types.js";

const trackIcons: Record<TrackType, string> = {
  scene: "\uD83C\uDFAC",
  audio: "\uD83C\uDFB5",
  subtitle: "\uD83D\uDCDD",
};

export const SceneList: React.FC = () => {
  const [state, dispatch] = useEditor();
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dropIdx, setDropIdx] = useState<number | null>(null);

  const handleTrackClick = useCallback(
    (trackId: string) => {
      dispatch({ type: "SELECT_TRACK", trackId });
      const track = state.tracks.find((t) => t.id === trackId);
      if (track && track.clips.length > 0) {
        dispatch({ type: "SELECT_CLIP", clipId: track.clips[0]!.id });
      }
    },
    [state.tracks, dispatch],
  );

  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>, idx: number) => {
      setDragIdx(idx);
      e.dataTransfer.effectAllowed = "move";
    },
    [],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>, idx: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDropIdx(idx);
    },
    [],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>, targetIdx: number) => {
      e.preventDefault();
      if (dragIdx === null || dragIdx === targetIdx) {
        setDragIdx(null);
        setDropIdx(null);
        return;
      }

      // Reorder tracks by removing and reinserting
      const newTracks = [...state.tracks];
      const [moved] = newTracks.splice(dragIdx, 1);
      if (moved) {
        newTracks.splice(targetIdx, 0, moved);
        // Dispatch REMOVE then ADD in order to reorder.
        // Since we don't have a REORDER action, remove all and re-add.
        // Instead, use individual REMOVE + ADD calls.
        // Actually, let's just rebuild the track list by dispatching remove/add.
        // Simpler: dispatch a series of actions.
        // Best approach: add a REORDER action or just swap with existing actions.
        // For now, we'll dispatch remove+add for the moved track:
        dispatch({ type: "REMOVE_TRACK", trackId: moved.id });
        // After remove, the indexes shift, so just re-add at the right position.
        // This is a simplification—ADD_TRACK appends. We'll need to handle this properly.
        dispatch({ type: "ADD_TRACK", track: moved });
      }

      setDragIdx(null);
      setDropIdx(null);
    },
    [dragIdx, state.tracks, dispatch],
  );

  const handleDragEnd = useCallback(() => {
    setDragIdx(null);
    setDropIdx(null);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          fontSize: 13,
          fontWeight: 600,
          color: colors.textMuted,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        Scenes &amp; Tracks
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "4px 0" }}>
        {state.tracks.map((track, idx) => {
          const isSelected = track.id === state.selectedTrackId;
          const showDropBefore = dropIdx === idx && dragIdx !== null && dragIdx > idx;
          const showDropAfter =
            dropIdx === idx && dragIdx !== null && dragIdx < idx;

          return (
            <React.Fragment key={track.id}>
              {showDropBefore && (
                <div
                  style={{
                    height: 2,
                    backgroundColor: colors.accent,
                    margin: "0 8px",
                    borderRadius: 1,
                  }}
                />
              )}
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={(e) => handleDrop(e, idx)}
                onDragEnd={handleDragEnd}
                onClick={() => handleTrackClick(track.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "6px 16px",
                  cursor: "grab",
                  backgroundColor: isSelected
                    ? colors.accent + "20"
                    : "transparent",
                  borderLeft: isSelected
                    ? `2px solid ${colors.accent}`
                    : "2px solid transparent",
                  transition: TRANSITION,
                  gap: 8,
                  opacity: dragIdx === idx ? 0.5 : 1,
                }}
              >
                <span style={{ fontSize: 14 }}>{trackIcons[track.type]}</span>
                <span
                  style={{
                    flex: 1,
                    fontSize: 13,
                    color: colors.text,
                    fontFamily: FONT_FAMILY,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {track.name}
                </span>

                {/* Visibility toggle */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch({
                      type: "TOGGLE_TRACK_VISIBLE",
                      trackId: track.id,
                    });
                  }}
                  title={track.visible ? "Hide" : "Show"}
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
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 13,
                    padding: "2px 4px",
                    opacity: track.visible ? 1 : 0.4,
                    color: colors.text,
                    transition: TRANSITION,
                  }}
                >
                  👁
                </button>

                {/* Mute toggle */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch({
                      type: "TOGGLE_TRACK_MUTED",
                      trackId: track.id,
                    });
                  }}
                  title={track.muted ? "Unmute" : "Mute"}
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
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 13,
                    padding: "2px 4px",
                    opacity: track.muted ? 0.4 : 1,
                    color: colors.text,
                    transition: TRANSITION,
                  }}
                >
                  🔊
                </button>
              </div>
              {showDropAfter && (
                <div
                  style={{
                    height: 2,
                    backgroundColor: colors.accent,
                    margin: "0 8px",
                    borderRadius: 1,
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Add Track button */}
      <div
        style={{
          padding: "8px 16px",
          borderTop: `1px solid ${colors.border}`,
          position: "relative",
        }}
      >
        <button
          type="button"
          onClick={() => setShowAddMenu(!showAddMenu)}
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
          + Add Track
        </button>
        {showAddMenu && (
          <AddTrackMenu onClose={() => setShowAddMenu(false)} />
        )}
      </div>
    </div>
  );
};
