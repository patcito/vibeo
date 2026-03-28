# Vibeo Audio (`@vibeo/audio`)

## Overview

`@vibeo/audio` provides frame-accurate audio synchronization, audio mixing, volume curves, and the `<Audio>` and `<Video>` media components. It handles the critical math for syncing HTML media elements to Vibeo's frame-based timeline.

**When to use**: Whenever your composition includes audio or video media files.

---

## API Reference

### Components

#### `Audio`
Renders an audio element synced to the Vibeo timeline.

```tsx
<Audio
  src="/music.mp3"
  volume={0.8}
  startFrom={30}
  endAt={150}
  playbackRate={1}
  muted={false}
/>
```

#### `Video`
Renders a video element (visual + audio) synced to the Vibeo timeline.

```tsx
<Video
  src="/clip.mp4"
  volume={(frame) => frame < 30 ? 1 : 0.5}
  startFrom={0}
  endAt={300}
  playbackRate={1.5}
/>
```

**Common props** (`MediaProps`):
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | — | URL or path to the media file |
| `volume?` | `number \| (frame: number) => number` | `1` | Volume (0-1), or a per-frame function |
| `playbackRate?` | `number` | `1` | Playback speed multiplier |
| `startFrom?` | `number` | `0` | Frame in the media to start from |
| `endAt?` | `number` | — | Frame in the media to stop at |
| `muted?` | `boolean` | `false` | Mute audio |
| `loop?` | `boolean` | `false` | Loop the media |

`Video` also has `VideoProps` which extends `MediaProps` with standard HTML video attributes.

### Hooks

#### `useAudioContext(): AudioContext`
Returns the singleton AudioContext (created at 48kHz sample rate).

#### `useMediaSync(options: UseMediaSyncOptions): void`
Low-level hook that syncs an HTML media element's `currentTime` to the current frame. Used internally by `<Audio>` and `<Video>`.

#### `useMediaInTimeline(options: UseMediaInTimelineOptions): MediaTimelineInfo`
Registers a media element in the timeline and returns timing information including whether the media should be active at the current frame.

### Audio Sync Math

```ts
import {
  TARGET_SAMPLE_RATE,   // 48000
  TARGET_CHANNELS,      // 2
  samplesPerFrame,      // (48000 * 2) / fps
  frameToAudioTimestamp, // frame * (1_000_000 / fps) — microseconds
  audioTimeToFrame,     // floor(timeInSeconds * fps)
} from "@vibeo/audio";
```

| Constant/Function | Value/Signature | Description |
|-------------------|-----------------|-------------|
| `TARGET_SAMPLE_RATE` | `48000` | Fixed sample rate for all audio |
| `TARGET_CHANNELS` | `2` | Stereo output |
| `samplesPerFrame(fps)` | `(48000 * 2) / fps` | Samples per video frame |
| `frameToAudioTimestamp(frame, fps)` | `frame * (1_000_000 / fps)` | Frame to microsecond timestamp |
| `audioTimeToFrame(time, fps)` | `floor(time * fps)` | Seconds to frame number |

**Key numbers**:
- At 30fps: `samplesPerFrame = 3200`
- At 60fps: `samplesPerFrame = 1600`

### Audio Context Management

```ts
import { getAudioContext, destroyAudioContext } from "@vibeo/audio";
```

| Function | Description |
|----------|-------------|
| `getAudioContext(options?)` | Get or create the singleton AudioContext at 48kHz |
| `destroyAudioContext()` | Close and release the AudioContext |

### Audio Mixer

```ts
import { mixAudio } from "@vibeo/audio";
```

`mixAudio(tracks: Int16Array[]): Int16Array` — Sums multiple audio tracks with clipping protection.

### Volume Utilities

```ts
import { evaluateVolume, buildVolumeArray } from "@vibeo/audio";
```

| Function | Description |
|----------|-------------|
| `evaluateVolume(volume, frame)` | Evaluate a `number \| VolumeFunction` at a given frame |
| `buildVolumeArray(volume, duration, startsAt)` | Build an array of per-frame volume values |

### Types

```ts
import type {
  AudioAsset,      // Registered audio asset in the timeline
  AudioData,       // Decoded audio buffer data
  MediaProps,      // Common props for Audio/Video
  VolumeFunction,  // (frame: number) => number
  VideoProps,      // Video-specific props
  AudioContextOptions,
  UseMediaSyncOptions,
  MediaTimelineInfo,
  UseMediaInTimelineOptions,
} from "@vibeo/audio";
```

---

## Common Patterns

### Adding background music

```tsx
function MyVideo() {
  return (
    <>
      <Audio src="/bg-music.mp3" volume={0.3} />
      <Sequence from={0} durationInFrames={90}>
        <TitleCard />
      </Sequence>
    </>
  );
}
```

### Volume automation (fade in/out)

```tsx
<Audio
  src="/narration.mp3"
  volume={(frame) => {
    if (frame < 15) return frame / 15;         // fade in over 15 frames
    if (frame > 270) return (300 - frame) / 30; // fade out last 30 frames
    return 1;
  }}
/>
```

### Syncing audio to video with playback rate

```tsx
<Video
  src="/interview.mp4"
  playbackRate={1.5}
  volume={1}
  startFrom={0}
/>
```

The media time formula ensures audio and video stay in sync at any playback rate:
```
mediaTime = interpolate(frame, [-1, startFrom, startFrom+1], [-1, startFrom, startFrom+playbackRate]) * msPerFrame / 1000
```

### Trimming media

```tsx
// Play only frames 60-180 of the source video
<Video src="/long-clip.mp4" startFrom={60} endAt={180} />
```

Duration with trim:
```
duration = endAt - startFrom
actualDuration = floor(duration / playbackRate)
```

### Volume function per-frame evaluation

```
volumes = Array(duration).map((_, i) => volumeFunction(i + startsAt) * mediaVolume)
```

---

## Gotchas and Tips

1. **AudioContext must be 48kHz** — the framework forces `sampleRate: 48000` for consistency.

2. **Volume functions receive the sequence-relative frame** (from `useCurrentFrame()`), not the absolute composition frame. Inside a `<Sequence from={60}>`, frame 0 in the volume callback corresponds to composition frame 60.

3. **`startFrom` and `endAt` are in media frames**, not composition frames. They trim the source media.

4. **Audio mixing uses `Int16Array`** with clipping protection — summed samples are clamped to the `[-32768, 32767]` range.

5. **The `<Video>` component** handles both visual rendering and audio sync. You don't need a separate `<Audio>` for a video file's audio track.


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
