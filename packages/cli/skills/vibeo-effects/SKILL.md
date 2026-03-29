# Vibeo Effects (`@vibeo/effects`)

## Overview

`@vibeo/effects` provides advanced animation primitives that go beyond basic interpolation: declarative keyframes, spring physics, scene transitions, and audio-reactive animation hooks.

**When to use**: When you need keyframe animation, physics-based springs, transitions between scenes, or audio-driven visuals.

---

## API Reference

### `useKeyframes(frame, keyframes, options?): number`

Declarative keyframe animation. Automatically interpolates between keyframe stops.

```ts
import { useKeyframes } from "@vibeo/effects";
import { useCurrentFrame, easeInOut } from "@vibeo/core";

const frame = useCurrentFrame();
const y = useKeyframes(frame, { 0: 0, 30: 100, 60: 0 }, { easing: easeInOut });
```

**Parameters**:
| Param | Type | Description |
|-------|------|-------------|
| `frame` | `number` | Current frame (pass `useCurrentFrame()`) |
| `keyframes` | `KeyframeMap` | `Record<number, KeyframeStop>` — frame-to-value mapping |
| `options?` | `KeyframeOptions` | Default easing function |

**`KeyframeStop`**: `number | { value: number; easing?: (t: number) => number }`

Per-segment easing uses the **starting** stop's easing function for that segment.

```ts
const scale = useKeyframes(frame, {
  0: { value: 0, easing: easeIn },
  20: { value: 1.2, easing: easeOut },
  30: 1,
});
```

### `useSpring(options): number`

Physics-based spring animation. Simulates mass-spring-damper system per frame.

```ts
import { useSpring } from "@vibeo/effects";

const x = useSpring({ from: 0, to: 100 });
const bouncy = useSpring({ from: 0, to: 1, config: { mass: 1, stiffness: 300, damping: 10 } });
```

**`SpringOptions`**:
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `from` | `number` | — | Start value |
| `to` | `number` | — | Target value |
| `frame?` | `number` | `useCurrentFrame()` | Frame override |
| `fps?` | `number` | `useVideoConfig().fps` | FPS override |
| `config?` | `SpringConfig` | see below | Physics parameters |

**`SpringConfig`** (defaults):
| Field | Default | Description |
|-------|---------|-------------|
| `mass` | `1` | Mass of the object |
| `stiffness` | `170` | Spring stiffness |
| `damping` | `26` | Damping coefficient |

### `springDuration(options): number`

Compute how many frames a spring takes to settle.

```ts
const dur = springDuration({ fps: 30, config: { stiffness: 300, damping: 10 } });
```

### `Transition`

Component for transitioning between exactly two children.

```tsx
import { Transition } from "@vibeo/effects";
import { Sequence } from "@vibeo/core";

<Sequence from={55} durationInFrames={20}>
  <Transition type="fade" durationInFrames={20}>
    <SceneA />
    <SceneB />
  </Transition>
</Sequence>
```

**`TransitionProps`**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `TransitionType` | — | `"fade" \| "wipe" \| "slide" \| "dissolve"` |
| `durationInFrames` | `number` | — | Frames the transition lasts |
| `timing?` | `TransitionTiming` | `"in-and-out"` | `"in-and-out" \| "in" \| "out"` |
| `direction?` | `TransitionDirection` | `"left"` | `"left" \| "right" \| "up" \| "down"` (for wipe/slide) |
| `children` | `[ReactNode, ReactNode]` | — | Exactly 2 children |

### Transition Strategies

```ts
import { fade, wipe, slide, dissolve } from "@vibeo/effects";
```

Each returns `{ childA: CSSProperties; childB: CSSProperties }` for a given `TransitionState`.

| Strategy | Effect |
|----------|--------|
| `fade` | Opacity crossfade |
| `wipe` | Clip-path reveal |
| `slide` | Transform slide in/out |
| `dissolve` | Mix-blend + opacity |

### `useAudioData(audioSrc, options?): AudioAnalysis | null`

Pre-analyzes an audio file and returns per-frame frequency/amplitude data. Returns `null` while loading.

```ts
import { useAudioData } from "@vibeo/effects";

const data = useAudioData("/music.mp3", { fftSize: 2048 });
if (data) {
  // data.amplitude — overall RMS amplitude (0-1)
  // data.bass      — average energy in 20-250 Hz
  // data.mid       — average energy in 250-4000 Hz
  // data.treble    — average energy in 4000-20000 Hz
  // data.frequencies — Float32Array of FFT magnitude data (dB)
}
```

**`AudioDataOptions`**:
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `fftSize?` | `number` | `2048` | FFT window size (power of 2) |

**`AudioAnalysis`**:
| Field | Type | Description |
|-------|------|-------------|
| `amplitude` | `number` | Overall RMS amplitude (0-1 range) |
| `frequencies` | `Float32Array` | Full FFT magnitude data in dB |
| `bass` | `number` | Average energy 20-250 Hz |
| `mid` | `number` | Average energy 250-4000 Hz |
| `treble` | `number` | Average energy 4000-20000 Hz |

