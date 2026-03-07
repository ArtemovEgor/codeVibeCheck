import {
  type IApiResponse,
  type IAIResponse,
  type ISendMessagePayload,
  type IChatMessage,
} from "@/types/shared";
import { apiService } from "./api-service";
import { ENDPOINTS } from "./endpoints";
import { aiMock } from "./mock/ai.mock";

class AIApi {
  public async sendChatMessage(
    message: ISendMessagePayload,
  ): Promise<IAIResponse> {
    if (apiService.isMockMode) {
      return await aiMock.sendChatMessage(message);
    }

    const response = await apiService.send<IApiResponse<IAIResponse>>(
      ENDPOINTS.AI.CHAT,
      {
        method: "POST",
        body: JSON.stringify(message),
      },
    );

    return response.data;
  }

  public async getChatHistory(): Promise<IChatMessage[]> {
    if (apiService.isMockMode) {
      return await aiMock.getChatHistory();
    }

    const response = await apiService.send<IApiResponse<IChatMessage[]>>(
      ENDPOINTS.AI.CHAT_HISTORY,
      {
        method: "GET",
      },
    );

    return response.data;
  }

  public async resetChat(): Promise<void> {
    if (apiService.isMockMode) {
      aiMock.resetChat();
      return;
    }
    await apiService.send(ENDPOINTS.AI.CHAT_RESET, { method: "DELETE" });
  }
}

export const aiApi = new AIApi();
