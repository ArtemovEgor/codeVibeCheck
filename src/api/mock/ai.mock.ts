import type {
  IAIResponse,
  IChatMessage,
  ISendMessagePayload,
} from "@/types/shared";
import { delay } from "./delay";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { storageService } from "../../services/storage-service";
import { EN } from "@/locale/en";
import { ChatRoles } from "@/constants/api-chat";
import { MOCK_XP_AWARD } from "@/constants/mock";

class AIMock {
  public async sendChatMessage(
    message: ISendMessagePayload,
  ): Promise<IAIResponse> {
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
      xpAwarded: MOCK_XP_AWARD,
    };

    history.push(responseData);
    storageService.setStorage(STORAGE_KEYS.MOCK_CHAT_HISTORY_KEY, history);

    return {
      message: responseData,
      streamed: false,
    };
  }

  public async getChatHistory(): Promise<IChatMessage[]> {
    await delay();

    const history = this.getChatsFromStorage();

    if (history.length === 0) {
      await delay();
      const dateReceived = Date.now().toString();
      const welcomeMessage: IChatMessage = {
        id: `AIMessage-${dateReceived}`,
        role: "assistant",
        content: EN.mock.ai_welcome_message,
        createdAt: dateReceived,
      };

      history.push(welcomeMessage);

      storageService.setStorage(STORAGE_KEYS.MOCK_CHAT_HISTORY_KEY, history);
    }

    return history;
  }

  public async resetChat(): Promise<void> {
    await delay();

    storageService.setStorage(STORAGE_KEYS.MOCK_CHAT_HISTORY_KEY, []);
  }

  private getChatsFromStorage(): IChatMessage[] {
    return storageService.getStorage(STORAGE_KEYS.MOCK_CHAT_HISTORY_KEY, []);
  }
}

export const aiMock = new AIMock();
