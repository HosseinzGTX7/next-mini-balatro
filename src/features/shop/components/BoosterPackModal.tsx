"use client";

import React, { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/useGameStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CardView } from "@/features/poker/components/CardView";
import { PackageOpen, Sparkles, FastForward } from "lucide-react";

export const BoosterPackModal = memo(function BoosterPackModal() {
  const activePackSession = useGameStore((state) => state.activePackSession);
  const choosePackItem = useGameStore((state) => state.choosePackItem);
  const skipPack = useGameStore((state) => state.skipPack);

  if (!activePackSession) return null;

  const { pack, choices } = activePackSession;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none">
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 20 }}
          className="max-w-3xl w-full p-6 sm:p-8 rounded-2xl bg-slate-950 border-2 border-amber-500/80 shadow-2xl text-center flex flex-col items-center gap-6"
        >
          {/* Pack Header */}
          <div className="flex flex-col items-center gap-1">
            <div className="p-3 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 mb-1">
              <PackageOpen className="w-8 h-8" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 uppercase tracking-tight">
              {pack.name}
            </h3>
            <p className="text-xs text-slate-400">
              {pack.description}
            </p>
          </div>

          {/* Choices Row */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap my-auto w-full">
            {choices.map((choice) => (
              <motion.div
                key={choice.id}
                whileHover={{ y: -6, scale: 1.04 }}
                className="flex flex-col items-center gap-2.5 p-3 rounded-xl bg-slate-900/90 border border-slate-700 shadow-xl"
              >
                {choice.type === "joker" && choice.joker && (
                  <div className="w-24 h-36 sm:w-28 sm:h-40 rounded-lg border-2 border-amber-500/80 bg-gradient-to-b from-amber-950/60 to-slate-950 p-2 flex flex-col justify-between text-center">
                    <span className="text-[9px] uppercase font-black text-amber-400">
                      {choice.joker.rarity}
                    </span>
                    <h5 className="text-xs font-black text-amber-200 uppercase leading-tight">
                      {choice.joker.name}
                    </h5>
                    <p className="text-[8px] text-slate-400 line-clamp-3">
                      {choice.joker.description}
                    </p>
                    <Badge variant="outline" className="text-[8px] py-0 px-1 border-amber-500/30 text-amber-400">
                      Joker
                    </Badge>
                  </div>
                )}

                {choice.type === "consumable" && choice.consumable && (
                  <div className="w-24 h-36 sm:w-28 sm:h-40 rounded-lg border-2 border-purple-500/80 bg-gradient-to-b from-purple-950/60 to-slate-950 p-2 flex flex-col justify-between text-center">
                    <span className="text-[9px] uppercase font-black text-purple-300">
                      {choice.consumable.type}
                    </span>
                    <h5 className="text-xs font-black text-purple-200 uppercase leading-tight">
                      {choice.consumable.name}
                    </h5>
                    <p className="text-[8px] text-slate-400 line-clamp-3">
                      {choice.consumable.description}
                    </p>
                    <Badge variant="outline" className="text-[8px] py-0 px-1 border-purple-500/30 text-purple-300">
                      Consumable
                    </Badge>
                  </div>
                )}

                {choice.type === "card" && choice.card && (
                  <div className="flex flex-col items-center">
                    <CardView card={choice.card} size="md" disabled />
                  </div>
                )}

                <Button
                  variant="balatroBlue"
                  size="sm"
                  onClick={() => choosePackItem(choice.id)}
                  className="w-full font-black text-xs py-2"
                >
                  <Sparkles className="w-3 h-3 mr-1" /> CHOOSE
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Skip Pack Action */}
          <Button
            variant="outline"
            size="sm"
            onClick={skipPack}
            className="border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-300 text-xs px-6"
          >
            <FastForward className="w-3.5 h-3.5 mr-1" /> Skip Pack
          </Button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
});
