import React, { useRef, useEffect, useState } from "react";
import { useCurrentFrame, useVideoConfig } from "@vibeo/core";
import { useAudioData } from "@vibeo/effects";
import type { AudioSpectrogramProps, ColorMapName } from "./types.js";

type RGB = [number, number, number];

function viridisColor(t: number): RGB {
  // Simplified viridis-like gradient
  const r = Math.round(68 + t * (253 - 68));
  const g = Math.round(1 + t * (231 - 1));
  const b = Math.round(84 + (1 - Math.abs(t - 0.5) * 2) * (170 - 84));
  return [r, g, b];
}

function magmaColor(t: number): RGB {
  const r = Math.round(t * 252);
  const g = Math.round(t * t * 155);
  const b = Math.round(80 + t * (136 - 80) + (1 - t) * 80);
  return [r, g, b];
}

function infernoColor(t: number): RGB {
  const r = Math.round(t * 252);
  const g = Math.round(t * t * 210);
  const b = Math.round(30 + (1 - Math.abs(t - 0.3) * 1.4) * 150);
  return [r, g, b];
}

function grayscaleColor(t: number): RGB {
  const v = Math.round(t * 255);
  return [v, v, v];
}

function getColorMapper(name: ColorMapName): (t: number) => RGB {
  switch (name) {
    case "viridis": return viridisColor;
    case "magma": return magmaColor;
    case "inferno": return infernoColor;
    case "grayscale": return grayscaleColor;
  }
}

/**
 * Renders a scrolling spectrogram visualization of audio frequency data.
 * Current frame position is indicated by a vertical line.
 */
export function AudioSpectrogram({
  src,
  width,
  height,
  colorMap = "viridis",
  fftSize,
}: AudioSpectrogramProps): React.ReactNode {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const audioData = useAudioData(src, fftSize ? { fftSize } : undefined);
  const [history, setHistory] = useState<Float32Array[]>([]);

  // Accumulate frequency data over frames
  useEffect(() => {
    if (!audioData) return;
    setHistory((prev) => {
      const next = [...prev];
      // Ensure we have an entry for the current frame
      while (next.length <= frame) {
        next.push(audioData.frequencies);
      }
      next[frame] = audioData.frequencies;
      return next;
    });
  }, [frame, audioData]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);

    if (history.length === 0) return;

    const mapper = getColorMapper(colorMap);
    const visibleColumns = width;
    const startCol = Math.max(0, frame - Math.floor(visibleColumns / 2));

    for (let col = 0; col < visibleColumns; col++) {
      const histIdx = startCol + col;
      if (histIdx >= history.length || !history[histIdx]) continue;

      const freqs = history[histIdx];
      const numBins = freqs.length;
      const rowHeight = height / numBins;

      for (let bin = 0; bin < numBins; bin++) {
        // Convert dB (-100 to 0) to 0-1 range
        const db = freqs[bin];
        const normalized = Math.max(0, Math.min(1, (db + 100) / 100));
        const [r, g, b] = mapper(normalized);

        ctx.fillStyle = `rgb(${r},${g},${b})`;
        // Draw from bottom (low freq) to top (high freq)
        const y = height - (bin + 1) * rowHeight;
        ctx.fillRect(col, y, 1, Math.ceil(rowHeight));
      }
    }

    // Draw current frame indicator
    const indicatorX = Math.min(frame - startCol, visibleColumns - 1);
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(indicatorX, 0);
    ctx.lineTo(indicatorX, height);
    ctx.stroke();
  }, [frame, fps, history, width, height, colorMap]);

  return <canvas ref={canvasRef} width={width} height={height} />;
}
