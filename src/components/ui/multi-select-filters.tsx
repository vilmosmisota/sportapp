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
            "h-auto min-w-28",
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
      <PopoverContent className="w-[80vw] max-w-3xl p-4" align="start">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          {groups.map((group, groupIndex) => (
            <React.Fragment key={group.title}>
              <div className="flex-1 space-y-4">
                <h4 className="font-medium leading-none">{group.title}</h4>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
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
                            "w-full justify-start font-normal",
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
                                  "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                  isSelected
                                    ? "bg-primary text-primary-foreground"
                                    : "opacity-50 [&_svg]:invisible",
                                  option.disabled && "opacity-30"
                                )}
                              >
                                <Check className={cn("h-4 w-4")} />
                              </div>
                              {option.label}
                            </div>
                            {typeof option.count === "number" && (
                              <span
                                className={cn(
                                  "text-xs text-muted-foreground ml-2",
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
              {groupIndex < groups.length - 1 && (
                <Separator orientation="vertical" className="hidden md:block" />
              )}
              {groupIndex < groups.length - 1 && (
                <Separator className="block md:hidden" />
              )}
            </React.Fragment>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
