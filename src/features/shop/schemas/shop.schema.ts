import { z } from "zod";
import { JokerItemSchema } from "@/features/jokers/schemas/joker.schema";
import { PlayingCardSchema } from "@/features/poker/schemas/card.schema";
import {
  ConsumableItemSchema,
  BoosterPackSchema,
} from "./consumable.schema";

export const ShopItemTypeSchema = z.enum(["joker", "consumable", "pack"]);

export const ShopItemSchema = z.object({
  id: z.string(),
  type: ShopItemTypeSchema,
  cost: z.number().int().min(0),
  joker: JokerItemSchema.optional(),
  consumable: ConsumableItemSchema.optional(),
  pack: BoosterPackSchema.optional(),
  isBought: z.boolean().default(false),
});

export const PackChoiceItemSchema = z.object({
  id: z.string(),
  type: z.enum(["joker", "consumable", "card"]),
  joker: JokerItemSchema.optional(),
  consumable: ConsumableItemSchema.optional(),
  card: PlayingCardSchema.optional(),
});

export const ActivePackSessionSchema = z.object({
  pack: BoosterPackSchema,
  choices: z.array(PackChoiceItemSchema),
  isResolved: z.boolean().default(false),
});

export type ShopItemType = z.infer<typeof ShopItemTypeSchema>;
export type ShopItem = z.infer<typeof ShopItemSchema>;
export type PackChoiceItem = z.infer<typeof PackChoiceItemSchema>;
export type ActivePackSession = z.infer<typeof ActivePackSessionSchema>;
