import type { IApiError, IApiResponse } from "@/types/shared";
import type { ITopic, Widget } from "@/types/shared/widget.types";
import { MOCK_TOPICS, MOCK_WIDGETS } from "./widgets.mock.data";

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

  public async getTopicById(
    id: string,
  ): Promise<IApiResponse<ITopic> | IApiError> {
    await delay();

    const topic = MOCK_TOPICS.find((topic) => topic.id === id);
    if (!topic)
      return {
        success: false,
        status: NOT_FOUND_STATUS,
        message: `Topic not found: ${id}`,
      };

    return {
      success: true,
      data: topic,
    };
  }

  public async getWidgetsByTopicId(
    topicId: string,
  ): Promise<IApiResponse<Widget[]> | IApiError> {
    await delay();

    const topic = MOCK_TOPICS.find((topic) => topic.id === topicId);
    if (!topic)
      return {
        success: false,
        status: NOT_FOUND_STATUS,
        message: `Topic not found: ${topicId}`,
      };

    const widgets = topic.widgetIds
      .map((id) => MOCK_WIDGETS.find((widget) => widget.id === id))
      .filter((widget) => widget !== undefined);

    return { success: true, data: widgets };
  }

  public async getWidgetById(
    id: string,
  ): Promise<IApiResponse<Widget> | IApiError> {
    await delay();

    const widget = MOCK_WIDGETS.find((widget) => widget.id === id);
    if (!widget)
      return {
        success: false,
        status: NOT_FOUND_STATUS,
        message: `Topic not found: ${id}`,
      };

    return { success: true, data: widget };
  }
}

export const widgetMock = new WidgetMock();
