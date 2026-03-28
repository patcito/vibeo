// Types
export type {
  RenderConfig,
  RenderProgress,
  Codec,
  ImageFormat,
  FrameRange,
  StitchOptions,
  AudioMuxOptions,
  BundleResult,
} from "./types.js";

// Browser lifecycle
export { launchBrowser, closeBrowser, createPage } from "./browser.js";

// Bundler
export { bundle, bundleForEditor } from "./bundler.js";

// Frame navigation
export { seekToFrame, loadBundle } from "./seek-to-frame.js";

// Frame capture
export { captureFrame } from "./capture-frame.js";

// Frame range utilities
export { parseFrameRange, getRealFrameRange, validateFrameRange } from "./frame-range.js";

// FFmpeg stitching
export { stitchFrames, getContainerExt } from "./stitch-frames.js";
export { stitchAudio } from "./stitch-audio.js";

// Parallel rendering
export { parallelRender } from "./parallel-render.js";

// Full render orchestration
export { renderComposition } from "./render-composition.js";
