"use client";

import { useParams, useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Key } from "lucide-react";

export default function AttendanceSessionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const isAddPinRoute = pathname.includes("/add-pin");

  return (
    <div className="w-screen h-screen bg-background absolute top-0 left-0 flex flex-col">
      {/* Navigation */}
      <div className="flex justify-between items-center border-b border-border px-4 h-14 shrink-0">
        <Button
          variant="ghost"
          className="p-2"
          onClick={() => router.push("/o/dashboard/attendance")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() =>
            isAddPinRoute
              ? router.push(`/o/dashboard/attendance/${params.id}`)
              : router.push(`/o/dashboard/attendance/${params.id}/add-pin`)
          }
        >
          <Key className="h-4 w-4" />
          {isAddPinRoute ? "Check In" : "Create PIN"}
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
