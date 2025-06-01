"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useParents } from "@/entities/member/Member.query";
import { Heart, UserPlus } from "lucide-react";

type ParentAssignmentTabProps = {
  tenantId: string;
  memberAge: number | null;
  singularDisplayName: string;
  selectedParents: number[];
  onParentToggle: (parentId: number) => void;
};

export default function ParentAssignmentTab({
  tenantId,
  memberAge,
  singularDisplayName,
  selectedParents,
  onParentToggle,
}: ParentAssignmentTabProps) {
  const { data: parents } = useParents(tenantId);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Heart className="h-4 w-4" />
          Parent Assignment
          {memberAge !== null && memberAge < 13 && (
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full ml-2">
              Recommended
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {memberAge !== null && memberAge < 13 && (
          <Alert className="mb-4">
            <UserPlus className="h-4 w-4" />
            <AlertDescription>
              This {singularDisplayName.toLowerCase()} is {memberAge} years old.
              Assigning them to a parent will help with communication and
              management.
            </AlertDescription>
          </Alert>
        )}

        {parents && parents.length > 0 ? (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Select parent(s) to assign this{" "}
              {singularDisplayName.toLowerCase()} to:
            </div>
            <div className="space-y-3">
              {parents.map((parent) => (
                <div
                  key={parent.id}
                  className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50"
                >
                  <Checkbox
                    id={`parent-${parent.id}`}
                    checked={selectedParents.includes(parent.id)}
                    onCheckedChange={() => onParentToggle(parent.id)}
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={`parent-${parent.id}`}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {parent.firstName} {parent.lastName}
                    </label>
                    {parent.users?.email && (
                      <div className="text-xs text-muted-foreground">
                        {parent.users.email}
                      </div>
                    )}
                  </div>
                  <UserPlus className="h-4 w-4 text-blue-600" />
                </div>
              ))}
            </div>
            {selectedParents.length > 0 && (
              <div className="text-sm text-green-600">
                {selectedParents.length} parent(s) selected
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">
              No Parents Available
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              No parent members found in this organization. You can add parents
              later or create parent accounts first.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
