// Types
export type { AudioAsset, AudioData, MediaProps, VolumeFunction } from "./types.js";
export type { VideoProps } from "./Video.js";

// Audio context
export { getAudioContext, destroyAudioContext } from "./audio-context.js";
export type { AudioContextOptions } from "./audio-context.js";

// Audio sync math
export {
  TARGET_SAMPLE_RATE,
  TARGET_CHANNELS,
  samplesPerFrame,
  frameToAudioTimestamp,
  audioTimeToFrame,
} from "./audio-sync.js";

// Audio mixer
export { mixAudio } from "./audio-mixer.js";

// Volume
export { evaluateVolume, buildVolumeArray } from "./volume.js";

// Hooks
export { useAudioContext } from "./hooks/use-audio-context.js";
export { useMediaSync } from "./hooks/use-media-sync.js";
export type { UseMediaSyncOptions } from "./hooks/use-media-sync.js";
export { useMediaInTimeline } from "./hooks/use-media-in-timeline.js";
export type {
  MediaTimelineInfo,
  UseMediaInTimelineOptions,
} from "./hooks/use-media-in-timeline.js";

// Components
export { Audio } from "./Audio.js";
export { Video } from "./Video.js";
