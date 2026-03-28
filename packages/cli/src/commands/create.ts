import { resolve, join } from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";

// ---------------------------------------------------------------------------
// Embedded templates (so `create` works from npm without the examples/ dir)
// ---------------------------------------------------------------------------

const TEMPLATE_BASIC = `import React from "react";
import {
  Composition, Sequence, VibeoRoot,
  useCurrentFrame, useVideoConfig, interpolate, easeInOut,
} from "@vibeo/core";

function TitleScene() {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });
  const y = interpolate(frame, [0, 30], [40, 0], { easing: easeInOut, extrapolateRight: "clamp" });

  return (
    <div style={{ width, height, display: "flex", justifyContent: "center", alignItems: "center", background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)" }}>
      <h1 style={{ color: "white", fontSize: 72, fontFamily: "sans-serif", opacity, transform: \`translateY(\${y}px)\` }}>Hello, Vibeo!</h1>
    </div>
  );
}

function ContentScene() {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const seconds = (frame / fps).toFixed(1);
  const scale = interpolate(frame, [0, 20], [0.8, 1], { easing: easeInOut, extrapolateRight: "clamp" });

  return (
    <div style={{ width, height, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "#24243e" }}>
      <div style={{ transform: \`scale(\${scale})\`, color: "white", fontSize: 48, fontFamily: "sans-serif", textAlign: "center" }}>
        <p>Scene 2</p>
        <p style={{ fontSize: 32, opacity: 0.7 }}>{seconds}s elapsed</p>
      </div>
    </div>
  );
}

function MyVideo() {
  return (
    <>
      <Sequence from={0} durationInFrames={75} name="Title"><TitleScene /></Sequence>
      <Sequence from={75} durationInFrames={75} name="Content"><ContentScene /></Sequence>
    </>
  );
}

export function Root() {
  return (
    <VibeoRoot>
      <Composition id="BasicComposition" component={MyVideo} width={1920} height={1080} fps={30} durationInFrames={150} />
    </VibeoRoot>
  );
}
`;

const TEMPLATE_AUDIO_REACTIVE = `import React from "react";
import { Composition, VibeoRoot, useCurrentFrame, useVideoConfig, interpolate } from "@vibeo/core";
import { Audio } from "@vibeo/audio";
import { useAudioData } from "@vibeo/effects";

const AUDIO_SRC = "/music.mp3";

function FrequencyBars() {
  const { width, height } = useVideoConfig();
  const audio = useAudioData(AUDIO_SRC, { fftSize: 1024 });
  if (!audio) return <div style={{ width, height }} />;

  const barCount = 48;
  const step = Math.floor(audio.frequencies.length / barCount);
  const barWidth = (width * 0.8) / barCount;
  const maxBarHeight = height * 0.6;

  return (
    <div style={{ position: "absolute", bottom: 60, left: width * 0.1, display: "flex", alignItems: "flex-end", gap: 2 }}>
      {Array.from({ length: barCount }, (_, i) => {
        const db = audio.frequencies[i * step];
        const normalized = Math.max(0, (db + 100) / 100);
        const hue = interpolate(i, [0, barCount - 1], [220, 340]);
        return (
          <div key={i} style={{ width: barWidth - 2, height: Math.max(2, normalized * maxBarHeight), background: \`hsl(\${hue}, 80%, 60%)\`, borderRadius: 2 }} />
        );
      })}
    </div>
  );
}

function AudioViz() {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const audio = useAudioData(AUDIO_SRC);
  const hue = 240 + (audio ? audio.amplitude * 60 : 0);
  const lightness = audio ? 8 + audio.amplitude * 12 : 8;

  return (
    <div style={{ width, height, background: \`radial-gradient(ellipse at center, hsl(\${hue}, 40%, \${lightness + 5}%), hsl(\${hue}, 30%, \${lightness}%))\`, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 40, left: 40, color: "white", fontFamily: "sans-serif" }}>
        <h1 style={{ fontSize: 36, margin: 0, opacity: 0.9 }}>Audio Visualizer</h1>
        <p style={{ fontSize: 18, margin: "8px 0 0", opacity: 0.5 }}>{(frame / fps).toFixed(1)}s</p>
      </div>
      <FrequencyBars />
      <Audio src={AUDIO_SRC} volume={0.8} />
    </div>
  );
}

export function Root() {
  return (
    <VibeoRoot>
      <Composition id="AudioReactiveViz" component={AudioViz} width={1920} height={1080} fps={30} durationInFrames={900} />
    </VibeoRoot>
  );
}
`;

