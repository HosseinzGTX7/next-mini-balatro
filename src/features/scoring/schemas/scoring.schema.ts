import { z } from "zod";

export const PokerHandNameSchema = z.enum([
  "High Card",
  "Pair",
  "Two Pair",
  "Three of a Kind",
  "Straight",
  "Flush",
  "Full House",
  "Four of a Kind",
  "Straight Flush",
  "Royal Flush",
  "Five of a Kind",
  "Flush House",
  "Flush Five",
]);

export const ScoringStepEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("baseHand"),
    handName: PokerHandNameSchema,
    chips: z.number().int(),
    mult: z.number(),
    level: z.number().int(),
  }),
  z.object({
    type: z.literal("cardChips"),
    cardId: z.string(),
    rank: z.string(),
    suit: z.string(),
    chipsAdded: z.number().int(),
    currentChips: z.number().int(),
    isRetrigger: z.boolean().default(false),
  }),
  z.object({
    type: z.literal("cardMult"),
    cardId: z.string(),
    multAdded: z.number(),
    currentMult: z.number(),
    isRetrigger: z.boolean().default(false),
  }),
  z.object({
    type: z.literal("cardXMult"),
    cardId: z.string(),
    xMultFactor: z.number(),
    currentMult: z.number(),
    isRetrigger: z.boolean().default(false),
  }),
  z.object({
    type: z.literal("heldInHand"),
    cardId: z.string(),
    enhancement: z.string(),
    xMultFactor: z.number(),
    currentMult: z.number(),
  }),
  z.object({
    type: z.literal("joker"),
    jokerId: z.string(),
    jokerName: z.string(),
    effectType: z.enum(["chips", "mult", "xmult"]),
    amount: z.number(),
    currentChips: z.number().int(),
    currentMult: z.number(),
    message: z.string().optional(),
    cardId: z.string().optional(),
    isCardTrigger: z.boolean().optional(),
  }),
  z.object({
    type: z.literal("finalTally"),
    totalChips: z.number().int(),
    totalMult: z.number(),
    totalScore: z.number().int(),
  }),
]);

export const HandEvaluationResultSchema = z.object({
  handName: PokerHandNameSchema,
  scoringCardIds: z.array(z.string()),
  baseChips: z.number().int().min(0),
  baseMult: z.number().min(0),
  level: z.number().int().min(1),
});

export const HandScoreBreakdownSchema = z.object({
  evaluation: HandEvaluationResultSchema,
  events: z.array(ScoringStepEventSchema),
  finalChips: z.number().int().min(0),
  finalMult: z.number().min(0),
  totalHandScore: z.number().int().min(0),
});

// Single Source of Truth Derived TypeScript Types
export type PokerHandName = z.infer<typeof PokerHandNameSchema>;
export type ScoringStepEvent = z.infer<typeof ScoringStepEventSchema>;
export type HandEvaluationResult = z.infer<typeof HandEvaluationResultSchema>;
export type HandScoreBreakdown = z.infer<typeof HandScoreBreakdownSchema>;
