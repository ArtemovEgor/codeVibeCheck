export const STORAGE_KEYS = {
  MOCK_CHAT_HISTORY_KEY: "mock-history",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
