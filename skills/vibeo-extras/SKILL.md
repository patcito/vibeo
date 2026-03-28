# Vibeo Extras (`@vibeo/extras`)

## Overview

`@vibeo/extras` provides higher-level components for subtitles, audio visualization, scene graph management, and declarative audio mixing. These build on `@vibeo/core`, `@vibeo/audio`, and `@vibeo/effects`.

**When to use**: When your composition needs subtitles, audio waveforms/spectrograms, layered scene graphs, or multi-track audio mixing.

---

## API Reference

### Subtitle System

#### `Subtitle`

Renders subtitle text overlaid on the video, synced to the timeline.

```tsx
import { Subtitle } from "@vibeo/extras";

<Subtitle
  src={`1
00:00:00,000 --> 00:00:03,000
Hello world!

2
00:00:04,000 --> 00:00:07,000
Welcome to Vibeo.`}
  format="srt"
  position="bottom"
  fontSize={32}
  color="white"
  outlineColor="black"
  outlineWidth={2}
/>
```

**`SubtitleProps`**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | — | URL to subtitle file, or inline subtitle string |
| `format?` | `SubtitleFormat` | `"auto"` | `"srt" \| "vtt" \| "auto"` |
| `style?` | `CSSProperties` | — | Additional CSS styles |
| `position?` | `"top" \| "bottom" \| "center"` | — | Vertical position |
| `fontSize?` | `number` | — | Font size in pixels |
| `color?` | `string` | — | Text color |
| `outlineColor?` | `string` | — | Text outline/stroke color |
| `outlineWidth?` | `number` | — | Outline stroke width |

#### `parseSRT(content: string): SubtitleCue[]`

Parse an SRT string into an array of cues.

#### `parseVTT(content: string): SubtitleCue[]`

Parse a WebVTT string into an array of cues.

#### `useSubtitle(cues, fps): UseSubtitleResult`

Hook that returns the active cue for the current frame.

**`SubtitleCue`**:
| Field | Type | Description |
|-------|------|-------------|
| `startTime` | `number` | Start time in seconds |
| `endTime` | `number` | End time in seconds |
| `text` | `string` | Cue text (may contain `<b>`, `<i>`, `<u>`) |

### Audio Visualization

#### `AudioWaveform`

Renders an audio waveform visualization synced to the current playback position.

```tsx
import { AudioWaveform } from "@vibeo/extras";

<AudioWaveform
  src="/music.mp3"
  width={800}
  height={200}
  color="cyan"
  backgroundColor="black"
  windowSize={60}
  barStyle="bars"
/>
```

**`AudioWaveformProps`**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | — | Audio source URL |
| `width` | `number` | — | Width in pixels |
| `height` | `number` | — | Height in pixels |
| `color?` | `string` | — | Waveform color |
| `backgroundColor?` | `string` | — | Background color |
| `windowSize?` | `number` | — | Frames visible in the waveform window |
| `barStyle?` | `BarStyle` | — | `"bars" \| "line" \| "mirror"` |

#### `AudioSpectrogram`

Renders a scrolling frequency spectrogram.

```tsx
import { AudioSpectrogram } from "@vibeo/extras";

<AudioSpectrogram
  src="/music.mp3"
  width={800}
  height={300}
  colorMap="viridis"
  fftSize={2048}
/>
```

**`AudioSpectrogramProps`**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | — | Audio source URL |
| `width` | `number` | — | Width in pixels |
| `height` | `number` | — | Height in pixels |
| `colorMap?` | `ColorMapName` | — | `"viridis" \| "magma" \| "inferno" \| "grayscale"` |
| `fftSize?` | `number` | — | FFT window size |

### Scene Graph

#### `SceneGraph` & `Layer`

Provides z-index management and named layer access for complex compositions.

```tsx
import { SceneGraph, Layer } from "@vibeo/extras";

<SceneGraph>
  <Layer name="background" zIndex={0}>
    <Background />
  </Layer>
  <Layer name="characters" zIndex={10} opacity={0.9}>
    <Characters />
  </Layer>
  <Layer name="ui" zIndex={100}>
    <UIOverlay />
  </Layer>
</SceneGraph>
```

**`LayerProps`**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | — | Unique layer identifier |
| `zIndex?` | `number` | — | Z-order for stacking |
| `visible?` | `boolean` | `true` | Whether the layer renders |
| `opacity?` | `number` | `1` | Layer opacity (0-1) |
| `transform?` | `string` | — | CSS transform string |

#### `useLayer(name): LayerState`

Hook to read the state of a named layer from within the scene graph.

#### `SceneGraphContext`

React context providing `{ layers, setLayerState, getLayerState }`.

### Audio Mixing

#### `AudioMix` & `Track`

Declarative multi-track audio mixing with per-frame volume, ducking, and crossfade support.

```tsx
import { AudioMix, Track } from "@vibeo/extras";

<AudioMix>
  <Track src="/voice.mp3" volume={1} />
  <Track
    src="/music.mp3"
    volume={(frame) => (frame < 30 ? 1 : 0.3)}
    duckWhen="voice"
    duckAmount={0.3}
  />
</AudioMix>
```

**`TrackProps`**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | — | Audio source URL |
| `volume?` | `VolumeInput` | — | `number \| (frame: number) => number` |
| `pan?` | `number` | — | Stereo panning (-1 to 1) |
| `startAt?` | `number` | — | Frame to start playback |
| `duckWhen?` | `string` | — | Track name to duck against |
| `duckAmount?` | `number` | — | Volume reduction when ducking (0-1) |

