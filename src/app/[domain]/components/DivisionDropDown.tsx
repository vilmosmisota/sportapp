import { Combobox } from "@/components/ui/combobox";

type DivisionDropDownProps = {
  selectionItems: {
    value: string;
    label: string;
  }[];
  onSelect: (id: string) => void;
};

export default function DivisionDropDown({
  onSelect,
  selectionItems,
}: DivisionDropDownProps) {
  return (
    <Combobox
      label="Select division..."
      list={selectionItems}
      onSelect={onSelect}
    />
  );
}
