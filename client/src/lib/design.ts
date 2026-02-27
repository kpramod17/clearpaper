/**
 * Design Language — ClearPaper
 *
 * Central source of truth for colors, fonts, spacing, and other
 * design tokens used throughout the app.
 */

export const colors = {
  /* ── Backgrounds ── */
  bgPrimary: "#0a0a0a",
  bgSurface: "#111111",
  bgElevated: "#161616",

  /* ── Text ── */
  textPrimary: "#e8e8e3",
  textSecondary: "#999999",
  textMuted: "#555555",
  textDimmed: "#444444",

  /* ── Accent ── */
  accent: "#5ba4c9",
  accentHover: "#74b5d6",

  /* ── Borders ── */
  borderSubtle: "rgba(255, 255, 255, 0.06)",
  borderLight: "rgba(255, 255, 255, 0.10)",
  borderHover: "rgba(255, 255, 255, 0.20)",

  /* ── Semantic ── */
  error: "#f87171",
  errorMuted: "rgba(248, 113, 113, 0.8)",
} as const;

export const fonts = {
  sans: '"Inter", system-ui, sans-serif',
  serif: '"Instrument Serif", Georgia, serif',
} as const;

export const fontWeights = {
  normal: 400,
  medium: 500,
  semibold: 600,
} as const;

export const radii = {
  sm: "4px",
  md: "8px",
  lg: "12px",
  full: "9999px",
} as const;

export const transitions = {
  fast: "150ms ease",
  default: "200ms ease",
  slow: "300ms cubic-bezier(0.16, 1, 0.3, 1)",
} as const;
