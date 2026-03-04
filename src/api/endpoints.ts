export const ENDPOINTS = {
  // ── Auth ───────────────────────────────────────────────────────────────────
  AUTH: {
    LOGIN: "/api/auth/login", // POST — LoginCredentials → AuthResponse
    REGISTER: "/api/auth/register", // POST — RegisterCredentials → AuthResponse
    ME: "/api/auth/me", // GET  — → User (requires token)
    LOGOUT: "/api/auth/logout", // POST — → { success: true }
  },
  AI: {
    CHAT: "/api/ai/chat", // POST — { content } → IAIResponse
    CHAT_HISTORY: "/api/ai/chat/", // GET — → IChatMessage[]
    CHAT_RESET: "/api/ai/chat", // DELETE — → void
  },
};
