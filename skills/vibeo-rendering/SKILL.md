# Vibeo Rendering (`@vibeo/renderer` + `@vibeo/cli`)

## Overview

`@vibeo/renderer` provides the headless rendering pipeline: bundling a Vibeo project, launching Playwright browser instances, capturing frames, and stitching them into video via FFmpeg. `@vibeo/cli` wraps this in a CLI.

**When to use**: When you need to render a composition to a video file, preview it, or list available compositions.

---

## CLI Commands

### `vibeo render`

Render a composition to a video file.

```bash
bunx vibeo render --entry src/index.tsx --composition MyComp --output out.mp4
```

**Required flags**:
| Flag | Description |
|------|-------------|
| `--entry <path>` | Path to the root file with compositions |
| `--composition <id>` | Composition ID to render |

**Optional flags**:
| Flag | Default | Description |
|------|---------|-------------|
| `--output <path>` | `out/<compositionId>.<ext>` | Output file path |
| `--fps <number>` | Composition fps | Override frames per second |
| `--frames <range>` | Full duration | Frame range, e.g. `"0-100"` |
| `--codec <codec>` | `h264` | `h264 \| h265 \| vp9 \| prores` |
| `--concurrency <n>` | `CPU cores / 2` | Parallel browser tabs |
| `--image-format <fmt>` | `png` | `png \| jpeg` |
| `--quality <n>` | `80` | JPEG quality / CRF value (0-100) |

### `vibeo preview`

Start a dev server with live preview in the browser.

```bash
bunx vibeo preview --entry src/index.tsx --port 3000
```

**Required flags**:
| Flag | Description |
|------|-------------|
| `--entry <path>` | Path to the root file with compositions |

**Optional flags**:
| Flag | Default | Description |
|------|---------|-------------|
| `--port <number>` | `3000` | Port for the dev server |
| `--help`, `-h` | — | Show help |

### `vibeo list`

List all registered compositions in the project. Bundles the entry, launches a headless browser, and prints a table of composition IDs with their dimensions, FPS, and duration.

```bash
bunx vibeo list --entry src/index.tsx
```

**Required flags**:
| Flag | Description |
|------|-------------|
| `--entry <path>` | Path to the root file with compositions |

**Optional flags**:
| Flag | Description |
|------|-------------|
| `--help`, `-h` | Show help |

---

## Programmatic Rendering API

### `renderComposition(config, compositionInfo): Promise<string>`

Full render orchestration: bundle → capture frames → stitch video. Returns the path to the final output file.

```ts
import { renderComposition } from "@vibeo/renderer";

const outputPath = await renderComposition(
  {
    entry: "src/index.tsx",
    compositionId: "MyComp",
    outputPath: "out/video.mp4",
    codec: "h264",
    imageFormat: "png",
    quality: 80,
    fps: null,           // use composition fps
    frameRange: null,     // render all frames
    concurrency: 4,
    pixelFormat: "yuv420p",
    onProgress: (p) => console.log(`${(p.percent * 100).toFixed(1)}%`),
  },
  { width: 1920, height: 1080, fps: 30, durationInFrames: 300 },
);
console.log(`Rendered to ${outputPath}`);
```

### `RenderConfig`

| Field | Type | Description |
|-------|------|-------------|
| `entry` | `string` | Path to the entry file |
| `compositionId` | `string` | Composition ID |
| `outputPath` | `string` | Output video path |
| `codec` | `Codec` | Video codec |
| `imageFormat` | `ImageFormat` | `"png" \| "jpeg"` |
| `quality` | `number` | 0-100 quality/CRF |
| `fps` | `number \| null` | FPS override |
| `frameRange` | `FrameRange \| null` | `[start, end]` or null for all |
| `concurrency` | `number` | Parallel browser tabs |
| `pixelFormat` | `string` | FFmpeg pixel format |
| `onProgress?` | `(progress: RenderProgress) => void` | Progress callback |

### `RenderProgress`

| Field | Type | Description |
|-------|------|-------------|
| `framesRendered` | `number` | Frames completed |
| `totalFrames` | `number` | Total frames |
| `percent` | `number` | 0-1 fraction |
| `etaMs` | `number \| null` | Estimated time remaining (ms) |

### Browser Lifecycle

```ts
import { launchBrowser, closeBrowser, createPage } from "@vibeo/renderer";

const browser = await launchBrowser();
const page = await createPage(browser, 1920, 1080); // browser, width, height
// ... render frames ...
await closeBrowser(); // closes the singleton browser, no argument needed
```

### Bundler

```ts
import { bundle } from "@vibeo/renderer";

const result: BundleResult = await bundle(entryPath);
// result.outDir — bundled output directory
// result.url — URL to access bundled app
// result.cleanup() — stop server and remove temp files
```

### Frame Operations

```ts
import { seekToFrame, loadBundle, captureFrame } from "@vibeo/renderer";

await loadBundle(page, bundleUrl);
await seekToFrame(page, 42, "MyComp");
const filePath = await captureFrame(page, outputDir, frameNumber, {
  imageFormat: "png",
  quality: 80,  // optional, for jpeg
});
```

### Frame Range Utilities

```ts
import { parseFrameRange, getRealFrameRange, validateFrameRange } from "@vibeo/renderer";

const range = parseFrameRange("0-100", 300);         // parseFrameRange(input, durationInFrames) → [0, 100]
const real = getRealFrameRange(300, range);           // getRealFrameRange(durationInFrames, frameRange) → [0, 100]
const fullRange = getRealFrameRange(300, null);       // → [0, 299]
validateFrameRange([0, 100], 300);                    // throws on invalid
```

