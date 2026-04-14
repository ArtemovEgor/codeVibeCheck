import jwt from "jsonwebtoken";
import { EN } from "../locale/en";

export function verifyToken(token: string): { id: string } {
  const secret = process.env.JWT_SECRET;
  const LANG = EN;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, secret);
  } catch (error) {
    throw new Error(LANG.errors.invalid_token, { cause: error });
  }

  if (typeof decoded === "string" || !decoded || !decoded.id) {
    throw new Error(LANG.errors.invalid_payload);
  }

  return decoded as { id: string };
}
