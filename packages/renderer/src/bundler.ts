import { mkdtemp, rm } from "node:fs/promises";
import { join, dirname, resolve } from "node:path";
import { tmpdir } from "node:os";
import type { BundleResult } from "./types.js";

import { existsSync } from "node:fs";

/**
 * Find the monorepo root by walking up from the entry file until we find
 * the packages/ directory. Returns null if not found.
 */
function findMonorepoRoot(startDir: string): string | null {
  let dir = startDir;
  for (let i = 0; i < 10; i++) {
    if (existsSync(join(dir, "packages", "core", "src", "index.ts"))) {
      return dir;
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

/**
 * Bun.build plugin that resolves all @vibeo/* bare-specifier imports to
 * their source .ts/.tsx files.  This prevents the bundler from pulling in
 * BOTH the compiled dist/ AND the source for the same package, which
 * would duplicate React contexts and break provider/consumer pairing.
 */
function vibeoSourcePlugin(monoRoot: string): import("bun").BunPlugin {
  const pkgMap: Record<string, string> = {};
  for (const name of [
    "core",
    "player",
    "audio",
    "effects",
    "extras",
    "editor",
  ]) {
    pkgMap[`@vibeo/${name}`] = resolve(
      monoRoot,
      "packages",
      name,
      "src",
      "index.ts",
    );
  }

  return {
    name: "vibeo-source-resolver",
    setup(build) {
      build.onResolve({ filter: /^@vibeo\// }, (args) => {
        const src = pkgMap[args.path];
        if (src) return { path: src };
        return undefined;
      });
    },
  };
}

/**
 * Bundle the user's React entry point using Bun.build,
 * then serve it via a local HTTP server for the headless browser to load.
 *
 * Generates a thin bootstrap entry that imports the user's Root export
 * and mounts it with ReactDOM.createRoot.
 */
export async function bundle(entryPoint: string): Promise<BundleResult> {
  const outDir = await mkdtemp(join(tmpdir(), "vibeo-bundle-"));

  // Create a bootstrap entry next to the user's file so Bun.build
  // resolves node_modules from the project root, not from /tmp.
  const entryDir = dirname(entryPoint);
  const bootstrapPath = join(entryDir, "__vibeo_entry.tsx");
  await Bun.write(
    bootstrapPath,
    `import React from "react";
import { createRoot } from "react-dom/client";
import { Root } from ${JSON.stringify(entryPoint)};
import { Player } from "@vibeo/player";
import { VibeoRoot, useCompositionContext } from "@vibeo/core";

/**
 * PreviewShell: renders <Root> to register compositions,
 * then picks the first one and renders it inside a <Player>.
 */
function CompositionPlayer() {
  const { compositions } = useCompositionContext();

  // Derive comp directly during render — no useEffect delay
  const hash = window.location.hash.slice(1);
  let comp: any = null;
  if (hash && compositions.has(hash)) {
    comp = compositions.get(hash);
  } else if (compositions.size > 0) {
    // Get first value from map
    for (const v of compositions.values()) { comp = v; break; }
  }

  if (!comp) {
    return React.createElement("div", {
      style: { color: "#888", fontFamily: "sans-serif", padding: 40 }
    }, "Loading composition...");
  }

  return React.createElement(Player, {
    component: comp.component,
    durationInFrames: comp.durationInFrames,
    compositionWidth: comp.width,
    compositionHeight: comp.height,
    fps: comp.fps,
    controls: true,
    loop: true,
    autoPlay: true,
    style: { width: "100vw", height: "100vh" },
    inputProps: comp.defaultProps,
  });
}

function PreviewApp() {
  return React.createElement(VibeoRoot, null,
    React.createElement(Root),
    React.createElement(CompositionPlayer),
  );
}

const container = document.getElementById("root")!;
const root = createRoot(container);
root.render(React.createElement(PreviewApp));

window.vibeo_ready = true;
`,
  );

  try {
  const monoRoot = findMonorepoRoot(entryDir);
  const plugins = monoRoot ? [vibeoSourcePlugin(monoRoot)] : [];

  const result = await Bun.build({
    entrypoints: [bootstrapPath],
    outdir: outDir,
    target: "browser",
    format: "esm",
    minify: false,
    splitting: false,
    plugins,
    define: {
      "process.env.NODE_ENV": JSON.stringify("production"),
    },
  });

  if (!result.success) {
    const messages = result.logs.map((l) => l.message).join("\n");
    throw new Error(`Bundle failed:\n${messages}`);
  }

  // Write a minimal HTML shell that loads the bundle
  const bundleName = result.outputs[0]?.path.split("/").pop() ?? "__vibeo_entry.js";
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #root { width: 100%; height: 100%; overflow: hidden; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/${bundleName}"></script>
</body>
</html>`;

  await Bun.write(join(outDir, "index.html"), html);

  // Start a local HTTP server to serve the bundle
  const server = Bun.serve({
    port: 0, // auto-assign
    async fetch(req) {
      const url = new URL(req.url);
      const filePath = join(outDir, url.pathname === "/" ? "index.html" : url.pathname);
      const file = Bun.file(filePath);
      if (await file.exists()) {
        return new Response(file);
      }
      return new Response("Not found", { status: 404 });
    },
  });
  const serverPort = server.port ?? 0;

  const cleanup = async () => {
    server.stop(true);
    await rm(outDir, { recursive: true, force: true });
  };

  return {
    outDir,
    url: `http://localhost:${serverPort}`,
    cleanup,
  };
  } finally {
    // Always clean up the bootstrap file we dropped next to the user's entry
    await rm(bootstrapPath, { force: true });
  }
}

/**
 * Bundle the user's React entry point for the visual editor.
 * Same pattern as bundle() but renders <Editor> instead of <Player>.
 */
export async function bundleForEditor(
  entryPoint: string,
  port: number = 3001,
): Promise<BundleResult> {
  const outDir = await mkdtemp(join(tmpdir(), "vibeo-editor-bundle-"));

  const entryDir = dirname(entryPoint);
  const bootstrapPath = join(entryDir, "__vibeo_editor_entry.tsx");
  await Bun.write(
    bootstrapPath,
    `import React from "react";
import { createRoot } from "react-dom/client";
import { Root } from ${JSON.stringify(entryPoint)};
import { Editor } from "@vibeo/editor";
import { VibeoRoot, useCompositionContext } from "@vibeo/core";

function EditorShell() {
  const { compositions } = useCompositionContext();

  const entries = [];
  for (const [, comp] of compositions) {
    entries.push({
      id: comp.id,
      name: comp.id,
      component: comp.component,
      width: comp.width,
      height: comp.height,
      fps: comp.fps,
      durationInFrames: comp.durationInFrames,
    });
  }

  if (entries.length === 0) {
    return React.createElement("div", {
      style: { color: "#888", fontFamily: "sans-serif", padding: 40 }
    }, "Loading compositions...");
  }

  return React.createElement(Editor, { compositions: entries });
}

function EditorApp() {
  return React.createElement(VibeoRoot, null,
    React.createElement(Root),
    React.createElement(EditorShell),
  );
}

const container = document.getElementById("root");
const root = createRoot(container);
root.render(React.createElement(EditorApp));

window.vibeo_ready = true;
`,
  );

  try {
    const monoRoot = findMonorepoRoot(entryDir);
    const plugins = monoRoot ? [vibeoSourcePlugin(monoRoot)] : [];

    const result = await Bun.build({
      entrypoints: [bootstrapPath],
      outdir: outDir,
      target: "browser",
      format: "esm",
      minify: false,
      splitting: false,
      plugins,
      define: {
        "process.env.NODE_ENV": JSON.stringify("production"),
      },
    });

    if (!result.success) {
      const messages = result.logs.map((l) => l.message).join("\n");
      throw new Error(`Editor bundle failed:\n${messages}`);
    }

    const bundleName =
      result.outputs[0]?.path.split("/").pop() ?? "__vibeo_editor_entry.js";
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Vibeo Editor</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #root { width: 100%; height: 100%; overflow: hidden; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/${bundleName}"></script>
</body>
</html>`;

    await Bun.write(join(outDir, "index.html"), html);

    const server = Bun.serve({
      port,
      async fetch(req) {
        const url = new URL(req.url);
        const filePath = join(
          outDir,
          url.pathname === "/" ? "index.html" : url.pathname,
        );
        const file = Bun.file(filePath);
        if (await file.exists()) {
          return new Response(file);
        }
        return new Response("Not found", { status: 404 });
      },
    });
    const serverPort = server.port ?? port;

    const cleanup = async () => {
      server.stop(true);
      await rm(outDir, { recursive: true, force: true });
    };

    return {
      outDir,
      url: `http://localhost:${serverPort}`,
      cleanup,
    };
  } finally {
    await rm(bootstrapPath, { force: true });
  }
}
