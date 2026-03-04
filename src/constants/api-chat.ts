export const ChatRoles = {
  user: "user",
  assistant: "assistant",
  system: "system",
} as const;

export type ChatRole = (typeof ChatRoles)[keyof typeof ChatRoles];
