import { StateCreator } from "zustand";
import {
  ConsumableItem,
  BoosterPack,
} from "@/features/shop/schemas/consumable.schema";
import {
  ShopItem,
  ActivePackSession,
} from "@/features/shop/schemas/shop.schema";
import {
  generateShopInventory,
  generatePackChoices,
} from "@/features/shop/data/consumables";
import { MAX_CONSUMABLES, BASE_REROLL_COST } from "@/lib/constants";
import { soundEngine } from "@/lib/sound";
import type { CombinedStore } from "./gameSlice";

export interface ShopSlice {
  consumables: ConsumableItem[];
  maxConsumables: number;
  shopItems: ShopItem[];
  shopPacks: BoosterPack[];
  rerollCost: number;
  activePackSession: ActivePackSession | null;

  // Actions
  addConsumable: (item: ConsumableItem) => boolean;
  removeConsumable: (id: string) => void;
  sellConsumable: (id: string) => void;
  useConsumable: (id: string) => { success: boolean; message: string };
  openShop: () => void;
  rerollShop: () => boolean;
  buyShopItem: (itemId: string) => boolean;
  buyBoosterPack: (packId: string) => boolean;
  choosePackItem: (choiceId: string) => boolean;
  skipPack: () => void;
}

export const createShopSlice: StateCreator<
  CombinedStore,
  [],
  [],
  ShopSlice
