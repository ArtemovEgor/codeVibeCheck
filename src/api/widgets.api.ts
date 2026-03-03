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
 * const { data: topics } = await widgetsApi.getTopics();
 *
 * @example
 * Load widgets for a topic and render them (e.g. Practice Page)
 * const { data: widgets } = await widgetsApi.getWidgetsByTopicId("core-js");
 * const el = widgetEngine.renderWidget(widgets[0], async (answer) => {
 *   const { data: verdict } = await widgetsApi.submitAnswer(widgets[0].id, answer);
 *   console.log(verdict.isCorrect, verdict.xpEarned);
 * });
 *
 * @example
 * Error handling
 * try {
 *   const { data: topic } = await widgetsApi.getTopicById("unknown-id");
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
  public async getTopics(): Promise<IApiResponse<ITopic[]>> {
    if (apiService.isMockMode) return widgetsMock.getTopics();
    return apiService.send<IApiResponse<ITopic[]>>(ENDPOINTS.TOPICS.GET_ALL, {
      method: "GET",
    });
  }

  public async getTopicById(id: string): Promise<IApiResponse<ITopic>> {
    if (apiService.isMockMode) return widgetsMock.getTopicById(id);
    return apiService.send<IApiResponse<ITopic>>(
      ENDPOINTS.TOPICS.GET_BY_ID(id),
      {
        method: "GET",
      },
    );
  }

  public async getWidgetsByTopicId(
    topicId: string,
  ): Promise<IApiResponse<Widget[]>> {
    if (apiService.isMockMode) return widgetsMock.getWidgetsByTopicId(topicId);
    return apiService.send<IApiResponse<Widget[]>>(
      ENDPOINTS.TOPICS.GET_WIDGETS(topicId),
      { method: "GET" },
    );
  }

  public async getWidgetById(id: string): Promise<IApiResponse<Widget>> {
    if (apiService.isMockMode) return widgetsMock.getWidgetById(id);
    return apiService.send<IApiResponse<Widget>>(
      ENDPOINTS.WIDGETS.GET_BY_ID(id),
      { method: "GET" },
    );
  }

  public async submitAnswer(
    widgetId: string,
    answer: WidgetAnswer,
  ): Promise<IApiResponse<IVerdict>> {
    if (apiService.isMockMode)
      return widgetsMock.submitAnswer(widgetId, answer);

    return apiService.send<IApiResponse<IVerdict>>(
      ENDPOINTS.WIDGETS.SUBMIT_ANSWER(widgetId),
      {
        method: "POST",
        body: JSON.stringify({ answer }),
      },
    );
  }
}

export const widgetsApi = new WidgetsApi();
