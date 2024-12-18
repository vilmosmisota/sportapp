import { Loader2 } from "lucide-react";
import { Button } from "./button";

type FormButtonsProps = {
  buttonText: string;
  isLoading?: boolean;
  isDirty?: boolean;
  onCancel?: () => void;
  onSubmit?: () => void;
};
export default function FormButtons({
  buttonText,
  isLoading,
  isDirty,
  onCancel,
  onSubmit,
}: FormButtonsProps) {
  return (
    <div className="flex gap-3 w-fit">
      <Button type="submit" className="w-full" disabled={!isDirty}>
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          buttonText
        )}
      </Button>

      <Button
        type="button"
        className="w-full"
        variant={"outline"}
        disabled={isLoading && !isDirty ? true : false}
        onClick={onCancel}
      >
        {isDirty ? "Cancel" : "Close"}
      </Button>
    </div>
  );
}