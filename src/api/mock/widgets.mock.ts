import type { IApiError, IApiResponse } from "@/types/shared";
import {
  WIDGET_TYPES,
  type ITopic,
  type IVerdict,
  type ILocalizedString,
  type Widget,
  type WidgetAnswer,
} from "@/types/shared/widget.types";
import { MOCK_TOPICS, MOCK_WIDGETS } from "./widgets.mock.data";
import widgetEngine from "@/services/widget-engine";
import { XP_BY_DIFFICULTY } from "@/constants/game";

const delay = (ms = Number(import.meta.env.VITE_MOCK_DELAY)) =>
  new Promise((r) => setTimeout(r, ms));

const NOT_FOUND_STATUS = 404;

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
    if (!topic) throw this.notFoundError(`Topic not found: ${id}`);

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
    if (!topic) throw this.notFoundError(`Topic not found: ${topicId}`);

    const widgets = topic.widgetIds
      .map((id) => MOCK_WIDGETS.find((w) => w.id === id))
      .filter((w): w is Widget => w !== undefined);

    return { success: true, data: widgets };
  }

  public async getWidgetById(id: string): Promise<IApiResponse<Widget>> {
    await delay();

    const widget = MOCK_WIDGETS.find((widget) => widget.id === id);
    if (!widget) throw this.notFoundError(`Widget not found: ${id}`);

    return { success: true, data: widget };
  }

  private calculateXp(widget: Widget, isCorrect: boolean): number {
    if (!isCorrect) return 0;

    return XP_BY_DIFFICULTY[widget.difficulty];
  }

  private getExplanation(widget: Widget): ILocalizedString | undefined {
    if (widget.type === WIDGET_TYPES.TRUE_FALSE)
      return widget.payload.explanation;
    return undefined;
  }

  public async submitAnswer(
    widgetId: string,
    answer: WidgetAnswer,
  ): Promise<IApiResponse<IVerdict>> {
    await delay();

    const widget = MOCK_WIDGETS.find((w) => w.id === widgetId);
    if (!widget) throw this.notFoundError(`Widget not found: ${widgetId}`);

    const strategy = widgetEngine.getStrategy(widget.type);
    if (!strategy) throw new Error(`Strategy not found: ${widget.type}`);

    const isCorrect = strategy.validate(answer, widget);

    return {
      success: true,
      data: {
        isCorrect,
        explanation: this.getExplanation(widget),
        xpEarned: this.calculateXp(widget, isCorrect),
        streakUpdated: isCorrect,
      },
    };
  }

  private notFoundError(message: string): IApiError {
    return {
      success: false as const,
      status: NOT_FOUND_STATUS,
      message,
    };
  }
}

export const widgetsMock = new WidgetMock();
