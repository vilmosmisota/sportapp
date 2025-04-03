"use client";

import React, { useState } from "react";
import { setTenantTheme } from "@/lib/utils";
import { Button } from "./button";
import { Paintbrush } from "lucide-react";

type ThemePreset = {
  name: string;
  hue: number;
  saturation: number;
};

const themePresets: ThemePreset[] = [
  { name: "Default Blue", hue: 215, saturation: 70 },
  { name: "Teal", hue: 175, saturation: 70 },
  { name: "Purple", hue: 260, saturation: 70 },
  { name: "Green", hue: 145, saturation: 70 },
  { name: "Red", hue: 0, saturation: 70 },
  { name: "Orange", hue: 30, saturation: 80 },
];

export function ThemeSwitcher() {
  const [activeTheme, setActiveTheme] = useState<ThemePreset>(themePresets[0]);

  const applyTheme = (theme: ThemePreset) => {
    setTenantTheme(theme.hue, theme.saturation);
    setActiveTheme(theme);
  };

  return (
    <div className="p-4 border border-primary-100 rounded-lg bg-card shadow-sm">
      <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
        <Paintbrush className="h-4 w-4" /> Theme Presets
      </h3>

      <div className="flex flex-wrap gap-2">
        {themePresets.map((theme) => (
          <Button
            key={theme.name}
            variant={activeTheme.name === theme.name ? "default" : "outline"}
            size="sm"
            onClick={() => applyTheme(theme)}
            className="relative"
          >
            <span
              className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
              style={{
                backgroundColor: `hsl(${theme.hue} ${theme.saturation}% 50%)`,
              }}
            />
            <span className="ml-4">{theme.name}</span>
          </Button>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-primary-100">
        <div className="flex flex-wrap gap-2">
          {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
            <div
              key={shade}
              className="w-10 h-10 rounded-md flex items-center justify-center text-xs font-mono"
              style={{
                backgroundColor: `hsl(var(--primary-${shade}))`,
                color: shade > 500 ? "white" : "black",
              }}
            >
              {shade}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
