import * as React from "react";
import { Check, Filter } from "lucide-react";
import { cn } from "@/libs/tailwind/utils";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Badge } from "./badge";
import { ScrollArea } from "./scroll-area";
import { Separator } from "./separator";

export interface FilterGroup {
  title: string;
  options: {
    label: string;
    value: string;
    disabled?: boolean;
    count?: number;
  }[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
}

interface MultiSelectFiltersProps {
  groups: FilterGroup[];
  className?: string;
}

export function MultiSelectFilters({
  groups,
  className,
}: MultiSelectFiltersProps) {
  const totalSelected = groups.reduce(
    (acc, group) => acc + group.selectedValues.length,
    0
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-auto w-[240px]",
            totalSelected > 0 && "border-primary",
            className
          )}
        >
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {totalSelected > 0 && (
            <Badge
              variant="secondary"
              className="ml-2 rounded-sm px-1 font-normal"
            >
              {totalSelected}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[calc(100vw-2rem)] md:w-auto md:min-w-[600px] p-2 md:p-4"
        align="start"
        side="bottom"
        sideOffset={8}
      >
        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x">
          {groups.map((group, groupIndex) => (
            <div
              key={group.title}
              className="flex-1 py-2 first:pt-0 last:pb-0 md:py-0 md:px-4 first:md:pl-0 last:md:pr-0"
            >
              <h4 className="font-medium leading-none text-sm mb-2">
                {group.title}
              </h4>
              <ScrollArea className="h-[200px]">
                <div className="space-y-1">
                  {group.options.map((option) => {
                    const isSelected = group.selectedValues.includes(
                      option.value
                    );
                    return (
                      <Button
                        key={option.value}
                        variant="ghost"
                        size="sm"
                        disabled={option.disabled}
                        className={cn(
                          "w-full justify-start font-normal h-8 rounded-none px-1",
                          isSelected && "bg-accent",
                          option.disabled && "opacity-50 cursor-not-allowed"
                        )}
                        onClick={() => {
                          if (option.disabled) return;
                          const newValues = isSelected
                            ? group.selectedValues.filter(
                                (v) => v !== option.value
                              )
                            : [...group.selectedValues, option.value];
                          group.onSelectionChange(newValues);
                        }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center">
                            <div
                              className={cn(
                                "mr-2 flex h-3.5 w-3.5 items-center justify-center rounded-sm border border-primary",
                                isSelected
                                  ? "bg-primary text-primary-foreground"
                                  : "opacity-50 [&_svg]:invisible",
                                option.disabled && "opacity-30"
                              )}
                            >
                              <Check className={cn("h-3 w-3")} />
                            </div>
                            <span className="truncate text-sm">
                              {option.label}
                            </span>
                          </div>
                          {typeof option.count === "number" && (
                            <span
                              className={cn(
                                "ml-2 text-xs text-muted-foreground flex-shrink-0",
                                option.disabled && "opacity-50"
                              )}
                            >
                              {option.count}
                            </span>
                          )}
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
