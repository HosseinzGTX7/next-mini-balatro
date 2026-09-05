import { StateCreator } from "zustand";
import { PokerHandName, HandLevelData } from "@/types";
import { BASE_POKER_HANDS } from "@/lib/constants";
import type { CombinedStore } from "./gameSlice";

export interface ScoreSlice {
  roundScore: number;
  targetScore: number;
  currentHandChips: number;
  currentHandMult: number;
  activePokerHand: PokerHandName | null;
  handLevels: Record<PokerHandName, HandLevelData>;
  isScoring: boolean;

  // Actions
  setTargetScore: (target: number) => void;
  addRoundScore: (points: number) => void;
  setHandChipsAndMult: (chips: number, mult: number) => void;
  setActivePokerHand: (handName: PokerHandName | null) => void;
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
> = (set) => ({
  roundScore: 0,
  targetScore: 300,
  currentHandChips: 0,
  currentHandMult: 0,
  activePokerHand: null,
  handLevels: { ...BASE_POKER_HANDS },
  isScoring: false,

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
    });
  },
});
