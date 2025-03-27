import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import FormButtons from "@/components/ui/form-buttons";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAddUser } from "@/entities/user/User.actions.client";
import { UserForm, UserFormSchema } from "@/entities/user/User.schema";
import { RoleDomain } from "@/entities/role/Role.permissions";
import { useRolesByTenant } from "@/entities/role/Role.query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type AddUserFormProps = {
  tenantId: string;
  setIsParentModalOpen?: (value: boolean) => void;
};

export default function AddUserForm({
  tenantId,
  setIsParentModalOpen,
}: AddUserFormProps) {
  const addUser = useAddUser(tenantId);
  const { data: roles } = useRolesByTenant(Number(tenantId));

  const form = useForm<UserForm>({
    resolver: zodResolver(UserFormSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      roleIds: [],
    },
  });

  const { handleSubmit } = form;
  const { isDirty, isLoading } = form.formState;

  const onSubmit = (data: UserForm) => {
    addUser.mutate(
      { userData: data },
      {
        onSuccess: () => {
          toast.success("User added successfully");
          setIsParentModalOpen?.(false);
          form.reset();
        },
        onError: () => {
          toast.error("Failed to add user");
        },
      }
    );
  };

  const onCancel = () => {
    form.reset();
    setIsParentModalOpen?.(false);
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-6 relative"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Personal Information
              </h4>
            </div>

            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Account Information */}
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Account Information
              </h4>
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" />
                  </FormControl>
                  <FormDescription>
                    User will receive an email to set their password
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Temporary Password</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" />
                  </FormControl>
                  <FormDescription>
                    User should change this password after first login
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Roles */}
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Roles & Permissions
              </h4>
            </div>

            <FormField
              control={form.control}
              name="roleIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange([parseInt(value)])}
                    value={field.value?.[0]?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roles?.map((role) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="bg-background sticky h-[100px] flex items-center justify-end bottom-0 left-0 right-0 border-t">
          <FormButtons
            buttonText="Add"
            isLoading={isLoading}
            isDirty={isDirty}
            onCancel={onCancel}
          />
        </div>
      </form>
    </Form>
  );
}
