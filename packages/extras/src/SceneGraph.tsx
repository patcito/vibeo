import React, { useState, useCallback, useMemo } from "react";
import { SceneGraphContext } from "./hooks/use-scene-graph.js";
import type { LayerProps, LayerState, SceneGraphContextValue, SceneGraphProps } from "./types.js";

const defaultLayerState: LayerState = {
  visible: true,
  opacity: 1,
  transform: undefined,
};

/**
 * Scene graph wrapper that provides z-ordering context for <Layer> children.
 */
export function SceneGraph({ children }: SceneGraphProps): React.ReactNode {
  const [layers, setLayers] = useState<Map<string, LayerState>>(new Map());

  const setLayerState = useCallback((name: string, partial: Partial<LayerState>) => {
    setLayers((prev) => {
      const next = new Map(prev);
      const current = prev.get(name) ?? { ...defaultLayerState };
      next.set(name, { ...current, ...partial });
      return next;
    });
  }, []);

  const getLayerState = useCallback(
    (name: string): LayerState => {
      return layers.get(name) ?? { ...defaultLayerState };
    },
    [layers],
  );

  const value: SceneGraphContextValue = useMemo(
    () => ({ layers, setLayerState, getLayerState }),
    [layers, setLayerState, getLayerState],
  );

  return (
    <SceneGraphContext.Provider value={value}>
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        {children}
      </div>
    </SceneGraphContext.Provider>
  );
}

/**
 * Named layer with z-index ordering. Culled when not visible.
 */
export function Layer({
  name,
  zIndex = 0,
  visible = true,
  opacity = 1,
  transform,
  children,
}: LayerProps): React.ReactNode {
  // Layer respects both props and scene graph context state
  const ctx = React.useContext(SceneGraphContext);
  const ctxState = ctx.getLayerState(name);

  // Register initial state on mount
  React.useEffect(() => {
    ctx.setLayerState(name, { visible, opacity, transform });
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const isVisible = ctxState.visible && visible;
  if (!isVisible) return null;

  const effectiveOpacity = ctxState.opacity * opacity;

  return (
    <div
      data-layer={name}
      style={{
        position: "absolute",
        inset: 0,
        zIndex,
        opacity: effectiveOpacity,
        transform: ctxState.transform ?? transform,
        pointerEvents: "auto",
      }}
    >
      {children}
    </div>
  );
}
