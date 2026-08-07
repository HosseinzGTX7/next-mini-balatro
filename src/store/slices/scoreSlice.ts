import { StateCreator } from "zustand";
import {
  PokerHandName,
  HandLevelData,
  PlayingCard,
  JokerItem,
  HandScoreBreakdown,
} from "@/types";
import { BASE_POKER_HANDS } from "@/lib/constants";
import { calculateHandScore } from "@/features/scoring/services/scoring-engine.service";
import type { CombinedStore } from "./gameSlice";

export interface ScoreSlice {
  roundScore: number;
  targetScore: number;
  currentHandChips: number;
  currentHandMult: number;
  activePokerHand: PokerHandName | null;
  handLevels: Record<PokerHandName, HandLevelData>;
  isScoring: boolean;
  activeScoringBreakdown: HandScoreBreakdown | null;
  activeScoringCards: PlayingCard[];

  // Actions
  setTargetScore: (target: number) => void;
  addRoundScore: (points: number) => void;
  setHandChipsAndMult: (chips: number, mult: number) => void;
  setActivePokerHand: (handName: PokerHandName | null) => void;
  updateScorePreview: (
    selectedCards: PlayingCard[],
    heldCards: PlayingCard[],
    jokers?: JokerItem[]
  ) => void;
  startScoringAnimation: (
    breakdown: HandScoreBreakdown,
    playedCards: PlayingCard[]
  ) => void;
  endScoringAnimation: () => void;
  levelUpHand: (
    handName: PokerHandName,
    chipsDelta?: number,
    multDelta?: number
  ) => void;
  setIsScoring: (isScoring: boolean) => void;
  resetRoundScore: () => void;
}

export const createScoreSlice: StateCreator<
  CombinedStore,
  [],
  [],
  ScoreSlice
> = (set, get) => ({
  roundScore: 0,
  targetScore: 300,
  currentHandChips: 0,
  currentHandMult: 0,
  activePokerHand: null,
  handLevels: { ...BASE_POKER_HANDS },
  isScoring: false,
  activeScoringBreakdown: null,
  activeScoringCards: [],

  setTargetScore: (target: number) => {
    set({ targetScore: target });
  },

  addRoundScore: (points: number) => {
    set((state) => ({ roundScore: state.roundScore + points }));
  },

  setHandChipsAndMult: (chips: number, mult: number) => {
    set({
      currentHandChips: chips,
      currentHandMult: mult,
    });
  },

  setActivePokerHand: (handName: PokerHandName | null) => {
    set({ activePokerHand: handName });
  },

  updateScorePreview: (
    selectedCards: PlayingCard[],
    heldCards: PlayingCard[],
    jokers = []
  ) => {
    if (selectedCards.length === 0) {
      set({
        currentHandChips: 0,
        currentHandMult: 0,
        activePokerHand: null,
      });
      return;
    }

    const { handLevels, discardsRemaining, handsRemaining, jokers: storeJokers } = get();
    const activeJokers = jokers && jokers.length > 0 ? jokers : storeJokers;
    const result = calculateHandScore({
      playedCards: selectedCards,
      heldCards,
      handLevels,
      jokers: activeJokers,
      discardsRemaining,
      handsRemaining,
    });

    set({
      currentHandChips: result.finalChips,
      currentHandMult: result.finalMult,
      activePokerHand: result.evaluation.handName,
    });
  },

  startScoringAnimation: (
    breakdown: HandScoreBreakdown,
    playedCards: PlayingCard[]
  ) => {
    set({
      isScoring: true,
      activeScoringBreakdown: breakdown,
      activeScoringCards: playedCards,
    });
  },

  endScoringAnimation: () => {
    set({
      isScoring: false,
      activeScoringBreakdown: null,
      activeScoringCards: [],
    });
  },

  levelUpHand: (
    handName: PokerHandName,
    chipsDelta = 15,
    multDelta = 1
  ) => {
    set((state) => {
      const current = state.handLevels[handName] || BASE_POKER_HANDS[handName];
      return {
        handLevels: {
          ...state.handLevels,
          [handName]: {
            ...current,
            level: current.level + 1,
            chips: current.chips + chipsDelta,
            mult: current.mult + multDelta,
          },
        },
      };
    });
  },

  setIsScoring: (isScoring: boolean) => {
    set({ isScoring });
  },

  resetRoundScore: () => {
    set({
      roundScore: 0,
      currentHandChips: 0,
      currentHandMult: 0,
      activePokerHand: null,
      isScoring: false,
      activeScoringBreakdown: null,
      activeScoringCards: [],
    });
  },
});
