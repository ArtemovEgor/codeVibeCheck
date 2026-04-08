import type {
  IUpdateProgressPayload,
  IUserStats,
  IUserTopicProgress,
} from "@/types/shared/user.types";
import { progressMock } from "./mock/progress.mock";

class ProgressApi {
  public async getAll(): Promise<IUserTopicProgress[]> {
    const response = await progressMock.getAll();
    return response.data;
  }

  public async getByTopicId(topicId: string): Promise<IUserTopicProgress> {
    const response = await progressMock.getByTopicId(topicId);
    return response.data;
  }

  public async initTopic(topicId: string): Promise<IUserTopicProgress> {
    const response = await progressMock.initTopic(topicId);
    return response.data;
  }

  public async update(
    payload: IUpdateProgressPayload,
  ): Promise<IUserTopicProgress> {
    const response = await progressMock.update(payload);
    return response.data;
  }

  public async getUserStats(): Promise<IUserStats> {
    const response = await progressMock.getUserStats();
    return response.data;
  }

  public async resetTopic(topicId: string): Promise<void> {
    const response = await progressMock.resetTopic(topicId);
    return response.data;
  }
}

export const progressApi = new ProgressApi();
