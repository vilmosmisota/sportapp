"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Archive,
  CheckCircle,
  Database,
  Loader2,
  UserX,
  Users,
} from "lucide-react";

interface ConfirmCloseDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onConfirm: () => void;
  isPending: boolean;
  notCheckedInCount?: number;
  totalAttendees?: number;
  sessionDate?: string;
  sessionTime?: string;
}

export function ConfirmCloseDialog({
  isOpen,
  setIsOpen,
  onConfirm,
  isPending,
  notCheckedInCount = 0,
  totalAttendees = 0,
  sessionDate,
  sessionTime,
}: ConfirmCloseDialogProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20">
              <Archive className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <AlertDialogTitle className="text-lg font-semibold">
                Close Attendance Session
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-muted-foreground">
                {sessionDate && sessionTime && (
                  <>
                    {sessionDate} • {sessionTime}
                  </>
                )}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="space-y-4">
          {/* Session Summary */}
          <Card className="border-muted">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Total Attendees</span>
                </div>
                <Badge variant="secondary">{totalAttendees}</Badge>
              </div>

              {notCheckedInCount > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserX className="h-4 w-4 text-destructive" />
                    <span className="text-sm font-medium">Not Checked In</span>
                  </div>
                  <Badge variant="destructive">{notCheckedInCount}</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          <Separator />

          {/* What will happen */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              What will happen:
            </h4>

            <div className="space-y-2 text-sm text-muted-foreground">
              {notCheckedInCount > 0 && (
                <div className="flex items-start gap-2">
                  <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-destructive flex-shrink-0" />
                  <span>
                    <strong>{notCheckedInCount}</strong> member
                    {notCheckedInCount !== 1 ? "s" : ""} will be marked as{" "}
                    <strong>absent</strong>
                  </span>
                </div>
              )}

              <div className="flex items-start gap-2">
                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                <span>
                  All attendance data will be <strong>permanently saved</strong>{" "}
                  to the database
                </span>
              </div>

              <div className="flex items-start gap-2">
                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                <span>
                  Session statistics will be <strong>calculated</strong> and
                  stored for reporting
                </span>
              </div>

              <div className="flex items-start gap-2">
                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                <span>
                  The active session will be <strong>closed</strong> and cannot
                  be reopened
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <Database className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              This action cannot be undone. All data will be aggregated and the
              session permanently closed.
            </span>
          </div>
        </div>

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel asChild>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isPending}
            >
              Cancel
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              onClick={handleConfirm}
              disabled={isPending}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Closing Session...
                </>
              ) : (
                <>
                  <Archive className="h-4 w-4 mr-2" />
                  Close Session
                </>
              )}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
