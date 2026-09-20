import { z } from "zod";
import { CardEnhancementSchema } from "@/features/poker/schemas/card.schema";
import { PokerHandNameSchema } from "@/features/scoring/schemas/scoring.schema";

export const ConsumableTypeSchema = z.enum(["tarot", "planet"]);

export const TarotCardIdSchema = z.enum([
  "the_magician",
  "the_empress",
  "the_hierophant",
  "the_lovers",
  "the_chariot",
  "justice",
  "the_hermit",
  "the_wheel_of_fortune",
  "death",
  "the_hanged_man",
]);

export const PlanetCardIdSchema = z.enum([
  "mercury",
  "venus",
  "earth",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
]);

export const ConsumableItemSchema = z.object({
  id: z.string(),
  templateId: z.string(),
  name: z.string(),
  type: ConsumableTypeSchema,
  cost: z.number().int().min(0),
  sellValue: z.number().int().min(0),
  description: z.string(),
  targetHand: PokerHandNameSchema.optional(),
  chipsDelta: z.number().int().optional(),
  multDelta: z.number().optional(),
  enhancementGrant: CardEnhancementSchema.optional(),
  maxSelectedCards: z.number().int().optional(),
});

export const BoosterPackTypeSchema = z.enum([
  "arcana",
  "celestial",
  "standard",
  "buffoon",
]);

export const BoosterPackSchema = z.object({
  id: z.string(),
  type: BoosterPackTypeSchema,
  name: z.string(),
  cost: z.number().int().min(0),
  description: z.string(),
  cardsCount: z.number().int().default(3),
  choicesCount: z.number().int().default(1),
});

export type ConsumableType = z.infer<typeof ConsumableTypeSchema>;
export type TarotCardId = z.infer<typeof TarotCardIdSchema>;
export type PlanetCardId = z.infer<typeof PlanetCardIdSchema>;
export type ConsumableItem = z.infer<typeof ConsumableItemSchema>;
export type BoosterPackType = z.infer<typeof BoosterPackTypeSchema>;
export type BoosterPack = z.infer<typeof BoosterPackSchema>;
