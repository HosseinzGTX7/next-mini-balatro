"use client";

import React, { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore, useHand, useSelectedCardIds } from "@/store/useGameStore";
import { CardView } from "@/features/poker/components/CardView";
import { ScorePreviewHUD } from "@/features/poker/components/ScorePreviewHUD";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

/**
 * Main Poker Felt Table Surface.
 * Renders the active cards staged for play, deselect triggers, and the live score preview.
 */
export const TableBoard = memo(function TableBoard() {
  const hand = useHand();
  const selectedIds = useSelectedCardIds();
  const toggleSelection = useGameStore((state) => state.toggleCardSelection);
  const clearSelection = useGameStore((state) => state.clearSelection);

  const selectedCards = hand.filter((card) => selectedIds.includes(card.id));

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center p-2 sm:p-4 my-auto">
      {/* Real-time Hand Score Forecast HUD */}
      <ScorePreviewHUD />

      {/* Central Felt Play Mat */}
      <div className="w-full max-w-4xl min-h-[160px] sm:min-h-[190px] border-2 border-dashed border-emerald-900/60 rounded-2xl flex flex-col items-center justify-center p-4 bg-emerald-950/15 backdrop-blur-xs relative overflow-hidden mt-2">
        {selectedCards.length === 0 ? (
          <div className="flex flex-col items-center gap-1 text-center py-6">
            <span className="text-xs sm:text-sm font-semibold text-emerald-300/40 uppercase tracking-widest">
              Felt Play Area
            </span>
            <span className="text-[11px] text-emerald-400/30">
              Click cards from your hand below to stage a poker hand (max 5)
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 w-full">
            {/* Staged Cards Rack */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
              <AnimatePresence mode="popLayout">
                {selectedCards.map((card) => (
                  <motion.div
                    key={`table-${card.id}`}
                    layout
                    initial={{ opacity: 0, scale: 0.8, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 30 }}
                    transition={{ type: "spring", stiffness: 450, damping: 28 }}
                  >
                    <CardView
                      card={card}
                      size="sm"
                      onClick={() => toggleSelection(card.id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Clear Staged Cards Action */}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              className="h-6 px-2 text-[10px] text-emerald-300/60 hover:text-red-400 hover:bg-slate-900/40 mt-1"
            >
              <X className="w-3 h-3 mr-1" /> Clear Selection ({selectedCards.length})
            </Button>
          </div>
        )}
      </div>
    </div>
  );
});
