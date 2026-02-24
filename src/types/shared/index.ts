/**
 * codeVibeCheck — Type Barrel Export
 *
 * Re-exports all shared types from a single entry point.
 * Usage: import { User, ApiResponse, LoginCredentials } from '@/types/shared';
 */

export type {
  User,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
} from "./user.types";

export type { ApiResponse, PaginatedResponse, ApiError } from "./api.types";
