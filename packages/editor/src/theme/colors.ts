export const colors = {
  bg: "#0d1117",
  surface: "#161b22",
  surfaceHover: "#1c2333",
  border: "#30363d",
  text: "#e6edf3",
  textMuted: "#7d8590",
  accent: "#58a6ff",
  accentHover: "#79c0ff",
  scene: "#8b5cf6",
  audio: "#22c55e",
  subtitle: "#eab308",
  danger: "#f85149",
  success: "#3fb950",
  modalOverlay: "rgba(0, 0, 0, 0.6)",
  shadow: "rgba(0, 0, 0, 0.4)",
} as const;

export type ColorKey = keyof typeof colors;
