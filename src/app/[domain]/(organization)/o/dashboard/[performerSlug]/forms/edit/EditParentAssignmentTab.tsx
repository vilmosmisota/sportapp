"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useParents } from "@/entities/member/Member.query";
import { Heart, Info, Users } from "lucide-react";

type EditParentAssignmentTabProps = {
  tenantId: string;
  memberAge: number | null;
  singularDisplayName: string;
  selectedParents: number[];
  onParentToggle: (parentId: number) => void;
};

export default function EditParentAssignmentTab({
  tenantId,
  memberAge,
  singularDisplayName,
  selectedParents,
  onParentToggle,
}: EditParentAssignmentTabProps) {
  const { data: parents = [], isLoading: isLoadingParents } =
    useParents(tenantId);

  const isRecommended = memberAge !== null && memberAge < 13;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Heart className="h-4 w-4" />
          Parent Assignment
          {isRecommended && (
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full ml-2">
              Recommended
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isRecommended && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This {singularDisplayName.toLowerCase()} is under 13 years old. We
              recommend assigning them to a parent or guardian for account
              management.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-3">
              Select Parent(s) for this {singularDisplayName}
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              Parents can manage this {singularDisplayName.toLowerCase()}&apos;s
              account and receive notifications about their activities.
            </p>
          </div>

          {isLoadingParents ? (
            <div className="text-sm text-muted-foreground">
              Loading parents...
            </div>
          ) : parents.length > 0 ? (
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
                      <p className="text-xs text-muted-foreground">
                        {parent.users.email}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">
                No Parents Available
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                No parent members found in your organization. Create parent
                members first to assign them to this{" "}
                {singularDisplayName.toLowerCase()}.
              </p>
            </div>
          )}

          {selectedParents.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <Info className="h-4 w-4 inline mr-1" />
                {selectedParents.length} parent(s) selected. They will be able
                to manage this {singularDisplayName.toLowerCase()}&apos;s
                account and receive notifications.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
