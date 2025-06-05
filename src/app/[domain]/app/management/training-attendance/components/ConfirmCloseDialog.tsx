import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Clock, UserCheck, Archive, Info } from "lucide-react";
import React from "react";

export interface ConfirmCloseDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onConfirm: () => void;
  isPending: boolean;
}

export function ConfirmCloseDialog({
  isOpen,
  setIsOpen,
  onConfirm,
  isPending,
}: ConfirmCloseDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Close Attendance Session</DialogTitle>
          <DialogDescription>
            This will close the current attendance session and perform the
            following actions:
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-start gap-4">
            <div className="bg-amber-100 dark:bg-amber-950 p-2 rounded-full">
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Attendance Aggregation</h4>
              <p className="text-sm text-muted-foreground">
                Attendance data will be summarized and stored permanently for
                reporting.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-blue-100 dark:bg-blue-950 p-2 rounded-full">
              <UserCheck className="h-4 w-4 text-blue-500" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Missing Check-ins</h4>
              <p className="text-sm text-muted-foreground">
                Players who haven&apos;t checked in will be marked as
                &quot;Absent&quot; automatically.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-red-100 dark:bg-red-950 p-2 rounded-full">
              <Archive className="h-4 w-4 text-red-500" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Data Cleanup</h4>
              <p className="text-sm text-muted-foreground">
                Individual check-in records will be removed to save storage
                space. You&apos;ll still have access to aggregated attendance
                statistics.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-green-100 dark:bg-green-950 p-2 rounded-full">
              <Info className="h-4 w-4 text-green-500" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Session Status</h4>
              <p className="text-sm text-muted-foreground">
                This operation cannot be undone. After closing, this session
                will no longer accept check-ins.
              </p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Closing...
              </>
            ) : (
              "Close Session"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
