"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { MemberWithRelations } from "@/entities/member/Member.schema";
import { useAvailableUsers } from "@/entities/user/hooks/useAvailableUsers";
import { Info, Search, UserPlus, UserX } from "lucide-react";
import { useEffect, useState } from "react";

type EditUserAccountTabProps = {
  tenantId: string;
  singularDisplayName: string;
  memberAge: number | null;
  member: MemberWithRelations;
  onUserDataChange?: (userData: {
    userId?: string;
    connectToUser: boolean;
    disconnectUser: boolean;
  }) => void;
};

export default function EditUserAccountTab({
  tenantId,
  singularDisplayName,
  memberAge,
  member,
  onUserDataChange,
}: EditUserAccountTabProps) {
  const [connectToUser, setConnectToUser] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [disconnectUser, setDisconnectUser] = useState(false);

  const isEligibleForAccount = memberAge !== null && memberAge >= 13;
  const hasExistingUser = !!member.users;

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

  // Initialize state based on existing user connection
  useEffect(() => {
    if (hasExistingUser) {
      setConnectToUser(false);
      setDisconnectUser(false);
    }
  }, [hasExistingUser]);

  // Handle user connection changes
  const handleUserDataChange = (
    userId: string,
    connect: boolean,
    disconnect: boolean
  ) => {
    setSelectedUserId(userId);
    onUserDataChange?.({
      userId: userId || undefined,
      connectToUser: connect,
      disconnectUser: disconnect,
    });
  };

  const handleConnectToUserToggle = (checked: boolean) => {
    setConnectToUser(checked);
    if (!checked) {
      // Clear user data when unchecked
      handleUserDataChange("", false, false);
    } else {
      handleUserDataChange(selectedUserId, true, false);
    }
  };

  const handleDisconnectUserToggle = (checked: boolean) => {
    setDisconnectUser(checked);
    handleUserDataChange("", false, checked);
  };

  const handleUserSelect = (userId: string) => {
    handleUserDataChange(userId, true, false);
  };

  return (
    <Card className={!isEligibleForAccount ? "opacity-50" : ""}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          User Account Management
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

        {/* Current User Account Status */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasUserAccount"
              checked={hasExistingUser}
              disabled={true}
            />
            <label
              htmlFor="hasUserAccount"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {hasExistingUser
                ? `This ${singularDisplayName.toLowerCase()} has a user account`
                : `No user account connected`}
            </label>
          </div>

          {/* Show existing user account details */}
          {hasExistingUser && isEligibleForAccount && (
            <div className="space-y-4 border-l-2 border-green-200 pl-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  This {singularDisplayName.toLowerCase()} has an existing user
                  account.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Email Address</label>
                  <Input
                    type="email"
                    value={member.users?.email || ""}
                    readOnly
                    className="mt-1"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    This email is used for login and system notifications
                  </p>
                </div>

                <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
                  <Info className="h-4 w-4 inline mr-2" />
                  User account exists. Password changes must be done through the
                  user management system.
                </div>
              </div>

              {/* Option to disconnect user */}
              <div className="pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="disconnectUser"
                    checked={disconnectUser}
                    onCheckedChange={handleDisconnectUserToggle}
                  />
                  <label
                    htmlFor="disconnectUser"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-red-600"
                  >
                    <UserX className="h-4 w-4 inline mr-1" />
                    Disconnect user account from this{" "}
                    {singularDisplayName.toLowerCase()}
                  </label>
                </div>
                {disconnectUser && (
                  <Alert className="mt-2">
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-red-600">
                      This will remove the connection between the user account
                      and this {singularDisplayName.toLowerCase()}. The user
                      account will remain in the system but won&apos;t be
                      associated with this member profile.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          )}

          {/* Option to connect to a new user account */}
          {!hasExistingUser && isEligibleForAccount && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="connectToUser"
                  checked={connectToUser}
                  onCheckedChange={handleConnectToUserToggle}
                />
                <label
                  htmlFor="connectToUser"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Connect this {singularDisplayName.toLowerCase()} to an
                  existing user account
                </label>
              </div>

              {connectToUser && (
                <div className="space-y-4 border-l-2 border-primary/20 pl-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      This will connect the {singularDisplayName.toLowerCase()}{" "}
                      to an existing user account in the system.
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
                          placeholder="Search by email..."
                          emptyMessage="No available users found."
                        />
                      ) : (
                        <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
                          No available users found. All users already have
                          member profiles.
                        </div>
                      )}

                      <p className="text-sm text-muted-foreground mt-1">
                        Only users without an existing member profile can be
                        selected
                      </p>
                    </div>

                    <div className="text-sm text-muted-foreground p-3 bg-blue-50 rounded-lg">
                      <Info className="h-4 w-4 inline mr-2" />
                      The selected user will be able to log in and access
                      features as this {singularDisplayName.toLowerCase()}.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* No user account and not eligible */}
          {!hasExistingUser && !connectToUser && isEligibleForAccount && (
            <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
              No user account connected. The {singularDisplayName.toLowerCase()}{" "}
              can be managed through parent accounts or connected to a user
              account.
            </div>
          )}

          {!isEligibleForAccount && memberAge !== null && (
            <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
              User account management is not available for{" "}
              {singularDisplayName.toLowerCase()}s under 13 years old.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
