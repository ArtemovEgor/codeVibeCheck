export const ENDPOINTS = {
  // ── Auth ───────────────────────────────────────────────────────────────────
  AUTH: {
    LOGIN: "/api/auth/login", // POST — LoginCredentials → AuthResponse
    REGISTER: "/api/auth/register", // POST — RegisterCredentials → AuthResponse
    ME: "/api/auth/me", // GET  — → User (requires token)
    UPDATE_NAME: "/api/auth/name", // PATCH
    UPDATE_EMAIL: "/api/auth/email", // PATCH
  },
  PROFILE: {
    CHAT_STATS: "/api/profile/chat-stats", // GET → IUserChatStats (requires token)
  },
  AI: {
    CHAT: "/api/ai/chat", // POST — { content } → IAIResponse
    CHAT_HISTORY: "/api/ai/chat/", // GET — → IChatMessage[]
    CHAT_RESET: "/api/ai/chat", // DELETE — → void
  },
  TOPICS: {
    GET_ALL: "/api/topics", // GET -> ITopic[]
    GET_BY_ID: (id: string) => `/api/topics/${id}`, // GET -> ITopic
    GET_WIDGETS: (id: string) => `/api/topics/${id}/widgets`, // GET -> Widget[]
  },
  WIDGETS: {
    GET_ALL: "/api/widgets", // GET -> Widget[]
    GET_BY_ID: (id: string) => `/api/widgets/${id}`, // GET -> Widget
    SUBMIT_ANSWER: (id: string) => `/api/widgets/${id}/submit`, // POST - WidgetAnswer -> IVerdict
  },
  PROGRESS: {
    GET_ALL: "/api/progress",
    GET_BY_TOPIC: (topicId: string) => `/api/progress/${topicId}`,
    INIT_TOPIC: (topicId: string) => `/api/progress/${topicId}/init`, // POST
    UPDATE: "/api/progress",
    GET_STATS: "/api/progress/stats",
    RESET_TOPIC: (topicId: string) => `/api/progress/${topicId}/reset`,
  },
};
