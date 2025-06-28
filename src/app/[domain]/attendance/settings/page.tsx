"use client";

import { PageHeader } from "@/components/ui/page-header";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTenantAndUserAccessContext } from "@/composites/auth/TenantAndUserAccessContext";
import AttendanceConfigContent from "./tabs/AttendanceConfigContent";

export default function AttendanceSettingsPage() {
  const { tenant } = useTenantAndUserAccessContext();

  return (
    <div className="w-full">
      <PageHeader
        title="Attendance settings"
        description="Configure attendance tracking, check-in methods, and kiosk settings"
      />
      <div className="px-0">
        <Tabs defaultValue="configuration" className="w-full">
          <div className="w-[calc(100vw-2rem)] md:w-fit">
            <ScrollArea className="">
              <TabsList className="mb-3 w-full inline-flex h-10 items-center justify-start rounded-md p-1 text-muted-foreground">
                <TabsTrigger value="configuration" className="text-sm">
                  Configuration
                </TabsTrigger>
                <TabsTrigger value="kiosk" className="text-sm" disabled>
                  Kiosk Settings
                </TabsTrigger>
                <TabsTrigger value="methods" className="text-sm" disabled>
                  Check-in Methods
                </TabsTrigger>
              </TabsList>
              <ScrollBar orientation="horizontal" className="invisible" />
            </ScrollArea>
          </div>

          <div className="mt-4 md:px-0">
            <TabsContent value="configuration">
              <AttendanceConfigContent tenant={tenant} />
            </TabsContent>
            <TabsContent value="kiosk">
              <div className="text-center py-12 text-muted-foreground">
                <p>Kiosk settings coming soon...</p>
              </div>
            </TabsContent>
            <TabsContent value="methods">
              <div className="text-center py-12 text-muted-foreground">
                <p>Check-in method settings coming soon...</p>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
