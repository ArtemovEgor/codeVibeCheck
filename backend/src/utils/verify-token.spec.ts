import jwt from "jsonwebtoken";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { verifyToken } from "./verify-token";
import { EN } from "../locale/en";

describe("verifyToken validation", () => {
  const MOCK_SECRET = "test-secret-key";
  const LANG = EN;

  beforeEach(() => {
    vi.stubEnv("JWT_SECRET", MOCK_SECRET);
  });

  it("should verify a valid token", () => {
    const payload = { id: "user-123" };
    const token = jwt.sign(payload, MOCK_SECRET);

    const result = verifyToken(token);
    expect(result).toMatchObject(payload);
  });

  it("should throw error for expired token", () => {
    const token = jwt.sign({ id: "user-123" }, MOCK_SECRET, {
      expiresIn: "0s",
    });

    expect(() => verifyToken(token)).toThrow(LANG.errors.invalid_token);
  });

  it("should throw error for invalid signature", () => {
    const token = jwt.sign({ id: "user-123" }, "wrong-secret");

    expect(() => verifyToken(token)).toThrow(LANG.errors.invalid_token);
  });

  it("should throw error for invalid payload (missing id)", () => {
    const token = jwt.sign("not-an-object", MOCK_SECRET);

    expect(() => verifyToken(token)).toThrow(LANG.errors.invalid_payload);
  });
});
