import { useEffect, useRef } from "react";
import { useEditor } from "../state/editor-state.js";
import { useHistory } from "../state/history.js";
import type { EditorState } from "../types.js";

export function useKeyboardShortcuts(): void {
  const [state, dispatch] = useEditor();
  const [, historyDispatch] = useHistory();

  // Use a ref so the listener always sees current state without re-registering
  const stateRef = useRef<EditorState>(state);
  stateRef.current = state;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT"
      ) {
        return;
      }

      const s = stateRef.current;
      const isMod = e.metaKey || e.ctrlKey;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          dispatch({ type: "SET_PLAYING", playing: !s.playing });
          break;

        case "ArrowLeft":
          e.preventDefault();
          dispatch({
            type: "SET_FRAME",
            frame: Math.max(0, s.frame - (e.shiftKey ? 10 : 1)),
          });
          break;

        case "ArrowRight":
          e.preventDefault();
          dispatch({
            type: "SET_FRAME",
            frame: Math.min(
              s.durationInFrames - 1,
              s.frame + (e.shiftKey ? 10 : 1),
            ),
          });
          break;

        case "KeyZ":
          if (isMod) {
            e.preventDefault();
            if (e.shiftKey) {
              historyDispatch({ type: "REDO" });
            } else {
              historyDispatch({ type: "UNDO" });
            }
          }
          break;

        case "Delete":
        case "Backspace":
          if (s.selectedClipId && !isMod) {
            e.preventDefault();
            dispatch({ type: "REMOVE_CLIP", clipId: s.selectedClipId });
          }
          break;

        case "Escape":
          dispatch({ type: "SELECT_CLIP", clipId: null });
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [dispatch, historyDispatch]);
}
