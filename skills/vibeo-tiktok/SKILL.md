# Vibeo TikTok / Short-Form Video Generator

Generate TikTok, YouTube Shorts, Instagram Reels, and other vertical (9:16) videos using Vibeo.

**Trigger**: user says "TikTok", "Short", "Reel", "vertical video", "short-form", or asks for content for social media platforms.

---

## Format: ALWAYS 1080x1920 (9:16)

```tsx
<Composition
  id="MyTikTok"
  component={TikTokVideo}
  width={1080}
  height={1920}
  fps={30}
  durationInFrames={450} // 15 seconds
/>
```

### Duration Guidelines

| Platform | Sweet Spot | Max | Frames @ 30fps |
|----------|-----------|-----|-----------------|
| **TikTok** | 15-60s | 10 min | 450-1800 |
| **YouTube Short** | 30-60s | 3 min | 900-1800 |
| **Instagram Reel** | 15-30s | 20 min | 450-900 |
| **Twitter/X** | 15-45s | 2m20s | 450-1350 |

---

## Vertical Layout Rules

### DO

```tsx
// Stack vertically — top to bottom flow
<div style={{
  width: 1080, height: 1920,
  display: "flex", flexDirection: "column",
  justifyContent: "center", alignItems: "center",
  padding: "100px 60px 150px", // safe zones: top status bar + bottom nav
}}>
  <h1 style={{ fontSize: 72, textAlign: "center" }}>Title</h1>
  <div style={{ marginTop: 40 }}>
    {/* Content */}
  </div>
</div>
```

### DON'T

- No side-by-side layouts (too narrow at 1080px)
- No font size < 36px (unreadable on phones)
- No content in top 100px (status bar) or bottom 150px (nav gestures)
- No multi-column grids
- No landscape aspect ratios embedded inside

---

## Complete TikTok Template

Hook → Content → CTA pattern (the standard viral format):

```tsx
import React from "react";
import {
  Composition, Sequence, VibeoRoot,
  useCurrentFrame, useVideoConfig, interpolate, easeOut, easeInOut,
} from "@vibeo/core";

// ---- Scene Timing (centralized) ----
const SCENES = {
  hook:    { from: 0,    duration: 90  },  // 3s — attention grabber
  content: { from: 90,   duration: 270 },  // 9s — main content
  cta:     { from: 360,  duration: 90  },  // 3s — call to action
} as const;
const TOTAL = 450; // 15s

// ---- Hook Scene (first 3 seconds = make or break) ----
function HookScene({ text }: { text: string }) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const scale = interpolate(frame, [0, 15], [0.5, 1], {
    easing: easeOut, extrapolateRight: "clamp",
  });
  const opacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });

  // Pulsing glow effect
  const glow = interpolate(frame % 30, [0, 15, 30], [0, 15, 0]);

  return (
    <div style={{
      width, height, display: "flex", justifyContent: "center", alignItems: "center",
      background: "linear-gradient(180deg, #0a0a0a, #1a0a2e)",
      padding: "100px 60px 150px",
    }}>
      <h1 style={{
        fontSize: 80, fontWeight: 900, color: "white",
        textAlign: "center", lineHeight: 1.2,
        opacity, transform: `scale(${scale})`,
        textShadow: `0 0 ${glow}px rgba(138, 92, 246, 0.8)`,
      }}>
        {text}
      </h1>
    </div>
  );
}

// ---- Content Scene (staggered points) ----
function ContentScene({ points }: { points: string[] }) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  return (
    <div style={{
      width, height, display: "flex", flexDirection: "column",
      justifyContent: "center", padding: "100px 60px 150px",
      background: "#0a0a0a", gap: 24,
    }}>
      {points.map((point, i) => {
        const delay = 15 + i * 20;
        const opacity = interpolate(frame, [delay, delay + 15], [0, 1], {
          extrapolateLeft: "clamp", extrapolateRight: "clamp",
        });
        const x = interpolate(frame, [delay, delay + 15], [-40, 0], {
          easing: easeOut, extrapolateLeft: "clamp", extrapolateRight: "clamp",
        });

        return (
          <div key={i} style={{
            opacity, transform: `translateX(${x}px)`,
            display: "flex", alignItems: "center", gap: 16,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24, fontWeight: 700, color: "white",
            }}>
              {i + 1}
            </div>
            <span style={{ fontSize: 40, color: "white", fontWeight: 600 }}>
              {point}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ---- CTA Scene ----
function CTAScene({ text, subtext }: { text: string; subtext: string }) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const scale = interpolate(frame, [0, 20], [0.8, 1], {
    easing: easeOut, extrapolateRight: "clamp",
  });
  // Pulsing button effect
  const btnScale = interpolate(frame % 30, [0, 15, 30], [1, 1.05, 1]);

  return (
    <div style={{
      width, height, display: "flex", flexDirection: "column",
      justifyContent: "center", alignItems: "center",
      background: "linear-gradient(180deg, #0a0a0a, #1a0a2e)",
      padding: "100px 60px 150px", transform: `scale(${scale})`,
    }}>
      <h1 style={{ fontSize: 72, fontWeight: 900, color: "white", textAlign: "center" }}>
        {text}
      </h1>
      <div style={{
        marginTop: 40, padding: "20px 60px", borderRadius: 50,
        background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
        fontSize: 36, fontWeight: 700, color: "white",
        transform: `scale(${btnScale})`,
      }}>
        {subtext}
      </div>
    </div>
  );
}

// ---- Main Video ----
function TikTokVideo() {
  return (
    <>
      <Sequence from={SCENES.hook.from} durationInFrames={SCENES.hook.duration}>
        <HookScene text="3 things you didn't know about React" />
      </Sequence>
      <Sequence from={SCENES.content.from} durationInFrames={SCENES.content.duration}>
        <ContentScene points={[
          "Server Components are default",
          "use() replaces useEffect",
          "Actions replace forms",
        ]} />
      </Sequence>
      <Sequence from={SCENES.cta.from} durationInFrames={SCENES.cta.duration}>
        <CTAScene text="Follow for more" subtext="Like & Share →" />
      </Sequence>
    </>
  );
}

// ---- Root ----
export function Root() {
  return (
    <VibeoRoot>
      <Composition
        id="TikTokVideo"
        component={TikTokVideo}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={TOTAL}
      />
    </VibeoRoot>
  );
}
```