const TEMPLATE_TRANSITIONS = `import React from "react";
import { Composition, Sequence, VibeoRoot, useCurrentFrame, useVideoConfig, interpolate, easeOut } from "@vibeo/core";
import { Transition } from "@vibeo/effects";

function ColorScene({ title, color }: { title: string; color: string }) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const opacity = interpolate(frame, [0, 20], [0, 1], { easing: easeOut, extrapolateRight: "clamp" });

  return (
    <div style={{ width, height, background: color, display: "flex", justifyContent: "center", alignItems: "center" }}>
      <h1 style={{ color: "white", fontSize: 80, fontFamily: "sans-serif", opacity }}>{title}</h1>
    </div>
  );
}

function SceneA() { return <ColorScene title="Scene One" color="linear-gradient(135deg, #667eea, #764ba2)" />; }
function SceneB() { return <ColorScene title="Scene Two" color="linear-gradient(135deg, #f093fb, #f5576c)" />; }
function SceneC() { return <ColorScene title="Scene Three" color="linear-gradient(135deg, #4facfe, #00f2fe)" />; }

function TransitionDemo() {
  return (
    <>
      <Sequence from={0} durationInFrames={85}><SceneA /></Sequence>
      <Sequence from={65} durationInFrames={20}>
        <Transition type="fade" durationInFrames={20}><SceneA /><SceneB /></Transition>
      </Sequence>
      <Sequence from={85} durationInFrames={85}><SceneB /></Sequence>
      <Sequence from={150} durationInFrames={20}>
        <Transition type="slide" durationInFrames={20} direction="left"><SceneB /><SceneC /></Transition>
      </Sequence>
      <Sequence from={170} durationInFrames={70}><SceneC /></Sequence>
    </>
  );
}

export function Root() {
  return (
    <VibeoRoot>
      <Composition id="TransitionDemo" component={TransitionDemo} width={1920} height={1080} fps={30} durationInFrames={240} />
    </VibeoRoot>
  );
}
`;

const TEMPLATE_SUBTITLES = `import React from "react";
import { Composition, Sequence, VibeoRoot, useCurrentFrame, useVideoConfig, interpolate } from "@vibeo/core";
import { Subtitle } from "@vibeo/extras";

const SUBTITLES_SRT = \`1
00:00:00,500 --> 00:00:03,000
Welcome to the Vibeo demo.

2
00:00:03,500 --> 00:00:06,000
This shows subtitle overlays.

3
00:00:06,500 --> 00:00:09,000
Subtitles are synced to the frame timeline.

4
00:00:09,500 --> 00:00:12,000
You can use <b>bold</b> and <i>italic</i> text.

5
00:00:13,000 --> 00:00:16,000
The end. Thanks for watching!\`;

function SubtitleVideo() {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const hue = interpolate(frame, [0, 480], [200, 280]);

  return (
    <div style={{ width, height, position: "relative" }}>
      <div style={{ width, height, background: \`linear-gradient(135deg, hsl(\${hue}, 50%, 15%), hsl(\${hue + 40}, 40%, 10%))\` }} />
      <div style={{ position: "absolute", top: 0, left: 0, width, height }}>
        <Subtitle src={SUBTITLES_SRT} format="srt" position="bottom" fontSize={36} color="white" outlineColor="black" outlineWidth={2} style={{ padding: "0 80px 60px" }} />
      </div>
    </div>
  );
}

export function Root() {
  return (
    <VibeoRoot>
      <Composition id="SubtitleOverlay" component={SubtitleVideo} width={1920} height={1080} fps={30} durationInFrames={480} />
    </VibeoRoot>
  );
}
`;

// ---------------------------------------------------------------------------

const TEMPLATES: Record<string, { description: string; source: string }> = {
  basic: {
    description: "Minimal composition with text animation and two scenes",
    source: TEMPLATE_BASIC,
  },
  "audio-reactive": {
    description: "Audio visualization with frequency bars and amplitude-driven effects",
    source: TEMPLATE_AUDIO_REACTIVE,
  },
  transitions: {
    description: "Scene transitions (fade, slide) between multiple scenes",
    source: TEMPLATE_TRANSITIONS,
  },
  subtitles: {
    description: "Video with SRT subtitle overlay",
    source: TEMPLATE_SUBTITLES,
  },
};

