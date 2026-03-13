import type { IChatMessage, ISendMessagePayload } from "@/types/shared";
import { delay } from "./delay";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { storageService } from "../../services/storage-service";
import { EN } from "@/locale/en";
import { ChatRoles } from "@/constants/api-chat";
import { MOCK_STREAM_DELAY, MOCK_XP_AWARD } from "@/constants/mock";
import { tokenizeString } from "@/utils/tokenize-string";

class AIMock {
  private currentMessageIndex = 0;

  public async *sendChatMessage(
    { content }: ISendMessagePayload,
    abortSignal?: AbortSignal,
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

    abortSignal?.throwIfAborted();

    await delay();

    const text = EN.mock.ai_response[this.currentMessageIndex];
    if (this.currentMessageIndex < EN.mock.ai_response.length - 1) {
      this.currentMessageIndex += 1;
    } else {
      this.currentMessageIndex = 0;
    }

    yield* await this.handleResponse(text, abortSignal);
  }

  public async getChatHistory(): Promise<IChatMessage[]> {
    await delay();
    return this.getChatsFromStorage();
  }

  public async resetChat(): Promise<void> {
    await delay();
    this.currentMessageIndex = 0;
    storageService.setStorage(STORAGE_KEYS.MOCK_CHAT_HISTORY_KEY, []);
  }

  private getChatsFromStorage(): IChatMessage[] {
    return storageService.getStorage(STORAGE_KEYS.MOCK_CHAT_HISTORY_KEY, []);
  }

  private async *handleResponse(
    message: string,
    abortSignal?: AbortSignal,
  ): AsyncGenerator<string> {
    let fullText = "";
    const tokens = tokenizeString(message);
    for (const token of tokens) {
      abortSignal?.throwIfAborted();
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
