"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGameStore } from "@/store/useGameStore";
import { formatNumber } from "@/lib/utils";
import { soundEngine } from "@/lib/sound";
import {
  Trophy,
  Sparkles,
  Copy,
  Check,
  Award,
  Clock,
  Coins,
} from "lucide-react";

export function VictoryScreen() {
  const money = useGameStore((state) => state.money);
  const seed = useGameStore((state) => state.seed);
  const jokers = useGameStore((state) => state.jokers);
  const runStats = useGameStore((state) => state.runStats);
  const resetGame = useGameStore((state) => state.resetGame);

  const [copied, setCopied] = useState(false);

  const handleCopySeed = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(seed);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNewRun = () => {
    soundEngine.playCardDeal();
    resetGame();
  };

  const elapsedSeconds = runStats.startTime
    ? Math.max(0, Math.floor((Date.now() - runStats.startTime) / 1000))
    : 0;
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const timeFormatted = `${minutes}m ${seconds}s`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 select-none overflow-y-auto">
      {/* Floating Gold Confetti Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 24 }).map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            initial={{
              y: -20,
              x: `${(i * 4.2) % 100}%`,
              opacity: 1,
              rotate: 0,
            }}
            animate={{
              y: "110vh",
              rotate: 360 * (i % 2 === 0 ? 1 : -1),
              opacity: [1, 1, 0],
            }}
            transition={{
              duration: 3.5 + (i % 5),
              repeat: Infinity,
              delay: (i * 0.2) % 3,
              ease: "linear",
            }}
            className={`absolute w-2.5 h-2.5 rounded-sm ${
              i % 3 === 0
                ? "bg-amber-400"
                : i % 3 === 1
                ? "bg-yellow-200"
                : "bg-red-400"
            }`}
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="max-w-xl w-full p-6 sm:p-8 rounded-2xl bg-slate-950 border-2 border-amber-400 shadow-2xl text-center flex flex-col items-center gap-5 relative z-10 my-auto"
      >
        {/* Victory Trophy Badge */}
        <div className="p-4 rounded-full bg-amber-500/20 text-amber-400 border-2 border-amber-500/50 shadow-lg shadow-amber-500/20">
          <Trophy className="w-12 h-12 text-amber-400" />
        </div>

        <div>
          <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 uppercase tracking-wider">
            VICTORY!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-semibold mt-1">
            You conquered all 8 Antes and defeated every Boss Blind!
          </p>
        </div>

        {/* Run Summary Statistics Grid */}
        <div className="w-full bg-slate-900/80 p-4 rounded-xl border border-slate-800 text-xs space-y-2 text-left">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" /> Ante Cleared:
            </span>
            <span className="font-mono font-black text-amber-400 text-sm">8 / 8</span>
          </div>

          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Best Hand Scored:
            </span>
            <span className="font-mono font-bold text-blue-300">
              {runStats.bestHandType ?? "High Card"} ({formatNumber(runStats.highestHandScore)} pts)
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-emerald-400" /> Bankroll & Total Earned:
            </span>
            <span className="font-mono font-bold text-emerald-400">
              ${money} (${runStats.totalMoneyEarned} earned)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px] text-slate-300">
            <div>Hands Played: <span className="font-bold text-white">{runStats.handsPlayed}</span></div>
            <div>Discards Used: <span className="font-bold text-white">{runStats.discardsUsed}</span></div>
            <div>Rerolls: <span className="font-bold text-white">{runStats.rerollsCount}</span></div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" /> {timeFormatted}
            </div>
          </div>
        </div>

        {/* Winning Joker Showcase */}
        {jokers.length > 0 && (
          <div className="w-full space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block text-left">
              Conquering Jokers ({jokers.length}/5)
            </span>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {jokers.map((joker) => (
                <div
                  key={joker.id}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-amber-500/40 flex flex-col items-center shadow-md"
                >
                  <span className="text-[11px] font-black text-amber-300 leading-none">
                    {joker.name}
                  </span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[8px] uppercase font-mono text-slate-400">
                      {joker.rarity}
                    </span>
                    {joker.edition && joker.edition !== "base" && (
                      <Badge variant="outline" className="text-[7px] py-0 px-1 border-purple-500 text-purple-300">
                        {joker.edition}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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

        {/* New Run Action Button */}
        <Button
          variant="balatroGold"
          size="lg"
          onClick={handleNewRun}
          className="w-full py-6 text-base font-black tracking-widest shadow-xl"
        >
          PLAY NEW RUN
        </Button>
      </motion.div>
    </div>
  );
}
