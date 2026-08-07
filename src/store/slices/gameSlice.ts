import { StateCreator } from "zustand";
import {
  GamePhase,
  BlindType,
  PlayingCard,
  SortCriterion,
  HandScoreBreakdown,
} from "@/types";
import {
  MAX_HAND_SIZE,
  MAX_PLAYED_CARDS,
  INITIAL_HANDS,
  INITIAL_DISCARDS,
  INITIAL_MONEY,
  ANTE_BASE_TARGETS,
} from "@/lib/constants";
import {
  createStandardDeck,
  shuffleDeck,
  dealInitialHand,
  drawCards,
  discardCards,
  sortCards,
} from "@/features/poker/services/deck.service";
import { calculateHandScore } from "@/features/scoring/services/scoring-engine.service";
import { createJoker } from "@/features/jokers/data/joker-definitions";
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
  seed?: string;
  deck: PlayingCard[];
  hand: PlayingCard[];
  selectedCardIds: string[];
  discardPile: PlayingCard[];

  // Actions
  startGame: (seed?: string) => void;
  toggleCardSelection: (cardId: string) => void;
  clearSelection: () => void;
  discardSelectedCards: () => void;
  playSelectedHand: () => HandScoreBreakdown | null;
  commitHandScore: (breakdown: HandScoreBreakdown) => void;
  drawCards: (count?: number) => void;
  sortHand: (criterion: SortCriterion) => void;
  reorderHandCards: (fromIndex: number, toIndex: number) => void;
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
  seed: undefined,
  deck: [],
  hand: [],
  selectedCardIds: [],
  discardPile: [],

  startGame: (seed?: string) => {
    const rawDeck = createStandardDeck();
    const shuffled = shuffleDeck(rawDeck, seed);
    const { hand: initialHand, remainingDeck } = dealInitialHand(shuffled, MAX_HAND_SIZE);
    const starterJoker = createJoker("joker");

    set({
      phase: "playing",
      ante: 1,
      round: 1,
      blindType: "small",
      handsRemaining: INITIAL_HANDS,
      discardsRemaining: INITIAL_DISCARDS,
      money: INITIAL_MONEY,
      seed,
      deck: remainingDeck,
      hand: initialHand,
      selectedCardIds: [],
      discardPile: [],
      jokers: [starterJoker],
    });

    get().setTargetScore(ANTE_BASE_TARGETS[1].small);
    get().resetRoundScore();
  },

  toggleCardSelection: (cardId: string) => {
    const { selectedCardIds, hand, jokers } = get();
    let nextSelected: string[];

    if (selectedCardIds.includes(cardId)) {
      nextSelected = selectedCardIds.filter((id) => id !== cardId);
    } else {
      if (selectedCardIds.length >= MAX_PLAYED_CARDS) {
        return;
      }
      nextSelected = [...selectedCardIds, cardId];
    }

    set({ selectedCardIds: nextSelected });

    const selectedCards = hand.filter((c) => nextSelected.includes(c.id));
    const heldCards = hand.filter((c) => !nextSelected.includes(c.id));
    get().updateScorePreview(selectedCards, heldCards, jokers);
  },

  clearSelection: () => {
    set({ selectedCardIds: [] });
    get().updateScorePreview([], [], []);
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

    const {
      hand: keptHand,
      discardPile: newDiscardPile,
    } = discardCards(hand, discardPile, selectedCardIds);

    const {
      hand: replenishedHand,
      remainingDeck,
    } = drawCards(keptHand, deck, selectedCardIds.length);

    set({
      discardsRemaining: discardsRemaining - 1,
      hand: replenishedHand,
      deck: remainingDeck,
      discardPile: newDiscardPile,
      selectedCardIds: [],
    });

    get().updateScorePreview([], [], []);
  },

  playSelectedHand: () => {
    const {
      handsRemaining,
      discardsRemaining,
      selectedCardIds,
      hand,
      handLevels,
      jokers,
    } = get();

    if (handsRemaining <= 0 || selectedCardIds.length === 0) {
      return null;
    }

    const playedCards = hand.filter((c) => selectedCardIds.includes(c.id));
    const heldCards = hand.filter((c) => !selectedCardIds.includes(c.id));

    // Calculate score using pure scoring engine
    const result = calculateHandScore({
      playedCards,
      heldCards,
      handLevels,
      jokers,
      discardsRemaining,
      handsRemaining,
    });

    set({ phase: "scoring" });
    get().startScoringAnimation(result, playedCards);

    return result;
  },

  commitHandScore: (breakdown: HandScoreBreakdown) => {
    const {
      handsRemaining,
      selectedCardIds,
      hand,
      deck,
      discardPile,
      roundScore,
      targetScore,
      money,
    } = get();

    const newRoundScore = roundScore + breakdown.totalHandScore;
    const remainingHands = Math.max(0, handsRemaining - 1);

    // Discard played cards and replenish from deck
    const {
      hand: keptHand,
      discardPile: newDiscardPile,
    } = discardCards(hand, discardPile, selectedCardIds);

    const {
      hand: replenishedHand,
      remainingDeck,
    } = drawCards(keptHand, deck, selectedCardIds.length);

    // Determine win/loss condition
    let nextPhase: GamePhase = "playing";
    let earnedMoney = 0;

    if (newRoundScore >= targetScore) {
      nextPhase = "roundWon";
      // Win reward: $3 base + $1 per unused hand
      earnedMoney = 3 + remainingHands;
    } else if (remainingHands <= 0) {
      nextPhase = "roundLost";
    }

    set({
      roundScore: newRoundScore,
      handsRemaining: remainingHands,
      hand: replenishedHand,
      deck: remainingDeck,
      discardPile: newDiscardPile,
      selectedCardIds: [],
      phase: nextPhase,
      money: money + earnedMoney,
    });

    get().updateScorePreview([], [], []);
    get().endScoringAnimation();
  },

  drawCards: (count?: number) => {
    const { hand, deck } = get();
    const { hand: newHand, remainingDeck } = drawCards(hand, deck, count);

    set({
      hand: newHand,
      deck: remainingDeck,
    });
  },

  sortHand: (criterion: SortCriterion) => {
    const { hand } = get();
    const sorted = sortCards(hand, criterion);
    set({ hand: sorted });
  },

  reorderHandCards: (fromIndex: number, toIndex: number) => {
    const { hand } = get();
    if (
      fromIndex < 0 ||
      fromIndex >= hand.length ||
      toIndex < 0 ||
      toIndex >= hand.length
    ) {
      return;
    }
    const result = Array.from(hand);
    const [removed] = result.splice(fromIndex, 1);
    result.splice(toIndex, 0, removed);
    set({ hand: result });
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
    const { round, ante, deck, hand, discardPile, seed } = get();
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

    // Recombine all cards and reshuffle
    const allCards = [...deck, ...hand, ...discardPile];
    const reshuffled = shuffleDeck(allCards, seed ? `${seed}-${nextAnte}-${nextRound}` : undefined);
    const { hand: nextHand, remainingDeck } = dealInitialHand(reshuffled, MAX_HAND_SIZE);

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
    get().resolveRoundEndJokers();
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
      seed: undefined,
      deck: [],
      hand: [],
      selectedCardIds: [],
      discardPile: [],
    });
    get().resetRoundScore();
    get().clearJokers();
  },
});
