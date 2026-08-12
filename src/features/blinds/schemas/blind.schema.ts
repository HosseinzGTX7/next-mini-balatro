import { z } from "zod";
import { CardSuitSchema } from "@/features/poker/schemas/card.schema";

export const BlindTypeSchema = z.enum(["small", "big", "boss"]);

export const BossModifierSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  debuffSuit: CardSuitSchema.optional(),
  targetMultiplier: z.number().default(2),
  maxHands: z.number().int().optional(),
  maxDiscards: z.number().int().optional(),
  handSizeDelta: z.number().int().optional(),
  cardsFaceDown: z.boolean().optional(),
  noRepeatHandTypes: z.boolean().optional(),
  singleHandTypeOnly: z.boolean().optional(),
  degradesHandLevel: z.boolean().optional(),
  debuffPlayedCards: z.boolean().optional(),
});

export const SkipTagTypeSchema = z.enum([
  "economy",
  "foil",
  "holographic",
  "polychrome",
  "rare",
  "d6",
  "speed",
  "handy",
]);

export const SkipTagSchema = z.object({
  type: SkipTagTypeSchema,
  name: z.string(),
  description: z.string(),
  value: z.number().default(0),
});

export const BlindConfigSchema = z.object({
  type: BlindTypeSchema,
  name: z.string(),
  targetScore: z.number().int().min(0),
  reward: z.number().int().min(0),
  bossModifier: BossModifierSchema.optional(),
  skipTag: SkipTagSchema.optional(),
  isDefeated: z.boolean().default(false),
  isSkipped: z.boolean().default(false),
});

export type BlindType = z.infer<typeof BlindTypeSchema>;
export type BossModifier = z.infer<typeof BossModifierSchema>;
export type SkipTagType = z.infer<typeof SkipTagTypeSchema>;
export type SkipTag = z.infer<typeof SkipTagSchema>;
export type BlindConfig = z.infer<typeof BlindConfigSchema>;
