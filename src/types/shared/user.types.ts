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

// ── Progress ────────────────────────────────────────────────────────────────────

/** Progress of a user for a specific topic.
 * Returned by GET /api/progress/:topicId
 * isCompleted and isUnlocked are calculated by the server */
export interface IUserTopicProgress {
  topicId: string;
  completedWidgetIds: string[];
  xpEarned: number;
  isCompleted: boolean;
  isUnlocked: boolean;
}

/** Payload sent after the user submits a widget answer.
 * xpEarned is sourced from IVerdict.xpEarned */
export interface IUpdateProgressPayload {
  topicId: string;
  widgetId: string;
  xpEarned: number;
  totalWidgets: number;
}

/** Overall user statistics aggregated across all topics and sessions.
 * totalXp includes XP from repeat passes, unlike IUserTopicProgress.xpEarned */
export interface IUserStats {
  totalXp: number;
  completedTopics: number;
  streak: number;
}
