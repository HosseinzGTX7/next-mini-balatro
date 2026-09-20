/**
 * Procedural Seed Utilities for Mini-Balatro.
 * Generates and validates readable Balatro-style alphanumeric seeds.
 */

// Avoid ambiguous characters like 0, O, 1, I
const SEED_CHARSET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

/**
 * Generates an 8-character uppercase procedural seed.
 */
export function generateBalatroSeed(): string {
  let result = "";
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * SEED_CHARSET.length);
    result += SEED_CHARSET[randomIndex];
  }
  return result;
}

/**
 * Normalizes user-input seed string into uppercase valid seed format.
 */
export function formatSeed(input: string): string {
  const cleaned = input
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 10);
  return cleaned || generateBalatroSeed();
}
