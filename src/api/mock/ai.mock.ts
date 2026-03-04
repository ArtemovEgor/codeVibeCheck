import type {
  IAIResponse,
  IApiResponse,
  IChatMessage,
  ISendMessagePayload,
} from "@/types/shared";
import { delay } from "./delay";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { storageService } from "../../services/storage-service";
import { EN } from "@/locale/en";
import { ChatRoles } from "@/constants/api-chat";

class AIMock {
  public async sendChatMessage(
    message: ISendMessagePayload,
  ): Promise<IApiResponse<IAIResponse>> {
    const history = this.getChatsFromStorage();
    const dateSent = Date.now().toString();

    const messageData: IChatMessage = {
      id: `UserMessage-${dateSent}`,
      role: ChatRoles.user,
      content: message.content,
      createdAt: dateSent,
    };

    history.push(messageData);

    await delay();

    const dateReceived = Date.now().toString();

    const responseData: IChatMessage = {
      id: `AIMessage-${dateReceived}`,
      role: ChatRoles.assistant,
      content: `${EN.mock.ai_response} ${message.content}`,
      createdAt: dateReceived,
    };

    history.push(responseData);
    storageService.setStorage(STORAGE_KEYS.MOCK_CHAT_HISTORY_KEY, history);

    return {
      success: true,
      data: {
        message: responseData,
        streamed: false,
      },
    };
  }

  public async getChatHistory(): Promise<IApiResponse<IChatMessage[]>> {
    await delay();

    const history = this.getChatsFromStorage();

    return {
      success: true,
      data: history,
    };
  }

  public resetChat(): void {
    storageService.setStorage(STORAGE_KEYS.MOCK_CHAT_HISTORY_KEY, []);
  }

  private getChatsFromStorage(): IChatMessage[] {
    return storageService.getStorage(STORAGE_KEYS.MOCK_CHAT_HISTORY_KEY, []);
  }
}

export const aiMock = new AIMock();
