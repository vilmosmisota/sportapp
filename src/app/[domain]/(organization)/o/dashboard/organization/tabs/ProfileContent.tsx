import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tenant } from "@/entities/tenant/Tenant.schema";
import { Edit2Icon, MoreVertical, SquarePen } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

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

      <div className="w-full grid grid-cols-2 gap-5">
        <Card>
          <CardHeader className="bg-secondary rounded-t-lg ">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                {tenant.logo && (
                  <Avatar>
                    <AvatarImage src={tenant.logo} />
                  </Avatar>
                )}
                <CardTitle className="text-base">{tenant.name}</CardTitle>
              </div>

              <div>
                <Button
                  variant={"ghost"}
                  className="rounded-full"
                  size={"icon"}
                  type="button"
                  onClick={() => setIsEditOpen(!isEditOpen)}
                >
                  <SquarePen className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="text-muted-foreground">
                    Domain
                  </TableCell>
                  <TableCell className="text-right">{tenant.domain}</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="text-muted-foreground">Email</TableCell>
                  <TableCell className="text-right">
                    {tenant.email || "N/A"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-muted-foreground">
                    Phone Number
                  </TableCell>
                  <TableCell className="text-right">
                    {tenant.phoneNumber || "N/A"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-muted-foreground">Sport</TableCell>
                  <TableCell className="text-right">{tenant.sport}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-muted-foreground">
                    Location
                  </TableCell>
                  <TableCell className="text-right">
                    {tenant.location || "N/A"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-muted-foreground">
                    Membership currency
                  </TableCell>
                  <TableCell className="text-right">
                    {tenant.membershipCurrency || "N/A"}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
