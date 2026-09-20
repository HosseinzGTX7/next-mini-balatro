import { CardEnhancement, CardRank, CardSuit, PlayingCard } from "@/features/poker/schemas/card.schema";
import { createJoker, getRandomJokerTemplateId } from "@/features/jokers/data/joker-definitions";
import {
  ConsumableItem,
  BoosterPack,
  BoosterPackType,
} from "../schemas/consumable.schema";
import { PackChoiceItem, ShopItem } from "../schemas/shop.schema";

export const TAROT_DEFINITIONS: Record<
  string,
  Omit<ConsumableItem, "id">
> = {
  the_magician: {
    templateId: "the_magician",
    name: "The Magician",
    type: "tarot",
    cost: 3,
    sellValue: 1,
    description: "Enhances up to 2 selected cards to Bonus Cards (+30 Chips)",
    enhancementGrant: "bonus",
    maxSelectedCards: 2,
  },
  the_empress: {
    templateId: "the_empress",
    name: "The Empress",
    type: "tarot",
    cost: 3,
    sellValue: 1,
    description: "Enhances up to 2 selected cards to Mult Cards (+4 Mult)",
    enhancementGrant: "mult",
    maxSelectedCards: 2,
  },
  the_hierophant: {
    templateId: "the_hierophant",
    name: "The Hierophant",
    type: "tarot",
    cost: 3,
    sellValue: 1,
    description: "Enhances up to 2 selected cards to Bonus Cards (+30 Chips)",
    enhancementGrant: "bonus",
    maxSelectedCards: 2,
  },
  the_lovers: {
    templateId: "the_lovers",
    name: "The Lovers",
    type: "tarot",
    cost: 3,
    sellValue: 1,
    description: "Enhances 1 selected card into a Wild Card (matches any suit)",
    enhancementGrant: "wild",
    maxSelectedCards: 1,
  },
  the_chariot: {
    templateId: "the_chariot",
    name: "The Chariot",
    type: "tarot",
    cost: 3,
    sellValue: 1,
    description: "Enhances 1 selected card into a Steel Card (1.5x Mult held in hand)",
    enhancementGrant: "steel",
    maxSelectedCards: 1,
  },
  justice: {
    templateId: "justice",
    name: "Justice",
    type: "tarot",
    cost: 3,
    sellValue: 1,
    description: "Enhances 1 selected card into a Glass Card (2x Mult, 1 in 4 chance to break)",
    enhancementGrant: "glass",
    maxSelectedCards: 1,
  },
  the_hermit: {
    templateId: "the_hermit",
    name: "The Hermit",
    type: "tarot",
    cost: 3,
    sellValue: 1,
    description: "Doubles money (max +$20)",
  },
  the_wheel_of_fortune: {
    templateId: "the_wheel_of_fortune",
    name: "The Wheel of Fortune",
    type: "tarot",
    cost: 3,
    sellValue: 1,
    description: "1 in 4 chance to add Foil, Holographic, or Polychrome to a random Joker",
  },
  death: {
    templateId: "death",
    name: "Death",
    type: "tarot",
    cost: 3,
    sellValue: 1,
    description: "Select 2 cards: converts the 1st selected card into the 2nd card",
    maxSelectedCards: 2,
  },
  the_hanged_man: {
    templateId: "the_hanged_man",
    name: "The Hanged Man",
    type: "tarot",
    cost: 3,
    sellValue: 1,
    description: "Destroys up to 2 selected cards permanently from your deck",
    maxSelectedCards: 2,
  },
};

export const PLANET_DEFINITIONS: Record<
  string,
  Omit<ConsumableItem, "id">
