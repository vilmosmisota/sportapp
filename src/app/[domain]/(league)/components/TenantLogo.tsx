"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export async function TenantLogo({
  logoUrl,
  name,
}: {
  logoUrl?: string | null;
  name?: string | null;
}) {
  return (
    <div className=" text-center mr-5">
      <Avatar>
        <AvatarImage src={logoUrl ? logoUrl : ""} />
        <AvatarFallback>{name ? name.slice(0, 2) : "N/A"}</AvatarFallback>
      </Avatar>
    </div>
  );
}