#### `crossfadeVolume(frame, startFrame, durationInFrames): number`

Utility for computing a crossfade-in volume curve. Returns 0→1 over `durationInFrames` frames starting at `startFrame`, clamped to [0, 1].

```ts
import { crossfadeVolume } from "@vibeo/extras";

const vol = crossfadeVolume(frame, 0, 30);
// 0→1 over frames 0-30, then holds at 1
```

To fade out, invert: `1 - crossfadeVolume(frame, fadeOutStart, fadeDuration)`.

### Types

```ts
import type {
  SubtitleCue,
  SubtitleFormat,
  SubtitleProps,
  BarStyle,
  AudioWaveformProps,
  ColorMapName,
  AudioSpectrogramProps,
  LayerState,
  LayerProps,
  SceneGraphProps,
  SceneGraphContextValue,
  VolumeInput,
  TrackProps,
  AudioMixProps,
  UseSubtitleResult,
} from "@vibeo/extras";
```

---

## Subtitle Format Guide

### SRT Format

```
1
00:00:00,000 --> 00:00:03,000
Hello world!

2
00:00:04,000 --> 00:00:07,000
Welcome to <b>Vibeo</b>.
```

- Numbered entries separated by blank lines
- Timestamps: `HH:MM:SS,mmm --> HH:MM:SS,mmm` (comma for milliseconds)
- Basic HTML tags: `<b>`, `<i>`, `<u>`

### VTT (WebVTT) Format

```
WEBVTT

00:00:00.000 --> 00:00:03.000
Hello world!

00:00:04.000 --> 00:00:07.000
Welcome to <b>Vibeo</b>.
```

- Starts with `WEBVTT` header
- No cue numbers required
- Timestamps: `HH:MM:SS.mmm --> HH:MM:SS.mmm` (period for milliseconds)

### Auto-detection

When `format="auto"`, the parser checks:
1. If content starts with `WEBVTT` → VTT
2. Otherwise → SRT

---

## Audio Visualization Patterns

### Waveform with custom window

```tsx
// Show 2 seconds of waveform at 30fps
<AudioWaveform src="/audio.mp3" width={600} height={100} windowSize={60} barStyle="mirror" />
```

### Spectrogram for music analysis

```tsx
<AudioSpectrogram src="/song.mp3" width={800} height={400} colorMap="magma" fftSize={4096} />
```

Higher `fftSize` = better frequency resolution but less time precision.

---

## Scene Graph Usage for Complex Compositions

```tsx
function ComplexScene() {
  const frame = useCurrentFrame();

  return (
    <SceneGraph>
      <Layer name="sky" zIndex={0}>
        <div style={{ background: "linear-gradient(#1a1a2e, #16213e)", width: "100%", height: "100%" }} />
      </Layer>
      <Layer name="mountains" zIndex={10} opacity={interpolate(frame, [0, 30], [0, 1])}>
        <Mountains />
      </Layer>
      <Layer name="foreground" zIndex={20}>
        <Characters />
      </Layer>
      <Layer name="hud" zIndex={100} visible={frame > 60}>
        <HUD />
      </Layer>
    </SceneGraph>
  );
}
```

Layers provide:
- **Z-ordering**: Higher `zIndex` renders on top
- **Visibility culling**: `visible={false}` prevents rendering
- **Opacity control**: Per-layer opacity
- **Named access**: `useLayer("hud")` reads layer state from children

---

## Audio Mixing Recipes

### Music ducking under voice

```tsx
<AudioMix>
  <Track src="/narration.mp3" volume={1} />
  <Track
    src="/bg-music.mp3"
    volume={0.8}
    duckWhen="narration"
    duckAmount={0.7}
  />
</AudioMix>
```

When the narration track has audio, music volume is reduced by 70%.

### Crossfade between two songs

```tsx
<AudioMix>
  <Track
    src="/song1.mp3"
    volume={(frame) => 1 - crossfadeVolume(frame, 240, 60)}
    // Holds at 1, then fades 1→0 over frames 240-300
  />
  <Track
    src="/song2.mp3"
    volume={(frame) => crossfadeVolume(frame, 0, 60)}
    // Fades 0→1 over first 60 frames of this track
    startAt={240}
  />
</AudioMix>
```

### Volume fade in/out

```tsx
<Track
  src="/music.mp3"
  volume={(frame) => {
    if (frame < 30) return frame / 30;      // fade in
    if (frame > 270) return (300 - frame) / 30; // fade out
    return 1;
  }}
/>
```

---

## Gotchas and Tips

1. **`Subtitle` `src` can be inline content or a URL** — if it looks like a URL, it will be fetched; otherwise, parsed directly.

2. **SRT uses commas for milliseconds** (`00:00:01,500`), while VTT uses periods (`00:00:01.500`). Mixing them up causes parse errors.

3. **`AudioWaveform` and `AudioSpectrogram` require audio data to load** — they may render empty on the first frame.

4. **Scene graph `Layer` names must be unique** within a `SceneGraph`.

5. **`duckWhen` references another `Track`'s `src`** — it auto-reduces volume when the named source has active audio.

6. **`crossfadeVolume` is a pure function** — it can be used outside of `<AudioMix>` for any volume curve calculation.


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
