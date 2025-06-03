"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useParentMembers } from "@/entities/member/Performer.query";
import { cn } from "@/lib/utils";
import { AlertCircle, Check, Search, X } from "lucide-react";
import { useState } from "react";

interface SelectableParentListProps {
  tenantId: string;
  selectedParentIds: number[];
  onParentSelect: (parentIds: number[]) => void;
  excludePerformerId?: number;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
}

export default function SelectableParentList({
  tenantId,
  selectedParentIds,
  onParentSelect,
  excludePerformerId,
  placeholder = "Search parents...",
  emptyMessage = "No parents found",
  className,
}: SelectableParentListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: parentMembers = [],
    isLoading,
    error,
  } = useParentMembers(tenantId);

  const availableParents = excludePerformerId
    ? parentMembers.filter((member) => member.id !== excludePerformerId)
    : parentMembers;

  const filteredParents = availableParents.filter((parent) =>
    `${parent.firstName} ${parent.lastName}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const handleParentClick = (parentId: number) => {
    const isSelected = selectedParentIds.includes(parentId);

    if (isSelected) {
      onParentSelect(selectedParentIds.filter((id) => id !== parentId));
    } else {
      onParentSelect([...selectedParentIds, parentId]);
    }
  };

  const clearAllSelections = () => {
    onParentSelect([]);
  };

  const removeParent = (parentId: number) => {
    onParentSelect(selectedParentIds.filter((id) => id !== parentId));
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Skeleton className="h-10 w-full pl-10" />
        </div>

        <div className="border rounded-lg">
          <div className="divide-y">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3">
                <Skeleton className="w-4 h-4 rounded" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center space-x-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <span className="text-sm text-destructive">
            Error loading parents: {error.message}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Selected Parents Display */}
      {selectedParentIds.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              Selected ({selectedParentIds.length}):
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearAllSelections}
              className="h-6 text-xs"
            >
              Clear all
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedParentIds.map((parentId) => {
              const parent = availableParents.find((p) => p.id === parentId);
              return parent ? (
                <div
                  key={parentId}
                  className="flex items-center space-x-1 bg-primary/10 border border-primary/20 rounded-lg px-2 py-1"
                >
                  <span className="text-xs font-medium">
                    {parent.firstName} {parent.lastName}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeParent(parentId)}
                    className="h-4 w-4 p-0 hover:bg-primary/20"
                  >
                    <X className="h-2 w-2" />
                  </Button>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Parent List */}
      <div className="border rounded-lg max-h-64 overflow-y-auto">
        {filteredParents.length === 0 && availableParents.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : filteredParents.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No parents match your search
          </div>
        ) : (
          <div className="divide-y">
            {filteredParents.map((parent) => (
              <div
                key={parent.id}
                className={cn(
                  "flex items-center space-x-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors",
                  selectedParentIds.includes(parent.id) &&
                    "bg-primary/5 border-l-2 border-l-primary"
                )}
                onClick={() => handleParentClick(parent.id)}
              >
                <div className="flex-shrink-0">
                  <div
                    className={cn(
                      "w-4 h-4 rounded border-2 flex items-center justify-center",
                      selectedParentIds.includes(parent.id)
                        ? "bg-primary border-primary"
                        : "border-muted-foreground/30"
                    )}
                  >
                    {selectedParentIds.includes(parent.id) && (
                      <Check className="h-3 w-3 text-primary-foreground" />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {parent.firstName} {parent.lastName}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
