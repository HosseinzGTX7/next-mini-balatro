import { PlayingCard, CardSuit } from "@/types";
import {
  PokerHandName,
  HandEvaluationResult,
} from "../schemas/scoring.schema";
import { getRankNumericValue } from "@/features/poker/services/card-factory.service";
import { BASE_POKER_HANDS } from "@/lib/constants";
import type { HandLevelData } from "@/types";

/**
 * Checks if a card can count as a specific suit (matches suit or is a Wild card).
 */
function cardMatchesSuit(card: PlayingCard, targetSuit: CardSuit): boolean {
  if (card.enhancement === "stone") return false;
  if (card.enhancement === "wild") return true;
  return card.suit === targetSuit;
}

/**
 * Checks if a group of cards all share the same suit (taking Wilds into account).
 */
function isFlushSuit(cards: PlayingCard[]): { isFlush: boolean; suit?: CardSuit } {
  const nonStone = cards.filter((c) => c.enhancement !== "stone");
  if (nonStone.length < 5) return { isFlush: false };

  const possibleSuits: CardSuit[] = ["hearts", "diamonds", "clubs", "spades"];
  for (const suit of possibleSuits) {
    if (nonStone.every((card) => cardMatchesSuit(card, suit))) {
      return { isFlush: true, suit };
    }
  }

  return { isFlush: false };
}

/**
 * Checks if cards form a 5-card Straight (including Ace-low A-2-3-4-5 and Ace-high 10-J-Q-K-A).
 */
function isStraightHand(cards: PlayingCard[]): {
  isStraight: boolean;
  sortedCards: PlayingCard[];
} {
  const eligible = cards.filter((c) => c.enhancement !== "stone");
  if (eligible.length < 5) return { isStraight: false, sortedCards: [] };

  // Get unique rank values
  const rankMap = new Map<number, PlayingCard>();
  for (const card of eligible) {
    const val = getRankNumericValue(card.rank);
    if (!rankMap.has(val)) {
      rankMap.set(val, card);
    }
  }

  const uniqueVals = Array.from(rankMap.keys()).sort((a, b) => a - b);
  if (uniqueVals.length < 5) return { isStraight: false, sortedCards: [] };

  // Check 5 consecutive values
  for (let i = 0; i <= uniqueVals.length - 5; i++) {
    const slice = uniqueVals.slice(i, i + 5);
    if (
      slice[1] === slice[0] + 1 &&
      slice[2] === slice[0] + 2 &&
      slice[3] === slice[0] + 3 &&
      slice[4] === slice[0] + 4
    ) {
      const scoringCards = slice.map((val) => rankMap.get(val)!);
      return { isStraight: true, sortedCards: scoringCards };
    }
  }

  // Check Ace-low straight: A (14), 2, 3, 4, 5
  if (
    rankMap.has(14) &&
    rankMap.has(2) &&
    rankMap.has(3) &&
    rankMap.has(4) &&
    rankMap.has(5)
  ) {
    const scoringCards = [
      rankMap.get(14)!,
      rankMap.get(2)!,
      rankMap.get(3)!,
      rankMap.get(4)!,
      rankMap.get(5)!,
    ];
    return { isStraight: true, sortedCards: scoringCards };
  }

  return { isStraight: false, sortedCards: [] };
}

/**
 * Pure algorithmic poker hand evaluator for Mini-Balatro.
 * Evaluates 1 to 5 played cards, identifying the hand type, base chips/mult,
 * and the specific scoring card IDs.
 */
