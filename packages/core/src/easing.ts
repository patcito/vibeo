export function linear(t: number): number {
  return t;
}

export function easeIn(t: number): number {
  return t * t * t;
}

export function easeOut(t: number): number {
  const inv = 1 - t;
  return 1 - inv * inv * inv;
}

export function easeInOut(t: number): number {
  if (t < 0.5) {
    return 4 * t * t * t;
  }
  const inv = -2 * t + 2;
  return 1 - (inv * inv * inv) / 2;
}

export function bezier(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): (t: number) => number {
  // Newton-Raphson to solve cubic bezier for x → t, then evaluate y(t)
  const NEWTON_ITERATIONS = 8;
  const NEWTON_MIN_SLOPE = 0.001;
  const SUBDIVISION_PRECISION = 0.0000001;
  const SUBDIVISION_MAX_ITERATIONS = 10;

  function sampleCurveX(t: number): number {
    return ((1 - 3 * x2 + 3 * x1) * t + (3 * x2 - 6 * x1)) * t + 3 * x1 * t;
  }

  function sampleCurveY(t: number): number {
    return ((1 - 3 * y2 + 3 * y1) * t + (3 * y2 - 6 * y1)) * t + 3 * y1 * t;
  }

  function sampleCurveDerivativeX(t: number): number {
    return (3 * (1 - 3 * x2 + 3 * x1)) * t * t + (2 * (3 * x2 - 6 * x1)) * t + 3 * x1;
  }

  function solveCurveX(x: number): number {
    // Try Newton-Raphson first
    let t = x;
    for (let i = 0; i < NEWTON_ITERATIONS; i++) {
      const currentSlope = sampleCurveDerivativeX(t);
      if (Math.abs(currentSlope) < NEWTON_MIN_SLOPE) break;
      const currentX = sampleCurveX(t) - x;
      t -= currentX / currentSlope;
    }

    // Fall back to bisection
    let a = 0;
    let b = 1;
    t = x;
    for (let i = 0; i < SUBDIVISION_MAX_ITERATIONS; i++) {
      const currentX = sampleCurveX(t) - x;
      if (Math.abs(currentX) < SUBDIVISION_PRECISION) return t;
      if (currentX > 0) {
        b = t;
      } else {
        a = t;
      }
      t = (a + b) / 2;
    }
    return t;
  }

  return (input: number): number => {
    if (input === 0) return 0;
    if (input === 1) return 1;
    return sampleCurveY(solveCurveX(input));
  };
}

export function steps(n: number): (t: number) => number {
  return (t: number): number => {
    return Math.floor(t * n) / n;
  };
}
