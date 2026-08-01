"use client";

import React, { memo, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { PlayingCard } from "@/types";
import {
  getCardEffectiveChipValue,
  getCardModifierDescriptions,
} from "../services/card-factory.service";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CardViewProps {
  card: PlayingCard;
  isSelected?: boolean;
  isScoringTarget?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

/**
 * High-performance 3D perspective Balatro playing card component.
 * Features realistic 3D cursor tilt, holographic/foil/polychrome shader overlays,
 * enhancement stamps, wax seals, and hover tooltips.
 */
export const CardView = memo(function CardView({
  card,
  isSelected = false,
  isScoringTarget = false,
  onClick,
  disabled = false,
  size = "md",
}: CardViewProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // 3D Tilt Motion Values
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 350, damping: 25 });
  const mouseYSpring = useSpring(y, { stiffness: 350, damping: 25 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["14deg", "-14deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-14deg", "14deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || disabled) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const isRedSuit = card.suit === "hearts" || card.suit === "diamonds";
  const effectiveChips = getCardEffectiveChipValue(card);
  const descriptions = getCardModifierDescriptions(card);

  // Size dimensions
  const sizeClasses = {
    sm: "w-14 h-20 text-xs",
    md: "w-18 sm:w-20 h-26 sm:h-30 text-sm",
    lg: "w-24 h-36 text-base",
  }[size];

  // Suit symbols
  const renderSuitIcon = (className = "w-4 h-4") => {
    switch (card.suit) {
      case "hearts":
        return <span className={`text-red-600 ${className}`}>♥</span>;
      case "diamonds":
        return <span className={`text-red-500 ${className}`}>♦</span>;
      case "clubs":
        return <span className={`text-slate-900 ${className}`}>♣</span>;
      case "spades":
        return <span className={`text-slate-900 ${className}`}>♠</span>;
    }
  };

  // Card Background based on Enhancements
  const getCardBg = () => {
    if (card.enhancement === "stone") {
      return "bg-gradient-to-br from-stone-400 via-stone-500 to-stone-600 text-stone-900 border-stone-600";
    }
    if (card.enhancement === "gold") {
      return "bg-gradient-to-br from-amber-100 via-yellow-200 to-amber-300 border-amber-400";
    }
    if (card.enhancement === "steel") {
      return "bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 border-slate-500";
    }
    if (card.enhancement === "glass") {
      return "bg-gradient-to-br from-cyan-50/90 via-sky-100/80 to-blue-200/70 border-sky-300 backdrop-blur-sm";
    }
    return "bg-[#f7f4ea] border-[#242b33]";
  };

  return (
    <TooltipProvider delayDuration={250}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="perspective-[800px] inline-block touch-none"
          >
            <motion.div
              onClick={!disabled ? onClick : undefined}
              whileHover={
                !disabled
                  ? {
                      y: isSelected ? -24 : -10,
                      scale: 1.04,
                      transition: { duration: 0.15 },
                    }
                  : {}
              }
              whileTap={!disabled ? { scale: 0.95 } : {}}
              animate={{
                y: isSelected ? -20 : 0,
                boxShadow: isSelected
                  ? "0 0 20px rgba(56, 189, 248, 0.7), 0 10px 15px -3px rgba(0, 0, 0, 0.4)"
                  : isScoringTarget
                  ? "0 0 15px rgba(254, 95, 85, 0.6)"
                  : "0 4px 6px -1px rgba(0, 0, 0, 0.3)",
              }}
              style={{
                rotateX: isSelected ? "0deg" : rotateX,
                rotateY: isSelected ? "0deg" : rotateY,
                transformStyle: "preserve-3d",
              }}
              className={`relative rounded-xl border-2 cursor-pointer select-none flex flex-col justify-between p-2 font-sans transition-colors overflow-hidden ${sizeClasses} ${getCardBg()} ${
                card.isDebuffed ? "opacity-50 grayscale" : ""
              } ${
                isSelected
                  ? "border-sky-400 ring-2 ring-sky-300"
                  : isScoringTarget
                  ? "border-[#fe5f55]"
                  : ""
              }`}
            >
              {/* Shimmer Shader Overlays for Special Editions */}
              {card.edition === "foil" && (
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-cyan-300/30 to-blue-400/20 pointer-events-none animate-pulse" />
              )}
              {card.edition === "holographic" && (
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-green-500/20 to-blue-500/20 mix-blend-color-dodge pointer-events-none" />
              )}
              {card.edition === "polychrome" && (
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/30 via-amber-400/30 to-indigo-500/30 pointer-events-none" />
              )}

              {/* Wax Seal Stamp (Top Right) */}
              {card.seal !== "none" && (
                <div
                  className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black text-white shadow-md z-20 uppercase border border-white/60 ${
                    card.seal === "gold"
                      ? "bg-amber-500"
                      : card.seal === "red"
                      ? "bg-red-600"
                      : card.seal === "blue"
                      ? "bg-blue-600"
                      : "bg-purple-600"
                  }`}
                  title={`${card.seal} seal`}
                >
                  {card.seal[0]}
                </div>
              )}

              {/* Edition Ribbon (Top Left) */}
              {card.edition !== "base" && (
                <div className="absolute -top-1 -left-1 px-1.5 py-0.2 rounded-br text-[7px] font-black text-white bg-purple-700 uppercase shadow z-20">
                  {card.edition}
                </div>
              )}

              {/* Card Corner: Rank & Suit */}
              <div className="flex items-start justify-between w-full z-10">
                <div className="flex flex-col items-center leading-tight">
                  <span
                    className={`font-black tracking-tighter ${
                      isRedSuit ? "text-red-600" : "text-slate-950"
                    }`}
                  >
                    {card.enhancement === "stone" ? "50" : card.rank}
                  </span>
                  {card.enhancement !== "stone" && (
                    <span className="text-xs leading-none">
                      {renderSuitIcon()}
                    </span>
                  )}
                </div>

                {/* Enhancement Stamp Badge */}
                {card.enhancement !== "none" && card.enhancement !== "stone" && (
                  <div
                    className={`text-[8px] font-black uppercase px-1 py-0.5 rounded shadow-xs ${
                      card.enhancement === "bonus"
                        ? "bg-blue-600 text-white"
                        : card.enhancement === "mult"
                        ? "bg-red-600 text-white"
                        : card.enhancement === "wild"
                        ? "bg-gradient-to-r from-red-500 via-amber-400 to-blue-500 text-white"
                        : card.enhancement === "glass"
                        ? "bg-cyan-700 text-white"
                        : card.enhancement === "steel"
                        ? "bg-slate-700 text-white"
                        : "bg-amber-600 text-slate-950"
                    }`}
                  >
                    {card.enhancement}
                  </div>
                )}
              </div>

              {/* Center Suit / Big Artwork */}
              <div className="flex flex-col items-center justify-center my-auto z-10">
                {card.enhancement === "stone" ? (
                  <span className="text-xl sm:text-2xl font-black text-stone-800 tracking-wider">
                    STONE
                  </span>
                ) : (
                  <span
                    className={`text-3xl sm:text-4xl font-black leading-none drop-shadow-xs ${
                      isRedSuit ? "text-red-600" : "text-slate-950"
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
                )}
              </div>

              {/* Card Footer: Chip Value & Inverted Rank */}
              <div className="flex items-center justify-between w-full text-[10px] font-mono z-10">
                <span className="font-extrabold text-blue-700">
                  +{effectiveChips}
                </span>
                <span className="text-slate-500 uppercase text-[9px]">
                  {card.enhancement === "stone" ? "CHIPS" : card.suit.slice(0, 3)}
                </span>
              </div>
            </motion.div>
          </div>
        </TooltipTrigger>

        {/* Informative Modifier Tooltip */}
        {descriptions.length > 0 && (
          <TooltipContent
            side="top"
            className="bg-slate-900 border border-slate-700 text-slate-100 p-2 max-w-xs shadow-xl"
          >
            <div className="text-xs font-bold text-amber-400 mb-1">
              {card.rank} of {card.suit.toUpperCase()}
            </div>
            <ul className="text-[11px] space-y-0.5 list-disc pl-3 text-slate-300">
              {descriptions.map((desc, i) => (
                <li key={i}>{desc}</li>
              ))}
            </ul>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
});
