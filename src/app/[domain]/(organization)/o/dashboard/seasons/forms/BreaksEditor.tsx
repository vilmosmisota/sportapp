import React, { useState, Dispatch, SetStateAction } from "react";
import { format, addDays, isAfter } from "date-fns";
import { toast } from "sonner";

import { DatePicker } from "@/components/ui/date-picker/DatePicker";
import { Plus, Edit2, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

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
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const handleAddBreak = () => {
    setEditingBreak(null);
    setStartDate(undefined);
    setEndDate(undefined);
    setIsDialogOpen(true);
  };

  const handleEditBreak = (br: Break) => {
    setEditingBreak(br);
    setStartDate(br.from);
    setEndDate(br.to);
    setIsDialogOpen(true);
  };

  const handleRemoveBreak = (breakId: number) => {
    onUpdate((prevBreaks) => prevBreaks.filter((br) => br.id !== breakId));
  };

  const handleSave = () => {
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

    setIsDialogOpen(false);
    setEditingBreak(null);
    setStartDate(undefined);
    setEndDate(undefined);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-base">Season Breaks</CardTitle>
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
        </CardHeader>
        <CardContent>
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
                      {format(br.from, "dd LLL y")} -{" "}
                      {format(br.to, "dd LLL y")}
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
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingBreak ? "Edit Break" : "Add New Break"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Start Date</Label>
              <DatePicker
                value={startDate}
                onChange={setStartDate}
                fromDate={minDate}
                toDate={maxDate}
              />
            </div>
            <div className="grid gap-2">
              <Label>End Date</Label>
              <DatePicker
                value={endDate}
                onChange={setEndDate}
                fromDate={minDate}
                toDate={maxDate}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              type="button"
            >
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
