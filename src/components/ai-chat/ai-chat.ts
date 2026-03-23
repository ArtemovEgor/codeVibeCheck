import type Page from "@/pages/page";
import BaseComponent from "../base/base-component";
import { aiApi } from "@/api/ai.api";
import Notification from "../notification/notification";
import { NotificationType } from "@/constants/notification";
import type {
  IApiError,
  IChatMessage,
  ISendMessagePayload,
} from "@/types/shared";
import { Button } from "../button/button";
import { ICONS } from "@/assets/icons";
import { EN } from "@/locale/en";
import { ChatRoles } from "@/constants/api-chat";
import { RESTART_TIMEOUT_MS, XP_THRESHOLDS } from "./ai-chat.constants";
import { renderMarkdown } from "@/utils/markdown";
import "./ai-chat.scss";
import "highlight.js/styles/tokyo-night-dark.css";

export default class AIChat extends BaseComponent implements Page {
  private messageHistory?: BaseComponent;
  private messagesContainer?: BaseComponent;
  private messageField?: BaseComponent<HTMLTextAreaElement>;
  private currentXp = 0;
  private xpValueElement?: BaseComponent;
  private sendButton?: Button;
  private stopButton?: Button;
  private abortController?: AbortController;
  private isInterviewOver = false;

  constructor() {
    super({
      tag: "div",
      className: "ai-chat",
    });

    this.init();
  }

  public async init(): Promise<void> {
    this.renderHeader();
    this.renderChatContainer();
    this.renderMessageField();
    this.blockInput(false);
    this.renderWelcome();
    await this.loadChatHistory();
  }

  private renderHeader(): void {
    const header = new BaseComponent({
      tag: "div",
      className: "ai-chat__header",
      parent: this,
    });

    this.renderControls(header);
  }

  private renderControls(parent: BaseComponent): void {
    const controlBlock = new BaseComponent({
      tag: "div",
      className: "ai-chat__controls",
      parent,
    });

    const xp = new BaseComponent({
      tag: "div",
      className: "chat-xp",
      parent: controlBlock,
    });

    new BaseComponent({
      tag: "span",
      className: "chat-xp__label",
      parent: xp,
      text: EN.ai_chat.xp,
    });

    this.xpValueElement = new BaseComponent({
      tag: "span",
      className: "chat-xp__value",
      parent: xp,
      text: String(this.currentXp),
    });

    this.renderRestartButton(controlBlock);
  }

  private renderRestartButton(parent: BaseComponent): void {
    let restartTimeout: ReturnType<typeof setTimeout> | undefined = undefined;

    const restartButton = new Button({
      parent,
      className: "ai-chat__restart-button",
      attributes: {
        "data-text": EN.ai_chat.restart_text,
      },
      onClick: async () => {
        const isHoverSupported =
          globalThis.matchMedia("(hover: hover)").matches;

        if (isHoverSupported) {
          await this.restartChat();
          return;
        }

        const controlsNode = parent.getNode();

        if (controlsNode.classList.contains("ai-chat__controls--primed")) {
          if (restartTimeout) clearTimeout(restartTimeout);
          controlsNode.classList.remove("ai-chat__controls--primed");
          this.restartChat();
        } else {
          controlsNode.classList.add("ai-chat__controls--primed");
          restartTimeout = setTimeout(() => {
            controlsNode.classList.remove("ai-chat__controls--primed");
          }, RESTART_TIMEOUT_MS);
        }
      },
    });
    const restartNode = restartButton.getNode();
    restartNode.innerHTML = ICONS.restart;
    restartNode.title = EN.ai_chat.restart_text;
  }

  private async restartChat(): Promise<void> {
    try {
      this.abortController?.abort();
      await aiApi.resetChat();

      this.isInterviewOver = false;
      this.blockInput(false);
      this.currentXp = 0;
      if (this.messagesContainer) {
        this.messagesContainer.getNode().replaceChildren();
      }

      this.renderWelcome();
      await this.loadChatHistory();
      this.updateXP();
    } catch (error) {
      const apiError = error as IApiError;
      Notification.show(apiError.message, NotificationType.ERROR);
    }
  }

  private renderChatContainer(): void {
    this.messageHistory = new BaseComponent({
      tag: "div",
      className: "ai-chat__history",
      parent: this,
    });

    this.messagesContainer = new BaseComponent({
      tag: "div",
      className: "ai-chat__history-inner",
      parent: this.messageHistory,
    });
  }

