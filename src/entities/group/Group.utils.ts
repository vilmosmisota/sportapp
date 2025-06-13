import { Member, MemberGender } from "../member/Member.schema";
import { getAgeFromDateOfBirth } from "../member/Member.utils";
import { TenantGroupsConfig } from "../tenant/Tenant.schema";
import { Group, GroupGender } from "./Group.schema";

export const formatAgeRange = (ageRange: string) => {
  const rangeParts = ageRange.split("-");
  if (rangeParts.length === 2) {
    const min = parseInt(rangeParts[0]);
    const max = parseInt(rangeParts[1]);
    if (!isNaN(min) && !isNaN(max)) {
      if (max <= 18) {
        return `U${max}`;
      } else if (min >= 65) {
        return "Senior";
      } else {
        return "Adult";
      }
    }
  }

  return ageRange;
};

export const formatGender = (gender: string, ageRange?: string) => {
  const isAdultOrSenior = ageRange
    ? formatAgeRange(ageRange) === "Adult" ||
      formatAgeRange(ageRange) === "Senior"
    : false;

  if (isAdultOrSenior) {
    switch (gender) {
      case GroupGender.Male:
        return "Male";
      case GroupGender.Female:
        return "Female";
      case GroupGender.Mixed:
        return "Mixed";
      default:
        return gender;
    }
  } else {
    switch (gender) {
      case GroupGender.Male:
        return "Boys";
      case GroupGender.Female:
        return "Girls";
      case GroupGender.Mixed:
        return "Mixed";
      default:
        return gender;
    }
  }
};

export const formatGroupField = (
  fieldName: string,
  fieldValue: string,
  group?: Group
) => {
  switch (fieldName) {
    case "ageRange":
      return formatAgeRange(fieldValue);
    case "gender":
      return formatGender(fieldValue, group?.ageRange);
    default:
      return fieldValue;
  }
};

export const createGroupDisplay = (
  group: Group,
  tenantGroupsConfig?: TenantGroupsConfig
): string => {
  if (tenantGroupsConfig?.useCustomName && group.customName) {
    return group.customName;
  }

  console.log("group", group);
  console.log("tenantGroupsConfig", tenantGroupsConfig);

  const displayFields = tenantGroupsConfig?.displayFields || ["ageRange"];
  const separator = tenantGroupsConfig?.displaySeparator || "•";

  const formattedFields = displayFields
    .map((fieldName) => {
      const fieldValue = (group as any)[fieldName];
      if (!fieldValue) return null;
      return formatGroupField(fieldName, fieldValue, group);
    })
    .filter(Boolean);

  console.log("formattedFields", formattedFields);

  const returnValue = formattedFields.join(` ${separator} `);
  console.log("returnValue", returnValue);

  return formattedFields.join(` ${separator} `);
};

/**
 * Parse age range string to get min and max ages
 * @param ageRange - Age range string (e.g., "8-12", "10-14")
 * @returns Object with min and max age values
 */
export function parseAgeRange(ageRange: string): { min: number; max: number } {
  if (ageRange.includes("-")) {
    const [min, max] = ageRange.split("-").map(Number);
    return { min: min || 0, max: max || 100 };
  }

  console.warn(
    `Invalid age range format: ${ageRange}. Expected format: "min-max"`
  );
  return { min: 0, max: 100 };
}

/**
 * Check if a member's age is compatible with a group's age range
 * @param memberAge - The member's age in years
 * @param groupAgeRange - The group's age range string
 * @returns True if the member's age fits within the group's age range
 */
export function isMemberAgeCompatible(
  memberAge: number,
  groupAgeRange: string
): boolean {
  const { min, max } = parseAgeRange(groupAgeRange);
  return memberAge >= min && memberAge <= max;
}

/**
 * Map member gender to group gender format
 * @param memberGender - The member's gender
 * @returns The corresponding group gender string
 */
export function mapMemberToGroupGender(
  memberGender: MemberGender | null
): string {
  if (!memberGender) return "Mixed";

  switch (memberGender) {
    case MemberGender.Male:
      return "male";
    case MemberGender.Female:
      return "female";
    default:
      return "mixed";
  }
}

/**
 * Check if a member's gender is compatible with a group's gender
 * @param memberGender - The member's gender
 * @param groupGender - The group's gender
 * @returns True if the member's gender is compatible with the group
 */
export function isMemberGenderCompatible(
  memberGender: MemberGender | null,
  groupGender: string
): boolean {
  if (groupGender.toLowerCase() === "mixed") return true;

  if (!memberGender) return true;

  const memberGroupGender = mapMemberToGroupGender(memberGender);
  return memberGroupGender === groupGender.toLowerCase();
}

/**
 * Interface for member recommendation results
 */
export interface MemberRecommendationResult {
  recommended: Member[];
  others: Member[];
}

/**
 * Get recommended members for a group based on age and gender compatibility
 * @param members - Array of members (already filtered by type)
 * @param group - The group to get recommendations for
 * @returns Object with recommended and other members arrays
 */
export function getRecommendedMembersForGroup(
  members: Member[],
  group: Group
): MemberRecommendationResult {
  const recommended: Member[] = [];
  const others: Member[] = [];

  members.forEach((member) => {
    const age = member.dateOfBirth
      ? getAgeFromDateOfBirth(member.dateOfBirth)
      : null;

    let isRecommended = false;

    if (age !== null && isMemberAgeCompatible(age, group.ageRange)) {
      if (isMemberGenderCompatible(member.gender, group.gender)) {
        isRecommended = true;
      }
    }

    if (isRecommended) {
      recommended.push(member);
    } else {
      others.push(member);
    }
  });

  const { min, max } = parseAgeRange(group.ageRange);
  const targetAge = (min + max) / 2;

  recommended.sort((a, b) => {
    const aAge = a.dateOfBirth
      ? getAgeFromDateOfBirth(a.dateOfBirth)
      : targetAge;
    const bAge = b.dateOfBirth
      ? getAgeFromDateOfBirth(b.dateOfBirth)
      : targetAge;
    return Math.abs(aAge - targetAge) - Math.abs(bAge - targetAge);
  });

  others.sort((a, b) => {
    const aName = `${a.firstName || ""} ${a.lastName || ""}`.trim();
    const bName = `${b.firstName || ""} ${b.lastName || ""}`.trim();
    return aName.localeCompare(bName);
  });

  return {
    recommended,
    others,
  };
}
