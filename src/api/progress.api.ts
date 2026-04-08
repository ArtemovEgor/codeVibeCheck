import type { IApiResponse } from "@/types/shared";
import type {
  IUpdateProgressPayload,
  IUserStats,
  IUserTopicProgress,
} from "@/types/shared/user.types";
import { apiService } from "./api-service";
import { ENDPOINTS } from "./endpoints";
import { progressMock } from "./mock/progress.mock";

class ProgressApi {
  private isMockData = apiService.isMockMode; //apiService.isMockMode

  public async getAll(): Promise<IUserTopicProgress[]> {
    const result = this.isMockData
      ? await progressMock.getAll()
      : await apiService.send<IApiResponse<IUserTopicProgress[]>>(
          ENDPOINTS.PROGRESS.GET_ALL,
          { method: "GET" },
        );
    return result.data;
  }

  public async getByTopicId(topicId: string): Promise<IUserTopicProgress> {
    const result = this.isMockData
      ? await progressMock.getByTopicId(topicId)
      : await apiService.send<IApiResponse<IUserTopicProgress>>(
          ENDPOINTS.PROGRESS.GET_BY_TOPIC(topicId),
          { method: "GET" },
        );
    return result.data;
  }

  public async initTopic(topicId: string): Promise<IUserTopicProgress> {
    const response = await progressMock.initTopic(topicId);
    return response.data;
  }

  public async update(
    payload: IUpdateProgressPayload,
  ): Promise<IUserTopicProgress> {
    const response = this.isMockData
      ? await progressMock.update(payload)
      : await apiService.send<IApiResponse<IUserTopicProgress>>(
          ENDPOINTS.PROGRESS.UPDATE,
          {
            method: "POST",
            body: JSON.stringify(payload),
          },
        );

    return response.data;
  }

  public async getUserStats(): Promise<IUserStats> {
    const response = this.isMockData
      ? await progressMock.getUserStats()
      : await apiService.send<IApiResponse<IUserStats>>(
          ENDPOINTS.PROGRESS.GET_STATS,
          {
            method: "GET",
          },
        );

    return response.data;
  }

  public async resetTopic(topicId: string): Promise<void> {
    const response = this.isMockData
      ? await progressMock.resetTopic(topicId)
      : await apiService.send<IApiResponse<void>>(
          ENDPOINTS.PROGRESS.RESET_TOPIC(topicId),
          { method: "PATCH" },
        );
    return response.data;
  }
}

export const progressApi = new ProgressApi();
