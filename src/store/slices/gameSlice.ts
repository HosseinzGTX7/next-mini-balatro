import { StateCreator } from "zustand";
import {
  GamePhase,
  BlindType,
  PlayingCard,
} from "@/types";
import {
  MAX_HAND_SIZE,
  MAX_PLAYED_CARDS,
  INITIAL_HANDS,
  INITIAL_DISCARDS,
  INITIAL_MONEY,
  ANTE_BASE_TARGETS,
} from "@/lib/constants";
import { generateStandardDeck, shuffleDeck } from "@/lib/deck";
import type { ScoreSlice } from "./scoreSlice";
import type { JokerSlice } from "./jokerSlice";

export interface GameSlice {
  phase: GamePhase;
  ante: number;
  round: number; // 1: small, 2: big, 3: boss
  blindType: BlindType;
  handsRemaining: number;
  discardsRemaining: number;
  money: number;
  deck: PlayingCard[];
  hand: PlayingCard[];
  selectedCardIds: string[];
  discardPile: PlayingCard[];

  // Actions
  startGame: () => void;
  toggleCardSelection: (cardId: string) => void;
  clearSelection: () => void;
  discardSelectedCards: () => void;
  drawCards: (count?: number) => void;
  setPhase: (phase: GamePhase) => void;
  addMoney: (amount: number) => void;
  spendMoney: (amount: number) => boolean;
  useHand: () => boolean;
  advanceToNextBlind: () => void;
  resetGame: () => void;
}

export type CombinedStore = GameSlice & ScoreSlice & JokerSlice;

export const createGameSlice: StateCreator<
  CombinedStore,
  [],
  [],
  GameSlice
> = (set, get) => ({
  phase: "menu",
  ante: 1,
  round: 1,
  blindType: "small",
  handsRemaining: INITIAL_HANDS,
  discardsRemaining: INITIAL_DISCARDS,
  money: INITIAL_MONEY,
  deck: [],
  hand: [],
  selectedCardIds: [],
  discardPile: [],

  startGame: () => {
    const fullDeck = shuffleDeck(generateStandardDeck());
    const initialHand = fullDeck.slice(0, MAX_HAND_SIZE);
    const remainingDeck = fullDeck.slice(MAX_HAND_SIZE);

    set({
      phase: "playing",
      ante: 1,
      round: 1,
      blindType: "small",
      handsRemaining: INITIAL_HANDS,
      discardsRemaining: INITIAL_DISCARDS,
      money: INITIAL_MONEY,
      deck: remainingDeck,
      hand: initialHand,
      selectedCardIds: [],
      discardPile: [],
    });

    // Also update target score in score slice
    get().setTargetScore(ANTE_BASE_TARGETS[1].small);
    get().resetRoundScore();
  },

  toggleCardSelection: (cardId: string) => {
    const { selectedCardIds } = get();
    if (selectedCardIds.includes(cardId)) {
      set({
        selectedCardIds: selectedCardIds.filter((id) => id !== cardId),
      });
    } else {
      if (selectedCardIds.length >= MAX_PLAYED_CARDS) {
        return;
      }
      set({
        selectedCardIds: [...selectedCardIds, cardId],
      });
    }
  },

  clearSelection: () => {
    set({ selectedCardIds: [] });
  },

  discardSelectedCards: () => {
    const {
      discardsRemaining,
      selectedCardIds,
      hand,
      deck,
      discardPile,
    } = get();

    if (discardsRemaining <= 0 || selectedCardIds.length === 0) {
      return;
    }

    const discardedCards = hand.filter((c) => selectedCardIds.includes(c.id));
    const keptCards = hand.filter((c) => !selectedCardIds.includes(c.id));
    const drawCount = selectedCardIds.length;
    const drawnCards = deck.slice(0, drawCount);
    const newDeck = deck.slice(drawCount);

    set({
      discardsRemaining: discardsRemaining - 1,
      hand: [...keptCards, ...drawnCards],
      deck: newDeck,
      discardPile: [...discardPile, ...discardedCards],
      selectedCardIds: [],
    });
  },

  drawCards: (count?: number) => {
    const { hand, deck } = get();
    const needed = count ?? Math.max(0, MAX_HAND_SIZE - hand.length);
    if (needed <= 0 || deck.length === 0) return;

    const drawn = deck.slice(0, needed);
    const newDeck = deck.slice(needed);

    set({
      hand: [...hand, ...drawn],
      deck: newDeck,
    });
  },

  setPhase: (phase: GamePhase) => {
    set({ phase });
  },

  addMoney: (amount: number) => {
    set((state) => ({ money: state.money + amount }));
  },

  spendMoney: (amount: number) => {
    const { money } = get();
    if (money < amount) return false;
    set({ money: money - amount });
    return true;
  },

  useHand: () => {
    const { handsRemaining } = get();
    if (handsRemaining <= 0) return false;
    set({ handsRemaining: handsRemaining - 1 });
    return true;
  },

  advanceToNextBlind: () => {
    const { round, ante, deck, hand, discardPile } = get();
    let nextRound = round + 1;
    let nextAnte = ante;
    let nextBlind: BlindType = "big";

    if (nextRound === 2) {
      nextBlind = "big";
    } else if (nextRound === 3) {
      nextBlind = "boss";
    } else {
      nextRound = 1;
      nextAnte = ante + 1;
      nextBlind = "small";
    }

    // Recombine and reshuffle all cards
    const allCards = shuffleDeck([...deck, ...hand, ...discardPile]);
    const nextHand = allCards.slice(0, MAX_HAND_SIZE);
    const remainingDeck = allCards.slice(MAX_HAND_SIZE);

    const anteTargets = ANTE_BASE_TARGETS[Math.min(nextAnte, 8)];
    const targetScore =
      nextBlind === "small"
        ? anteTargets.small
        : nextBlind === "big"
        ? anteTargets.big
        : anteTargets.boss;

    set({
      ante: nextAnte,
      round: nextRound,
      blindType: nextBlind,
      handsRemaining: INITIAL_HANDS,
      discardsRemaining: INITIAL_DISCARDS,
      deck: remainingDeck,
      hand: nextHand,
      discardPile: [],
      selectedCardIds: [],
      phase: "playing",
    });

    get().setTargetScore(targetScore);
    get().resetRoundScore();
  },

  resetGame: () => {
    set({
      phase: "menu",
      ante: 1,
      round: 1,
      blindType: "small",
      handsRemaining: INITIAL_HANDS,
      discardsRemaining: INITIAL_DISCARDS,
      money: INITIAL_MONEY,
      deck: [],
      hand: [],
      selectedCardIds: [],
      discardPile: [],
    });
    get().resetRoundScore();
    get().clearJokers();
  },
});
