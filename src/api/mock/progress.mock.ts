import type { IApiError, IApiResponse } from "@/types/shared";
import type {
  IUpdateProgressPayload,
  IUserStats,
  IUserTopicProgress,
} from "@/types/shared/user.types";
import { storageService } from "@/services/storage-service";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { delay } from "./delay";
import { MOCK_TOPICS } from "@/api/mock/widgets.mock.data.ts";

const NOT_FOUND_STATUS = 404;
const INTERNAL_SERVER_ERROR = 500;

class ProgressMock {
  private getProgressFromStorage(): IUserTopicProgress[] {
    return storageService.getStorage(STORAGE_KEYS.MOCK_PROGRESS, []);
  }

  /**
   * Returns progress for all topics the user has started.
   * Does not initialize missing topics — returns empty array if no progress yet.
   * Used by Library page — missing topics are displayed with default values on the frontend.
   */
  public async getAll(): Promise<IApiResponse<IUserTopicProgress[]>> {
    await delay();
    const all = this.getProgressFromStorage();
    return { success: true, data: all };
  }

  /**
   * Returns progress for a specific topic by topicId.
   * If no progress found — creates a new entry with default values
   * (xpEarned: 0, isCompleted: false, isUnlocked: calculated from requiredTopicIds).
   * Used by Practice page to restore position and check if topic is accessible.
   */
  public async getByTopicId(
    topicId: string,
  ): Promise<IApiResponse<IUserTopicProgress>> {
    await delay();

    const all = this.getProgressFromStorage();
    let progress = all.find((p) => p.topicId === topicId);

    if (!progress) {
      const completedTopicIds = this.getCompletedTopicIds(all);
      progress = {
        topicId,
        completedWidgetIds: [],
        xpEarned: 0,
        isCompleted: false,
        isUnlocked: this.calculateIsUnlocked(topicId, completedTopicIds),
      };
      all.push(progress);
      storageService.setStorage(STORAGE_KEYS.MOCK_PROGRESS, all);
    }

    return { success: true, data: progress };
  }

  /**
   * Updates progress after the user submits a widget answer.
   * If progress exists — updates completedWidgetIds, xpEarned, isCompleted.
   * If not — creates a new progress entry via createTopicProgress().
   * Also updates overall user stats (totalXp, completedTopics) via updateUserStats().
   * Throws 500 if the updated record cannot be found after saving.
   */
  public async update(
    payload: IUpdateProgressPayload,
  ): Promise<IApiResponse<IUserTopicProgress>> {
    await delay();

    const all = this.getProgressFromStorage();
    const existing = all.find((p) => p.topicId === payload.topicId);

    if (existing) {
      this.updateTopicProgress(existing, payload, all);
      const isCompleted = existing.isCompleted;
      this.updateUserStats(payload, isCompleted, all);
    } else {
      this.createTopicProgress(payload, all);
    }

    storageService.setStorage(STORAGE_KEYS.MOCK_PROGRESS, all);

    const updated = all.find((p) => p.topicId === payload.topicId);

    if (!updated)
      throw this.createError(
        `Failed to update progress: ${payload.topicId}`,
        INTERNAL_SERVER_ERROR,
      );

    return { success: true, data: updated };
  }

  /**
   * Updates topic progress after a widget answer.
   * Adds widgetId to completedWidgetIds if not already present.
   * Recalculates isCompleted based on totalWidgets.
   * Unlocks dependent topics if topic is completed.
   */
  private updateTopicProgress(
    existing: IUserTopicProgress,
    payload: IUpdateProgressPayload,
    all: IUserTopicProgress[],
  ): void {
    if (!existing.completedWidgetIds.includes(payload.widgetId)) {
      existing.completedWidgetIds.push(payload.widgetId);
    }

    existing.xpEarned += payload.xpEarned;

    existing.isCompleted =
      existing.completedWidgetIds.length === payload.totalWidgets;

    if (existing.isCompleted) {
      this.unlockDependentTopics(all);
    }
  }

