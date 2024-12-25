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
import { useAddMembershipCategory } from "@/entities/membership-category/MembershipCategory.actions.client";
import {
  MembershipCategory,
  MembershipCategoryForm,
  MembershipCategoryFormSchema,
} from "@/entities/membership-category/MembershipCategory.schema";

import { useAddPlayerFeeCategory } from "@/entities/player-fee-category/PlayerFeeCategory.actions.client";
import {
  CurrencyTypes,
  PlayerFeeCategoryForm,
  PlayerFeeCategoryFormSchema,
} from "@/entities/player-fee-category/PlayerFeeCategory.schema";

import { zodResolver } from "@hookform/resolvers/zod";
import { set } from "date-fns";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type AddMembershipCategoryProps = {
  tenantId: string;
  setIsParentModalOpen?: (boolean: boolean) => void;
};

export default function AddMembershipCategoryForm({
  tenantId,
  setIsParentModalOpen,
}: AddMembershipCategoryProps) {
  const addFeeCategory = useAddMembershipCategory(tenantId);

  const form = useForm<MembershipCategory>({
    resolver: zodResolver(MembershipCategoryFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const { handleSubmit } = form;
  const { isDirty, isLoading } = form.formState;

  const onSubmit = (data: MembershipCategoryForm) => {
    addFeeCategory.mutate(data, {
      onSuccess: () => {
        toast.success("Category added successfully");
        setIsParentModalOpen?.(false);
        form.reset();
      },
      onError: () => {
        toast.error("Failed to add category");
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

        <div className="bg-background sticky h-[100px] w-full bottom-0 left-0 right-0 border-t flex justify-end pt-3">
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
