# Vibeo Core (`@vibeo/core`)

## Overview

`@vibeo/core` is the foundation of the Vibeo video framework. It provides the timing engine, React context providers, hooks for frame-based animation, the interpolation engine, and the core components (`Composition`, `Sequence`, `Loop`) used to structure video timelines.

**When to use**: Any time you are building a Vibeo video project. This package is always required.

---

## API Reference

### Components

#### `Composition<T>`
Registers a video composition with the framework.

```tsx
<Composition
  id="MyVideo"
  component={MyScene}
  width={1920}
  height={1080}
  fps={30}
  durationInFrames={300}
  defaultProps={{ title: "Hello" }}
  calculateMetadata={async (props) => ({ durationInFrames: 600 })}
/>
```

**Props** (`CompositionProps<T>`):
| Prop | Type | Description |
|------|------|-------------|
| `id` | `string` | Unique identifier for the composition |
| `component` | `ComponentType<T>` | The React component to render |
| `width` | `number` | Width in pixels |
| `height` | `number` | Height in pixels |
| `fps` | `number` | Frames per second |
| `durationInFrames` | `number` | Total duration in frames |
| `defaultProps?` | `T` | Default props passed to the component |
| `calculateMetadata?` | `(props: T) => Promise<Partial<VideoConfig>>` | Async function to compute metadata dynamically |

#### `Sequence`
Time-shifts its children on the timeline. Supports arbitrary nesting with cumulative offsets.

```tsx
<Sequence from={30} durationInFrames={60} name="Scene2">
  <MyComponent />
</Sequence>
```

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `from?` | `number` | `0` | Frame offset where this sequence begins |
| `durationInFrames?` | `number` | `Infinity` | How many frames this sequence lasts |
| `name?` | `string` | — | Debug label |
| `layout?` | `"none" \| "absolute-fill"` | `"absolute-fill"` | CSS layout mode |

Inside a Sequence, `useCurrentFrame()` returns the **relative** frame (i.e., frame 0 is when the Sequence starts).

#### `Loop`
Repeats its children for a given duration.

```tsx
<Loop durationInFrames={30} times={4}>
  <PulsingDot />
</Loop>
```

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `durationInFrames` | `number` | — | Duration of one loop iteration |
| `times?` | `number` | `Infinity` | Number of loop iterations |
| `layout?` | `"none" \| "absolute-fill"` | — | CSS layout mode |

#### `VibeoRoot`
Top-level context provider tree. Wrap your composition registration in this.

```tsx
<VibeoRoot>
  <Composition id="MyVideo" ... />
</VibeoRoot>
```

### Hooks

#### `useCurrentFrame(): number`
Returns the current frame number **relative to the nearest parent Sequence**. This is the primary hook for animation.

#### `useVideoConfig(): VideoConfig`
Returns `{ width, height, fps, durationInFrames }` for the current composition.

#### `useTimelinePosition(): number`
Returns the **absolute** frame number (ignores Sequence offsets). Rarely needed directly.

#### `useSequenceContext(): SequenceContextType | null`
Returns the current Sequence context, or `null` if not inside a Sequence.

#### `useLoopContext(): LoopContextType | null`
Returns `{ iteration, durationInFrames }` for the current loop, or `null`.

### Interpolation

#### `interpolate(input, inputRange, outputRange, options?): number`
The core animation primitive. Maps an input value through input/output ranges with easing.

```ts
const opacity = interpolate(frame, [0, 30], [0, 1]);
const x = interpolate(frame, [0, 15, 30], [0, 200, 0], { easing: easeInOut });
```

**Parameters**:
| Param | Type | Description |
|-------|------|-------------|
| `input` | `number` | The current value (usually the frame) |
| `inputRange` | `readonly number[]` | Breakpoints for the input |
| `outputRange` | `readonly number[]` | Corresponding output values |
| `options?` | `InterpolateOptions` | Easing and extrapolation config |

**`InterpolateOptions`**:
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `easing?` | `(t: number) => number` | `linear` | Easing function |
| `extrapolateLeft?` | `ExtrapolateType` | `"extend"` | Behavior below input range |
| `extrapolateRight?` | `ExtrapolateType` | `"extend"` | Behavior above input range |

**`ExtrapolateType`**: `"clamp" | "extend" | "identity"`

### Easing Functions

```ts
import { linear, easeIn, easeOut, easeInOut, bezier, steps } from "@vibeo/core";
```

