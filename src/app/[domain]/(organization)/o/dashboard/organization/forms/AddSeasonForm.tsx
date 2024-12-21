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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAddSeason } from "@/entities/season/Season.actions.client";
import { SeasonForm } from "@/entities/season/Season.schema";
import { cn } from "@/libs/tailwind/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import MembershipFeeEditor from "./MembershipFeeEditor";
import BreaksEditor from "./BreaksEditor";
import { CurrencyTypes } from "@/entities/common/Types";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

type AddSeasonFormProps = {
  tenantId: string;
  setSheetOpen: (open: boolean) => void;
  setIsParentModalOpen?: (value: boolean) => void;
  currency: CurrencyTypes;
};

const formSchema = z.object({
  startDate: z.date(),
  endDate: z.date().refine(
    (date) => date > new Date(),
    "End date must be in the future"
  ),
  customName: z.string().optional(),
}).refine(
  (data) => data.endDate > data.startDate,
  {
    message: "End date must be after start date",
    path: ["endDate"]
  }
);

const validateBreaks = (breaks: { from: Date; to: Date }[], startDate: Date, endDate: Date) => {
  const errors: string[] = [];

  breaks.forEach((breakPeriod, index) => {
    if (breakPeriod.from < startDate || breakPeriod.from > endDate) {
      errors.push(`Break ${index + 1}: Start date must be within season period`);
    }
    if (breakPeriod.to < startDate || breakPeriod.to > endDate) {
      errors.push(`Break ${index + 1}: End date must be within season period`);
    }
    if (breakPeriod.to <= breakPeriod.from) {
      errors.push(`Break ${index + 1}: End date must be after start date`);
    }
  });

  return errors;
};

export default function AddSeasonForm({
  tenantId,
  setSheetOpen,
  setIsParentModalOpen,
  currency,
}: AddSeasonFormProps) {
  const seasonMutation = useAddSeason(tenantId);
  const [breaks, setBreaks] = useState<{ id: number; from: Date; to: Date }[]>(
    []
  );
  const [membershipFees, setMembershipFees] = useState<any[]>([]);

  const form = useForm<SeasonForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startDate: new Date(),
      endDate: new Date(),
      breaks: [],
      membershipPrices: [],
    },
  });

  const { handleSubmit } = form;
  const { isDirty, isLoading } = form.formState;

  const onSubmit = (data: SeasonForm) => {
    // Validate breaks
    const breakValidationErrors = validateBreaks(breaks, data.startDate, data.endDate);
    
    if (breakValidationErrors.length > 0) {
      breakValidationErrors.forEach((error) => {
        toast.error(error);
      });
      return;
    }

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
        toast.success("Season created successfully");
        setSheetOpen(false);
        form.reset();
      },
      onError: (error) => {
        toast.error("Failed to create season");
        console.error("Failed to create season:", error);
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
                        />
                      </PopoverContent>
                    </Popover>
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
              tenantId={tenantId}
              initialMembershipFees={[]}
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
            <BreaksEditor 
              breaks={breaks} 
              onUpdate={setBreaks}
              minDate={form.watch("startDate")}
              maxDate={form.watch("endDate")}
            />
          </div>
        </div>

        <div className="bg-white sticky h-[100px] flex items-center justify-end bottom-0 left-0 right-0 border-t">
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
