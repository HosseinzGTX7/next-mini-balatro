"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Trophy,
  Flame,
  Volume2,
  VolumeX,
  Tv,
  RotateCcw,
  Info,
  Layers,
  Coins,
  ArrowUpDown,
  Shuffle,
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
  useHandChips,
  useHandMult,
  useActivePokerHand,
  useJokers,
  useMaxJokers,
  useHand,
  useSelectedCardIds,
  useDeckCount,
} from "@/store/useGameStore";
import { formatNumber } from "@/lib/utils";

export function GameShell() {
  const phase = useGamePhase();
  const ante = useAnte();
  const round = useRound();
  const blindType = useBlindType();
  const hands = useHandsRemaining();
  const discards = useDiscardsRemaining();
  const money = useMoney();
  const roundScore = useRoundScore();
  const targetScore = useTargetScore();
  const chips = useHandChips();
  const mult = useHandMult();
  const activePokerHand = useActivePokerHand();
  const jokers = useJokers();
  const maxJokers = useMaxJokers();
  const hand = useHand();
  const selectedIds = useSelectedCardIds();
  const deckCount = useDeckCount();

  const [crtEnabled, setCrtEnabled] = useState(true);
  const [soundMuted, setSoundMuted] = useState(false);

  const startGame = useGameStore((state) => state.startGame);
  const toggleCardSelection = useGameStore((state) => state.toggleCardSelection);
  const discardSelected = useGameStore((state) => state.discardSelectedCards);
  const playSelectedHand = useGameStore((state) => state.playSelectedHand);
  const advanceToNextBlind = useGameStore((state) => state.advanceToNextBlind);
  const sortHand = useGameStore((state) => state.sortHand);
  const resetGame = useGameStore((state) => state.resetGame);

  const scoreProgress = Math.min(100, Math.round((roundScore / (targetScore || 1)) * 100));

  return (
    <div className="relative min-h-screen w-full bg-[#0d1217] text-slate-100 flex flex-col justify-between overflow-hidden select-none font-sans">
      {/* CRT Scanline & Vignette Effects */}
      {crtEnabled && (
        <>
          <div className="balatro-crt-overlay fixed inset-0 z-40 pointer-events-none opacity-40" />
          <div className="balatro-vignette fixed inset-0 z-40 pointer-events-none" />
        </>
      )}

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
            onClick={() => setSoundMuted(!soundMuted)}
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

      {/* JOKER SLOTS BAR */}
      <section className="relative z-20 px-4 py-2 bg-slate-950/40 border-b border-slate-800/40">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-500" /> Jokers ({jokers.length}/{maxJokers})
            </span>
          </div>

          <div className="flex items-center gap-2">
            {Array.from({ length: maxJokers }).map((_, idx) => {
              const joker = jokers[idx];
              return (
                <div
                  key={idx}
                  className={`w-20 h-28 sm:w-24 sm:h-32 rounded-lg border-2 flex flex-col items-center justify-center p-2 text-center transition-all ${
                    joker
                      ? "border-amber-500/80 bg-gradient-to-b from-amber-950/40 to-slate-900 shadow-md shadow-amber-900/30"
                      : "border-dashed border-slate-800/80 bg-slate-900/20 text-slate-700"
                  }`}
                >
                  {joker ? (
                    <div className="flex flex-col items-center justify-between h-full w-full">
                      <span className="text-[10px] uppercase font-bold text-amber-300 line-clamp-2">
                        {joker.name}
                      </span>
                      <span className="text-[9px] text-slate-400 line-clamp-3">
                        {joker.description}
                      </span>
                      <Badge variant="outline" className="text-[8px] py-0 px-1 border-amber-500/30 text-amber-400">
                        ${joker.sellValue}
                      </Badge>
                    </div>
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-600">Empty</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* MAIN PLAY AREA & POKER TABLE FELT */}
      <main className="relative z-10 flex-1 flex flex-col justify-between p-4 poker-felt-pattern">
        {phase === "menu" ? (
          /* START SCREEN */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 my-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="max-w-lg p-8 rounded-2xl bg-slate-950/90 border-2 border-slate-800 shadow-2xl backdrop-blur-xl"
            >
              <div className="inline-block p-4 rounded-full bg-red-950/40 border border-red-500/40 mb-4 text-red-400">
                <Trophy className="w-12 h-12" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-400 to-blue-500 uppercase mb-3">
                Mini-Balatro
              </h1>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                The hypnotic roguelike poker deckbuilder. Combine poker hands with game-changing Jokers to generate astronomical multipliers.
              </p>
              <Button
                variant="balatroBlue"
                size="lg"
                onClick={() => startGame()}
                className="w-full text-lg py-6 font-black tracking-widest"
              >
                PLAY RUN
              </Button>
            </motion.div>
          </div>
        ) : (
          /* ACTIVE PLAYING BOARD */
          <div className="w-full max-w-6xl mx-auto flex flex-col flex-1 justify-between gap-4">
            {/* SCORE TARGET DASHBOARD */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-950/85 border border-slate-800/80 backdrop-blur-md shadow-xl">
              {/* Target & Current Round Score */}
              <div className="flex flex-col justify-center gap-1 border-r border-slate-800/60 pr-4">
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
              <div className="flex items-center justify-around border-r border-slate-800/60 px-4">
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

              {/* Hand Score Preview (Chips X Mult) */}
              <div className="flex flex-col items-center justify-center gap-1 pl-4">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  {activePokerHand || "Select Cards"}
                </span>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 rounded-lg bg-blue-950/80 border border-blue-500/60 text-center min-w-[55px]">
                    <span className="text-[9px] uppercase font-bold text-blue-300 block">Chips</span>
                    <span className="text-base font-black text-[#009dff]">{chips}</span>
                  </div>
                  <span className="text-lg font-black text-slate-500">&times;</span>
                  <div className="px-3 py-1 rounded-lg bg-red-950/80 border border-red-500/60 text-center min-w-[55px]">
                    <span className="text-[9px] uppercase font-bold text-red-300 block">Mult</span>
                    <span className="text-base font-black text-[#fe5f55]">{mult}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* FELT PLAY MAT / SELECTED CARDS PREVIEW */}
            <div className="flex-1 flex items-center justify-center min-h-[160px] py-4">
              <div className="w-full h-full border-2 border-dashed border-emerald-900/60 rounded-2xl flex flex-col items-center justify-center p-4 bg-emerald-950/10 backdrop-blur-xs">
                {selectedIds.length === 0 ? (
                  <p className="text-xs sm:text-sm font-semibold text-emerald-300/50 uppercase tracking-widest">
                    Select up to 5 cards to play or discard
                  </p>
                ) : (
                  <div className="flex items-center gap-2 flex-wrap justify-center">
                    {hand
                      .filter((c) => selectedIds.includes(c.id))
                      .map((card) => (
                        <div
                          key={card.id}
                          className="w-14 h-20 sm:w-16 sm:h-24 rounded-lg bg-[#f6f3e8] text-slate-900 border-2 border-amber-400 shadow-lg flex flex-col justify-between p-1.5 font-bold"
                        >
                          <span
                            className={`text-xs ${
                              card.suit === "hearts" || card.suit === "diamonds"
                                ? "text-red-600"
                                : "text-slate-900"
                            }`}
                          >
                            {card.rank}
                          </span>
                          <span
                            className={`text-base self-center ${
                              card.suit === "hearts" || card.suit === "diamonds"
                                ? "text-red-600"
                                : "text-slate-900"
                            }`}
                          >
                            {card.suit === "hearts"
                              ? "♥"
                              : card.suit === "diamonds"
                              ? "♦"
                              : card.suit === "clubs"
                              ? "♣"
                              : "♠"}
                          </span>
                          <span className="text-[10px] self-end text-blue-600 font-mono">
                            +{card.chipValue}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* HAND OF CARDS RACK */}
            <div className="w-full flex flex-col items-center gap-3">
              {/* Hand Utilities / Sorting */}
              <div className="flex items-center gap-2 self-center text-xs">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sortHand("rank")}
                  className="h-7 px-2.5 text-[11px] border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-300"
                >
                  <ArrowUpDown className="w-3 h-3 mr-1 text-amber-400" /> Sort Rank
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sortHand("suit")}
                  className="h-7 px-2.5 text-[11px] border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-300"
                >
                  <Shuffle className="w-3 h-3 mr-1 text-blue-400" /> Sort Suit
                </Button>
              </div>

              {/* Cards Rack */}
              <div className="flex items-center justify-center gap-1.5 sm:gap-3 flex-wrap max-w-4xl px-2">
                <AnimatePresence>
                  {hand.map((card) => {
                    const isSelected = selectedIds.includes(card.id);
                    const isRedSuit = card.suit === "hearts" || card.suit === "diamonds";
                    const hasSpecialEdition = card.edition !== "base";
                    const hasEnhancement = card.enhancement !== "none";

                    return (
                      <motion.button
                        key={card.id}
                        type="button"
                        onClick={() => toggleCardSelection(card.id)}
                        whileHover={{ y: -8, scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        animate={{
                          y: isSelected ? -20 : 0,
                          borderColor: isSelected
                            ? "#38bdf8"
                            : hasSpecialEdition
                            ? "#a855f7"
                            : "#2a3439",
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className={`w-14 h-22 sm:w-18 sm:h-28 rounded-lg bg-[#f6f3e8] border-2 shadow-md flex flex-col justify-between p-1.5 sm:p-2 cursor-pointer transition-shadow relative ${
                          isSelected
                            ? "shadow-blue-500/50 ring-2 ring-blue-400 shadow-xl"
                            : "hover:shadow-lg"
                        } ${
                          card.isDebuffed ? "opacity-60 grayscale" : ""
                        }`}
                      >
                        {/* Edition / Seal Indicator Badge */}
                        {hasSpecialEdition && (
                          <span className="absolute -top-2 -right-1 px-1 py-0.2 text-[8px] font-extrabold rounded bg-purple-600 text-white uppercase shadow-sm">
                            {card.edition}
                          </span>
                        )}
                        {card.seal !== "none" && (
                          <span className="absolute -top-2 -left-1 px-1 py-0.2 text-[8px] font-extrabold rounded bg-amber-500 text-slate-950 uppercase shadow-sm">
                            {card.seal}
                          </span>
                        )}

                        <div className="flex items-center justify-between w-full">
                          <span className={`text-xs sm:text-sm font-black ${isRedSuit ? "text-red-600" : "text-slate-900"}`}>
                            {card.rank}
                          </span>
                          <span className={`text-xs ${isRedSuit ? "text-red-600" : "text-slate-900"}`}>
                            {card.suit === "hearts"
                              ? "♥"
                              : card.suit === "diamonds"
                              ? "♦"
                              : card.suit === "clubs"
                              ? "♣"
                              : "♠"}
                          </span>
                        </div>

                        <div
                          className={`text-xl sm:text-3xl self-center font-bold ${
                            isRedSuit ? "text-red-600" : "text-slate-900"
                          }`}
                        >
                          {card.suit === "hearts"
                            ? "♥"
                            : card.suit === "diamonds"
                            ? "♦"
                            : card.suit === "clubs"
                            ? "♣"
                            : "♠"}
                        </div>

                        {hasEnhancement && (
                          <div className="text-[8px] font-bold text-amber-800 bg-amber-200/80 rounded px-1 text-center uppercase truncate">
                            {card.enhancement}
                          </div>
                        )}

                        <div className="flex items-center justify-between w-full text-[10px] font-mono">
                          <span className="text-blue-700 font-bold">+{card.chipValue}</span>
                          <span className="text-slate-400 text-[8px] uppercase">{card.suit.slice(0, 3)}</span>
                        </div>
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* ACTION BUTTONS & DECK INFO */}
              <div className="w-full flex items-center justify-between max-w-2xl px-4 py-2">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <Layers className="w-4 h-4 text-slate-400" />
                  <span>Deck: {deckCount} cards</span>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="balatroRed"
                    size="default"
                    disabled={discards <= 0 || selectedIds.length === 0}
                    onClick={discardSelected}
                    className="text-xs sm:text-sm px-4"
                  >
                    DISCARD ({selectedIds.length})
                  </Button>

                  <Button
                    variant="balatroBlue"
                    size="default"
                    disabled={hands <= 0 || selectedIds.length === 0}
                    onClick={() => playSelectedHand()}
                    className="text-xs sm:text-sm px-6"
                  >
                    PLAY HAND ({selectedIds.length})
                  </Button>
                </div>
              </div>
            </div>
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
                    Blind Defeated!
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
                  <div className="text-left text-slate-400">Unused Hands Bonus:</div>
                  <div className="text-right font-mono font-bold text-blue-400">
                    +${hands}
                  </div>
                </div>

                <Button
                  variant="balatroGold"
                  size="lg"
                  onClick={() => advanceToNextBlind()}
                  className="w-full py-5 text-base font-black tracking-wider"
                >
                  NEXT BLIND
                </Button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ROUND LOST (GAME OVER) MODAL OVERLAY */}
        <AnimatePresence>
          {phase === "roundLost" && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 20 }}
                className="max-w-md w-full p-6 rounded-2xl bg-slate-900 border-2 border-red-500/80 shadow-2xl text-center flex flex-col items-center gap-4"
              >
                <div className="p-3 rounded-full bg-red-500/20 text-red-500 border border-red-500/40">
                  <Flame className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-red-500 uppercase tracking-wider">
                    Run Defeated
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    You ran out of hands before reaching the target score.
                  </p>
                </div>

                <div className="w-full grid grid-cols-2 gap-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-sm">
                  <div className="text-left text-slate-400">Final Score:</div>
                  <div className="text-right font-mono font-bold text-red-400">
                    {formatNumber(roundScore)}
                  </div>
                  <div className="text-left text-slate-400">Required:</div>
                  <div className="text-right font-mono font-bold text-slate-200">
                    {formatNumber(targetScore)}
                  </div>
                </div>

                <Button
                  variant="balatroRed"
                  size="lg"
                  onClick={() => resetGame()}
                  className="w-full py-5 text-base font-black tracking-wider"
                >
                  TRY AGAIN
                </Button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