interface CreateArgs {
  name: string;
  template: string;
}

function parseArgs(args: string[]): CreateArgs {
  const result: CreateArgs = { name: "", template: "basic" };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;
    const next = args[i + 1];

    if (arg === "--template" && next) {
      result.template = next;
      i++;
    } else if (arg.startsWith("--template=")) {
      result.template = arg.slice("--template=".length);
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else if (!arg.startsWith("-") && !result.name) {
      result.name = arg;
    }
  }

  return result;
}

function printHelp(): void {
  console.log(`
vibeo create - Create a new Vibeo project

Usage:
  vibeo create <project-name> [options]

Options:
  --template <name>   Template to use (default: basic)
  --help              Show this help

Templates:`);

  for (const [name, { description }] of Object.entries(TEMPLATES)) {
    console.log(`  ${name.padEnd(18)} ${description}`);
  }

  console.log(`
Examples:
  vibeo create my-video
  vibeo create music-viz --template audio-reactive
  vibeo create intro --template transitions
`);
}

export async function createCommand(args: string[]): Promise<void> {
  const parsed = parseArgs(args);

  if (!parsed.name) {
    console.error("Error: project name is required\n");
    printHelp();
    process.exit(1);
  }

  const template = TEMPLATES[parsed.template];
  if (!template) {
    console.error(`Error: unknown template "${parsed.template}"`);
    console.error(`Available: ${Object.keys(TEMPLATES).join(", ")}`);
    process.exit(1);
  }

  const projectDir = resolve(parsed.name);
  if (existsSync(projectDir)) {
    console.error(`Error: directory "${parsed.name}" already exists`);
    process.exit(1);
  }

  console.log(`\nCreating Vibeo project: ${parsed.name}`);
  console.log(`Template: ${parsed.template}\n`);

  // Create project structure
  await mkdir(join(projectDir, "src"), { recursive: true });
  await mkdir(join(projectDir, "public"), { recursive: true });

  // Write template source
  await writeFile(join(projectDir, "src", "index.tsx"), template.source);

  // Write package.json
  const pkg = {
    name: parsed.name,
    version: "0.0.1",
    private: true,
    type: "module",
    scripts: {
      dev: "bunx @vibeo/cli preview --entry src/index.tsx",
      build: "bunx @vibeo/cli render --entry src/index.tsx",
      list: "bunx @vibeo/cli list --entry src/index.tsx",
      typecheck: "bunx tsc --noEmit",
    },
    dependencies: {
      "@vibeo/core": "^0.1.0",
      "@vibeo/audio": "^0.1.0",
      "@vibeo/effects": "^0.1.0",
      "@vibeo/extras": "^0.1.0",
      "@vibeo/player": "^0.1.0",
      "@vibeo/renderer": "^0.1.0",
      "@vibeo/cli": "^0.1.0",
      react: "^19.0.0",
      "react-dom": "^19.0.0",
    },
    devDependencies: {
      "@types/react": "^19.0.0",
      typescript: "^5.0.0",
    },
  };
  await writeFile(join(projectDir, "package.json"), JSON.stringify(pkg, null, 2) + "\n");

  // Write tsconfig.json
  const tsconfig = {
    compilerOptions: {
      target: "ES2022",
      module: "ESNext",
      moduleResolution: "bundler",
      jsx: "react-jsx",
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      outDir: "dist",
      declaration: true,
      declarationMap: true,
      sourceMap: true,
    },
    include: ["src"],
  };
  await writeFile(join(projectDir, "tsconfig.json"), JSON.stringify(tsconfig, null, 2) + "\n");

  // Write .gitignore
  await writeFile(
    join(projectDir, ".gitignore"),
    `node_modules/
dist/
out/
*.tmp
.DS_Store
`,
  );

  console.log(`  Created ${parsed.name}/`);
  console.log(`  ├── src/index.tsx`);
  console.log(`  ├── public/`);
  console.log(`  ├── package.json`);
  console.log(`  ├── tsconfig.json`);
  console.log(`  └── .gitignore`);

  console.log(`
Next steps:
  cd ${parsed.name}
  bun install
  bun run dev        # preview in browser
  bun run build      # render to video
`);
}
