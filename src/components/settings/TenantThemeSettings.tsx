"use client";

import React, { useState, useEffect } from "react";
import { setTenantTheme } from "@/lib/utils";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Card } from "../ui/card";
import { ThemeSwitcher } from "../ui/theme-switcher";

interface TenantThemeSettingsProps {
  initialHue?: number;
  initialSaturation?: number;
  tenantId?: string;
  onSave?: (values: { hue: number; saturation: number }) => Promise<void>;
}

export function TenantThemeSettings({
  initialHue = 215,
  initialSaturation = 70,
  tenantId,
  onSave,
}: TenantThemeSettingsProps) {
  const [hue, setHue] = useState(initialHue);
  const [saturation, setSaturation] = useState(initialSaturation);
  const [isSaving, setIsSaving] = useState(false);

  // Apply initial theme
  useEffect(() => {
    setTenantTheme(initialHue, initialSaturation);
  }, [initialHue, initialSaturation]);

  // Handle live preview as user adjusts values
  const handleHueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHue = parseInt(e.target.value, 10);
    setHue(newHue);
    setTenantTheme(newHue, saturation);
  };

  const handleSaturationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSaturation = parseInt(e.target.value, 10);
    setSaturation(newSaturation);
    setTenantTheme(hue, newSaturation);
  };

  const handleSave = async () => {
    if (!onSave) return;

    setIsSaving(true);
    try {
      await onSave({ hue, saturation });
    } catch (error) {
      console.error("Failed to save theme settings", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-medium">Tenant Theme Configuration</h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hue">
                Hue ({hue})
                <span className="text-xs text-muted-foreground ml-2">
                  Range: 0-360
                </span>
              </Label>
              <div className="flex items-center gap-4">
                <Input
                  id="hue"
                  type="range"
                  min="0"
                  max="360"
                  value={hue}
                  onChange={handleHueChange}
                  className="w-full"
                />
                <div
                  className="w-6 h-6 rounded-full border"
                  style={{
                    backgroundColor: `hsl(${hue}, ${saturation}%, 50%)`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="saturation">
                Saturation ({saturation}%)
                <span className="text-xs text-muted-foreground ml-2">
                  Range: 0-100
                </span>
              </Label>
              <Input
                id="saturation"
                type="range"
                min="0"
                max="100"
                value={saturation}
                onChange={handleSaturationChange}
                className="w-full"
              />
            </div>
          </div>

          {onSave && (
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Theme"}
              </Button>
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <ThemeSwitcher />

          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-medium">Theme Preview</h3>

            <div className="grid gap-4">
              <div className="p-4 bg-card rounded-lg border border-primary-100">
                <h4 className="text-card-foreground font-medium mb-2">
                  Card Component
                </h4>
                <p className="text-card-foreground text-sm">
                  Card content with default styling
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="default">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
              </div>

              <div className="space-y-2">
                <div className="p-3 bg-accent rounded-lg text-accent-foreground text-sm">
                  Accent background
                </div>
                <div className="p-3 bg-secondary rounded-lg text-secondary-foreground text-sm">
                  Secondary background
                </div>
                <div className="p-3 bg-muted rounded-lg text-muted-foreground text-sm">
                  Muted background
                </div>
                <div className="p-3 bg-sidebar rounded-lg text-sidebar-foreground text-sm">
                  Sidebar background
                </div>
                <div className="p-3 bg-destructive rounded-lg text-destructive-foreground text-sm">
                  Destructive state
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-10 gap-2 mt-8">
        {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
          <div key={shade} className="space-y-2 text-center">
            <div
              className="h-12 rounded-md w-full"
              style={{ backgroundColor: `hsl(var(--primary-${shade}))` }}
            />
            <span className="text-xs">Primary-{shade}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
