import { z } from "zod";

export const CardSuitSchema = z.enum(["hearts", "diamonds", "clubs", "spades"]);

export const CardRankSchema = z.enum([
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
]);

export const CardEnhancementSchema = z.enum([
  "none",
  "bonus", // +30 Chips
  "mult", // +4 Mult
  "wild", // Counts as any suit
  "glass", // X2 Mult, 1 in 4 chance to destroy when scored
  "steel", // X1.5 Mult while held in hand
  "stone", // +50 Chips, no rank or suit
  "gold", // +$3 if held in hand at end of round
]);

export const CardEditionSchema = z.enum([
  "base",
  "foil", // +50 Chips
  "holographic", // +10 Mult
  "polychrome", // X1.5 Mult
]);

export const CardSealSchema = z.enum([
  "none",
  "gold", // Earns $3 when played and scored
  "red", // Retriggers this card 1 time
  "blue", // Creates a Planet card if held in hand at end of round
  "purple", // Creates a Tarot card when discarded
]);

export const PlayingCardSchema = z.object({
  id: z.string().min(1),
  suit: CardSuitSchema,
  rank: CardRankSchema,
  chipValue: z.number().int().min(0),
  enhancement: CardEnhancementSchema.default("none"),
  edition: CardEditionSchema.default("base"),
  seal: CardSealSchema.default("none"),
  isDebuffed: z.boolean().default(false),
});

// Single Source of Truth: Derived TypeScript Types
export type CardSuit = z.infer<typeof CardSuitSchema>;
export type CardRank = z.infer<typeof CardRankSchema>;
export type CardEnhancement = z.infer<typeof CardEnhancementSchema>;
export type CardEdition = z.infer<typeof CardEditionSchema>;
export type CardSeal = z.infer<typeof CardSealSchema>;
export type PlayingCard = z.infer<typeof PlayingCardSchema>;
