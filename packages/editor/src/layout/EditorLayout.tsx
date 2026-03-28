import React, { useState, useCallback } from "react";
import { colors } from "../theme/colors.js";
import { FONT_FAMILY, SIDEBAR_MIN_WIDTH, TRANSITION_PANEL } from "../theme/styles.js";
import { Splitter } from "./Splitter.js";
import { SplitterContainer } from "./SplitterContainer.js";
import { Timeline } from "../timeline/Timeline.js";
import { Canvas } from "../canvas/Canvas.js";
import { Toolbar } from "../toolbar/Toolbar.js";
import { PlaybackControls } from "../toolbar/PlaybackControls.js";
import { useKeyboardShortcuts } from "../hooks/use-keyboard-shortcuts.js";
import { SceneList } from "../sidebar/SceneList.js";
import { PropertiesPanel } from "../sidebar/PropertiesPanel.js";
import { KeyboardShortcutsModal } from "../modals/KeyboardShortcutsModal.js";

const SIDEBAR_MAX_WIDTH = 480;
const COLLAPSE_THRESHOLD = SIDEBAR_MIN_WIDTH / 2;

function clampSidebar(raw: number): number {
  if (raw < COLLAPSE_THRESHOLD) return 0;
  return Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, raw));
}

export const EditorLayout: React.FC = () => {
  const [leftWidth, setLeftWidth] = useState(220);
  const [rightWidth, setRightWidth] = useState(280);
  const [topPercent, setTopPercent] = useState(70);

  useKeyboardShortcuts();

  const onLeftResize = useCallback(
    (delta: number) => {
      setLeftWidth((w) => clampSidebar(w + delta));
    },
    [],
  );

  const onRightResize = useCallback(
    (delta: number) => {
      setRightWidth((w) => clampSidebar(w - delta));
    },
    [],
  );

  const onVerticalResize = useCallback(
    (delta: number) => {
      setTopPercent((pct) => {
        const newPct = pct + (delta / window.innerHeight) * 100;
        return Math.min(90, Math.max(20, newPct));
      });
    },
    [],
  );

  const panelStyle: React.CSSProperties = {
    backgroundColor: colors.surface,
    color: colors.text,
    fontFamily: FONT_FAMILY,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
      <Toolbar />

      <SplitterContainer
        direction="horizontal"
        style={{ flex: 1 }}
      >
        {/* Left Sidebar - Scenes */}
        <div
          style={{
            ...panelStyle,
            width: leftWidth,
            flexShrink: 0,
            borderRight: `1px solid ${colors.border}`,
          }}
        >
          <SceneList />
        </div>

        <Splitter direction="horizontal" onResize={onLeftResize} />

        {/* Center - Canvas + PlaybackControls + Timeline */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {/* Top: Canvas */}
          <div
            style={{
              ...panelStyle,
              flex: topPercent,
              minHeight: 0,
            }}
          >
            <Canvas />
          </div>

          <PlaybackControls />

          <Splitter direction="vertical" onResize={onVerticalResize} />

          {/* Bottom: Timeline */}
          <div
            style={{
              ...panelStyle,
              flex: 100 - topPercent,
              minHeight: 0,
            }}
          >
            <Timeline />
          </div>
        </div>

        <Splitter direction="horizontal" onResize={onRightResize} />

        {/* Right Sidebar - Properties */}
        <div
          style={{
            ...panelStyle,
            width: rightWidth,
            flexShrink: 0,
            borderLeft: `1px solid ${colors.border}`,
          }}
        >
          <PropertiesPanel />
        </div>
      </SplitterContainer>
      <KeyboardShortcutsModal />
    </div>
  );
};
