import { useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "@vibeo/core";
import type { SpringConfig, SpringOptions } from "./types.js";

const DEFAULT_CONFIG: Required<SpringConfig> = {
  mass: 1,
  stiffness: 170,
  damping: 26,
};

/** Velocity threshold below which the spring is considered settled. */
const SETTLE_THRESHOLD = 0.001;
/** Position threshold — spring is settled when both velocity and displacement are tiny. */
const POSITION_THRESHOLD = 0.001;

interface SpringState {
  position: number;
  velocity: number;
}

/**
 * Simulate spring physics frame-by-frame.
 * Returns an array of positions indexed by frame number.
 *
 * Uses semi-implicit Euler integration with dt = 1/fps.
 */
function simulateSpring(
  from: number,
  to: number,
  fps: number,
  config: Required<SpringConfig>,
  maxFrames: number,
): number[] {
  const { mass, stiffness, damping } = config;
  const dt = 1 / fps;
  const positions: number[] = [from];

  let state: SpringState = { position: from, velocity: 0 };

  for (let i = 1; i <= maxFrames; i++) {
    // Force = -stiffness * displacement - damping * velocity
    const displacement = state.position - to;
    const springForce = -stiffness * displacement;
    const dampingForce = -damping * state.velocity;
    const acceleration = (springForce + dampingForce) / mass;

    // Semi-implicit Euler
    const newVelocity = state.velocity + acceleration * dt;
    const newPosition = state.position + newVelocity * dt;

    state = { position: newPosition, velocity: newVelocity };
    positions.push(newPosition);

    // Early termination if settled
    if (
      Math.abs(newVelocity) < SETTLE_THRESHOLD &&
      Math.abs(newPosition - to) < POSITION_THRESHOLD
    ) {
      // Fill remaining frames with the target value
      for (let j = i + 1; j <= maxFrames; j++) {
        positions.push(to);
      }
      break;
    }
  }

  return positions;
}

function resolveConfig(config?: SpringConfig): Required<SpringConfig> {
  return {
    mass: config?.mass ?? DEFAULT_CONFIG.mass,
    stiffness: config?.stiffness ?? DEFAULT_CONFIG.stiffness,
    damping: config?.damping ?? DEFAULT_CONFIG.damping,
  };
}

/**
 * Create a cache key for spring simulation parameters.
 * This enables memoization across identical spring configurations.
 */
function springCacheKey(
  from: number,
  to: number,
  fps: number,
  config: Required<SpringConfig>,
): string {
  return `${from}:${to}:${fps}:${config.mass}:${config.stiffness}:${config.damping}`;
}

// Module-level cache for spring simulations
const springCache = new Map<string, number[]>();

/**
 * Spring physics animation hook. Tracks the current frame automatically
 * via `useCurrentFrame()` and reads fps from `useVideoConfig()` by default.
 *
 * ```ts
 * const x = useSpring({ from: 0, to: 100 });
 * ```
 */
export function useSpring(options: SpringOptions): number {
  const currentFrame = useCurrentFrame();
  const { fps: configFps } = useVideoConfig();
  const { from, to, frame = currentFrame, fps = configFps, config } = options;
  const resolved = resolveConfig(config);

  const positions = useMemo(() => {
    const key = springCacheKey(from, to, fps, resolved);
    const cached = springCache.get(key);
    if (cached) return cached;

    // Simulate enough frames (cap at 600 = 10s at 60fps)
    const maxFrames = 600;
    const result = simulateSpring(from, to, fps, resolved, maxFrames);
    springCache.set(key, result);
    return result;
  }, [from, to, fps, resolved.mass, resolved.stiffness, resolved.damping]);

  // Clamp frame to available simulation data
  if (frame <= 0) return positions[0];
  if (frame >= positions.length - 1) return positions[positions.length - 1];
  return positions[Math.round(frame)];
}

/**
 * Compute how many frames until the spring settles (velocity < threshold).
 */
export function springDuration(options: {
  fps: number;
  config?: SpringConfig;
  from?: number;
  to?: number;
}): number {
  const { fps, from = 0, to = 1 } = options;
  const config = resolveConfig(options.config);
  const dt = 1 / fps;

  let state: SpringState = { position: from, velocity: 0 };

  for (let i = 1; i <= 600; i++) {
    const displacement = state.position - to;
    const springForce = -config.stiffness * displacement;
    const dampingForce = -config.damping * state.velocity;
    const acceleration = (springForce + dampingForce) / config.mass;

    const newVelocity = state.velocity + acceleration * dt;
    const newPosition = state.position + newVelocity * dt;

    state = { position: newPosition, velocity: newVelocity };

    if (
      Math.abs(newVelocity) < SETTLE_THRESHOLD &&
      Math.abs(newPosition - to) < POSITION_THRESHOLD
    ) {
      return i;
    }
  }

  return 600;
}
