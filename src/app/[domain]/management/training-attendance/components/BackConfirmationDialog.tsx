import { useState } from "react";
import { useParams } from "next/navigation";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserLoginSchema } from "@/entities/user/User.schema";
import { z } from "zod";
import { getCurrentUser } from "@/entities/user/User.services";
import { logIn } from "@/entities/user/User.actions.client";
import { RolePermissions, RoleDomain } from "@/entities/role/Role.permissions";
import { UserRole } from "@/entities/role/Role.schema";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface BackConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function BackConfirmationDialog({
  isOpen,
  onOpenChange,
  onConfirm,
}: BackConfirmationDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const params = useParams();
  const client = useSupabase();
  const form = useForm<z.output<typeof UserLoginSchema>>({
    resolver: zodResolver(UserLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleConfirm = async (data: z.output<typeof UserLoginSchema>) => {
    try {
      setIsLoading(true);

      await logIn(data, params.domain as string);
      const result = await getCurrentUser(client);

      if (!result?.roles) {
        toast.error("You must be logged in to access this page");
        return;
      }

      // Convert user roles to UserRole type
      const userRoles = result.roles.map((role) => ({
        ...role,
        userId: result.id,
      })) as UserRole[];

      // Check if user has system role or management role with attendance permission
      const hasSystemRole = userRoles.some(
        (userRole) => userRole.role?.domain === RoleDomain.SYSTEM
      );
      const hasManagementAccess = RolePermissions.Attendance.manage(userRoles);

      if (!hasSystemRole && !hasManagementAccess) {
        toast.error("You do not have permission to access this page");
        return;
      }

      onConfirm();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Authentication failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Management Access Required</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(handleConfirm)}
          >
            <div className="py-2">
              <p className="text-muted-foreground mb-6">
                Please enter your management credentials to continue.
              </p>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Confirm"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