  private async loadChatHistory(): Promise<void> {
    try {
      const history = await aiApi.getChatHistory();

      this.handleChatHistory(history);
      this.updateXP();
    } catch (error) {
      const apiError = error as IApiError;
      Notification.show(apiError.message, NotificationType.ERROR);
    }
  }

  private renderWelcome(): void {
    const messageWrapper = this.renderMessage({
      id: "",
      role: "assistant",
      content: "",
      createdAt: "",
    });

    const content = messageWrapper
      .getNode()
      .querySelector(".chat-message__content");

    if (content) content.innerHTML = renderMarkdown(EN.ai_chat.welcome);
  }

  private handleChatHistory(chatHistory: IChatMessage[]): void {
    for (const message of chatHistory) {
      if (message.role === "system") {
        if (message.content.startsWith("[SUMMARY]\n")) {
          continue;
        }
        if (message.content.startsWith("[FINAL_REPORT]\n")) {
          this.renderFinalReport(
            message.content.replace("[FINAL_REPORT]\n", ""),
          );
          continue;
        }
      }

      this.renderMessage(message);
      this.currentXp += message.xpAwarded || 0;
    }
    this.scrollToBottom(false);

    if (this.isInterviewOver) {
      this.blockInput(true);
      this.stopButton?.toggleClass("message-field__button--hidden", true);
    }
  }

  private scrollToBottom(smooth = true): void {
    if (this.messageHistory) {
      const node = this.messageHistory.getNode();
      node.scrollTo({
        top: node.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
    }
  }

  private renderMessage(message: IChatMessage): BaseComponent {
    const modifier =
      message.role === ChatRoles.assistant ? "incoming" : "outgoing";

    const wrapper = new BaseComponent({
      tag: "div",
      className: `chat-message chat-message--${modifier}`,
      parent: this.messagesContainer,
    });

    if (message.role === ChatRoles.assistant) {
      new BaseComponent({
        tag: "span",
        className: "chat-message__avatar",
        parent: wrapper,
        text: "</>",
      });
    }

    const contentElement = new BaseComponent({
      tag: "div",
      className: "chat-message__content",
      parent: wrapper,
    });

    contentElement.getNode().innerHTML = renderMarkdown(message.content);

    return wrapper;
  }

  private updateXP(): void {
    this.xpValueElement?.setText(String(this.currentXp));
  }

  private async syncXP(): Promise<void> {
    try {
      const history = await aiApi.getChatHistory();

      const actualTotalXp = history.reduce(
        (sum, message) => sum + (message.xpAwarded || 0),
        0,
      );

      const xpDelta = actualTotalXp - this.currentXp;

      if (xpDelta > 0) {
        this.addXP(xpDelta);
      }
    } catch (error) {
      console.warn("Failed to sync XP:", error);
    }
  }

  private addXP(xp: number) {
    this.currentXp += xp;
    this.updateXP();

    const xpContainer = this.xpValueElement?.getNode().parentElement;
    if (xpContainer) {
      xpContainer.classList.remove(
        "chat-xp--animate",
        "chat-xp--success",
        "chat-xp--warning",
        "chat-xp--error",
      );

      if (xp >= XP_THRESHOLDS.success) {
        xpContainer.classList.add("chat-xp--success");
      } else if (xp === XP_THRESHOLDS.warning) {
        xpContainer.classList.add("chat-xp--warning");
      } else if (xp > 0) {
        xpContainer.classList.add("chat-xp--error");
      }

      void xpContainer.offsetWidth;
      xpContainer.classList.add("chat-xp--animate");
    }
  }

  private renderMessageField(): void {
    const wrapper = new BaseComponent({
      tag: "div",
      className: "message-field",
      parent: this,
    });

    this.messageField = new BaseComponent<HTMLTextAreaElement>({
      tag: "textarea",
      className: "message-field__input",
      parent: wrapper,
    });

    const inputNode = this.messageField?.getNode();
    if (inputNode) {
      inputNode.placeholder = EN.ai_chat.input_placeholder;
      inputNode.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          this.handleSend();
        }
      });
    }

