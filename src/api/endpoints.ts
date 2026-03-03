type Id = string | number;

export const ENDPOINTS = {
  // ── Auth ───────────────────────────────────────────────────────────────────
  AUTH: {
    LOGIN: "/api/auth/login", // POST — LoginCredentials → AuthResponse
    REGISTER: "/api/auth/register", // POST — RegisterCredentials → AuthResponse
    ME: "/api/auth/me", // GET  — → User (requires token)
    LOGOUT: "/api/auth/logout", // POST — → { success: true }
  },
  TOPICS: {
    GET_ALL: "/api/topics", // GET -> ITopic[]
    GET_BY_ID: (id: Id) => `/api/topics/${id}`, // GET -> ITopic
    GET_WIDGETS: (id: Id) => `/api/topics/${id}/widgets`, // GET -> Widget[]
  },
  WIDGETS: {
    GET_BY_ID: (id: Id) => `/api/widgets/${id}`, // GET -> Widget
    SUBMIT_ANSWER: (id: Id) => `/api/widgets/${id}/submit`, // POST - WidgetAnswer -> IVerdict
  },
};
