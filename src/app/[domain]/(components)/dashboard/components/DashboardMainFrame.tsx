import { ScrollArea } from "../../../../../components/ui/scroll-area";
import { cn } from "../../../../../lib/utils";
import React from "react";

interface DashboardMainFrameProps {
  children: React.ReactNode;
  isCollapsed?: boolean;
}

function DecorativeCorner() {
  return (
    <div
      className="fixed right-0 top-4 z-30 h-8 w-[140px] overflow-hidden"
      style={{ clipPath: "inset(0px 0px 0px 0px)" }}
    >
      {/* Background layer */}
      <div
        className="absolute inset-0"
        style={{
          transform: "skewX(30deg)",
          transformOrigin: "top left",
          clipPath:
            "path('M0,0c6,0,10.7,4.7,10.7,10.7v10.7c0,5.9,4.8,10.7,10.7,10.7H140V0')",
        }}
      />

      {/* Border layer */}
      <div
        className="pointer-events-none absolute top-0 z-10 h-full w-full origin-top transition-all"
        style={{
          transform: "skewX(30deg)",
          transformOrigin: "top left",
        }}
      >
        <svg
          className="absolute h-full w-full"
          viewBox="0 0 140 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,0c6,0,10.7,4.7,10.7,10.7v10.7c0,5.9,4.8,10.7,10.7,10.7H140V0"
            stroke="hsl(var(--primary) / 0.1)"
            strokeWidth="1"
            fill="none"
            vectorEffect="non-scaling-stroke"
          />
          <line
            x1="18"
            y1="32"
            x2="120"
            y2="32"
            stroke="hsl(var(--primary) / 0.1)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </div>
  );
}

export function DashboardMainFrame({
  children,
  isCollapsed = false,
}: DashboardMainFrameProps) {
  return (
    <div
      className={cn(
        "flex-1 transition-all duration-300 relative pt-4",
        isCollapsed ? "lg:pl-16" : "lg:pl-72"
      )}
    >
      <DecorativeCorner />

      <div className="h-[calc(100dvh-1rem)] flex flex-col bg-white relative border-l border-t border-primary/10 rounded-tl-lg ">
        <ScrollArea className="h-full">
          <main className="pb-6 pt-12 h-full">
            <div className="px-4">{children}</div>
          </main>
        </ScrollArea>
      </div>
    </div>
  );
}
