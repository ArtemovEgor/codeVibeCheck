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
  ): Promise<IApiResponse<IAIResponse>> {
    if (apiService.isMockMode) {
      return await aiMock.sendChatMessage(message);
    }

    return await apiService.send<IApiResponse<IAIResponse>>(ENDPOINTS.AI.CHAT, {
      method: "POST",
      body: JSON.stringify(message),
    });
  }

  public async getChatHistory(): Promise<IApiResponse<IChatMessage[]>> {
    if (apiService.isMockMode) {
      return await aiMock.getChatHistory();
    }

    return await apiService.send<IApiResponse<IChatMessage[]>>(
      ENDPOINTS.AI.CHAT_HISTORY,
      {
        method: "GET",
      },
    );
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
