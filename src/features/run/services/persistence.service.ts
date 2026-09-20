import {
  SavedRunState,
  SavedRunStateSchema,
  CareerStats,
  CareerStatsSchema,
  RunStats,
} from "../schemas/run.schema";

const RUN_STORAGE_KEY = "mini_balatro_active_run";
const CAREER_STORAGE_KEY = "mini_balatro_career_stats";

const DEFAULT_CAREER_STATS: CareerStats = {
  runsPlayed: 0,
  runsWon: 0,
  highestAnte: 1,
  highestScoreEver: 0,
  bestHandEver: null,
  mostPlayedHand: null,
  handTypeCounts: {},
};

/**
 * Checks if browser LocalStorage is accessible.
 */
function isStorageAvailable(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

/**
 * Saves current active run state to LocalStorage.
 */
export function saveCurrentRun(state: SavedRunState): void {
  if (!isStorageAvailable()) return;
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(RUN_STORAGE_KEY, serialized);
  } catch (err) {
    console.warn("Failed to persist active run state to LocalStorage:", err);
  }
}

/**
 * Loads and validates active run state from LocalStorage.
 * Returns null if no valid run exists.
 */
export function loadCurrentRun(): SavedRunState | null {
  if (!isStorageAvailable()) return null;
  try {
    const raw = localStorage.getItem(RUN_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const validated = SavedRunStateSchema.safeParse(parsed);
    if (validated.success) {
      return validated.data;
    } else {
      console.warn("Saved run corrupted or out of date:", validated.error);
      clearCurrentRun();
      return null;
    }
  } catch (err) {
    console.warn("Failed to parse saved run from LocalStorage:", err);
    return null;
  }
}

/**
 * Removes active run state from LocalStorage.
 */
export function clearCurrentRun(): void {
  if (!isStorageAvailable()) return;
  try {
    localStorage.removeItem(RUN_STORAGE_KEY);
  } catch (err) {
    console.warn("Failed to clear saved run:", err);
  }
}

/**
 * Loads lifetime Career statistics.
 */
export function loadCareerStats(): CareerStats {
  if (!isStorageAvailable()) return DEFAULT_CAREER_STATS;
  try {
    const raw = localStorage.getItem(CAREER_STORAGE_KEY);
    if (!raw) return DEFAULT_CAREER_STATS;

    const parsed = JSON.parse(raw);
    const validated = CareerStatsSchema.safeParse(parsed);
    return validated.success ? validated.data : DEFAULT_CAREER_STATS;
  } catch (err) {
    console.warn("Failed to load career stats:", err);
    return DEFAULT_CAREER_STATS;
  }
}

/**
 * Saves lifetime Career statistics.
 */
export function saveCareerStats(stats: CareerStats): void {
  if (!isStorageAvailable()) return;
  try {
    localStorage.setItem(CAREER_STORAGE_KEY, JSON.stringify(stats));
  } catch (err) {
    console.warn("Failed to save career stats:", err);
  }
}

/**
 * Updates career statistics when a run ends (victory or defeat).
 */
export function recordRunCompletion(
  won: boolean,
  stats: RunStats,
  ante: number
): CareerStats {
  const current = loadCareerStats();

  let highestScore = current.highestScoreEver;
  let bestHand = current.bestHandEver;

  if (stats.highestHandScore > highestScore) {
    highestScore = stats.highestHandScore;
    if (stats.bestHandType) {
      bestHand = {
        handType: stats.bestHandType,
        score: stats.highestHandScore,
      };
    }
  }

  const updated: CareerStats = {
    runsPlayed: current.runsPlayed + 1,
    runsWon: won ? current.runsWon + 1 : current.runsWon,
    highestAnte: Math.max(current.highestAnte, ante),
    highestScoreEver: highestScore,
    bestHandEver: bestHand,
    mostPlayedHand: current.mostPlayedHand,
    handTypeCounts: current.handTypeCounts,
  };

  saveCareerStats(updated);
  clearCurrentRun();
  return updated;
}

/**
 * Resets all career statistics.
 */
export function resetCareerStats(): void {
  if (!isStorageAvailable()) return;
  try {
    localStorage.removeItem(CAREER_STORAGE_KEY);
  } catch (err) {
    console.warn("Failed to reset career stats:", err);
  }
}
