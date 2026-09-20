import { PlayingCard } from "@/features/poker/schemas/card.schema";
import { PokerHandName } from "@/features/scoring/schemas/scoring.schema";
import { JokerItem } from "../schemas/joker.schema";

export interface JokerScoringContext {
  playedCards: PlayingCard[];
  scoringCards: PlayingCard[];
  heldCards: PlayingCard[];
  handName: PokerHandName;
  discardsRemaining: number;
  handsRemaining: number;
  currentChips: number;
  currentMult: number;
}

export interface JokerScoringEvent {
  jokerId: string;
  jokerName: string;
  effectType: "chips" | "mult" | "xmult";
  amount: number;
  message: string;
  currentChips: number;
  currentMult: number;
  isCardTrigger?: boolean;
  cardId?: string;
}

/**
 * Resolves the effective target for a Blueprint Joker.
 * Blueprint copies the ability of the Joker immediately to its right.
 */
export function resolveBlueprintTarget(
  blueprintIndex: number,
  allJokers: JokerItem[],
  visitedIndices = new Set<number>()
): JokerItem | null {
  const targetIndex = blueprintIndex + 1;
  if (targetIndex >= allJokers.length) {
    return null;
  }

  if (visitedIndices.has(targetIndex)) {
    // Loop guard
    return null;
  }

  const candidate = allJokers[targetIndex];
  if (candidate.templateId === "blueprint") {
    visitedIndices.add(blueprintIndex);
    return resolveBlueprintTarget(targetIndex, allJokers, visitedIndices);
  }

  return candidate;
}

/**
 * Evaluates card-level Joker triggers (e.g. Greedy Joker, Lusty Joker, etc.)
 * when a specific card is scored.
 */
export function evaluateCardScoredJokers(
  card: PlayingCard,
  allJokers: JokerItem[],
  currentChips: number,
  currentMult: number
): {
  events: JokerScoringEvent[];
  updatedChips: number;
  updatedMult: number;
} {
  const events: JokerScoringEvent[] = [];
  let chips = currentChips;
  let mult = currentMult;

  allJokers.forEach((joker, index) => {
    let effectiveJoker = joker;
    let displayName = joker.name;

    if (joker.templateId === "blueprint") {
      const target = resolveBlueprintTarget(index, allJokers);
      if (!target) return;
      effectiveJoker = target;
      displayName = `Blueprint (${target.name})`;
    }

    if (effectiveJoker.triggerType !== "onCardScored") {
      return;
    }

    // Check suit matching (Wild cards match any suit unless debuffed)
    const matchesSuit =
      effectiveJoker.condition?.suits?.includes(card.suit) ||
      (card.enhancement === "wild" && !card.isDebuffed);

    if (!matchesSuit) {
      return;
    }

    if (effectiveJoker.effectType === "addMult") {
      mult += effectiveJoker.value;
      events.push({
        jokerId: joker.id,
        jokerName: displayName,
        effectType: "mult",
        amount: effectiveJoker.value,
        message: `+${effectiveJoker.value} Mult`,
        currentChips: chips,
        currentMult: mult,
        isCardTrigger: true,
        cardId: card.id,
      });
    } else if (effectiveJoker.effectType === "addChips") {
      chips += effectiveJoker.value;
      events.push({
        jokerId: joker.id,
        jokerName: displayName,
        effectType: "chips",
        amount: effectiveJoker.value,
        message: `+${effectiveJoker.value} Chips`,
        currentChips: chips,
        currentMult: mult,
        isCardTrigger: true,
        cardId: card.id,
      });
    }
  });

  return { events, updatedChips: chips, updatedMult: mult };
}

/**
 * Evaluates held-in-hand Joker triggers (e.g. Baron for Kings).
 */
export function evaluateHeldInHandJokers(
  heldCard: PlayingCard,
  allJokers: JokerItem[],
  currentChips: number,
  currentMult: number
): {
  events: JokerScoringEvent[];
  updatedChips: number;
  updatedMult: number;
} {
  const events: JokerScoringEvent[] = [];
  let chips = currentChips;
  let mult = currentMult;

  if (heldCard.isDebuffed) {
    return { events, updatedChips: chips, updatedMult: mult };
  }

  allJokers.forEach((joker, index) => {
    let effectiveJoker = joker;
    let displayName = joker.name;

    if (joker.templateId === "blueprint") {
      const target = resolveBlueprintTarget(index, allJokers);
      if (!target) return;
      effectiveJoker = target;
      displayName = `Blueprint (${target.name})`;
    }

    if (effectiveJoker.triggerType !== "onHeldInHand") {
      return;
    }

    // Baron: Each King held in hand gives 1.5x Mult
    if (effectiveJoker.templateId === "baron" && heldCard.rank === "K") {
      mult *= 1.5;
      events.push({
        jokerId: joker.id,
        jokerName: displayName,
        effectType: "xmult",
        amount: 1.5,
        message: "Held King 1.5x Mult",
        currentChips: chips,
        currentMult: mult,
        isCardTrigger: true,
        cardId: heldCard.id,
      });
    }
  });

  return { events, updatedChips: chips, updatedMult: mult };
}

