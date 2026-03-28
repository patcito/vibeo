import type { ReactNode } from "react";

// ── Keyframes ──────────────────────────────────────────────

/** A keyframe stop can be a plain number or an object with value + per-segment easing. */
export type KeyframeStop = number | { value: number; easing?: (t: number) => number };

/** Map of frame number → keyframe stop. */
export type KeyframeMap = Record<number, KeyframeStop>;

export interface KeyframeOptions {
  /** Default easing applied between segments (overridden by per-stop easing). */
  easing?: (t: number) => number;
}

// ── Spring ─────────────────────────────────────────────────

export interface SpringConfig {
  mass?: number;
  stiffness?: number;
  damping?: number;
}

export interface SpringOptions {
  from: number;
  to: number;
  /** Defaults to `useCurrentFrame()` when omitted. */
  frame?: number;
  /** Defaults to `useVideoConfig().fps` when omitted. */
  fps?: number;
  config?: SpringConfig;
}

// ── Transitions ────────────────────────────────────────────

export type TransitionTiming = "in-and-out" | "in" | "out";
export type TransitionDirection = "left" | "right" | "up" | "down";

export type TransitionType = "fade" | "wipe" | "slide" | "dissolve";

export interface TransitionProps {
  type: TransitionType;
  durationInFrames: number;
  timing?: TransitionTiming;
  /** Direction for wipe/slide transitions. */
  direction?: TransitionDirection;
  children: [ReactNode, ReactNode];
}

export interface TransitionState {
  /** 0 → 1 progress through the transition. */
  progress: number;
  timing: TransitionTiming;
  direction: TransitionDirection;
}

// ── Audio Reactive ─────────────────────────────────────────

export interface AudioAnalysis {
  /** Overall amplitude (0-1 range, RMS of the frame's samples). */
  amplitude: number;
  /** Full frequency data from FFT. */
  frequencies: Float32Array;
  /** Average energy in the bass range (20-250 Hz). */
  bass: number;
  /** Average energy in the mid range (250-4000 Hz). */
  mid: number;
  /** Average energy in the treble range (4000-20000 Hz). */
  treble: number;
}

export interface AudioDataOptions {
  fftSize?: number;
}
