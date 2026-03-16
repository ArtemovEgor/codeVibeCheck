import { describe, it, expect, beforeEach } from "vitest";
import { registerUser } from "./auth.service";
import database from "./database";

beforeEach(() => {
  database.prepare("DELETE FROM users").run();
});

describe("registerUser", () => {
  it("should register a new user with valid data", () => {
    const testUser = {
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    };

    const result = registerUser(testUser);

    expect(result.user).toBeDefined();
    expect(result.user.name).toBe(testUser.name);
    expect(result.user.email).toBe(testUser.email);
    expect(result.token).toBeDefined();
    expect(result.user.id).toBeDefined();
    expect(result.user.createdAt).toBeDefined();
  });

  it("should throw error when password is too short", () => {
    const testUser = {
      name: "Test User",
      email: "test@example.com",
      password: "123",
    };

    expect(() => registerUser(testUser)).toThrow();

    expect(() => registerUser(testUser)).toThrow(/password/i);
  });

  it("should throw error when email is invalid", () => {
    const testUser = {
      name: "Test User",
      email: "not-an-email",
      password: "password123",
    };

    expect(() => registerUser(testUser)).toThrow();
    expect(() => registerUser(testUser)).toThrow(/mail|email/i);
  });
});
