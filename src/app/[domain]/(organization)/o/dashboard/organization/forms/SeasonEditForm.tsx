import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useUpdateSeason } from "@/entities/season/Season.actions.client";
import { Season, SeasonForm } from "@/entities/season/Season.schema";

import { cn } from "@/libs/tailwind/utils";
import { format } from "date-fns";
import { CalendarIcon, Edit2Icon, Loader2, Plus, XIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import MembershipFeeEditor from "./MembershipFeeEditor";
import BreaksEditor from "./BreaksEditor";
import { CurrencyTypes } from "@/entities/common/Types";

type SeasonEditFormProps = {
  season: Season;
  setSheetOpen: (open: boolean) => void;
  setIsParentModalOpen?: (value: boolean) => void;
  currency: CurrencyTypes;
};

export default function SeasonEditForm({
  season,
  setSheetOpen,
  setIsParentModalOpen,
  currency,
}: SeasonEditFormProps) {
  const seasonMutation = useUpdateSeason(
    season.id.toString(),
    season.tenantId.toString()
  );

  // Store initial values for comparison
  const [initialBreaks] = useState(
    season.breaks.map((br, index) => ({
      id: index + 1,
      from: br.from,
      to: br.to,
    }))
  );

  const [initialMembershipFees] = useState(
    season.membershipPrices.map((mf) => ({
      ...mf,
      membershipCategory: { ...mf.membershipCategory },
    }))
  );

  const [breaks, setBreaks] = useState(
    season.breaks.map((br, index) => ({
      id: index + 1,
      from: br.from,
      to: br.to,
    }))
  );

  const [membershipFees, setMembershipFees] = useState(
    season.membershipPrices.map((mf) => ({
      ...mf,
      membershipCategory: { ...mf.membershipCategory },
    }))
  );

  const form = useForm<SeasonForm>({
    defaultValues: {
      startDate: season.startDate,
      endDate: season.endDate,
      breaks: season.breaks,
    },
  });

  // Function to check if breaks or membership fees have changed
  const isComponentsDirty = () => {
    const breaksChanged =
      JSON.stringify(breaks) !== JSON.stringify(initialBreaks);
    const feesChanged =
      JSON.stringify(membershipFees) !== JSON.stringify(initialMembershipFees);
    return breaksChanged || feesChanged;
  };

  const { handleSubmit } = form;
  const { isDirty: isFormDirty, isLoading } = form.formState;

  // Combine form dirty state with components dirty state
  const isDirty = isFormDirty || isComponentsDirty();

  const onSubmit = (data: SeasonForm) => {
    // Format the membership prices according to the schema
    const formattedMembershipPrices = membershipFees.map((fee) => ({
      membershipCategoryId: fee.membershipCategoryId,
      price: fee.price,
    }));

    // Format the breaks according to the schema
    const formattedBreaks = breaks.map((breakItem) => ({
      from: breakItem.from,
      to: breakItem.to,
    }));

    const formData: SeasonForm = {
      startDate: data.startDate,
      endDate: data.endDate,
      breaks: formattedBreaks,
      membershipPrices: formattedMembershipPrices,
      customName: data.customName,
    };

    seasonMutation.mutate(formData, {
      onSuccess: () => {
        toast.success("Season updated");
        setSheetOpen(false);
        // Reset all form states
        form.reset();
        setBreaks(initialBreaks);
        setMembershipFees(initialMembershipFees);
      },
      onError: (error) => {
        toast.error("Failed to update season");
        console.error("Failed to update season:", error);
      },
    });
  };

  const onCancel = () => {
    setBreaks(initialBreaks);
    setMembershipFees(initialMembershipFees);
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
          {/* Season Period */}
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Season Period
              </h4>
            </div>

            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start date</FormLabel>
                    <Popover modal>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("w-full pl-3 text-left font-normal", {
                              "text-muted-foreground": !field.value,
                            })}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription></FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End date</FormLabel>
                    <Popover modal>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("w-full pl-3 text-left font-normal", {
                              "text-muted-foreground": !field.value,
                            })}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          defaultMonth={field.value || undefined}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription></FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Membership Fees */}
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Membership Fees
              </h4>
            </div>
            <MembershipFeeEditor
              tenantId={season.tenantId.toString()}
              initialMembershipFees={membershipFees}
              onUpdate={setMembershipFees}
              currency={currency}
            />
          </div>

          {/* Season Breaks */}
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Season Breaks
              </h4>
            </div>
            <BreaksEditor breaks={breaks} onUpdate={setBreaks} />
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
