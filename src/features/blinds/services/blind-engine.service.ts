import { PlayingCard } from "@/features/poker/schemas/card.schema";
import { PokerHandName } from "@/features/scoring/schemas/scoring.schema";
import { ANTE_BASE_TARGETS } from "@/lib/constants";
import { BlindConfig, BossModifier } from "../schemas/blind.schema";
import { getRandomBossBlind, getRandomSkipTag } from "../data/boss-blinds";

export interface AnteBlindsPackage {
  ante: number;
  small: BlindConfig;
  big: BlindConfig;
  boss: BlindConfig;
}

/**
 * Generates the complete 3-blind package for an Ante.
 */
export function generateAnteBlinds(ante: number): AnteBlindsPackage {
  const safeAnte = Math.min(Math.max(1, ante), 8);
  const targets = ANTE_BASE_TARGETS[safeAnte] ?? ANTE_BASE_TARGETS[8];
  const boss = getRandomBossBlind(ante);

  const bossTargetScore =
    boss.id === "the_wall"
      ? targets.small * 4
      : targets.boss;

  return {
    ante,
    small: {
      type: "small",
      name: "Small Blind",
      targetScore: targets.small,
      reward: 3,
      skipTag: getRandomSkipTag(),
      isDefeated: false,
      isSkipped: false,
    },
    big: {
      type: "big",
      name: "Big Blind",
      targetScore: targets.big,
      reward: 4,
      skipTag: getRandomSkipTag(),
      isDefeated: false,
      isSkipped: false,
    },
    boss: {
      type: "boss",
      name: boss.name,
      targetScore: bossTargetScore,
      reward: 5,
      bossModifier: boss,
      isDefeated: false,
      isSkipped: false,
    },
  };
}

/**
 * Applies active Boss Blind debuffs to cards in hand or play.
 */
export function applyBossBlindToCards(
  cards: PlayingCard[],
  boss: BossModifier | null,
  playedCardIdsThisAnte: Set<string> = new Set()
): PlayingCard[] {
  if (!boss) {
    return cards.map((c) => ({ ...c, isDebuffed: false }));
  }

  return cards.map((card) => {
    let debuffed = false;

    // Suit debuff (The Club, The Goad, The Window, The Head)
    if (boss.debuffSuit && card.suit === boss.debuffSuit) {
      debuffed = true;
    }

    // The Pillar: Cards previously played this Ante
    if (boss.debuffPlayedCards && playedCardIdsThisAnte.has(card.id)) {
      debuffed = true;
    }

    return {
      ...card,
      isDebuffed: debuffed,
    };
  });
}

/**
 * Validates whether a played poker hand is permitted by the active Boss Blind.
 */
export function canPlayHandAgainstBoss(
  playedHandName: PokerHandName,
  boss: BossModifier | null,
  playedHandsThisRound: PokerHandName[],
  lockedHandTypeThisRound: PokerHandName | null
): { allowed: boolean; reason?: string } {
  if (!boss) return { allowed: true };

  // The Eye: No repeat hand types this round
  if (boss.noRepeatHandTypes && playedHandsThisRound.includes(playedHandName)) {
    return {
      allowed: false,
      reason: `The Eye: "${playedHandName}" was already played this round!`,
    };
  }

  // The Mouth: Play only 1 hand type this round
  if (
    boss.singleHandTypeOnly &&
    lockedHandTypeThisRound &&
    lockedHandTypeThisRound !== playedHandName
  ) {
    return {
      allowed: false,
      reason: `The Mouth: Must play only "${lockedHandTypeThisRound}" this round!`,
    };
  }

  return { allowed: true };
}
