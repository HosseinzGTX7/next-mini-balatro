import { z } from "zod";
import { CardEditionSchema, CardSuitSchema, CardRankSchema } from "@/features/poker/schemas/card.schema";
import { PokerHandNameSchema } from "@/features/scoring/schemas/scoring.schema";

export const JokerRaritySchema = z.enum(["common", "uncommon", "rare", "legendary"]);

export const JokerTriggerTypeSchema = z.enum([
  "onHandPlayed",
  "onCardScored",
  "onHeldInHand",
  "onDiscard",
  "roundEnd",
  "passive",
]);

export const JokerEffectTypeSchema = z.enum([
  "addChips",
  "addMult",
  "multiplyMult",
  "gainMoney",
  "retrigger",
  "copyRight",
]);

export const JokerConditionSchema = z.object({
  handTypes: z.array(PokerHandNameSchema).optional(),
  suits: z.array(CardSuitSchema).optional(),
  ranks: z.array(CardRankSchema).optional(),
  maxPlayedCards: z.number().int().optional(),
  minPlayedCards: z.number().int().optional(),
  discardsEquals: z.number().int().optional(),
  chipsPerDiscard: z.number().int().optional(),
  multPerHeldKing: z.number().optional(),
  extinctionProbability: z.number().optional(), // 1 in N chance
});

export const JokerTemplateSchema = z.object({
  templateId: z.string(),
  name: z.string(),
  rarity: JokerRaritySchema,
  cost: z.number().int().min(0),
  sellValue: z.number().int().min(0),
  description: z.string(),
  triggerType: JokerTriggerTypeSchema,
  effectType: JokerEffectTypeSchema,
  value: z.number().default(0),
  condition: JokerConditionSchema.optional(),
});

export const JokerItemSchema = z.object({
  id: z.string(),
  templateId: z.string(),
  name: z.string(),
  rarity: JokerRaritySchema,
  cost: z.number().int().min(0),
  sellValue: z.number().int().min(0),
  description: z.string(),
  edition: CardEditionSchema.optional(),
  triggerType: JokerTriggerTypeSchema,
  effectType: JokerEffectTypeSchema,
  value: z.number().default(0),
  condition: JokerConditionSchema.optional(),
  customData: z.record(z.string(), z.unknown()).optional(),
  plusChips: z.number().int().optional(),
  plusMult: z.number().optional(),
  timesMult: z.number().optional(),
});

export type JokerRarity = z.infer<typeof JokerRaritySchema>;
export type JokerTriggerType = z.infer<typeof JokerTriggerTypeSchema>;
export type JokerEffectType = z.infer<typeof JokerEffectTypeSchema>;
export type JokerCondition = z.infer<typeof JokerConditionSchema>;
export type JokerTemplate = z.infer<typeof JokerTemplateSchema>;
export type JokerItem = z.infer<typeof JokerItemSchema>;
