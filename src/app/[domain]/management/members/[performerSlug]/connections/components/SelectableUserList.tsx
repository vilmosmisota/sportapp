"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useUsers } from "@/entities/user/User.query";
import { cn } from "@/lib/utils";
import { AlertCircle, Check, Search, X } from "lucide-react";
import { useState } from "react";

interface SelectableUserListProps {
  tenantId: string;
  selectedUserId?: string;
  onUserSelect: (userId: string | undefined) => void;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
  excludeLinkedUsers?: boolean;
}

export default function SelectableUserList({
  tenantId,
  selectedUserId,
  onUserSelect,
  placeholder = "Search users...",
  emptyMessage = "No users found",
  className,
  excludeLinkedUsers = true,
}: SelectableUserListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: users = [], isLoading, error } = useUsers(tenantId);

  const availableUsers = excludeLinkedUsers
    ? users.filter((user) => !user.member)
    : users;

  const filteredUsers = availableUsers.filter(
    (user) =>
      user.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ??
      false
  );

  const handleUserClick = (userId: string) => {
    if (selectedUserId === userId) {
      onUserSelect(undefined);
    } else {
      onUserSelect(userId);
    }
  };

  const clearSelection = () => {
    onUserSelect(undefined);
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Skeleton className="h-10 w-full pl-10" />
        </div>

        <div className="border rounded-lg">
          <div className="divide-y">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3">
                <Skeleton className="w-4 h-4 rounded" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center space-x-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <span className="text-sm text-destructive">
            Error loading users: {error.message}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {selectedUserId && (
        <div className="flex items-center justify-between p-3 bg-primary/10 border border-primary/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <Check className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              Selected:{" "}
              {availableUsers.find((u) => u.userId === selectedUserId)?.user
                ?.email || "No email"}
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearSelection}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      <div className="border rounded-lg max-h-64 overflow-y-auto">
        {filteredUsers.length === 0 && availableUsers.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No users match your search
          </div>
        ) : (
          <div className="divide-y">
            <div
              className={cn(
                "flex items-center space-x-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors",
                !selectedUserId && "bg-primary/5 border-l-2 border-l-primary"
              )}
              onClick={() => onUserSelect(undefined)}
            >
              <div className="flex-shrink-0">
                <div
                  className={cn(
                    "w-4 h-4 rounded border-2 flex items-center justify-center",
                    !selectedUserId
                      ? "bg-primary border-primary"
                      : "border-muted-foreground/30"
                  )}
                >
                  {!selectedUserId && (
                    <Check className="h-3 w-3 text-primary-foreground" />
                  )}
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground italic">
                  No user account
                </p>
              </div>
            </div>

            {filteredUsers.map((user) => (
              <div
                key={user.userId}
                className={cn(
                  "flex items-center space-x-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors",
                  selectedUserId === user.userId &&
                    "bg-primary/5 border-l-2 border-l-primary"
                )}
                onClick={() => handleUserClick(user.userId)}
              >
                <div className="flex-shrink-0">
                  <div
                    className={cn(
                      "w-4 h-4 rounded border-2 flex items-center justify-center",
                      selectedUserId === user.userId
                        ? "bg-primary border-primary"
                        : "border-muted-foreground/30"
                    )}
                  >
                    {selectedUserId === user.userId && (
                      <Check className="h-3 w-3 text-primary-foreground" />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {user.user?.email || "No email"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
