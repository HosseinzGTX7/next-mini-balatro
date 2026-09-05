import { PlayingCard, CardSuit, CardRank } from "@/types";
import { RANK_CHIP_VALUES } from "./constants";

export const SUITS: CardSuit[] = ["hearts", "diamonds", "clubs", "spades"];

export const RANKS: CardRank[] = [
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
];

/**
 * Generates a clean 52-card standard deck.
 */
export function generateStandardDeck(): PlayingCard[] {
  const deck: PlayingCard[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        id: `${suit}-${rank}-${Math.random().toString(36).substring(2, 9)}`,
        suit,
        rank,
        chipValue: RANK_CHIP_VALUES[rank],
        enhancement: "none",
        edition: "base",
        seal: "none",
        isDebuffed: false,
      });
    }
  }
  return deck;
}

/**
 * Fisher-Yates shuffle algorithm.
 */
export function shuffleDeck<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
