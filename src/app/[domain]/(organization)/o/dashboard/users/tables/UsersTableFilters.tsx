import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminRole, DomainRole } from "@/entities/user/User.schema";
import { Search } from "lucide-react";

type RoleFilter = {
  type: "admin" | "domain";
  role: AdminRole | DomainRole | "all";
};

type UsersTableFiltersProps = {
  roleFilter: RoleFilter;
  setRoleFilter: (filter: RoleFilter) => void;
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
    <div className="flex flex-col md:flex-row gap-4 w-full">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 w-full md:w-[300px] bg-white"
        />
      </div>
      <Select
        value={`${roleFilter.type}:${roleFilter.role}`}
        onValueChange={(value) => {
          const [type, role] = value.split(":") as [
            "admin" | "domain",
            AdminRole | DomainRole | "all"
          ];
          setRoleFilter({ type, role });
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by role" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          <div className="font-medium px-2 py-1.5 text-sm text-muted-foreground">
            Admin Roles
          </div>
          <SelectItem value="admin:all">All Admin Roles</SelectItem>
          {Object.values(AdminRole).map((role) => (
            <SelectItem key={role} value={`admin:${role}`}>
              <span className="capitalize">{role.replace("-", " ")}</span>
            </SelectItem>
          ))}
          <div className="font-medium px-2 py-1.5 text-sm text-muted-foreground mt-2">
            Domain Roles
          </div>
          <SelectItem value="domain:all">All Domain Roles</SelectItem>
          {Object.values(DomainRole).map((role) => (
            <SelectItem key={role} value={`domain:${role}`}>
              <span className="capitalize">{role.replace("-", " ")}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
