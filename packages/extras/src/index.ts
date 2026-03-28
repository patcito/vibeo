// Types
export type {
  SubtitleCue,
  SubtitleFormat,
  SubtitleProps,
  BarStyle,
  AudioWaveformProps,
  ColorMapName,
  AudioSpectrogramProps,
  LayerState,
  LayerProps,
  SceneGraphProps,
  SceneGraphContextValue,
  VolumeInput,
  TrackProps,
  AudioMixProps,
} from "./types.js";

// Subtitle parser
export { parseSRT, parseVTT } from "./subtitle-parser.js";

// Subtitle component
export { Subtitle } from "./Subtitle.js";

// Audio visualization
export { AudioWaveform } from "./AudioWaveform.js";
export { AudioSpectrogram } from "./AudioSpectrogram.js";

// Scene graph
export { SceneGraph, Layer } from "./SceneGraph.js";

// Audio mixing
export { AudioMix, Track, crossfadeVolume } from "./AudioMix.js";

// Hooks
export { useSubtitle } from "./hooks/use-subtitle.js";
export type { UseSubtitleResult } from "./hooks/use-subtitle.js";
export { useLayer, SceneGraphContext } from "./hooks/use-scene-graph.js";
