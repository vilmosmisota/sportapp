import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserRole } from "@/entities/user/User.schema";
import { Search } from "lucide-react";

type UsersTableFiltersProps = {
  roleFilter: UserRole | "all";
  setRoleFilter: (role: UserRole | "all") => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
};

export default function UsersTableFilters({
  roleFilter,
  setRoleFilter,
  searchQuery,
  setSearchQuery,
}: UsersTableFiltersProps) {
  return (
    <div className="flex gap-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select
        value={roleFilter}
        onValueChange={(value) => setRoleFilter(value as UserRole | "all")}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          {Object.values(UserRole).map((role) => (
            <SelectItem key={role} value={role}>
              {role}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
