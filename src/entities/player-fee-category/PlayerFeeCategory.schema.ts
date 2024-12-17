import { z } from "zod";

export enum CurrencyTypes {
  USD = "USD",
  EUR = "EUR",
  GBP = "GBP",
}

export const PlayerFeeCategorySchema = z.object({
  id: z.number(),
  currency: z.nativeEnum(CurrencyTypes),
  name: z.string().min(1, { message: "Name is required" }),

  tenantId: z.number(),
});

export type PlayerFeeCategory = z.infer<typeof PlayerFeeCategorySchema>;

export const PlayerFeeCategoryFormSchema = PlayerFeeCategorySchema.omit({
  id: true,
  tenantId: true,
});

export type PlayerFeeCategoryForm = z.infer<typeof PlayerFeeCategoryFormSchema>;
