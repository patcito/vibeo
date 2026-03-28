import type { CSSProperties, ReactNode } from "react";

// ── Subtitles ─────────────────────────────────────────────

export interface SubtitleCue {
  /** Start time in seconds. */
  startTime: number;
  /** End time in seconds. */
  endTime: number;
  /** Cue text content (may contain basic HTML: <b>, <i>, <u>). */
  text: string;
}

export type SubtitleFormat = "srt" | "vtt" | "auto";

export interface SubtitleProps {
  /** URL to a subtitle file, or inline subtitle content string. */
  src: string;
  /** Subtitle format. "auto" detects from content/extension. */
  format?: SubtitleFormat;
  style?: CSSProperties;
  /** Vertical position of the subtitle text. */
  position?: "top" | "bottom" | "center";
  fontSize?: number;
  color?: string;
  outlineColor?: string;
  outlineWidth?: number;
}

// ── Audio Waveform ────────────────────────────────────────

export type BarStyle = "bars" | "line" | "mirror";

export interface AudioWaveformProps {
  src: string;
  width: number;
  height: number;
  color?: string;
  backgroundColor?: string;
  /** Number of frames visible in the waveform window. */
  windowSize?: number;
  barStyle?: BarStyle;
}

// ── Audio Spectrogram ─────────────────────────────────────

export type ColorMapName = "viridis" | "magma" | "inferno" | "grayscale";

export interface AudioSpectrogramProps {
  src: string;
  width: number;
  height: number;
  colorMap?: ColorMapName;
  fftSize?: number;
}

// ── Scene Graph ───────────────────────────────────────────

export interface LayerState {
  visible: boolean;
  opacity: number;
  transform?: string;
}

export interface LayerProps {
  name: string;
  zIndex?: number;
  visible?: boolean;
  opacity?: number;
  transform?: string;
  children?: ReactNode;
}

export interface SceneGraphProps {
  children?: ReactNode;
}

export interface SceneGraphContextValue {
  layers: Map<string, LayerState>;
  setLayerState: (name: string, state: Partial<LayerState>) => void;
  getLayerState: (name: string) => LayerState;
}

// ── Audio Mix ─────────────────────────────────────────────

export type VolumeInput = number | ((frame: number) => number);

export interface TrackProps {
  src: string;
  volume?: VolumeInput;
  pan?: number;
  /** Frame at which this track begins playing. */
  startAt?: number;
  /** Auto-duck when this source has audio. */
  duckWhen?: string;
  /** Amount to reduce volume when ducking (0-1). */
  duckAmount?: number;
  children?: never;
}

export interface AudioMixProps {
  children?: ReactNode;
}
