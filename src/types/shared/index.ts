/**
 * codeVibeCheck — Type Barrel Export
 *
 * Re-exports all shared types from a single entry point.
 * Usage: import { IUser, IApiResponse, ILoginCredentials } from '@/types/shared';
 */

export type {
  IUser,
  ILoginCredentials,
  IRegisterCredentials,
  IAuthResponse,
} from "./user.types";

export type { IApiResponse, IApiError } from "./api.types";
