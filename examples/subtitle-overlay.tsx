/**
 * Subtitle overlay example.
 *
 * A video with subtitle overlay using <Subtitle> from @vibeo/extras.
 * Demonstrates inline SRT subtitle format.
 */
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
import { Video } from "@vibeo/audio";
import { Subtitle } from "@vibeo/extras";

/** Inline SRT subtitles */
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

/** Background scene (used when no video source is available) */
function BackgroundScene() {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Slowly shifting gradient background
  const hue = interpolate(frame, [0, 480], [200, 280]);

  return (
    <div
      style={{
        width,
        height,
        background: `linear-gradient(135deg, hsl(${hue}, 50%, 15%), hsl(${hue + 40}, 40%, 10%))`,
      }}
    />
  );
}

/** Title overlay that fades in and out */
function TitleOverlay() {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();

  const opacity = interpolate(frame, [0, 30, 60, 90], [0, 1, 1, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 60,
        left: 0,
        width,
        textAlign: "center",
        opacity,
      }}
    >
      <h1
        style={{
          color: "white",
          fontSize: 48,
          fontFamily: "sans-serif",
          textShadow: "0 2px 8px rgba(0,0,0,0.5)",
        }}
      >
        Subtitle Demo
      </h1>
    </div>
  );
}

/** Main composition with video and subtitle overlay */
function SubtitleVideo() {
  const { width, height } = useVideoConfig();

  return (
    <div style={{ width, height, position: "relative" }}>
      {/* Background (replace with <Video src="..." /> for real video) */}
      <BackgroundScene />

      {/* Title that fades in first 3 seconds */}
      <Sequence from={0} durationInFrames={90}>
        <TitleOverlay />
      </Sequence>

      {/* Subtitle overlay — runs for the entire duration */}
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

/** Register the composition */
export function Root() {
  return (
    <VibeoRoot>
      <Composition
        id="SubtitleOverlay"
        component={SubtitleVideo}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={480}
      />
    </VibeoRoot>
  );
}
