import { StateCreator } from "zustand";
import { JokerItem } from "@/types";
import { MAX_JOKER_SLOTS } from "@/lib/constants";
import type { CombinedStore } from "./gameSlice";

export interface JokerSlice {
  jokers: JokerItem[];
  maxJokers: number;

  // Actions
  addJoker: (joker: JokerItem) => boolean;
  removeJoker: (jokerId: string) => void;
  reorderJokers: (startIndex: number, endIndex: number) => void;
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
    const { jokers, maxJokers } = get();
    if (jokers.length >= maxJokers) {
      return false;
    }
    set({ jokers: [...jokers, joker] });
    return true;
  },

  removeJoker: (jokerId: string) => {
    set((state) => ({
      jokers: state.jokers.filter((j) => j.id !== jokerId),
    }));
  },

  reorderJokers: (startIndex: number, endIndex: number) => {
    set((state) => {
      const result = Array.from(state.jokers);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return { jokers: result };
    });
  },

  clearJokers: () => {
    set({ jokers: [] });
  },
});