/**
 * Evaluates hand-played Jokers in left-to-right order:
 * Flat chips first, Flat mult next, X-mult last, plus Joker editions!
 */
export function evaluateHandPlayedJokers(
  allJokers: JokerItem[],
  context: JokerScoringContext
): {
  events: JokerScoringEvent[];
  finalChips: number;
  finalMult: number;
} {
  const events: JokerScoringEvent[] = [];
  let chips = context.currentChips;
  let mult = context.currentMult;

  allJokers.forEach((joker, index) => {
    let effectiveJoker = joker;
    let displayName = joker.name;

    if (joker.templateId === "blueprint") {
      const target = resolveBlueprintTarget(index, allJokers);
      if (target) {
        effectiveJoker = target;
        displayName = `Blueprint (${target.name})`;
      } else {
        displayName = "Blueprint (Inactive)";
      }
    }

    // Only process onHandPlayed or custom hand-level triggers
    if (effectiveJoker.triggerType === "onHandPlayed") {
      let triggered = false;
      let effectType: "chips" | "mult" | "xmult" = "mult";
      let amount = 0;
      let message = "";

      switch (effectiveJoker.templateId) {
        case "joker":
          triggered = true;
          effectType = "mult";
          amount = 4;
          message = "+4 Mult";
          break;

        case "jolly_joker":
          // +8 Mult if played hand contains a Pair
          if (["Pair", "Two Pair", "Full House"].includes(context.handName)) {
            triggered = true;
            effectType = "mult";
            amount = 8;
            message = "+8 Mult (Pair)";
          }
          break;

        case "mad_joker":
          // +20 Mult if played hand contains a Two Pair
          if (context.handName === "Two Pair") {
            triggered = true;
            effectType = "mult";
            amount = 20;
            message = "+20 Mult (Two Pair)";
          }
          break;

        case "sly_joker":
          // +50 Chips if played hand contains a Pair
          if (["Pair", "Two Pair", "Full House"].includes(context.handName)) {
            triggered = true;
            effectType = "chips";
            amount = 50;
            message = "+50 Chips (Pair)";
          }
          break;

        case "half_joker":
          // +20 Mult if 3 or fewer cards played
          if (context.playedCards.length <= 3) {
            triggered = true;
            effectType = "mult";
            amount = 20;
            message = "+20 Mult (<=3 Cards)";
          }
          break;

        case "banner":
          // +40 Chips per remaining discard
          if (context.discardsRemaining > 0) {
            triggered = true;
            effectType = "chips";
            amount = 40 * context.discardsRemaining;
            message = `+${amount} Chips (${context.discardsRemaining} Discards)`;
          }
          break;

        case "mystic_summit":
          // +15 Mult when 0 discards remaining
          if (context.discardsRemaining === 0) {
            triggered = true;
            effectType = "mult";
            amount = 15;
            message = "+15 Mult (0 Discards)";
          }
          break;

        case "droll_joker":
          // +10 Mult if Flush
          if (
            ["Flush", "Straight Flush", "Flush House", "Flush Five"].includes(
              context.handName
            )
          ) {
            triggered = true;
            effectType = "mult";
            amount = 10;
            message = "+10 Mult (Flush)";
          }
          break;

        case "crazy_joker":
          // +12 Mult if Straight
          if (
            ["Straight", "Straight Flush", "Royal Flush"].includes(
              context.handName
            )
          ) {
            triggered = true;
            effectType = "mult";
            amount = 12;
            message = "+12 Mult (Straight)";
          }
          break;

        case "gros_michel":
          // +15 Mult
          triggered = true;
          effectType = "mult";
          amount = 15;
          message = "+15 Mult";
          break;

        case "cavendish":
          // 3x Mult
          triggered = true;
          effectType = "xmult";
          amount = 3;
          message = "3x Mult";
          break;

        case "popcorn": {
          const currentPopcornMult =
            typeof effectiveJoker.customData?.currentMult === "number"
              ? effectiveJoker.customData.currentMult
              : 20;
          if (currentPopcornMult > 0) {
            triggered = true;
            effectType = "mult";
            amount = currentPopcornMult;
            message = `+${currentPopcornMult} Mult`;
          }
          break;
        }

        case "ice_cream": {
          const currentIceCreamChips =
            typeof effectiveJoker.customData?.currentChips === "number"
              ? effectiveJoker.customData.currentChips
              : 100;
          if (currentIceCreamChips > 0) {
            triggered = true;
            effectType = "chips";
            amount = currentIceCreamChips;
            message = `+${currentIceCreamChips} Chips`;
          }
          break;
        }

        default:
          if (effectiveJoker.effectType === "addChips" && effectiveJoker.value > 0) {
            triggered = true;
            effectType = "chips";
            amount = effectiveJoker.value;
            message = `+${amount} Chips`;
          } else if (effectiveJoker.effectType === "addMult" && effectiveJoker.value > 0) {
            triggered = true;
            effectType = "mult";
            amount = effectiveJoker.value;
            message = `+${amount} Mult`;
          } else if (effectiveJoker.effectType === "multiplyMult" && effectiveJoker.value > 1) {
            triggered = true;
            effectType = "xmult";
            amount = effectiveJoker.value;
            message = `${amount}x Mult`;
          }
          break;
      }

      if (triggered) {
        if (effectType === "chips") {
          chips += amount;
        } else if (effectType === "mult") {
          mult += amount;
        } else if (effectType === "xmult") {
          mult *= amount;
        }

        events.push({
          jokerId: joker.id,
          jokerName: displayName,
          effectType,
          amount,
          message,
          currentChips: chips,
          currentMult: mult,
        });
      }
    }

    // Process Joker Editions (Foil, Holographic, Polychrome)
    if (joker.edition === "foil") {
      chips += 50;
      events.push({
        jokerId: joker.id,
        jokerName: `${displayName} (Foil)`,
        effectType: "chips",
        amount: 50,
        message: "+50 Chips",
        currentChips: chips,
        currentMult: mult,
      });
    } else if (joker.edition === "holographic") {
      mult += 10;
      events.push({
        jokerId: joker.id,
        jokerName: `${displayName} (Holo)`,
        effectType: "mult",
        amount: 10,
        message: "+10 Mult",
        currentChips: chips,
        currentMult: mult,
      });
    } else if (joker.edition === "polychrome") {
      mult *= 1.5;
      events.push({
        jokerId: joker.id,
        jokerName: `${displayName} (Poly)`,
        effectType: "xmult",
        amount: 1.5,
        message: "1.5x Mult",
        currentChips: chips,
        currentMult: mult,
      });
    }
  });

  return { events, finalChips: chips, finalMult: mult };
}

