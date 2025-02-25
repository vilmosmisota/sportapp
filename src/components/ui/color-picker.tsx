import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/libs/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Pastel color palette with their hex values
const PASTEL_COLORS = [
  { name: "Red", tailwind: "bg-red-200", hex: "#FEC8C8" },
  { name: "Orange", tailwind: "bg-orange-200", hex: "#FED7AA" },
  { name: "Amber", tailwind: "bg-amber-200", hex: "#FDE68A" },
  { name: "Yellow", tailwind: "bg-yellow-200", hex: "#FEF08A" },
  { name: "Lime", tailwind: "bg-lime-200", hex: "#D9F99D" },
  { name: "Green", tailwind: "bg-green-200", hex: "#BBF7D0" },
  { name: "Emerald", tailwind: "bg-emerald-200", hex: "#A7F3D0" },
  { name: "Teal", tailwind: "bg-teal-200", hex: "#99F6E4" },
  { name: "Cyan", tailwind: "bg-cyan-200", hex: "#A5F3FC" },
  { name: "Sky", tailwind: "bg-sky-200", hex: "#BAE6FD" },
  { name: "Blue", tailwind: "bg-blue-200", hex: "#BFDBFE" },
  { name: "Indigo", tailwind: "bg-indigo-200", hex: "#C7D2FE" },
  { name: "Violet", tailwind: "bg-violet-200", hex: "#DDD6FE" },
  { name: "Purple", tailwind: "bg-purple-200", hex: "#E9D5FF" },
  { name: "Fuchsia", tailwind: "bg-fuchsia-200", hex: "#F5D0FE" },
  { name: "Pink", tailwind: "bg-pink-200", hex: "#FBCFE8" },
  { name: "Rose", tailwind: "bg-rose-200", hex: "#FECDD3" },
];

interface ColorPickerProps {
  value?: string;
  onChange?: (value: string | undefined) => void;
  className?: string;
}

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedColor, setSelectedColor] = React.useState<string | undefined>(
    value
  );

  const handleColorSelect = (hex: string | undefined) => {
    setSelectedColor(hex);
    onChange?.(hex);
    setOpen(false);
  };

  const handleClearColor = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleColorSelect(undefined);
  };

  return (
    <Popover modal open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "w-10 h-10 rounded-md border border-input relative group",
            className
          )}
          style={{ backgroundColor: value }}
          aria-label="Pick a color"
        >
          {value && (
            <div
              className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-destructive/10 hover:bg-destructive/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleClearColor}
            >
              <span className="text-[10px] text-destructive font-medium">
                ×
              </span>
            </div>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3">
        <div className="grid grid-cols-5 gap-2">
          {PASTEL_COLORS.map((color) => (
            <button
              key={color.hex}
              className={cn(
                "w-8 h-8 rounded-md border border-input relative",
                "hover:scale-110 transition-transform",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              )}
              style={{ backgroundColor: color.hex }}
              onClick={() => handleColorSelect(color.hex)}
              title={color.name}
            >
              {value === color.hex && (
                <Check
                  className="absolute inset-0 m-auto text-primary-foreground"
                  size={16}
                />
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
