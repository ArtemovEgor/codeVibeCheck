import { describe, it, expect } from "vitest";
import { registerUser } from "./auth.service";

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
});