/**
 * Evaluates round end effects: extinctions (Gros Michel 1/6, Cavendish 1/1000), Popcorn decay.
 */
export function evaluateRoundEndJokers(jokers: JokerItem[]): {
  remainingJokers: JokerItem[];
  extinctJokerNames: string[];
} {
  const remaining: JokerItem[] = [];
  const extinct: string[] = [];

  for (const joker of jokers) {
    if (joker.templateId === "gros_michel") {
      // 1 in 6 chance to go extinct
      const roll = Math.floor(Math.random() * 6);
      if (roll === 0) {
        extinct.push("Gros Michel");
        continue;
      }
    } else if (joker.templateId === "cavendish") {
      // 1 in 1000 chance to go extinct
      const roll = Math.floor(Math.random() * 1000);
      if (roll === 0) {
        extinct.push("Cavendish");
        continue;
      }
    } else if (joker.templateId === "popcorn") {
      const currentMult =
        typeof joker.customData?.currentMult === "number"
          ? joker.customData.currentMult
          : 20;
      const nextMult = currentMult - 4;
      if (nextMult <= 0) {
        extinct.push("Popcorn");
        continue;
      }
      remaining.push({
        ...joker,
        customData: { ...joker.customData, currentMult: nextMult },
        description: `+${nextMult} Mult. Loses -4 Mult each round played.`,
      });
      continue;
    }

    remaining.push(joker);
  }

  return { remainingJokers: remaining, extinctJokerNames: extinct };
}
