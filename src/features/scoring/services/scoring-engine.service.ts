import { PlayingCard, JokerItem, HandLevelData, PokerHandName } from "@/types";
import {
  HandScoreBreakdown,
  ScoringStepEvent,
  HandScoreBreakdownSchema,
} from "../schemas/scoring.schema";
import { evaluatePokerHand } from "./hand-evaluator.service";
import { BASE_POKER_HANDS } from "@/lib/constants";
import {
  evaluateCardScoredJokers,
  evaluateHeldInHandJokers,
  evaluateHandPlayedJokers,
} from "@/features/jokers/services/joker-engine.service";

export interface ScoreHandOptions {
  playedCards: PlayingCard[];
  heldCards?: PlayingCard[];
  handLevels?: Record<PokerHandName, HandLevelData>;
  jokers?: JokerItem[];
  discardsRemaining?: number;
  handsRemaining?: number;
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
    discardsRemaining = 0,
    handsRemaining = 1,
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

      // Calculate Card Chips
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

      // Card-level Joker Triggers (e.g. Greedy Joker for Diamonds, Lusty for Hearts)
      if (jokers.length > 0) {
        const cardJokerResult = evaluateCardScoredJokers(
          card,
          jokers,
          currentChips,
          currentMult
        );
        for (const jEvent of cardJokerResult.events) {
          events.push({
            type: "joker",
            jokerId: jEvent.jokerId,
            jokerName: jEvent.jokerName,
            effectType: jEvent.effectType,
            amount: jEvent.amount,
            currentChips: jEvent.currentChips,
            currentMult: jEvent.currentMult,
            message: jEvent.message,
            cardId: jEvent.cardId,
            isCardTrigger: true,
          });
        }
        currentChips = cardJokerResult.updatedChips;
        currentMult = cardJokerResult.updatedMult;
      }
    }
  }

  // Step 3: Held-in-Hand Effects (Steel cards & Baron Joker)
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

    // Baron Joker (Held Kings give 1.5x Mult)
    if (jokers.length > 0) {
      const heldJokerResult = evaluateHeldInHandJokers(
        card,
        jokers,
        currentChips,
        currentMult
      );
      for (const jEvent of heldJokerResult.events) {
        events.push({
          type: "joker",
          jokerId: jEvent.jokerId,
          jokerName: jEvent.jokerName,
          effectType: jEvent.effectType,
          amount: jEvent.amount,
          currentChips: jEvent.currentChips,
          currentMult: jEvent.currentMult,
          message: jEvent.message,
          cardId: jEvent.cardId,
          isCardTrigger: true,
        });
      }
      currentChips = heldJokerResult.updatedChips;
      currentMult = heldJokerResult.updatedMult;
    }
  }

  // Step 4: Hand-level Jokers triggers (Left-to-right evaluation)
  if (jokers.length > 0) {
    const handJokerResult = evaluateHandPlayedJokers(jokers, {
      playedCards,
      scoringCards,
      heldCards,
      handName: evaluation.handName,
      discardsRemaining,
      handsRemaining,
      currentChips,
      currentMult,
    });

    for (const jEvent of handJokerResult.events) {
      events.push({
        type: "joker",
        jokerId: jEvent.jokerId,
        jokerName: jEvent.jokerName,
        effectType: jEvent.effectType,
        amount: jEvent.amount,
        currentChips: jEvent.currentChips,
        currentMult: jEvent.currentMult,
        message: jEvent.message,
        isCardTrigger: false,
      });
    }

    currentChips = handJokerResult.finalChips;
    currentMult = handJokerResult.finalMult;
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
