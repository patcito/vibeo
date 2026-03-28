# Vibeo Editor (`@vibeo/editor`)

## Overview

`@vibeo/editor` is a visual video editing studio for Vibeo. It provides a dark-themed, multi-track timeline editor with canvas preview, property editing, drag-and-drop clip manipulation, audio waveforms, subtitle editing, and export controls.

**When to use**: When you need a visual editing interface for Vibeo compositions, or when building a custom video editor UI on top of Vibeo.

---

## Quick Start

### CLI (recommended)

```bash
# Open the editor for a Vibeo project
bunx @vibeo/cli editor --entry src/index.tsx

# With custom port
bunx @vibeo/cli editor --entry src/index.tsx --port 8080
```

In a scaffolded project (`bunx @vibeo/cli create my-video`), just run:

```bash
bun run editor
```

### Programmatic

```tsx
import { Editor } from "@vibeo/editor";

const compositions = [
  {
    id: "MyComp",
    name: "My Composition",
    component: MyVideoComponent,
    width: 1920,
    height: 1080,
    fps: 30,
    durationInFrames: 300,
  },
];

function App() {
  return <Editor compositions={compositions} />;
}
```

---

## API Reference

### `Editor`

The root editor component. Renders the full editor UI.

```tsx
<Editor compositions={compositions} />
```

**Props:**
- `compositions` — Array of composition entries:
  - `id: string` — unique composition identifier
  - `name: string` — display name
  - `component: React.ComponentType` — the React component to render
  - `width: number` — composition width in pixels
  - `height: number` — composition height in pixels
  - `fps: number` — frames per second
  - `durationInFrames: number` — total duration in frames

### `EditorProvider`

Context provider wrapping the editor state. Use if you need to embed editor components individually.

```tsx
import { EditorProvider } from "@vibeo/editor";

<EditorProvider>
  {/* editor components */}
</EditorProvider>
```

---

## Editor Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Toolbar: [⟲ Undo] [⟳ Redo]     CompositionName       100% │
├──────────┬─────────────────────────────────┬────────────────┤
│ SCENES   │                                 │ PROPERTIES     │
│ & TRACKS │      Canvas Preview             │ Canvas: W × H  │
│          │  (live composition with         │ Duration: N     │
│ 🎬 Scene1│   checkerboard background)      │ FPS: 30        │
│ 🎵 Audio │                                 │                │
│ 📝 Subs  │                                 │ EXPORT         │
│          │                                 │ Codec: H.264   │
│ [+Add]   ├──── |◀ ▶ ▶| 00:00 / 03:33 1x ──│ [Render video] │
├──────────┴─────────────────────────────────┴────────────────┤
│ Timeline: ruler with time markers               [- zoom +] │
│ Track 1: [████ Scene A ████][████ Scene B ████]             │
│ Track 2:      [████████ Audio Track ████████]               │
│ Track 3: [Sub1]  [Sub2]     [Sub3]                          │
│ ▲ playhead cursor (draggable)                               │
└─────────────────────────────────────────────────────────────┘
```

### Panels

| Panel | Location | Purpose |
|-------|----------|---------|
| Toolbar | Top | Undo/redo, composition name, zoom % |
| Scene List | Left sidebar | Track list with visibility/mute toggles, "+ Add Track" |
| Canvas | Center top | Live preview of active composition |
| Playback Controls | Center middle | Play/pause, frame step, timecode, rate, loop |
| Timeline | Center bottom | Multi-track clip editor with ruler and playhead |
| Properties | Right sidebar | Editable props for selected clip, composition info, export |

All panels are resizable via drag handles between them.

---

## State Management

The editor uses `useReducer` with an immutable state model and undo/redo history.

### EditorState

```ts
interface EditorState {
  tracks: Track[];
  selectedTrackId: string | null;
  selectedClipId: string | null;
  playing: boolean;
  frame: number;
  fps: number;
  durationInFrames: number;
  compositionWidth: number;
  compositionHeight: number;
  playbackRate: number;
  zoom: number;
  scrollX: number;
}
```

### Track & Clip Types

```ts
type TrackType = "scene" | "audio" | "subtitle";

interface Track {
  id: string;
  name: string;
  type: TrackType;
  clips: Clip[];
  visible: boolean;
  muted: boolean;
}

interface Clip {
  id: string;
  trackId: string;
  name: string;
  from: number;          // start frame
  durationInFrames: number;
  type: TrackType;
  data: any;             // type-specific data
}
```

### Actions

| Action | Description |
|--------|-------------|
| `ADD_TRACK` | Add a new track (scene/audio/subtitle) |
| `REMOVE_TRACK` | Remove a track and all its clips |
| `ADD_CLIP` | Add a clip to a track |
| `REMOVE_CLIP` | Remove a clip |
| `MOVE_CLIP` | Change a clip's `from` position |
| `RESIZE_CLIP` | Change a clip's `from` and/or `durationInFrames` |
| `SELECT_CLIP` | Select a clip (highlights in timeline, shows in properties) |
| `SET_FRAME` | Set the current playhead frame |
| `SET_PLAYING` | Toggle playback |
| `SET_ZOOM` | Set timeline zoom level |
| `UNDO` | Undo last action |
| `REDO` | Redo undone action |

---

## Timeline

### Clip Colors

| Type | Color | Hex |
|------|-------|-----|
| Scene | Purple | `#8b5cf6` |
| Audio | Green | `#22c55e` |
| Subtitle | Yellow | `#eab308` |

