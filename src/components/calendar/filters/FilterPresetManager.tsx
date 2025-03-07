"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFilterContext } from "./FilterContext";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Save, Check } from "lucide-react";

interface FilterPresetManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FilterPresetManager({
  open,
  onOpenChange,
}: FilterPresetManagerProps) {
  const { presets, savePreset, deletePreset, applyPreset, selectedPresetId } =
    useFilterContext();
  const [presetName, setPresetName] = React.useState("");
  const [makeDefault, setMakeDefault] = React.useState(false);

  React.useEffect(() => {
    // Reset input state when dialog opens
    if (open) {
      setPresetName("");
      setMakeDefault(false);
    }
  }, [open]);

  const handleSavePreset = () => {
    if (presetName.trim()) {
      savePreset(presetName.trim());
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Filter Preset</DialogTitle>
          <DialogDescription>
            Save your current filter settings as a preset for future use.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="preset-name">Preset Name</Label>
            <Input
              id="preset-name"
              placeholder="My filter preset"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="make-default"
              checked={makeDefault}
              onCheckedChange={(checked) => setMakeDefault(!!checked)}
            />
            <Label htmlFor="make-default">
              Make this the default filter preset
            </Label>
          </div>

          {presets.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Saved Presets</h4>
              <div className="h-[120px] overflow-auto">
                <div className="space-y-2">
                  {presets.map((preset) => (
                    <div
                      key={preset.id}
                      className="flex items-center justify-between p-2 rounded-md border"
                    >
                      <div className="flex items-center gap-2">
                        {selectedPresetId === preset.id && (
                          <Check className="h-4 w-4 text-green-500" />
                        )}
                        <span className="text-sm">{preset.name}</span>
                        {preset.isDefault && (
                          <span className="text-xs bg-muted px-1.5 py-0.5 rounded-sm">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => applyPreset(preset.id)}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive"
                          onClick={() => deletePreset(preset.id)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSavePreset} disabled={!presetName.trim()}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
