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
import {
  useCreateOpponent,
  useUpdateOpponent,
} from "@/entities/opponent/Opponent.actions";
import {
  Opponent,
  OpponentFormSchema,
  type OpponentForm,
} from "@/entities/opponent/Opponent.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

interface OpponentFormProps {
  tenantId: string;
  opponent?: Opponent;
  setIsOpen: (value: boolean) => void;
}

export default function OpponentForm({
  tenantId,
  opponent,
  setIsOpen,
}: OpponentFormProps) {
  const createOpponent = useCreateOpponent(tenantId);
  const updateOpponent = useUpdateOpponent(opponent?.id ?? 0, tenantId);

  const form = useForm<OpponentForm>({
    resolver: zodResolver(OpponentFormSchema),
    defaultValues: opponent
      ? {
          name: opponent.name ?? "",
          location: opponent.location,
          tenantId: Number(tenantId),
        }
      : {
          name: "",
          location: null,
          tenantId: Number(tenantId),
        },
  });

  const { handleSubmit, watch } = form;
  const { isDirty, isLoading } = form.formState;
  const hasLocation = watch("location") !== null;

  const onSubmit = (data: OpponentForm) => {
    if (opponent) {
      updateOpponent.mutate(data, {
        onSuccess: () => {
          toast.success("Opponent updated successfully");
          form.reset();
          setIsOpen(false);
        },
        onError: () => {
          toast.error("Failed to update opponent");
        },
      });
    } else {
      createOpponent.mutate(data, {
        onSuccess: () => {
          toast.success("Opponent added successfully");
          form.reset();
          setIsOpen(false);
        },
        onError: () => {
          toast.error("Failed to add opponent");
        },
      });
    }
  };

  const onCancel = () => {
    form.reset();
    setIsOpen(false);
  };

  const toggleLocation = (checked: boolean) => {
    if (checked) {
      form.setValue("location", {
        id: "",
        name: "",
        postcode: "",
        streetAddress: "",
        city: "",
      });
    } else {
      form.setValue("location", null);
    }
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-6 relative"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Basic Information
              </h4>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter opponent name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <div className="border-b pb-2 flex items-center justify-between">
              <h4 className="text-sm font-medium text-muted-foreground">
                Location Information
              </h4>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={hasLocation}
                  onCheckedChange={toggleLocation}
                />
                <span className="text-sm text-muted-foreground">
                  Add Location
                </span>
              </div>
            </div>

            {hasLocation && (
              <>
                <FormField
                  control={form.control}
                  name="location.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter location name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location.streetAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter street address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="location.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter city" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location.postcode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postcode</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter postcode" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="location.mapLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Map Link (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter map link" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>
        </div>

        <div className="bg-background sticky h-[100px] flex items-center justify-end bottom-0 left-0 right-0 border-t">
          <FormButtons
            buttonText={opponent ? "Update" : "Add"}
            isLoading={isLoading}
            isDirty={isDirty}
            onCancel={onCancel}
          />
        </div>
      </form>
    </Form>
  );
}