### `useTransitionProgress(durationInFrames): number | null`

Returns the transition progress (0 to 1) within a transition window, or `null` outside.

```ts
const progress = useTransitionProgress(20);
if (progress !== null) {
  // 0 at start of transition, 1 at end
}
```

### Types

```ts
import type {
  KeyframeStop,
  KeyframeMap,
  KeyframeOptions,
  SpringConfig,
  SpringOptions,
  TransitionTiming,
  TransitionDirection,
  TransitionType,
  TransitionProps,
  TransitionState,
  AudioAnalysis,
  AudioDataOptions,
} from "@vibeo/effects";
```

---

## Keyframe Animation Recipes

### Fade in

```ts
const opacity = useKeyframes(frame, { 0: 0, 30: 1 });
```

### Bounce

```ts
const y = useKeyframes(frame, {
  0: 0,
  15: { value: -100, easing: easeOut },
  30: { value: 0, easing: easeIn },
  45: { value: -40, easing: easeOut },
  60: 0,
});
```

### Slide in from left

```ts
const x = useKeyframes(frame, {
  0: -1920,
  30: { value: 0, easing: easeOut },
});
```

### Scale pulse

```ts
const scale = useKeyframes(frame, { 0: 1, 15: 1.2, 30: 1 }, { easing: easeInOut });
```

---

## Spring Animation Guide

### Named Spring Presets

| Name | stiffness | damping | mass | Use case |
|------|-----------|---------|------|----------|
| **snappy** | 300 | 30 | 1 | UI elements, quick responses |
| **bouncy** | 400 | 10 | 1 | Playful entrances, logos |
| **gentle** | 100 | 26 | 1 | Subtle movements, text |
| **heavy** | 50 | 20 | 3 | Large elements, dramatic reveals |
| **elastic** | 200 | 8 | 1 | Overshoot effects, attention grabbers |

```ts
// Snappy
useSpring({ from: 0, to: 1, config: { stiffness: 300, damping: 30, mass: 1 } })
// Bouncy
useSpring({ from: 0, to: 1, config: { stiffness: 400, damping: 10, mass: 1 } })
// Gentle
useSpring({ from: 0, to: 1, config: { stiffness: 100, damping: 26, mass: 1 } })
// Heavy
useSpring({ from: 0, to: 1, config: { stiffness: 50, damping: 20, mass: 3 } })
// Elastic
useSpring({ from: 0, to: 1, config: { stiffness: 200, damping: 8, mass: 1 } })
```

**Tuning guide**:
- Higher `stiffness` = faster motion, more overshoot
- Higher `damping` = less bounce, settles faster
- Higher `mass` = slower, more momentum

---

## Transition Usage Between Scenes

```tsx
function MyVideo() {
  return (
    <>
      {/* Scene A plays frames 0-59 */}
      <Sequence from={0} durationInFrames={75}>
        <SceneA />
      </Sequence>

      {/* 15-frame fade transition overlapping scenes */}
      <Sequence from={55} durationInFrames={20}>
        <Transition type="fade" durationInFrames={20}>
          <SceneA />
          <SceneB />
        </Transition>
      </Sequence>

      {/* Scene B continues */}
      <Sequence from={75} durationInFrames={90}>
        <SceneB />
      </Sequence>
    </>
  );
}
```

For directional transitions:
```tsx
<Transition type="slide" durationInFrames={20} direction="right">
  <OldScene />
  <NewScene />
</Transition>
```

---

## Audio-Reactive Animation Patterns

### Beat-reactive scale

```tsx
function BeatCircle() {
  const frame = useCurrentFrame();
  const audio = useAudioData("/track.mp3");
  const baseScale = audio ? 1 + audio.bass * 2 : 1;

  return (
    <div style={{
      width: 100,
      height: 100,
      borderRadius: "50%",
      background: "white",
      transform: `scale(${baseScale})`,
    }} />
  );
}
```

### Audio visualizer bars

```tsx
function Visualizer() {
  const audio = useAudioData("/music.mp3", { fftSize: 512 });
  if (!audio) return null;

  const barCount = 32;
  const step = Math.floor(audio.frequencies.length / barCount);

  return (
    <div style={{ display: "flex", alignItems: "flex-end", height: 200 }}>
      {Array.from({ length: barCount }, (_, i) => {
        const db = audio.frequencies[i * step];
        const height = Math.max(2, ((db + 100) / 100) * 200);
        return <div key={i} style={{ width: 8, height, margin: 1, background: "cyan" }} />;
      })}
    </div>
  );
}
```

### Background color shift with amplitude

```tsx
function ReactiveBackground({ children }: { children: React.ReactNode }) {
  const audio = useAudioData("/music.mp3");
  const hue = audio ? Math.round(audio.amplitude * 360) : 200;
  const lightness = audio ? 20 + audio.amplitude * 30 : 20;

  return (
    <div style={{
      width: "100%",
      height: "100%",
      background: `hsl(${hue}, 70%, ${lightness}%)`,
    }}>
      {children}
    </div>
  );
}
```

