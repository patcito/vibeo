import { join } from "node:path";
import type { Page } from "playwright";
import type { ImageFormat } from "./types.js";

/**
 * Capture a screenshot of the current page state and write it to disk.
 *
 * @returns The file path of the saved frame.
 */
export async function captureFrame(
  page: Page,
  outputDir: string,
  frameNumber: number,
  options: {
    imageFormat: ImageFormat;
    quality?: number;
  },
): Promise<string> {
  const ext = options.imageFormat === "jpeg" ? "jpg" : "png";
  const paddedFrame = String(frameNumber).padStart(6, "0");
  const filePath = join(outputDir, `frame-${paddedFrame}.${ext}`);

  const screenshotOptions: {
    type: "png" | "jpeg";
    path: string;
    quality?: number;
  } = {
    type: options.imageFormat,
    path: filePath,
  };

  if (options.imageFormat === "jpeg" && options.quality !== undefined) {
    screenshotOptions.quality = options.quality;
  }

  await page.screenshot(screenshotOptions);

  return filePath;
}
