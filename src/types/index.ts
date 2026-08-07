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

import type {
  PokerHandName,
  ScoringStepEvent,
  HandEvaluationResult,
  HandScoreBreakdown,
} from "@/features/scoring/schemas/scoring.schema";

import type {
  JokerRarity,
  JokerTriggerType,
  JokerEffectType,
  JokerCondition,
  JokerTemplate,
  JokerItem,
} from "@/features/jokers/schemas/joker.schema";

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
  PokerHandName,
  ScoringStepEvent,
  HandEvaluationResult,
  HandScoreBreakdown,
  JokerRarity,
  JokerTriggerType,
  JokerEffectType,
  JokerCondition,
  JokerTemplate,
  JokerItem,
};

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
