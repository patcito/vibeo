import type { Browser } from "playwright";
import type { FrameRange, ImageFormat, RenderProgress } from "./types.js";
import { createPage } from "./browser.js";
import { seekToFrame, loadBundle } from "./seek-to-frame.js";
import { captureFrame } from "./capture-frame.js";

interface ParallelRenderOptions {
  browser: Browser;
  bundleUrl: string;
  compositionId: string;
  frameRange: FrameRange;
  outputDir: string;
  width: number;
  height: number;
  concurrency: number;
  imageFormat: ImageFormat;
  quality?: number;
  onProgress?: (progress: RenderProgress) => void;
}

/**
 * Split a frame range into N roughly-equal chunks.
 */
function splitFrameRange(range: FrameRange, chunks: number): FrameRange[] {
  const [start, end] = range;
  const totalFrames = end - start + 1;
  const framesPerChunk = Math.ceil(totalFrames / chunks);
  const ranges: FrameRange[] = [];

  for (let i = 0; i < chunks; i++) {
    const chunkStart = start + i * framesPerChunk;
    const chunkEnd = Math.min(chunkStart + framesPerChunk - 1, end);
    if (chunkStart > end) break;
    ranges.push([chunkStart, chunkEnd]);
  }

  return ranges;
}

/**
 * Render a chunk of frames using a single browser page.
 */
async function renderChunk(
  browser: Browser,
  bundleUrl: string,
  compositionId: string,
  frameRange: FrameRange,
  outputDir: string,
  width: number,
  height: number,
  imageFormat: ImageFormat,
  quality: number | undefined,
  onFrameRendered: () => void,
): Promise<void> {
  const page = await createPage(browser, width, height);

  try {
    await loadBundle(page, bundleUrl);

    const [start, end] = frameRange;
    for (let frame = start; frame <= end; frame++) {
      await seekToFrame(page, frame, compositionId);
      await captureFrame(page, outputDir, frame, { imageFormat, quality });
      onFrameRendered();
    }
  } finally {
    await page.close();
  }
}

/**
 * Distribute frame rendering across multiple browser tabs in parallel.
 * Opens N pages, each rendering a chunk of the frame range.
 */
export async function parallelRender(
  options: ParallelRenderOptions,
): Promise<void> {
  const {
    browser,
    bundleUrl,
    compositionId,
    frameRange,
    outputDir,
    width,
    height,
    concurrency,
    imageFormat,
    quality,
    onProgress,
  } = options;

  const [start, end] = frameRange;
  const totalFrames = end - start + 1;
  const effectiveConcurrency = Math.min(concurrency, totalFrames);
  const chunks = splitFrameRange(frameRange, effectiveConcurrency);

  let framesRendered = 0;
  const startTime = Date.now();

  const onFrameRendered = () => {
    framesRendered++;
    if (onProgress) {
      const elapsed = Date.now() - startTime;
      const msPerFrame = elapsed / framesRendered;
      const remaining = totalFrames - framesRendered;
      const etaMs = remaining > 0 ? msPerFrame * remaining : 0;

      onProgress({
        framesRendered,
        totalFrames,
        percent: framesRendered / totalFrames,
        etaMs: framesRendered > 0 ? etaMs : null,
      });
    }
  };

  // Render all chunks in parallel
  await Promise.all(
    chunks.map((chunk) =>
      renderChunk(
        browser,
        bundleUrl,
        compositionId,
        chunk,
        outputDir,
        width,
        height,
        imageFormat,
        quality,
        onFrameRendered,
      ),
    ),
  );
}
