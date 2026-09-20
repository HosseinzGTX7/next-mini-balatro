import { z } from "zod";
import { PokerHandNameSchema } from "@/features/scoring/schemas/scoring.schema";
import { PlayingCardSchema } from "@/features/poker/schemas/card.schema";
import { JokerItemSchema } from "@/features/jokers/schemas/joker.schema";
import { ConsumableItemSchema, BoosterPackSchema } from "@/features/shop/schemas/consumable.schema";
import { ShopItemSchema } from "@/features/shop/schemas/shop.schema";
import {
  BlindTypeSchema,
  BlindConfigSchema,
  BossModifierSchema,
  SkipTagSchema,
} from "@/features/blinds/schemas/blind.schema";

export const GamePhaseSchema = z.enum([
  "menu",
  "blindSelect",
  "playing",
  "scoring",
  "roundWon",
  "roundLost",
  "shop",
  "gameWon",
]);

export const AnteBlindsPackageSchema = z.object({
  ante: z.number(),
  small: BlindConfigSchema,
  big: BlindConfigSchema,
  boss: BlindConfigSchema,
});

/**
 * Statistics tracked during an individual run.
 */
export const RunStatsSchema = z.object({
  handsPlayed: z.number().nonnegative().default(0),
  discardsUsed: z.number().nonnegative().default(0),
  cardsPlayed: z.number().nonnegative().default(0),
  rerollsCount: z.number().nonnegative().default(0),
  highestHandScore: z.number().nonnegative().default(0),
  bestHandType: PokerHandNameSchema.nullable().default(null),
  totalMoneyEarned: z.number().nonnegative().default(0),
  startTime: z.number().default(() => Date.now()),
  endTime: z.number().optional(),
});

export type RunStats = z.infer<typeof RunStatsSchema>;

/**
 * Career / lifetime statistics across all runs stored in localStorage.
 */
export const CareerStatsSchema = z.object({
  runsPlayed: z.number().nonnegative().default(0),
  runsWon: z.number().nonnegative().default(0),
  highestAnte: z.number().nonnegative().default(1),
  highestScoreEver: z.number().nonnegative().default(0),
  bestHandEver: z
    .object({
      handType: PokerHandNameSchema,
      score: z.number().nonnegative(),
    })
    .nullable()
    .default(null),
  mostPlayedHand: PokerHandNameSchema.nullable().default(null),
  handTypeCounts: z.record(PokerHandNameSchema, z.number().nonnegative()).default({}),
});

export type CareerStats = z.infer<typeof CareerStatsSchema>;

/**
 * Full snapshot of active game run for save/load persistence.
 */
export const SavedRunStateSchema = z.object({
  version: z.number().default(1),
  savedAt: z.number().default(() => Date.now()),
  phase: GamePhaseSchema,
  ante: z.number(),
  round: z.number(),
  blindType: BlindTypeSchema,
  currentBlinds: AnteBlindsPackageSchema.nullable(),
  activeBossModifier: BossModifierSchema.nullable(),
  playedHandsThisRound: z.array(PokerHandNameSchema),
  lockedHandTypeThisRound: PokerHandNameSchema.nullable(),
  playedCardIdsThisAnte: z.array(z.string()),
  currentSkipTags: z.array(SkipTagSchema),
  handsRemaining: z.number(),
  discardsRemaining: z.number(),
  money: z.number(),
  seed: z.string(),
  deck: z.array(PlayingCardSchema),
  hand: z.array(PlayingCardSchema),
  discardPile: z.array(PlayingCardSchema),
  selectedCardIds: z.array(z.string()),
  jokers: z.array(JokerItemSchema),
  consumables: z.array(ConsumableItemSchema),
  shopItems: z.array(ShopItemSchema),
  shopPacks: z.array(BoosterPackSchema),
  rerollCost: z.number(),
  targetScore: z.number(),
  roundScore: z.number(),
  handLevels: z.record(
    PokerHandNameSchema,
    z.object({
      level: z.number(),
      chips: z.number(),
      mult: z.number(),
      playedCount: z.number().default(0),
    })
  ),
  runStats: RunStatsSchema,
});

export type SavedRunState = z.infer<typeof SavedRunStateSchema>;
