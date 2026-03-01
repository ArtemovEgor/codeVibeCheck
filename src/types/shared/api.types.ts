/**
 * codeVibeCheck — API Utility Types
 *
 * Generic types for API communication.
 * Used by the API Service Layer (src/api/) for consistent
 * request/response shapes across all endpoints.
 */

// ── Responses ───────────────────────────────────────────────────────────────

/** Standard successful API response wrapper */
export interface IApiResponse<T> {
  readonly data: T;
  readonly success: true;
}

// ── Errors ──────────────────────────────────────────────────────────────────

/** Standard API error shape */
export interface IApiError {
  readonly success: false;
  readonly status: number;
  readonly message: string;
}
