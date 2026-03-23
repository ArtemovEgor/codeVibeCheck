import type { IApiResponse, IUserChatStats } from "@/types/shared";
import { apiService } from "./api-service";
import { ENDPOINTS } from "./endpoints";

class ProfileApi {
  /**
   * Fetch user chat statistics (XP, sessions completed, etc.)
   * @returns User chat statistics from AI interview sessions
   */
  public async getChatStats(): Promise<IUserChatStats> {
    const response = await apiService.send<IApiResponse<IUserChatStats>>(
      ENDPOINTS.PROFILE.CHAT_STATS,
      {
        method: "GET",
      },
    );

    return response.data;
  }
}

export const profileApi = new ProfileApi();
