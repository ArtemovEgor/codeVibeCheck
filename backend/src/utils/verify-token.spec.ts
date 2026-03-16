import jwt from "jsonwebtoken";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { verifyToken } from "./verify-token";

describe("verifyToken validation", () => {
  const MOCK_SECRET = "test-secret-key";

  beforeEach(() => {
    vi.stubEnv("JWT_SECRET", MOCK_SECRET);
  });

  it("should verify a valid token", () => {
    const payload = { id: "user-123" };
    const token = jwt.sign(payload, MOCK_SECRET);

    const result = verifyToken(token);
    expect(result).toMatchObject(payload);
  });
});
