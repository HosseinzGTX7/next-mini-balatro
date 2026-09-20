import {
  PlayingCard,
  CardSuit,
  CardRank,
  CardEnhancement,
  CardEdition,
  CardSeal,
  PlayingCardSchema,
} from "../schemas/card.schema";
import { RANK_CHIP_VALUES } from "@/lib/constants";

export interface CreateCardOptions {
  id?: string;
  enhancement?: CardEnhancement;
  edition?: CardEdition;
  seal?: CardSeal;
  isDebuffed?: boolean;
}

/**
 * Creates and validates a new PlayingCard.
 */
export function createCard(
  suit: CardSuit,
  rank: CardRank,
  options?: CreateCardOptions
): PlayingCard {
  const rawCard = {
    id: options?.id ?? `${suit}-${rank}-${Math.random().toString(36).substring(2, 9)}`,
    suit,
    rank,
    chipValue: RANK_CHIP_VALUES[rank],
    enhancement: options?.enhancement ?? "none",
    edition: options?.edition ?? "base",
    seal: options?.seal ?? "none",
    isDebuffed: options?.isDebuffed ?? false,
  };

  return PlayingCardSchema.parse(rawCard);
}

/**
 * Calculates effective chips of a card taking into account base value,
 * stone cards (+50, no rank), bonus cards (+30), and foil edition (+50).
 */
export function getCardEffectiveChipValue(card: PlayingCard): number {
  if (card.isDebuffed) return 0;

  let totalChips = card.enhancement === "stone" ? 50 : card.chipValue;

  if (card.enhancement === "bonus") {
    totalChips += 30;
  }

  if (card.edition === "foil") {
    totalChips += 50;
  }

  return totalChips;
}

/**
 * Returns numeric sorting/evaluating weight of a rank (2=2 ... 10=10, J=11, Q=12, K=13, A=14).
 */
export function getRankNumericValue(rank: CardRank): number {
  switch (rank) {
    case "A":
      return 14;
    case "K":
      return 13;
    case "Q":
      return 12;
    case "J":
      return 11;
    case "10":
      return 10;
    default:
      return parseInt(rank, 10);
  }
}

/**
 * Returns a human-readable description of a card's modifier, edition, or seal.
 */
export function getCardModifierDescriptions(card: PlayingCard): string[] {
  const descriptions: string[] = [];

  if (card.enhancement === "bonus") descriptions.push("+30 extra Chips");
  if (card.enhancement === "mult") descriptions.push("+4 Mult");
  if (card.enhancement === "wild") descriptions.push("Can be used as any suit");
  if (card.enhancement === "glass") descriptions.push("X2 Mult, 1 in 4 chance to destroy");
  if (card.enhancement === "steel") descriptions.push("X1.5 Mult while in hand");
  if (card.enhancement === "stone") descriptions.push("+50 Chips, no rank or suit");
  if (card.enhancement === "gold") descriptions.push("+$3 if held in hand at end of round");

  if (card.edition === "foil") descriptions.push("Foil: +50 Chips");
  if (card.edition === "holographic") descriptions.push("Holographic: +10 Mult");
  if (card.edition === "polychrome") descriptions.push("Polychrome: X1.5 Mult");

  if (card.seal === "gold") descriptions.push("Gold Seal: Earn $3 when scored");
  if (card.seal === "red") descriptions.push("Red Seal: Retrigger this card 1 time");
  if (card.seal === "blue") descriptions.push("Blue Seal: Create a Planet card if in hand at round end");
  if (card.seal === "purple") descriptions.push("Purple Seal: Create a Tarot card when discarded");

  if (card.isDebuffed) descriptions.push("DEBUFFED: Abilities and chips disabled");

  return descriptions;
}
