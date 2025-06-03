"use client";

import { Loader2 } from "lucide-react";

export default function AccessLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}
