export type CardSuit = "hearts" | "diamonds" | "clubs" | "spades";

export type CardRank =
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K"
  | "A";

export type CardEnhancement =
  | "none"
  | "bonus" // +30 extra chips
  | "mult" // +4 extra mult
  | "wild" // Counts as any suit
  | "glass" // X2 Mult, 1 in 4 chance to destroy
  | "steel" // X1.5 Mult while held in hand
  | "stone" // +50 Chips, no rank or suit
  | "gold"; // +$3 if held in hand at end of round

export type CardEdition =
  | "base"
  | "foil" // +50 Chips
  | "holographic" // +10 Mult
  | "polychrome"; // X1.5 Mult

export type CardSeal = "none" | "gold" | "red" | "blue" | "purple";

export interface PlayingCard {
  id: string;
  suit: CardSuit;
  rank: CardRank;
  chipValue: number;
  enhancement: CardEnhancement;
  edition: CardEdition;
  seal: CardSeal;
  isDebuffed?: boolean;
}

export type PokerHandName =
  | "High Card"
  | "Pair"
  | "Two Pair"
  | "Three of a Kind"
  | "Straight"
  | "Flush"
  | "Full House"
  | "Four of a Kind"
  | "Straight Flush"
  | "Royal Flush"
  | "Five of a Kind"
  | "Flush House"
  | "Flush Five";

export interface HandLevelData {
  level: number;
  chips: number;
  mult: number;
  playedCount: number;
}

export type BlindType = "small" | "big" | "boss";

export interface BossModifier {
  id: string;
  name: string;
  description: string;
  debuffSuit?: CardSuit;
  maxHandsAllowed?: number;
  minCardsRequired?: number;
}

export type JokerRarity = "common" | "uncommon" | "rare" | "legendary";

export interface JokerItem {
  id: string;
  name: string;
  rarity: JokerRarity;
  cost: number;
  sellValue: number;
  description: string;
  edition?: CardEdition;
  // Trigger logic hook keys
  triggerType: "onHandPlayed" | "onCardScored" | "onDiscard" | "passive" | "roundEnd";
  plusChips?: number;
  plusMult?: number;
  timesMult?: number;
  customData?: Record<string, unknown>;
}

export type GamePhase =
  | "menu"
  | "playing"
  | "scoring"
  | "roundWon"
  | "roundLost"
  | "shop"
  | "gameWon";

export interface ScoreState {
  currentRoundScore: number;
  targetScore: number;
  currentHandChips: number;
  currentHandMult: number;
  lastPlayedHandName: PokerHandName | null;
  scoringStep: number;
  isScoringActive: boolean;
}
