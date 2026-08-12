"use client";

import React, { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/useGameStore";
import { Badge } from "@/components/ui/badge";
import { Skull, AlertTriangle, Sparkles } from "lucide-react";

export const BlindBanner = memo(function BlindBanner() {
  const blindType = useGameStore((state) => state.blindType);
  const activeBossModifier = useGameStore((state) => state.activeBossModifier);
  const blindWarningMessage = useGameStore((state) => state.blindWarningMessage);
  const lockedHand = useGameStore((state) => state.lockedHandTypeThisRound);
  const playedHands = useGameStore((state) => state.playedHandsThisRound);

  const isBoss = blindType === "boss" && activeBossModifier !== null;

  return (
    <div className="w-full flex flex-col items-center gap-1.5 z-20 select-none">
      {/* Active Blind Info Header */}
      <div
        className={`px-4 py-1 rounded-full border flex items-center gap-2 text-xs font-bold uppercase transition-colors ${
          isBoss
            ? "bg-red-950/80 border-red-500/80 text-red-300 shadow-lg shadow-red-500/20"
            : blindType === "big"
            ? "bg-amber-950/80 border-amber-500/60 text-amber-300"
            : "bg-blue-950/80 border-blue-500/60 text-blue-300"
        }`}
      >
        {isBoss ? (
          <>
            <Skull className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            <span className="font-black tracking-wider text-red-200">
              Boss: {activeBossModifier.name}
            </span>
            <span>&bull;</span>
            <span className="text-[11px] font-medium lowercase first-letter:uppercase text-red-300">
              {activeBossModifier.description}
            </span>
          </>
        ) : (
          <>
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>{blindType} blind</span>
          </>
        )}

        {/* Boss Dynamic State Tracking */}
        {isBoss && activeBossModifier.singleHandTypeOnly && lockedHand && (
          <Badge variant="outline" className="text-[9px] py-0 px-1 border-red-400 bg-red-900/60 text-white font-mono">
            Locked: {lockedHand}
          </Badge>
        )}

        {isBoss && activeBossModifier.noRepeatHandTypes && playedHands.length > 0 && (
          <Badge variant="outline" className="text-[9px] py-0 px-1 border-red-400 bg-red-900/60 text-white font-mono">
            Played: {playedHands.join(", ")}
          </Badge>
        )}
      </div>

      {/* Warning message toast (when illegal boss move attempted) */}
      <AnimatePresence>
        {blindWarningMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            className="px-4 py-1.5 rounded-lg bg-red-600 text-white font-black text-xs uppercase flex items-center gap-2 shadow-2xl shadow-red-600/60 border border-red-400"
          >
            <AlertTriangle className="w-4 h-4 text-yellow-300 animate-bounce" />
            <span>{blindWarningMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
