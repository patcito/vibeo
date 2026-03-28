import React, { createContext, useContext, useReducer } from "react";
import type { EditorState, CompositionEntry } from "./types.js";
import {
  EditorContext,
  EditorDispatchContext,
  initialEditorState,
} from "./state/editor-state.js";
import {
  historyReducer,
  HistoryContext,
  HistoryDispatchContext,
} from "./state/history.js";
import type { HistoryState } from "./state/history.js";

export const CompositionsContext = createContext<CompositionEntry[]>([]);

export function useCompositions(): CompositionEntry[] {
  return useContext(CompositionsContext);
}

interface EditorProviderProps {
  initialState?: Partial<EditorState>;
  children: React.ReactNode;
}

export const EditorProvider: React.FC<EditorProviderProps> = ({
  initialState,
  children,
}) => {
  const mergedInitial: EditorState = {
    ...initialEditorState,
    ...initialState,
  };

  const initialHistory: HistoryState = {
    past: [],
    present: mergedInitial,
    future: [],
  };

  const [history, historyDispatch] = useReducer(historyReducer, initialHistory);

  return (
    <HistoryContext.Provider value={history}>
      <HistoryDispatchContext.Provider value={historyDispatch}>
        <EditorContext.Provider value={history.present}>
          <EditorDispatchContext.Provider value={historyDispatch}>
            {children}
          </EditorDispatchContext.Provider>
        </EditorContext.Provider>
      </HistoryDispatchContext.Provider>
    </HistoryContext.Provider>
  );
};
