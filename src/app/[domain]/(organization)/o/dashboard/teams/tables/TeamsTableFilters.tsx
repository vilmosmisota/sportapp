import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Gender } from "@/entities/team/Team.schema";
import { Search } from "lucide-react";
import { useTenantGroupTypes } from "@/entities/tenant/hooks/useGroupTypes";

type TeamFilter = {
  type: "age" | "gender" | "skill";
  value: string;
};

type TeamsTableFiltersProps = {
  teamFilter: TeamFilter;
  setTeamFilter: (filter: TeamFilter) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  domain: string;
};

export default function TeamsTableFilters({
  teamFilter,
  setTeamFilter,
  searchQuery,
  setSearchQuery,
  domain,
}: TeamsTableFiltersProps) {
  const { ageGroups, skillLevels } = useTenantGroupTypes(domain);

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
        value={`${teamFilter.type}:${teamFilter.value}` || "age:all"}
        onValueChange={(value) => {
          const [type, filterValue] = value.split(":") as [
            "age" | "gender" | "skill",
            string
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
          {ageGroups.map((age) => (
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
          {skillLevels.map((skill) => (
            <SelectItem key={skill} value={`skill:${skill}`}>
              {skill}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
