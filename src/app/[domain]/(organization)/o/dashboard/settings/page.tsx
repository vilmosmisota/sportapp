"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Building2, ShieldCheck, Users2 } from "lucide-react";

export default function SettingsPage() {
  const settingsSections = [
    {
      title: "Organization",
      description:
        "Manage your organization's profile, team configuration, training locations, and game settings.",
      href: "/o/dashboard/settings/organization",
      icon: Building2,
    },
    {
      title: "Roles",
      description:
        "Configure roles and permissions for users in your organization.",
      href: "/o/dashboard/settings/roles",
      icon: ShieldCheck,
    },
    {
      title: "Users",
      description: "Manage staff and permissions within your organization.",
      href: "/o/dashboard/settings/users",
      icon: Users2,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {settingsSections.map((section) => (
        <Card key={section.title} className="flex flex-col">
          <CardHeader className="flex-row items-center gap-4">
            <div className="rounded-full p-2 bg-muted w-10 h-10 flex items-center justify-center">
              <section.icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>{section.title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <CardDescription className="text-sm">
              {section.description}
            </CardDescription>
          </CardContent>
          <CardFooter>
            <Button asChild variant="ghost" className="w-full justify-between">
              <Link href={section.href}>
                <span>Configure {section.title}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
