# Vibeo

A React-based programmatic video framework. Write video compositions as React components, preview them in the browser, and render to video with FFmpeg.

## Packages

| Package | Description |
|---------|-------------|
| `@vibeo/core` | Timing engine, interpolation, Composition, Sequence, Loop, hooks |
| `@vibeo/audio` | 48kHz audio sync, mixing, volume curves, Audio/Video components |
| `@vibeo/player` | Interactive Player with frame-accurate playback and controls |
| `@vibeo/renderer` | Headless rendering via Playwright + FFmpeg stitching |
| `@vibeo/effects` | Keyframes, transitions, spring physics, audio-reactive animations |
| `@vibeo/extras` | Subtitles (SRT/VTT), audio visualization, scene graph, audio mixing |
| `@vibeo/cli` | CLI: create, render, preview, list commands |

## Quick Start

```bash
# Create a new project
bunx @vibeo/cli create my-video

# Or from a template
bunx @vibeo/cli create my-video --template audio-reactive

cd my-video
bun install

# Preview in browser
bunx @vibeo/cli preview --entry src/index.tsx

# Render to video
bunx @vibeo/cli render --entry src/index.tsx --composition MyComp --output out.mp4

# List compositions
bunx @vibeo/cli list --entry src/index.tsx
```

### Templates

- `basic` - Text animation with two scenes
- `audio-reactive` - Audio visualization with frequency bars
- `transitions` - Scene transitions (fade, slide, dissolve)
- `subtitles` - Video with SRT subtitle overlay

## Examples

### Basic Composition

Two scenes with fade-in animation and a frame counter.

```tsx
import React from "react";
import {
  Composition,
  Sequence,
  VibeoRoot,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  easeInOut,
} from "@vibeo/core";

function TitleScene() {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
  });
  const y = interpolate(frame, [0, 30], [40, 0], {
    easing: easeInOut,
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width, height,
        display: "flex", justifyContent: "center", alignItems: "center",
        background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
      }}
    >
      <h1 style={{ color: "white", fontSize: 72, opacity, transform: `translateY(${y}px)` }}>
        Hello, Vibeo!
      </h1>
    </div>
  );
}

function ContentScene() {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const seconds = (frame / fps).toFixed(1);

  return (
    <div
      style={{
        width, height,
        display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center",
        background: "#24243e",
      }}
    >
      <p style={{ color: "white", fontSize: 48 }}>Scene 2</p>
      <p style={{ color: "white", fontSize: 32, opacity: 0.7 }}>{seconds}s elapsed</p>
    </div>
  );
}

function MyVideo() {
  return (
    <>
      <Sequence from={0} durationInFrames={75} name="Title">
        <TitleScene />
      </Sequence>
      <Sequence from={75} durationInFrames={75} name="Content">
        <ContentScene />
      </Sequence>
    </>
  );
}

export function Root() {
  return (
    <VibeoRoot>
      <Composition
        id="BasicComposition"
        component={MyVideo}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={150}
      />
    </VibeoRoot>
  );
}
```

### Audio-Reactive Visualization

Frequency bars that react to bass/mid/treble with amplitude-driven background shifts.

```tsx
import React from "react";
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

  return (
    <div style={{ position: "absolute", bottom: 60, left: width * 0.1, display: "flex", alignItems: "flex-end", gap: 2 }}>
      {Array.from({ length: barCount }, (_, i) => {
        const db = audio.frequencies[i * step];
        const normalized = Math.max(0, (db + 100) / 100);
        const hue = interpolate(i, [0, barCount - 1], [220, 340]);
        return (
          <div key={i} style={{
            width: barWidth - 2,
            height: Math.max(2, normalized * height * 0.6),
            background: `hsl(${hue}, 80%, 60%)`,
            borderRadius: 2,
          }} />
        );
      })}
    </div>
  );
}

function AudioViz() {
  const { width, height } = useVideoConfig();
  const audio = useAudioData(AUDIO_SRC);
  const hue = 240 + (audio ? audio.amplitude * 60 : 0);

  return (
    <div style={{ width, height, background: `radial-gradient(ellipse, hsl(${hue}, 40%, 13%), hsl(${hue}, 30%, 8%))`, position: "relative" }}>
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
```