> = {
  mercury: {
    templateId: "mercury",
    name: "Mercury",
    type: "planet",
    cost: 3,
    sellValue: 1,
    description: "Pair: +15 Chips and +1 Mult",
    targetHand: "Pair",
    chipsDelta: 15,
    multDelta: 1,
  },
  venus: {
    templateId: "venus",
    name: "Venus",
    type: "planet",
    cost: 3,
    sellValue: 1,
    description: "Three of a Kind: +20 Chips and +2 Mult",
    targetHand: "Three of a Kind",
    chipsDelta: 20,
    multDelta: 2,
  },
  earth: {
    templateId: "earth",
    name: "Earth",
    type: "planet",
    cost: 3,
    sellValue: 1,
    description: "Full House: +25 Chips and +2 Mult",
    targetHand: "Full House",
    chipsDelta: 25,
    multDelta: 2,
  },
  mars: {
    templateId: "mars",
    name: "Mars",
    type: "planet",
    cost: 3,
    sellValue: 1,
    description: "Four of a Kind: +30 Chips and +3 Mult",
    targetHand: "Four of a Kind",
    chipsDelta: 30,
    multDelta: 3,
  },
  jupiter: {
    templateId: "jupiter",
    name: "Jupiter",
    type: "planet",
    cost: 3,
    sellValue: 1,
    description: "Flush: +15 Chips and +2 Mult",
    targetHand: "Flush",
    chipsDelta: 15,
    multDelta: 2,
  },
  saturn: {
    templateId: "saturn",
    name: "Saturn",
    type: "planet",
    cost: 3,
    sellValue: 1,
    description: "Straight: +30 Chips and +3 Mult",
    targetHand: "Straight",
    chipsDelta: 30,
    multDelta: 3,
  },
  uranus: {
    templateId: "uranus",
    name: "Uranus",
    type: "planet",
    cost: 3,
    sellValue: 1,
    description: "Two Pair: +20 Chips and +1 Mult",
    targetHand: "Two Pair",
    chipsDelta: 20,
    multDelta: 1,
  },
  neptune: {
    templateId: "neptune",
    name: "Neptune",
    type: "planet",
    cost: 3,
    sellValue: 1,
    description: "Straight Flush: +40 Chips and +4 Mult",
    targetHand: "Straight Flush",
    chipsDelta: 40,
    multDelta: 4,
  },
  pluto: {
    templateId: "pluto",
    name: "Pluto",
    type: "planet",
    cost: 3,
    sellValue: 1,
    description: "High Card: +10 Chips and +1 Mult",
    targetHand: "High Card",
    chipsDelta: 10,
    multDelta: 1,
  },
};

export const BOOSTER_PACK_DEFINITIONS: Record<
  BoosterPackType,
  Omit<BoosterPack, "id">
> = {
  arcana: {
    type: "arcana",
    name: "Arcana Pack",
    cost: 6,
    description: "Choose 1 of 3 Tarot cards to use immediately or keep",
    cardsCount: 3,
    choicesCount: 1,
  },
  celestial: {
    type: "celestial",
    name: "Celestial Pack",
    cost: 4,
    description: "Choose 1 of 3 Planet cards to level up a poker hand",
    cardsCount: 3,
    choicesCount: 1,
  },
  standard: {
    type: "standard",
    name: "Standard Pack",
    cost: 4,
    description: "Choose 1 of 3 enhanced playing cards to add to your deck",
    cardsCount: 3,
    choicesCount: 1,
  },
  buffoon: {
    type: "buffoon",
    name: "Buffoon Pack",
    cost: 6,
    description: "Choose 1 of 2 Jokers to add to your rack",
    cardsCount: 2,
    choicesCount: 1,
  },
};

/**
 * Creates an instance of a Tarot or Planet consumable item.
 */
export function createConsumable(templateId: string): ConsumableItem {
  const base =
    TAROT_DEFINITIONS[templateId] ??
    PLANET_DEFINITIONS[templateId] ??
    TAROT_DEFINITIONS.the_empress;

  return {
    ...base,
    id: `consumable_${base.templateId}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  };
}

/**
 * Creates a unique Booster Pack instance.
 */
export function createBoosterPack(type: BoosterPackType): BoosterPack {
  const base = BOOSTER_PACK_DEFINITIONS[type];
  return {
    ...base,
    id: `pack_${type}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  };
}

/**
 * Generates items for the Shop (2 Jokers/Consumables and 2 Booster Packs).
 */
