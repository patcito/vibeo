export async function startEditor(entry: string, port: number): Promise<void> {
  console.log(`Starting editor server...`);
  console.log(`  Entry: ${entry}`);

  // Import renderer and get bundleForEditor
  const renderer = await import("@vibeo/renderer");
  const bundleForEditor = renderer.bundleForEditor ?? (renderer as any).default?.bundleForEditor;

  if (typeof bundleForEditor !== "function") {
    console.error("Error: @vibeo/renderer does not export bundleForEditor.");
    console.error("Please update @vibeo/renderer: bun add @vibeo/renderer@latest");
    process.exit(1);
  }

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

  await new Promise(() => {});
}
