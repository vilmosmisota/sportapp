"use client";

import { cn } from "@/libs/tailwind/utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

export interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  description: string;
}

interface HorizontalNavSublayoutProps {
  navItems: NavItem[];
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
}

export default function HorizontalNavSublayout({
  navItems,
  children,
  backHref,
  backLabel = "Back",
}: HorizontalNavSublayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="w-full space-y-6">
      {/* Back Button */}
      <div className="mb-2">
        {backHref ? (
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{backLabel}</span>
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{backLabel}</span>
          </button>
        )}
      </div>
      {/* Horizontal Navigation */}
      <div className="border-b border-border">
        <nav className="flex space-x-8 overflow-x-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-2 py-4 px-1 text-sm font-medium transition-all duration-200 border-b-2 whitespace-nowrap",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50"
                )}
                aria-label={item.description}
              >
                <span
                  className={cn(
                    "transition-colors duration-200",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                >
                  {item.icon}
                </span>
                <span className="capitalize">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      {/* Main Content */}
      <div className="w-full">{children}</div>
    </div>
  );
}
