import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/libs/utils";
import { Check } from "lucide-react";
import * as React from "react";

// Color palette with both pastel and vibrant options
const COLOR_PALETTE = [
  // Vibrant colors (400 level)
  { name: "Red", tailwind: "bg-red-400", hex: "#F87171" },
  { name: "Orange", tailwind: "bg-orange-400", hex: "#FB923C" }, // Default color
  { name: "Amber", tailwind: "bg-amber-400", hex: "#FBBF24" },
  { name: "Yellow", tailwind: "bg-yellow-400", hex: "#FACC15" },
  { name: "Lime", tailwind: "bg-lime-400", hex: "#A3E635" },
  { name: "Green", tailwind: "bg-green-400", hex: "#4ADE80" },
  { name: "Emerald", tailwind: "bg-emerald-400", hex: "#34D399" },
  { name: "Teal", tailwind: "bg-teal-400", hex: "#2DD4BF" },
  { name: "Cyan", tailwind: "bg-cyan-400", hex: "#22D3EE" },
  { name: "Sky", tailwind: "bg-sky-400", hex: "#38BDF8" },
  { name: "Blue", tailwind: "bg-blue-400", hex: "#60A5FA" },
  { name: "Indigo", tailwind: "bg-indigo-400", hex: "#818CF8" },
  { name: "Violet", tailwind: "bg-violet-400", hex: "#A78BFA" },
  { name: "Purple", tailwind: "bg-purple-400", hex: "#C084FC" },
  { name: "Fuchsia", tailwind: "bg-fuchsia-400", hex: "#E879F9" },
  { name: "Pink", tailwind: "bg-pink-400", hex: "#F472B6" },
  { name: "Rose", tailwind: "bg-rose-400", hex: "#FB7185" },
  // Pastel colors (200 level)
  { name: "Light Red", tailwind: "bg-red-200", hex: "#FECACA" },
  { name: "Light Orange", tailwind: "bg-orange-200", hex: "#FED7AA" },
  { name: "Light Blue", tailwind: "bg-blue-200", hex: "#BFDBFE" },
  { name: "Light Green", tailwind: "bg-green-200", hex: "#BBF7D0" },
  { name: "Light Purple", tailwind: "bg-purple-200", hex: "#E9D5FF" },
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
      <PopoverContent className="w-72 p-3">
        <div className="grid grid-cols-6 gap-2">
          {COLOR_PALETTE.map((color) => (
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
