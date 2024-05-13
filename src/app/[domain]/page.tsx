import FeaturedGamesBlock from "./FeaturedGameResultsBlock";
import DivisionTableBloc from "./DivisionTableBlock";
import FeaturedUpcomingGamesBlock from "./FeaturedUpcomingGamesBlock";

export default async function DomainPage({
  params,
}: {
  params: { domain: string };
}) {
  return (
    <div>
      <div className="mx-auto mb-5 ">
        <FeaturedGamesBlock domain={params.domain} />
      </div>

      <div className="flex md:flex-row flex-col-reverse gap-4 items-stretch">
        <div className="md:w-8/12">
          <DivisionTableBloc domain={params.domain} />
        </div>

        <div className="md:w-4/12">
          <FeaturedUpcomingGamesBlock domain={params.domain} />
        </div>
      </div>
    </div>
  );
}
