"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  loadCareerStats,
  resetCareerStats,
} from "../services/persistence.service";
import { CareerStats } from "../schemas/run.schema";
import { formatNumber } from "@/lib/utils";
import { Trophy, Flame, Sparkles, RotateCcw, Award } from "lucide-react";

interface CareerStatsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CareerStatsDialog({ open, onOpenChange }: CareerStatsDialogProps) {
  const [stats, setStats] = useState<CareerStats | null>(null);

  useEffect(() => {
    if (open) {
      setStats(loadCareerStats());
    }
  }, [open]);

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all lifetime statistics? This cannot be undone.")) {
      resetCareerStats();
      setStats(loadCareerStats());
    }
  };

  if (!stats) return null;

  const winRate =
    stats.runsPlayed > 0
      ? Math.round((stats.runsWon / stats.runsPlayed) * 100)
      : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-slate-950 border-2 border-slate-800 text-slate-200 select-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-amber-400 flex items-center gap-2 uppercase tracking-wide">
            <Trophy className="w-5 h-5 text-amber-400" /> Career Statistics
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Lifetime records tracked across all your Mini-Balatro runs.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Top Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Runs Played
              </span>
              <span className="text-2xl font-black text-slate-100 font-mono">
                {stats.runsPlayed}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">
                Runs Won
              </span>
              <span className="text-2xl font-black text-emerald-400 font-mono">
                {stats.runsWon}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">
                Win Rate
              </span>
              <span className="text-2xl font-black text-amber-400 font-mono">
                {winRate}%
              </span>
            </div>
          </div>

          {/* Records Breakdown */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-purple-400" /> Highest Ante Reached:
              </span>
              <Badge variant="outline" className="font-mono text-purple-300 border-purple-500/40">
                Ante {stats.highestAnte} / 8
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Highest Single Hand:
              </span>
              <span className="font-mono font-black text-amber-400 text-sm">
                {formatNumber(stats.highestScoreEver)}
              </span>
            </div>

            {stats.bestHandEver && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-blue-400" /> Record Poker Hand:
                </span>
                <span className="font-bold text-blue-300">
                  {stats.bestHandEver.handType} ({formatNumber(stats.bestHandEver.score)} pts)
                </span>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-[11px] text-slate-500 hover:text-red-400 h-8 px-2"
            >
              <RotateCcw className="w-3 h-3 mr-1" /> Reset Career Data
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs h-8 px-4 border-slate-700 bg-slate-900 text-slate-200"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
