"use client";

import React, { useEffect, useState, memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useGameStore } from "@/store/useGameStore";
import { CardView } from "@/features/poker/components/CardView";
import { soundEngine } from "@/lib/sound";
import { useScreenShake } from "@/lib/useScreenShake";
import { formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FastForward, Flame } from "lucide-react";

/**
 * Step-by-step Sequential Scoring Animation Overlay.
 * Elevates played cards to center focus, iterates through scoring events with
 * escalating audio chimes, multiplier flame bursts, screen shakes, and confetti.
 */
export const ScoringAnimationOverlay = memo(function ScoringAnimationOverlay() {
  const phase = useGameStore((state) => state.phase);
  const breakdown = useGameStore((state) => state.activeScoringBreakdown);
  const playedCards = useGameStore((state) => state.activeScoringCards);
  const targetScore = useGameStore((state) => state.targetScore);
  const roundScore = useGameStore((state) => state.roundScore);
  const handsRemaining = useGameStore((state) => state.handsRemaining);
  const commitHandScore = useGameStore((state) => state.commitHandScore);

  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [runningChips, setRunningChips] = useState(0);
  const [runningMult, setRunningMult] = useState(0);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  const triggerShake = useScreenShake((state) => state.triggerShake);

  const isScoring = phase === "scoring" && breakdown !== null;

  // Handle immediate skip
  const handleSkip = useCallback(() => {
    if (!breakdown) return;

    soundEngine.playScreenShake();
    triggerShake("normal", 250);

    const willWin = roundScore + breakdown.totalHandScore >= targetScore;
    if (willWin) {
      soundEngine.playWinFanfare();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    commitHandScore(breakdown);
  }, [breakdown, roundScore, targetScore, triggerShake, commitHandScore]);

  // Keyboard shortcut: Space or Enter to skip animation
  useEffect(() => {
    if (!isScoring) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        handleSkip();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isScoring, handleSkip]);

  // Sequential Step Iterator
  useEffect(() => {
    if (!isScoring || !breakdown) {
      setCurrentEventIndex(0);
      setRunningChips(0);
      setRunningMult(0);
      setActiveCardId(null);
      return;
    }

    const events = breakdown.events;
    let index = 0;

    const timer = setInterval(() => {
      if (index >= events.length) {
        clearInterval(timer);

        // Conclude scoring sequence after a brief pause
        setTimeout(() => {
          const willWin = roundScore + breakdown.totalHandScore >= targetScore;
          if (willWin) {
            soundEngine.playWinFanfare();
            confetti({
              particleCount: 90,
              spread: 80,
              origin: { y: 0.6 },
            });
          } else if (handsRemaining - 1 <= 0) {
            soundEngine.playDefeatSound();
          }
          commitHandScore(breakdown);
        }, 550);
        return;
      }

      const event = events[index];
      setCurrentEventIndex(index);

      // Process step audio & visual feedback
      switch (event.type) {
        case "baseHand":
          setRunningChips(event.chips);
          setRunningMult(event.mult);
          soundEngine.playChipAdd(0);
          break;

        case "cardChips":
          setActiveCardId(event.cardId);
          setRunningChips(event.currentChips);
          soundEngine.playChipAdd(index);
          break;

        case "cardMult":
          setActiveCardId(event.cardId);
          setRunningMult(event.currentMult);
          soundEngine.playMultTrigger(index);
          break;

        case "cardXMult":
          setActiveCardId(event.cardId);
          setRunningMult(event.currentMult);
          soundEngine.playXMultTrigger();
          triggerShake("light", 200);
          break;

        case "heldInHand":
          setRunningMult(event.currentMult);
          soundEngine.playXMultTrigger();
          break;

        case "joker":
          setRunningChips(event.currentChips);
          setRunningMult(event.currentMult);
          if (event.effectType === "xmult") {
            soundEngine.playXMultTrigger();
            triggerShake("normal", 200);
          } else if (event.effectType === "mult") {
            soundEngine.playMultTrigger(3);
          } else {
            soundEngine.playChipAdd(4);
          }
          break;

        case "finalTally":
          setActiveCardId(null);
          setRunningChips(event.totalChips);
          setRunningMult(event.totalMult);
          soundEngine.playScreenShake();
          triggerShake("heavy", 350);
          break;
      }

      index++;
    }, 320);

    return () => clearInterval(timer);
  }, [isScoring, breakdown, roundScore, targetScore, handsRemaining, triggerShake, commitHandScore]);

  if (!isScoring || !breakdown) return null;

  const currentScore = Math.floor(runningChips * runningMult);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-between p-4 sm:p-8 bg-black/80 backdrop-blur-md select-none"
      >
        {/* Top Header: Hand Name Announcement */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="text-center mt-4"
        >
          <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400 block mb-1">
            Played Hand
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 uppercase drop-shadow-md">
            {breakdown.evaluation.handName}
          </h2>
          <div className="flex items-center justify-center gap-2 text-xs font-mono text-slate-400 mt-0.5">
            <span>Level {breakdown.evaluation.level}</span>
            <span>&bull;</span>
            <span className="text-amber-400">Step {currentEventIndex + 1}/{breakdown.events.length}</span>
          </div>
        </motion.div>

        {/* Center Stage: Elevated Played Cards */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap my-auto max-w-4xl">
          {playedCards.map((card) => {
            const isTarget = card.id === activeCardId;

            return (
              <motion.div
                key={card.id}
                animate={{
                  y: isTarget ? -28 : 0,
                  scale: isTarget ? 1.12 : 1,
                }}
                transition={{ type: "spring", stiffness: 450, damping: 24 }}
                className="relative"
              >
                {/* Active Scoring Flash Indicator */}
                {isTarget && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1.2, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase shadow-lg shadow-red-600/50 z-30"
                  >
                    <Flame className="w-3 h-3 text-yellow-300" />
                    SCORING!
                  </motion.div>
                )}

                <CardView
                  card={card}
                  size="md"
                  isScoringTarget={isTarget}
                  disabled={true}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Stage: Escalating Score Formula HUD */}
        <div className="w-full max-w-lg flex flex-col items-center gap-3 mb-4">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {/* Running Chips Box */}
            <motion.div
              key={`scoring-chips-${runningChips}`}
              initial={{ scale: 1.25 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 22 }}
              className="px-4 py-2 rounded-xl bg-blue-950 border-2 border-blue-400 text-center shadow-2xl shadow-blue-500/30 min-w-[90px]"
            >
              <span className="text-[10px] uppercase font-black text-blue-300 block">
                Chips
              </span>
              <span className="text-xl sm:text-2xl font-black text-[#009dff] font-mono">
                {formatNumber(runningChips)}
              </span>
            </motion.div>

            {/* Multiply Sign */}
            <span className="text-2xl sm:text-3xl font-black text-red-500">
              &times;
            </span>

            {/* Running Mult Box */}
            <motion.div
              key={`scoring-mult-${runningMult}`}
              initial={{ scale: 1.25 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 22 }}
              className="px-4 py-2 rounded-xl bg-red-950 border-2 border-red-400 text-center shadow-2xl shadow-red-500/30 min-w-[90px]"
            >
              <span className="text-[10px] uppercase font-black text-red-300 block">
                Mult
              </span>
              <span className="text-xl sm:text-2xl font-black text-[#fe5f55] font-mono">
                {runningMult}
              </span>
            </motion.div>

            {/* Equals Sign */}
            <span className="text-xl sm:text-2xl font-black text-slate-400">
              =
            </span>

            {/* Running Total Score */}
            <motion.div
              key={`scoring-score-${currentScore}`}
              initial={{ scale: 1.15 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 22 }}
              className="px-5 py-2 rounded-xl bg-amber-950 border-2 border-amber-400 text-center shadow-2xl shadow-amber-500/30 min-w-[110px]"
            >
              <span className="text-[10px] uppercase font-black text-amber-300 block">
                Total Score
              </span>
              <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                {formatNumber(currentScore)}
              </span>
            </motion.div>
          </div>

          {/* Skip Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSkip}
            className="h-8 px-4 text-xs border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300 mt-2"
          >
            <FastForward className="w-3.5 h-3.5 mr-1 text-amber-400" /> Skip (Space)
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
});
