import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateMembershipCategory } from "@/entities/membership-category/MembershipCategory.actions.client";
import {
  MembershipCategory,
  MembershipCategoryForm,
  MembershipCategoryFormSchema,
} from "@/entities/membership-category/MembershipCategory.schema";
import {
  useAddPlayerFeeCategory,
  useUpdatePlayerFeeCategory,
} from "@/entities/player-fee-category/PlayerFeeCategory.actions.client";
import {
  CurrencyTypes,
  PlayerFeeCategory,
  PlayerFeeCategoryForm,
  PlayerFeeCategoryFormSchema,
} from "@/entities/player-fee-category/PlayerFeeCategory.schema";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type EditMembershipCategoryFormProps = {
  category: MembershipCategory;
  tenantId: string;
  setIsParentModalOpen?: (value: boolean) => void;
};

export default function EditMembershipCategoryForm({
  tenantId,
  category,
  setIsParentModalOpen,
}: EditMembershipCategoryFormProps) {
  const updateFeeCategory = useUpdateMembershipCategory(
    category.id.toString(),
    tenantId
  );

  const form = useForm<MembershipCategoryForm>({
    resolver: zodResolver(MembershipCategoryFormSchema),
    defaultValues: {
      name: category.name,
      description: category.description,
    },
  });

  const { handleSubmit } = form;
  const { isDirty, isLoading } = form.formState;

  const onSubmit = (data: MembershipCategoryForm) => {
    updateFeeCategory.mutate(data, {
      onSuccess: (updatedCategory) => {
        toast.success("Category updated successfully");

        form.reset({
          name: updatedCategory.name,
          description: updatedCategory.description,
        });

        setIsParentModalOpen?.(false);
      },
      onError: () => {
        toast.error("Failed to updated category");
      },
    });
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
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Category Details
              </h4>
            </div>

            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} type="text" />
                    </FormControl>
                    <FormDescription>
                      The name of the membership category
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Enter category description"
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormDescription>
                      Additional details about this membership category
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className="bg-background sticky h-[100px] flex items-center justify-end bottom-0 left-0 right-0 border-t">
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
