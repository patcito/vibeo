import { useCallback, useRef, useState } from "react";
import { useEditor } from "../state/editor-state.js";
import type { Clip } from "../types.js";

export type DragMode = "move" | "resize-left" | "resize-right" | null;

export interface DragState {
  isDragging: boolean;
  mode: DragMode;
  ghostX: number;
  ghostY: number;
  ghostWidth: number;
}

const EDGE_THRESHOLD = 6;

export function useTimelineDrag(clip: Clip, pixelsPerFrame: number) {
  const [state, dispatch] = useEditor();
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    mode: null,
    ghostX: 0,
    ghostY: 0,
    ghostWidth: 0,
  });

  const dragRef = useRef<{
    initialMouseX: number;
    initialMouseY: number;
    initialFrom: number;
    initialDuration: number;
    mode: DragMode;
    clipLeft: number;
    clipWidth: number;
  } | null>(null);

  const detectEdge = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, el: HTMLDivElement): DragMode => {
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      if (relX <= EDGE_THRESHOLD) return "resize-left";
      if (relX >= rect.width - EDGE_THRESHOLD) return "resize-right";
      return "move";
    },
    [],
  );

  const getCursorForEdge = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, el: HTMLDivElement): string => {
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      if (relX <= EDGE_THRESHOLD || relX >= rect.width - EDGE_THRESHOLD) {
        return "col-resize";
      }
      return "grab";
    },
    [],
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.stopPropagation();
      e.preventDefault();
      const el = e.currentTarget;
      const mode = detectEdge(e, el);
      const rect = el.getBoundingClientRect();

      dragRef.current = {
        initialMouseX: e.clientX,
        initialMouseY: e.clientY,
        initialFrom: clip.from,
        initialDuration: clip.durationInFrames,
        mode,
        clipLeft: rect.left,
        clipWidth: rect.width,
      };

      setDragState({
        isDragging: true,
        mode,
        ghostX: rect.left,
        ghostY: rect.top,
        ghostWidth: rect.width,
      });

      el.setPointerCapture(e.pointerId);
    },
    [clip.from, clip.durationInFrames, detectEdge],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const ref = dragRef.current;
      if (!ref) return;

      const deltaX = e.clientX - ref.initialMouseX;
      const deltaFrames = deltaX / pixelsPerFrame;

      if (ref.mode === "move") {
        const maxFrom = Math.max(0, state.durationInFrames - clip.durationInFrames);
        const newFrom = Math.min(maxFrom, Math.max(0, Math.round(ref.initialFrom + deltaFrames)));
        const clampedDeltaPx = (newFrom - ref.initialFrom) * pixelsPerFrame;
        setDragState((prev) => ({
          ...prev,
          ghostX: ref.clipLeft + clampedDeltaPx,
        }));
      } else if (ref.mode === "resize-left") {
        const frameDelta = Math.round(deltaFrames);
        const maxLeftDelta = ref.initialDuration - 1;
        const clampedDelta = Math.max(
          -ref.initialFrom,
          Math.min(maxLeftDelta, frameDelta),
        );
        const newWidth =
          (ref.initialDuration - clampedDelta) * pixelsPerFrame;
        setDragState((prev) => ({
          ...prev,
          ghostX: ref.clipLeft + clampedDelta * pixelsPerFrame,
          ghostWidth: newWidth,
        }));
      } else if (ref.mode === "resize-right") {
        const frameDelta = Math.round(deltaFrames);
        const maxDur = Math.max(1, state.durationInFrames - ref.initialFrom);
        const newDur = Math.min(maxDur, Math.max(1, ref.initialDuration + frameDelta));
        setDragState((prev) => ({
          ...prev,
          ghostWidth: newDur * pixelsPerFrame,
        }));
      }
    },
    [pixelsPerFrame, state.durationInFrames],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const ref = dragRef.current;
      if (!ref) return;

      const deltaX = e.clientX - ref.initialMouseX;
      const deltaFrames = deltaX / pixelsPerFrame;

      if (ref.mode === "move") {
        const maxFrom = Math.max(0, state.durationInFrames - clip.durationInFrames);
        const newFrom = Math.min(maxFrom, Math.max(0, Math.round(ref.initialFrom + deltaFrames)));
        dispatch({ type: "MOVE_CLIP", clipId: clip.id, from: newFrom });
      } else if (ref.mode === "resize-left") {
        const frameDelta = Math.round(deltaFrames);
        const maxLeftDelta = ref.initialDuration - 1;
        const clampedDelta = Math.max(
          -ref.initialFrom,
          Math.min(maxLeftDelta, frameDelta),
        );
        const newFrom = ref.initialFrom + clampedDelta;
        const newDur = ref.initialDuration - clampedDelta;
        dispatch({
          type: "RESIZE_CLIP",
          clipId: clip.id,
          from: newFrom,
          durationInFrames: newDur,
        });
      } else if (ref.mode === "resize-right") {
        const frameDelta = Math.round(deltaFrames);
        const maxDur = Math.max(1, state.durationInFrames - ref.initialFrom);
        const newDur = Math.min(maxDur, Math.max(1, ref.initialDuration + frameDelta));
        dispatch({
          type: "RESIZE_CLIP",
          clipId: clip.id,
          from: ref.initialFrom,
          durationInFrames: newDur,
        });
      }

      dragRef.current = null;
      setDragState({
        isDragging: false,
        mode: null,
        ghostX: 0,
        ghostY: 0,
        ghostWidth: 0,
      });
    },
    [clip.id, clip.durationInFrames, dispatch, pixelsPerFrame, state.durationInFrames],
  );

  return {
    dragState,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    getCursorForEdge,
  };
}
