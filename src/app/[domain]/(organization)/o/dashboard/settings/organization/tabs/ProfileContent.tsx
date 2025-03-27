import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tenant } from "@/entities/tenant/Tenant.schema";
import { Edit2Icon, MoreVertical, SquarePen } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import OrgEditForm from "../forms/OrgEditForm";
import { useState } from "react";

type ProfileContentProps = {
  tenant?: Tenant;
};

export default function ProfileContent({ tenant }: ProfileContentProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  if (!tenant) {
    return null;
  }

  return (
    <>
      <ResponsiveSheet
        isOpen={isEditOpen}
        setIsOpen={setIsEditOpen}
        title="Edit Season"
      >
        <OrgEditForm
          tenant={tenant}
          setSheetOpen={setIsEditOpen}
          setIsParentModalOpen={setIsEditOpen}
        />
      </ResponsiveSheet>

      <div className="w-full md:max-w-3xl">
        <Card>
          <CardHeader className="bg-secondary/50 rounded-t-lg">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                {tenant.logo && (
                  <Avatar className="h-12 w-12 border-2 border-background">
                    <AvatarImage src={tenant.logo} />
                  </Avatar>
                )}
                <CardTitle className="text-base font-semibold">
                  {tenant.name}
                </CardTitle>
              </div>

              <div>
                <Button
                  variant={"ghost"}
                  className="rounded-full hover:bg-background/80"
                  size={"icon"}
                  type="button"
                  onClick={() => setIsEditOpen(!isEditOpen)}
                >
                  <SquarePen className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="space-y-6">
              <div>
                <div className="pb-4">
                  <h3 className="font-semibold text-sm text-foreground">
                    Basic Information
                  </h3>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-muted-foreground">Domain</span>
                  <span className="text-sm font-medium">{tenant.domain}</span>
                </div>
              </div>

              <div>
                <div className="pb-4">
                  <h3 className="font-semibold text-sm text-foreground">
                    Contact Information
                  </h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-muted-foreground">Email</span>
                    <span className="text-sm font-medium">
                      {tenant.email || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-muted-foreground">
                      Phone Number
                    </span>
                    <span className="text-sm font-medium">
                      {tenant.phoneNumber || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-muted-foreground">
                      Location
                    </span>
                    <span className="text-sm font-medium">
                      {tenant.location || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div className="pb-4">
                  <h3 className="font-semibold text-sm text-foreground">
                    Sport & Currency
                  </h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-muted-foreground">Sport</span>
                    <span className="text-sm font-medium">{tenant.sport}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
