import { describe, it, expect } from "vitest";
import { ROUTES } from "@/constants/routes";
import { generatePath } from "./generate-path";

describe("generatePath validation", () => {
  it("replaces parameters in the path", () => {
    const result = generatePath(ROUTES.PRACTICE, { topicId: "topicName" });
    expect(result).toBe("/practice/topicName");
  });

  it("converts a number parameter to a string", () => {
    const result = generatePath(ROUTES.PRACTICE, { topicId: 123 });
    expect(result).toBe("/practice/123");
  });

  it("works with special symbols", () => {
    const result = generatePath(ROUTES.PRACTICE, {
      topicId: "topic_id:with-special$symbols,.",
    });
    expect(result).toBe("/practice/topic_id:with-special$symbols,.");
  });

  it("works with a missing parameter", () => {
    const result = generatePath(ROUTES.PRACTICE);
    expect(result).toBe("/practice/:topicId");
  });

  it("works with a wrong parameter", () => {
    const result = generatePath(ROUTES.PRACTICE, {
      otherParameter: "topicName",
    });
    expect(result).toBe("/practice/:topicId");
  });

  it("works with an empty parameter object", () => {
    const result = generatePath(ROUTES.PRACTICE, {});
    expect(result).toBe("/practice/:topicId");
  });

  it("works with extra parameters", () => {
    const result = generatePath(ROUTES.PRACTICE, {
      topicId: "topicName",
      otherParameter: "topicName",
    });
    expect(result).toBe("/practice/topicName");
  });

  it("works with empty path", () => {
    const result = generatePath("", {
      topicId: "topicName",
      otherParameter: "topicName",
    });
    expect(result).toBe("");
  });
});
