"use client";

import React, { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGameStore,
  useHand,
  useSelectedCardIds,
  useHandsRemaining,
  useDiscardsRemaining,
  useDeckCount,
} from "@/store/useGameStore";
import { CardView } from "./CardView";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDown,
  Shuffle,
  Layers,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import { soundEngine } from "@/lib/sound";

/**
 * Interactive Player Hand View.
 * Provides 8-card responsive rack, card selection, sorting, manual card shifting,
 * discard actions, and play hand triggers.
 */
export const HandView = memo(function HandView() {
  const hand = useHand();
  const selectedIds = useSelectedCardIds();
  const hands = useHandsRemaining();
  const discards = useDiscardsRemaining();
  const deckCount = useDeckCount();

  const toggleSelection = useGameStore((state) => state.toggleCardSelection);
  const clearSelection = useGameStore((state) => state.clearSelection);
  const discardSelected = useGameStore((state) => state.discardSelectedCards);
  const playSelected = useGameStore((state) => state.playSelectedHand);
  const sortHand = useGameStore((state) => state.sortHand);
  const reorderHandCards = useGameStore((state) => state.reorderHandCards);

  const selectedCount = selectedIds.length;
  const canPlay = hands > 0 && selectedCount > 0 && selectedCount <= 5;
  const canDiscard = discards > 0 && selectedCount > 0 && selectedCount <= 5;

  const handleCardClick = (cardId: string) => {
    if (selectedIds.includes(cardId)) {
      soundEngine.playCardDeselect();
    } else {
      soundEngine.playCardSelect();
    }
    toggleSelection(cardId);
  };

  const handleSort = (crit: "rank" | "suit") => {
    soundEngine.playCardDeal();
    sortHand(crit);
  };

  const handleDiscard = () => {
    soundEngine.playCardDiscard();
    discardSelected();
  };

  const handleClear = () => {
    soundEngine.playCardDeselect();
    clearSelection();
  };

  return (
    <div className="w-full flex flex-col items-center gap-3 max-w-5xl mx-auto px-2 pb-2">
      {/* Hand Utilities / Sorting Controls */}
      <div className="w-full flex items-center justify-between px-2 text-xs">
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSort("rank")}
            className="h-7 px-2.5 text-[11px] border-slate-700 bg-slate-900/70 hover:bg-slate-800 text-slate-300"
            title="Sort cards by rank (Ace to 2)"
          >
            <ArrowUpDown className="w-3 h-3 mr-1 text-amber-400" /> Sort Rank
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSort("suit")}
            className="h-7 px-2.5 text-[11px] border-slate-700 bg-slate-900/70 hover:bg-slate-800 text-slate-300"
            title="Sort cards by suit (Spades, Hearts, Clubs, Diamonds)"
          >
            <Shuffle className="w-3 h-3 mr-1 text-blue-400" /> Sort Suit
          </Button>
        </div>

        {/* Selection status and quick clear */}
        <div className="flex items-center gap-2">
          <span
            className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
              selectedCount === 5
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : selectedCount > 0
                ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                : "text-slate-500"
            }`}
          >
            {selectedCount}/5 Selected
          </span>

          {selectedCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-6 px-2 text-[10px] text-slate-400 hover:text-white"
            >
              <X className="w-3 h-3 mr-0.5" /> Clear
            </Button>
          )}
        </div>
      </div>

      {/* Hand Cards Rack */}
      <div className="w-full flex items-center justify-center gap-1.5 sm:gap-2.5 flex-wrap min-h-[125px] sm:min-h-[145px] py-1">
        <AnimatePresence mode="popLayout">
          {hand.map((card, index) => {
            const isSelected = selectedIds.includes(card.id);

            return (
              <motion.div
                key={card.id}
                layout
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                transition={{ type: "spring", stiffness: 450, damping: 30 }}
                className="relative group flex flex-col items-center"
              >
                {/* Manual Shifting Controls on Hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5 flex items-center gap-0.5 z-30 bg-slate-950/80 rounded px-1 py-0.5 border border-slate-700">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      reorderHandCards(index, index - 1);
                    }}
                    className="p-0.5 hover:text-amber-400 disabled:opacity-30"
                    title="Move card left"
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    disabled={index === hand.length - 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      reorderHandCards(index, index + 1);
                    }}
                    className="p-0.5 hover:text-amber-400 disabled:opacity-30"
                    title="Move card right"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <CardView
                  card={card}
                  isSelected={isSelected}
                  onClick={() => handleCardClick(card.id)}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Action Bar: Deck Info & Play/Discard Buttons */}
      <div className="w-full flex items-center justify-between max-w-3xl px-2 pt-1">
        {/* Deck Count and Discards Info */}
        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-slate-400" />
            <span>Deck: {deckCount}</span>
          </div>
          <div className="hidden sm:block text-[11px] text-slate-500">
            {discards} Discards left
          </div>
        </div>

        {/* Primary Game Actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="balatroRed"
            size="default"
            disabled={!canDiscard}
            onClick={handleDiscard}
            className="text-xs sm:text-sm px-4 min-w-[110px]"
          >
            DISCARD {selectedCount > 0 ? `(${selectedCount})` : ""}
          </Button>

          <Button
            variant="balatroBlue"
            size="default"
            disabled={!canPlay}
            onClick={() => playSelected()}
            className="text-xs sm:text-sm px-6 min-w-[130px]"
          >
            PLAY HAND {selectedCount > 0 ? `(${selectedCount})` : ""}
          </Button>
        </div>
      </div>
    </div>
  );
});
