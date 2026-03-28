import React from "react";
import { createRoot } from "react-dom/client";
import { VibeoRoot, useCompositionContext } from "@vibeo/core";
import { Editor } from "./Editor.js";
import { colors } from "./theme/colors.js";
import type { CompositionEntry } from "./types.js";

// @ts-expect-error — injected by bundleForEditor bootstrap
import { Root } from "__VIBEO_USER_ENTRY__";

/**
 * Reads registered compositions from the VibeoRoot context
 * and passes them to the Editor component.
 */
function EditorShell() {
  const { compositions } = useCompositionContext();

  const entries: CompositionEntry[] = [];
  for (const [, comp] of compositions) {
    entries.push({
      id: comp.id,
      name: comp.id,
      component: comp.component as CompositionEntry["component"],
      width: comp.width,
      height: comp.height,
      fps: comp.fps,
      durationInFrames: comp.durationInFrames,
    });
  }

  if (entries.length === 0) {
    return (
      <div style={{ color: colors.textMuted, fontFamily: "sans-serif", padding: 40 }}>
        Loading compositions...
      </div>
    );
  }

  return <Editor compositions={entries} />;
}

function EditorApp() {
  return (
    <VibeoRoot>
      <Root />
      <EditorShell />
    </VibeoRoot>
  );
}

const container = document.getElementById("root")!;
const root = createRoot(container);
root.render(<EditorApp />);
