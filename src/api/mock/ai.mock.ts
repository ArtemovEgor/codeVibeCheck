import type { IChatMessage, ISendMessagePayload } from "@/types/shared";
import { delay } from "./delay";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { storageService } from "../../services/storage-service";
import { EN } from "@/locale/en";
import { ChatRoles } from "@/constants/api-chat";
import { MOCK_XP_AWARD } from "@/constants/mock";
import { tokenizeString } from "@/utils/tokenize-string";

class AIMock {
  public async *sendChatMessage(
    message: ISendMessagePayload,
  ): AsyncGenerator<string> {
    const history = this.getChatsFromStorage();
    const dateSent = Date.now().toString();
    const content = message.content;

    const messageData: IChatMessage = {
      id: `UserMessage-${dateSent}`,
      role: ChatRoles.user,
      content,
      createdAt: dateSent,
    };

    history.push(messageData);
    storageService.setStorage(STORAGE_KEYS.MOCK_CHAT_HISTORY_KEY, history);

    await delay();

    yield* await this.handleResponse(EN.mock.ai_response + content);
  }

  public async getChatHistory(): Promise<IChatMessage[]> {
    await delay();
    return this.getChatsFromStorage();
  }

  public async resetChat(): Promise<void> {
    await delay();

    storageService.setStorage(STORAGE_KEYS.MOCK_CHAT_HISTORY_KEY, []);
  }

  private getChatsFromStorage(): IChatMessage[] {
    return storageService.getStorage(STORAGE_KEYS.MOCK_CHAT_HISTORY_KEY, []);
  }

  private async *handleResponse(message: string): AsyncGenerator<string> {
    let fullText = "";
    const tokens = tokenizeString(message);
    for (const token of tokens) {
      await delay(30);
      fullText += token;
      yield token;
    }

    const dateReceived = Date.now().toString();

    const responseData: IChatMessage = {
      id: `AIMessage-${dateReceived}`,
      role: ChatRoles.assistant,
      content: fullText,
      createdAt: dateReceived,
      xpAwarded: MOCK_XP_AWARD,
    };

    const history = this.getChatsFromStorage();
    history.push(responseData);
    storageService.setStorage(STORAGE_KEYS.MOCK_CHAT_HISTORY_KEY, history);
  }
}

export const aiMock = new AIMock();
