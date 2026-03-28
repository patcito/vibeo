import { useState, useEffect, useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "@vibeo/core";
import { parseSRT, parseVTT } from "../subtitle-parser.js";
import type { SubtitleCue, SubtitleFormat } from "../types.js";

function detectFormat(src: string, content: string): "srt" | "vtt" {
  if (src.endsWith(".vtt")) return "vtt";
  if (src.endsWith(".srt")) return "srt";
  if (content.trimStart().startsWith("WEBVTT")) return "vtt";
  return "srt";
}

function isUrl(src: string): boolean {
  return src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/");
}

export interface UseSubtitleResult {
  /** All parsed cues. */
  cues: SubtitleCue[];
  /** The cue active at the current frame, or null. */
  activeCue: SubtitleCue | null;
  /** Opacity for fade in/out (0-1). */
  opacity: number;
  /** Whether data is still loading. */
  loading: boolean;
}

/**
 * Hook that parses subtitles and returns the active cue for the current frame.
 * Supports SRT and VTT formats, with 3-frame fade in/out.
 */
export function useSubtitle(
  src: string,
  format: SubtitleFormat = "auto",
): UseSubtitleResult {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [cues, setCues] = useState<SubtitleCue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      let content: string;
      if (isUrl(src)) {
        const res = await fetch(src);
        content = await res.text();
      } else {
        content = src;
      }

      if (cancelled) return;

      const fmt = format === "auto" ? detectFormat(src, content) : format;
      const parsed = fmt === "vtt" ? parseVTT(content) : parseSRT(content);
      setCues(parsed);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [src, format]);

  const activeCue = useMemo(() => {
    for (const cue of cues) {
      const cueStartFrame = Math.floor(cue.startTime * fps);
      const cueEndFrame = Math.floor(cue.endTime * fps);
      if (frame >= cueStartFrame && frame <= cueEndFrame) {
        return cue;
      }
    }
    return null;
  }, [cues, frame, fps]);

  // Compute fade opacity: 3 frames fade in/out
  const opacity = useMemo(() => {
    if (!activeCue) return 0;
    const fadeFrames = 3;
    const cueStartFrame = Math.floor(activeCue.startTime * fps);
    const cueEndFrame = Math.floor(activeCue.endTime * fps);

    const framesIn = frame - cueStartFrame;
    const framesOut = cueEndFrame - frame;

    if (framesIn < fadeFrames) {
      return Math.max(0, Math.min(1, framesIn / fadeFrames));
    }
    if (framesOut < fadeFrames) {
      return Math.max(0, Math.min(1, framesOut / fadeFrames));
    }
    return 1;
  }, [activeCue, frame, fps]);

  return { cues, activeCue, opacity, loading };
}
