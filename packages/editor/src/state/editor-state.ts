import { createContext, useContext } from "react";
import type { EditorState, EditorAction } from "../types.js";

export const initialEditorState: EditorState = {
  tracks: [],
  selectedTrackId: null,
  selectedClipId: null,
  playing: false,
  frame: 0,
  fps: 30,
  durationInFrames: 300,
  compositionWidth: 1920,
  compositionHeight: 1080,
  playbackRate: 1,
  loop: false,
  activeCompositionId: null,
  zoom: 1,
  scrollX: 0,
};

export function editorReducer(
  state: EditorState,
  action: EditorAction,
): EditorState {
  switch (action.type) {
    case "ADD_TRACK":
      return { ...state, tracks: [...state.tracks, action.track] };

    case "REMOVE_TRACK":
      return {
        ...state,
        tracks: state.tracks.filter((t) => t.id !== action.trackId),
        selectedTrackId:
          state.selectedTrackId === action.trackId
            ? null
            : state.selectedTrackId,
      };

    case "ADD_CLIP":
      return {
        ...state,
        tracks: state.tracks.map((t) =>
          t.id === action.clip.trackId
            ? { ...t, clips: [...t.clips, action.clip] }
            : t,
        ),
      };

    case "REMOVE_CLIP":
      return {
        ...state,
        tracks: state.tracks.map((t) => ({
          ...t,
          clips: t.clips.filter((c) => c.id !== action.clipId),
        })),
        selectedClipId:
          state.selectedClipId === action.clipId
            ? null
            : state.selectedClipId,
      };

    case "MOVE_CLIP": {
      if (action.trackId && action.trackId !== findClipTrack(state, action.clipId)) {
        const clip = findClip(state, action.clipId);
        if (!clip) return state;
        const movedClip = { ...clip, from: action.from, trackId: action.trackId };
        return {
          ...state,
          tracks: state.tracks.map((t) => {
            if (t.id === clip.trackId) {
              return { ...t, clips: t.clips.filter((c) => c.id !== action.clipId) };
            }
            if (t.id === action.trackId) {
              return { ...t, clips: [...t.clips, movedClip] };
            }
            return t;
          }),
        };
      }
      return {
        ...state,
        tracks: state.tracks.map((t) => ({
          ...t,
          clips: t.clips.map((c) =>
            c.id === action.clipId ? { ...c, from: action.from } : c,
          ),
        })),
      };
    }

    case "RESIZE_CLIP":
      return {
        ...state,
        tracks: state.tracks.map((t) => ({
          ...t,
          clips: t.clips.map((c) =>
            c.id === action.clipId
              ? { ...c, from: action.from, durationInFrames: action.durationInFrames }
              : c,
          ),
        })),
      };

    case "UPDATE_CLIP":
      return {
        ...state,
        tracks: state.tracks.map((t) => ({
          ...t,
          clips: t.clips.map((c) =>
            c.id === action.clipId
              ? {
                  ...c,
                  ...(action.updates.name !== undefined ? { name: action.updates.name } : {}),
                  ...(action.updates.data !== undefined ? { data: { ...c.data, ...action.updates.data } } : {}),
                }
              : c,
          ),
        })),
      };

    case "SELECT_CLIP":
      return { ...state, selectedClipId: action.clipId };

    case "SELECT_TRACK":
      return { ...state, selectedTrackId: action.trackId };

    case "SET_FRAME":
      if (state.frame === action.frame) return state;
      return { ...state, frame: action.frame };

    case "SET_PLAYING":
      if (state.playing === action.playing) return state;
      return { ...state, playing: action.playing };

    case "SET_ZOOM":
      if (state.zoom === action.zoom) return state;
      return { ...state, zoom: action.zoom };

    case "SET_SCROLL_X":
      if (state.scrollX === action.scrollX) return state;
      return { ...state, scrollX: action.scrollX };

    case "SET_PLAYBACK_RATE":
      return { ...state, playbackRate: action.playbackRate };

    case "TOGGLE_TRACK_VISIBLE":
      return {
        ...state,
        tracks: state.tracks.map((t) =>
          t.id === action.trackId ? { ...t, visible: !t.visible } : t,
        ),
      };

    case "TOGGLE_TRACK_MUTED":
      return {
        ...state,
        tracks: state.tracks.map((t) =>
          t.id === action.trackId ? { ...t, muted: !t.muted } : t,
        ),
      };

    case "SET_DURATION":
      return { ...state, durationInFrames: action.durationInFrames };

    case "SET_COMPOSITION_SIZE":
      return {
        ...state,
        compositionWidth: action.width,
        compositionHeight: action.height,
      };

    case "SET_LOOP":
      return { ...state, loop: action.loop };

    case "SET_ACTIVE_COMPOSITION":
      return { ...state, activeCompositionId: action.compositionId };

    default:
      return state;
  }
}

function findClip(state: EditorState, clipId: string) {
  for (const track of state.tracks) {
    const clip = track.clips.find((c) => c.id === clipId);
    if (clip) return clip;
  }
  return null;
}

function findClipTrack(state: EditorState, clipId: string): string | null {
  for (const track of state.tracks) {
    if (track.clips.some((c) => c.id === clipId)) return track.id;
  }
  return null;
}

export const EditorContext = createContext<EditorState>(initialEditorState);
export const EditorDispatchContext = createContext<React.Dispatch<EditorAction>>(
  () => {},
);

export function useEditor(): [EditorState, React.Dispatch<EditorAction>] {
  const state = useContext(EditorContext);
  const dispatch = useContext(EditorDispatchContext);
  return [state, dispatch];
}
