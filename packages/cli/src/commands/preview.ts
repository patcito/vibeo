import { bundle } from "@vibeo/renderer";

export async function startPreview(entry: string, _port: number): Promise<void> {
  console.log(`Starting preview server...`);
  console.log(`  Entry: ${entry}`);

  const bundleResult = await bundle(entry);

  console.log(`\n  Preview running at ${bundleResult.url}`);
  console.log(`  Press Ctrl+C to stop\n`);

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
