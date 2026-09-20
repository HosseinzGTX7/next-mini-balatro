import { CardEdition } from "@/features/poker/schemas/card.schema";
import { JokerItem, JokerTemplate } from "../schemas/joker.schema";

export const JOKER_DEFINITIONS: Record<string, JokerTemplate> = {
  joker: {
    templateId: "joker",
    name: "Joker",
    rarity: "common",
    cost: 4,
    sellValue: 2,
    description: "+4 Mult",
    triggerType: "onHandPlayed",
    effectType: "addMult",
    value: 4,
  },
  greedy_joker: {
    templateId: "greedy_joker",
    name: "Greedy Joker",
    rarity: "common",
    cost: 5,
    sellValue: 2,
    description: "Played cards with Diamond suit give +4 Mult when scored",
    triggerType: "onCardScored",
    effectType: "addMult",
    value: 4,
    condition: {
      suits: ["diamonds"],
    },
  },
  lusty_joker: {
    templateId: "lusty_joker",
    name: "Lusty Joker",
    rarity: "common",
    cost: 5,
    sellValue: 2,
    description: "Played cards with Heart suit give +4 Mult when scored",
    triggerType: "onCardScored",
    effectType: "addMult",
    value: 4,
    condition: {
      suits: ["hearts"],
    },
  },
  wrathful_joker: {
    templateId: "wrathful_joker",
    name: "Wrathful Joker",
    rarity: "common",
    cost: 5,
    sellValue: 2,
    description: "Played cards with Spade suit give +4 Mult when scored",
    triggerType: "onCardScored",
    effectType: "addMult",
    value: 4,
    condition: {
      suits: ["spades"],
    },
  },
  gluttonous_joker: {
    templateId: "gluttonous_joker",
    name: "Gluttonous Joker",
    rarity: "common",
    cost: 5,
    sellValue: 2,
    description: "Played cards with Club suit give +4 Mult when scored",
    triggerType: "onCardScored",
    effectType: "addMult",
    value: 4,
    condition: {
      suits: ["clubs"],
    },
  },
  jolly_joker: {
    templateId: "jolly_joker",
    name: "Jolly Joker",
    rarity: "common",
    cost: 4,
    sellValue: 2,
    description: "+8 Mult if played hand contains a Pair",
    triggerType: "onHandPlayed",
    effectType: "addMult",
    value: 8,
    condition: {
      handTypes: ["Pair", "Two Pair", "Full House"],
    },
  },
  mad_joker: {
    templateId: "mad_joker",
    name: "Mad Joker",
    rarity: "common",
    cost: 4,
    sellValue: 2,
    description: "+20 Mult if played hand contains a Two Pair",
    triggerType: "onHandPlayed",
    effectType: "addMult",
    value: 20,
    condition: {
      handTypes: ["Two Pair"],
    },
  },
  sly_joker: {
    templateId: "sly_joker",
    name: "Sly Joker",
    rarity: "common",
    cost: 4,
    sellValue: 2,
    description: "+50 Chips if played hand contains a Pair",
    triggerType: "onHandPlayed",
    effectType: "addChips",
    value: 50,
    condition: {
      handTypes: ["Pair", "Two Pair", "Full House"],
    },
  },
  half_joker: {
    templateId: "half_joker",
    name: "Half Joker",
    rarity: "common",
    cost: 5,
    sellValue: 2,
    description: "+20 Mult if played hand contains 3 or fewer cards",
    triggerType: "onHandPlayed",
    effectType: "addMult",
    value: 20,
    condition: {
      maxPlayedCards: 3,
    },
  },
  banner: {
    templateId: "banner",
    name: "Banner",
    rarity: "common",
    cost: 5,
    sellValue: 2,
    description: "+40 Chips for each remaining discard",
    triggerType: "onHandPlayed",
    effectType: "addChips",
    value: 40,
    condition: {
      chipsPerDiscard: 40,
    },
  },
  mystic_summit: {
    templateId: "mystic_summit",
    name: "Mystic Summit",
    rarity: "common",
    cost: 5,
    sellValue: 2,
    description: "+15 Mult when 0 discards remaining",
    triggerType: "onHandPlayed",
    effectType: "addMult",
    value: 15,
    condition: {
      discardsEquals: 0,
    },
  },
  droll_joker: {
    templateId: "droll_joker",
    name: "Droll Joker",
    rarity: "common",
    cost: 4,
    sellValue: 2,
    description: "+10 Mult if played hand contains a Flush",
    triggerType: "onHandPlayed",
    effectType: "addMult",
    value: 10,
    condition: {
      handTypes: ["Flush", "Straight Flush", "Flush House", "Flush Five"],
    },
  },
  crazy_joker: {
    templateId: "crazy_joker",
    name: "Crazy Joker",
    rarity: "common",
    cost: 4,
    sellValue: 2,
    description: "+12 Mult if played hand contains a Straight",
    triggerType: "onHandPlayed",
    effectType: "addMult",
    value: 12,
    condition: {
      handTypes: ["Straight", "Straight Flush", "Royal Flush"],
    },
  },
  gros_michel: {
    templateId: "gros_michel",
    name: "Gros Michel",
    rarity: "common",
    cost: 5,
    sellValue: 2,
    description: "+15 Mult. 1 in 6 chance to go extinct at round end.",
    triggerType: "onHandPlayed",
    effectType: "addMult",
    value: 15,
    condition: {
      extinctionProbability: 6, // 1 in 6
    },
  },
  cavendish: {
    templateId: "cavendish",
    name: "Cavendish",
    rarity: "common",
    cost: 5,
    sellValue: 2,
    description: "3x Mult. 1 in 1000 chance to go extinct at round end.",
    triggerType: "onHandPlayed",
    effectType: "multiplyMult",
    value: 3,
    condition: {
      extinctionProbability: 1000, // 1 in 1000
    },
  },
  baron: {
    templateId: "baron",
    name: "Baron",
    rarity: "rare",
    cost: 8,
    sellValue: 4,
    description: "Each King held in hand gives 1.5x Mult",
    triggerType: "onHeldInHand",
    effectType: "multiplyMult",
    value: 1.5,
    condition: {
      ranks: ["K"],
      multPerHeldKing: 1.5,
    },
  },
  blueprint: {
    templateId: "blueprint",
    name: "Blueprint",
    rarity: "rare",
    cost: 10,
    sellValue: 5,
    description: "Copies the ability of the Joker to its right",
    triggerType: "passive",
    effectType: "copyRight",
    value: 0,
  },
  popcorn: {
    templateId: "popcorn",
    name: "Popcorn",
    rarity: "common",
    cost: 5,
    sellValue: 2,
    description: "+20 Mult. Loses -4 Mult each round played.",
    triggerType: "onHandPlayed",
    effectType: "addMult",
    value: 20,
  },
  ice_cream: {
    templateId: "ice_cream",
    name: "Ice Cream",
    rarity: "common",
    cost: 5,
    sellValue: 2,
    description: "+100 Chips. Loses -5 Chips each hand played.",
    triggerType: "onHandPlayed",
    effectType: "addChips",
    value: 100,
  },
};

