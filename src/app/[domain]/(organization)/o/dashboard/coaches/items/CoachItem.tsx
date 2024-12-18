"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { Coach } from "@/entities/coach/Coach.schema";
import { MoreVertical, SquarePen, Trash2, Mail, Phone } from "lucide-react";
import { useState } from "react";
import EditCoachForm from "../forms/EditCoachForm";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteCoach } from "@/entities/coach/Coach.actions.client";
import { toast } from "sonner";

type CoachItemProps = {
  coach: Coach;
  tenantId: number;
};

export default function CoachItem({ coach, tenantId }: CoachItemProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const deleteCoach = useDeleteCoach(tenantId.toString());

  const handleDelete = () => {
    deleteCoach.mutate(coach.id.toString(), {
      onSuccess: () => {
        toast.success("Coach deleted successfully");
      },
      onError: () => {
        toast.error("Failed to delete coach");
      },
    });
  };

  return (
    <>
      <ResponsiveSheet
        isOpen={isEditOpen && !isDropdownOpen}
        setIsOpen={setIsEditOpen}
        title="Edit Coach"
      >
        <EditCoachForm
          coach={coach}
          tenantId={tenantId.toString()}
          setIsParentModalOpen={setIsEditOpen}
        />
      </ResponsiveSheet>

      <Card>
        <CardHeader className="bg-secondary rounded-t-lg">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base font-medium">
              {coach.name}
            </CardTitle>
            <DropdownMenu onOpenChange={setIsDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0 data-[state=open]:bg-gray-200"
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuItem className="group flex w-full items-center justify-between text-left p-0 text-sm font-medium text-neutral-700">
                  <button
                    onClick={() => setIsEditOpen(true)}
                    className="w-full justify-start items-center gap-2 flex rounded-md p-2 transition-all duration-75 hover:bg-gray-100"
                  >
                    <SquarePen className="h-4 w-4" />
                    Edit
                  </button>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="group flex w-full items-center justify-between text-left p-0 text-sm font-medium text-neutral-700">
                  <button
                    onClick={handleDelete}
                    className="w-full justify-start items-center gap-2 flex text-red-500 rounded-md p-2 transition-all duration-75 hover:bg-gray-100"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 mt-3">
          {coach.email && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              {coach.email}
            </div>
          )}
          {coach.phone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              {coach.phone}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
} 