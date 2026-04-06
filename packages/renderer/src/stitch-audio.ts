import { spawn } from "node:child_process";
import { copyFile } from "node:fs/promises";
import type { AudioMuxOptions } from "./types.js";

/**
 * Mux audio tracks into a video file using FFmpeg.
 * If multiple audio files are provided, they are mixed together.
 */
export async function stitchAudio(options: AudioMuxOptions): Promise<string> {
  const { videoPath, audioPaths, outputPath } = options;

  if (audioPaths.length === 0) {
    // No audio to mux — copy the video to the final output path
    await copyFile(videoPath, outputPath);
    return outputPath;
  }

  const args: string[] = ["-y"];

  // Input: video
  args.push("-i", videoPath);

  // Input: each audio track
  for (const audioPath of audioPaths) {
    args.push("-i", audioPath);
  }

  if (audioPaths.length === 1) {
    // Simple case: one audio track, just mux
    args.push(
      "-c:v", "copy",
      "-c:a", "aac",
      "-b:a", "192k",
      "-shortest",
      outputPath,
    );
  } else {
    // Multiple audio tracks: use amix filter to mix them
    const filterInputs = audioPaths.map((_, i) => `[${i + 1}:a]`).join("");
    const filter = `${filterInputs}amix=inputs=${audioPaths.length}:duration=longest:dropout_transition=0[aout]`;

    args.push(
      "-filter_complex", filter,
      "-map", "0:v",
      "-map", "[aout]",
      "-c:v", "copy",
      "-c:a", "aac",
      "-b:a", "192k",
      "-shortest",
      outputPath,
    );
  }

  return runFfmpeg(args);
}

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
