"use client";

import React, { memo } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "@/store/useGameStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/utils";
import { soundEngine } from "@/lib/sound";
import {
  Skull,
  FastForward,
  Play,
  Coins,
  ShieldAlert,
} from "lucide-react";

export const BlindSelectionView = memo(function BlindSelectionView() {
  const ante = useGameStore((state) => state.ante);
  const money = useGameStore((state) => state.money);
  const currentBlinds = useGameStore((state) => state.currentBlinds);
  const activeBlindType = useGameStore((state) => state.blindType);
  const selectBlind = useGameStore((state) => state.selectBlind);
  const skipBlind = useGameStore((state) => state.skipBlind);

  if (!currentBlinds) return null;

  const { small, big, boss } = currentBlinds;

  return (
    <div className="flex-1 flex flex-col items-center justify-between p-4 sm:p-8 max-w-6xl mx-auto w-full my-auto select-none">
      {/* Top Ante Banner */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-6"
      >
        <span className="text-xs font-black uppercase tracking-widest text-amber-400 block mb-1">
          Blind Selection
        </span>
        <h2 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 uppercase tracking-tight">
          Ante {ante} / 8
        </h2>
        <div className="flex items-center justify-center gap-4 mt-2 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1 text-amber-400 font-bold">
            <Coins className="w-3.5 h-3.5" /> ${money}
          </span>
          <span>&bull;</span>
          <span>Defeat the Boss Blind to advance</span>
        </div>
      </motion.div>

      {/* 3 Blinds Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl my-auto">
        {/* 1. SMALL BLIND */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className={`rounded-2xl border-2 ${
            small.isDefeated || small.isSkipped
              ? "border-slate-800 bg-slate-950/40 opacity-50"
              : activeBlindType === "small"
              ? "border-blue-500 bg-gradient-to-b from-blue-950/70 to-slate-950 shadow-2xl shadow-blue-500/20"
              : "border-slate-800 bg-slate-950/80"
          } p-5 flex flex-col justify-between text-center relative overflow-hidden backdrop-blur-md`}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="border-blue-500/40 text-blue-400 uppercase text-[10px]">
                Small Blind
              </Badge>
              <span className="text-xs font-bold text-blue-400 font-mono">
                +${small.reward}
              </span>
            </div>

            <h3 className="text-2xl font-black text-blue-400 uppercase pt-2">
              {small.name}
            </h3>

            <div className="py-4">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Target Score
              </span>
              <span className="text-3xl sm:text-4xl font-black text-blue-300 font-mono">
                {formatNumber(small.targetScore)}
              </span>
            </div>

            {/* Skip Tag Reward Box */}
            {small.skipTag && (
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-left">
                <span className="text-[9px] uppercase font-bold text-amber-400 block mb-0.5">
                  Skip Reward:
                </span>
                <div className="text-xs font-bold text-slate-200">
                  {small.skipTag.name}
                </div>
                <div className="text-[10px] text-slate-400">
                  {small.skipTag.description}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 pt-6">
            {small.isDefeated ? (
              <Badge className="w-full py-2 justify-center bg-blue-950 text-blue-400 border border-blue-500/40 font-bold text-xs">
                DEFEATED
              </Badge>
            ) : small.isSkipped ? (
              <Badge className="w-full py-2 justify-center bg-slate-900 text-slate-500 border border-slate-800 font-bold text-xs">
                SKIPPED
              </Badge>
            ) : (
              <>
                <Button
                  variant="balatroBlue"
                  size="lg"
                  onClick={() => {
                    soundEngine.playCardDeal();
                    selectBlind("small");
                  }}
                  className="w-full font-black py-5 text-sm"
                >
                  <Play className="w-4 h-4 mr-1.5" /> SELECT
                </Button>

                {small.skipTag && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      soundEngine.playCashChime();
                      skipBlind("small");
                    }}
                    className="w-full border-amber-500/40 bg-amber-950/30 hover:bg-amber-900/50 text-amber-300 text-xs py-3"
                  >
                    <FastForward className="w-3.5 h-3.5 mr-1" /> SKIP (+{small.skipTag.name})
                  </Button>
                )}
              </>
            )}
          </div>
        </motion.div>

        {/* 2. BIG BLIND */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-2xl border-2 ${
            big.isDefeated || big.isSkipped
              ? "border-slate-800 bg-slate-950/40 opacity-50"
              : activeBlindType === "big"
              ? "border-amber-500 bg-gradient-to-b from-amber-950/70 to-slate-950 shadow-2xl shadow-amber-500/20"
              : "border-slate-800 bg-slate-950/80"
          } p-5 flex flex-col justify-between text-center relative overflow-hidden backdrop-blur-md`}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="border-amber-500/40 text-amber-400 uppercase text-[10px]">
                Big Blind
              </Badge>
              <span className="text-xs font-bold text-amber-400 font-mono">
                +${big.reward}
              </span>
            </div>

            <h3 className="text-2xl font-black text-amber-400 uppercase pt-2">
              {big.name}
            </h3>

            <div className="py-4">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Target Score
              </span>
              <span className="text-3xl sm:text-4xl font-black text-amber-300 font-mono">
                {formatNumber(big.targetScore)}
              </span>
            </div>

            {/* Skip Tag Reward Box */}
            {big.skipTag && (
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-left">
                <span className="text-[9px] uppercase font-bold text-amber-400 block mb-0.5">
                  Skip Reward:
                </span>
                <div className="text-xs font-bold text-slate-200">
                  {big.skipTag.name}
                </div>
                <div className="text-[10px] text-slate-400">
                  {big.skipTag.description}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 pt-6">
            {big.isDefeated ? (
              <Badge className="w-full py-2 justify-center bg-amber-950 text-amber-400 border border-amber-500/40 font-bold text-xs">
                DEFEATED
              </Badge>
            ) : big.isSkipped ? (
              <Badge className="w-full py-2 justify-center bg-slate-900 text-slate-500 border border-slate-800 font-bold text-xs">
                SKIPPED
              </Badge>
            ) : (
              <>
                <Button
                  variant="balatroGold"
                  size="lg"
                  onClick={() => {
                    soundEngine.playCardDeal();
                    selectBlind("big");
                  }}
                  className="w-full font-black py-5 text-sm"
                >
                  <Play className="w-4 h-4 mr-1.5" /> SELECT
                </Button>

                {big.skipTag && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      soundEngine.playCashChime();
                      skipBlind("big");
                    }}
                    className="w-full border-amber-500/40 bg-amber-950/30 hover:bg-amber-900/50 text-amber-300 text-xs py-3"
                  >
                    <FastForward className="w-3.5 h-3.5 mr-1" /> SKIP (+{big.skipTag.name})
                  </Button>
                )}
              </>
            )}
          </div>
        </motion.div>

        {/* 3. BOSS BLIND */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={`rounded-2xl border-2 ${
            boss.isDefeated
              ? "border-slate-800 bg-slate-950/40 opacity-50"
              : "border-red-500/90 bg-gradient-to-b from-red-950/80 via-slate-950 to-slate-950 shadow-2xl shadow-red-500/30"
          } p-5 flex flex-col justify-between text-center relative overflow-hidden backdrop-blur-md`}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="border-red-500/60 bg-red-950/60 text-red-400 uppercase text-[10px] flex items-center gap-1">
                <Skull className="w-3 h-3" /> Boss Blind
              </Badge>
              <span className="text-xs font-bold text-red-400 font-mono">
                +${boss.reward}
              </span>
            </div>

            <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-300 to-red-500 uppercase pt-2">
              {boss.name}
            </h3>

            <div className="py-4">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Target Score
              </span>
              <span className="text-3xl sm:text-4xl font-black text-red-400 font-mono">
                {formatNumber(boss.targetScore)}
              </span>
            </div>

            {/* Boss Ability Modifier Box */}
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-left">
              <span className="text-[9px] uppercase font-black text-red-400 flex items-center gap-1 mb-0.5">
                <ShieldAlert className="w-3 h-3" /> Boss Modifier:
              </span>
              <div className="text-xs font-bold text-red-200">
                {boss.bossModifier?.description}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-6">
            {boss.isDefeated ? (
              <Badge className="w-full py-2 justify-center bg-red-950 text-red-400 border border-red-500/40 font-bold text-xs">
                DEFEATED
              </Badge>
            ) : (
              <Button
                variant="balatroRed"
                size="lg"
                onClick={() => {
                  soundEngine.playScreenShake();
                  selectBlind("boss");
                }}
                className="w-full font-black py-5 text-sm"
              >
                <Skull className="w-4 h-4 mr-1.5" /> FIGHT BOSS
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
});
