import { StateCreator } from "zustand";
import { JokerItem, JokerRarity } from "@/types";
import { MAX_JOKER_SLOTS } from "@/lib/constants";
import { createJoker, getRandomJokerTemplateId } from "@/features/jokers/data/joker-definitions";
import { evaluateRoundEndJokers } from "@/features/jokers/services/joker-engine.service";
import { soundEngine } from "@/lib/sound";
import type { CombinedStore } from "./gameSlice";

export interface JokerSlice {
  jokers: JokerItem[];
  maxJokers: number;

  // Actions
  addJoker: (joker: JokerItem) => boolean;
  addRandomJoker: (filterRarity?: JokerRarity) => boolean;
  removeJoker: (jokerId: string) => void;
  sellJoker: (jokerId: string) => boolean;
  reorderJokers: (startIndex: number, endIndex: number) => void;
  moveJoker: (jokerId: string, direction: "left" | "right") => void;
  resolveRoundEndJokers: () => { extinctJokers: string[] };
  clearJokers: () => void;
}

export const createJokerSlice: StateCreator<
  CombinedStore,
  [],
  [],
  JokerSlice
> = (set, get) => ({
  jokers: [],
  maxJokers: MAX_JOKER_SLOTS,

  addJoker: (joker: JokerItem) => {
    const { jokers, maxJokers, hand, selectedCardIds } = get();
    if (jokers.length >= maxJokers) {
      return false;
    }
    const updated = [...jokers, joker];
    set({ jokers: updated });

    // Refresh score preview with new Joker
    const selected = hand.filter((c) => selectedCardIds.includes(c.id));
    const held = hand.filter((c) => !selectedCardIds.includes(c.id));
    get().updateScorePreview(selected, held, updated);

    return true;
  },

  addRandomJoker: (filterRarity?: JokerRarity) => {
    const templateId = getRandomJokerTemplateId(filterRarity);
    const newJoker = createJoker(templateId);
    return get().addJoker(newJoker);
  },

  removeJoker: (jokerId: string) => {
    const { jokers, hand, selectedCardIds } = get();
    const updated = jokers.filter((j) => j.id !== jokerId);
    set({ jokers: updated });

    // Refresh score preview
    const selected = hand.filter((c) => selectedCardIds.includes(c.id));
    const held = hand.filter((c) => !selectedCardIds.includes(c.id));
    get().updateScorePreview(selected, held, updated);
  },

  sellJoker: (jokerId: string) => {
    const { jokers, money } = get();
    const targetJoker = jokers.find((j) => j.id === jokerId);
    if (!targetJoker) {
      return false;
    }

    soundEngine.playCashChime();
    const earned = targetJoker.sellValue;
    const remaining = jokers.filter((j) => j.id !== jokerId);

    set({
      money: money + earned,
      jokers: remaining,
    });

    const { hand, selectedCardIds } = get();
    const selected = hand.filter((c) => selectedCardIds.includes(c.id));
    const held = hand.filter((c) => !selectedCardIds.includes(c.id));
    get().updateScorePreview(selected, held, remaining);

    return true;
  },

  reorderJokers: (startIndex: number, endIndex: number) => {
    const { jokers, hand, selectedCardIds } = get();
    if (
      startIndex < 0 ||
      startIndex >= jokers.length ||
      endIndex < 0 ||
      endIndex >= jokers.length
    ) {
      return;
    }

    const result = Array.from(jokers);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    set({ jokers: result });
    soundEngine.playCardSelect();

    const selected = hand.filter((c) => selectedCardIds.includes(c.id));
    const held = hand.filter((c) => !selectedCardIds.includes(c.id));
    get().updateScorePreview(selected, held, result);
  },

  moveJoker: (jokerId: string, direction: "left" | "right") => {
    const { jokers } = get();
    const currentIndex = jokers.findIndex((j) => j.id === jokerId);
    if (currentIndex === -1) return;

    const targetIndex =
      direction === "left" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= jokers.length) return;

    get().reorderJokers(currentIndex, targetIndex);
  },

  resolveRoundEndJokers: () => {
    const { jokers } = get();
    const { remainingJokers, extinctJokerNames } = evaluateRoundEndJokers(jokers);

    if (extinctJokerNames.length > 0) {
      set({ jokers: remainingJokers });
    }

    return { extinctJokers: extinctJokerNames };
  },

  clearJokers: () => {
    set({ jokers: [] });
  },
});
