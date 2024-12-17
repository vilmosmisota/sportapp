import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Division } from "@/entities/division/Division.schema";
import AddGameSheet from "./AddGameSheet";

export default function DivisionCard({ division }: { division: Division }) {
  return (
    <Card className="max-w-[500px]">
      <CardContent className="flex justify-between text-sm capitalize p-0 pb-2  m-4 border-b">
        <div>
          <p>
            <span className="text-muted-foreground">level: </span>
            {division.level}
          </p>
          <p>
            <span className="text-muted-foreground">age: </span>
            {division.age}
          </p>
          <p>
            <span className="text-muted-foreground">gender: </span>
            {division.gender}
          </p>
        </div>
        <div className="text-right">
          <p>
            {new Date(division.startDate ?? "").toLocaleString("en-UK", {
              year: "numeric",
            })}
          </p>
          <p>
            {new Date(division.startDate ?? "").toLocaleString("en-UK", {
              month: "long",
              day: "numeric",
            })}{" "}
            -{" "}
            {new Date(division.endDate ?? "").toLocaleString("en-UK", {
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </CardContent>
      <CardFooter className="">
        <AddGameSheet divisionId={division.id} />
      </CardFooter>
    </Card>
  );
}
