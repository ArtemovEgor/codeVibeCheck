export interface ISendMessagePayload {
  readonly content: string;
}

interface ChatRole {
  user: "user";
  assistant: "assistant";
  system: "system";
}

export interface IChatMessage {
  readonly id: string;
  readonly role: ChatRole;
  readonly content: string;
  readonly createdAt: string;
  /** Points received for the previous user message */
  readonly xpAwarded?: number;
}
