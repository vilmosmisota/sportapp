"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { GameMutationSchema } from "@/entities/game/Game.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

type AddGameSheetProps = {
  divisionId: number;
};

export default function AddGameSheet({ divisionId }: AddGameSheetProps) {
  const form = useForm<z.output<typeof GameMutationSchema>>({
    resolver: zodResolver(GameMutationSchema),
    defaultValues: {
      divisionId: divisionId,
      date: "",
      startTime: "",
      homeTeamId: 0,
      awayTeamId: 0,
      city: "",
      countryCode: "",
      mapLink: "",
      postalCode: "",
      streetAddress: "",
    },
  });

  return (
    <Sheet>
      <Button asChild>
        <SheetTrigger>Add game</SheetTrigger>
      </Button>

      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add games</SheetTitle>
          <SheetDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit((data) => {})}
          >
            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" />
                    </FormControl>
                    <FormDescription></FormDescription>
                    <FormMessage></FormMessage>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" />
                    </FormControl>
                    <FormDescription></FormDescription>
                    <FormMessage></FormMessage>
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