### FFmpeg Stitching

```ts
import { stitchFrames, getContainerExt, stitchAudio } from "@vibeo/renderer";

await stitchFrames({
  framesDir: "/tmp/frames",
  outputPath: "out.mp4",
  fps: 30,
  codec: "h264",
  imageFormat: "png",
  pixelFormat: "yuv420p",
  quality: 80,
  width: 1920,
  height: 1080,
});

const ext = getContainerExt("vp9"); // "webm"

await stitchAudio({
  videoPath: "out.mp4",
  audioPaths: ["/tmp/audio.wav"],
  outputPath: "final.mp4",
});
```

### Parallel Rendering

```ts
import { parallelRender } from "@vibeo/renderer";

await parallelRender({
  browser,               // Playwright Browser instance
  bundleUrl,             // URL from bundle()
  compositionId: "MyComp",
  frameRange: [0, 299],  // [start, end] inclusive
  outputDir: "/tmp/frames",
  width: 1920,
  height: 1080,
  concurrency: 8,
  imageFormat: "png",
  quality: 80,            // optional
  onProgress: (p) => {},  // optional RenderProgress callback
});
```

---

## Codec Options

| Codec | Container | Use Case |
|-------|-----------|----------|
| `h264` | `.mp4` | General purpose, best compatibility |
| `h265` | `.mp4` | Better compression, less compatible |
| `vp9` | `.webm` | Web delivery, open format |
| `prores` | `.mov` | Professional editing, lossless quality |

### When to use each

- **`h264`**: Default. Works everywhere. Good quality/size trade-off.
- **`h265`**: 30-50% smaller files than h264 at same quality. Use when file size matters and playback devices support it.
- **`vp9`**: Best for web embedding. Royalty-free.
- **`prores`**: Editing workflows (Premiere, DaVinci). Large files but no quality loss.

---

## Output Format Options

- **`png` frames**: Lossless intermediate frames. Larger but no quality loss during capture.
- **`jpeg` frames**: Lossy but much smaller intermediate files. Use `--quality` to control (80 is good default).
- **`pixelFormat: "yuv420p"`**: Standard for h264/h265. Use `"yuv444p"` for maximum color fidelity with prores.

---

## Parallel Rendering Config

```bash
# Use 8 parallel browser tabs
bunx vibeo render --entry src/index.tsx --composition MyComp --concurrency 8
```

The frame range is split evenly across tabs. Default concurrency is `CPU cores / 2`.

For a 300-frame video with `--concurrency 4`:
- Tab 1: frames 0-74
- Tab 2: frames 75-149
- Tab 3: frames 150-224
- Tab 4: frames 225-299

---

## Types

```ts
import type {
  RenderConfig,
  RenderProgress,
  Codec,
  ImageFormat,
  FrameRange,
  StitchOptions,
  AudioMuxOptions,
  BundleResult,
} from "@vibeo/renderer";
```

---

## Gotchas and Tips

1. **FFmpeg must be installed** and available on `PATH` for stitching to work.

2. **Playwright is required** — the renderer uses it for headless browser rendering. Install with `bunx playwright install chromium`.

3. **Frame capture is the bottleneck** — increase `--concurrency` on machines with many cores to speed up rendering.

4. **`--frames` range is inclusive** — `--frames=0-100` renders 101 frames.

5. **Output directory is created automatically** — you don't need to `mkdir` before rendering.

6. **`pixelFormat: "yuv420p"`** is required for most players to handle h264/h265 correctly.


---

## LLM & Agent Integration

Vibeo's CLI is built with [incur](https://github.com/wevm/incur), making it natively discoverable by AI agents and LLMs.

### Discovering the API

```bash
# Get a compact summary of all CLI commands (ideal for LLM system prompts)
bunx @vibeo/cli --llms

# Get the full manifest with schemas, examples, and argument details
bunx @vibeo/cli --llms-full

# Get JSON Schema for a specific command (useful for structured tool calls)
bunx @vibeo/cli render --schema
bunx @vibeo/cli create --schema
```

### Using as an MCP Server

```bash
# Start Vibeo as an MCP (Model Context Protocol) server
bunx @vibeo/cli --mcp

# Register as a persistent MCP server for your agent
bunx @vibeo/cli mcp add
```

This lets LLMs call `create`, `render`, `preview`, and `list` as structured tool calls through the MCP protocol.

### Generating Skill Files

```bash
# Sync skill files to your agent's skill directory
bunx @vibeo/cli skills add
```

This generates markdown skill files that agents like Claude Code can discover and use to write Vibeo code without reading source.

### Agent-Friendly Output

```bash
# Output as JSON for programmatic consumption
bunx @vibeo/cli list --entry src/index.tsx --format json

# Output as YAML
bunx @vibeo/cli list --entry src/index.tsx --format yaml

# Filter output to specific keys
bunx @vibeo/cli list --entry src/index.tsx --filter-output compositions[0].id

# Count tokens in output (useful for context window planning)
bunx @vibeo/cli render --schema --token-count
```

### How LLMs Should Use Vibeo

1. **Discover commands**: Run `bunx @vibeo/cli --llms` to get the command manifest
2. **Create a project**: `bunx @vibeo/cli create my-video --template basic`
3. **Edit `src/index.tsx`**: Write React components using `@vibeo/core` hooks and components
4. **Preview**: `bunx @vibeo/cli preview --entry src/index.tsx`
5. **Render**: `bunx @vibeo/cli render --entry src/index.tsx --composition MyComp`

All commands accept `--format json` for structured output that LLMs can parse reliably.
