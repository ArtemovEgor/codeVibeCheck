/**
 * codeVibeCheck — AI Chat Scoring System
 *
 * Normalizes scoring between AI Chat and Widgets.
 * All systems use 0-100 XP scale where:
 * - 0 XP: Incorrect/no answer
 * - 20-40 XP: Partial answer
 * - 60-80 XP: Good answer
 * - 100 XP: Perfect answer
 */

/** AI Interviewer score scale (0-5 from AI Judge JSON response) */
export const CHAT_SCORE_SCALE = {
  INCORRECT: 0,
  PARTIAL: 1,
  FAIR: 2,
  GOOD: 3,
  VERY_GOOD: 4,
  EXCELLENT: 5,
} as const;

/** Conversion factor: score (0-5) → XP (0-100) */
export const CHAT_SCORE_TO_XP_MULTIPLIER = 20; // score * 20 = XP

/**
 * Converts AI Chat score (0-5) to normalized XP (0-100)
 * @param score - Score from AI Judge (0-5)
 * @returns XP value (0-100)
 */
export function convertChatScoreToXP(score: number): number {
  return Math.min(score * CHAT_SCORE_TO_XP_MULTIPLIER, 100);
}

/**
 * Validates and normalizes an XP value
 * @param xp - Raw XP value
 * @returns Normalized XP (0-100)
 */
export function normalizeXP(xp: number): number {
  return Math.max(0, Math.min(xp, 100));
}
