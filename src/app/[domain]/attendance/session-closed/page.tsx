"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { useTenantAndUserAccessContext } from "@/composites/auth/TenantAndUserAccessContext";
import { format } from "date-fns";
import {
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle,
  Users,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SessionClosedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tenant } = useTenantAndUserAccessContext();

  // Get session details from search params
  const sessionDate = searchParams.get("date");
  const sessionTime = searchParams.get("time");
  const totalAttendees = searchParams.get("attendees");
  const checkedInCount = searchParams.get("checkedIn");

  const handleGoToAttendance = () => {
    router.push("/attendance");
  };

  const handleViewReports = () => {
    router.push("/attendance/reports");
  };

  if (!tenant) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Session Successfully Closed"
        description="Your attendance session has been processed and completed"
      />

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Success Card */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-900">
                  Attendance Session Closed Successfully
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  All attendance data has been processed and saved to your
                  records.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Session Summary */}
        {(sessionDate || sessionTime || totalAttendees) && (
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-medium text-gray-900 mb-4">
                Session Summary
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sessionDate && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Date</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(sessionDate), "MMMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                )}

                {sessionTime && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Time</p>
                      <p className="text-sm text-gray-600">{sessionTime}</p>
                    </div>
                  </div>
                )}

                {totalAttendees && (
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Attendance
                      </p>
                      <p className="text-sm text-gray-600">
                        {checkedInCount || "0"} of {totalAttendees} members
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* What Happened */}
        <Card>
          <CardContent className="pt-6">
            <h4 className="font-medium text-gray-900 mb-4">What Happened</h4>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <p>Attendance records were finalized and saved permanently</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <p>
                  Members who didn&apos;t check in were automatically marked as
                  absent
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <p>
                  Attendance statistics were calculated and added to member
                  profiles
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <p>
                  Data is now available in your attendance reports and analytics
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={handleGoToAttendance} className="flex-1">
            <Calendar className="h-4 w-4 mr-2" />
            Back to Attendance
          </Button>
          <Button
            variant="outline"
            onClick={handleViewReports}
            className="flex-1"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            View Reports
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
