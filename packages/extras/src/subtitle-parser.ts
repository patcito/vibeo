import type { SubtitleCue } from "./types.js";

/**
 * Parse SRT time code "HH:MM:SS,mmm" to seconds.
 */
function parseSRTTime(time: string): number {
  const match = time.trim().match(/^(\d{2}):(\d{2}):(\d{2})[,.](\d{3})$/);
  if (!match) return 0;
  const [, h, m, s, ms] = match;
  return Number(h) * 3600 + Number(m) * 60 + Number(s) + Number(ms) / 1000;
}

/**
 * Parse VTT time code "HH:MM:SS.mmm" or "MM:SS.mmm" to seconds.
 */
function parseVTTTime(time: string): number {
  const trimmed = time.trim();
  // HH:MM:SS.mmm
  const full = trimmed.match(/^(\d{2}):(\d{2}):(\d{2})\.(\d{3})$/);
  if (full) {
    const [, h, m, s, ms] = full;
    return Number(h) * 3600 + Number(m) * 60 + Number(s) + Number(ms) / 1000;
  }
  // MM:SS.mmm (short form allowed in VTT)
  const short = trimmed.match(/^(\d{2}):(\d{2})\.(\d{3})$/);
  if (short) {
    const [, m, s, ms] = short;
    return Number(m) * 60 + Number(s) + Number(ms) / 1000;
  }
  return 0;
}

/**
 * Parse SRT subtitle content into an array of cues.
 *
 * SRT format:
 * ```
 * 1
 * 00:00:01,000 --> 00:00:04,000
 * Hello world
 *
 * 2
 * 00:00:05,000 --> 00:00:08,000
 * Second line
 * ```
 */
export function parseSRT(content: string): SubtitleCue[] {
  const cues: SubtitleCue[] = [];
  const blocks = content.trim().split(/\n\s*\n/);

  for (const block of blocks) {
    const lines = block.trim().split("\n");
    if (lines.length < 2) continue;

    // Find the time code line (contains "-->")
    let timeLineIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes("-->")) {
        timeLineIdx = i;
        break;
      }
    }
    if (timeLineIdx === -1) continue;

    const timeParts = lines[timeLineIdx].split("-->");
    if (timeParts.length !== 2) continue;

    const startTime = parseSRTTime(timeParts[0]);
    const endTime = parseSRTTime(timeParts[1]);
    const text = lines
      .slice(timeLineIdx + 1)
      .join("\n")
      .trim();

    if (text) {
      cues.push({ startTime, endTime, text });
    }
  }

  return cues;
}

/**
 * Parse VTT (WebVTT) subtitle content into an array of cues.
 *
 * VTT format:
 * ```
 * WEBVTT
 *
 * 00:00:01.000 --> 00:00:04.000
 * Hello world
 *
 * 00:00:05.000 --> 00:00:08.000
 * Second line
 * ```
 */
export function parseVTT(content: string): SubtitleCue[] {
  const cues: SubtitleCue[] = [];

  // Strip the WEBVTT header and any metadata before the first blank line
  let body = content;
  const headerEnd = content.indexOf("\n\n");
  if (headerEnd !== -1) {
    body = content.slice(headerEnd + 2);
  } else {
    // Try \r\n line endings
    const headerEndCR = content.indexOf("\r\n\r\n");
    if (headerEndCR !== -1) {
      body = content.slice(headerEndCR + 4);
    }
  }

  const blocks = body.trim().split(/\n\s*\n/);

  for (const block of blocks) {
    const lines = block.trim().split("\n");
    if (lines.length < 2) continue;

    // Find the time code line
    let timeLineIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes("-->")) {
        timeLineIdx = i;
        break;
      }
    }
    if (timeLineIdx === -1) continue;

    const timeParts = lines[timeLineIdx].split("-->");
    if (timeParts.length !== 2) continue;

    // VTT time codes may have positioning info after the end time
    const endTimePart = timeParts[1].trim().split(/\s+/)[0];

    const startTime = parseVTTTime(timeParts[0]);
    const endTime = parseVTTTime(endTimePart);
    const text = lines
      .slice(timeLineIdx + 1)
      .join("\n")
      .trim();

    if (text) {
      cues.push({ startTime, endTime, text });
    }
  }

  return cues;
}
