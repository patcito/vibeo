import type { ComponentType, CSSProperties } from "react";

export interface PlayerProps<T extends Record<string, unknown> = Record<string, unknown>> {
  component: ComponentType<T>;
  durationInFrames: number;
  compositionWidth: number;
  compositionHeight: number;
  fps: number;
  controls?: boolean;
  loop?: boolean;
  autoPlay?: boolean;
  playbackRate?: number;
  initialFrame?: number;
  inFrame?: number;
  outFrame?: number;
  style?: CSSProperties;
  className?: string;
  inputProps?: T;
}

export interface PlayerRef {
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seekTo: (frame: number) => void;
  getCurrentFrame: () => number;
  isPlaying: () => boolean;
  getPlaybackRate: () => number;
  setPlaybackRate: (rate: number) => void;
}

export type PlayerEventType =
  | "play"
  | "pause"
  | "seeked"
  | "ended"
  | "framechange"
  | "ratechange"
  | "error";

export interface PlayerEventMap {
  play: void;
  pause: void;
  seeked: { frame: number };
  ended: void;
  framechange: { frame: number };
  ratechange: { rate: number };
  error: { error: Error };
}

export type PlayerEventListener<T extends PlayerEventType> = (
  detail: PlayerEventMap[T],
) => void;
