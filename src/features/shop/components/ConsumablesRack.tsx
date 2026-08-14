"use client";

import React, { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/useGameStore";
import { ConsumableItem } from "../schemas/consumable.schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Sparkles, DollarSign, Zap, Plus } from "lucide-react";

export const ConsumablesRack = memo(function ConsumablesRack() {
  const consumables = useGameStore((state) => state.consumables);
  const maxConsumables = useGameStore((state) => state.maxConsumables);
  const useConsumable = useGameStore((state) => state.useConsumable);
  const sellConsumable = useGameStore((state) => state.sellConsumable);

  const [feedback, setFeedback] = useState<string | null>(null);

  const handleUse = (item: ConsumableItem) => {
    const result = useConsumable(item.id);
    setFeedback(result.message);
    setTimeout(() => setFeedback(null), 3000);
  };

  const emptySlots = Math.max(0, maxConsumables - consumables.length);

  return (
    <div className="flex flex-col items-end gap-1 select-none">
      <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400">
        <Sparkles className="w-3 h-3 text-cyan-400" />
        <span>Consumables ({consumables.length}/{maxConsumables})</span>
      </div>

      <div className="flex items-center gap-2">
        <AnimatePresence mode="popLayout">
          {consumables.map((item) => {
            const isTarot = item.type === "tarot";

            return (
              <TooltipProvider key={item.id} delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      layout
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      whileHover={{ y: -3 }}
                      className={`relative w-20 h-28 sm:w-22 sm:h-30 rounded-lg border-2 ${
                        isTarot
                          ? "border-purple-500/80 bg-gradient-to-b from-purple-950/80 via-slate-950 to-purple-950/40 shadow-lg shadow-purple-900/20"
                          : "border-cyan-500/80 bg-gradient-to-b from-cyan-950/80 via-slate-950 to-cyan-950/40 shadow-lg shadow-cyan-900/20"
                      } p-1.5 flex flex-col justify-between overflow-hidden cursor-pointer`}
                    >
                      {/* Card Type Tag */}
                      <div className="flex items-center justify-between w-full">
                        <span
                          className={`text-[8px] font-black uppercase ${
                            isTarot ? "text-purple-300" : "text-cyan-300"
                          }`}
                        >
                          {item.type}
                        </span>
                        <span className="text-[8px] font-mono text-slate-400">
                          ${item.sellValue}
                        </span>
                      </div>

                      {/* Card Title */}
                      <div className="text-center my-auto px-0.5">
                        <h5
                          className={`text-[10px] sm:text-[11px] font-black uppercase leading-tight ${
                            isTarot ? "text-purple-200" : "text-cyan-200"
                          }`}
                        >
                          {item.name}
                        </h5>
                        {item.targetHand && (
                          <Badge
                            variant="outline"
                            className="text-[7px] py-0 px-1 mt-1 border-cyan-500/40 text-cyan-300"
                          >
                            {item.targetHand}
                          </Badge>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 w-full pt-1 border-t border-slate-800">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUse(item);
                          }}
                          className="h-5 flex-1 px-1 py-0 text-[9px] font-black bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40"
                        >
                          <Zap className="w-2.5 h-2.5 mr-0.5" /> USE
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            sellConsumable(item.id);
                          }}
                          className="h-5 px-1 py-0 text-[8px] font-bold text-amber-400 hover:bg-amber-950/50"
                          title="Sell consumable"
                        >
                          <DollarSign className="w-2.5 h-2.5" />
                        </Button>
                      </div>
                    </motion.div>
                  </TooltipTrigger>

                  <TooltipContent
                    side="bottom"
                    className="max-w-xs bg-slate-950 border-slate-700 text-slate-200 p-2.5 text-xs shadow-xl space-y-1"
                  >
                    <div className="flex items-center justify-between font-black uppercase text-amber-400">
                      <span>{item.name}</span>
                      <span className="text-[10px] text-slate-400">[{item.type}]</span>
                    </div>
                    <p className="text-slate-300 leading-tight">
                      {item.description}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </AnimatePresence>

        {/* Empty Slots */}
        {Array.from({ length: emptySlots }).map((_, idx) => (
          <div
            key={`empty-cons-${idx}`}
            className="w-20 h-28 sm:w-22 sm:h-30 rounded-lg border-2 border-dashed border-slate-800/80 bg-slate-900/10 flex flex-col items-center justify-center text-slate-700"
          >
            <Plus className="w-4 h-4 text-slate-700 mb-0.5" />
            <span className="text-[8px] uppercase tracking-widest font-bold">
              Slot
            </span>
          </div>
        ))}
      </div>

      {/* Action Toast Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-[10px] font-bold text-amber-300 bg-slate-900 px-2 py-0.5 rounded border border-amber-500/40"
          >
            {feedback}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
