"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tenant, CompetitionType } from "@/entities/tenant/Tenant.schema";
import { Plus, Tag } from "lucide-react";
import { useState, Dispatch, SetStateAction } from "react";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import AddCompetitionTypeForm from "../forms/AddCompetitionTypeForm";
import EditCompetitionTypeForm from "../forms/EditCompetitionTypeForm";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/libs/tailwind/utils";

// Default color from design system - for visual preview only
const DEFAULT_COLOR = "#7c3aed"; // Vivid purple

interface CompetitionTypesContentProps {
  tenant: Tenant | undefined;
  domain: string;
  isAddOpen?: boolean;
  setIsAddOpen?: Dispatch<SetStateAction<boolean>>;
  hideAddButton?: boolean;
}

export default function CompetitionTypesContent({
  tenant,
  domain,
  isAddOpen: externalIsAddOpen,
  setIsAddOpen: externalSetIsAddOpen,
  hideAddButton = false,
}: CompetitionTypesContentProps) {
  const [internalIsAddOpen, setInternalIsAddOpen] = useState(false);
  const [editCompetitionType, setEditCompetitionType] =
    useState<CompetitionType | null>(null);

  // Use external state if provided, otherwise use internal state
  const isAddCompetitionTypeOpen =
    externalIsAddOpen !== undefined ? externalIsAddOpen : internalIsAddOpen;
  const setIsAddCompetitionTypeOpen =
    externalSetIsAddOpen || setInternalIsAddOpen;

  // Get competition types from tenant or default to empty array
  const competitionTypes = tenant?.competitionTypes || [];

  // Check if any competition types are configured
  const hasCompetitionTypes = competitionTypes.length > 0;

  const handleEditCompetitionType = (competitionType: CompetitionType) => {
    setEditCompetitionType(competitionType);
  };

  // Function to determine text color based on background color
  const getTextColor = (bgColor: string) => {
    // Simple logic: for dark backgrounds use white text, otherwise use dark text
    if (!bgColor) return "text-white";

    // Extract RGB components
    const hexToRgb = (hex: string) => {
      const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      const formattedHex = hex.replace(
        shorthandRegex,
        (_, r, g, b) => r + r + g + g + b + b
      );
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(
        formattedHex
      );
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : { r: 0, g: 0, b: 0 };
    };

    const rgb = hexToRgb(bgColor);
    // Calculate brightness (simple formula)
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;

    return brightness > 128 ? "text-gray-800" : "text-white";
  };

  return (
    <div className="space-y-5">
      {!hideAddButton && (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              Define competition categories for your games and matches
            </h3>
          </div>
          <Button
            onClick={() => setIsAddCompetitionTypeOpen(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Competition Type
          </Button>
        </div>
      )}

      {!hasCompetitionTypes ? (
        <Card className="border-dashed border-amber-300">
          <CardContent className="flex flex-col items-center justify-center h-[180px] text-amber-700">
            <p className="font-medium">No competition types defined</p>
            <p className="text-sm mt-2">
              Competition types help you categorize games and matches
            </p>
            <Button
              variant="outline"
              className="mt-4 border-amber-400 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
              onClick={() => setIsAddCompetitionTypeOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Competition Type
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          <ScrollArea className="h-auto max-h-[300px] w-full pr-4">
            <div className="flex flex-wrap gap-3 pb-2">
              {competitionTypes.map((type) => {
                const bgColor = type.color || undefined;
                const textColorClass = bgColor
                  ? getTextColor(bgColor)
                  : "text-white";

                return (
                  <Badge
                    key={type.name}
                    variant="outline"
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer transition-all",
                      "hover:opacity-90 border-transparent shadow-sm",
                      textColorClass,
                      !bgColor && "bg-secondary hover:bg-secondary/90"
                    )}
                    style={bgColor ? { backgroundColor: bgColor } : undefined}
                    onClick={() => handleEditCompetitionType(type)}
                  >
                    <Tag className="h-3.5 w-3.5" />
                    {type.name}
                  </Badge>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Add Competition Type Sheet */}
      <ResponsiveSheet
        isOpen={isAddCompetitionTypeOpen}
        setIsOpen={setIsAddCompetitionTypeOpen}
        title="Add Competition Type"
      >
        <div className="p-4">
          <AddCompetitionTypeForm
            domain={domain}
            setIsOpen={setIsAddCompetitionTypeOpen}
          />
        </div>
      </ResponsiveSheet>

      {/* Edit Competition Type Sheet */}
      <ResponsiveSheet
        isOpen={!!editCompetitionType}
        setIsOpen={() => setEditCompetitionType(null)}
        title="Edit Competition Type"
      >
        <div className="p-4">
          {editCompetitionType && (
            <EditCompetitionTypeForm
              domain={domain}
              competitionType={editCompetitionType}
              setIsOpen={() => setEditCompetitionType(null)}
            />
          )}
        </div>
      </ResponsiveSheet>
    </div>
  );
}
