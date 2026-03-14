import type { IApiResponse } from "@/types/shared";
import type {
  IUpdateProgressPayload,
  IUserTopicProgress,
} from "@/types/shared/user.types";
import { apiService } from "./api-service";
import { ENDPOINTS } from "./endpoints";
import { progressMock } from "./mock/progress.mock";

class ProgressApi {
  public async getAll(): Promise<IUserTopicProgress[]> {
    const response = apiService.isMockMode
      ? await progressMock.getAll()
      : await apiService.send<IApiResponse<IUserTopicProgress[]>>(
          ENDPOINTS.PROGRESS.GET_ALL,
          {
            method: "GET",
          },
        );

    return response.data;
  }

  public async getByTopicId(topicId: string): Promise<IUserTopicProgress> {
    const response = apiService.isMockMode
      ? await progressMock.getByTopicId(topicId)
      : await apiService.send<IApiResponse<IUserTopicProgress>>(
          ENDPOINTS.PROGRESS.GET_BY_TOPIC(topicId),
          {
            method: "GET",
          },
        );

    return response.data;
  }

  public async update(
    payload: IUpdateProgressPayload,
  ): Promise<IUserTopicProgress> {
    const response = apiService.isMockMode
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
}

export const progressApi = new ProgressApi();
