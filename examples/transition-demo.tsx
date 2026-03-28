/**
 * Transition demo example.
 *
 * Three scenes with fade and slide transitions between them.
 * Shows <Transition> component usage from @vibeo/effects.
 */
import React from "react";
import {
  Composition,
  Sequence,
  VibeoRoot,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  easeOut,
} from "@vibeo/core";
import { Transition } from "@vibeo/effects";

/** Scene with a colored background and centered text */
function ColorScene({
  title,
  color,
  subtitle,
}: {
  title: string;
  color: string;
  subtitle: string;
}) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const textOpacity = interpolate(frame, [0, 20], [0, 1], {
    easing: easeOut,
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width,
        height,
        background: color,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <h1
        style={{
          color: "white",
          fontSize: 80,
          fontFamily: "sans-serif",
          margin: 0,
          opacity: textOpacity,
        }}
      >
        {title}
      </h1>
      <p
        style={{
          color: "rgba(255,255,255,0.7)",
          fontSize: 28,
          fontFamily: "sans-serif",
          margin: "16px 0 0",
          opacity: textOpacity,
        }}
      >
        {subtitle}
      </p>
    </div>
  );
}

function SceneA() {
  return (
    <ColorScene
      title="Scene One"
      color="linear-gradient(135deg, #667eea, #764ba2)"
      subtitle="Fade transition coming up..."
    />
  );
}

function SceneB() {
  return (
    <ColorScene
      title="Scene Two"
      color="linear-gradient(135deg, #f093fb, #f5576c)"
      subtitle="Slide transition next..."
    />
  );
}

function SceneC() {
  return (
    <ColorScene
      title="Scene Three"
      color="linear-gradient(135deg, #4facfe, #00f2fe)"
      subtitle="The final scene."
    />
  );
}

const TRANSITION_FRAMES = 20;

/**
 * Main composition:
 * - Scene A (0-79)
 * - Fade transition A→B (65-84)
 * - Scene B (85-164)
 * - Slide transition B→C (150-169)
 * - Scene C (170-239)
 */
function TransitionDemo() {
  return (
    <>
      {/* Scene A plays fully */}
      <Sequence from={0} durationInFrames={85} name="SceneA">
        <SceneA />
      </Sequence>

      {/* Fade transition: A → B */}
      <Sequence from={65} durationInFrames={TRANSITION_FRAMES} name="FadeTransition">
        <Transition type="fade" durationInFrames={TRANSITION_FRAMES}>
          <SceneA />
          <SceneB />
        </Transition>
      </Sequence>

      {/* Scene B plays fully */}
      <Sequence from={85} durationInFrames={85} name="SceneB">
        <SceneB />
      </Sequence>

      {/* Slide transition: B → C */}
      <Sequence from={150} durationInFrames={TRANSITION_FRAMES} name="SlideTransition">
        <Transition type="slide" durationInFrames={TRANSITION_FRAMES} direction="left">
          <SceneB />
          <SceneC />
        </Transition>
      </Sequence>

      {/* Scene C plays to end */}
      <Sequence from={170} durationInFrames={70} name="SceneC">
        <SceneC />
      </Sequence>
    </>
  );
}

/** Register the composition */
export function Root() {
  return (
    <VibeoRoot>
      <Composition
        id="TransitionDemo"
        component={TransitionDemo}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={240}
      />
    </VibeoRoot>
  );
}
