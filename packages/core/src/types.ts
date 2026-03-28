import type { ComponentType } from "react";

export interface VideoConfig {
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
}

export interface CompositionProps<T extends Record<string, unknown> = Record<string, unknown>> {
  id: string;
  component: ComponentType<T>;
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
  defaultProps?: T;
  calculateMetadata?: (props: T) => Promise<Partial<VideoConfig>>;
}

export interface SequenceContextType {
  cumulatedFrom: number;
  relativeFrom: number;
  durationInFrames: number;
}

export interface LoopContextType {
  iteration: number;
  durationInFrames: number;
}

export type ExtrapolateType = "clamp" | "extend" | "identity";

export interface InterpolateOptions {
  easing?: (t: number) => number;
  extrapolateLeft?: ExtrapolateType;
  extrapolateRight?: ExtrapolateType;
}
