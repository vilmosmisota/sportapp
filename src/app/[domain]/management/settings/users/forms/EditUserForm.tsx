import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import FormButtons from "@/components/ui/form-buttons";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MemberGender, MemberType } from "@/entities/member/Member.schema";
import { getAgeFromDateOfBirth } from "@/entities/member/Member.utils";
import { useRolesByTenant } from "@/entities/role/Role.query";
import { useUpdateUser } from "@/entities/user/User.actions.client";
import {
  UpdateUser,
  UserMember,
  UserUpdateFormSchema,
} from "@/entities/user/User.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Crown, Heart, Info, Star, User, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type EditUserFormProps = {
  user: UserMember;
  tenantId: string;
  setIsParentModalOpen?: (value: boolean) => void;
};

// Enhanced form schema with age validation
const EditUserFormSchema = UserUpdateFormSchema.refine(
  (data) => {
    if (data.memberType === MemberType.Performer && data.dateOfBirth) {
      const age = getAgeFromDateOfBirth(data.dateOfBirth);
      return age >= 13;
    }
    return true;
  },
  {
    message:
      "Performers must be at least 13 years old to have an account. For younger performers, please use a parent account to manage their information.",
    path: ["dateOfBirth"],
  }
);

type EditUserForm = z.infer<typeof EditUserFormSchema>;

export default function EditUserForm({
  user,
  tenantId,
  setIsParentModalOpen,
}: EditUserFormProps) {
  const updateUser = useUpdateUser(user.id.toString(), tenantId);
  const { data: roles } = useRolesByTenant(Number(tenantId));

  const form = useForm<EditUserForm>({
    resolver: zodResolver(EditUserFormSchema),
    defaultValues: {
      email: user.user?.email ?? "",
      firstName: user.member?.firstName ?? "",
      lastName: user.member?.lastName ?? "",
      roleId: user.roleId ?? undefined,
      memberType: user.member?.memberType ?? undefined,
      dateOfBirth: user.member?.dateOfBirth ?? undefined,
      gender: user.member?.gender ?? undefined,
    },
  });

  const { handleSubmit, watch } = form;
  const { isDirty, isLoading } = form.formState;
  const memberType = watch("memberType");
  const dateOfBirth = watch("dateOfBirth");

  const currentAge = dateOfBirth ? getAgeFromDateOfBirth(dateOfBirth) : null;

  const handleMemberTypeChange = (selectedMemberType: MemberType) => {
    form.setValue("memberType", selectedMemberType, { shouldDirty: true });
  };

  const onSubmit = (data: EditUserForm) => {
    // Transform EditUserForm to UpdateUser
    const updateUserData: UpdateUser = {
      email: data.email,
      roleId: data.roleId,
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      memberType: data.memberType,
    };

    updateUser.mutate(
      { userData: updateUserData },
      {
        onSuccess: () => {
          toast.success("User updated successfully");
          setIsParentModalOpen?.(false);
        },
        onError: (error: Error) => {
          const errorMessage = error.message;

          if (errorMessage.includes("\n")) {
            const lines = errorMessage.split("\n");
            const mainMessage = lines[0];
            const details = lines.slice(1).join("\n");

            toast.error(mainMessage, {
              description: details,
              duration: 8000,
            });
          } else {
            toast.error(errorMessage);
          }
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
        className="flex flex-col gap-6 relative h-[calc(100vh-8rem)] md:h-auto"
        onSubmit={handleSubmit(onSubmit)}
      >
        {/* Member Type Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Member Type
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="memberType"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel>What type of member is this user?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) =>
                        handleMemberTypeChange(value as MemberType)
                      }
                      value={field.value}
                      className="grid grid-cols-1 gap-4"
                    >
                      <div>
                        <RadioGroupItem
                          value={MemberType.Manager}
                          id="manager"
                          className="peer sr-only"
                        />
                        <label
                          htmlFor="manager"
                          className="flex flex-col items-start justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <Crown className="h-5 w-5 text-amber-600" />
                            <p className="text-sm font-medium">Manager</p>
                          </div>
                          <p className="text-xs text-muted-foreground text-left">
                            Organization staff member with administrative access
                            and management responsibilities
                          </p>
                        </label>
                      </div>

                      <div>
                        <RadioGroupItem
                          value={MemberType.Guardian}
                          id="guardian"
                          className="peer sr-only"
                        />
                        <label
                          htmlFor="guardian"
                          className="flex flex-col items-start justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <Heart className="h-5 w-5 text-pink-600" />
                            <p className="text-sm font-medium">Guardian</p>
                          </div>
                          <p className="text-xs text-muted-foreground text-left">
                            Guardian of a performer who can manage their
                            child&apos;s information and activities
                          </p>
                        </label>
                      </div>

                      <div>
                        <RadioGroupItem
                          value={MemberType.Performer}
                          id="performer"
                          className="peer sr-only"
                        />
                        <label
                          htmlFor="performer"
                          className="flex flex-col items-start justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <Star className="h-5 w-5 text-blue-600" />
                            <p className="text-sm font-medium">Performer</p>
                          </div>
                          <p className="text-xs text-muted-foreground text-left">
                            Team participant who actively takes part in
                            activities (must be 13+ years old)
                          </p>
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Age limit info for performers */}
            {memberType === MemberType.Performer && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Performers must be at least 13 years old to have their own
                  account. For younger children, please create a parent account
                  instead.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Basic Information - shown after type is selected */}
        {memberType && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" />
                    </FormControl>
                    <FormDescription>
                      Changes to email will be reflected in the user&apos;s
                      login
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
                    <FormLabel>New Password (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Leave blank to keep current password"
                      />
                    </FormControl>
                    <FormDescription>
                      Only enter a new password if you want to change it
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Role Assignment for Management Types */}
        {memberType === MemberType.Manager && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Crown className="h-4 w-4" />
                Role Assignment
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full ml-2">
                  Recommended
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="roleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles?.map((role) => (
                          <SelectItem key={role.id} value={role.id.toString()}>
                            <div className="flex items-center gap-2">
                              {role.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      It&apos;s recommended to assign a role to management
                      members to define their permissions
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Additional Information for Performers */}
        {memberType === MemberType.Performer && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Star className="h-4 w-4" />
                Performer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    {currentAge !== null && (
                      <FormDescription>
                        Current age: {currentAge} years old
                        {currentAge < 13 && (
                          <span className="text-red-600 font-medium">
                            {" "}
                            - Too young for account
                          </span>
                        )}
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={MemberGender.Male}>Male</SelectItem>
                        <SelectItem value={MemberGender.Female}>
                          Female
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        <FormButtons
          buttonText="Save Changes"
          isLoading={isLoading}
          isDirty={isDirty}
          onCancel={onCancel}
        />
      </form>
    </Form>
  );
}
