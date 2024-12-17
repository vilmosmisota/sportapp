import { getDivisions } from "@/entities/division/Division.services.server";
import DivisionCard from "./components/DivisionCard";

export default async function DivisionsPage({
  params,
}: {
  params: { domain: string };
}) {
  const divisions = await getDivisions(params.domain);
  return (
    <div>
      {divisions.map((division) => {
        return <DivisionCard division={division} key={division.id} />;
      })}
    </div>
  );
}
