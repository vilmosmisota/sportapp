/**
 * Color utility functions for calculating contrast and readability
 */

/**
 * Convert hex color to RGB values
 */
export function hexToRgb(
  hex: string
): { r: number; g: number; b: number } | null {
  // Remove # if present and handle 3-digit hex codes
  const cleanHex = hex.replace("#", "");

  if (cleanHex.length === 3) {
    // Convert 3-digit hex to 6-digit
    const expandedHex = cleanHex
      .split("")
      .map((char) => char + char)
      .join("");
    return hexToRgb("#" + expandedHex);
  }

  if (cleanHex.length !== 6) {
    return null;
  }

  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return null;
  }

  return { r, g, b };
}

/**
 * Calculate the relative luminance of a color
 * Based on WCAG 2.1 guidelines
 */
export function getLuminance(r: number, g: number, b: number): number {
  // Convert RGB to relative luminance
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(
  color1: { r: number; g: number; b: number },
  color2: { r: number; g: number; b: number }
): number {
  const lum1 = getLuminance(color1.r, color1.g, color1.b);
  const lum2 = getLuminance(color2.r, color2.g, color2.b);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Get the best contrasting text color (black or white) for a given background color
 * Returns the color with the highest contrast ratio
 */
export function getContrastColor(backgroundColor: string): string {
  const rgb = hexToRgb(backgroundColor);

  if (!rgb) {
    // Fallback to black if hex parsing fails
    return "#000000";
  }

  const whiteContrast = getContrastRatio(rgb, { r: 255, g: 255, b: 255 });
  const blackContrast = getContrastRatio(rgb, { r: 0, g: 0, b: 0 });

  // Return the color with higher contrast ratio
  return whiteContrast > blackContrast ? "#FFFFFF" : "#000000";
}

/**
 * Check if a color combination meets WCAG accessibility standards
 */
export function meetsAccessibilityStandard(
  backgroundColor: string,
  textColor: string,
  level: "AA" | "AAA" = "AA"
): boolean {
  const bgRgb = hexToRgb(backgroundColor);
  const textRgb = hexToRgb(textColor);

  if (!bgRgb || !textRgb) {
    return false;
  }

  const contrastRatio = getContrastRatio(bgRgb, textRgb);

  // WCAG standards: AA requires 4.5:1, AAA requires 7:1
  const threshold = level === "AAA" ? 7 : 4.5;

  return contrastRatio >= threshold;
}

/**
 * Determine if a color is considered "light" or "dark"
 */
export function isLightColor(color: string): boolean {
  const rgb = hexToRgb(color);

  if (!rgb) {
    return true; // Default to light if parsing fails
  }

  const luminance = getLuminance(rgb.r, rgb.g, rgb.b);
  return luminance > 0.5;
}
