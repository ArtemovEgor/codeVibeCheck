/**
 * codeVibeCheck — AI Chat Types
 *
 * Data contracts for the AI interviewer chat and AI Judge features.
 * Messages are exchanged via POST /api/ai/chat (proxied to Gemini API).
 */

// ── Chat ────────────────────────────────────────────────────────────────────

/** Roles in the chat conversation */
export type ChatRole = "user" | "assistant" | "system";

/** A message in the chat history */
export interface ChatMessage {
  readonly id: string;
  readonly role: ChatRole;
  readonly content: string;
  readonly createdAt: string;
}

/** Response from POST /api/ai/chat */
export interface AIResponse {
  readonly message: ChatMessage;
  /** Was the response streamed (for UI rendering decisions) */
  readonly streamed: boolean;
}

/** AI evaluation of the user's interview */
export interface AIJudgeResult {
  /** Overall score (0–100) */
  readonly score: number;
  /** Points the user covered correctly */
  readonly covered: string[];
  /** Points the user missed */
  readonly missed: string[];
  /** Text feedback from the AI */
  readonly feedback: string;
}
