import { resolve } from "node:path";
import { availableParallelism } from "node:os";
import { parseFrameRange } from "@vibeo/renderer";
import { renderComposition } from "@vibeo/renderer";
import type { Codec, ImageFormat, RenderProgress } from "@vibeo/renderer";

interface RenderArgs {
  entry: string;
  composition: string;
  output: string | null;
  fps: number | null;
  frames: string | null;
  codec: Codec;
  concurrency: number;
  imageFormat: ImageFormat;
  quality: number;
}

function parseArgs(args: string[]): RenderArgs {
  const result: RenderArgs = {
    entry: "",
    composition: "",
    output: null,
    fps: null,
    frames: null,
    codec: "h264",
    concurrency: Math.max(1, Math.floor(availableParallelism() / 2)),
    imageFormat: "png",
    quality: 80,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;
    const next = args[i + 1];

    if (arg === "--entry" && next) {
      result.entry = next;
      i++;
    } else if (arg.startsWith("--entry=")) {
      result.entry = arg.slice("--entry=".length);
    } else if (arg === "--composition" && next) {
      result.composition = next;
      i++;
    } else if (arg.startsWith("--composition=")) {
      result.composition = arg.slice("--composition=".length);
    } else if (arg === "--output" && next) {
      result.output = next;
      i++;
    } else if (arg.startsWith("--output=")) {
      result.output = arg.slice("--output=".length);
    } else if (arg === "--fps" && next) {
      result.fps = parseInt(next, 10);
      i++;
    } else if (arg.startsWith("--fps=")) {
      result.fps = parseInt(arg.slice("--fps=".length), 10);
    } else if (arg === "--frames" && next) {
      result.frames = next;
      i++;
    } else if (arg.startsWith("--frames=")) {
      result.frames = arg.slice("--frames=".length);
    } else if (arg === "--codec" && next) {
      result.codec = next as Codec;
      i++;
    } else if (arg.startsWith("--codec=")) {
      result.codec = arg.slice("--codec=".length) as Codec;
    } else if (arg === "--concurrency" && next) {
      result.concurrency = parseInt(next, 10);
      i++;
    } else if (arg.startsWith("--concurrency=")) {
      result.concurrency = parseInt(arg.slice("--concurrency=".length), 10);
    } else if (arg === "--image-format" && next) {
      result.imageFormat = next as ImageFormat;
      i++;
    } else if (arg.startsWith("--image-format=")) {
      result.imageFormat = arg.slice("--image-format=".length) as ImageFormat;
    } else if (arg === "--quality" && next) {
      result.quality = parseInt(next, 10);
      i++;
    } else if (arg.startsWith("--quality=")) {
      result.quality = parseInt(arg.slice("--quality=".length), 10);
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
  }

  return result;
}

function printHelp(): void {
  console.log(`
vibeo render - Render a composition to video

Usage:
  vibeo render --entry <path> --composition <id> [options]

Required:
  --entry <path>           Path to the root file with compositions
  --composition <id>       Composition ID to render

Options:
  --output <path>          Output file path (default: out/<compositionId>.mp4)
  --fps <number>           Override fps
  --frames <range>         Frame range "start-end" (e.g., "0-100")
  --codec <codec>          h264 | h265 | vp9 | prores (default: h264)
  --concurrency <number>   Parallel browser tabs (default: cpu count / 2)
  --image-format <format>  png | jpeg (default: png)
  --quality <number>       0-100 for jpeg quality / crf (default: 80)
  --help                   Show this help
`);
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

/**
 * Execute the render command.
 */
export async function renderCommand(args: string[]): Promise<void> {
  const parsed = parseArgs(args);

  if (!parsed.entry) {
    console.error("Error: --entry is required");
    printHelp();
    process.exit(1);
  }

  if (!parsed.composition) {
    console.error("Error: --composition is required");
    printHelp();
    process.exit(1);
  }

  const entry = resolve(parsed.entry);
  const compositionId = parsed.composition;

  // TODO: In a full implementation, we would bundle the entry, extract
  // composition metadata, and use it here. For now we require the user
  // to have the composition info available.
  // This is a simplified flow that demonstrates the pipeline.

  const ext = parsed.codec === "vp9" ? "webm" : parsed.codec === "prores" ? "mov" : "mp4";
  const output = parsed.output
    ? resolve(parsed.output)
    : resolve(`out/${compositionId}.${ext}`);

  console.log(`\nRendering composition "${compositionId}"`);
  console.log(`  Entry: ${entry}`);
  console.log(`  Output: ${output}`);
  console.log(`  Codec: ${parsed.codec}`);
  console.log(`  Image format: ${parsed.imageFormat}`);
  console.log(`  Concurrency: ${parsed.concurrency}`);
  console.log();

  // For a full render, we need composition info from the bundle.
  // This would normally be extracted by bundling and evaluating the entry.
  // Here we set up the render config and delegate to renderComposition.
  const compositionInfo = {
    width: 1920,
    height: 1080,
    fps: parsed.fps ?? 30,
    durationInFrames: 300,
  };

  const frameRange = parseFrameRange(parsed.frames, compositionInfo.durationInFrames);

  const startTime = Date.now();

  await renderComposition(
    {
      entry,
      compositionId,
      outputPath: output,
      codec: parsed.codec,
      imageFormat: parsed.imageFormat,
      quality: parsed.quality,
      fps: parsed.fps,
      frameRange,
      concurrency: parsed.concurrency,
      pixelFormat: "yuv420p",
      onProgress: renderProgressBar,
    },
    compositionInfo,
  );

  const elapsed = Date.now() - startTime;
  console.log(`\n\nDone in ${formatTime(elapsed)}. Output: ${output}`);
}
