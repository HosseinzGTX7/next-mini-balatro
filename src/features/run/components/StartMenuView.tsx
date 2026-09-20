"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGameStore } from "@/store/useGameStore";
import { loadCurrentRun, clearCurrentRun } from "../services/persistence.service";
import { generateBalatroSeed, formatSeed } from "../services/seed.service";
import { SavedRunState } from "../schemas/run.schema";
import { CareerStatsDialog } from "./CareerStatsDialog";
import { soundEngine } from "@/lib/sound";
import {
  Trophy,
  Play,
  RotateCcw,
  Dice5,
  BarChart3,
  Sparkles,
  Coins,
} from "lucide-react";

export function StartMenuView() {
  const startGame = useGameStore((state) => state.startGame);
  const loadSavedRun = useGameStore((state) => state.loadSavedRun);

  const [savedRun, setSavedRun] = useState<SavedRunState | null>(null);
  const [seed, setSeed] = useState<string>("");
  const [statsOpen, setStatsOpen] = useState(false);

  useEffect(() => {
    setSavedRun(loadCurrentRun());
    setSeed(generateBalatroSeed());
  }, []);

  const handleStartNewRun = () => {
    soundEngine.playCardDeal();
    clearCurrentRun();
    startGame(seed);
  };

  const handleContinueRun = () => {
    if (!savedRun) return;
    soundEngine.playCardDeal();
    loadSavedRun(savedRun);
  };

  const handleAbandonRun = () => {
    if (window.confirm("Are you sure you want to discard your saved run?")) {
      clearCurrentRun();
      setSavedRun(null);
    }
  };

  const handleRandomizeSeed = () => {
    soundEngine.playCardSelect();
    setSeed(generateBalatroSeed());
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-4 sm:p-6 my-auto select-none">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-lg w-full p-6 sm:p-8 rounded-2xl bg-slate-950/90 border-2 border-slate-800 shadow-2xl backdrop-blur-xl flex flex-col items-center gap-5"
      >
        {/* Balatro Icon & Header */}
        <div className="flex flex-col items-center">
          <div className="inline-block p-4 rounded-full bg-red-950/40 border border-red-500/40 mb-3 text-red-400 shadow-lg shadow-red-950/30">
            <Trophy className="w-10 h-10" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-400 to-blue-500 uppercase tracking-tight">
            Mini-Balatro
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-sm leading-relaxed">
            The hypnotic poker-roguelike deckbuilder. Combine illegal hands with game-changing Jokers to generate astronomical multipliers.
          </p>
        </div>

        {/* ACTIVE SAVED RUN RESUME CARD */}
        {savedRun && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full p-4 rounded-xl bg-gradient-to-r from-blue-950/70 to-slate-900 border-2 border-blue-500/60 shadow-lg text-left space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Saved Run in Progress
              </span>
              <Badge variant="outline" className="font-mono text-[10px] text-amber-400 border-amber-500/40">
                Ante {savedRun.ante}/8
              </Badge>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-300 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 font-mono">
              <div className="flex items-center gap-1 text-amber-400 font-bold">
                <Coins className="w-3.5 h-3.5 text-amber-400" /> ${savedRun.money}
              </div>
              <div>Round {savedRun.round}</div>
              <div>{savedRun.jokers.length}/5 Jokers</div>
              <div>{savedRun.consumables.length}/2 Cards</div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="balatroBlue"
                size="lg"
                onClick={handleContinueRun}
                className="flex-1 py-5 font-black text-sm tracking-wider"
              >
                <Play className="w-4 h-4 mr-1.5 fill-current" /> CONTINUE RUN
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleAbandonRun}
                className="h-11 px-3 border-slate-700 text-xs text-slate-400 hover:text-red-400"
                title="Discard saved run"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* PRIMARY ACTION / NEW RUN */}
        {!savedRun ? (
          <Button
            variant="balatroBlue"
            size="lg"
            onClick={handleStartNewRun}
            className="w-full text-lg py-6 font-black tracking-widest shadow-xl"
          >
            <Play className="w-5 h-5 mr-2 fill-current" /> PLAY RUN
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={handleStartNewRun}
            className="w-full py-4 text-xs font-bold border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            Start Fresh New Run
          </Button>
        )}

        {/* SEED CONTROLS & CAREER STATS */}
        <div className="w-full flex items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          {/* Seed Input with Randomize */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">Seed:</span>
            <input
              type="text"
              value={seed}
              onChange={(e) => setSeed(formatSeed(e.target.value))}
              placeholder="RANDOM"
              className="bg-transparent text-xs font-mono font-bold text-amber-400 w-24 focus:outline-none uppercase"
              maxLength={10}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRandomizeSeed}
              className="h-6 w-6 text-slate-400 hover:text-amber-400 p-0"
              title="Generate Random Seed"
            >
              <Dice5 className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Career Stats Modal Trigger */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStatsOpen(true)}
            className="h-8 border-slate-700 text-xs font-bold text-slate-300 hover:text-amber-400"
          >
            <BarChart3 className="w-3.5 h-3.5 mr-1 text-amber-400" /> Career Stats
          </Button>
        </div>
      </motion.div>

      {/* Lifetime Career Statistics Dialog */}
      <CareerStatsDialog open={statsOpen} onOpenChange={setStatsOpen} />
    </div>
  );
}
