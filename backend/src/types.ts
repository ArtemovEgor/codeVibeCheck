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

/** Payload sent to POST /api/auth/register */
export interface IRegisterCredentials {
  readonly name: string;
  readonly email: string;
  readonly password: string;
}

/** Payload sent to POST /api/auth/login */
export interface ILoginCredentials {
  readonly email: string;
  readonly password: string;
}

/** Successful authentication response from the server */
export interface IAuthResponse {
  readonly user: IUser;
  /** JWT access token */
  readonly token: string;
}

/** Only for backend */
export interface IDatabaseUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatarUrl: string | null;
  createdAt: string;
}
