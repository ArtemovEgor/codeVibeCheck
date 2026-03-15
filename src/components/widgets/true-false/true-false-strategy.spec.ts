import type { Widget } from "@/types/shared/widget.types";
import { describe, expect, it } from "vitest";
import { TrueFalseStrategy } from "./true-false-strategy";

const mockWidget = {
  type: "true-false",
  id: "test-true-false-001",
  payload: {
    statement: { en: "Test statement", ru: "Тестовое утверждение" },
    explanation: { en: "Explanation", ru: "Объяснение" },
    correctValue: true,
  },
} as unknown as Widget;

const strategy = new TrueFalseStrategy();

describe("TrueFalseStrategy validate", () => {
  it("validate correct answer", () => {
    expect(strategy.validate({ value: true }, mockWidget)).equal(true);
  });
});
