import {
  getDisplayGender,
  getDisplayAgeGroup,
} from "@/entities/team/Team.schema";

export const formatTeamName = (teamName: string | null): string => {
  if (!teamName) return "Unnamed Training";

  const parts = teamName.split(" • ");
  if (parts.length !== 3) return teamName;

  const [age, gender, level] = parts;
  const displayGender = getDisplayGender(gender, age);
  const displayAge = getDisplayAgeGroup(age);

  return `${displayAge} • ${displayGender} • ${level}`;
};
