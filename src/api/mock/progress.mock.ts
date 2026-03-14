import type { IApiResponse } from "@/types/shared";
import type {
  IUpdateProgressPayload,
  IUserTopicProgress,
} from "@/types/shared/user.types";
import { storageService } from "@/services/storage-service";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { delay } from "./delay";

class ProgressMock {
  public async getAll(): Promise<IApiResponse<IUserTopicProgress[]>> {
    await delay();
    return {
      success: true,
      data: this.getProgressFromStorage(),
    };
  }

  public async getByTopicId(
    topicId: string,
  ): Promise<IApiResponse<IUserTopicProgress>> {
    await delay();
    const all = this.getProgressFromStorage();
    const progress = all.find((p) => p.topicId === topicId);

    if (!progress) {
      throw {
        success: false as const,
        status: 404,
        message: `Progress not found: ${topicId}`,
      };
    }

    return { success: true, data: progress };
  }

  public async update(
    payload: IUpdateProgressPayload,
  ): Promise<IApiResponse<IUserTopicProgress>> {
    await delay();
    const all = this.getProgressFromStorage();
    const existing = all.find((p) => p.topicId === payload.topicId);

    if (existing) {
      if (!existing.completedWidgetIds.includes(payload.widgetId)) {
        existing.completedWidgetIds.push(payload.widgetId);
        existing.earnedXp += payload.xpEarned;
      }
    } else {
      all.push({
        topicId: payload.topicId,
        completedWidgetIds: [payload.widgetId],
        earnedXp: payload.xpEarned,
        isCompleted: false,
        isUnlocked: true,
      });
    }

    storageService.setStorage(STORAGE_KEYS.MOCK_PROGRESS, all);

    const updated = all.find((p) => p.topicId === payload.topicId);
    if (!updated) {
      throw {
        success: false as const,
        status: 500,
        message: `Failed to update progress: ${payload.topicId}`,
      };
    }
    return { success: true, data: updated };
  }

  private getProgressFromStorage(): IUserTopicProgress[] {
    return storageService.getStorage(STORAGE_KEYS.MOCK_PROGRESS, []);
  }
}

export const progressMock = new ProgressMock();
