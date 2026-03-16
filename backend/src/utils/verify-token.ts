import jwt from "jsonwebtoken";

export function verifyToken(token: string): { id: string } {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, secret);
  } catch (error) {
    throw new Error("Invalid or expired token", { cause: error });
  }

  if (typeof decoded === "string" || !decoded || !decoded.id) {
    throw new Error("Invalid token payload");
  }

  return decoded as { id: string };
}
