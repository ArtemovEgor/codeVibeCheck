import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key-change-in-prod";

export function verifyToken(token: string): { id: string } {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (typeof decoded === "string" || !decoded) {
      throw new Error("Invalid token payload");
    }

    return decoded as { id: string };
  } catch (error) {
    throw new Error("Invalid or expired token", { cause: error });
  }
}
