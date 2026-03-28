#!/usr/bin/env node

// Vibeo requires Bun APIs (Bun.build, Bun.serve). If we're running under
// Node (e.g. because npm/bun rewrote the shebang), re-exec under bun.
if (typeof globalThis.Bun === "undefined") {
  const { execFileSync } = await import("node:child_process");
  try {
    execFileSync("bun", ["run", ...process.argv.slice(1)], {
      stdio: "inherit",
      env: process.env,
    });
  } catch (e) {
    if (e && typeof e === "object" && "status" in e) process.exit(e.status);
    process.exit(1);
  }
  process.exit(0);
}

import "../dist/index.js";
