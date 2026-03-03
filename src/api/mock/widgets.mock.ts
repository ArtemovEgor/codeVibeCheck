import type { IApiError, IApiResponse } from "@/types/shared";
import type {
  ITopic,
  IVerdict,
  Widget,
  WidgetAnswer,
  WidgetDifficulty,
} from "@/types/shared/widget.types";
import { MOCK_TOPICS, MOCK_WIDGETS } from "./widgets.mock.data";
import widgetEngine from "@/services/widget-engine";

const delay = (ms = Number(import.meta.env.VITE_MOCK_DELAY)) =>
  new Promise((r) => setTimeout(r, ms));

const NOT_FOUND_STATUS = 404;

const XP_BY_DIFFICULTY: Record<WidgetDifficulty, number> = {
  1: 10,
  2: 20,
  3: 30,
};

class WidgetMock {
  public async getTopics(): Promise<IApiResponse<ITopic[]>> {
    await delay();

    return {
      success: true,
      data: MOCK_TOPICS,
    };
  }

  public async getTopicById(id: string): Promise<IApiResponse<ITopic>> {
    await delay();

    const topic = MOCK_TOPICS.find((topic) => topic.id === id);
    if (!topic) this.notFound(`Topic not found: ${id}`);

    return {
      success: true,
      data: topic,
    };
  }

  public async getWidgetsByTopicId(
    topicId: string,
  ): Promise<IApiResponse<Widget[]>> {
    await delay();

    const topic = MOCK_TOPICS.find((topic) => topic.id === topicId);
    if (!topic) this.notFound(`Topic not found: ${topicId}`);

    const widgets = topic.widgetIds
      .map((id) => MOCK_WIDGETS.find((widget) => widget.id === id))
      .filter((widget) => widget !== undefined);

    return { success: true, data: widgets };
  }

  public async getWidgetById(id: string): Promise<IApiResponse<Widget>> {
    await delay();

    const widget = MOCK_WIDGETS.find((widget) => widget.id === id);
    if (!widget) this.notFound(`Widget not found: ${id}`);

    return { success: true, data: widget };
  }

  private calculateXp(widget: Widget, isCorrect: boolean): number {
    if (!isCorrect) return 0;

    return XP_BY_DIFFICULTY[widget.difficulty];
  }

  public async submitAnswer(
    widgetId: string,
    answer: WidgetAnswer,
  ): Promise<IApiResponse<IVerdict>> {
    await delay();

    const widget = MOCK_WIDGETS.find((w) => w.id === widgetId);
    if (!widget) this.notFound(`Widget not found: ${widgetId}`);

    const strategy = widgetEngine.getStrategy(widget.type);
    if (!strategy) throw new Error(`Strategy not found: ${widget.type}`);

    const isCorrect = strategy.validate(answer, widget);

    return {
      success: true,
      data: {
        isCorrect,
        xpEarned: this.calculateXp(widget, isCorrect),
        streakUpdated: isCorrect,
      },
    };
  }

  private notFound(message: string): never {
    throw {
      success: false as const,
      status: NOT_FOUND_STATUS,
      message,
    } satisfies IApiError;
  }
}

export const widgetsMock = new WidgetMock();