    wrapper.addChildren([this.createInputControls()]);
  }

  private createInputControls(): BaseComponent {
    const wrapper = new BaseComponent({
      tag: "div",
      className: "message-field__controls",
    });

    this.sendButton = new Button({
      className: "message-field__button message-field__button--send",
      parent: wrapper,
      onClick: () => this.handleSend(),
    });

    this.sendButton.getNode().innerHTML = ICONS.send;

    this.stopButton = new Button({
      className: "message-field__button message-field__button--stop",
      parent: wrapper,
      onClick: () => this.abortController?.abort(),
      variant: "danger",
    });

    this.stopButton.getNode().innerHTML = ICONS.stop;

    return wrapper;
  }

  private async handleSend(): Promise<void> {
    const content = this.messageField?.getNode().value;
    if (!content) return;

    if (this.messageField) {
      this.messageField.getNode().value = "";
    }

    this.renderMessage({
      id: "",
      role: ChatRoles.user,
      content,
      createdAt: new Date().toISOString(),
    });

    const responseContainer = this.renderMessage({
      id: "",
      role: ChatRoles.assistant,
      content: "",
      createdAt: new Date().toISOString(),
    })
      .getNode()
      .querySelector(".chat-message__content") as HTMLElement | undefined;

    this.scrollToBottom();
    this.blockInput(true);
    const abortSignal = this.createNewAbortSignal();

    try {
      await this.renderMessageText(
        responseContainer,
        { content },
        abortSignal,
        indicator,
      );
      await this.syncXP();
    } catch (error) {
      indicator.destroy();
      this.handleStreamError(error, responseContainer, content);
    } finally {
      this.finalizeSend();
    }
  }

  private finalizeSend(): void {
    this.scrollToBottom();
    if (this.isInterviewOver) {
      this.stopButton?.toggleClass("message-field__button--hidden", true);
    } else {
      this.blockInput(false);
    }
  }

  private handleStreamError(
    error: unknown,
    responseContainer: HTMLElement | undefined,
    content: string,
  ): void {
    if (error instanceof Error && error.name === "AbortError") {
      this.addStopNotice(responseContainer);
      if (this.messageField) this.messageField.getNode().value = content;
      return;
    }

    const apiError = error as IApiError;
    Notification.show(apiError.message, NotificationType.ERROR);
  }

  private createNewAbortSignal() {
    this.abortController?.abort();
    this.abortController = new AbortController();
    return this.abortController.signal;
  }

  private async renderMessageText(
    responseContainer: HTMLElement | undefined,
    { content }: ISendMessagePayload,
    abortSignal: AbortSignal,
    indicator: TypingIndicator,
  ): Promise<void> {
    this.scrollToBottom();
    let accumulated = "";
    let isFirstChunk = true;

    for await (const event of aiApi.sendChatMessage({ content }, abortSignal)) {
      if (isFirstChunk) {
        indicator.destroy();
        isFirstChunk = false;
      }

      if (event.type === "text_chunk") {
        accumulated += event.content;
        const html = renderMarkdown(accumulated);
        if (responseContainer) responseContainer.innerHTML = html;
        this.scrollToBottom();
      } else if (event.type === "final_report") {
        this.renderFinalReport(event.content);
      }
    }
  }

  private renderFinalReport(reportMarkdown: string): void {
    this.isInterviewOver = true;

    const wrapper = new BaseComponent({
      tag: "div",
      className: "chat-message chat-message--report",
      parent: this.messagesContainer,
    });

    const contentElement = new BaseComponent({
      tag: "div",
      className: "chat-message__content chat-message__content--report",
      parent: wrapper,
    });

    contentElement.getNode().innerHTML = renderMarkdown(reportMarkdown);
    this.scrollToBottom();
  }

  private blockInput(isBlocked: boolean): void {
    const inputNode = this.messageField?.getNode();
    if (inputNode) inputNode.disabled = isBlocked;

    this.sendButton?.toggleClass("message-field__button--hidden", isBlocked);
    this.stopButton?.toggleClass("message-field__button--hidden", !isBlocked);
  }

  private addStopNotice(container: HTMLElement | undefined) {
    const notice = new BaseComponent({
      tag: "p",
      className: "chat-message__stop-notice",
      text: EN.ai_chat.stop_generation,
    });

    container?.append(notice.getNode());
  }

  public destroy(): void {
    this.abortController?.abort();
    super.destroy();
  }
}
