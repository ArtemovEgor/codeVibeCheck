import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dataBase from "./database";
import {
  IRegisterCredentials,
  IAuthResponse,
  ILoginCredentials,
  IDatabaseUser,
} from "./types";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key-change-in-prod";
const SALT_ROUNDS = 10;

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
    throw new Error("The password must be at least 6 characters long.");
  }

  if (!email || !email.includes("@")) {
    throw new Error("Incorrect email");
  }

  const findStmt = dataBase.prepare("SELECT id FROM users WHERE email = ?");
  const existingUser = findStmt.get(email) as { id: string } | undefined;

  if (existingUser) {
    throw new Error("A user with this email already exists.");
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

  const token = jwt.sign({ id }, JWT_SECRET, { expiresIn: "1h" });

  const user: IAuthResponse["user"] = {
    id,
    name,
    email,
    avatarUrl: undefined,
    createdAt,
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
    throw new Error("Incorrect email or password");
  }

  const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new Error("Incorrect email or password");
  }

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });

  const userResponse: IAuthResponse["user"] = {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl || undefined,
    createdAt: user.createdAt,
  };

  return {
    user: userResponse,
    token,
  };
}
