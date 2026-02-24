/**
 * codeVibeCheck — API Utility Types
 *
 * Generic types for API communication.
 * Used by the API Service Layer (src/api/) for consistent
 * request/response shapes across all endpoints.
 */

// ── Responses ───────────────────────────────────────────────────────────────

/** Standard successful API response wrapper */
export interface ApiResponse<T> {
  readonly data: T;
  readonly success: true;
}

/** Paginated list response (e.g., GET /api/topics?page=2&limit=10) */
export interface PaginatedResponse<T> {
  readonly data: T[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
}

// ── Errors ──────────────────────────────────────────────────────────────────

/** Standard API error shape */
export interface ApiError {
  readonly success: false;
  readonly status: number;
  readonly message: string;
}
