import DivisionTableBloc from "./blocks/DivisionTableBlock";
import FeaturedGameResultsBlock from "./blocks/FeaturedGameResultsBlock";
import FeaturedUpcomingGamesBlock from "./blocks/FeaturedUpcomingGamesBlock";

export default function LeagueLandingPage({
  params,
}: {
  params: { domain: string };
}) {
  return (
    <>
      <div className="mx-auto mb-5 ">
        <FeaturedGameResultsBlock domain={params.domain} />
      </div>

      <div className="flex md:flex-row flex-col-reverse gap-4 items-stretch">
        <div className="md:w-8/12">
          <DivisionTableBloc domain={params.domain} />
        </div>

        <div className="md:w-4/12">
          <FeaturedUpcomingGamesBlock domain={params.domain} />
        </div>
      </div>
    </>
  );
}
