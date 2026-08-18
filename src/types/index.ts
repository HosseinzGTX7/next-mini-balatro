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

import type {
  BlindType,
  BossModifier,
  SkipTag,
  SkipTagType,
  BlindConfig,
} from "@/features/blinds/schemas/blind.schema";

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
  BlindType,
  BossModifier,
  SkipTag,
  SkipTagType,
  BlindConfig,
};

export interface HandLevelData {
  level: number;
  chips: number;
  mult: number;
  playedCount: number;
}

export type GamePhase =
  | "menu"
  | "blindSelect"
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

export type {
  RunStats,
  CareerStats,
  SavedRunState,
} from "@/features/run/schemas/run.schema";
