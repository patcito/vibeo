import { createContext, useContext, useCallback, useState, type ReactNode } from "react";
import type { CompositionProps } from "../types.js";

interface CompositionContextValue {
  compositions: Map<string, CompositionProps>;
  registerComposition: (composition: CompositionProps) => void;
  unregisterComposition: (id: string) => void;
  currentCompositionId: string | null;
  setCurrentCompositionId: (id: string | null) => void;
}

const CompositionContext = createContext<CompositionContextValue | null>(null);

export function CompositionProvider({ children }: { children: ReactNode }) {
  // If already nested inside a CompositionProvider, reuse the parent context
  const parentCtx = useContext(CompositionContext);
  if (parentCtx) {
    return <>{children}</>;
  }

  return <CompositionProviderInner>{children}</CompositionProviderInner>;
}

function CompositionProviderInner({ children }: { children: ReactNode }) {
  const [compositions, setCompositions] = useState<Map<string, CompositionProps>>(
    () => new Map(),
  );
  const [currentCompositionId, setCurrentCompositionId] = useState<string | null>(null);

  const registerComposition = useCallback((composition: CompositionProps) => {
    setCompositions((prev) => {
      const next = new Map(prev);
      next.set(composition.id, composition);
      return next;
    });
  }, []);

  const unregisterComposition = useCallback((id: string) => {
    setCompositions((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  return (
    <CompositionContext.Provider
      value={{
        compositions,
        registerComposition,
        unregisterComposition,
        currentCompositionId,
        setCurrentCompositionId,
      }}
    >
      {children}
    </CompositionContext.Provider>
  );
}

export function useCompositionContext(): CompositionContextValue {
  const ctx = useContext(CompositionContext);
  if (!ctx) {
    throw new Error("useCompositionContext must be used within a CompositionProvider");
  }
  return ctx;
}

export { CompositionContext };
