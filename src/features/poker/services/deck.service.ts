import { PlayingCard, CardSuit, CardRank } from "../schemas/card.schema";
import { DeckSchema, SortCriterion } from "../schemas/deck.schema";
import { createCard, getRankNumericValue } from "./card-factory.service";
import { MAX_HAND_SIZE } from "@/lib/constants";

export const SUITS_ORDER: CardSuit[] = ["spades", "hearts", "clubs", "diamonds"];

export const RANKS_ORDER: CardRank[] = [
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
 * Creates and validates a pristine 52-card standard deck.
 */
export function createStandardDeck(): PlayingCard[] {
  const cards: PlayingCard[] = [];

  for (const suit of SUITS_ORDER) {
    for (const rank of RANKS_ORDER) {
      cards.push(createCard(suit, rank));
    }
  }

  return DeckSchema.parse(cards);
}

/**
 * Simple 32-bit pseudo-random number generator for seeded runs.
 */
function createPrng(seedString?: string): () => number {
  if (!seedString) {
    return Math.random;
  }

  let h = 1779033703 ^ seedString.length;
  for (let i = 0; i < seedString.length; i++) {
    h = Math.imul(h ^ seedString.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }

  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

/**
 * Pure Fisher-Yates shuffle algorithm.
 */
export function shuffleDeck(deck: readonly PlayingCard[], seed?: string): PlayingCard[] {
  const result = [...deck];
  const random = createPrng(seed);

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }

  return result;
}

/**
 * Deals an initial hand from the top of the deck.
 */
export function dealInitialHand(
  deck: readonly PlayingCard[],
  handSize = MAX_HAND_SIZE
): {
  hand: PlayingCard[];
  remainingDeck: PlayingCard[];
} {
  const hand = deck.slice(0, handSize);
  const remainingDeck = deck.slice(handSize);

  return { hand, remainingDeck };
}

/**
 * Draws cards from deck to replenish the hand up to targetHandSize.
 */
export function drawCards(
  currentHand: readonly PlayingCard[],
  deck: readonly PlayingCard[],
  count?: number
): {
  hand: PlayingCard[];
  remainingDeck: PlayingCard[];
  drawnCards: PlayingCard[];
} {
  const drawNeeded = count ?? Math.max(0, MAX_HAND_SIZE - currentHand.length);
  const actualDraw = Math.min(drawNeeded, deck.length);

  const drawnCards = deck.slice(0, actualDraw);
  const remainingDeck = deck.slice(actualDraw);
  const hand = [...currentHand, ...drawnCards];

  return { hand, remainingDeck, drawnCards };
}

/**
 * Discards specific cards by id from hand and appends to discard pile.
 */
export function discardCards(
  currentHand: readonly PlayingCard[],
  discardPile: readonly PlayingCard[],
  cardIdsToDiscard: readonly string[]
): {
  hand: PlayingCard[];
  discardPile: PlayingCard[];
  discardedCards: PlayingCard[];
} {
  const discardSet = new Set(cardIdsToDiscard);
  const keptCards: PlayingCard[] = [];
  const discardedCards: PlayingCard[] = [];

  for (const card of currentHand) {
    if (discardSet.has(card.id)) {
      discardedCards.push(card);
    } else {
      keptCards.push(card);
    }
  }

  return {
    hand: keptCards,
    discardPile: [...discardPile, ...discardedCards],
    discardedCards,
  };
}

/**
 * Sorts cards either by Rank (descending) or by Suit.
 */
export function sortCards(
  cards: readonly PlayingCard[],
  criterion: SortCriterion
): PlayingCard[] {
  const copy = [...cards];

  if (criterion === "rank") {
    return copy.sort((a, b) => {
      const rankDiff = getRankNumericValue(b.rank) - getRankNumericValue(a.rank);
      if (rankDiff !== 0) return rankDiff;
      return SUITS_ORDER.indexOf(a.suit) - SUITS_ORDER.indexOf(b.suit);
    });
  }

  // Sort by suit, then by rank descending within suit
  return copy.sort((a, b) => {
    const suitDiff = SUITS_ORDER.indexOf(a.suit) - SUITS_ORDER.indexOf(b.suit);
    if (suitDiff !== 0) return suitDiff;
    return getRankNumericValue(b.rank) - getRankNumericValue(a.rank);
  });
}
