import { mkdtemp, rm, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { availableParallelism } from "node:os";
import type { RenderConfig, RenderProgress } from "./types.js";
import { bundle } from "./bundler.js";
import { launchBrowser, closeBrowser } from "./browser.js";
import { getRealFrameRange } from "./frame-range.js";
import { parallelRender } from "./parallel-render.js";
import { stitchFrames } from "./stitch-frames.js";
import { stitchAudio } from "./stitch-audio.js";

interface CompositionInfo {
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
}

/**
 * Orchestrate a full composition render:
 * 1. Bundle the entry point
 * 2. Launch headless browser
 * 3. Render frames in parallel across browser tabs
 * 4. Stitch frames into video with FFmpeg
 * 5. Mux audio if present
 * 6. Cleanup temp files
 */
export async function renderComposition(
  config: RenderConfig,
  compositionInfo: CompositionInfo,
): Promise<string> {
  const {
    entry,
    compositionId,
    outputPath,
    codec,
    imageFormat,
    quality,
    frameRange: userFrameRange,
    concurrency,
    pixelFormat,
    onProgress,
  } = config;

  const fps = config.fps ?? compositionInfo.fps;
  const { width, height, durationInFrames } = compositionInfo;

  const frameRange = getRealFrameRange(durationInFrames, userFrameRange);
  const totalFrames = frameRange[1] - frameRange[0] + 1;

  // Create temp directories
  const framesDir = await mkdtemp(join(tmpdir(), "vibeo-frames-"));

  // Ensure output directory exists
  await mkdir(dirname(outputPath), { recursive: true });

  let bundleResult: Awaited<ReturnType<typeof bundle>> | null = null;

  try {
    // Step 1: Bundle
    const reportStage = (stage: string) => {
      if (onProgress) {
        onProgress({
          framesRendered: 0,
          totalFrames,
          percent: 0,
          etaMs: null,
        });
      }
    };

    reportStage("bundling");
    bundleResult = await bundle(entry);

    // Step 2: Launch browser
    reportStage("launching browser");
    const browser = await launchBrowser();

    // Step 3: Render frames in parallel
    const effectiveConcurrency =
      concurrency > 0 ? concurrency : Math.max(1, Math.floor(availableParallelism() / 2));

    await parallelRender({
      browser,
      bundleUrl: bundleResult.url,
      compositionId,
      frameRange,
      outputDir: framesDir,
      width,
      height,
      concurrency: effectiveConcurrency,
      imageFormat,
      quality,
      onProgress,
    });

    // Step 4: Stitch frames into video
    const videoPath = join(
      framesDir,
      `stitched.${codec === "vp9" ? "webm" : codec === "prores" ? "mov" : "mp4"}`,
    );

    await stitchFrames({
      framesDir,
      outputPath: videoPath,
      fps,
      codec,
      imageFormat,
      pixelFormat,
      quality,
      width,
      height,
    });

    // Step 5: Mux audio (if audio assets exist)
    // For now, just copy the video to the output path if no audio
    // Audio assets would be collected from the composition at render time
    const finalPath = await stitchAudio({
      videoPath,
      audioPaths: [], // Audio collection will be implemented per-composition
      outputPath,
    });

    // Report completion
    if (onProgress) {
      onProgress({
        framesRendered: totalFrames,
        totalFrames,
        percent: 1,
        etaMs: 0,
      });
    }

    return finalPath;
  } finally {
    // Step 6: Cleanup
    await closeBrowser();
    if (bundleResult) {
      await bundleResult.cleanup();
    }
    await rm(framesDir, { recursive: true, force: true }).catch(() => {});
  }
}
