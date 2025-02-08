"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useState } from "react";

type PhasesEditorProps = {
  phases: string[] | null;
  onUpdate: (phases: string[]) => void;
};

export default function PhasesEditor({ phases, onUpdate }: PhasesEditorProps) {
  const [newPhase, setNewPhase] = useState("");

  const handleAddPhase = () => {
    if (!newPhase.trim()) return;
    const updatedPhases = [...(phases || []), newPhase.trim()];
    onUpdate(updatedPhases);
    setNewPhase("");
  };

  const handleRemovePhase = (index: number) => {
    const updatedPhases = (phases || []).filter((_, i) => i !== index);
    onUpdate(updatedPhases);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddPhase();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={newPhase}
          onChange={(e) => setNewPhase(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter phase name (e.g., Regular, Playoffs)"
          className="flex-1"
        />
        <Button
          type="button"
          variant="secondary"
          onClick={handleAddPhase}
          disabled={!newPhase.trim()}
        >
          Add
        </Button>
      </div>

      {phases && phases.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {phases.map((phase, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="text-xs bg-secondary/80 hover:bg-secondary/80 pr-1.5"
            >
              {phase}
              <button
                type="button"
                onClick={() => handleRemovePhase(index)}
                className="ml-1 hover:text-destructive focus:outline-none"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No phases added</p>
      )}
    </div>
  );
}
