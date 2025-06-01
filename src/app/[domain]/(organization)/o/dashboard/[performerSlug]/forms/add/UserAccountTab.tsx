"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox } from "@/components/ui/combobox";
import { useAvailableUsers } from "@/entities/user/hooks/useAvailableUsers";
import { Info, Search, UserPlus } from "lucide-react";
import { useState } from "react";

type UserAccountTabProps = {
  tenantId: string;
  singularDisplayName: string;
  memberAge: number | null;
  onUserDataChange?: (userData: {
    userId?: string;
    connectToUser: boolean;
  }) => void;
};

export default function UserAccountTab({
  tenantId,
  singularDisplayName,
  memberAge,
  onUserDataChange,
}: UserAccountTabProps) {
  const [connectToUser, setConnectToUser] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  const isEligibleForAccount = memberAge !== null && memberAge >= 13;

  // Fetch available users (users without existing member profiles)
  const { data: availableUsers = [], isLoading: isLoadingUsers } =
    useAvailableUsers(tenantId);

  // Transform users for combobox
  const userOptions = availableUsers
    .filter((user) => user.email) // Filter out users without email
    .map((user) => ({
      value: user.id,
      label: user.email!,
    }));

  // Handle user connection changes
  const handleUserConnectionChange = (userId: string, connect: boolean) => {
    setSelectedUserId(userId);
    onUserDataChange?.({ userId: userId || undefined, connectToUser: connect });
  };

  const handleConnectToUserToggle = (checked: boolean) => {
    setConnectToUser(checked);
    if (!checked) {
      // Clear user data when unchecked
      handleUserConnectionChange("", false);
    } else {
      handleUserConnectionChange(selectedUserId, true);
    }
  };

  const handleUserSelect = (userId: string) => {
    handleUserConnectionChange(userId, true);
  };

  return (
    <Card className={!isEligibleForAccount ? "opacity-50" : ""}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          User Account Connection
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-2">
            Optional
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isEligibleForAccount && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              {memberAge === null
                ? "Enter a date of birth to see user account options."
                : `${singularDisplayName}s under 13 years old cannot have their own user accounts. They can be managed through parent accounts instead.`}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center space-x-2">
          <Checkbox
            id="connectToUser"
            checked={connectToUser}
            onCheckedChange={handleConnectToUserToggle}
            disabled={!isEligibleForAccount}
          />
          <label
            htmlFor="connectToUser"
            className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
              !isEligibleForAccount ? "text-muted-foreground" : ""
            }`}
          >
            Connect this {singularDisplayName.toLowerCase()} to an existing user
            account
          </label>
        </div>

        {connectToUser && isEligibleForAccount && (
          <div className="space-y-4 border-l-2 border-primary/20 pl-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                This will connect the {singularDisplayName.toLowerCase()} to an
                existing user account in the system.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                  <Search className="h-4 w-4" />
                  Select Existing User Account *
                </label>

                {isLoadingUsers ? (
                  <div className="text-sm text-muted-foreground">
                    Loading users...
                  </div>
                ) : userOptions.length > 0 ? (
                  <Combobox
                    label="Search and select a user account..."
                    list={userOptions}
                    onSelect={handleUserSelect}
                    width="w-full"
                    placeholder="Search by name or email..."
                    emptyMessage="No available users found."
                  />
                ) : (
                  <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
                    No available users found. All users already have member
                    profiles.
                  </div>
                )}

                <p className="text-sm text-muted-foreground mt-1">
                  Only users without an existing member profile can be selected
                </p>
              </div>

              <div className="text-sm text-muted-foreground p-3 bg-blue-50 rounded-lg">
                <Info className="h-4 w-4 inline mr-2" />
                The selected user will be able to log in and access features as
                this {singularDisplayName.toLowerCase()}.
              </div>
            </div>
          </div>
        )}

        {!connectToUser && (
          <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
            No user account will be connected. The{" "}
            {singularDisplayName.toLowerCase()} can be managed through parent
            accounts or connected to a user account later.
          </div>
        )}

        {!isEligibleForAccount && memberAge !== null && (
          <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
            User account connection is not available for{" "}
            {singularDisplayName.toLowerCase()}s under 13 years old.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
