import { createContext, useContext, useCallback } from "react";
import type { SceneGraphContextValue, LayerState } from "../types.js";

const defaultLayerState: LayerState = {
  visible: true,
  opacity: 1,
  transform: undefined,
};

export const SceneGraphContext = createContext<SceneGraphContextValue>({
  layers: new Map(),
  setLayerState: () => {},
  getLayerState: () => defaultLayerState,
});

/**
 * Hook to get/set a named layer's visibility and properties.
 */
export function useLayer(name: string) {
  const ctx = useContext(SceneGraphContext);

  const state = ctx.getLayerState(name);

  const setVisible = useCallback(
    (visible: boolean) => ctx.setLayerState(name, { visible }),
    [ctx, name],
  );

  const setOpacity = useCallback(
    (opacity: number) => ctx.setLayerState(name, { opacity }),
    [ctx, name],
  );

  const setTransform = useCallback(
    (transform: string) => ctx.setLayerState(name, { transform }),
    [ctx, name],
  );

  return {
    ...state,
    setVisible,
    setOpacity,
    setTransform,
  };
}
