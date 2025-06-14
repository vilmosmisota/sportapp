import { Group } from "@/entities/group/Group.schema";
import { createGroupDisplay } from "@/entities/group/Group.utils";
import { SessionWithGroup } from "@/entities/session/Session.schema";
import { TenantGroupsConfig } from "../../../entities/tenant/Tenant.schema";
import { DateRange } from "../types/calendar.types";
import { SessionEvent } from "../types/event.types";
import { calculateDuration, parseDateTime } from "../utils/date.utils";

/**
 * Adapter to transform Session data into SessionEvent objects
 */
export class SessionEventAdapter {
  /**
   * Transform a Session into a SessionEvent
   */
  transform(
    session: SessionWithGroup,
    tenantGroupsConfig?: TenantGroupsConfig
  ): SessionEvent {
    const startDate = parseDateTime(session.date, session.startTime);
    const endDate = parseDateTime(session.date, session.endTime);
    const duration = calculateDuration(startDate, endDate);

    const groupName = this.getGroupName(session.group, tenantGroupsConfig);
    const displayInfo = this.getDisplayInfo(session, tenantGroupsConfig);

    return {
      id: session.id,
      type: "session",
      title: groupName,
      startDate,
      endDate,
      allDay: false,
      data: session,
      groupName,
      locationName: session.location?.name,
      duration,
      metadata: {
        color: displayInfo.color,
        description: displayInfo.description,
        category: "session",
        priority: 1,
      },
    };
  }

  /**
   * Extract date range from session data
   */
  getDateRange(session: SessionWithGroup): DateRange {
    const startDate = parseDateTime(session.date, session.startTime);
    const endDate = parseDateTime(session.date, session.endTime);

    return {
      start: startDate,
      end: endDate,
    };
  }

  /**
   * Get the display name for a group using the utility function
   */
  private getGroupName(
    group: Group,
    groupsConfig?: TenantGroupsConfig
  ): string {
    return createGroupDisplay(group, groupsConfig);
  }

  /**
   * Get display information for the session
   */
  private getDisplayInfo(
    session: SessionWithGroup,
    groupsConfig?: TenantGroupsConfig
  ): {
    title?: string;
    color?: string;
    description?: string;
  } {
    // Use group color if available, otherwise default
    const color = session.group.appearance?.color || "#3b82f6"; // Default blue

    // Create description with location info
    let description = session.location?.name || undefined;

    return {
      color,
      description,
    };
  }
}