export function generateShopInventory(_ante: number): {
  items: ShopItem[];
  packs: BoosterPack[];
} {
  const items: ShopItem[] = [];

  // Slot 1: Joker (with small chance of edition)
  const jTemplate = getRandomJokerTemplateId();
  const editionRoll = Math.random();
  const jEdition =
    editionRoll < 0.08
      ? "polychrome"
      : editionRoll < 0.2
      ? "holographic"
      : editionRoll < 0.35
      ? "foil"
      : undefined;

  const jokerItem = createJoker(jTemplate, jEdition);
  items.push({
    id: `shop_joker_${Date.now()}_1`,
    type: "joker",
    cost: jokerItem.cost,
    joker: jokerItem,
    isBought: false,
  });

  // Slot 2: Consumable (Tarot or Planet)
  const isTarot = Math.random() < 0.5;
  const consumableKeys = isTarot
    ? Object.keys(TAROT_DEFINITIONS)
    : Object.keys(PLANET_DEFINITIONS);
  const randomKey = consumableKeys[Math.floor(Math.random() * consumableKeys.length)];
  const consumable = createConsumable(randomKey);

  items.push({
    id: `shop_cons_${Date.now()}_2`,
    type: "consumable",
    cost: consumable.cost,
    consumable,
    isBought: false,
  });

  // Packs (1 Tarot/Celestial pack and 1 Standard/Buffoon pack)
  const packTypes: BoosterPackType[] = [
    Math.random() < 0.5 ? "arcana" : "celestial",
    Math.random() < 0.5 ? "buffoon" : "standard",
  ];

  const packs = packTypes.map((pt) => createBoosterPack(pt));

  return { items, packs };
}

/**
 * Generates options when opening a booster pack.
 */
export function generatePackChoices(pack: BoosterPack): PackChoiceItem[] {
  const choices: PackChoiceItem[] = [];

  if (pack.type === "arcana") {
    const tarotKeys = Object.keys(TAROT_DEFINITIONS);
    const shuffled = [...tarotKeys].sort(() => Math.random() - 0.5);
    for (let i = 0; i < pack.cardsCount; i++) {
      const c = createConsumable(shuffled[i % shuffled.length]);
      choices.push({ id: `choice_${i}_${c.id}`, type: "consumable", consumable: c });
    }
  } else if (pack.type === "celestial") {
    const planetKeys = Object.keys(PLANET_DEFINITIONS);
    const shuffled = [...planetKeys].sort(() => Math.random() - 0.5);
    for (let i = 0; i < pack.cardsCount; i++) {
      const c = createConsumable(shuffled[i % shuffled.length]);
      choices.push({ id: `choice_${i}_${c.id}`, type: "consumable", consumable: c });
    }
  } else if (pack.type === "buffoon") {
    for (let i = 0; i < pack.cardsCount; i++) {
      const templateId = getRandomJokerTemplateId();
      const j = createJoker(templateId);
      choices.push({ id: `choice_${i}_${j.id}`, type: "joker", joker: j });
    }
  } else if (pack.type === "standard") {
    const suits: CardSuit[] = ["hearts", "diamonds", "clubs", "spades"];
    const ranks: CardRank[] = ["A", "K", "Q", "J", "10", "9", "8", "7"];
    const enhancements: CardEnhancement[] = ["bonus", "mult", "wild", "steel", "glass", "gold"];

    for (let i = 0; i < pack.cardsCount; i++) {
      const s = suits[Math.floor(Math.random() * suits.length)];
      const r = ranks[Math.floor(Math.random() * ranks.length)];
      const enh = enhancements[Math.floor(Math.random() * enhancements.length)];

      const card: PlayingCard = {
        id: `pack_card_${Date.now()}_${i}`,
        suit: s,
        rank: r,
        chipValue: r === "A" ? 11 : ["K", "Q", "J", "10"].includes(r) ? 10 : Number(r),
        enhancement: enh,
        edition: Math.random() < 0.2 ? "foil" : "base",
        seal: "none",
        isDebuffed: false,
        isFaceDown: false,
      };

      choices.push({ id: `choice_${i}_${card.id}`, type: "card", card });
    }
  }

  return choices;
}
