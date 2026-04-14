import { ChatCompletionChunk } from "groq-sdk/resources/chat/completions";

export interface ISendMessagePayload {
  readonly content: string;
  readonly language?: string;
}

type ChatRole = "user" | "assistant" | "system";

export interface IChatMessage {
  readonly id: string;
  readonly role: ChatRole;
  readonly content: string;
  readonly createdAt: string;
  /** Points received for the previous user message */
  readonly xpAwarded?: number;
}

export interface IScoreData {
  score: 0 | 1 | 2 | 3 | 4 | 5;
  topic: string;
  comment: string;
  difficulty_adjustment: "increase" | "decrease" | "stay";
  next_phase: string;
}

export interface IFinalReportEvent {
  type: "final_report";
  content: string;
}

export type AppStreamChunk = ChatCompletionChunk | IFinalReportEvent;
