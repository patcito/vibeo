import { useEffect } from "react";
import { useCompositionContext } from "./context/composition-context.js";
import { validateVideoConfig } from "./video-config.js";
import type { CompositionProps } from "./types.js";

export function Composition<T extends Record<string, unknown> = Record<string, unknown>>(
  props: CompositionProps<T>,
): null {
  const { registerComposition, unregisterComposition } = useCompositionContext();
  const { id, component, width, height, fps, durationInFrames, defaultProps, calculateMetadata } =
    props;

  useEffect(() => {
    validateVideoConfig({ width, height, fps, durationInFrames });

    const composition: CompositionProps = {
      id,
      component: component as CompositionProps["component"],
      width,
      height,
      fps,
      durationInFrames,
      defaultProps: defaultProps as Record<string, unknown>,
      calculateMetadata: calculateMetadata as CompositionProps["calculateMetadata"],
    };

    registerComposition(composition);
    return () => unregisterComposition(id);
  }, [
    id,
    component,
    width,
    height,
    fps,
    durationInFrames,
    defaultProps,
    calculateMetadata,
    registerComposition,
    unregisterComposition,
  ]);

  return null;
}
