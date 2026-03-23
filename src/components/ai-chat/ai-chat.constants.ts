export const RESTART_TIMEOUT_MS = 3000;

/**
 * XP thresholds for UI feedback
 * Uses normalized 0-100 XP scale where:
 * - 0 XP: No reward
 * - 1-40 XP: Warning (orange) — partial/incorrect
 * - 60+ XP: Success (green) — good/excellent
 */
export const XP_THRESHOLDS = {
  success: 60, // 60 XP = Good answer (score 3)
  warning: 40, // 40 XP = Fair answer (score 2)
} as const;
