import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  getDisplayGender,
  getDisplayAgeGroup,
  Team,
} from "@/entities/group/Group.schema";
import { Control, ControllerRenderProps, FieldValues } from "react-hook-form";

interface TeamSelectorProps {
  teams: Team[];
  control: Control<any>;
  name: string;
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

export function TeamSelector({
  teams,
  control,
  name,
  label,
  placeholder = "Select team",
  defaultValue,
  onChange,
}: TeamSelectorProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({
        field,
      }: {
        field: ControllerRenderProps<FieldValues, string>;
      }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <Select
            onValueChange={(value) => {
              field.onChange(value);
              if (onChange) onChange(value);
            }}
            defaultValue={defaultValue || field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {teams.map((team) => (
                <SelectItem
                  key={team.id}
                  value={team.id.toString()}
                  className="flex items-center gap-2"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: team.appearance?.color || "#888",
                      }}
                    />
                    <span>
                      {[
                        getDisplayAgeGroup(team.age),
                        getDisplayGender(team.gender, team.age),
                        team.skill,
                      ]
                        .filter(Boolean)
                        .join(" • ")}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
