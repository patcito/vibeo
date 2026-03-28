/**
 * Basic Vibeo composition example.
 *
 * A composition with text that fades in using interpolate,
 * and a Sequence with two scenes.
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

/** Scene 1: Title card that fades and slides in */
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
        width,
        height,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
      }}
    >
      <h1
        style={{
          color: "white",
          fontSize: 72,
          fontFamily: "sans-serif",
          opacity,
          transform: `translateY(${y}px)`,
        }}
      >
        Hello, Vibeo!
      </h1>
    </div>
  );
}

/** Scene 2: Content card with a counter */
function ContentScene() {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const seconds = (frame / fps).toFixed(1);

  const scale = interpolate(frame, [0, 20], [0.8, 1], {
    easing: easeInOut,
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "#24243e",
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          color: "white",
          fontSize: 48,
          fontFamily: "sans-serif",
          textAlign: "center",
        }}
      >
        <p>Scene 2</p>
        <p style={{ fontSize: 32, opacity: 0.7 }}>{seconds}s elapsed</p>
      </div>
    </div>
  );
}

/** The main composition combining both scenes */
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

/** Register the composition */
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
