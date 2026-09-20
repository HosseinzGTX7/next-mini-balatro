"use client";

import React, { memo } from "react";
import { useGameStore } from "@/store/useGameStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BoosterPackModal } from "./BoosterPackModal";
import { soundEngine } from "@/lib/sound";
import {
  ShoppingBag,
  Coins,
  RefreshCw,
  ArrowRight,
  PackageOpen,
  Sparkles,
} from "lucide-react";

export const ShopView = memo(function ShopView() {
  const ante = useGameStore((state) => state.ante);
  const money = useGameStore((state) => state.money);
  const shopItems = useGameStore((state) => state.shopItems);
  const shopPacks = useGameStore((state) => state.shopPacks);
  const rerollCost = useGameStore((state) => state.rerollCost);
  const buyShopItem = useGameStore((state) => state.buyShopItem);
  const buyBoosterPack = useGameStore((state) => state.buyBoosterPack);
  const rerollShop = useGameStore((state) => state.rerollShop);
  const advanceToNextBlind = useGameStore((state) => state.advanceToNextBlind);

  const handleNextRound = () => {
    soundEngine.playCardDeal();
    advanceToNextBlind();
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-4 sm:p-6 max-w-6xl mx-auto w-full select-none gap-4">
      {/* Top Shop Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-red-950/60 border border-red-500/40 text-red-400">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-amber-400 uppercase tracking-wide">
              The Shop
            </h2>
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              Ante {ante} / 8 &bull; Restock & Upgrade
            </span>
          </div>
        </div>

        {/* Bankroll & Action Buttons */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-400 font-mono font-black text-base">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>${money}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={money < rerollCost}
            onClick={() => rerollShop()}
            className="h-9 px-3 border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold"
            title={`Reroll shop inventory for $${rerollCost}`}
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1 text-amber-400" /> Reroll (${rerollCost})
          </Button>

          <Button
            variant="balatroBlue"
            size="sm"
            onClick={handleNextRound}
            className="h-9 px-4 font-black text-xs"
          >
            NEXT BLIND <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </div>

      {/* Center Market Goods */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 my-auto">
        {/* Section 1: CARDS FOR SALE */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Cards For Sale
            </span>
          </div>

          <div className="flex items-center justify-around gap-3 flex-wrap my-auto">
            {shopItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col items-center gap-2"
              >
                {item.type === "joker" && item.joker && (
                  <div
                    className={`w-28 h-40 rounded-xl border-2 ${
                      item.isBought
                        ? "border-slate-800 bg-slate-950/40 opacity-40"
                        : "border-amber-500/80 bg-gradient-to-b from-amber-950/50 to-slate-950"
                    } p-2 flex flex-col justify-between text-center relative overflow-hidden shadow-lg`}
                  >
                    <span className="text-[8px] font-black uppercase text-amber-400">
                      {item.joker.rarity}
                    </span>
                    <h5 className="text-xs font-black text-amber-300 uppercase leading-tight">
                      {item.joker.name}
                    </h5>
                    <p className="text-[9px] text-slate-400 line-clamp-3">
                      {item.joker.description}
                    </p>
                    {item.joker.edition && (
                      <Badge
                        variant="outline"
                        className="text-[7px] py-0 px-1 border-white/30 text-white uppercase mx-auto"
                      >
                        {item.joker.edition}
                      </Badge>
                    )}
                  </div>
                )}

                {item.type === "consumable" && item.consumable && (
                  <div
                    className={`w-28 h-40 rounded-xl border-2 ${
                      item.isBought
                        ? "border-slate-800 bg-slate-950/40 opacity-40"
                        : "border-purple-500/80 bg-gradient-to-b from-purple-950/50 to-slate-950"
                    } p-2 flex flex-col justify-between text-center relative overflow-hidden shadow-lg`}
                  >
                    <span className="text-[8px] font-black uppercase text-purple-300">
                      {item.consumable.type}
                    </span>
                    <h5 className="text-xs font-black text-purple-200 uppercase leading-tight">
                      {item.consumable.name}
                    </h5>
                    <p className="text-[9px] text-slate-400 line-clamp-3">
                      {item.consumable.description}
                    </p>
                    {item.consumable.targetHand && (
                      <Badge
                        variant="outline"
                        className="text-[7px] py-0 px-1 border-cyan-500/30 text-cyan-300 uppercase mx-auto"
                      >
                        {item.consumable.targetHand}
                      </Badge>
                    )}
                  </div>
                )}

                <Button
                  variant="balatroGold"
                  size="sm"
                  disabled={item.isBought || money < item.cost}
                  onClick={() => buyShopItem(item.id)}
                  className="w-full text-xs font-black py-2"
                >
                  {item.isBought ? "BOUGHT" : `BUY $${item.cost}`}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: BOOSTER PACKS */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <PackageOpen className="w-3.5 h-3.5 text-blue-400" /> Booster Packs
            </span>
          </div>

          <div className="flex items-center justify-around gap-3 flex-wrap my-auto">
            {shopPacks.map((pack) => (
              <div
                key={pack.id}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-32 h-40 rounded-xl border-2 border-blue-500/80 bg-gradient-to-b from-blue-950/60 to-slate-950 p-2.5 flex flex-col justify-between text-center relative overflow-hidden shadow-lg">
                  <div className="p-2 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/40 mx-auto">
                    <PackageOpen className="w-5 h-5" />
                  </div>
                  <h5 className="text-xs font-black text-blue-300 uppercase leading-tight">
                    {pack.name}
                  </h5>
                  <p className="text-[9px] text-slate-400 line-clamp-2 leading-tight">
                    {pack.description}
                  </p>
                </div>

                <Button
                  variant="balatroBlue"
                  size="sm"
                  disabled={money < pack.cost}
                  onClick={() => buyBoosterPack(pack.id)}
                  className="w-full text-xs font-black py-2"
                >
                  OPEN ${pack.cost}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booster Pack Cracking Modal Overlay */}
      <BoosterPackModal />
    </div>
  );
});
