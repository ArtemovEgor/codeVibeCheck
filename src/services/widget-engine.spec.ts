import widgetEngine from "./widget-engine";
import type { IWidgetStrategy, Widget } from "@/types/shared/widget.types";
import BaseComponent from "@/components/base/base-component";

const mockStrategy: IWidgetStrategy = {
  type: "quiz",
  render: () => new BaseComponent({ className: "mock" }),
  validate: () => true,
  showVerdict: vi.fn(),
};

const mockWidget = {
  type: "quiz",
  id: "test-quiz-001",
  payload: {
    question: { en: "Test question", ru: "Тестовый вопрос" },
    options: [
      { en: "Option 1", ru: "Вариант 1" },
      { en: "Option 2", ru: "Вариант 2" },
    ],
    correctIndex: 1,
  },
} as unknown as Widget;

describe("WidgetEngine", () => {
  beforeEach(() => {
    widgetEngine.clear();
  });

  it("getStrategy returns undefined for unregistered type", () => {
    expect(widgetEngine.getStrategy("unknown")).toBeUndefined();
  });

  it("getStrategy returns strategy for registered type", () => {
    widgetEngine.register(mockStrategy);
    expect(widgetEngine.getStrategy(mockStrategy.type)).toEqual(mockStrategy);
  });

  it("renderWidget returns undefined for unregistered type", () => {
    const widget = { type: "true-false" } as unknown as Widget;
    const result = widgetEngine.renderWidget(widget, vi.fn());
    expect(result).toBeUndefined();
  });

  it("renderWidget is defined for registered type", () => {
    widgetEngine.register(mockStrategy);
    const result = widgetEngine.renderWidget(mockWidget, vi.fn());
    expect(result).toBeDefined();
  });
});
