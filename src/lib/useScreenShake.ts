"use client";

import { create } from "zustand";

interface ScreenShakeState {
  isShaking: boolean;
  intensity: "light" | "normal" | "heavy";
  triggerShake: (intensity?: "light" | "normal" | "heavy", durationMs?: number) => void;
}

export const useScreenShake = create<ScreenShakeState>((set) => ({
  isShaking: false,
  intensity: "normal",
  triggerShake: (intensity = "normal", durationMs = 350) => {
    set({ isShaking: true, intensity });
    setTimeout(() => {
      set({ isShaking: false });
    }, durationMs);
  },
}));
