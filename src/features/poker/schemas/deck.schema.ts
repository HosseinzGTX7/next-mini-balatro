import { z } from "zod";
import { PlayingCardSchema } from "./card.schema";

export const DeckSchema = z.array(PlayingCardSchema);

export const SortCriterionSchema = z.enum(["rank", "suit"]);

export const CardSelectionPayloadSchema = z.object({
  cardId: z.string().min(1),
});

export const DiscardPayloadSchema = z.object({
  cardIds: z.array(z.string().min(1)).min(1).max(5),
});

export const PlayHandPayloadSchema = z.object({
  cardIds: z.array(z.string().min(1)).min(1).max(5),
});

export const DrawPayloadSchema = z.object({
  count: z.number().int().min(1).max(8).optional(),
});

// Single Source of Truth: Derived TypeScript Types
export type Deck = z.infer<typeof DeckSchema>;
export type SortCriterion = z.infer<typeof SortCriterionSchema>;
export type CardSelectionPayload = z.infer<typeof CardSelectionPayloadSchema>;
export type DiscardPayload = z.infer<typeof DiscardPayloadSchema>;
export type PlayHandPayload = z.infer<typeof PlayHandPayloadSchema>;
export type DrawPayload = z.infer<typeof DrawPayloadSchema>;
