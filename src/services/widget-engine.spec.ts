import { describe, it, expect, beforeEach } from "vitest";
import WidgetEngine from "./widget-engine";

describe("WidgetEngine", () => {
  beforeEach(() => {
    WidgetEngine.clear();
  });

  it("getStrategy returns undefined for unregistered type", () => {
    expect(WidgetEngine.getStrategy("unknown")).toBeUndefined();
  });
});
