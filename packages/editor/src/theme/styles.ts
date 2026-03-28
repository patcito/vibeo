import { colors } from "./colors.js";

export const TOOLBAR_HEIGHT = 44;
export const TIMELINE_TRACK_HEIGHT = 36;
export const TIMELINE_RULER_HEIGHT = 28;
export const SIDEBAR_MIN_WIDTH = 200;
export const BORDER_RADIUS = 6;
export const FONT_FAMILY = "system-ui, -apple-system, sans-serif";
export const MONO_FONT = "'SF Mono', 'Cascadia Code', 'Consolas', monospace";
export const TRANSITION = "all 150ms ease";
export const TRANSITION_PANEL = "all 200ms ease";
export const TRACK_LABEL_WIDTH = 80;

/** Global scrollbar + focus ring styles injected via <style> tag.
 *  Uses string interpolation so every colour comes from the theme. */
export const GLOBAL_STYLES = `
  ::-webkit-scrollbar { width: 8px; height: 8px; }
  ::-webkit-scrollbar-track { background: ${colors.bg}; }
  ::-webkit-scrollbar-thumb { background: ${colors.border}; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: ${colors.textMuted}; }
  *:focus-visible { outline: 2px solid ${colors.accent}; outline-offset: 2px; }
  select:hover { border-color: ${colors.accent} !important; }
  select:active { border-color: ${colors.accentHover} !important; }
`;
