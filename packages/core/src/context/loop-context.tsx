import { createContext, useContext } from "react";
import type { LoopContextType } from "../types.js";

const LoopContext = createContext<LoopContextType | null>(null);

export function useLoopContext(): LoopContextType | null {
  return useContext(LoopContext);
}

export { LoopContext };
