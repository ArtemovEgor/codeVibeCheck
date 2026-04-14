import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dataBase from "./database";
import {
  IRegisterCredentials,
  IAuthResponse,
  ILoginCredentials,
  IDatabaseUser,
  IUser,
} from "./types";
import { EN } from "./locale/en";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key-change-in-prod";
const SALT_ROUNDS = 10;
const TOKEN_EXPIRED = "1h";
const LANG = EN;

/**
 * Registers a new user
 *
 * @param data - Data from the client (email, password, name)
 * @returns - Object with user and token
 * @throws Error - If the email is busy or the data is invalid
 */
export function registerUser(data: IRegisterCredentials): IAuthResponse {
  const { name, email, password } = data;

  if (password.length < 6) {
    throw new Error(LANG.errors.password_length);
  }

  if (!email || !email.includes("@")) {
    throw new Error(LANG.errors.mail_error);
  }

  const findStmt = dataBase.prepare("SELECT id FROM users WHERE email = ?");
  const existingUser = findStmt.get(email) as { id: string } | undefined;

  if (existingUser) {
    throw new Error(LANG.errors.user_already_exist);
  }

  const salt = bcrypt.genSaltSync(SALT_ROUNDS);
  const passwordHash = bcrypt.hashSync(password, salt);
  const id = randomUUID();
  const createdAt = new Date().toISOString();

  const insertStmt = dataBase.prepare(`
    INSERT INTO users (id, name, email, passwordHash, avatarUrl, createdAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertStmt.run(id, name, email, passwordHash, null, createdAt);

  const token = jwt.sign({ id }, JWT_SECRET, { expiresIn: TOKEN_EXPIRED });

  const user: IAuthResponse["user"] = {
    id,
    name,
    email,
    avatarUrl: undefined,
    createdAt,
    totalScore: 0,
  };

  return {
    user,
    token,
  };
}

/**
 * Login User
 *
 * @param data - Data from the client (email, password)
 * @returns - Object with user and token
 * @throws - Error - If the user is not found or the password is incorrect
 */

export function loginUser(data: ILoginCredentials): IAuthResponse {
  const { email, password } = data;

  const findStmt = dataBase.prepare("SELECT * FROM users WHERE email = ?");
  const user = findStmt.get(email) as IDatabaseUser | undefined;

  if (!user) {
    throw new Error(LANG.errors.incorrect_mail_password);
  }

  const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new Error(LANG.errors.incorrect_mail_password);
  }

  const token = jwt.sign({ id: user.id }, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRED,
  });

  const userResponse: IAuthResponse["user"] = {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl || undefined,
    createdAt: user.createdAt,
    totalScore: user.totalScore || 0,
  };

  return {
    user: userResponse,
    token,
  };
}

/**
 * Get User by ID
 *
 * @param id - User ID
 * @returns - User object or null if not found
 */
export function getUserById(id: string): IUser | null {
  const findStmt = dataBase.prepare("SELECT * FROM users WHERE id = ?");
  const user = findStmt.get(id) as IDatabaseUser | undefined;

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl || undefined,
    createdAt: user.createdAt,
    totalScore: user.totalScore || 0,
  };
}

/**
 * Update user's name
 *
 * @param id - User ID
 * @param newName - New name
 * @returns Updated user object
 * @throws Error - If user not found or validation fails
 */
export function updateUserName(id: string, newName: string): IUser {
  const NAME_REGEX = /^[a-zA-Zа-яА-ЯёЁ\s\-']+$/u;
  const MIN_LENGTH = 2;
  const MAX_LENGTH = 30;

  const trimmed = newName.trim();
  if (!trimmed) throw new Error(LANG.errors.name_empty);
  if (trimmed.length < MIN_LENGTH || trimmed.length > MAX_LENGTH)
    throw new Error(LANG.errors.name_length);
  if (!NAME_REGEX.test(trimmed)) throw new Error(LANG.errors.name_invalid);

  const updateStmt = dataBase.prepare(`
    UPDATE users SET name = ? WHERE id = ? RETURNING *
  `);
  const updatedUser = updateStmt.get(trimmed, id) as IDatabaseUser | undefined;
  if (!updatedUser) throw new Error(LANG.errors.user_not_found);

  return {
    id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    avatarUrl: updatedUser.avatarUrl || undefined,
    createdAt: updatedUser.createdAt,
    totalScore: updatedUser.totalScore || 0,
  };
}

/**
 * Update user's email
 *
 * @param id - User ID
 * @param newEmail - New Email
 * @returns Updated user object
 * @throws Error - If user not found or validation fails
 */
export function updateUserEmail(id: string, newEmail: string): IUser {
  const trimmedEmail = newEmail.trim().toLowerCase();
  const EMAIL_REGEX = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;

  if (!trimmedEmail) {
    throw new Error(LANG.errors.email_empty);
  }
  if (trimmedEmail.length > 254) {
    throw new Error(LANG.errors.email_too_long);
  }
  if (!EMAIL_REGEX.test(trimmedEmail)) {
    throw new Error(LANG.errors.email_invalid);
  }

  // Uniqueness check
  const checkStmt = dataBase.prepare(
    "SELECT id FROM users WHERE email = ? AND id != ?",
  );
  const existing = checkStmt.get(trimmedEmail, id) as
    | { id: string }
    | undefined;
  if (existing) {
    throw new Error(LANG.errors.email_already_used);
  }

  const updateStmt = dataBase.prepare(`
    UPDATE users SET email = ? WHERE id = ? RETURNING *
  `);
  const updated = updateStmt.get(trimmedEmail, id) as IDatabaseUser | undefined;
  if (!updated) throw new Error(LANG.errors.user_not_found);

  return {
    id: updated.id,
    name: updated.name,
    email: updated.email,
    avatarUrl: updated.avatarUrl || undefined,
    createdAt: updated.createdAt,
    totalScore: updated.totalScore || 0,
  };
}

export function updateUserPassword(id: string, newPassword: string): void {
  const MIN_LENGTH = 6;
  const MAX_LENGTH = 50;
  const PASSWORD_REGEX = /^.{6,50}$/;

  if (!newPassword) {
    throw new Error(LANG.errors.password_empty);
  }
  if (newPassword.length < MIN_LENGTH || newPassword.length > MAX_LENGTH) {
    throw new Error(LANG.errors.password_length);
  }
  if (!PASSWORD_REGEX.test(newPassword)) {
    throw new Error(LANG.errors.password_invalid);
  }

  const salt = bcrypt.genSaltSync(SALT_ROUNDS);
  const passwordHash = bcrypt.hashSync(newPassword, salt);

  const updateStmt = dataBase.prepare(`
    UPDATE users SET passwordHash = ? WHERE id = ?
  `);
  const result = updateStmt.run(passwordHash, id);

  if (result.changes === 0) {
    throw new Error(LANG.errors.user_not_found);
  }
}

export function updateUserAvatar(userId: string, avatarUrl: string): IUser {
  const updateStatement = dataBase.prepare(`
    UPDATE users
    SET avatarUrl = ?
    WHERE id = ?
    RETURNING *
  `);

  const updatedUser = updateStatement.get(avatarUrl, userId) as
    | IDatabaseUser
    | undefined;

  if (!updatedUser) {
    throw new Error(LANG.errors.user_not_found);
  }

  return {
    id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    avatarUrl: updatedUser.avatarUrl || undefined,
    createdAt: updatedUser.createdAt,
    totalScore: updatedUser.totalScore || 0,
  };
}
