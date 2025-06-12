import { Group } from "@/entities/group/Group.schema";
import { SessionWithGroup } from "@/entities/session/Session.schema";
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
  transform(session: SessionWithGroup): SessionEvent {
    const startDate = parseDateTime(session.date, session.startTime);
    const endDate = parseDateTime(session.date, session.endTime);
    const duration = calculateDuration(startDate, endDate);

    const displayInfo = this.getDisplayInfo(session);

    return {
      id: session.id,
      type: "session",
      title: displayInfo.title,
      startDate,
      endDate,
      allDay: false,
      data: session,
      groupName: this.getGroupName(session.group),
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
   * Get display information for the session
   */
  getDisplayInfo(session: SessionWithGroup): {
    title: string;
    color?: string;
    description?: string;
  } {
    // Create a descriptive title
    const title = this.getGroupName(session.group);

    // Use group color if available, otherwise default
    const color = session.group.appearance?.color || "#3b82f6"; // Default blue

    // Create description with location and time info
    let description = `${session.startTime} - ${session.endTime}`;
    if (session.location?.name) {
      description += ` at ${session.location.name}`;
    }

    return {
      title,
      color,
      description,
    };
  }

  /**
   * Generate a display name for the group
   */
  private getGroupName(group: Group): string {
    // Use custom name if available
    if (group.customName) {
      return group.customName;
    }

    // Otherwise, construct from age range, level, and gender
    const parts = [group.ageRange];

    if (group.level) {
      parts.push(group.level);
    }

    if (group.gender && group.gender !== "mixed") {
      parts.push(group.gender);
    }

    return parts.join(" ");
  }
}
