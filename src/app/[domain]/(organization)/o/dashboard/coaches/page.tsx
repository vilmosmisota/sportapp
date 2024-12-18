"use client";

import { useCoaches } from "@/entities/coach/Coach.query";
import { useTenantByDomain } from "@/entities/tenant/Tenant.query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";

import CoachItem from "./items/CoachItem";
import AddCoachForm from "./forms/AddCoachForm";

export default function CoachesPage({
  params,
}: {
  params: { domain: string };
}) {
  const { data: tenant } = useTenantByDomain(params.domain);
  const {
    data: coaches,
    error,
    isPending,
  } = useCoaches(tenant?.id.toString() ?? "");

  const [isAddCoachOpen, setIsAddCoachOpen] = useState(false);

  if (error) {
    return <div>{error.message}</div>;
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-3">
        <h3 className="text-lg">Coaches</h3>
        <Button
          size="icon"
          variant="outline"
          className="rounded-full"
          onClick={() => setIsAddCoachOpen(true)}
          type="button"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {coaches?.length === 0 ? (
          <Card className="border-dashed shadow-none col-span-2">
            <CardHeader>
              <CardTitle className="text-base">No coaches found</CardTitle>
            </CardHeader>
          </Card>
        ) : (
          coaches?.map((coach) => (
            <CoachItem
              key={coach.id}
              coach={coach}
              tenantId={tenant?.id ?? 0}
            />
          ))
        )}
      </div>

      <ResponsiveSheet
        isOpen={isAddCoachOpen}
        setIsOpen={setIsAddCoachOpen}
        title="Add coach"
      >
        <AddCoachForm
          tenantId={tenant?.id.toString() ?? ""}
          setIsParentModalOpen={setIsAddCoachOpen}
        />
      </ResponsiveSheet>
    </div>
  );
}
