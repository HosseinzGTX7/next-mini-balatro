import { CardRank, PokerHandName, HandLevelData } from "@/types";

export const MAX_HAND_SIZE = 8;
export const MAX_PLAYED_CARDS = 5;
export const MAX_JOKER_SLOTS = 5;
export const MAX_CONSUMABLES = 2;
export const BASE_REROLL_COST = 5;
export const MAX_INTEREST = 5;
export const INITIAL_HANDS = 4;
export const INITIAL_DISCARDS = 3;
export const INITIAL_MONEY = 4;
export const MAX_ANTE = 8;

export const RANK_CHIP_VALUES: Record<CardRank, number> = {
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  "10": 10,
  J: 10,
  Q: 10,
  K: 10,
  A: 11,
};

export const BASE_POKER_HANDS: Record<PokerHandName, HandLevelData> = {
  "High Card": { level: 1, chips: 5, mult: 1, playedCount: 0 },
  Pair: { level: 1, chips: 10, mult: 2, playedCount: 0 },
  "Two Pair": { level: 1, chips: 20, mult: 2, playedCount: 0 },
  "Three of a Kind": { level: 1, chips: 30, mult: 3, playedCount: 0 },
  Straight: { level: 1, chips: 30, mult: 4, playedCount: 0 },
  Flush: { level: 1, chips: 35, mult: 4, playedCount: 0 },
  "Full House": { level: 1, chips: 40, mult: 4, playedCount: 0 },
  "Four of a Kind": { level: 1, chips: 60, mult: 7, playedCount: 0 },
  "Straight Flush": { level: 1, chips: 100, mult: 8, playedCount: 0 },
  "Royal Flush": { level: 1, chips: 100, mult: 8, playedCount: 0 },
  "Five of a Kind": { level: 1, chips: 120, mult: 12, playedCount: 0 },
  "Flush House": { level: 1, chips: 140, mult: 14, playedCount: 0 },
  "Flush Five": { level: 1, chips: 160, mult: 16, playedCount: 0 },
};

export const ANTE_BASE_TARGETS: Record<number, { small: number; big: number; boss: number }> = {
  1: { small: 300, big: 450, boss: 600 },
  2: { small: 800, big: 1200, boss: 1600 },
  3: { small: 2000, big: 3000, boss: 4000 },
  4: { small: 5000, big: 7500, boss: 10000 },
  5: { small: 11000, big: 16500, boss: 22000 },
  6: { small: 20000, big: 30000, boss: 40000 },
  7: { small: 35000, big: 52500, boss: 70000 },
  8: { small: 50000, big: 75000, boss: 100000 },
};