| Function | Description |
|----------|-------------|
| `linear(t)` | No easing, linear progression |
| `easeIn(t)` | Cubic ease-in (t^3) |
| `easeOut(t)` | Cubic ease-out |
| `easeInOut(t)` | Cubic ease-in-out |
| `bezier(x1, y1, x2, y2)` | Returns a custom cubic bezier easing function |
| `steps(n)` | Returns a step function with `n` discrete steps |

### Timing Utilities

```ts
import { msPerFrame, frameToTime, timeToFrame, getMediaTime } from "@vibeo/core";
```

| Function | Signature | Description |
|----------|-----------|-------------|
| `msPerFrame` | `(fps) => number` | Milliseconds per frame: `1000 / fps` |
| `frameToTime` | `(frame, fps) => number` | Frame to seconds: `frame * msPerFrame(fps) / 1000` |
| `timeToFrame` | `(time, fps) => number` | Seconds to frame: `floor(time * fps)` |
| `getMediaTime` | `(frame, fps, playbackRate, startFrom) => number` | Compute media time accounting for playback rate |

### Other Utilities

#### `calculateMediaDuration(options): number`
Computes the actual duration of media in frames, accounting for trim and playback rate.

#### `validateVideoConfig(config): void`
Validates a `VideoConfig` object, throwing on invalid values.

### Types

```ts
import type {
  VideoConfig,
  CompositionProps,
  SequenceContextType,
  LoopContextType,
  ExtrapolateType,
  InterpolateOptions,
} from "@vibeo/core";
```

### Context Providers (advanced)

- `TimelineProvider` / `TimelineContext` / `useTimelineContext` — manages the global frame state
- `CompositionProvider` / `CompositionContext` / `useCompositionContext` — manages composition registration
- `SequenceContext` / `useSequenceContext` — tracks cumulative Sequence offsets
- `LoopContext` / `useLoopContext` — tracks loop iteration state

---

## Key Timing Math

### Frame <-> Time
```
msPerFrame = 1000 / fps
timeInSeconds = frame * msPerFrame / 1000
frameFromTime = floor(timeInSeconds * fps)
```

### Media Time with Playback Rate
```
mediaTime(frame, fps, playbackRate, startFrom) =
  interpolate(frame, [-1, startFrom, startFrom+1], [-1, startFrom, startFrom+playbackRate]) * (1000/fps) / 1000
```

### Sequence Relative Frame
```
relativeFrame = absoluteFrame - (cumulatedFrom + relativeFrom)
```

### Loop Iteration
```
iteration = floor(currentFrame / durationInFrames)
loopFrame = currentFrame % durationInFrames
```

### Interpolation Engine
```
1. Find segment: which adjacent pair in inputRange brackets input
2. Normalize: t = (input - inputRange[i]) / (inputRange[i+1] - inputRange[i])
3. Ease: t = easing(t)
4. Scale: output = t * (outputRange[i+1] - outputRange[i]) + outputRange[i]
5. Extrapolate: clamp | extend | identity beyond range ends
```

### Media Duration with Trim & Playback Rate
```
duration = trimAfter ?? totalDurationInFrames
duration -= trimBefore ?? 0
actualDuration = floor(duration / playbackRate)
```

---

## Platform Format Presets

Use these when the user mentions a platform. **Any time the user says "Short", "Reel", "TikTok", or "vertical" — use 1080x1920 (9:16), not landscape.**

| Format | Width | Height | FPS | Max Duration | Aliases |
|--------|-------|--------|-----|-------------|---------|
| **YouTube** | 1920 | 1080 | 30 | — | landscape, standard |
| **YouTube 4K** | 3840 | 2160 | 30-60 | — | 4K |
| **YouTube Short** | 1080 | 1920 | 30-60 | 3 min | vertical |
| **TikTok** | 1080 | 1920 | 30 | 10 min | |
| **Instagram Reel** | 1080 | 1920 | 30 | 20 min | |
| **Instagram Post** | 1080 | 1080 | 30 | 60s | square |
| **Twitter/X** | 1920 | 1080 | 30 | 2m 20s | 512MB max |
| **Twitter/X Short** | 1080 | 1920 | 30 | 2m 20s | vertical tweet |

### Vertical video (9:16) layout tips

- **Code blocks**: max ~900px wide, font size 24-28 (larger than landscape)
- **No side-by-side**: use top/bottom stacks, not left/right splits
- **Text**: minimum 36px body, 64px+ titles
- **Safe zones**: avoid top 100px (status bar) and bottom 150px (nav gestures)
- **Single focus**: one idea per screen, no multi-column layouts

