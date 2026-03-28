// Types
export type {
  KeyframeStop,
  KeyframeMap,
  KeyframeOptions,
  SpringConfig,
  SpringOptions,
  TransitionTiming,
  TransitionDirection,
  TransitionType,
  TransitionProps,
  TransitionState,
  AudioAnalysis,
  AudioDataOptions,
} from "./types.js";

// Keyframes
export { useKeyframes } from "./keyframes.js";

// Spring physics
export { useSpring, springDuration } from "./spring.js";

// Transition component
export { Transition } from "./Transition.js";

// Transition strategies
export { fade } from "./transitions/fade.js";
export { wipe } from "./transitions/wipe.js";
export { slide } from "./transitions/slide.js";
export { dissolve } from "./transitions/dissolve.js";

// Audio-reactive
export { useAudioData } from "./audio-reactive.js";

// Hook re-exports (convenience paths)
export { useTransitionProgress } from "./hooks/use-transition.js";
