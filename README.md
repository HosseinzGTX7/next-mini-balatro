# Mini-Balatro 🃏

> A high-polish, responsive **Poker-Roguelike** web game inspired by LocalThunk's *Balatro*, built from the ground up for a top-tier frontend engineering portfolio.

[![Next.js](https://img.shields.io/badge/Next.js-15.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict_Mode-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Zustand](https://img.shields.io/badge/Zustand-Slice_Store-orange?style=flat-square)](https://github.com/pmndrs/zustand)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4.3-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Zod](https://img.shields.io/badge/Zod-Validated_Schemas-3E67B1?style=flat-square&logo=zod)](https://zod.dev/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

---

## 🌟 Architectural & Gameplay Highlights

### 1. Pure Functional Card & Scoring Engine
- **Single Source of Truth:** Every card, rank, suit, enhancement, edition, and seal is modeled with **Zod** schemas and inferred TypeScript types.
- **Pure Algorithmic Hand Evaluator:** Evaluates all standard and rogue poker hands (High Card through Royal Flush, plus Five of a Kind, Flush House, and Flush Five).
- **Sequential Scoring Pipeline:** `Total Score = (Base Chips + Card Chips) × (Base Mult + Card Mults) × (Joker Multipliers)`.

### 2. 19 Classic Jokers & Dynamic Roguelike Synergy Engine
- Diverse rarity distribution (**Common, Uncommon, Rare, Legendary**) and edition stamps (**Foil +50 Chips, Holographic +10 Mult, Polychrome 1.5x Mult**).
- Dynamic left-to-right evaluation order with drag-and-drop / shift reordering.
- Trigger evaluation hooks for `onHandPlayed`, `onCardScored`, `onDiscard`, and `roundEnd` (including Blueprint copy synergies, Ice Cream decay, Gros Michel extinction chance, and Baron / Shoot the Moon held-in-hand bonuses).

### 3. Ante 1–8 Scaling & 13 Boss Blinds
- Mathematical exponential target curves mirroring authentic Balatro pacing.
- **13 Game-Altering Boss Blinds:**
  - *The Club, The Goad, The Window, The Head* (suit debuffs)
  - *The Needle* (1 hand limit)
  - *The Wall* (4x target score)
  - *The Arm* (degrades played hand level)
  - *The Eye* (no repeat hand types)
  - *The Mouth* (only 1 hand type allowed)
  - *The Fish* (drawn face-down cards)
  - *The Water* (0 starting discards)
  - *The Manacle* (-1 hand size)
  - *The Pillar* (cards played previously this Ante debuffed)
- **8 Skip Tags:** Economy Tag (doubles cash), Foil/Holo/Poly Tags, Rare Tag, D6 Tag, Speed Tag, and Handy Tag.

### 4. The Shop, Reroll Economy & Consumables
- **10 Tarot Cards:** *The Magician, The Empress, The Hierophant, The Lovers, The Chariot, Justice, The Hermit, The Wheel of Fortune, Death, The Hanged Man*.
- **9 Planet Cards:** Level up each poker hand with persistent chips and mult bonuses.
- **4 Booster Packs:** *Standard Pack* (Enhanced playing cards), *Celestial Pack* (Planets), *Arcana Pack* (Tarots), *Buffoon Pack* (Jokers).
- Authentic Balatro Interest: `$1 per $5 held, capped at $5 per round`. Rerolls scale at `$5 + $1 per reroll`.

### 5. Run Management, Persistence & Seeded Runs
- **Active Run Persistence:** Automatically saves ongoing runs to `localStorage`. Refresh or leave anytime and resume with **"CONTINUE RUN"**.
- **Lifetime Career Stats:** Tracks lifetime runs played, wins, win rate, highest ante reached, all-time record hand, and single-hand high score.
- **Seed System:** 8-character uppercase procedural seeds (e.g. `K7R2W9P4`) with randomizer, custom seed input, and **"TRY AGAIN (SAME SEED)"** for identical deck/boss RNG.
- **Victory & Defeat Screens:** Floating gold confetti, comprehensive stat recaps, and equipped Jokers showcase.

### 6. Retro Juice & Zero-Asset Web Audio Synthesizer
- **Procedural Web Audio API:** Completely zero-asset retro 8-bit / 16-bit sound synthesizer (card dealing, clicks, multiplier chimes, cash registers, screen shakes, win fanfare).
- **60fps Balatro Background:** Procedural HTML5 canvas rendering the hypnotic swirling vortex background with custom CRT scanline overlay.
- **3D Perspective Tilt:** Cards tilt realistically following cursor movement with Framer Motion spring physics.

---

## 🛠️ Tech Stack & Architecture Standards

| Layer | Technology | Rationale |
|---|---|---|
| **Framework** | Next.js 15 (App Router) | Static site generation, server/client separation |
| **Language** | TypeScript (Strict Mode) | Zero `any`, strict null checks, full type safety |
| **State Management** | Zustand (v5) | Modular slice architecture (`gameSlice`, `scoreSlice`, `jokerSlice`, `shopSlice`) |
| **UI Primitives** | shadcn/ui & Radix UI | Accessible headless dialogs, badges, tooltips, buttons |
| **Styling** | Tailwind CSS (v4) | CSS-first architecture, @theme design tokens, CRT effects, poker felt |
| **Validation** | Zod (v3) | Runtime schema validation and static inferred types |
| **Animations** | Framer Motion (v12) | GPU-accelerated spring animations, 3D card tilt |
| **Audio** | Web Audio API | Zero external audio asset overhead, procedural retro synthesis |

---

## 📁 Project Architecture & Directory Layout

```
src/
├── app/
│   ├── globals.css           # Balatro tokens, CRT scanlines, felt pattern
│   ├── layout.tsx            # Metadata, viewport, dark theme wrapper
│   └── page.tsx              # Home entry point mounting GameShell
├── components/
│   ├── game/
│   │   ├── BalatroBackground.tsx   # 60fps canvas psychedelic swirling vortex
│   │   ├── GameShell.tsx           # Master layout orchestrating racks and tables
│   │   └── TableBoard.tsx          # Central felt play surface and staged cards
│   └── ui/                         # shadcn/ui styled primitives (button, dialog, etc.)
├── features/
│   ├── blinds/                     # Boss Blinds, Skip Tags, Blind Selection View
│   ├── jokers/                     # 19 Jokers catalog, synergy engine, JokerRack
│   ├── poker/                      # 3D CardView, HandView, deck services
│   ├── run/                        # LocalStorage persistence, seeds, Victory/Game Over
│   ├── scoring/                    # Hand evaluator, scoring pipeline, animation overlay
│   └── shop/                       # The Shop, ConsumablesRack, BoosterPackModal
├── lib/
│   ├── constants.ts                # Poker hand definitions, Ante target curves
│   ├── sound.ts                    # Procedural Web Audio API sound synthesizer
│   └── useScreenShake.ts           # Framer Motion reactive screen shake hook
├── store/
│   ├── slices/
│   │   ├── gameSlice.ts            # Core game progression, blinds, persistence
│   │   ├── jokerSlice.ts           # Joker rack management and synergies
│   │   ├── scoreSlice.ts           # Score preview, hand levels, scoring step animation
│   │   └── shopSlice.ts            # Consumables, inventory buying, booster packs
│   └── useGameStore.ts             # Combined store with granular selectors
└── types/
    └── index.ts                    # Unified type exports
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.18+ or Node.js 20+
- npm or pnpm

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/HosseinzGTX7/next-mini-balatro.git
   cd next-mini-balatro
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Typecheck & Production Build:**
   ```bash
   npx tsc --noEmit
   npm run build
   npm run start
   ```

---

## 🎮 How to Play

1. **The Objective:** Conquer all 8 Antes by defeating Small, Big, and Boss Blinds before running out of Hands.
2. **Scoring Formula:** Stage up to 5 cards from your hand. Your score equals:
   $$\text{Score} = (\text{Base Chips} + \text{Card Chips}) \times (\text{Base Mult} + \text{Card Mults})$$
3. **Equip Jokers:** Equip up to 5 Jokers that multiply your scoring exponentially. Reorder them to optimize trigger sequences!
4. **Visit the Shop:** Spend earned cash to buy Tarot cards to permanently enhance cards (Glass, Steel, Bonus, Mult, Wild), Planet cards to level up poker hands, and Booster Packs.
5. **Manage the Economy:** Earn $1 in interest for every $5 held in your bankroll (up to $5 per round).

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
Balatro is the original intellectual property of [LocalThunk](https://twitter.com/LocalThunk).