---

## CodeBlock Recipe (for developer/tutorial content)

The most common component in programming videos. Takes a plain string + optional highlight words:

```tsx
function CodeBlock({
  code,
  highlights = [],
  fontSize = 24,
  startFrame = 0,
  lineDelay = 3,
}: {
  code: string;
  highlights?: { word: string; color: string }[];
  fontSize?: number;
  startFrame?: number;
  lineDelay?: number;
}) {
  const frame = useCurrentFrame();
  const lines = code.split("\n");

  return (
    <div style={{
      background: "#1e1e2e",
      borderRadius: 12,
      padding: "24px 32px",
      fontFamily: "'SF Mono', 'Cascadia Code', monospace",
      fontSize,
      lineHeight: 1.6,
      overflow: "hidden",
    }}>
      {lines.map((line, i) => {
        const lineFrame = startFrame + i * lineDelay;
        const opacity = interpolate(frame, [lineFrame, lineFrame + 10], [0, 1], {
          extrapolateLeft: "clamp", extrapolateRight: "clamp",
        });

        let html = line.replace(/&/g, "&amp;").replace(/</g, "&lt;");
        for (const h of highlights) {
          html = html.replaceAll(h.word, `<span style="color:${h.color}">${h.word}</span>`);
        }

        return (
          <div key={i} style={{ opacity, whiteSpace: "pre" }} dangerouslySetInnerHTML={{ __html: html || "&nbsp;" }} />
        );
      })}
    </div>
  );
}

// Usage:
<CodeBlock
  code={`function Foo() {\n  return <div>hello</div>;\n}`}
  highlights={[{ word: "function", color: "#c678dd" }, { word: "return", color: "#c678dd" }]}
  startFrame={10}
/>
```

---

## SVG Animation Recipes

### Spring-scale an SVG (logo entrance)

```tsx
function AnimatedLogo() {
  const frame = useCurrentFrame();
  const scale = useSpring({ from: 0, to: 1, frame, fps: 30, config: { stiffness: 400, damping: 10 } });
  const rotation = interpolate(frame, [0, 30], [180, 0], { extrapolateRight: "clamp" });

  return (
    <svg width={200} height={200} style={{
      transform: `scale(${scale}) rotate(${rotation}deg)`,
      filter: `drop-shadow(0 0 ${20 * scale}px rgba(97, 218, 251, 0.6))`,
    }}>
      {/* SVG content */}
    </svg>
  );
}
```

### Rotating SVG with glow

```tsx
const frame = useCurrentFrame();
const rotation = (frame % 90) * 4; // full rotation every 3s at 30fps
const glowIntensity = interpolate(frame % 60, [0, 30, 60], [10, 25, 10]);

<svg style={{
  transform: `rotate(${rotation}deg)`,
  filter: `drop-shadow(0 0 ${glowIntensity}px cyan)`,
}} />
```

---

## Split-Screen / Comparison Layout

Before/after code comparison — common in tutorial content:

```tsx
function SplitScreen({
  left,
  right,
  dividerLabel = "VS",
}: {
  left: React.ReactNode;
  right: React.ReactNode;
  dividerLabel?: string;
}) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Stagger: left appears first, divider, then right
  const leftOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const rightOpacity = interpolate(frame, [20, 35], [0, 1], { extrapolateRight: "clamp" });
  const dividerOpacity = interpolate(frame, [10, 20], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div style={{ display: "flex", width, height }}>
      <div style={{ flex: 1, opacity: leftOpacity, padding: 40 }}>{left}</div>
      <div style={{
        width: 60, display: "flex", alignItems: "center", justifyContent: "center",
        opacity: dividerOpacity, color: "#888", fontSize: 20, fontWeight: 700,
      }}>
        {dividerLabel}
      </div>
      <div style={{ flex: 1, opacity: rightOpacity, padding: 40 }}>{right}</div>
    </div>
  );
}
```

For vertical video (9:16), stack top/bottom instead of left/right:

```tsx
<div style={{ display: "flex", flexDirection: "column", width, height }}>
  <div style={{ flex: 1 }}>{before}</div>
  <div style={{ height: 4, background: "#333" }} />
  <div style={{ flex: 1 }}>{after}</div>
</div>
```

---

## Gotchas and Tips

1. **`useAudioData` returns `null` initially** — always handle the loading state.

2. **`useKeyframes` clamps at boundaries** — it won't extrapolate beyond the first/last keyframe.

3. **`<Transition>` must have exactly 2 children** — it throws if you pass more or fewer.

4. **Spring simulations are cached** at the module level for identical parameters, so repeated renders are cheap.

5. **`useKeyframes` requires you to pass `frame` explicitly** — it doesn't call `useCurrentFrame()` internally. This gives you flexibility to use any frame value.

6. **`springDuration()` is useful for sizing `<Sequence>` wrappers** to match how long a spring animation takes to settle.


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
