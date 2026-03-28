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

## Common Patterns

### Creating a basic composition

```tsx
import { Composition, Sequence, useCurrentFrame, interpolate, easeInOut } from "@vibeo/core";

function MyScene() {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1], { easing: easeInOut });
  return <div style={{ opacity }}>Hello Vibeo</div>;
}

// Register in a VibeoRoot
<Composition
  id="MyScene"
  component={MyScene}
  width={1920}
  height={1080}
  fps={30}
  durationInFrames={150}
/>
```

### Using Sequence for scene structure

```tsx
function MyVideo() {
  return (
    <>
      <Sequence from={0} durationInFrames={60}>
        <IntroScene />
      </Sequence>
      <Sequence from={60} durationInFrames={90}>
        <MainScene />
      </Sequence>
      <Sequence from={150} durationInFrames={60}>
        <OutroScene />
      </Sequence>
    </>
  );
}
```

### Nesting Loops inside Sequences

```tsx
<Sequence from={0} durationInFrames={120}>
  <Loop durationInFrames={30} times={4}>
    <BouncingBall />
  </Loop>
</Sequence>
```

### Multi-segment interpolation

```tsx
const frame = useCurrentFrame();
// Move right, then back, then down
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