### Timeline Math

```
pixelsPerFrame = basePixelsPerFrame * zoom    (base = 2)
clipLeft = clip.from * pixelsPerFrame
clipWidth = clip.durationInFrames * pixelsPerFrame
cursorLeft = currentFrame * pixelsPerFrame
totalWidth = durationInFrames * pixelsPerFrame
```

### Drag-and-Drop

- **Move clip**: drag the clip body to change its `from` position
- **Resize clip**: drag left/right edges to trim `from`/`durationInFrames`
- **Minimum**: 1 frame
- **Snap**: rounds to nearest integer frame

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Space | Play / Pause |
| ArrowLeft | Previous frame |
| ArrowRight | Next frame |
| Shift+ArrowLeft | -10 frames |
| Shift+ArrowRight | +10 frames |
| Cmd/Ctrl+Z | Undo |
| Cmd/Ctrl+Shift+Z | Redo |
| Delete / Backspace | Remove selected clip |
| Escape | Deselect |
| ? | Show keyboard shortcuts |

---

## Dark Theme

All colors are defined in `@vibeo/editor/theme/colors`:

| Token | Value | Usage |
|-------|-------|-------|
| `bg` | `#0d1117` | Darkest background |
| `surface` | `#161b22` | Panel backgrounds |
| `surfaceHover` | `#1c2333` | Hover states |
| `border` | `#30363d` | Borders |
| `text` | `#e6edf3` | Primary text |
| `textMuted` | `#7d8590` | Secondary text |
| `accent` | `#58a6ff` | Playhead, selection, focus rings |
| `scene` | `#8b5cf6` | Scene clip color |
| `audio` | `#22c55e` | Audio clip color |
| `subtitle` | `#eab308` | Subtitle clip color |
| `danger` | `#f85149` | Delete, errors |

---

## Common Patterns

### Adding a scene track with a clip

```ts
dispatch({ type: "ADD_TRACK", payload: { id: "track-1", name: "Main Scene", type: "scene" } });
dispatch({
  type: "ADD_CLIP",
  payload: {
    id: "clip-1",
    trackId: "track-1",
    name: "Intro",
    from: 0,
    durationInFrames: 90,
    type: "scene",
    data: { component: IntroScene },
  },
});
```

### Adding an audio track

```ts
dispatch({ type: "ADD_TRACK", payload: { id: "track-2", name: "Background Music", type: "audio" } });
dispatch({
  type: "ADD_CLIP",
  payload: {
    id: "clip-2",
    trackId: "track-2",
    name: "Music",
    from: 0,
    durationInFrames: 300,
    type: "audio",
    data: { src: "/music.mp3", volume: 0.8 },
  },
});
```

### Adding subtitle cues

```ts
dispatch({ type: "ADD_TRACK", payload: { id: "track-3", name: "Subtitles", type: "subtitle" } });
dispatch({
  type: "ADD_CLIP",
  payload: {
    id: "sub-1",
    trackId: "track-3",
    name: "Welcome",
    from: 15,
    durationInFrames: 75,
    type: "subtitle",
    data: { text: "Welcome to the demo", fontSize: 36, color: "white", position: "bottom" },
  },
});
```

---

## Gotchas

1. **Editor creates its own providers** — it wraps content in `VibeoRoot`, `TimelineProvider`, etc. Don't nest it inside another `VibeoRoot` manually.

2. **Compositions must export a `Root` function** — the CLI editor command imports `{ Root }` from your entry file to register compositions.

3. **The editor renders the Player internally** — it uses `@vibeo/player` to show the canvas preview. Frame sync is handled automatically.

4. **Undo/redo is state-level** — every dispatched action pushes to the history stack. `UNDO`/`REDO` actions navigate the stack.

5. **Timeline zoom range** — 0.1x to 10x. Default is 1x where `pixelsPerFrame = 2`.

6. **Audio waveform** — rendered as canvas bars inside audio clips. If audio analysis isn't available, shows flat placeholder bars.

7. **Subtitle inline editing** — double-click a subtitle cue in the timeline to edit text inline. Press Escape or click outside to save.

---

## LLM & Agent Integration

```bash
# Get CLI docs including editor command
bunx @vibeo/cli --llms

# Get editor command schema
bunx @vibeo/cli editor --schema

# Install skills for all LLM tools
bunx @vibeo/cli install-skills

# Run as MCP server (includes editor command)
bunx @vibeo/cli --mcp
```
