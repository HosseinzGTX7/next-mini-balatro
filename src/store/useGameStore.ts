import { create } from "zustand";
import { createGameSlice, type CombinedStore } from "./slices/gameSlice";
import { createScoreSlice } from "./slices/scoreSlice";
import { createJokerSlice } from "./slices/jokerSlice";

/**
 * Unified Zustand Game Store for Mini-Balatro.
 * Composed of modular slices with pure immutable updates.
 */
export const useGameStore = create<CombinedStore>()((...a) => ({
  ...createGameSlice(...a),
  ...createScoreSlice(...a),
  ...createJokerSlice(...a),
}));

// Granular Selectors to prevent unnecessary re-renders in UI components
export const useGamePhase = () => useGameStore((state) => state.phase);
export const useAnte = () => useGameStore((state) => state.ante);
export const useRound = () => useGameStore((state) => state.round);
export const useBlindType = () => useGameStore((state) => state.blindType);
export const useHandsRemaining = () => useGameStore((state) => state.handsRemaining);
export const useDiscardsRemaining = () => useGameStore((state) => state.discardsRemaining);
export const useMoney = () => useGameStore((state) => state.money);

export const useHand = () => useGameStore((state) => state.hand);
export const useDeckCount = () => useGameStore((state) => state.deck.length);
export const useSelectedCardIds = () => useGameStore((state) => state.selectedCardIds);

export const useRoundScore = () => useGameStore((state) => state.roundScore);
export const useTargetScore = () => useGameStore((state) => state.targetScore);
export const useHandChips = () => useGameStore((state) => state.currentHandChips);
export const useHandMult = () => useGameStore((state) => state.currentHandMult);
export const useActivePokerHand = () => useGameStore((state) => state.activePokerHand);

export const useJokers = () => useGameStore((state) => state.jokers);
export const useMaxJokers = () => useGameStore((state) => state.maxJokers);
