import { bundle } from "@vibeo/renderer";
import { launchBrowser, createPage, closeBrowser } from "@vibeo/renderer";

interface CompositionMeta {
  id: string;
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
}

export async function listCompositions(entry: string): Promise<CompositionMeta[]> {
  console.log(`Bundling ${entry}...`);
  const bundleResult = await bundle(entry);

  try {
    const browser = await launchBrowser();
    const page = await createPage(browser, 1920, 1080);

    await page.goto(bundleResult.url, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);

    const compositions = await page.evaluate(() => {
      const win = window as typeof window & {
        vibeo_getCompositions?: () => CompositionMeta[];
      };
      if (typeof win.vibeo_getCompositions === "function") {
        return win.vibeo_getCompositions();
      }
      return [];
    });

    await page.close();
    await closeBrowser();

    return compositions;
  } finally {
    await bundleResult.cleanup();
  }
}
