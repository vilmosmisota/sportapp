import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Sets the tenant theme by updating CSS variables
 * @param hue - The hue value (0-360)
 * @param saturation - The saturation percentage (0-100)
 */
export function setTenantTheme(hue: number = 215, saturation: number = 70) {
  // Set CSS variables for primary color
  document.documentElement.style.setProperty("--brand-hue", hue.toString());
  document.documentElement.style.setProperty(
    "--brand-saturation",
    `${saturation}%`
  );
}
