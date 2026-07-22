import { PlayingCard, JokerItem, HandLevelData, PokerHandName } from "@/types";
import {
  HandScoreBreakdown,
  ScoringStepEvent,
  HandScoreBreakdownSchema,
} from "../schemas/scoring.schema";
import { evaluatePokerHand } from "./hand-evaluator.service";
import { BASE_POKER_HANDS } from "@/lib/constants";

export interface ScoreHandOptions {
  playedCards: PlayingCard[];
  heldCards?: PlayingCard[];
  handLevels?: Record<PokerHandName, HandLevelData>;
  jokers?: JokerItem[];
}

/**
 * Pure calculation pipeline evaluating the played hand and computing the final score
 * with a step-by-step audit event log for animations and UI counters.
 */
export function calculateHandScore(options: ScoreHandOptions): HandScoreBreakdown {
  const {
    playedCards,
    heldCards = [],
    handLevels = BASE_POKER_HANDS,
    jokers = [],
  } = options;

  const evaluation = evaluatePokerHand(playedCards, handLevels);
  const events: ScoringStepEvent[] = [];

  let currentChips = evaluation.baseChips;
  let currentMult = evaluation.baseMult;

  // Step 1: Base Hand
  events.push({
    type: "baseHand",
    handName: evaluation.handName,
    chips: evaluation.baseChips,
    mult: evaluation.baseMult,
    level: evaluation.level,
  });

  const scoringSet = new Set(evaluation.scoringCardIds);
  const scoringCards = playedCards.filter((c) => scoringSet.has(c.id));

  // Step 2: Scoring Cards Resolution
  for (const card of scoringCards) {
    if (card.isDebuffed) {
      continue;
    }

    const repetitions = card.seal === "red" ? 2 : 1;

    for (let rep = 0; rep < repetitions; rep++) {
      const isRetrigger = rep > 0;

      // Calculate Chips
      let cardChips = card.enhancement === "stone" ? 50 : card.chipValue;
      if (card.enhancement === "bonus") cardChips += 30;
      if (card.edition === "foil") cardChips += 50;

      currentChips += cardChips;
      events.push({
        type: "cardChips",
        cardId: card.id,
        rank: card.rank,
        suit: card.suit,
        chipsAdded: cardChips,
        currentChips,
        isRetrigger,
      });

      // Calculate Additive Mult
      let multAdded = 0;
      if (card.enhancement === "mult") multAdded += 4;
      if (card.edition === "holographic") multAdded += 10;

      if (multAdded > 0) {
        currentMult += multAdded;
        events.push({
          type: "cardMult",
          cardId: card.id,
          multAdded,
          currentMult,
          isRetrigger,
        });
      }

      // Calculate Multiplicative X-Mult
      if (card.enhancement === "glass") {
        currentMult *= 2;
        events.push({
          type: "cardXMult",
          cardId: card.id,
          xMultFactor: 2,
          currentMult,
          isRetrigger,
        });
      }

      if (card.edition === "polychrome") {
        currentMult *= 1.5;
        events.push({
          type: "cardXMult",
          cardId: card.id,
          xMultFactor: 1.5,
          currentMult,
          isRetrigger,
        });
      }
    }
  }

  // Step 3: Held-in-Hand Effects (Steel cards)
  for (const card of heldCards) {
    if (card.isDebuffed) continue;

    if (card.enhancement === "steel") {
      currentMult *= 1.5;
      events.push({
        type: "heldInHand",
        cardId: card.id,
        enhancement: "steel",
        xMultFactor: 1.5,
        currentMult,
      });
    }
  }

  // Step 4: Jokers triggers (Flat Chips, Flat Mult, X-Mult)
  for (const joker of jokers) {
    if (joker.plusChips) {
      currentChips += joker.plusChips;
      events.push({
        type: "joker",
        jokerId: joker.id,
        jokerName: joker.name,
        effectType: "chips",
        amount: joker.plusChips,
        currentChips,
        currentMult,
      });
    }

    if (joker.plusMult) {
      currentMult += joker.plusMult;
      events.push({
        type: "joker",
        jokerId: joker.id,
        jokerName: joker.name,
        effectType: "mult",
        amount: joker.plusMult,
        currentChips,
        currentMult,
      });
    }

    if (joker.timesMult) {
      currentMult *= joker.timesMult;
      events.push({
        type: "joker",
        jokerId: joker.id,
        jokerName: joker.name,
        effectType: "xmult",
        amount: joker.timesMult,
        currentChips,
        currentMult,
      });
    }
  }

  // Step 5: Final Tally
  const totalHandScore = Math.floor(currentChips * currentMult);
  events.push({
    type: "finalTally",
    totalChips: currentChips,
    totalMult: currentMult,
    totalScore: totalHandScore,
  });

  return HandScoreBreakdownSchema.parse({
    evaluation,
    events,
    finalChips: currentChips,
    finalMult: currentMult,
    totalHandScore,
  });
}
