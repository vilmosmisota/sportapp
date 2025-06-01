import { Loader2 } from "lucide-react";
import { Button } from "./button";

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
    <div className="bg-white sticky h-[100px] flex gap-3 items-center justify-end bottom-0 left-0 right-0 border-t">
      <Button
        type="submit"
        className="min-w-[100px]"
        disabled={!isDirty || isLoading}
      >
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
        disabled={isLoading}
        onClick={onCancel}
      >
        {isDirty ? "Cancel" : "Close"}
      </Button>
    </div>
  );
}
