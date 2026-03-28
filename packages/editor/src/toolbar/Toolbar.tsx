import React from "react";
import { colors } from "../theme/colors.js";
import { TOOLBAR_HEIGHT, BORDER_RADIUS, TRANSITION, FONT_FAMILY } from "../theme/styles.js";
import { useEditor } from "../state/editor-state.js";
import { useHistory } from "../state/history.js";
import { useCompositions } from "../EditorProvider.js";

const btnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  color: colors.text,
  fontSize: 16,
  padding: "4px 8px",
  cursor: "pointer",
  borderRadius: BORDER_RADIUS,
  transition: TRANSITION,
  fontFamily: FONT_FAMILY,
};

const disabledStyle: React.CSSProperties = {
  ...btnStyle,
  color: colors.textMuted,
  cursor: "default",
};

function hoverOn(e: React.MouseEvent) {
  (e.currentTarget as HTMLElement).style.filter = "brightness(1.2)";
}
function hoverOff(e: React.MouseEvent) {
  (e.currentTarget as HTMLElement).style.filter = "";
}
function pressOn(e: React.MouseEvent) {
  (e.currentTarget as HTMLElement).style.filter = "brightness(0.9)";
}

export const Toolbar: React.FC = () => {
  const [state, dispatch] = useEditor();
  const [history, historyDispatch] = useHistory();
  const compositions = useCompositions();

  const activeComp =
    compositions.find((c) => c.id === state.activeCompositionId) ??
    compositions[0];

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  return (
    <div
      style={{
        height: TOOLBAR_HEIGHT,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 12px",
        backgroundColor: colors.surface,
        borderBottom: `1px solid ${colors.border}`,
        gap: 8,
      }}
    >
      {/* Left: Undo / Redo */}
      <div style={{ display: "flex", gap: 4 }}>
        <button
          title="Undo (Ctrl+Z)"
          style={canUndo ? btnStyle : disabledStyle}
          disabled={!canUndo}
          onClick={() => historyDispatch({ type: "UNDO" })}
          onMouseEnter={canUndo ? hoverOn : undefined}
          onMouseLeave={canUndo ? hoverOff : undefined}
          onMouseDown={canUndo ? pressOn : undefined}
          onMouseUp={canUndo ? hoverOn : undefined}
        >
          &#x27F2;
        </button>
        <button
          title="Redo (Ctrl+Shift+Z)"
          style={canRedo ? btnStyle : disabledStyle}
          disabled={!canRedo}
          onClick={() => historyDispatch({ type: "REDO" })}
          onMouseEnter={canRedo ? hoverOn : undefined}
          onMouseLeave={canRedo ? hoverOff : undefined}
          onMouseDown={canRedo ? pressOn : undefined}
          onMouseUp={canRedo ? hoverOn : undefined}
        >
          &#x27F3;
        </button>
      </div>

      {/* Center: Composition selector */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {compositions.length <= 1 ? (
          <span style={{ fontSize: 13, color: colors.text }}>
            {activeComp?.name ?? "No composition"}
          </span>
        ) : (
          <select
            value={state.activeCompositionId ?? ""}
            onChange={(e) => {
              const comp = compositions.find((c) => c.id === e.target.value);
              if (comp) {
                dispatch({ type: "SET_ACTIVE_COMPOSITION", compositionId: comp.id });
                dispatch({ type: "SET_DURATION", durationInFrames: comp.durationInFrames });
                dispatch({ type: "SET_COMPOSITION_SIZE", width: comp.width, height: comp.height });
                dispatch({ type: "SET_FRAME", frame: 0 });
              }
            }}
            onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = colors.accent; el.style.backgroundColor = colors.surfaceHover; }}
            onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = colors.border; el.style.backgroundColor = colors.bg; }}
            onMouseDown={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = colors.accentHover; el.style.backgroundColor = colors.surface; }}
            onMouseUp={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = colors.accent; el.style.backgroundColor = colors.surfaceHover; }}
            style={{
              background: colors.bg,
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: BORDER_RADIUS,
              padding: "4px 8px",
              fontSize: 13,
              fontFamily: FONT_FAMILY,
              outline: "none",
              cursor: "pointer",
              transition: TRANSITION,
            }}
          >
            {compositions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Right: Zoom display */}
      <div style={{ fontSize: 12, color: colors.textMuted }}>
        {Math.round(state.zoom * 100)}%
      </div>
    </div>
  );
};
