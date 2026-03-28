import { createContext, useContext } from "react";
import type { EditorState, EditorAction } from "../types.js";
import { editorReducer } from "./editor-state.js";

export interface HistoryState {
  past: EditorState[];
  present: EditorState;
  future: EditorState[];
}

export type HistoryAction =
  | { type: "UNDO" }
  | { type: "REDO" }
  | EditorAction;

const MAX_HISTORY = 100;

export function historyReducer(
  state: HistoryState,
  action: HistoryAction,
): HistoryState {
  if (action.type === "UNDO") {
    if (state.past.length === 0) return state;
    const previous = state.past[state.past.length - 1]!;
    return {
      past: state.past.slice(0, -1),
      present: previous,
      future: [state.present, ...state.future],
    };
  }

  if (action.type === "REDO") {
    if (state.future.length === 0) return state;
    const next = state.future[0]!;
    return {
      past: [...state.past, state.present],
      present: next,
      future: state.future.slice(1),
    };
  }

  const newPresent = editorReducer(state.present, action);
  if (newPresent === state.present) return state;

  // Transient actions don't create undo history entries
  const TRANSIENT = new Set([
    "SET_FRAME", "SET_PLAYING", "SET_PLAYBACK_RATE", "SET_LOOP",
    "SET_ACTIVE_COMPOSITION", "SET_ZOOM", "SET_SCROLL_X",
  ]);
  if (TRANSIENT.has(action.type)) {
    return { ...state, present: newPresent };
  }

  const newPast =
    state.past.length >= MAX_HISTORY
      ? [...state.past.slice(1), state.present]
      : [...state.past, state.present];

  return {
    past: newPast,
    present: newPresent,
    future: [],
  };
}

export const HistoryContext = createContext<HistoryState | null>(null);
export const HistoryDispatchContext = createContext<
  React.Dispatch<HistoryAction>
>(() => {});

export function useHistory(): [HistoryState, React.Dispatch<HistoryAction>] {
  const state = useContext(HistoryContext);
  const dispatch = useContext(HistoryDispatchContext);
  if (!state) {
    throw new Error("useHistory must be used within a HistoryProvider");
  }
  return [state, dispatch];
}
