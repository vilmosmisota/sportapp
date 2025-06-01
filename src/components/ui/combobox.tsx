"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";

import { cn } from "@/libs/tailwind/utils";
import { CommandList } from "cmdk";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export type ComboboxProps = {
  label: string;
  list: {
    value: string;
    label: string;
  }[];
  onSelect: (id: string) => void;
  width?: string;
  placeholder?: string;
  emptyMessage?: string;
};

export function Combobox({
  list,
  onSelect,
  label,
  width,
  placeholder = "Search...",
  emptyMessage = "No items found.",
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`${width ? width : "w-[200px]"} justify-between`}
        >
          {value
            ? list.find((listItem) => listItem.value === value)?.label
            : label}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={`${width ? width : "w-[200px]"} p-0`}>
        <Command>
          <CommandInput placeholder={placeholder} className="h-9" />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {list.map((listItem) => (
                <CommandItem
                  key={listItem.value}
                  value={listItem.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    onSelect(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === listItem.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {listItem.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
