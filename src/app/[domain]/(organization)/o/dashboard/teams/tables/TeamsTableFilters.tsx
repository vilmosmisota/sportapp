import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AgeLevel, Gender, SkillLevel } from "@/entities/team/Team.schema";
import { Search } from "lucide-react";

type TeamFilter = {
  type: "age" | "gender" | "skill";
  value: AgeLevel | Gender | SkillLevel | "all";
};

type TeamsTableFiltersProps = {
  teamFilter: TeamFilter;
  setTeamFilter: (filter: TeamFilter) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
};

export default function TeamsTableFilters({
  teamFilter,
  setTeamFilter,
  searchQuery,
  setSearchQuery,
}: TeamsTableFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 w-full">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search teams..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 w-full md:w-[300px] bg-white"
        />
      </div>
      <Select
        value={`${teamFilter.type}:${teamFilter.value}`}
        onValueChange={(value) => {
          const [type, filterValue] = value.split(":") as [
            "age" | "gender" | "skill",
            AgeLevel | Gender | SkillLevel | "all"
          ];
          setTeamFilter({ type, value: filterValue });
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter teams" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          <div className="font-medium px-2 py-1.5 text-sm text-muted-foreground">
            Age Groups
          </div>
          <SelectItem value="age:all">All Age Groups</SelectItem>
          {Object.values(AgeLevel).map((age) => (
            <SelectItem key={age} value={`age:${age}`}>
              {age}
            </SelectItem>
          ))}

          <div className="font-medium px-2 py-1.5 text-sm text-muted-foreground mt-2">
            Gender
          </div>
          <SelectItem value="gender:all">All Genders</SelectItem>
          {Object.values(Gender).map((gender) => (
            <SelectItem key={gender} value={`gender:${gender}`}>
              {gender}
            </SelectItem>
          ))}

          <div className="font-medium px-2 py-1.5 text-sm text-muted-foreground mt-2">
            Skill Level
          </div>
          <SelectItem value="skill:all">All Skill Levels</SelectItem>
          {Object.values(SkillLevel).map((skill) => (
            <SelectItem key={skill} value={`skill:${skill}`}>
              {skill}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
