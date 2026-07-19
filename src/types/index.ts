import type {
  CardSuit,
  CardRank,
  CardEnhancement,
  CardEdition,
  CardSeal,
  PlayingCard,
} from "@/features/poker/schemas/card.schema";

import type {
  Deck,
  SortCriterion,
  CardSelectionPayload,
  DiscardPayload,
  PlayHandPayload,
  DrawPayload,
} from "@/features/poker/schemas/deck.schema";

export type {
  CardSuit,
  CardRank,
  CardEnhancement,
  CardEdition,
  CardSeal,
  PlayingCard,
  Deck,
  SortCriterion,
  CardSelectionPayload,
  DiscardPayload,
  PlayHandPayload,
  DrawPayload,
};

export type PokerHandName =
  | "High Card"
  | "Pair"
  | "Two Pair"
  | "Three of a Kind"
  | "Straight"
  | "Flush"
  | "Full House"
  | "Four of a Kind"
  | "Straight Flush"
  | "Royal Flush"
  | "Five of a Kind"
  | "Flush House"
  | "Flush Five";

export interface HandLevelData {
  level: number;
  chips: number;
  mult: number;
  playedCount: number;
}

export type BlindType = "small" | "big" | "boss";

export interface BossModifier {
  id: string;
  name: string;
  description: string;
  debuffSuit?: CardSuit;
  maxHandsAllowed?: number;
  minCardsRequired?: number;
}

export type JokerRarity = "common" | "uncommon" | "rare" | "legendary";

export interface JokerItem {
  id: string;
  name: string;
  rarity: JokerRarity;
  cost: number;
  sellValue: number;
  description: string;
  edition?: CardEdition;
  // Trigger logic hook keys
  triggerType: "onHandPlayed" | "onCardScored" | "onDiscard" | "passive" | "roundEnd";
  plusChips?: number;
  plusMult?: number;
  timesMult?: number;
  customData?: Record<string, unknown>;
}

export type GamePhase =
  | "menu"
  | "playing"
  | "scoring"
  | "roundWon"
  | "roundLost"
  | "shop"
  | "gameWon";

export interface ScoreState {
  currentRoundScore: number;
  targetScore: number;
  currentHandChips: number;
  currentHandMult: number;
  lastPlayedHandName: PokerHandName | null;
  scoringStep: number;
  isScoringActive: boolean;
}
