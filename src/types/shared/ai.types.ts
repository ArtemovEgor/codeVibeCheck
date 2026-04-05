/**
 * codeVibeCheck — AI Chat Types
 *
 * Data contracts for the AI interviewer chat and AI Judge features.
 * Messages are exchanged via POST /api/ai/chat (proxied to Gemini API).
 */

import type { ChatRole } from "@/constants/api-chat";
import type { Language } from "@/types/types";

// ── Chat ────────────────────────────────────────────────────────────────────

/** A message in the chat history stored in the backend */
export interface IChatMessage {
  readonly id: string;
  readonly role: ChatRole;
  readonly content: string;
  readonly createdAt: string;
  /** Points received for the previous user message */
  readonly xpAwarded?: number;
}

/**  A message sent from the frontend */
export interface ISendMessagePayload {
  readonly content: string;
  readonly language?: Language;
}

/** AI evaluation of the user's interview */
export interface IAIJudgeResult {
  /** Overall score (0–100) */
  readonly score: number;
  /** Points the user covered correctly */
  readonly covered: string[];
  /** Points the user missed */
  readonly missed: string[];
  /** Text feedback from the AI */
  readonly feedback: string;
}
