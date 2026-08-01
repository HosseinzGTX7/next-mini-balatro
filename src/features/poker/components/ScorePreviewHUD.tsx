"use client";

import React, { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useActivePokerHand,
  useHandChips,
  useHandMult,
  useGameStore,
} from "@/store/useGameStore";
import { formatNumber } from "@/lib/utils";

/**
 * Real-time Balatro-style Score Forecast HUD.
 * Renders the detected poker hand, level, and dynamic (Chips * Mult) formula preview.
 */
export const ScorePreviewHUD = memo(function ScorePreviewHUD() {
  const activeHand = useActivePokerHand();
  const chips = useHandChips();
  const mult = useHandMult();
  const handLevels = useGameStore((state) => state.handLevels);

  const currentLevelData = activeHand ? handLevels[activeHand] : null;
  const estimatedScore = Math.floor(chips * mult);

  return (
    <div className="flex flex-col items-center justify-center min-h-[68px] w-full px-4">
      <AnimatePresence mode="wait">
        {activeHand ? (
          <motion.div
            key={activeHand}
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col items-center gap-1.5 w-full max-w-md"
          >
            {/* Hand Name & Level Badge */}
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-black uppercase tracking-wider text-amber-300 drop-shadow-sm">
                {activeHand}
              </span>
              {currentLevelData && (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  lvl.{currentLevelData.level}
                </span>
              )}
            </div>

            {/* Chips X Mult = Estimated Total Score Formula */}
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {/* Chips Box */}
              <motion.div
                key={`chips-${chips}`}
                initial={{ scale: 1.15 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
                className="px-3 py-1 rounded-lg bg-blue-950/90 border border-blue-500/70 text-center shadow-lg shadow-blue-950/50 min-w-[70px]"
              >
                <span className="text-[9px] uppercase font-bold text-blue-300 block leading-none">
                  Chips
                </span>
                <span className="text-base sm:text-lg font-black text-[#009dff] leading-tight font-mono">
                  {formatNumber(chips)}
                </span>
              </motion.div>

              {/* Multiply Operator */}
              <span className="text-xl font-black text-red-400 select-none">
                &times;
              </span>

              {/* Mult Box */}
              <motion.div
                key={`mult-${mult}`}
                initial={{ scale: 1.15 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
                className="px-3 py-1 rounded-lg bg-red-950/90 border border-red-500/70 text-center shadow-lg shadow-red-950/50 min-w-[70px]"
              >
                <span className="text-[9px] uppercase font-bold text-red-300 block leading-none">
                  Mult
                </span>
                <span className="text-base sm:text-lg font-black text-[#fe5f55] leading-tight font-mono">
                  {mult}
                </span>
              </motion.div>

              {/* Equals Sign */}
              <span className="text-base font-black text-slate-500 select-none">
                =
              </span>

              {/* Score Forecast */}
              <div className="px-3 py-1 rounded-lg bg-amber-950/60 border border-amber-500/50 text-center shadow-lg shadow-amber-950/40 min-w-[80px]">
                <span className="text-[9px] uppercase font-bold text-amber-300 block leading-none">
                  Score
                </span>
                <span className="text-base sm:text-lg font-black text-amber-400 leading-tight font-mono">
                  {formatNumber(estimatedScore)}
                </span>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty-selection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-2"
          >
            <span className="text-xs sm:text-sm font-semibold text-emerald-400/50 uppercase tracking-widest text-center">
              Select 1 to 5 cards to preview poker hand
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