  /**
   * Updates overall user statistics after a widget answer.
   * totalXp increases on every answer including repeat attempts.
   * completedTopics is recalculated only when a topic is newly completed.
   * streak — TODO: implement based on lastActivityAt
   */
  private updateUserStats(
    payload: IUpdateProgressPayload,
    isCompleted: boolean,
    all: IUserTopicProgress[],
  ): void {
    const stats = storageService.getStorage<IUserStats>(
      STORAGE_KEYS.USER_STATS,
      {
        totalXp: 0,
        completedTopics: 0,
        streak: 0,
      },
    );

    stats.totalXp += payload.xpEarned;

    if (isCompleted) {
      stats.completedTopics = all.filter((p) => p.isCompleted).length;
    }

    storageService.setStorage(STORAGE_KEYS.USER_STATS, stats);
  }

  public async resetTopic(topicId: string): Promise<IApiResponse<void>> {
    await delay();
    const all = this.getProgressFromStorage();
    const index = all.findIndex((p) => p.topicId === topicId);

    if (index !== -1) {
      all[index] = {
        topicId,
        completedWidgetIds: [],
        xpEarned: 0,
        isCompleted: false,
        isUnlocked: true,
      };
      storageService.setStorage(STORAGE_KEYS.MOCK_PROGRESS, all);
    }

    return { success: true, data: undefined };
  }

  /**
   * Creates a new progress entry for a topic on first widget answer.
   * isCompleted defaults to false — only updateTopicProgress can set it to true.
   * isUnlocked is calculated based on completed requiredTopicIds.
   */
  private createTopicProgress(
    payload: IUpdateProgressPayload,
    all: IUserTopicProgress[],
  ): void {
    const completedTopicIds = this.getCompletedTopicIds(all);
    all.push({
      topicId: payload.topicId,
      completedWidgetIds: [payload.widgetId],
      xpEarned: payload.xpEarned,
      isCompleted: false,
      isUnlocked: this.calculateIsUnlocked(payload.topicId, completedTopicIds),
    });
  }

  /**
   * Returns true if all requiredTopicIds are completed.
   * Topics with empty requiredTopicIds (e.g. core-js) are always unlocked.
   * Returns false if topic is not found in MOCK_TOPICS.
   */
  private calculateIsUnlocked(
    topicId: string,
    completedTopicIds: string[],
  ): boolean {
    const topic = MOCK_TOPICS.find((topic) => topic.id === topicId);
    if (!topic) return false;
    if (topic.requiredTopicIds.length === 0) return true;
    return topic.requiredTopicIds.every((id) => completedTopicIds.includes(id));
  }

  /**
   * Returns ids of all completed topics from current progress array.
   * Used to calculate isUnlocked for dependent topics.
   */
  private getCompletedTopicIds(all: IUserTopicProgress[]): string[] {
    return all
      .filter((topic) => topic.isCompleted)
      .map((topic) => topic.topicId);
  }

  /**
   * Iterates all topics with dependencies and unlocks them
   * if all their requiredTopicIds are now completed.
   * Called after a topic is marked as isCompleted.
   * Mutates progress objects in place — caller must save to storage.
   */
  private unlockDependentTopics(all: IUserTopicProgress[]): void {
    const completedTopicIds = this.getCompletedTopicIds(all);

    for (const topic of MOCK_TOPICS) {
      if (topic.requiredTopicIds.length === 0) continue;

      const progress = all.find((p) => p.topicId === topic.id);
      if (progress && !progress.isUnlocked) {
        progress.isUnlocked = this.calculateIsUnlocked(
          topic.id,
          completedTopicIds,
        );
      }
    }
  }

  /**
   * Returns overall user statistics (totalXp, completedTopics, streak).
   * If no stats found in storage — returns default values with zeros.
   * Used by Practice page right panel and Dashboard.
   */
  public async getUserStats(): Promise<IApiResponse<IUserStats>> {
    await delay();

    const stats = storageService.getStorage<IUserStats>(
      STORAGE_KEYS.USER_STATS,
      {
        totalXp: 0,
        completedTopics: 0,
        streak: 0,
      },
    );

    return { success: true, data: stats };
  }
  /**
   * Creates and returns an IApiError object.
   * Default status is 404. Pass INTERNAL_SERVER_ERROR (500) for server-side failures.
   */
  private createError(
    message: string,
    status: number = NOT_FOUND_STATUS,
  ): IApiError {
    return {
      success: false as const,
      status: status,
      message,
    };
  }
}

export const progressMock = new ProgressMock();