### Transitions Between Scenes

Fade and slide transitions using the `<Transition>` component.

```tsx
import React from "react";
import { Composition, Sequence, VibeoRoot, useCurrentFrame, useVideoConfig, interpolate, easeOut } from "@vibeo/core";
import { Transition } from "@vibeo/effects";

function ColorScene({ title, color }: { title: string; color: string }) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const opacity = interpolate(frame, [0, 20], [0, 1], { easing: easeOut, extrapolateRight: "clamp" });

  return (
    <div style={{ width, height, background: color, display: "flex", justifyContent: "center", alignItems: "center" }}>
      <h1 style={{ color: "white", fontSize: 80, opacity }}>{title}</h1>
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
```

### Subtitle Overlay

SRT subtitles synced to the video timeline.

```tsx
import React from "react";
import { Composition, Sequence, VibeoRoot, useCurrentFrame, useVideoConfig, interpolate } from "@vibeo/core";
import { Subtitle } from "@vibeo/extras";

const SUBTITLES_SRT = `1
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
The end. Thanks for watching!`;

function SubtitleVideo() {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const hue = interpolate(frame, [0, 480], [200, 280]);

  return (
    <div style={{ width, height, position: "relative" }}>
      <div style={{ width, height, background: `linear-gradient(135deg, hsl(${hue}, 50%, 15%), hsl(${hue + 40}, 40%, 10%))` }} />
      <div style={{ position: "absolute", top: 0, left: 0, width, height }}>
        <Subtitle
          src={SUBTITLES_SRT}
          format="srt"
          position="bottom"
          fontSize={36}
          color="white"
          outlineColor="black"
          outlineWidth={2}
          style={{ padding: "0 80px 60px" }}
        />
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
```

## Core Concepts

**Frame-based timeline** - Everything is keyed to frame numbers, not time. `useCurrentFrame()` returns the frame relative to the nearest `<Sequence>`.

**Compositions** - `<Composition>` registers a video with metadata (dimensions, fps, duration, component). Must be inside `<VibeoRoot>`.

**Sequences** - `<Sequence from={30} durationInFrames={60}>` time-shifts children. `useCurrentFrame()` resets to 0 inside each sequence. Supports arbitrary nesting.

**Interpolation** - The core animation primitive:

```tsx
// Map frame 0-30 to opacity 0-1
const opacity = interpolate(frame, [0, 30], [0, 1], {
  easing: easeInOut,
  extrapolateRight: "clamp",
});
```

**Audio sync** - `<Audio>` and `<Video>` components sync media playback to the frame timeline at 48kHz sample rate.

## CLI Commands

```bash
# Create a new project
bunx @vibeo/cli create <name> [--template basic|audio-reactive|transitions|subtitles]

# Preview in browser with controls
bunx @vibeo/cli preview --entry src/index.tsx [--port 3000]

# Render to video file
bunx @vibeo/cli render --entry src/index.tsx --composition MyComp [--output out.mp4] [--codec h264|h265|vp9|prores] [--frames 0-100] [--concurrency 4]

# List registered compositions
bunx @vibeo/cli list --entry src/index.tsx
```

## LLM & Agent Integration

Vibeo's CLI is built with [incur](https://github.com/wevm/incur), making it natively discoverable by AI agents.

```bash
# Get an LLM-readable summary of all commands
bunx @vibeo/cli --llms

# Get the full manifest with schemas and examples
bunx @vibeo/cli --llms-full

# Get JSON Schema for any command
bunx @vibeo/cli render --schema

# Run as an MCP server
bunx @vibeo/cli --mcp

# Sync skill files for agent discovery
bunx @vibeo/cli skills add

# Generate shell completions
bunx @vibeo/cli completions

# Output as JSON, YAML, or Markdown
bunx @vibeo/cli list --entry src/index.tsx --format json
```

## License

MIT
