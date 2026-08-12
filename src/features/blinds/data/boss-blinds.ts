import { BossModifier, SkipTag } from "../schemas/blind.schema";

export const BOSS_BLINDS: Record<string, BossModifier> = {
  the_club: {
    id: "the_club",
    name: "The Club",
    description: "All Club cards are debuffed",
    debuffSuit: "clubs",
    targetMultiplier: 2,
  },
  the_goad: {
    id: "the_goad",
    name: "The Goad",
    description: "All Spade cards are debuffed",
    debuffSuit: "spades",
    targetMultiplier: 2,
  },
  the_window: {
    id: "the_window",
    name: "The Window",
    description: "All Diamond cards are debuffed",
    debuffSuit: "diamonds",
    targetMultiplier: 2,
  },
  the_head: {
    id: "the_head",
    name: "The Head",
    description: "All Heart cards are debuffed",
    debuffSuit: "hearts",
    targetMultiplier: 2,
  },
  the_pillar: {
    id: "the_pillar",
    name: "The Pillar",
    description: "Cards played previously this Ante are debuffed",
    targetMultiplier: 2,
    debuffPlayedCards: true,
  },
  the_needle: {
    id: "the_needle",
    name: "The Needle",
    description: "Play only 1 hand",
    targetMultiplier: 2,
    maxHands: 1,
  },
  the_arm: {
    id: "the_arm",
    name: "The Arm",
    description: "Decrease level of played poker hand by 1",
    targetMultiplier: 2,
    degradesHandLevel: true,
  },
  the_eye: {
    id: "the_eye",
    name: "The Eye",
    description: "No repeat hand types this round",
    targetMultiplier: 2,
    noRepeatHandTypes: true,
  },
  the_mouth: {
    id: "the_mouth",
    name: "The Mouth",
    description: "Play only 1 hand type this round",
    targetMultiplier: 2,
    singleHandTypeOnly: true,
  },
  the_fish: {
    id: "the_fish",
    name: "The Fish",
    description: "Cards drawn face down after each play",
    targetMultiplier: 2,
    cardsFaceDown: true,
  },
  the_water: {
    id: "the_water",
    name: "The Water",
    description: "Start with 0 discards",
    targetMultiplier: 2,
    maxDiscards: 0,
  },
  the_manacle: {
    id: "the_manacle",
    name: "The Manacle",
    description: "-1 Hand Size",
    targetMultiplier: 2,
    handSizeDelta: -1,
  },
  the_wall: {
    id: "the_wall",
    name: "The Wall",
    description: "Extra large blind (4x base target score)",
    targetMultiplier: 4,
  },
};

export const SKIP_TAGS: Record<string, SkipTag> = {
  economy: {
    type: "economy",
    name: "Economy Tag",
    description: "Doubles your money (max +$15)",
    value: 15,
  },
  foil: {
    type: "foil",
    name: "Foil Tag",
    description: "Grants a free Foil Joker (+50 Chips)",
    value: 50,
  },
  holographic: {
    type: "holographic",
    name: "Holographic Tag",
    description: "Grants a free Holographic Joker (+10 Mult)",
    value: 10,
  },
  polychrome: {
    type: "polychrome",
    name: "Polychrome Tag",
    description: "Grants a free Polychrome Joker (1.5x Mult)",
    value: 1.5,
  },
  rare: {
    type: "rare",
    name: "Rare Tag",
    description: "Grants a free Rare Joker",
    value: 0,
  },
  d6: {
    type: "d6",
    name: "D6 Tag",
    description: "Gives +$10 instant cash",
    value: 10,
  },
  speed: {
    type: "speed",
    name: "Speed Tag",
    description: "Gives +$5 for each completed Ante",
    value: 5,
  },
  handy: {
    type: "handy",
    name: "Handy Tag",
    description: "Gives +$8 instant cash",
    value: 8,
  },
};

/**
 * Returns a deterministic or pseudo-random Boss Blind for the given Ante.
 */
export function getRandomBossBlind(seedOffset = 0): BossModifier {
  const bosses = Object.values(BOSS_BLINDS);
  const index = Math.floor(Math.random() * bosses.length + seedOffset) % bosses.length;
  return bosses[index];
}

/**
 * Returns a random skip tag for Small or Big blinds.
 */
export function getRandomSkipTag(): SkipTag {
  const tags = Object.values(SKIP_TAGS);
  const index = Math.floor(Math.random() * tags.length);
  return tags[index];
}
