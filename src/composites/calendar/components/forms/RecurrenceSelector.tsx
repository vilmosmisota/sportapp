"use client";

import { Repeat } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

import { RecurrenceSelectorProps } from "../../types/session-form.types";

export function RecurrenceSelector({
  value,
  onChange,
  season,
  className,
}: RecurrenceSelectorProps) {
  const handleValueChange = (newValue: string) => {
    if (newValue === "once" || newValue === "repeat") {
      onChange({
        type: newValue,
      });
    }
  };

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Repeat className="h-4 w-4" />
          Recurrence
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={value.type}
          onValueChange={handleValueChange}
          className="space-y-3"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="once" id="once" />
            <Label htmlFor="once" className="font-normal">
              One-time session
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="repeat" id="repeat" />
            <Label htmlFor="repeat" className="font-normal">
              Weekly until end of season
            </Label>
          </div>
        </RadioGroup>

        {value.type === "repeat" && (
          <div className="mt-3 p-3 rounded-md bg-muted/50">
            <p className="text-sm text-muted-foreground">
              Sessions will be created weekly on the same day until{" "}
              {season.endDate.toLocaleDateString()}
            </p>
            {season.breaks.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                * Break periods will be automatically excluded
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
