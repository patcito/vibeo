import { resolve } from "node:path";
import { parseFrameRange, renderComposition } from "@vibeo/renderer";
import type { Codec, ImageFormat, RenderProgress } from "@vibeo/renderer";

interface RenderOptions {
  entry: string;
  composition: string;
  output: string | undefined;
  fps: number | null;
  frames: string | null;
  codec: Codec;
  concurrency: number;
  imageFormat: ImageFormat;
  quality: number;
}

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${minutes}:${String(s).padStart(2, "0")}`;
}

function renderProgressBar(progress: RenderProgress): void {
  const { framesRendered, totalFrames, percent, etaMs } = progress;
  const barWidth = 30;
  const filled = Math.round(barWidth * percent);
  const empty = barWidth - filled;
  const bar = "\u2588".repeat(filled) + "\u2591".repeat(empty);
  const pct = (percent * 100).toFixed(1);
  const eta = etaMs !== null ? ` ETA ${formatTime(etaMs)}` : "";

  process.stdout.write(
    `\r  [${bar}] ${pct}% (${framesRendered}/${totalFrames})${eta}  `,
  );
}

export async function renderVideo(
  opts: RenderOptions,
): Promise<{ output: string; elapsed: string }> {
  const ext = opts.codec === "vp9" ? "webm" : opts.codec === "prores" ? "mov" : "mp4";
  const output = opts.output
    ? resolve(opts.output)
    : resolve(`out/${opts.composition}.${ext}`);

  console.log(`\nRendering composition "${opts.composition}"`);
  console.log(`  Entry: ${opts.entry}`);
  console.log(`  Output: ${output}`);
  console.log(`  Codec: ${opts.codec}`);
  console.log(`  Concurrency: ${opts.concurrency}`);
  console.log();

  const compositionInfo = {
    width: 1920,
    height: 1080,
    fps: opts.fps ?? 30,
    durationInFrames: 300,
  };

  const frameRange = parseFrameRange(opts.frames, compositionInfo.durationInFrames);
  const startTime = Date.now();

  await renderComposition(
    {
      entry: opts.entry,
      compositionId: opts.composition,
      outputPath: output,
      codec: opts.codec,
      imageFormat: opts.imageFormat,
      quality: opts.quality,
      fps: opts.fps,
      frameRange,
      concurrency: opts.concurrency,
      pixelFormat: "yuv420p",
      onProgress: renderProgressBar,
    },
    compositionInfo,
  );

  const elapsed = formatTime(Date.now() - startTime);
  console.log(`\n\nDone in ${elapsed}. Output: ${output}`);
  return { output, elapsed };
}
