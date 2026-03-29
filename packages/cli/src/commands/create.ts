import { resolve, join } from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";

// ---------------------------------------------------------------------------
// Embedded templates
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
  basic: { description: "Minimal composition with text animation and two scenes", source: TEMPLATE_BASIC },
  "audio-reactive": { description: "Audio visualization with frequency bars", source: TEMPLATE_AUDIO_REACTIVE },
  transitions: { description: "Scene transitions (fade, slide)", source: TEMPLATE_TRANSITIONS },
  subtitles: { description: "Video with SRT subtitle overlay", source: TEMPLATE_SUBTITLES },
};

export const TEMPLATE_NAMES = Object.keys(TEMPLATES);

export async function createProject(
  name: string,
  template: string,
): Promise<{ project: string; template: string; files: string[] }> {
  const tmpl = TEMPLATES[template];
  if (!tmpl) throw new Error(`Unknown template: ${template}`);

  const projectDir = resolve(name);
  if (existsSync(projectDir)) throw new Error(`Directory "${name}" already exists`);

  await mkdir(join(projectDir, "src"), { recursive: true });
  await mkdir(join(projectDir, "public"), { recursive: true });

  await writeFile(join(projectDir, "src", "index.tsx"), tmpl.source);

  const pkg = {
    name,
    version: "0.0.1",
    private: true,
    type: "module",
    scripts: {
      dev: "bun vibeo preview --entry src/index.tsx",
      build: "bun vibeo render --entry src/index.tsx",
      list: "bun vibeo list --entry src/index.tsx",
      editor: "bun vibeo editor --entry src/index.tsx",
      typecheck: "bunx tsc --noEmit",
    },
    dependencies: {
      "@vibeo/core": "^0.1.0",
      "@vibeo/audio": "^0.1.0",
      "@vibeo/effects": "^0.1.0",
      "@vibeo/extras": "^0.1.0",
      "@vibeo/player": "^0.1.0",
      "@vibeo/editor": "^0.1.0",
      "@vibeo/renderer": "^0.2.0",
      "@vibeo/cli": "^0.4.0",
      react: "^19.0.0",
      "react-dom": "^19.0.0",
    },
    devDependencies: {
      "@types/react": "^19.0.0",
      typescript: "^5.0.0",
    },
  };
  await writeFile(join(projectDir, "package.json"), JSON.stringify(pkg, null, 2) + "\n");

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

  await writeFile(join(projectDir, ".gitignore"), "node_modules/\ndist/\nout/\n*.tmp\n.DS_Store\n");

  const files = ["src/index.tsx", "package.json", "tsconfig.json", ".gitignore", "public/"];
  return { project: name, template, files };
}
