import { getTeamStatisticsOnDivisions } from "@/entities/team-statistics/TeamStatistics.services";
import DivisionSelector from "../components/DivisionSelector";

type DTBProps = {
  domain: string;
};

export default async function DivisionTableBloc({ domain }: DTBProps) {
  if (domain === "workbox-588899ac.js" || domain === "sw.js") {
    return null;
  }

  const data = await getTeamStatisticsOnDivisions(domain);

  return (
    <>
      <DivisionSelector teamTable={data} />
    </>
  );
}
