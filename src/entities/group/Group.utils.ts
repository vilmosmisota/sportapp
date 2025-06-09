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

  const displayFields = tenantGroupsConfig?.displayFields || ["ageRange"];
  const separator = tenantGroupsConfig?.displaySeparator || "•";

  const formattedFields = displayFields
    .map((fieldName) => {
      const fieldValue = (group as any)[fieldName];
      if (!fieldValue) return null;
      return formatGroupField(fieldName, fieldValue, group);
    })
    .filter(Boolean); // Remove null/undefined values

  return formattedFields.join(` ${separator} `);
};

export const createGroupDisplayTag = (
  group: Group,
  tenantGroupsConfig?: TenantGroupsConfig
) => {
  const displayText = createGroupDisplay(group, tenantGroupsConfig);

  return {
    text: displayText,
    color: group.appearance?.color || tenantGroupsConfig?.color || "#3b82f6", // Default blue
    backgroundColor: `${
      group.appearance?.color || tenantGroupsConfig?.color || "#3b82f6"
    }20`, // 20% opacity
  };
};
