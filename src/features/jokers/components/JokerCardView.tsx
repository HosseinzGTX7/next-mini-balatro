"use client";

import React, { memo } from "react";
import { motion } from "framer-motion";
import { JokerItem } from "@/types";
import { useGameStore } from "@/store/useGameStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronLeft, ChevronRight, DollarSign, Sparkles } from "lucide-react";
import { resolveBlueprintTarget } from "../services/joker-engine.service";

interface JokerCardViewProps {
  joker: JokerItem;
  index: number;
  totalJokers: number;
  isTriggering?: boolean;
}

const RARITY_STYLES: Record<
  JokerItem["rarity"],
  { border: string; bg: string; text: string; glow: string }
> = {
  common: {
    border: "border-slate-500/80",
    bg: "from-slate-900 via-slate-950 to-slate-900",
    text: "text-slate-300",
    glow: "shadow-slate-500/20",
  },
  uncommon: {
    border: "border-emerald-500/90",
    bg: "from-emerald-950/60 via-slate-950 to-emerald-950/40",
    text: "text-emerald-400",
    glow: "shadow-emerald-500/30",
  },
  rare: {
    border: "border-red-500/90",
    bg: "from-red-950/60 via-slate-950 to-red-950/40",
    text: "text-red-400",
    glow: "shadow-red-500/30",
  },
  legendary: {
    border: "border-purple-500",
    bg: "from-purple-950/70 via-slate-950 to-purple-950/50",
    text: "text-purple-300",
    glow: "shadow-purple-500/40",
  },
};

export const JokerCardView = memo(function JokerCardView({
  joker,
  index,
  totalJokers,
  isTriggering = false,
}: JokerCardViewProps) {
  const sellJoker = useGameStore((state) => state.sellJoker);
  const moveJoker = useGameStore((state) => state.moveJoker);
  const allJokers = useGameStore((state) => state.jokers);

  const style = RARITY_STYLES[joker.rarity] ?? RARITY_STYLES.common;
  const canMoveLeft = index > 0;
  const canMoveRight = index < totalJokers - 1;

  // Blueprint copy target preview
  const isBlueprint = joker.templateId === "blueprint";
  const blueprintTarget = isBlueprint
    ? resolveBlueprintTarget(index, allJokers)
    : null;

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            layout
            initial={{ scale: 0.8, opacity: 0, y: 15 }}
            animate={{
              scale: isTriggering ? 1.15 : 1,
              opacity: 1,
              y: isTriggering ? -12 : 0,
            }}
            exit={{ scale: 0.7, opacity: 0, transition: { duration: 0.2 } }}
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 450, damping: 25 }}
            className={`relative group w-24 h-36 sm:w-28 sm:h-40 rounded-xl border-2 ${
              isTriggering ? "border-amber-400 shadow-2xl shadow-amber-400/50 z-30" : `${style.border} ${style.glow}`
            } bg-gradient-to-b ${style.bg} p-2 flex flex-col justify-between select-none cursor-pointer shadow-lg overflow-hidden`}
          >
            {/* Edition Shimmer Overlays */}
            {joker.edition === "foil" && (
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-cyan-500/10 via-white/20 to-transparent mix-blend-overlay animate-pulse" />
            )}
            {joker.edition === "holographic" && (
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-red-500/15 via-green-500/15 to-blue-500/15 mix-blend-color-dodge opacity-80" />
            )}
            {joker.edition === "polychrome" && (
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-500/25 via-indigo-500/20 to-amber-500/20 mix-blend-overlay animate-pulse" />
            )}

            {/* Top Bar: Rarity Tag & Reorder Arrows */}
            <div className="flex items-center justify-between w-full relative z-10">
              <span className={`text-[8px] font-black uppercase tracking-wider ${style.text}`}>
                {joker.rarity}
              </span>

              {/* Mini shift controls (revealed on hover or focus) */}
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={!canMoveLeft}
                  onClick={(e) => {
                    e.stopPropagation();
                    moveJoker(joker.id, "left");
                  }}
                  className="h-5 w-5 p-0 text-slate-400 hover:text-white disabled:opacity-20"
                  title="Move evaluation order left"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={!canMoveRight}
                  onClick={(e) => {
                    e.stopPropagation();
                    moveJoker(joker.id, "right");
                  }}
                  className="h-5 w-5 p-0 text-slate-400 hover:text-white disabled:opacity-20"
                  title="Move evaluation order right"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Center: Name & Icon/Graphic Badge */}
            <div className="flex flex-col items-center justify-center text-center my-auto relative z-10 px-1">
              <h4 className="text-[11px] sm:text-xs font-black text-amber-300 leading-tight uppercase line-clamp-2">
                {joker.name}
              </h4>

              {isBlueprint && (
                <div className="mt-1 px-1.5 py-0.5 rounded bg-blue-950/80 border border-blue-500/40 text-[8px] font-mono text-blue-300 truncate max-w-full">
                  {blueprintTarget ? `-> ${blueprintTarget.name}` : "Inactive"}
                </div>
              )}

              {joker.edition && (
                <Badge
                  variant="outline"
                  className="mt-1 text-[7px] py-0 px-1 border-white/30 text-slate-200 uppercase tracking-widest font-black"
                >
                  <Sparkles className="w-2 h-2 mr-0.5 text-amber-300" />
                  {joker.edition}
                </Badge>
              )}
            </div>

            {/* Bottom: Sell Action & Trigger Type Indicator */}
            <div className="flex items-center justify-between w-full pt-1 border-t border-slate-800/80 relative z-10">
              <span className="text-[8px] font-mono text-slate-500 uppercase">
                #{index + 1}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  sellJoker(joker.id);
                }}
                className="h-5 px-1.5 py-0 text-[9px] font-bold border-amber-500/40 bg-amber-950/40 hover:bg-amber-800/50 text-amber-400"
                title={`Sell for $${joker.sellValue}`}
              >
                <DollarSign className="w-2.5 h-2.5" />
                Sell ${joker.sellValue}
              </Button>
            </div>
          </motion.div>
        </TooltipTrigger>

        {/* Rich Tooltip Content */}
        <TooltipContent
          side="bottom"
          className="max-w-xs bg-slate-950 border-slate-700 text-slate-200 p-3 shadow-2xl text-xs space-y-1.5"
        >
          <div className="flex items-center justify-between font-black uppercase text-amber-400">
            <span>{joker.name}</span>
            <span className={`text-[10px] ${style.text}`}>[{joker.rarity}]</span>
          </div>

          <p className="text-slate-300 font-medium leading-snug">
            {joker.description}
          </p>

          {isBlueprint && (
            <p className="text-[10px] text-blue-400 font-mono">
              Status: {blueprintTarget ? `Copying ${blueprintTarget.name}` : "No Joker to right"}
            </p>
          )}

          <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800 pt-1">
            <span>Order #{index + 1} of {totalJokers}</span>
            <span className="text-amber-400 font-mono">Sell: +${joker.sellValue}</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});
