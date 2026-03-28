import { resolve } from "node:path";
import { bundle } from "@vibeo/renderer";
import { launchBrowser, createPage, closeBrowser } from "@vibeo/renderer";

interface ListArgs {
  entry: string;
}

function parseArgs(args: string[]): ListArgs {
  const result: ListArgs = {
    entry: "",
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;
    const next = args[i + 1];

    if (arg === "--entry" && next) {
      result.entry = next;
      i++;
    } else if (arg.startsWith("--entry=")) {
      result.entry = arg.slice("--entry=".length);
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
  }

  return result;
}

function printHelp(): void {
  console.log(`
vibeo list - List registered compositions

Usage:
  vibeo list --entry <path>

Required:
  --entry <path>    Path to the root file with compositions

Options:
  --help            Show this help
`);
}

interface CompositionMeta {
  id: string;
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
}

/**
 * Bundle the entry, launch a browser to evaluate it,
 * extract registered compositions, and print a table.
 */
export async function listCommand(args: string[]): Promise<void> {
  const parsed = parseArgs(args);

  if (!parsed.entry) {
    console.error("Error: --entry is required");
    printHelp();
    process.exit(1);
  }

  const entry = resolve(parsed.entry);

  console.log(`Bundling ${entry}...`);
  const bundleResult = await bundle(entry);

  try {
    const browser = await launchBrowser();
    const page = await createPage(browser, 1920, 1080);

    await page.goto(bundleResult.url, { waitUntil: "networkidle" });

    // Wait briefly for React to register compositions
    await page.waitForTimeout(2000);

    // Extract composition data from the page
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

    if (compositions.length === 0) {
      console.log("\nNo compositions found.");
      console.log(
        "Make sure your entry file exports compositions via <Composition /> components.",
      );
      return;
    }

    // Print table
    console.log("\nRegistered compositions:\n");
    console.log(
      padRight("ID", 25) +
        padRight("Width", 8) +
        padRight("Height", 8) +
        padRight("FPS", 6) +
        padRight("Frames", 8) +
        "Duration",
    );
    console.log("-".repeat(70));

    for (const comp of compositions) {
      const duration = (comp.durationInFrames / comp.fps).toFixed(1) + "s";
      console.log(
        padRight(comp.id, 25) +
          padRight(String(comp.width), 8) +
          padRight(String(comp.height), 8) +
          padRight(String(comp.fps), 6) +
          padRight(String(comp.durationInFrames), 8) +
          duration,
      );
    }

    console.log();
  } finally {
    await bundleResult.cleanup();
  }
}

function padRight(str: string, len: number): string {
  return str.length >= len ? str : str + " ".repeat(len - str.length);
}
