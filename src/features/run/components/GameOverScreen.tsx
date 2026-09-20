"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/store/useGameStore";
import { formatNumber } from "@/lib/utils";
import { soundEngine } from "@/lib/sound";
import {
  Flame,
  RotateCcw,
  Copy,
  Check,
  Play,
  Home,
} from "lucide-react";

export function GameOverScreen() {
  const ante = useGameStore((state) => state.ante);
  const blindType = useGameStore((state) => state.blindType);
  const activeBossModifier = useGameStore((state) => state.activeBossModifier);
  const roundScore = useGameStore((state) => state.roundScore);
  const targetScore = useGameStore((state) => state.targetScore);
  const seed = useGameStore((state) => state.seed);
  const runStats = useGameStore((state) => state.runStats);
  const restartWithSameSeed = useGameStore((state) => state.restartWithSameSeed);
  const startGame = useGameStore((state) => state.startGame);
  const resetGame = useGameStore((state) => state.resetGame);

  const [copied, setCopied] = useState(false);

  const handleCopySeed = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(seed);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRetrySameSeed = () => {
    soundEngine.playCardDeal();
    restartWithSameSeed();
  };

  const handleNewRun = () => {
    soundEngine.playCardDeal();
    startGame();
  };

  const handleMainMenu = () => {
    soundEngine.playCardSelect();
    resetGame();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 select-none">
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-lg w-full p-6 sm:p-8 rounded-2xl bg-slate-950 border-2 border-red-500/80 shadow-2xl text-center flex flex-col items-center gap-5 relative z-10"
      >
        {/* Flame Defeat Icon */}
        <div className="p-4 rounded-full bg-red-500/20 text-red-500 border-2 border-red-500/40 shadow-lg shadow-red-950/40">
          <Flame className="w-12 h-12 text-red-500" />
        </div>

        <div>
          <h2 className="text-3xl sm:text-4xl font-black text-red-500 uppercase tracking-wide">
            Run Defeated
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Defeated on <span className="font-bold text-slate-200">Ante {ante}</span> &bull;{" "}
            <span className="capitalize font-bold text-slate-200">{blindType} Blind</span>
            {activeBossModifier && ` (${activeBossModifier.name})`}
          </p>
        </div>

        {/* Score Comparison & Run Stats */}
        <div className="w-full bg-slate-900/80 p-4 rounded-xl border border-slate-800 text-xs space-y-2 text-left">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="text-slate-400">Final Round Score:</span>
            <span className="font-mono font-black text-red-400 text-sm">
              {formatNumber(roundScore)}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="text-slate-400">Required Target:</span>
            <span className="font-mono font-bold text-slate-300">
              {formatNumber(targetScore)}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="text-slate-400">Best Hand Scored:</span>
            <span className="font-mono font-bold text-amber-400">
              {runStats.bestHandType ?? "High Card"} ({formatNumber(runStats.highestHandScore)} pts)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px] text-slate-400">
            <div>Hands Played: <span className="font-bold text-slate-200">{runStats.handsPlayed}</span></div>
            <div>Discards Used: <span className="font-bold text-slate-200">{runStats.discardsUsed}</span></div>
            <div>Cards Played: <span className="font-bold text-slate-200">{runStats.cardsPlayed}</span></div>
            <div>Cash Earned: <span className="font-bold text-emerald-400">${runStats.totalMoneyEarned}</span></div>
          </div>
        </div>

        {/* Seed Info & Copy */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-300">
          <span className="text-[10px] uppercase text-slate-500 font-bold">Seed:</span>
          <span className="font-bold text-amber-400">{seed}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopySeed}
            className="h-6 px-2 text-[10px] text-slate-400 hover:text-white"
          >
            {copied ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <Check className="w-3 h-3" /> Copied
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Copy className="w-3 h-3" /> Copy
              </span>
            )}
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 w-full pt-1">
          <Button
            variant="balatroGold"
            size="lg"
            onClick={handleRetrySameSeed}
            className="w-full py-5 text-sm font-black tracking-wider flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> TRY AGAIN (SAME SEED)
          </Button>

          <div className="flex items-center gap-2 w-full">
            <Button
              variant="balatroBlue"
              size="sm"
              onClick={handleNewRun}
              className="flex-1 py-3 text-xs font-black tracking-wider"
            >
              <Play className="w-3.5 h-3.5 mr-1 fill-current" /> NEW RUN
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleMainMenu}
              className="flex-1 py-3 text-xs font-bold border-slate-700 text-slate-300 hover:text-white"
            >
              <Home className="w-3.5 h-3.5 mr-1" /> MAIN MENU
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
