import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

const sections = [
  {
    title: "Organization Management",
    description: "Manage your organization's core settings and user access",
    features: [
      {
        name: "Organization Settings",
        description: "Configure organization details and preferences",
      },
      {
        name: "Role Management",
        description: "Define user roles and permissions",
      },
      {
        name: "User Management",
        description: "Manage staff members and their access levels",
      },
    ],
  },
  {
    title: "Team Management",
    description: "Organize and manage your teams and players",
    features: [
      { name: "Seasons", description: "Plan and organize seasonal programs" },
      { name: "Teams", description: "Create and manage team rosters" },
      { name: "Players", description: "Track player profiles and development" },
    ],
  },
  {
    title: "Training & Development",
    description: "Track and improve player performance",
    features: [
      {
        name: "Training Sessions",
        description: "Schedule and plan training activities",
      },
      {
        name: "Attendance Tracking",
        description: "Monitor player participation",
      },
      {
        name: "Performance Analytics",
        description: "View attendance statistics and reports",
      },
    ],
  },
  {
    title: "Competition",
    description: "Manage competitive aspects",
    features: [
      {
        name: "Opponent Database",
        description: "Keep track of competing teams",
      },
      {
        name: "Game Management",
        description: "Coming soon: Schedule and manage matches",
      },
      {
        name: "Statistics",
        description: "Coming soon: Track game performance metrics",
      },
    ],
  },
];

export default function OrgDashboardPage({
  params,
}: {
  params: { domain: string };
}) {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Organization Dashboard
        </h1>
        <p className="text-muted-foreground text-sm">
          Welcome to your organization&apos;s command center. Here&apos;s what
          you can manage:
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((section) => (
          <Card key={section.title} className="p-6">
            <div className="space-y-1 mb-4">
              <h2 className="text-lg font-semibold">{section.title}</h2>
              <p className="text-sm text-muted-foreground">
                {section.description}
              </p>
            </div>
            <div className="space-y-4">
              {section.features.map((feature) => (
                <div key={feature.name} className="flex gap-3">
                  <Check className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium leading-none">
                      {feature.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
