import { GroupGender } from "../group/Group.schema";

export const getDisplayGender = (
  gender: GroupGender | null | undefined | string,
  age: string | null | undefined
): string => {
  if (!gender) return "";
  if (gender === GroupGender.Mixed) return "Mixed";

  // Extract age number from string (e.g., "u18" -> 18)
  const ageMatch = age?.match(/u(\d+)/i);
  const ageNumber = ageMatch ? parseInt(ageMatch[1], 10) : null;

  if (gender === GroupGender.Male) {
    if (!age) return "Men";
    return ageNumber && ageNumber < 18 ? "Boys" : "Men";
  }

  if (gender === GroupGender.Female) {
    if (!age) return "Women";
    return ageNumber && ageNumber < 18 ? "Girls" : "Women";
  }

  return gender;
};
