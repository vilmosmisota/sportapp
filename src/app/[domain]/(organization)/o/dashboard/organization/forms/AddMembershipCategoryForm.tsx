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
        className="flex flex-col gap-4 md:gap-6 relative h-[calc(100vh-8rem)] md:h-auto"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex-1 space-y-4 md:space-y-6 overflow-y-auto px-4 md:px-0">
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Category Details
              </h4>
            </div>

            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-base">Name</FormLabel>
                    <FormControl>
                      <Input {...field} type="text" className="h-11" />
                    </FormControl>
                    <FormDescription className="text-xs md:text-sm">
                      The name of the membership category
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-base">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Enter category description"
                        className="min-h-[120px] md:min-h-[100px] text-base"
                      />
                    </FormControl>
                    <FormDescription className="text-xs md:text-sm">
                      Additional details about this membership category
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className="bg-background sticky bottom-0 left-0 right-0 p-4 md:pt-3 border-t mt-auto">
          <FormButtons
            buttonText="Add"
            isLoading={isLoading}
            isDirty={isDirty}
            onCancel={onCancel}
            className="w-full md:w-auto"
          />
        </div>
      </form>
    </Form>
  );
}
