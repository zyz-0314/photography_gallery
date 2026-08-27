/** Display transform: "LANDSCAPE" → "Landscape", "STREET/HUMANISTIC" → "Street/Humanistic". */
export const titleCase = (s: string) =>
  s.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());
