"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

type GroupAssignmentTabProps = {
  singularDisplayName: string;
};

export default function GroupAssignmentTab({
  singularDisplayName,
}: GroupAssignmentTabProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Users className="h-4 w-4" />
          Group Assignment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">Group Assignment</p>
          <p className="text-sm">
            Group assignment functionality will be implemented here.
          </p>
          <p className="text-sm mt-2">
            This will allow you to assign the{" "}
            {singularDisplayName.toLowerCase()} to specific groups.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
