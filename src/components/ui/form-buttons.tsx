import { Loader2 } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/libs/tailwind/utils";

type FormButtonsProps = {
  buttonText: string;
  isLoading?: boolean;
  isDirty?: boolean;
  onCancel?: () => void;
  onSubmit?: () => void;
  className?: string;
};

export default function FormButtons({
  buttonText,
  isLoading,
  isDirty,
  onCancel,
  onSubmit,
  className,
}: FormButtonsProps) {
  return (
    <div className={cn("flex gap-2 w-fit bg-inherit", className)}>
      <Button type="submit" className="min-w-[100px]" disabled={!isDirty}>
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          buttonText
        )}
      </Button>

      <Button
        type="button"
        className="min-w-[100px]"
        variant={"outline"}
        disabled={isLoading && !isDirty ? true : false}
        onClick={onCancel}
      >
        {isDirty ? "Cancel" : "Close"}
      </Button>
    </div>
  );
}
