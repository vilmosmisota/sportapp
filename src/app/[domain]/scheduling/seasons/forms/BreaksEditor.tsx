import { addDays, format, isAfter } from "date-fns";
import { Dispatch, SetStateAction, useCallback, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DateRange } from "@/components/ui/date-range";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit2, Plus, X } from "lucide-react";

type Break = {
  id: number;
  from: Date;
  to: Date;
};

type BreaksEditorProps = {
  breaks: Break[];
  onUpdate: Dispatch<SetStateAction<Break[]>>;
  minDate: Date;
  maxDate: Date;
  disabledDates?: Date[];
};

const BreaksEditor = ({
  breaks,
  onUpdate,
  minDate = new Date(),
  maxDate = new Date(),
  disabledDates = [],
}: BreaksEditorProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBreak, setEditingBreak] = useState<Break | null>(null);

  // Use refs for initial date values to avoid re-renders
  const initialStartDateRef = useRef<Date | undefined>();
  const initialEndDateRef = useRef<Date | undefined>();

  // State for current editing values
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  // Flag to track internal updates
  const isUpdatingDates = useRef(false);

  // Handler for adding a new break
  const handleAddBreak = useCallback(() => {
    setEditingBreak(null);

    // Set initial values without triggering renders
    initialStartDateRef.current = new Date(minDate);
    initialEndDateRef.current = addDays(new Date(minDate), 1);

    // Update state once
    setStartDate(initialStartDateRef.current);
    setEndDate(initialEndDateRef.current);

    setIsDialogOpen(true);
  }, [minDate]);

  // Handler for editing an existing break
  const handleEditBreak = useCallback((br: Break) => {
    setEditingBreak(br);

    // Set initial values without triggering renders
    initialStartDateRef.current = new Date(br.from);
    initialEndDateRef.current = new Date(br.to);

    // Update state once
    setStartDate(initialStartDateRef.current);
    setEndDate(initialEndDateRef.current);

    setIsDialogOpen(true);
  }, []);

  // Handler for removing a break
  const handleRemoveBreak = useCallback(
    (breakId: number) => {
      onUpdate((prevBreaks) => prevBreaks.filter((br) => br.id !== breakId));
    },
    [onUpdate]
  );

  // Handler for start date changes
  const handleStartDateChange = useCallback(
    (date: Date | undefined) => {
      if (!date || isUpdatingDates.current) return;

      isUpdatingDates.current = true;
      try {
        const newDate = new Date(date);
        setStartDate(newDate);

        // Only adjust end date if necessary
        if (
          endDate &&
          (isAfter(newDate, endDate) || newDate.getTime() === endDate.getTime())
        ) {
          const nextDay = addDays(newDate, 1);
          setEndDate(nextDay);
        }
      } finally {
        // Use setTimeout to ensure state updates have been processed
        setTimeout(() => {
          isUpdatingDates.current = false;
        }, 0);
      }
    },
    [endDate]
  );

  // Handler for end date changes
  const handleEndDateChange = useCallback((date: Date | undefined) => {
    if (!date || isUpdatingDates.current) return;
    setEndDate(date);
  }, []);

  // Handler for saving a break
  const handleSave = useCallback(() => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    if (isAfter(startDate, endDate)) {
      toast.error("Start date must be before end date");
      return;
    }

    if (startDate < minDate || endDate > maxDate) {
      toast.error("Break period must be within the season dates");
      return;
    }

    if (editingBreak) {
      onUpdate((prevBreaks) =>
        prevBreaks.map((br) =>
          br.id === editingBreak.id
            ? { ...br, from: startDate, to: endDate }
            : br
        )
      );
    } else {
      const newBreak: Break = {
        id: Date.now(),
        from: startDate,
        to: endDate,
      };
      onUpdate((prevBreaks) => [...prevBreaks, newBreak]);
    }

    // Close and reset
    setIsDialogOpen(false);
    setEditingBreak(null);
    setStartDate(undefined);
    setEndDate(undefined);
    initialStartDateRef.current = undefined;
    initialEndDateRef.current = undefined;
  }, [startDate, endDate, editingBreak, minDate, maxDate, onUpdate]);

  // Handler for closing dialog
  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    setEditingBreak(null);
    setStartDate(undefined);
    setEndDate(undefined);
    initialStartDateRef.current = undefined;
    initialEndDateRef.current = undefined;
  }, []);

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-muted-foreground">
          Add breaks during the season when no activities will take place
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddBreak}
          className="gap-2"
          type="button"
        >
          <Plus className="h-4 w-4" />
          Add Break
        </Button>
      </div>

      <ScrollArea className="h-[220px] rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date Range</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead className="w-[150px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {breaks.map((br) => (
              <TableRow key={br.id}>
                <TableCell>
                  <span className="font-medium">
                    {format(br.from, "dd LLL y")} - {format(br.to, "dd LLL y")}
                  </span>
                </TableCell>
                <TableCell>
                  {Math.ceil(
                    (br.to.getTime() - br.from.getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}{" "}
                  days
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleEditBreak(br)}
                    type="button"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveBreak(br.id)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {breaks.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center h-24 text-muted-foreground"
                >
                  No breaks added yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>

      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-[95vw] md:min-w-[800px] md:max-w-[80vw]">
          <DialogHeader>
            <DialogTitle>
              {editingBreak ? "Edit Break" : "Add New Break"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 overflow-y-auto max-h-[70vh]">
            {startDate && endDate && (
              <DateRange
                key={`date-range-${isDialogOpen ? "open" : "closed"}-${
                  editingBreak?.id || "new"
                }`}
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={handleStartDateChange}
                onEndDateChange={handleEndDateChange}
                showDuration={true}
                horizontal={true}
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} type="button">
              Cancel
            </Button>
            <Button onClick={handleSave} type="button">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BreaksEditor;
