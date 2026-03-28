import { bundleForEditor } from "@vibeo/renderer";

export async function startEditor(entry: string, port: number): Promise<void> {
  console.log(`Starting editor server...`);
  console.log(`  Entry: ${entry}`);

  const bundleResult = await bundleForEditor(entry, port);

  console.log(`\n  Editor running at ${bundleResult.url}`);
  console.log(`  Press Ctrl+C to stop\n`);

  const shutdown = async () => {
    console.log("\nShutting down editor server...");
    await bundleResult.cleanup();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  // Block forever
  await new Promise(() => {});
}
