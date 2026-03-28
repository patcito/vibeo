import { resolve } from "node:path";
import { bundle } from "@vibeo/renderer";

interface PreviewArgs {
  entry: string;
  port: number;
}

function parseArgs(args: string[]): PreviewArgs {
  const result: PreviewArgs = {
    entry: "",
    port: 3000,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;
    const next = args[i + 1];

    if (arg === "--entry" && next) {
      result.entry = next;
      i++;
    } else if (arg.startsWith("--entry=")) {
      result.entry = arg.slice("--entry=".length);
    } else if (arg === "--port" && next) {
      result.port = parseInt(next, 10);
      i++;
    } else if (arg.startsWith("--port=")) {
      result.port = parseInt(arg.slice("--port=".length), 10);
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
  }

  return result;
}

function printHelp(): void {
  console.log(`
vibeo preview - Start a dev server with live preview

Usage:
  vibeo preview --entry <path> [options]

Required:
  --entry <path>    Path to the root file with compositions

Options:
  --port <number>   Port for the dev server (default: 3000)
  --help            Show this help
`);
}

/**
 * Start a dev server hosting the Player with hot reload.
 */
export async function previewCommand(args: string[]): Promise<void> {
  const parsed = parseArgs(args);

  if (!parsed.entry) {
    console.error("Error: --entry is required");
    printHelp();
    process.exit(1);
  }

  const entry = resolve(parsed.entry);

  console.log(`Starting preview server...`);
  console.log(`  Entry: ${entry}`);

  const bundleResult = await bundle(entry);

  console.log(`\n  Preview running at ${bundleResult.url}`);
  console.log(`  Press Ctrl+C to stop\n`);

  // Keep the process alive until interrupted
  const shutdown = async () => {
    console.log("\nShutting down preview server...");
    await bundleResult.cleanup();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  // Block forever
  await new Promise(() => {});
}
