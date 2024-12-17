"use client";

import { LucideIcon } from "lucide-react";

interface NavIconProps {
  icon: LucideIcon;
  className?: string;
}

export default function NavIcon({ icon: Icon, className }: NavIconProps) {
  return <Icon className={className} />;
}
