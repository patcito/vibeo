import { spawn } from "node:child_process";
import type { StitchOptions } from "./types.js";

/**
 * Get the FFmpeg codec arguments for the given codec.
 */
function getCodecArgs(codec: string, quality: number): string[] {
  switch (codec) {
    case "h264":
      return ["-c:v", "libx264", "-crf", String(quality), "-preset", "fast", "-pix_fmt", "yuv420p"];
    case "h265":
      return ["-c:v", "libx265", "-crf", String(quality), "-preset", "fast", "-pix_fmt", "yuv420p"];
    case "vp9":
      return ["-c:v", "libvpx-vp9", "-crf", String(quality), "-b:v", "0", "-pix_fmt", "yuv420p"];
    case "prores":
      return ["-c:v", "prores_ks", "-profile:v", String(Math.min(quality, 5)), "-pix_fmt", "yuva444p10le"];
    default:
      throw new Error(`Unsupported codec: ${codec}`);
  }
}

/**
 * Get the output container format for the given codec.
 */
function getContainerExt(codec: string): string {
  switch (codec) {
    case "vp9":
      return "webm";
    case "prores":
      return "mov";
    default:
      return "mp4";
  }
}

/**
 * Stitch a sequence of frame images into a video using FFmpeg.
 */
export async function stitchFrames(options: StitchOptions): Promise<string> {
  const {
    framesDir,
    outputPath,
    fps,
    codec,
    imageFormat,
    quality,
  } = options;

  const ext = imageFormat === "jpeg" ? "jpg" : "png";
  const inputPattern = `${framesDir}/frame-%06d.${ext}`;
  const codecArgs = getCodecArgs(codec, quality);

  const args = [
    "-y",
    "-framerate", String(fps),
    "-i", inputPattern,
    ...codecArgs,
    "-r", String(fps),
    outputPath,
  ];

  return runFfmpeg(args);
}

/**
 * Run an FFmpeg command and return the output path.
 */
function runFfmpeg(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn("ffmpeg", args, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stderr = "";

    proc.stderr.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    proc.on("close", (code) => {
      if (code === 0) {
        // The output path is the last argument
        resolve(args[args.length - 1]!);
      } else {
        reject(new Error(`FFmpeg exited with code ${code}:\n${stderr}`));
      }
    });

    proc.on("error", (err) => {
      reject(new Error(`Failed to spawn FFmpeg: ${err.message}`));
    });
  });
}

export { getContainerExt };