/**
 * Creates a unique Joker instance from a template ID.
 */
export function createJoker(
  templateId: string,
  edition?: CardEdition,
  overrides?: Partial<JokerItem>
): JokerItem {
  const template = JOKER_DEFINITIONS[templateId] ?? JOKER_DEFINITIONS.joker;
  const instanceId = `joker_${template.templateId}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  let sellValue = template.sellValue;
  if (edition === "foil") sellValue += 2;
  if (edition === "holographic") sellValue += 3;
  if (edition === "polychrome") sellValue += 5;

  return {
    id: instanceId,
    templateId: template.templateId,
    name: template.name,
    rarity: template.rarity,
    cost: template.cost,
    sellValue,
    description: template.description,
    edition,
    triggerType: template.triggerType,
    effectType: template.effectType,
    value: template.value,
    condition: template.condition ? { ...template.condition } : undefined,
    customData: template.templateId === "popcorn"
      ? { currentMult: 20 }
      : template.templateId === "ice_cream"
      ? { currentChips: 100 }
      : undefined,
    ...overrides,
  };
}

/**
 * Get all template keys available in the registry.
 */
export function getAllJokerTemplateIds(): string[] {
  return Object.keys(JOKER_DEFINITIONS);
}

/**
 * Get a random Joker template ID for shops, packs, or test generation.
 */
export function getRandomJokerTemplateId(filterRarity?: "common" | "uncommon" | "rare" | "legendary"): string {
  let list = Object.values(JOKER_DEFINITIONS);
  if (filterRarity) {
    list = list.filter((j) => j.rarity === filterRarity);
  }
  const randomIndex = Math.floor(Math.random() * list.length);
  return list[randomIndex].templateId;
}
