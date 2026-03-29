import { Cli, z } from "incur";
import { resolve } from "node:path";
import { availableParallelism } from "node:os";
import { createProject } from "./commands/create.js";
import { startPreview } from "./commands/preview.js";
import { listCompositions } from "./commands/list.js";
import { renderVideo } from "./commands/render.js";
import { installSkills } from "./commands/install-skills.js";
// editor imported lazily to avoid crashing when @vibeo/renderer doesn't have bundleForEditor

const cli = Cli.create("vibeo", {
  description: "React-based programmatic video framework CLI",
  sync: {
    suggestions: [
      "create a new video project",
      "preview a composition in the browser",
      "render a composition to video",
      "list all registered compositions",
    ],
  },
});

cli.command("create", {
  description: "Create a new Vibeo project from a template",
  args: z.object({
    name: z.string().describe("Project directory name"),
  }),
  options: z.object({
    template: z
      .enum(["basic", "audio-reactive", "transitions", "subtitles"])
      .default("basic")
      .describe("Template to scaffold from"),
  }),
  examples: [
    { args: { name: "my-video" }, description: "Create with basic template" },
    { args: { name: "viz" }, options: { template: "audio-reactive" }, description: "Create with audio-reactive template" },
  ],
  async run(c) {
    return await createProject(c.args.name, c.options.template);
  },
});

cli.command("preview", {
  description: "Start a dev server with live preview in the browser",
  options: z.object({
    entry: z.string().describe("Path to the root file with compositions"),
    port: z.number().default(3000).describe("Port for the dev server"),
  }),
  examples: [
    { options: { entry: "src/index.tsx" }, description: "Preview on default port" },
  ],
  async run(c) {
    await startPreview(resolve(c.options.entry), c.options.port);
  },
});

cli.command("render", {
  description: "Render a composition to a video file",
  options: z.object({
    entry: z.string().describe("Path to the root file with compositions"),
    composition: z.string().describe("Composition ID to render"),
    output: z.string().optional().describe("Output file path (default: out/<id>.mp4)"),
    fps: z.number().optional().describe("Override frames per second"),
    frames: z.string().optional().describe('Frame range, e.g. "0-100" or "50"'),
    codec: z
      .enum(["h264", "h265", "vp9", "prores"])
      .default("h264")
      .describe("Video codec"),
    concurrency: z
      .number()
      .default(Math.max(1, Math.floor(availableParallelism() / 2)))
      .describe("Number of parallel browser tabs"),
    imageFormat: z
      .enum(["png", "jpeg"])
      .default("png")
      .describe("Intermediate frame image format"),
    quality: z.number().default(80).describe("JPEG quality / CRF value (0-100)"),
  }),
  examples: [
    { options: { entry: "src/index.tsx", composition: "MyComp" }, description: "Render with defaults" },
    { options: { entry: "src/index.tsx", composition: "MyComp", codec: "vp9", frames: "0-100" }, description: "Render a frame range as WebM" },
  ],
  async run(c) {
    return await renderVideo({
      entry: resolve(c.options.entry),
      composition: c.options.composition,
      output: c.options.output,
      fps: c.options.fps ?? null,
      frames: c.options.frames ?? null,
      codec: c.options.codec,
      concurrency: c.options.concurrency,
      imageFormat: c.options.imageFormat,
      quality: c.options.quality,
    });
  },
});

cli.command("list", {
  description: "List registered compositions in an entry file",
  options: z.object({
    entry: z.string().describe("Path to the root file with compositions"),
  }),
  examples: [
    { options: { entry: "src/index.tsx" }, description: "List all compositions" },
  ],
  async run(c) {
    const compositions = await listCompositions(resolve(c.options.entry));
    return { compositions };
  },
});

cli.command("editor", {
  description: "Open the visual video editor in the browser",
  options: z.object({
    entry: z.string().describe("Path to the root file with compositions"),
    port: z.number().default(3001).describe("Port for the editor server"),
  }),
  examples: [
    { options: { entry: "src/index.tsx" }, description: "Open editor on default port" },
  ],
  async run(c) {
    const { startEditor } = await import("./commands/editor.js");
    await startEditor(resolve(c.options.entry), c.options.port);
  },
});

cli.command("install-skills", {
  description:
    "Install Vibeo skill/rule files for all supported LLM coding tools (Claude, Codex, Cursor, Gemini, OpenCode, Aider)",
  options: z.object({
    targets: z
      .string()
      .optional()
      .describe(
        'Comma-separated list of targets (default: all). Options: claude, codex, cursor, gemini, opencode, aider',
      ),
  }),
  examples: [
    { description: "Install for all supported tools" },
    { options: { targets: "claude,cursor" }, description: "Install for Claude and Cursor only" },
  ],
  async run(c) {
    const targets = c.options.targets
      ? c.options.targets.split(",").map((t: string) => t.trim())
      : [];
    return await installSkills(targets, process.cwd());
  },
});

cli.serve();
