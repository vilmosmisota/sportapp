"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersRound } from "lucide-react";

type EditGroupAssignmentTabProps = {
  singularDisplayName: string;
};

export default function EditGroupAssignmentTab({
  singularDisplayName,
}: EditGroupAssignmentTabProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <UsersRound className="h-4 w-4" />
          Group Assignment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <UsersRound className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">
            Group Assignment
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            Group assignment functionality will be implemented here.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
