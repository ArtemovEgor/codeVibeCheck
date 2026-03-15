import { describe, it, expect, beforeEach, vi } from "vitest";
import WidgetEngine from "./widget-engine";
import widgetEngine from "./widget-engine";
import type { IWidgetStrategy } from "@/types/shared/widget.types";
import BaseComponent from "@/components/base/base-component";

const mockStrategy: IWidgetStrategy = {
  type: "quiz",
  render: () => new BaseComponent({ className: "mock" }),
  validate: () => true,
  showVerdict: () => vi.fn(),
};

describe("WidgetEngine", () => {
  beforeEach(() => {
    WidgetEngine.clear();
  });

  it("getStrategy returns undefined for unregistered type", () => {
    expect(WidgetEngine.getStrategy("unknown")).toBeUndefined();
  });

  it("getStrategy returns strategy for registered type", () => {
    widgetEngine.register(mockStrategy);
    expect(WidgetEngine.getStrategy(mockStrategy.type)).toEqual(mockStrategy);
  });
});
