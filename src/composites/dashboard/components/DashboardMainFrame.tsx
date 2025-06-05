import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import React from "react";

interface DashboardMainFrameProps {
  children: React.ReactNode;
  isCollapsed?: boolean;
}

function DecorativeCorner({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <div
      className={cn(
        "fixed right-0 top-4 z-30 h-8 w-[140px] overflow-hidden transition-all duration-300 ease-in-out hidden md:block",
        isCollapsed
          ? "opacity-0 translate-x-8 pointer-events-none"
          : "opacity-100"
      )}
      style={{ clipPath: "inset(0px 0px 0px 0px)" }}
    >
      {/* Background layer */}
      <div
        className="absolute inset-0 bg-sidebar"
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
            stroke="hsl(var(--primary-200))"
            strokeWidth="1"
            fill="none"
            vectorEffect="non-scaling-stroke"
          />
          <line
            x1="18"
            y1="32"
            x2="120"
            y2="32"
            stroke="hsl(var(--primary-200))"
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
        "flex-1 transition-all duration-300 ease-in-out relative pt-4",
        "pl-0 bg-card",
        !isCollapsed && "md:bg-sidebar lg:pl-72"
      )}
    >
      <DecorativeCorner isCollapsed={isCollapsed} />

      <div
        className={cn(
          "h-[calc(100dvh-1rem)] flex flex-col bg-card relative shadow-md transition-all duration-300",
          "rounded-none border-0",
          !isCollapsed &&
            "md:rounded-tl-lg md:border-l md:border-t md:border-primary-100"
        )}
      >
        <ScrollArea className="h-full">
          <main className="pb-6 pt-12 h-full">
            <div className="px-4">{children}</div>
          </main>
        </ScrollArea>
      </div>
    </div>
  );
}
