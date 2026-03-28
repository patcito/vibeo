import { useState, useEffect, useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "@vibeo/core";
import type { AudioAnalysis, AudioDataOptions } from "./types.js";

/** Default FFT size for frequency analysis. */
const DEFAULT_FFT_SIZE = 2048;

/** Sample rate used for offline analysis. */
const ANALYSIS_SAMPLE_RATE = 44100;

interface AnalysisFrame {
  amplitude: number;
  frequencies: Float32Array;
  bass: number;
  mid: number;
  treble: number;
}

/**
 * Compute the average energy in a frequency band.
 * @param frequencies - FFT magnitude data
 * @param sampleRate - The sample rate of the audio
 * @param fftSize - The FFT size used
 * @param lowHz - Lower bound of the band in Hz
 * @param highHz - Upper bound of the band in Hz
 */
function bandEnergy(
  frequencies: Float32Array,
  sampleRate: number,
  fftSize: number,
  lowHz: number,
  highHz: number,
): number {
  const binWidth = sampleRate / fftSize;
  const lowBin = Math.max(0, Math.floor(lowHz / binWidth));
  const highBin = Math.min(frequencies.length - 1, Math.floor(highHz / binWidth));

  if (highBin <= lowBin) return 0;

  let sum = 0;
  for (let i = lowBin; i <= highBin; i++) {
    // Convert from dB to linear, then average
    // AnalyserNode gives values in dB (typically -100 to 0)
    const db = frequencies[i];
    const linear = Math.pow(10, db / 20);
    sum += linear;
  }

  return sum / (highBin - lowBin + 1);
}

/**
 * Pre-analyze an audio file using OfflineAudioContext.
 * Returns per-frame analysis data.
 */
async function analyzeAudio(
  audioSrc: string,
  fps: number,
  fftSize: number,
): Promise<AnalysisFrame[]> {
  // Fetch the audio file
  const response = await fetch(audioSrc);
  const arrayBuffer = await response.arrayBuffer();

  // Decode audio data
  const offlineCtx = new OfflineAudioContext(1, 1, ANALYSIS_SAMPLE_RATE);
  const audioBuffer = await offlineCtx.decodeAudioData(arrayBuffer);

  const channelData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  const samplesPerFrame = Math.floor(sampleRate / fps);
  const totalFrames = Math.ceil(channelData.length / samplesPerFrame);
  const halfFft = fftSize / 2;

  const frames: AnalysisFrame[] = [];

  for (let f = 0; f < totalFrames; f++) {
    const start = f * samplesPerFrame;
    const end = Math.min(start + samplesPerFrame, channelData.length);

    // Compute RMS amplitude for this frame
    let sumSq = 0;
    for (let i = start; i < end; i++) {
      sumSq += channelData[i] * channelData[i];
    }
    const amplitude = Math.sqrt(sumSq / (end - start));

    // Compute FFT for frequency data
    // Take a window of fftSize samples centered on this frame
    const fftStart = Math.max(0, start);
    const fftEnd = Math.min(fftStart + fftSize, channelData.length);
    const window = new Float32Array(fftSize);
    for (let i = 0; i < fftEnd - fftStart; i++) {
      // Apply Hann window
      const hannMultiplier = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (fftSize - 1)));
      window[i] = channelData[fftStart + i] * hannMultiplier;
    }

    // Simple DFT for frequency magnitudes (in dB)
    const frequencies = new Float32Array(halfFft);
    for (let k = 0; k < halfFft; k++) {
      let real = 0;
      let imag = 0;
      for (let n = 0; n < fftSize; n++) {
        const angle = (2 * Math.PI * k * n) / fftSize;
        real += window[n] * Math.cos(angle);
        imag -= window[n] * Math.sin(angle);
      }
      const magnitude = Math.sqrt(real * real + imag * imag) / fftSize;
      // Convert to dB scale (clamped)
      frequencies[k] = magnitude > 0 ? 20 * Math.log10(magnitude) : -100;
    }

    const bass = bandEnergy(frequencies, sampleRate, fftSize, 20, 250);
    const mid = bandEnergy(frequencies, sampleRate, fftSize, 250, 4000);
    const treble = bandEnergy(frequencies, sampleRate, fftSize, 4000, 20000);

    frames.push({ amplitude, frequencies, bass, mid, treble });
  }

  return frames;
}

// Module-level cache for analysis results
const analysisCache = new Map<string, AnalysisFrame[]>();

/**
 * Pre-analyze audio and return frame-indexed analysis data.
 *
 * Returns `null` while loading, then provides an `AudioAnalysis` object
 * each frame once the data is ready.
 *
 * ```ts
 * const data = useAudioData("/music.mp3");
 * if (data) {
 *   // data.bass, data.amplitude, data.frequencies, etc.
 * }
 * ```
 */
export function useAudioData(
  audioSrc: string,
  options?: AudioDataOptions,
): AudioAnalysis | null {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fftSize = options?.fftSize ?? DEFAULT_FFT_SIZE;

  const [frames, setFrames] = useState<AnalysisFrame[] | null>(() => {
    const cacheKey = `${audioSrc}:${fps}:${fftSize}`;
    return analysisCache.get(cacheKey) ?? null;
  });

  useEffect(() => {
    const cacheKey = `${audioSrc}:${fps}:${fftSize}`;
    const cached = analysisCache.get(cacheKey);
    if (cached) {
      setFrames(cached);
      return;
    }

    let cancelled = false;

    analyzeAudio(audioSrc, fps, fftSize).then((result) => {
      if (!cancelled) {
        analysisCache.set(cacheKey, result);
        setFrames(result);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [audioSrc, fps, fftSize]);

  return useMemo(() => {
    if (!frames) return null;
    const idx = Math.max(0, Math.min(frame, frames.length - 1));
    return frames[idx];
  }, [frames, frame]);
}
