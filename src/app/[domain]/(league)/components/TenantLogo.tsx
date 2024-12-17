import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export async function TenantLogo({ logoUrl }: { logoUrl: string | null }) {
  return (
    <div className=" text-center mr-5">
      <Avatar>
        <AvatarImage src={logoUrl ? logoUrl : ""} />
        <AvatarFallback>LWPC</AvatarFallback>
      </Avatar>
    </div>
  );
}
