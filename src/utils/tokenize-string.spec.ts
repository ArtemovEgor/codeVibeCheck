import { describe, it, expect } from "vitest";
import { tokenizeString } from "./tokenize-string";

describe("tokenizeString validation", () => {
  it("splits string with default size (2)", () => {
    const result = tokenizeString("abcde");
    expect(result).toEqual(["ab", "cd", "e"]);
  });

  it("splits string with custom size", () => {
    const result = tokenizeString("abcdef", 3);
    expect(result).toEqual(["abc", "def"]);
  });

  it("handles string length not divisible by size", () => {
    const result = tokenizeString("abc", 2);
    expect(result).toEqual(["ab", "c"]);
  });

  it("returns empty array for empty string", () => {
    const result = tokenizeString("");
    expect(result).toEqual([]);
  });

  it("returns one chunk if size is larger than string length", () => {
    const result = tokenizeString("abc", 5);
    expect(result).toEqual(["abc"]);
  });

  it("splits string into single characters when size is 1", () => {
    const result = tokenizeString("abc", 1);
    expect(result).toEqual(["a", "b", "c"]);
  });
});
