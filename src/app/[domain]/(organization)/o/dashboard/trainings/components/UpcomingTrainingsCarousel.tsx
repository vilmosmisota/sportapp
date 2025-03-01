import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Training } from "@/entities/training/Training.schema";
import { cn } from "@/libs/tailwind/utils";
import { MapPin, Clock, Calendar } from "lucide-react";
import { TeamBadge } from "@/components/ui/team-badge";
import Autoplay from "embla-carousel-autoplay";

interface UpcomingTrainingsCarouselProps {
  trainings: Training[];
}

export function UpcomingTrainingsCarousel({
  trainings,
}: UpcomingTrainingsCarouselProps) {
  const [api, setApi] = useState<any>();

  // Sort trainings by date and time
  const sortedTrainings = [...trainings].sort((a, b) => {
    // First sort by date
    const dateComparison = a.date.getTime() - b.date.getTime();
    if (dateComparison !== 0) return dateComparison;

    // If same date, sort by start time
    return a.startTime.localeCompare(b.startTime);
  });

  if (trainings.length === 0) {
    return (
      <Card className="mb-6 bg-muted/40">
        <CardContent className="p-6 text-center text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No upcoming trainings scheduled</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium">Upcoming Trainings</h3>
            <div className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium">
              Individual Sessions
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Next 7 days</p>
        </div>
      </div>

      <div className="relative px-8 py-3 -mx-4 sm:-mx-0 rounded-lg border border-primary/10 bg-primary/5 group/container hover:bg-primary/10 transition-colors">
        <Carousel
          setApi={setApi}
          className="w-full relative"
          plugins={[
            Autoplay({
              delay: 5000,
              stopOnInteraction: true,
            }),
          ]}
          opts={{
            align: "start",
            loop: true,
          }}
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {sortedTrainings.map((training) => (
              <CarouselItem
                key={training.id}
                className="pl-2 md:pl-4 basis-full xs:basis-1/2 sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
              >
                <div
                  className={cn(
                    "h-full rounded-md border bg-card p-4 shadow-sm transition-all",
                    "hover:shadow-md hover:scale-[1.02] group/card"
                  )}
                >
                  <div className="flex flex-col h-full">
                    {training.team && (
                      <div className="mb-3">
                        <TeamBadge team={training.team} size="sm" />
                      </div>
                    )}

                    <div className="mb-3">
                      <div className="text-sm font-medium text-primary mb-1">
                        {format(training.date, "EEEE, MMMM d")}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>
                          {training.startTime} - {training.endTime}
                        </span>
                      </div>
                    </div>

                    {training.location && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-auto">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">
                          {training.location.name}, {training.location.city}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute -left-4 h-8 w-8 opacity-0 group-hover/container:opacity-100 transition-opacity" />
          <CarouselNext className="absolute -right-4 h-8 w-8 opacity-0 group-hover/container:opacity-100 transition-opacity" />
        </Carousel>
      </div>
    </div>
  );
}
