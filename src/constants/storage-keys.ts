export const STORAGE_KEYS = {
  MOCK_CHAT_HISTORY_KEY: "mock-history",
  MOCK_PROGRESS: "mock-progress",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