> = (set, get) => ({
  consumables: [],
  maxConsumables: MAX_CONSUMABLES,
  shopItems: [],
  shopPacks: [],
  rerollCost: BASE_REROLL_COST,
  activePackSession: null,

  addConsumable: (item: ConsumableItem) => {
    const { consumables, maxConsumables } = get();
    if (consumables.length >= maxConsumables) {
      return false;
    }
    set({ consumables: [...consumables, item] });
    return true;
  },

  removeConsumable: (id: string) => {
    set((state) => ({
      consumables: state.consumables.filter((c) => c.id !== id),
    }));
  },

  sellConsumable: (id: string) => {
    const { consumables, money } = get();
    const item = consumables.find((c) => c.id === id);
    if (!item) return;

    soundEngine.playCashChime();
    set({
      money: money + item.sellValue,
      consumables: consumables.filter((c) => c.id !== id),
    });
  },

  useConsumable: (id: string) => {
    const {
      consumables,
      hand,
      selectedCardIds,
      money,
      jokers,
    } = get();

    const item = consumables.find((c) => c.id === id);
    if (!item) return { success: false, message: "Item not found" };

    // 1. PLANET CARD USAGE (Levels up target hand)
    if (item.type === "planet" && item.targetHand) {
      get().levelUpHand(
        item.targetHand,
        item.chipsDelta ?? 15,
        item.multDelta ?? 1
      );
      soundEngine.playMultTrigger(2);
      get().removeConsumable(id);
      return {
        success: true,
        message: `${item.targetHand} leveled up! (+${item.chipsDelta} Chips, +${item.multDelta} Mult)`,
      };
    }

    // 2. TAROT CARD USAGE
    if (item.type === "tarot") {
      switch (item.templateId) {
        case "the_hermit": {
          const bonus = Math.min(20, Math.max(1, money));
          get().addMoney(bonus);
          soundEngine.playCashChime();
          get().removeConsumable(id);
          return { success: true, message: `The Hermit granted +$${bonus}!` };
        }

        case "the_wheel_of_fortune": {
          get().removeConsumable(id);
          const roll = Math.random();
          if (roll < 0.25 && jokers.length > 0) {
            const uneditioned = jokers.filter((j) => !j.edition);
            const targetJoker =
              uneditioned.length > 0
                ? uneditioned[Math.floor(Math.random() * uneditioned.length)]
                : jokers[0];

            const editionTypes = ["foil", "holographic", "polychrome"] as const;
            const chosenEdition = editionTypes[Math.floor(Math.random() * editionTypes.length)];

            set({
              jokers: jokers.map((j) =>
                j.id === targetJoker.id ? { ...j, edition: chosenEdition } : j
              ),
            });
            soundEngine.playXMultTrigger();
            return {
              success: true,
              message: `Wheel of Fortune added ${chosenEdition.toUpperCase()} to ${targetJoker.name}!`,
            };
          } else {
            soundEngine.playDefeatSound();
            return { success: true, message: "The Wheel of Fortune spun... Nope!" };
          }
        }

        case "the_hanged_man": {
          if (selectedCardIds.length === 0 || selectedCardIds.length > 2) {
            return {
              success: false,
              message: "Select 1 or 2 cards in hand to destroy.",
            };
          }
          const toDestroy = new Set(selectedCardIds);
          set({
            hand: hand.filter((c) => !toDestroy.has(c.id)),
            deck: get().deck.filter((c) => !toDestroy.has(c.id)),
            selectedCardIds: [],
          });
          soundEngine.playCardSelect();
          get().removeConsumable(id);
          return {
            success: true,
            message: `Destroyed ${selectedCardIds.length} card(s) from your deck!`,
          };
        }

        case "death": {
          if (selectedCardIds.length !== 2) {
            return {
              success: false,
              message: "Select exactly 2 cards: left converts into right.",
            };
          }
          const [leftId, rightId] = selectedCardIds;
          const targetCard = hand.find((c) => c.id === rightId);
          if (!targetCard) {
            return { success: false, message: "Target card not found" };
          }

          set({
            hand: hand.map((c) =>
              c.id === leftId
                ? {
                    ...targetCard,
                    id: `card_converted_${Date.now()}`,
                  }
                : c
            ),
            selectedCardIds: [],
          });
          soundEngine.playCardSelect();
          get().removeConsumable(id);
          return { success: true, message: "Converted card into a copy!" };
        }

        default: {
          // Enhancement application (The Empress, The Magician, The Hierophant, The Lovers, The Chariot, Justice)
          if (item.enhancementGrant) {
            const maxAllowed = item.maxSelectedCards ?? 1;
            if (selectedCardIds.length === 0 || selectedCardIds.length > maxAllowed) {
              return {
                success: false,
                message: `Select 1 to ${maxAllowed} card(s) in your hand first.`,
              };
            }

            const targetSet = new Set(selectedCardIds);
            const grant = item.enhancementGrant;
            set({
              hand: hand.map((c) =>
                targetSet.has(c.id) ? { ...c, enhancement: grant } : c
              ),
              selectedCardIds: [],
            });
            soundEngine.playChipAdd(3);
            get().removeConsumable(id);
            return {
              success: true,
              message: `Enhanced ${selectedCardIds.length} card(s) with ${item.enhancementGrant}!`,
            };
          }
        }
      }
    }

    return { success: false, message: "Cannot use this item right now." };
  },

  openShop: () => {
    const { ante } = get();
    const { items, packs } = generateShopInventory(ante);
    set({
      phase: "shop",
      shopItems: items,
      shopPacks: packs,
      rerollCost: BASE_REROLL_COST,
      activePackSession: null,
    });
  },

  rerollShop: () => {
    const { money, rerollCost, ante } = get();
    if (money < rerollCost) {
      soundEngine.playDefeatSound();
      return false;
    }

    soundEngine.playCashChime();
    const { items, packs } = generateShopInventory(ante);

    set({
      money: money - rerollCost,
      shopItems: items,
      shopPacks: packs,
      rerollCost: rerollCost + 1,
    });
    return true;
  },

  buyShopItem: (itemId: string) => {
    const { shopItems, money, jokers, maxJokers, consumables, maxConsumables } = get();
    const shopItem = shopItems.find((i) => i.id === itemId);
    if (!shopItem || shopItem.isBought || money < shopItem.cost) {
      soundEngine.playDefeatSound();
      return false;
    }

    if (shopItem.type === "joker" && shopItem.joker) {
      if (jokers.length >= maxJokers) {
        soundEngine.playDefeatSound();
        return false;
      }
      get().addJoker(shopItem.joker);
    } else if (shopItem.type === "consumable" && shopItem.consumable) {
      if (consumables.length >= maxConsumables) {
        soundEngine.playDefeatSound();
        return false;
      }
      get().addConsumable(shopItem.consumable);
    }

    soundEngine.playCashChime();
    set({
      money: money - shopItem.cost,
      shopItems: shopItems.map((i) =>
        i.id === itemId ? { ...i, isBought: true } : i
      ),
    });
    return true;
  },

  buyBoosterPack: (packId: string) => {
    const { shopPacks, money } = get();
    const pack = shopPacks.find((p) => p.id === packId);
    if (!pack || money < pack.cost) {
      soundEngine.playDefeatSound();
      return false;
    }

    soundEngine.playCardDeal();
    const choices = generatePackChoices(pack);

    set({
      money: money - pack.cost,
      shopPacks: shopPacks.filter((p) => p.id !== packId),
      activePackSession: {
        pack,
        choices,
        isResolved: false,
      },
    });
    return true;
  },

  choosePackItem: (choiceId: string) => {
    const { activePackSession, jokers, maxJokers, consumables, maxConsumables, deck } = get();
    if (!activePackSession) return false;

    const choice = activePackSession.choices.find((c) => c.id === choiceId);
    if (!choice) return false;

    if (choice.type === "joker" && choice.joker) {
      if (jokers.length >= maxJokers) {
        soundEngine.playDefeatSound();
        return false;
      }
      get().addJoker(choice.joker);
    } else if (choice.type === "consumable" && choice.consumable) {
      if (consumables.length >= maxConsumables) {
        soundEngine.playDefeatSound();
        return false;
      }
      get().addConsumable(choice.consumable);
    } else if (choice.type === "card" && choice.card) {
      set({ deck: [...deck, choice.card] });
    }

    soundEngine.playCashChime();
    set({ activePackSession: null });
    return true;
  },

  skipPack: () => {
    soundEngine.playCardSelect();
    set({ activePackSession: null });
  },
});