---

## TikTok Content Patterns

### 1. "Did You Know" / Listicle (most common)

```
Hook (3s): Bold question or surprising claim
Content (9-20s): 3-5 staggered points with numbers
CTA (3s): Follow / Like / Share
```

### 2. Before/After

```
Hook (2s): "Before vs After"
Before (5s): Show the "bad" version (top half)
After (5s): Reveal the "good" version (bottom half) — use slide transition
CTA (3s): "Try it yourself"
```

For vertical before/after, stack top/bottom:
```tsx
<div style={{ display: "flex", flexDirection: "column", width: 1080, height: 1920 }}>
  <div style={{ flex: 1 }}>{before}</div>
  <div style={{ height: 4, background: "#333" }} />
  <div style={{ flex: 1 }}>{after}</div>
</div>
```

### 3. Code Tutorial

```
Hook (3s): "This one trick..."
Code (10-15s): Animated code block, line by line reveal
Result (5s): Show the output/demo
CTA (3s): "Link in bio"
```

Use the CodeBlock recipe from vibeo-effects skill, but with larger font (28px) for vertical.

### 4. Product/Feature Showcase

```
Hook (3s): Pain point question
Demo (10s): Screen recording or animated mockup
Features (5s): 3 key bullets, staggered
CTA (3s): "Download now"
```

---

## Animation Rules for Short-Form

1. **First 3 seconds are everything** — the hook must grab attention immediately. Use scale-in, glow, or spring entrance.

2. **Constant motion** — never have a static frame for more than 1 second. Add subtle pulse, breathing, or background movement.

3. **Text on screen** — most viewers watch without sound. Every key point should have on-screen text.

4. **Fast transitions** — 10-15 frame transitions (0.3-0.5s). No slow fades.

5. **Pulsing/breathing effects** — use `frame % N` for constant subtle animation:
   ```tsx
   const pulse = interpolate(frame % 60, [0, 30, 60], [1, 1.03, 1]);
   ```

6. **Number badges** — always number your points (1, 2, 3). It signals structure and keeps viewers watching.

7. **Bold gradients** — dark backgrounds with vibrant gradient accents. Avoid flat solid colors.

---

## Rendering for Platforms

```bash
# TikTok / Reels (H.264, most compatible)
bunx @vibeo/cli render --entry src/index.tsx --composition TikTokVideo --codec h264

# High quality (H.265, smaller file)
bunx @vibeo/cli render --entry src/index.tsx --composition TikTokVideo --codec h265

# Twitter/X (needs smaller file, use lower quality)
bunx @vibeo/cli render --entry src/index.tsx --composition TikTokVideo --codec h264 --quality 60
```

### Platform upload limits

| Platform | Max File Size | Recommended Codec |
|----------|--------------|-------------------|
| TikTok | 287 MB | H.264 |
| YouTube Shorts | 256 MB | H.264 |
| Instagram Reels | 650 MB | H.264 |
| Twitter/X | 512 MB | H.264 |
