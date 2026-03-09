import type Page from "@/pages/page";
import BaseComponent from "../base/base-component";
import { aiApi } from "@/api/ai.api";
import Notification from "../notification/notification";
import { NotificationType } from "@/constants/notification";
import type { IApiError, IChatMessage } from "@/types/shared";
import { Button } from "../button/button";
import { ICONS } from "@/assets/icons";
import "./ai-chat.scss";
import { EN } from "@/locale/en";
import { ChatRoles } from "@/constants/api-chat";
import { RESTART_TIMEOUT_MS, XP_THRESHOLDS } from "./ai-chat.constants";

export default class AIChat extends BaseComponent implements Page {
  private messageHistory: BaseComponent | undefined = undefined;
  private messagesContainer: BaseComponent | undefined = undefined;
  private messageField: BaseComponent<HTMLTextAreaElement> | undefined =
    undefined;
  private currentXp = 0;
  private xpValueElement: BaseComponent | undefined = undefined;

  constructor() {
    super({
      tag: "div",
      className: "ai-chat",
    });

    this.init();
  }

  public async init(): Promise<void> {
    this.renderHeader();
    await this.renderChat();
    this.renderMessageField();
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
      await aiApi.resetChat();
      const history = await aiApi.getChatHistory();

      this.currentXp = 0;
      if (this.messagesContainer) {
        this.messagesContainer.getNode().replaceChildren();
      }

      this.handleChatHistory(history);
      this.updateXP();
    } catch (error) {
      const apiError = error as IApiError;
      Notification.show(apiError.message, NotificationType.ERROR);
    }
  }

  private async renderChat(): Promise<void> {
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

    try {
      const history = await aiApi.getChatHistory();

      this.handleChatHistory(history);
      this.updateXP();
    } catch (error) {
      const apiError = error as IApiError;
      Notification.show(apiError.message, NotificationType.ERROR);
    }
  }

  private handleChatHistory(chatHistory: IChatMessage[]): void {
    for (const message of chatHistory) {
      this.renderMessage(message);
      this.currentXp += message.xpAwarded || 0;
    }
    this.scrollToBottom(false);
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

  private renderMessage(message: IChatMessage): void {
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

    new BaseComponent({
      tag: "p",
      className: "chat-message__content",
      parent: wrapper,
      text: message.content,
    });
  }

  private updateXP(): void {
    this.xpValueElement?.setText(String(this.currentXp));
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
      inputNode.placeholder = "Message AI...";
      inputNode.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          this.handleSend();
        }
      });
    }

    const sendButton = new Button({
      className: "message-field__button",
      parent: wrapper,
    });

    sendButton.getNode().innerHTML = ICONS.send;

    sendButton.on("click", () => {
      this.handleSend();
    });
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
    this.scrollToBottom();

    try {
      const response = await aiApi.sendChatMessage({
        content,
      });

      this.renderMessage(response.message);
      this.scrollToBottom();

      const xpAwarded = response.message.xpAwarded;

      if (xpAwarded) this.addXP(xpAwarded);
    } catch (error) {
      const apiError = error as IApiError;
      Notification.show(apiError.message, NotificationType.ERROR);
    }
  }
}
