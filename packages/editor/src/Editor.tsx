import React, { useEffect } from "react";
import { colors } from "./theme/colors.js";
import { FONT_FAMILY, GLOBAL_STYLES } from "./theme/styles.js";
import { EditorProvider, CompositionsContext } from "./EditorProvider.js";
import { EditorLayout } from "./layout/EditorLayout.js";
import type { CompositionEntry } from "./types.js";

export interface EditorProps {
  compositions: CompositionEntry[];
}

export const Editor: React.FC<EditorProps> = ({ compositions }) => {
  const first = compositions[0];

  const initialState = first
    ? {
        fps: first.fps,
        durationInFrames: first.durationInFrames,
        compositionWidth: first.width,
        compositionHeight: first.height,
        activeCompositionId: first.id,
      }
    : undefined;

  // Inject global scrollbar + focus ring styles
  useEffect(() => {
    const id = "vibeo-editor-global-styles";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = GLOBAL_STYLES;
    document.head.appendChild(style);
    return () => {
      style.remove();
    };
  }, []);

  return (
    <CompositionsContext.Provider value={compositions}>
      <EditorProvider initialState={initialState}>
        <div
          style={{
            width: "100vw",
            height: "100vh",
            backgroundColor: colors.bg,
            color: colors.text,
            fontFamily: FONT_FAMILY,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <EditorLayout />
        </div>
      </EditorProvider>
    </CompositionsContext.Provider>
  );
};
