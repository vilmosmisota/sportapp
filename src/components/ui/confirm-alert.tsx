import { Button } from "./button";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./alert-dialog";

type ConfirmAlertProps = {
  categoryId: string | number;
  text: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onConfirm: (categoryId: string) => void;
  buttonText?: string;
};

export const ConfirmDeleteDialog: React.FC<ConfirmAlertProps> = ({
  text,
  isOpen,
  setIsOpen,
  onConfirm,
  categoryId,
  buttonText = "Delete",
}) => {
  const handleConfirm = () => {
    onConfirm(categoryId.toString());
    setIsOpen(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            Are you absolutely sure?
          </AlertDialogTitle>
          <AlertDialogDescription>{text}</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            {buttonText}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};
