export type Codec = "h264" | "h265" | "vp9" | "prores";

export type ImageFormat = "png" | "jpeg";

export type FrameRange = [startFrame: number, endFrame: number];

export interface RenderConfig {
  /** Path to the entry file containing compositions */
  entry: string;
  /** Composition ID to render */
  compositionId: string;
  /** Output file path */
  outputPath: string;
  /** Video codec */
  codec: Codec;
  /** Image format for intermediate frames */
  imageFormat: ImageFormat;
  /** JPEG quality (0-100), only used when imageFormat is "jpeg" */
  quality: number;
  /** Frames per second override (uses composition fps if not set) */
  fps: number | null;
  /** Frame range to render [start, end] */
  frameRange: FrameRange | null;
  /** Number of parallel browser tabs */
  concurrency: number;
  /** Pixel format for ffmpeg */
  pixelFormat: string;
  /** Progress callback */
  onProgress?: (progress: RenderProgress) => void;
}

export interface RenderProgress {
  /** Number of frames rendered so far */
  framesRendered: number;
  /** Total frames to render */
  totalFrames: number;
  /** Progress as a fraction 0-1 */
  percent: number;
  /** Estimated time remaining in milliseconds */
  etaMs: number | null;
}

export interface StitchOptions {
  /** Directory containing frame images */
  framesDir: string;
  /** Output video file path */
  outputPath: string;
  /** Frames per second */
  fps: number;
  /** Video codec */
  codec: Codec;
  /** Image format of the frames */
  imageFormat: ImageFormat;
  /** Pixel format */
  pixelFormat: string;
  /** Quality (crf for h264/h265/vp9, profile for prores) */
  quality: number;
  /** Width of the video */
  width: number;
  /** Height of the video */
  height: number;
}

export interface AudioMuxOptions {
  /** Video file to mux audio into */
  videoPath: string;
  /** Audio file paths */
  audioPaths: string[];
  /** Output file path */
  outputPath: string;
}

export interface BundleResult {
  /** Directory containing the bundled output */
  outDir: string;
  /** URL to access the bundled app */
  url: string;
  /** Cleanup function to stop the server and remove temp files */
  cleanup: () => Promise<void>;
}
