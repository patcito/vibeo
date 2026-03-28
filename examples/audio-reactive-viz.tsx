/**
 * Audio-reactive visualization example.
 *
 * A composition that visualizes audio using useAudioData.
 * Bars react to bass/mid/treble, and background color shifts with amplitude.
 */
import React from "react";
import {
  Composition,
  VibeoRoot,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "@vibeo/core";
import { Audio } from "@vibeo/audio";
import { useAudioData } from "@vibeo/effects";

const AUDIO_SRC = "/music.mp3";
const BAR_COUNT = 48;

/** Frequency visualizer bars */
function FrequencyBars() {
  const { width, height } = useVideoConfig();
  const audio = useAudioData(AUDIO_SRC, { fftSize: 1024 });

  if (!audio) {
    return <div style={{ width, height }} />;
  }

  const step = Math.floor(audio.frequencies.length / BAR_COUNT);
  const barWidth = (width * 0.8) / BAR_COUNT;
  const maxBarHeight = height * 0.6;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 60,
        left: width * 0.1,
        display: "flex",
        alignItems: "flex-end",
        gap: 2,
      }}
    >
      {Array.from({ length: BAR_COUNT }, (_, i) => {
        const db = audio.frequencies[i * step];
        // Normalize dB (-100 to 0) to 0-1 range
        const normalized = Math.max(0, (db + 100) / 100);
        const barHeight = Math.max(2, normalized * maxBarHeight);

        // Color: bass=blue, mid=purple, treble=pink
        const hue = interpolate(i, [0, BAR_COUNT - 1], [220, 340]);

        return (
          <div
            key={i}
            style={{
              width: barWidth - 2,
              height: barHeight,
              background: `hsl(${hue}, 80%, 60%)`,
              borderRadius: 2,
            }}
          />
        );
      })}
    </div>
  );
}

/** Band energy indicators */
function BandIndicators() {
  const audio = useAudioData(AUDIO_SRC);

  if (!audio) return null;

  const bands = [
    { label: "BASS", value: audio.bass, color: "#4a9eff" },
    { label: "MID", value: audio.mid, color: "#a855f7" },
    { label: "TREBLE", value: audio.treble, color: "#ec4899" },
  ];

  return (
    <div
      style={{
        position: "absolute",
        top: 40,
        right: 40,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {bands.map(({ label, value, color }) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ color: "white", fontSize: 14, fontFamily: "monospace", width: 60 }}>
            {label}
          </span>
          <div style={{ width: 120, height: 8, background: "rgba(255,255,255,0.1)", borderRadius: 4 }}>
            <div
              style={{
                width: `${Math.min(100, value * 500)}%`,
                height: "100%",
                background: color,
                borderRadius: 4,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Main composition with reactive background */
function AudioViz() {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const audio = useAudioData(AUDIO_SRC);

  // Background shifts hue based on amplitude
  const baseHue = 240;
  const hueShift = audio ? audio.amplitude * 60 : 0;
  const lightness = audio ? 8 + audio.amplitude * 12 : 8;
  const hue = baseHue + hueShift;

  const seconds = (frame / fps).toFixed(1);

  return (
    <div
      style={{
        width,
        height,
        background: `radial-gradient(ellipse at center, hsl(${hue}, 40%, ${lightness + 5}%), hsl(${hue}, 30%, ${lightness}%))`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 40,
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <h1 style={{ fontSize: 36, margin: 0, opacity: 0.9 }}>Audio Visualizer</h1>
        <p style={{ fontSize: 18, margin: "8px 0 0", opacity: 0.5 }}>{seconds}s</p>
      </div>

      {/* Amplitude circle */}
      {audio && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) scale(${1 + audio.amplitude * 1.5})`,
            width: 120,
            height: 120,
            borderRadius: "50%",
            border: "2px solid rgba(255,255,255,0.2)",
            opacity: 0.4 + audio.amplitude * 0.6,
          }}
        />
      )}

      <FrequencyBars />
      <BandIndicators />

      {/* Audio element (muted in preview, plays during render) */}
      <Audio src={AUDIO_SRC} volume={0.8} />
    </div>
  );
}

/** Register the composition */
export function Root() {
  return (
    <VibeoRoot>
      <Composition
        id="AudioReactiveViz"
        component={AudioViz}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={900}
      />
    </VibeoRoot>
  );
}
