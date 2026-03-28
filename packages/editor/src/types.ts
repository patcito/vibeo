import type { FC } from "react";

export type TrackType = "scene" | "audio" | "subtitle";

export interface Clip {
  id: string;
  trackId: string;
  name: string;
  from: number;
  durationInFrames: number;
  type: TrackType;
  data: any;
}

export interface Track {
  id: string;
  name: string;
  type: TrackType;
  clips: Clip[];
  visible: boolean;
  muted: boolean;
}

export interface EditorState {
  tracks: Track[];
  selectedTrackId: string | null;
  selectedClipId: string | null;
  playing: boolean;
  frame: number;
  fps: number;
  durationInFrames: number;
  compositionWidth: number;
  compositionHeight: number;
  playbackRate: number;
  loop: boolean;
  activeCompositionId: string | null;
  zoom: number;
  scrollX: number;
}

export type EditorAction =
  | { type: "ADD_TRACK"; track: Track }
  | { type: "REMOVE_TRACK"; trackId: string }
  | { type: "ADD_CLIP"; clip: Clip }
  | { type: "REMOVE_CLIP"; clipId: string }
  | { type: "MOVE_CLIP"; clipId: string; from: number; trackId?: string }
  | { type: "RESIZE_CLIP"; clipId: string; from: number; durationInFrames: number }
  | { type: "UPDATE_CLIP"; clipId: string; updates: Partial<Pick<Clip, "name" | "data">> }
  | { type: "SELECT_CLIP"; clipId: string | null }
  | { type: "SELECT_TRACK"; trackId: string | null }
  | { type: "SET_FRAME"; frame: number }
  | { type: "SET_PLAYING"; playing: boolean }
  | { type: "SET_ZOOM"; zoom: number }
  | { type: "SET_SCROLL_X"; scrollX: number }
  | { type: "SET_PLAYBACK_RATE"; playbackRate: number }
  | { type: "TOGGLE_TRACK_VISIBLE"; trackId: string }
  | { type: "TOGGLE_TRACK_MUTED"; trackId: string }
  | { type: "SET_DURATION"; durationInFrames: number }
  | { type: "SET_COMPOSITION_SIZE"; width: number; height: number }
  | { type: "SET_LOOP"; loop: boolean }
  | { type: "SET_ACTIVE_COMPOSITION"; compositionId: string };

export interface CompositionEntry {
  id: string;
  name: string;
  component: FC<any>;
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
}
