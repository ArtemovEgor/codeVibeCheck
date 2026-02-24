/**
 * codeVibeCheck — User & Auth Types
 *
 * Data contracts for user accounts and authentication flow.
 * Used by both frontend components and backend API responses.
 */

// ── User ────────────────────────────────────────────────────────────────────

/** Authenticated user profile returned by the API */
export interface IUser {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  /** Full URL to the user's avatar image, or undefined if not set */
  readonly avatarUrl: string | undefined;
  /** Timestamp of account creation */
  readonly createdAt: string;
}

// ── Auth ────────────────────────────────────────────────────────────────────

/** Credentials sent to POST /api/auth/login */
export interface ILoginCredentials {
  readonly email: string;
  readonly password: string;
}

/** Payload sent to POST /api/auth/register */
export interface IRegisterCredentials {
  readonly name: string;
  readonly email: string;
  readonly password: string;
}

/** Successful authentication response from the server */
export interface IAuthResponse {
  readonly user: IUser;
  /** JWT access token */
  readonly token: string;
}
