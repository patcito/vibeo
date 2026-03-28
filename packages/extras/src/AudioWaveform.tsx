import React, { useRef, useEffect } from "react";
import { useCurrentFrame, useVideoConfig } from "@vibeo/core";
import { useAudioData } from "@vibeo/effects";
import type { AudioWaveformProps } from "./types.js";

/**
 * Renders an audio waveform visualization synchronized to the current frame.
 * Supports bar, line, and mirror display styles.
 *
 * Accumulates per-frame amplitude data from useAudioData and renders
 * a temporal window of `windowSize` frames centered on the current frame.
 */
export function AudioWaveform({
  src,
  width,
  height,
  color = "#00ff88",
  backgroundColor = "transparent",
  windowSize = 10,
  barStyle = "bars",
}: AudioWaveformProps): React.ReactNode {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const amplitudesRef = useRef<number[]>([]);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const audioData = useAudioData(src);

  // Accumulate per-frame amplitude for temporal windowing
  if (audioData) {
    amplitudesRef.current[frame] = audioData.amplitude;
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    if (backgroundColor !== "transparent") {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
    }

    if (!audioData) return;

    const amps = amplitudesRef.current;
    const halfWindow = Math.floor(windowSize / 2);
    const startFrame = Math.max(0, frame - halfWindow);
    const endFrame = frame + halfWindow;
    const totalBars = endFrame - startFrame + 1;

    if (totalBars <= 0) return;

    const barWidth = width / totalBars;
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    if (barStyle === "line") {
      ctx.beginPath();
      for (let i = 0; i < totalBars; i++) {
        const f = startFrame + i;
        const amp = amps[f] ?? 0;
        const barHeight = Math.min(amp * height * 4, height);
        const x = i * barWidth + barWidth / 2;
        const y = height - barHeight;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    } else if (barStyle === "mirror") {
      const midY = height / 2;
      for (let i = 0; i < totalBars; i++) {
        const f = startFrame + i;
        const amp = amps[f] ?? 0;
        const barHeight = Math.min(amp * midY * 4, midY);
        const x = i * barWidth;
        ctx.fillRect(x, midY - barHeight, barWidth - 1, barHeight * 2);
      }
    } else {
      // "bars" (default)
      for (let i = 0; i < totalBars; i++) {
        const f = startFrame + i;
        const amp = amps[f] ?? 0;
        const barHeight = Math.min(amp * height * 4, height);
        const x = i * barWidth;
        ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
      }
    }
  }, [frame, fps, audioData, width, height, color, backgroundColor, windowSize, barStyle]);

  return <canvas ref={canvasRef} width={width} height={height} />;
}
