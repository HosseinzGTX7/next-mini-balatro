import { StateCreator } from "zustand";
import {
  GamePhase,
  BlindType,
  PlayingCard,
  SortCriterion,
  HandScoreBreakdown,
  BossModifier,
  SkipTag,
  PokerHandName,
} from "@/types";
import {
  MAX_HAND_SIZE,
  MAX_PLAYED_CARDS,
  INITIAL_HANDS,
  INITIAL_DISCARDS,
  INITIAL_MONEY,
  MAX_ANTE,
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
import {
  AnteBlindsPackage,
  generateAnteBlinds,
  applyBossBlindToCards,
  canPlayHandAgainstBoss,
} from "@/features/blinds/services/blind-engine.service";
import { soundEngine } from "@/lib/sound";
import type { ScoreSlice } from "./scoreSlice";
import type { JokerSlice } from "./jokerSlice";
import type { ShopSlice } from "./shopSlice";

export interface GameSlice {
  phase: GamePhase;
  ante: number;
  round: number; // 1: small, 2: big, 3: boss
  blindType: BlindType;
  currentBlinds: AnteBlindsPackage | null;
  activeBossModifier: BossModifier | null;
  playedHandsThisRound: PokerHandName[];
  lockedHandTypeThisRound: PokerHandName | null;
  playedCardIdsThisAnte: string[];
  currentSkipTags: SkipTag[];
  blindWarningMessage: string | null;
  handsRemaining: number;
  discardsRemaining: number;
  money: number;
  seed?: string;
  deck: PlayingCard[];
  hand: PlayingCard[];
  selectedCardIds: string[];
  discardPile: PlayingCard[];
  lastRoundBonus: { reward: number; handsBonus: number; interest: number } | null;

  // Actions
  startGame: (seed?: string) => void;
  selectBlind: (blindType: BlindType) => void;
  skipBlind: (blindType: "small" | "big") => void;
  setBlindWarningMessage: (message: string | null) => void;
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

export type CombinedStore = GameSlice & ScoreSlice & JokerSlice & ShopSlice;

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
  currentBlinds: null,
  activeBossModifier: null,
  playedHandsThisRound: [],
  lockedHandTypeThisRound: null,
  playedCardIdsThisAnte: [],
  currentSkipTags: [],
  blindWarningMessage: null,
  handsRemaining: INITIAL_HANDS,
  discardsRemaining: INITIAL_DISCARDS,
  money: INITIAL_MONEY,
  seed: undefined,
  deck: [],
  hand: [],
  selectedCardIds: [],
  discardPile: [],
  lastRoundBonus: null,

  startGame: (seed?: string) => {
    const rawDeck = createStandardDeck();
    const shuffled = shuffleDeck(rawDeck, seed);
    const { hand: initialHand, remainingDeck } = dealInitialHand(shuffled, MAX_HAND_SIZE);
    const starterJoker = createJoker("joker");
    const blinds = generateAnteBlinds(1);

    set({
      phase: "blindSelect",
      ante: 1,
      round: 1,
      blindType: "small",
      currentBlinds: blinds,
      activeBossModifier: null,
      playedHandsThisRound: [],
      lockedHandTypeThisRound: null,
      playedCardIdsThisAnte: [],
      currentSkipTags: [],
      blindWarningMessage: null,
      handsRemaining: INITIAL_HANDS,
      discardsRemaining: INITIAL_DISCARDS,
      money: INITIAL_MONEY,
      seed,
      deck: remainingDeck,
      hand: initialHand,
      selectedCardIds: [],
      discardPile: [],
      jokers: [starterJoker],
      lastRoundBonus: null,
    });

    get().setTargetScore(blinds.small.targetScore);
    get().resetRoundScore();
  },

  selectBlind: (blindType: BlindType) => {
    const { currentBlinds, ante, seed, deck, hand, discardPile, playedCardIdsThisAnte } = get();
    if (!currentBlinds) return;

    const blind = currentBlinds[blindType];
    const isBoss = blindType === "boss";
    const boss = isBoss ? blind.bossModifier ?? null : null;

    let targetHands = INITIAL_HANDS;
    let targetDiscards = INITIAL_DISCARDS;
    let targetHandSize = MAX_HAND_SIZE;

    if (boss) {
      if (boss.maxHands !== undefined) targetHands = boss.maxHands;
      if (boss.maxDiscards !== undefined) targetDiscards = boss.maxDiscards;
      if (boss.handSizeDelta !== undefined) {
        targetHandSize = Math.max(1, MAX_HAND_SIZE + boss.handSizeDelta);
      }
    }

    // Recombine all cards and deal fresh hand for chosen blind
    const allCards = [...deck, ...hand, ...discardPile];
    const reshuffled = shuffleDeck(
      allCards.length >= 52 ? allCards : createStandardDeck(),
      seed ? `${seed}-${ante}-${blindType}` : undefined
    );
    const { hand: rawHand, remainingDeck } = dealInitialHand(reshuffled, targetHandSize);

    // Apply active boss blind debuffs to cards
    const debuffedHand = applyBossBlindToCards(rawHand, boss, new Set(playedCardIdsThisAnte));

    set({
      phase: "playing",
      blindType,
      round: blindType === "small" ? 1 : blindType === "big" ? 2 : 3,
      handsRemaining: targetHands,
      discardsRemaining: targetDiscards,
      deck: remainingDeck,
      hand: debuffedHand,
      selectedCardIds: [],
      discardPile: [],
      activeBossModifier: boss,
      playedHandsThisRound: [],
      lockedHandTypeThisRound: null,
      blindWarningMessage: null,
    });

    get().setTargetScore(blind.targetScore);
    get().resetRoundScore();
    get().updateScorePreview([], debuffedHand);
  },

  skipBlind: (blindType: "small" | "big") => {
    const { currentBlinds, money, ante, jokers, maxJokers } = get();
    if (!currentBlinds) return;

    const blind = currentBlinds[blindType];
    const tag = blind.skipTag;
    let earnedCash = 0;

    if (tag) {
      switch (tag.type) {
        case "economy":
          earnedCash = Math.min(15, Math.max(0, money));
          break;
        case "foil":
          if (jokers.length < maxJokers) {
            get().addJoker(createJoker("joker", "foil"));
          } else {
            earnedCash = 10;
          }
          break;
        case "holographic":
          if (jokers.length < maxJokers) {
            get().addJoker(createJoker("joker", "holographic"));
          } else {
            earnedCash = 10;
          }
          break;
        case "polychrome":
          if (jokers.length < maxJokers) {
            get().addJoker(createJoker("joker", "polychrome"));
          } else {
            earnedCash = 15;
          }
          break;
        case "rare":
          if (jokers.length < maxJokers) {
            get().addJoker(createJoker("baron"));
          } else {
            earnedCash = 10;
          }
          break;
        case "d6":
          earnedCash = 10;
          break;
        case "speed":
          earnedCash = 5 * ante;
          break;
        case "handy":
          earnedCash = 8;
          break;
      }
    }

    const updatedBlinds: AnteBlindsPackage = {
      ...currentBlinds,
      [blindType]: { ...blind, isSkipped: true },
    };

    set({
      money: money + earnedCash,
      currentBlinds: updatedBlinds,
      currentSkipTags: tag ? [...get().currentSkipTags, tag] : get().currentSkipTags,
    });

    // Advance to next blind
    if (blindType === "small") {
      set({ blindType: "big", round: 2 });
    } else {
      set({ blindType: "boss", round: 3 });
    }
  },

  setBlindWarningMessage: (message: string | null) => {
    set({ blindWarningMessage: message });
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

    set({ selectedCardIds: nextSelected, blindWarningMessage: null });

    const selectedCards = hand.filter((c) => nextSelected.includes(c.id));
    const heldCards = hand.filter((c) => !nextSelected.includes(c.id));
    get().updateScorePreview(selectedCards, heldCards, jokers);
  },

  clearSelection: () => {
    set({ selectedCardIds: [], blindWarningMessage: null });
    get().updateScorePreview([], [], []);
  },

  discardSelectedCards: () => {
    const {
      discardsRemaining,
      selectedCardIds,
      hand,
      deck,
      discardPile,
      activeBossModifier,
      playedCardIdsThisAnte,
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

    // Apply boss debuffs to replenished hand
    const debuffedHand = applyBossBlindToCards(
      replenishedHand,
      activeBossModifier,
      new Set(playedCardIdsThisAnte)
    );

    // If The Fish is active, mark newly drawn cards face down
    const finalHand = activeBossModifier?.cardsFaceDown
      ? debuffedHand.map((c) =>
          selectedCardIds.length > 0 && !keptHand.some((k) => k.id === c.id)
            ? { ...c, isFaceDown: true }
            : c
        )
      : debuffedHand;

    set({
      discardsRemaining: discardsRemaining - 1,
      hand: finalHand,
      deck: remainingDeck,
      discardPile: newDiscardPile,
      selectedCardIds: [],
      blindWarningMessage: null,
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
      activeBossModifier,
      playedHandsThisRound,
      lockedHandTypeThisRound,
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

    // Validate play against active Boss Blind rules (The Eye, The Mouth)
    const bossCheck = canPlayHandAgainstBoss(
      result.evaluation.handName,
      activeBossModifier,
      playedHandsThisRound,
      lockedHandTypeThisRound
    );

    if (!bossCheck.allowed) {
      soundEngine.playDefeatSound();
      set({ blindWarningMessage: bossCheck.reason ?? "Invalid hand for this Boss Blind!" });
      return null;
    }

    // The Arm: decrease level of played poker hand by 1
    if (activeBossModifier?.degradesHandLevel) {
      get().levelUpHand(result.evaluation.handName, -1, 0);
    }

    // Track played hand types and cards
    const newPlayedHands = [...playedHandsThisRound, result.evaluation.handName];
    const newLocked =
      activeBossModifier?.singleHandTypeOnly && !lockedHandTypeThisRound
        ? result.evaluation.handName
        : lockedHandTypeThisRound;

    const newPlayedCardIds = activeBossModifier?.debuffPlayedCards
      ? [...get().playedCardIdsThisAnte, ...selectedCardIds]
      : get().playedCardIdsThisAnte;

    set({
      phase: "scoring",
      blindWarningMessage: null,
      playedHandsThisRound: newPlayedHands,
      lockedHandTypeThisRound: newLocked,
      playedCardIdsThisAnte: newPlayedCardIds,
    });

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
      currentBlinds,
      blindType,
      activeBossModifier,
      playedCardIdsThisAnte,
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

    // Apply boss debuffs to replenished hand
    const debuffedHand = applyBossBlindToCards(
      replenishedHand,
      activeBossModifier,
      new Set(playedCardIdsThisAnte)
    );

    const finalHand = activeBossModifier?.cardsFaceDown
      ? debuffedHand.map((c) =>
          selectedCardIds.length > 0 && !keptHand.some((k) => k.id === c.id)
            ? { ...c, isFaceDown: true }
            : c
        )
      : debuffedHand;

    // Determine win/loss condition
    let nextPhase: GamePhase = "playing";
    let earnedMoney = 0;
    let roundBonus: { reward: number; handsBonus: number; interest: number } | null = null;

    if (newRoundScore >= targetScore) {
      if (currentBlinds) {
        const updatedBlinds: AnteBlindsPackage = {
          ...currentBlinds,
          [blindType]: { ...currentBlinds[blindType], isDefeated: true },
        };
        set({ currentBlinds: updatedBlinds });
      }

      nextPhase = "roundWon";
      const baseReward = currentBlinds ? currentBlinds[blindType].reward : 3;
      const interest = Math.min(5, Math.floor(money / 5));
      earnedMoney = baseReward + remainingHands + interest;
      roundBonus = {
        reward: baseReward,
        handsBonus: remainingHands,
        interest,
      };
    } else if (remainingHands <= 0) {
      nextPhase = "roundLost";
    }

    set({
      roundScore: newRoundScore,
      handsRemaining: remainingHands,
      hand: finalHand,
      deck: remainingDeck,
      discardPile: newDiscardPile,
      selectedCardIds: [],
      phase: nextPhase,
      money: money + earnedMoney,
      lastRoundBonus: roundBonus ?? get().lastRoundBonus,
    });

    get().updateScorePreview([], [], []);
    get().endScoringAnimation();
  },

  drawCards: (count?: number) => {
    const { hand, deck, activeBossModifier, playedCardIdsThisAnte } = get();
    const { hand: newHand, remainingDeck } = drawCards(hand, deck, count);
    const debuffedHand = applyBossBlindToCards(
      newHand,
      activeBossModifier,
      new Set(playedCardIdsThisAnte)
    );
    set({ hand: debuffedHand, deck: remainingDeck });
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
    const { blindType, ante } = get();

    // Resolve round-end Jokers (extinctions and decay)
    get().resolveRoundEndJokers();

    if (blindType === "boss") {
      if (ante >= MAX_ANTE) {
        soundEngine.playWinFanfare();
        set({ phase: "gameWon" });
        return;
      }

      const nextAnte = ante + 1;
      const nextBlinds = generateAnteBlinds(nextAnte);

      set({
        ante: nextAnte,
        round: 1,
        blindType: "small",
        currentBlinds: nextBlinds,
        activeBossModifier: null,
        playedCardIdsThisAnte: [],
        playedHandsThisRound: [],
        lockedHandTypeThisRound: null,
        phase: "blindSelect",
      });
      return;
    }

    // Advance to next blind in Ante (small -> big, or big -> boss)
    const nextBlind: BlindType = blindType === "small" ? "big" : "boss";
    const nextRound = blindType === "small" ? 2 : 3;

    set({
      blindType: nextBlind,
      round: nextRound,
      phase: "blindSelect",
    });
  },

  resetGame: () => {
    set({
      phase: "menu",
      ante: 1,
      round: 1,
      blindType: "small",
      currentBlinds: null,
      activeBossModifier: null,
      playedHandsThisRound: [],
      lockedHandTypeThisRound: null,
      playedCardIdsThisAnte: [],
      currentSkipTags: [],
      blindWarningMessage: null,
      handsRemaining: INITIAL_HANDS,
      discardsRemaining: INITIAL_DISCARDS,
      money: INITIAL_MONEY,
      seed: undefined,
      deck: [],
      hand: [],
      selectedCardIds: [],
      discardPile: [],
      lastRoundBonus: null,
    });
    get().resetRoundScore();
    get().clearJokers();
  },
});
