import { createContext, useContext } from "react";
import type { SequenceContextType } from "../types.js";

const SequenceContext = createContext<SequenceContextType | null>(null);

export function useSequenceContext(): SequenceContextType | null {
  return useContext(SequenceContext);
}

export { SequenceContext };
