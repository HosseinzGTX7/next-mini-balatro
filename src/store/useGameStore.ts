import { create } from "zustand";
import { createGameSlice, type CombinedStore } from "./slices/gameSlice";
import { createScoreSlice } from "./slices/scoreSlice";
import { createJokerSlice } from "./slices/jokerSlice";
import { createShopSlice } from "./slices/shopSlice";

/**
 * Unified Zustand Game Store for Mini-Balatro.
 * Composed of modular slices with pure immutable updates.
 */
export const useGameStore = create<CombinedStore>()((...a) => ({
  ...createGameSlice(...a),
  ...createScoreSlice(...a),
  ...createJokerSlice(...a),
  ...createShopSlice(...a),
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
export const useLastRoundBonus = () => useGameStore((state) => state.lastRoundBonus);
export const useHandChips = () => useGameStore((state) => state.currentHandChips);
export const useHandMult = () => useGameStore((state) => state.currentHandMult);
export const useActivePokerHand = () => useGameStore((state) => state.activePokerHand);

export const useJokers = () => useGameStore((state) => state.jokers);
export const useMaxJokers = () => useGameStore((state) => state.maxJokers);

export const useConsumables = () => useGameStore((state) => state.consumables);
export const useMaxConsumables = () => useGameStore((state) => state.maxConsumables);
export const useShopItems = () => useGameStore((state) => state.shopItems);
export const useShopPacks = () => useGameStore((state) => state.shopPacks);
export const useRerollCost = () => useGameStore((state) => state.rerollCost);
export const useActivePackSession = () => useGameStore((state) => state.activePackSession);
export const useRunStats = () => useGameStore((state) => state.runStats);
export const useSeed = () => useGameStore((state) => state.seed);
