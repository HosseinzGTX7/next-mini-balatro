"use client";

import React, { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/useGameStore";
import { JokerCardView } from "./JokerCardView";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { JOKER_DEFINITIONS, createJoker } from "../data/joker-definitions";
import { CardEdition } from "@/features/poker/schemas/card.schema";
import { Flame, Plus, Sparkles, Wand2 } from "lucide-react";

export const JokerRack = memo(function JokerRack() {
  const jokers = useGameStore((state) => state.jokers);
  const maxJokers = useGameStore((state) => state.maxJokers);
  const addJoker = useGameStore((state) => state.addJoker);
  const addRandomJoker = useGameStore((state) => state.addRandomJoker);

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("greedy_joker");
  const [selectedEdition, setSelectedEdition] = useState<string>("none");
  const [dialogOpen, setDialogOpen] = useState(false);

  const emptySlotsCount = Math.max(0, maxJokers - jokers.length);

  const handleAddCustomJoker = () => {
    const edition =
      selectedEdition !== "none" ? (selectedEdition as CardEdition) : undefined;
    const newJoker = createJoker(selectedTemplateId, edition);
    addJoker(newJoker);
    setDialogOpen(false);
  };

  return (
    <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
      {/* Header Title & Testing Triggers */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-3">
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-300">
              Jokers
            </span>
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/40 border border-amber-500/30 px-1.5 py-0.2 rounded-md">
              {jokers.length}/{maxJokers}
            </span>
          </div>

          {/* Quick Joker Tools */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={jokers.length >= maxJokers}
              onClick={() => addRandomJoker()}
              className="h-7 px-2 text-[10px] font-bold border-amber-500/40 bg-amber-950/20 hover:bg-amber-900/40 text-amber-300"
              title="Add a random Joker"
            >
              <Wand2 className="w-3 h-3 mr-1 text-amber-400" /> Random
            </Button>

            {/* Test Synergy Picker Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={jokers.length >= maxJokers}
                  className="h-7 px-2 text-[10px] font-bold border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-300"
                  title="Choose any specific Joker to test synergies"
                >
                  <Plus className="w-3 h-3 mr-1" /> Add Specific
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-md bg-slate-950 border-slate-800 text-slate-200">
                <DialogHeader>
                  <DialogTitle className="text-lg font-black text-amber-400 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" /> Spawn Test Joker
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-400">
                    Select from 19 authentic Balatro Jokers and test real-time roguelike synergies.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">
                      Joker Type
                    </label>
                    <select
                      value={selectedTemplateId}
                      onChange={(e) => setSelectedTemplateId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    >
                      {Object.values(JOKER_DEFINITIONS).map((def) => (
                        <option
                          key={def.templateId}
                          value={def.templateId}
                          className="bg-slate-950 text-slate-200"
                        >
                          {def.name} ({def.rarity}) - {def.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">
                      Edition (Optional Foil / Holo / Poly)
                    </label>
                    <select
                      value={selectedEdition}
                      onChange={(e) => setSelectedEdition(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    >
                      <option value="none" className="bg-slate-950 text-slate-200">
                        Base Edition
                      </option>
                      <option value="foil" className="bg-slate-950 text-blue-400">
                        Foil (+50 Chips)
                      </option>
                      <option value="holographic" className="bg-slate-950 text-red-400">
                        Holographic (+10 Mult)
                      </option>
                      <option value="polychrome" className="bg-slate-950 text-purple-400">
                        Polychrome (1.5x Mult)
                      </option>
                    </select>
                  </div>

                  <Button
                    variant="balatroGold"
                    onClick={handleAddCustomJoker}
                    className="w-full font-black text-sm py-4"
                  >
                    EQUIP JOKER
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Joker Slots Rack */}
        <div className="flex items-center justify-center sm:justify-end gap-2 sm:gap-3 flex-wrap">
          <AnimatePresence mode="popLayout">
            {jokers.map((joker, idx) => (
              <JokerCardView
                key={joker.id}
                joker={joker}
                index={idx}
                totalJokers={jokers.length}
              />
            ))}
          </AnimatePresence>

          {/* Empty Slot Placeholders */}
          {Array.from({ length: emptySlotsCount }).map((_, idx) => (
            <motion.div
              key={`empty-slot-${idx}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-24 h-36 sm:w-28 sm:h-40 rounded-xl border-2 border-dashed border-slate-800/80 bg-slate-900/10 flex flex-col items-center justify-center p-2 text-center select-none"
            >
              <div className="w-8 h-8 rounded-full border border-dashed border-slate-800 flex items-center justify-center text-slate-700 mb-1">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                Slot #{jokers.length + idx + 1}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
  );
});
