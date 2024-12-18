import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import FormButtons from "@/components/ui/form-buttons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateUser } from "@/entities/user/User.actions.client";
import {
  User,
  UserForm,
  UserFormSchema,
  UserRole,
} from "@/entities/user/User.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

type EditUserFormProps = {
  user: User;
  tenantId: string;
  setIsParentModalOpen?: (value: boolean) => void;
};

export default function EditUserForm({
  user,
  tenantId,
  setIsParentModalOpen,
}: EditUserFormProps) {
  const entityIds = user.entities?.map((entity) => entity.id) ?? [];
  const updateUser = useUpdateUser(user.id, entityIds, tenantId);

  const form = useForm<UserForm>({
    resolver: zodResolver(UserFormSchema),
    defaultValues: {
      email: user.email ?? "",
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      entities: user.entities?.map((entity) => ({
        role: entity.role,
        entityName: entity.entityName ?? "",
        clubId: entity.clubId ?? undefined,
        divisionId: entity.divisionId ?? undefined,
        teamId: entity.teamId ?? undefined,
      })) ?? [{ role: UserRole.PLAYER, entityName: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "entities",
    control: form.control,
  });

  const { handleSubmit } = form;
  const { isDirty, isLoading } = form.formState;

  const onSubmit = (data: UserForm) => {
    updateUser.mutate(
      { userData: data },
      {
        onSuccess: () => {
          toast.success("User updated successfully");
          setIsParentModalOpen?.(false);
          form.reset();
        },
        onError: () => {
          toast.error("Failed to update user");
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
        className="flex flex-col gap-4 relative"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="space-y-4">
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

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} type="email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <FormLabel>Roles</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({ role: UserRole.PLAYER, entityName: "" })
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Role
              </Button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-4 items-start">
                <div className="flex-1">
                  <FormField
                    control={form.control}
                    name={`entities.${index}.role`}
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(UserRole).map((role) => (
                              <SelectItem key={role} value={role}>
                                <span className="capitalize">
                                  {role.replace("-", " ")}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white sticky h-[100px] flex items-center justify-end bottom-0 left-0 right-0 border-t">
          <FormButtons
            buttonText="Save"
            isLoading={isLoading}
            isDirty={isDirty}
            onCancel={onCancel}
          />
        </div>
      </form>
    </Form>
  );
}
