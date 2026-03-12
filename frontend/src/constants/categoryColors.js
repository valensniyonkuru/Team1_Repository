// Fixed palette — keyed by lowercase name for case-insensitive lookup
const CATEGORY_COLOR_MAP = {
  event:      { bg: "bg-ping-badge-purple-bg", border: "border-ping-badge-purple-border", text: "text-ping-badge-purple-text" },
  news:       { bg: "bg-ping-badge-yellow-bg", border: "border-ping-badge-yellow-border", text: "text-ping-badge-yellow-text" },
  discussion: { bg: "bg-ping-badge-green-bg",  border: "border-ping-badge-green-border",  text: "text-ping-badge-green-text" },
  alert:      { bg: "bg-ping-badge-red-bg",    border: "border-ping-badge-red-border",    text: "text-ping-badge-red-text" },
};

// Fallback palette for unknown categories
const PALETTE = [
  { bg: "bg-ping-badge-purple-bg", border: "border-ping-badge-purple-border", text: "text-ping-badge-purple-text" },
  { bg: "bg-ping-badge-red-bg",    border: "border-ping-badge-red-border",    text: "text-ping-badge-red-text" },
  { bg: "bg-ping-badge-green-bg",  border: "border-ping-badge-green-border",  text: "text-ping-badge-green-text" },
  { bg: "bg-ping-badge-yellow-bg", border: "border-ping-badge-yellow-border", text: "text-ping-badge-yellow-text" },
];

export const DEFAULT_CATEGORY_COLORS = {
  bg: "bg-gray-100",
  border: "border-gray-300",
  text: "text-gray-600",
};

/**
 * Returns a colour set for any category name.
 * Known categories always get their designated colour (case-insensitive).
 * Unknown categories fall back to a palette slot based on name length.
 */
export const getCategoryColors = (name) => {
  if (!name) return DEFAULT_CATEGORY_COLORS;
  return CATEGORY_COLOR_MAP[name.toLowerCase()] ?? PALETTE[name.length % PALETTE.length];
};
