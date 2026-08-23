"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
  Tv,
  RotateCcw,
  Info,
  Coins,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useGameStore,
  useGamePhase,
  useAnte,
  useRound,
  useBlindType,
  useHandsRemaining,
  useDiscardsRemaining,
  useMoney,
  useRoundScore,
  useTargetScore,
  useLastRoundBonus,
  useSeed,
} from "@/store/useGameStore";
import { formatNumber } from "@/lib/utils";
import { TableBoard } from "@/components/game/TableBoard";
import { HandView } from "@/features/poker/components/HandView";
import { BalatroBackground } from "@/components/game/BalatroBackground";
import { ScoringAnimationOverlay } from "@/features/scoring/components/ScoringAnimationOverlay";
import { JokerRack } from "@/features/jokers/components/JokerRack";
import { BlindSelectionView, BlindBanner } from "@/features/blinds/components";
import { ShopView, ConsumablesRack } from "@/features/shop/components";
import {
  StartMenuView,
  VictoryScreen,
  GameOverScreen,
} from "@/features/run/components";
import { soundEngine } from "@/lib/sound";
import { useScreenShake } from "@/lib/useScreenShake";

export function GameShell() {
  const phase = useGamePhase();
  const ante = useAnte();
  const round = useRound();
  const blindType = useBlindType();
  const seed = useSeed();
  const hands = useHandsRemaining();
  const discards = useDiscardsRemaining();
  const money = useMoney();
  const roundScore = useRoundScore();
  const targetScore = useTargetScore();
  const lastRoundBonus = useLastRoundBonus();

  const [crtEnabled, setCrtEnabled] = useState(true);
  const [soundMuted, setSoundMuted] = useState(soundEngine.getIsMuted());

  const isShaking = useScreenShake((state) => state.isShaking);
  const shakeIntensity = useScreenShake((state) => state.intensity);

  const advanceToNextBlind = useGameStore((state) => state.advanceToNextBlind);
  const resetGame = useGameStore((state) => state.resetGame);
  const openShop = useGameStore((state) => state.openShop);
  const currentBlinds = useGameStore((state) => state.currentBlinds);

  const handleSoundToggle = () => {
    const nextMuted = soundEngine.toggleMute();
    setSoundMuted(nextMuted);
    if (!nextMuted) {
      soundEngine.playCardSelect();
    }
  };

  const scoreProgress = Math.min(100, Math.round((roundScore / (targetScore || 1)) * 100));

  return (
    <motion.div
      animate={
        isShaking
          ? {
              x: shakeIntensity === "heavy" ? [-6, 6, -4, 4, -2, 2, 0] : [-3, 3, -2, 2, 0],
              y: shakeIntensity === "heavy" ? [4, -4, 3, -3, -1, 1, 0] : [2, -2, 1, -1, 0],
            }
          : { x: 0, y: 0 }
      }
      transition={{ duration: 0.25 }}
      className="relative min-h-screen w-full bg-[#0b0f14] text-slate-100 flex flex-col justify-between overflow-hidden select-none font-sans"
    >
      {/* Dynamic Swirling Psychedelic Balatro Vortex Background */}
      <BalatroBackground />

      {/* CRT Scanline & Vignette Effects */}
      {crtEnabled && (
        <>
          <div className="balatro-crt-overlay fixed inset-0 z-40 pointer-events-none opacity-30" />
          <div className="balatro-vignette fixed inset-0 z-40 pointer-events-none" />
        </>
      )}

      {/* Step-by-Step Sequential Scoring Animation Overlay */}
      <ScoringAnimationOverlay />

      {/* TOP BAR / HEADER */}
      <header className="relative z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 py-2.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-400 to-blue-500 uppercase drop-shadow-sm">
              Mini-Balatro
            </span>
            <Badge variant="outline" className="border-amber-500/40 text-amber-400 font-mono text-xs">
              Ante {ante}/8
            </Badge>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <Badge
              variant="outline"
              className={`capitalize text-xs font-bold ${
                blindType === "boss"
                  ? "border-purple-500 bg-purple-950/40 text-purple-300"
                  : blindType === "big"
                  ? "border-amber-500 bg-amber-950/40 text-amber-300"
                  : "border-blue-500 bg-blue-950/40 text-blue-300"
              }`}
            >
              {blindType} Blind (Round {round})
            </Badge>
          </div>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-2">
          {phase !== "menu" && seed && (
            <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-mono text-slate-400">
              <span className="text-slate-500 font-bold uppercase">Seed:</span>
              <span className="font-bold text-amber-400">{seed}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-950/30 border border-amber-500/40 rounded-lg text-amber-400 font-black text-sm shadow-inner">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>${money}</span>
          </div>

          {/* CRT toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCrtEnabled(!crtEnabled)}
            className={`h-8 w-8 text-xs ${crtEnabled ? "text-blue-400" : "text-slate-500"}`}
            title="Toggle CRT Shader Effect"
          >
            <Tv className="w-4 h-4" />
          </Button>

          {/* Sound toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSoundToggle}
            className="h-8 w-8 text-xs text-slate-400 hover:text-white"
            title="Toggle Retro Synthesizer Audio"
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-slate-300" />}
          </Button>

          {/* Rules Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white" title="How to Play">
                <Info className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-slate-900 border-slate-700 text-slate-200">
              <DialogHeader>
                <DialogTitle className="text-xl font-black text-amber-400 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" /> How to Play Mini-Balatro
                </DialogTitle>
                <DialogDescription className="text-slate-400">
                  A poker-roguelike deckbuilder where illegal hands score massive chips.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm pt-2">
                <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                  <h4 className="font-bold text-blue-400 mb-1">1. The Objective</h4>
                  <p className="text-xs text-slate-300">
                    Reach or exceed the Target Score before running out of Hands! Discard up to 5 cards to find winning poker combinations.
                  </p>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                  <h4 className="font-bold text-red-400 mb-1">2. Scoring Formula</h4>
                  <p className="text-xs text-slate-300 font-mono">
                    Total Score = (Base Chips + Card Chips) &times; (Base Mult + Joker Mults)
                  </p>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                  <h4 className="font-bold text-purple-400 mb-1">3. Jokers & Synergies</h4>
                  <p className="text-xs text-slate-300">
                    Equip up to 5 unique Jokers that add Flat Mult, Huge Chips, or Multiplicative X-Mult to conquer the Boss Blinds!
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {phase !== "menu" && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetGame}
              className="h-8 border-slate-700 text-xs text-slate-300 hover:text-red-400"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset
            </Button>
          )}
        </div>
      </header>

      {/* DYNAMIC JOKER & CONSUMABLES RACKS */}
      {phase !== "menu" && (
        <section className="relative z-20 px-3 sm:px-4 py-2 bg-slate-950/60 border-b border-slate-800/60 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto flex flex-col xl:flex-row items-center justify-between gap-3 xl:gap-4">
            <div className="flex-1 w-full overflow-x-auto">
              <JokerRack />
            </div>
            <div className="shrink-0 border-t xl:border-t-0 xl:border-l border-slate-800/80 pt-2 xl:pt-0 xl:pl-4">
              <ConsumablesRack />
            </div>
          </div>
        </section>
      )}

      {/* MAIN PLAY AREA & POKER TABLE FELT */}
      <main className="relative z-10 flex-1 flex flex-col justify-between p-4 poker-felt-pattern">
        {phase === "menu" ? (
          /* START SCREEN */
          <StartMenuView />
        ) : phase === "blindSelect" ? (
          /* BLIND SELECTION SCREEN */
          <BlindSelectionView />
        ) : phase === "shop" ? (
          /* SHOP SCREEN */
          <ShopView />
        ) : (
          /* ACTIVE PLAYING BOARD */
          <div className="w-full max-w-6xl mx-auto flex flex-col flex-1 justify-between gap-3 sm:gap-4">
            {/* ACTIVE BLIND & BOSS MODIFIER BANNER */}
            <BlindBanner />

            {/* SCORE TARGET & RESOURCES DASHBOARD */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950/85 border border-slate-800/80 backdrop-blur-md shadow-xl">
              {/* Target & Current Round Score */}
              <div className="flex flex-col justify-center gap-1 border-r-0 md:border-r border-slate-800/60 pr-0 md:pr-4">
                <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-semibold">
                  <span>Round Score</span>
                  <span>Goal: {formatNumber(targetScore)}</span>
                </div>
                <div className="text-2xl font-black text-amber-400 tracking-tight flex items-baseline gap-1">
                  <span>{formatNumber(roundScore)}</span>
                  <span className="text-xs text-slate-500 font-normal">/ {formatNumber(targetScore)}</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-red-500 h-full transition-all duration-300"
                    style={{ width: `${scoreProgress}%` }}
                  />
                </div>
              </div>

              {/* Hands & Discards Count */}
              <div className="flex items-center justify-around px-4">
                <div className="text-center">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 block mb-1">
                    Hands
                  </span>
                  <span className="inline-flex items-center justify-center w-12 h-10 rounded-lg bg-blue-950/70 border border-blue-500/50 text-xl font-black text-blue-400 shadow-inner">
                    {hands}
                  </span>
                </div>

                <div className="text-center">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-red-400 block mb-1">
                    Discards
                  </span>
                  <span className="inline-flex items-center justify-center w-12 h-10 rounded-lg bg-red-950/70 border border-red-500/50 text-xl font-black text-red-400 shadow-inner">
                    {discards}
                  </span>
                </div>
              </div>
            </div>

            {/* MODULAR TABLE BOARD (Staged Cards & Live Score Forecast) */}
            <TableBoard />

            {/* MODULAR INTERACTIVE HAND VIEW (Card Rack, Manual Reorder, Discard & Play) */}
            <HandView />
          </div>
        )}

        {/* ROUND WON MODAL OVERLAY */}
        <AnimatePresence>
          {phase === "roundWon" && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 20 }}
                className="max-w-md w-full p-6 rounded-2xl bg-slate-900 border-2 border-amber-500/80 shadow-2xl text-center flex flex-col items-center gap-4"
              >
                <div className="p-3 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  <Trophy className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-amber-400 uppercase tracking-wider">
                    Round Victory!
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    You beat the {blindType} blind with {formatNumber(roundScore)} points.
                  </p>
                </div>

                <div className="w-full grid grid-cols-2 gap-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-sm">
                  <div className="text-left text-slate-400">Target Score:</div>
                  <div className="text-right font-mono font-bold text-slate-200">
                    {formatNumber(targetScore)}
                  </div>
                  <div className="text-left text-slate-400">Total Scored:</div>
                  <div className="text-right font-mono font-bold text-amber-400">
                    {formatNumber(roundScore)}
                  </div>
                  <div className="text-left text-slate-400">Blind Reward:</div>
                  <div className="text-right font-mono font-bold text-emerald-400">
                    +${lastRoundBonus?.reward ?? (currentBlinds ? currentBlinds[blindType].reward : 3)}
                  </div>
                  <div className="text-left text-slate-400">Unused Hands:</div>
                  <div className="text-right font-mono font-bold text-blue-400">
                    +${lastRoundBonus?.handsBonus ?? hands}
                  </div>
                  <div className="text-left text-slate-400">Interest Earned:</div>
                  <div className="text-right font-mono font-bold text-amber-400">
                    +${lastRoundBonus?.interest ?? 0}
                  </div>
                </div>

                <div className="flex flex-col gap-2 w-full pt-1">
                  <Button
                    variant="balatroGold"
                    size="lg"
                    onClick={() => {
                      soundEngine.playCashChime();
                      openShop();
                    }}
                    className="w-full py-5 text-base font-black tracking-wider flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-5 h-5" /> VISIT SHOP
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      soundEngine.playCashChime();
                      advanceToNextBlind();
                    }}
                    className="w-full py-2.5 text-xs text-slate-400 border-slate-700 hover:text-white"
                  >
                    Skip Shop & Next Blind &rarr;
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ROUND LOST (GAME OVER) SCREEN */}
        <AnimatePresence>
          {phase === "roundLost" && <GameOverScreen />}
        </AnimatePresence>

        {/* RUN WON (VICTORY) CELEBRATION SCREEN */}
        <AnimatePresence>
          {phase === "gameWon" && <VictoryScreen />}
        </AnimatePresence>
      </main>

      {/* Boss Blind Crimson Ambient Screen Tint */}
      {blindType === "boss" && phase === "playing" && (
        <div className="fixed inset-0 pointer-events-none bg-red-950/15 mix-blend-color-burn z-10" />
      )}
    </motion.div>
  );
}
