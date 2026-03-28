// Types
export type {
  VideoConfig,
  CompositionProps,
  SequenceContextType,
  LoopContextType,
  ExtrapolateType,
  InterpolateOptions,
} from "./types.js";

// Interpolation
export { interpolate } from "./interpolate.js";

// Easing
export { linear, easeIn, easeOut, easeInOut, bezier, steps } from "./easing.js";

// Timing
export { msPerFrame, frameToTime, timeToFrame, getMediaTime } from "./timing.js";

// Media duration
export { calculateMediaDuration } from "./calculate-media-duration.js";

// Video config
export { validateVideoConfig } from "./video-config.js";

// Context providers
export {
  TimelineProvider,
  useTimelineContext,
  TimelineContext,
} from "./context/timeline-context.js";
export {
  SequenceContext,
  useSequenceContext,
} from "./context/sequence-context.js";
export {
  CompositionProvider,
  useCompositionContext,
  CompositionContext,
} from "./context/composition-context.js";
export { LoopContext, useLoopContext } from "./context/loop-context.js";
export {
  VideoConfigProvider,
  useVideoConfigContext,
  VideoConfigContext,
} from "./context/video-config-context.js";

// Hooks
export { useTimelinePosition } from "./hooks/use-timeline-position.js";
export { useCurrentFrame } from "./hooks/use-current-frame.js";
export { useVideoConfig } from "./hooks/use-video-config.js";

// Components
export { Composition } from "./Composition.js";
export { Sequence } from "./Sequence.js";
export { Loop } from "./Loop.js";
export { VibeoRoot } from "./VibeoRoot.js";
