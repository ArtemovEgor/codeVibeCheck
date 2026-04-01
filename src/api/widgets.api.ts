/**
 * WidgetsApi — API layer for topics and widgets.
 *
 * Automatically switches between mock and real API based on VITE_API_MODE env variable.
 * Mock mode: VITE_API_MODE=mock
 * Real mode:  VITE_API_MODE=real
 *
 * All methods throw IApiError on failure — catch at the call site.
 *
 * @example
 * Load all topics (e.g. Library Page)
 * const topics = await widgetsApi.getTopics();
 *
 * @example
 * Load widgets for a topic and render them (e.g. Practice Page)
 * const widgets = await widgetsApi.getWidgetsByTopicId("core-js");
 * const el = widgetEngine.renderWidget(widgets[0], async (answer) => {
 *   const verdict = await widgetsApi.submitAnswer(widgets[0].id, answer);
 *   console.log(verdict.isCorrect, verdict.xpEarned);
 * });
 *
 * @example
 * Error handling
 * try {
 *   const topic = await widgetsApi.getTopicById("unknown-id");
 * } catch (error) {
 *   const apiError = error as IApiError;
 *   console.error(apiError.message); // "Topic not found: unknown-id"
 *   console.error(apiError.status);  // 404
 * }
 */

import type { IApiResponse } from "@/types/shared";
import type {
  Widget,
  ITopic,
  IVerdict,
  WidgetAnswer,
} from "@/types/shared/widget.types";
import { apiService } from "./api-service";
import { ENDPOINTS } from "./endpoints";
import { widgetsMock } from "./mock/widgets.mock";

class WidgetsApi {
  public async getTopics(): Promise<ITopic[]> {
    const result = apiService.isMockMode
      ? await widgetsMock.getTopics()
      : await apiService.send<IApiResponse<ITopic[]>>(
          ENDPOINTS.TOPICS.GET_ALL,
          {
            method: "GET",
          },
        );
    return result.data;
  }

  public async getWidgets(): Promise<Widget[]> {
    const result = apiService.isMockMode
      ? await widgetsMock.getWidgets()
      : await apiService.send<IApiResponse<Widget[]>>(
          ENDPOINTS.WIDGETS.GET_ALL,
          {
            method: "GET",
          },
        );
    return result.data;
  }

  public async getTopicById(id: string): Promise<ITopic> {
    const result = apiService.isMockMode
      ? await widgetsMock.getTopicById(id)
      : await apiService.send<IApiResponse<ITopic>>(
          ENDPOINTS.TOPICS.GET_BY_ID(id),
          { method: "GET" },
        );
    return result.data;
  }

  public async getWidgetsByTopicId(topicId: string): Promise<Widget[]> {
    const result = apiService.isMockMode
      ? await widgetsMock.getWidgetsByTopicId(topicId)
      : await apiService.send<IApiResponse<Widget[]>>(
          ENDPOINTS.TOPICS.GET_WIDGETS(topicId),
          { method: "GET" },
        );
    return result.data;
  }

  public async getWidgetById(id: string): Promise<Widget> {
    const result = apiService.isMockMode
      ? await widgetsMock.getWidgetById(id)
      : await apiService.send<IApiResponse<Widget>>(
          ENDPOINTS.WIDGETS.GET_BY_ID(id),
          { method: "GET" },
        );
    return result.data;
  }

  public async submitAnswer(
    widgetId: string,
    answer: WidgetAnswer,
  ): Promise<IVerdict> {
    const result = apiService.isMockMode
      ? await widgetsMock.submitAnswer(widgetId, answer)
      : await apiService.send<IApiResponse<IVerdict>>(
          ENDPOINTS.WIDGETS.SUBMIT_ANSWER(widgetId),
          {
            method: "POST",
            body: JSON.stringify({ answer }),
          },
        );
    return result.data;
  }
}

export const widgetsApi = new WidgetsApi();