export function evaluatePokerHand(
  playedCards: PlayingCard[],
  handLevels: Record<PokerHandName, HandLevelData> = BASE_POKER_HANDS
): HandEvaluationResult {
  if (playedCards.length === 0) {
    const base = handLevels["High Card"] || BASE_POKER_HANDS["High Card"];
    return {
      handName: "High Card",
      scoringCardIds: [],
      baseChips: base.chips,
      baseMult: base.mult,
      level: base.level,
    };
  }

  const nonStoneCards = playedCards.filter((c) => c.enhancement !== "stone");

  // Group by rank
  const rankGroups = new Map<string, PlayingCard[]>();
  for (const card of nonStoneCards) {
    const group = rankGroups.get(card.rank) || [];
    group.push(card);
    rankGroups.set(card.rank, group);
  }

  const groupCounts = Array.from(rankGroups.values()).sort(
    (a, b) => b.length - a.length
  );

  const { isFlush } = isFlushSuit(playedCards);
  const { isStraight, sortedCards: straightCards } = isStraightHand(playedCards);

  // Helper to construct result
  const buildResult = (
    handName: PokerHandName,
    scoringCards: PlayingCard[]
  ): HandEvaluationResult => {
    const levelData = handLevels[handName] || BASE_POKER_HANDS[handName];
    return {
      handName,
      scoringCardIds: scoringCards.map((c) => c.id),
      baseChips: levelData.chips,
      baseMult: levelData.mult,
      level: levelData.level,
    };
  };

  // 1. Flush Five (5 of the same rank, all sharing the same suit)
  if (playedCards.length === 5 && groupCounts[0]?.length === 5 && isFlush) {
    return buildResult("Flush Five", playedCards);
  }

  // 2. Flush House (Full House where all 5 cards share the same suit)
  if (
    playedCards.length === 5 &&
    groupCounts[0]?.length === 3 &&
    groupCounts[1]?.length === 2 &&
    isFlush
  ) {
    return buildResult("Flush House", playedCards);
  }

  // 3. Five of a Kind
  if (groupCounts[0]?.length >= 5) {
    return buildResult("Five of a Kind", groupCounts[0].slice(0, 5));
  }

  // 4. Royal Flush / Straight Flush
  if (isStraight && isFlush) {
    const hasAce = straightCards.some((c) => c.rank === "A");
    const hasKing = straightCards.some((c) => c.rank === "K");
    const hasTen = straightCards.some((c) => c.rank === "10");

    if (hasAce && hasKing && hasTen) {
      return buildResult("Royal Flush", straightCards);
    }
    return buildResult("Straight Flush", straightCards);
  }

  // 5. Four of a Kind
  if (groupCounts[0]?.length >= 4) {
    return buildResult("Four of a Kind", groupCounts[0].slice(0, 4));
  }

  // 6. Full House (3 of a kind + Pair)
  if (groupCounts[0]?.length >= 3 && groupCounts[1]?.length >= 2) {
    const fullHouseCards = [
      ...groupCounts[0].slice(0, 3),
      ...groupCounts[1].slice(0, 2),
    ];
    return buildResult("Full House", fullHouseCards);
  }

  // 7. Flush (5 cards of the same suit)
  if (isFlush && nonStoneCards.length >= 5) {
    return buildResult("Flush", nonStoneCards.slice(0, 5));
  }

  // 8. Straight
  if (isStraight) {
    return buildResult("Straight", straightCards);
  }

  // 9. Three of a Kind
  if (groupCounts[0]?.length >= 3) {
    return buildResult("Three of a Kind", groupCounts[0].slice(0, 3));
  }

  // 10. Two Pair
  if (groupCounts[0]?.length >= 2 && groupCounts[1]?.length >= 2) {
    const twoPairCards = [
      ...groupCounts[0].slice(0, 2),
      ...groupCounts[1].slice(0, 2),
    ];
    return buildResult("Two Pair", twoPairCards);
  }

  // 11. Pair
  if (groupCounts[0]?.length >= 2) {
    return buildResult("Pair", groupCounts[0].slice(0, 2));
  }

  // 12. High Card
  // Highest numeric rank card scores
  if (nonStoneCards.length > 0) {
    const highestCard = [...nonStoneCards].sort(
      (a, b) => getRankNumericValue(b.rank) - getRankNumericValue(a.rank)
    )[0];
    return buildResult("High Card", [highestCard]);
  }

  // If only stone cards were played
  return buildResult("High Card", [playedCards[0]]);
}