---

## Common Patterns

### Multi-file project structure (use for 3+ scenes)

```
src/
├── index.tsx              # Root + Composition registration
├── Video.tsx              # Scene orchestrator (Sequences)
├── scenes/
│   ├── Intro.tsx
│   ├── Problem.tsx
│   ├── Solution.tsx
│   └── Outro.tsx
└── components/
    ├── CodeBlock.tsx
    └── AnimatedCard.tsx
```

### Centralized scene timing (best practice)

Define all timing in one place — never hardcode frame numbers in `<Sequence>`:

```tsx
const SCENES = {
  intro:    { from: 0,    duration: 120  },
  problem:  { from: 120,  duration: 300  },
  solution: { from: 420,  duration: 450  },
  outro:    { from: 870,  duration: 90   },
} as const;

const TOTAL = SCENES.outro.from + SCENES.outro.duration;

function MyVideo() {
  return (
    <>
      <Sequence from={SCENES.intro.from} durationInFrames={SCENES.intro.duration}>
        <IntroScene />
      </Sequence>
      <Sequence from={SCENES.problem.from} durationInFrames={SCENES.problem.duration}>
        <ProblemScene />
      </Sequence>
      {/* ... */}
    </>
  );
}
```

### Looping/pulsing animation

Use `frame % N` for repeating effects (pulse, glow, rotate):

```tsx
const frame = useCurrentFrame();
const pulse = interpolate(frame % 60, [0, 30, 60], [0.3, 0.6, 0.3]);
const rotation = (frame % 90) * 4; // 360° every 3 seconds
```

### Staggered list/card animation

Animate N items with increasing delay:

```tsx
const frame = useCurrentFrame();
const items = ["Feature 1", "Feature 2", "Feature 3"];

{items.map((item, i) => {
  const delay = 10 + i * 8;
  const opacity = interpolate(frame, [delay, delay + 20], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const y = interpolate(frame, [delay, delay + 20], [30, 0], {
    easing: easeOut, extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  return <div key={i} style={{ opacity, transform: `translateY(${y}px)` }}>{item}</div>;
})}
```

### Overlapping Sequences for manual transitions

Alternative to `<Transition>` when you need custom per-scene blend control:

```tsx
<Sequence from={0} durationInFrames={90}>
  <SceneA />  {/* fade out in last 15 frames */}
</Sequence>
<Sequence from={75} durationInFrames={90}>
  <SceneB />  {/* fade in during first 15 frames */}
</Sequence>
```

### Multi-segment interpolation

```tsx
const x = interpolate(frame, [0, 30, 60, 90], [0, 200, 0, 0]);
const y = interpolate(frame, [0, 30, 60, 90], [0, 0, 0, 200]);
```

---

## Gotchas and Tips

1. **`useCurrentFrame()` is always relative to the nearest `<Sequence>`**. If you need the absolute frame, use `useTimelinePosition()`.

2. **`interpolate()` requires at least 2 input range values** and input/output ranges must have the same length.

3. **Extrapolation defaults to `"extend"`** (continues the slope beyond the range). Use `{ extrapolateLeft: "clamp", extrapolateRight: "clamp" }` to clamp values at range boundaries.

4. **`Sequence` children are only rendered when the absolute frame is within `[from, from + durationInFrames)`**. Outside that range, `Sequence` returns `null`.

5. **Loop iterations**: Inside a `<Loop>`, `useCurrentFrame()` resets to 0 each iteration. Use `useLoopContext()` to get the current `iteration` number.

6. **`calculateMetadata` is async** — use it for compositions whose duration depends on fetched data (e.g., audio file length).

7. **All timing is frame-based, not time-based**. Convert with `frameToTime(frame, fps)` when needed.


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

1. **Create a project**: `bunx @vibeo/cli create my-video --template basic`
2. **Install deps**: `cd my-video && bun install`
3. **Install Playwright** (required for render/list): `bunx playwright install chromium`
4. **Edit `src/index.tsx`**: Write React components using `@vibeo/core` hooks and components
5. **Preview**: `bunx @vibeo/cli preview --entry src/index.tsx`
6. **Render**: `bunx @vibeo/cli render --entry src/index.tsx --composition MyComp`

Step 3 is mandatory — `vibeo render` and `vibeo list` will fail without Playwright browsers installed.

All commands accept `--format json` for structured output that LLMs can parse reliably.
