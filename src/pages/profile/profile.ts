import type { IUser, IApiError } from "@/types/shared";
import type { IValidationResult } from "@/types/shared/profile";
import type Page from "../page";

import BaseComponent from "@/components/base/base-component";
import { i18n } from "@/services/localization-service";
import Notification from "@/components/notification/notification";
import { NotificationType } from "@/constants/notification";
import { INPUT_VALIDATION } from "@/constants/input-validation";
import { authApi } from "@/api/auth.api";
import "./profile.scss";

export class ProfilePage extends BaseComponent implements Page {
  private user: IUser | undefined = undefined;
  private userInitials = "";

  private NAME_REGEX = new RegExp(INPUT_VALIDATION.NAME, "u");

  private nameInput!: BaseComponent<HTMLInputElement>;
  private nameChangeBtn!: BaseComponent<HTMLInputElement>;
  private nameWrapper!: BaseComponent<HTMLInputElement>;
  private nameError!: BaseComponent<HTMLInputElement>;

  constructor() {
    super({ tag: "div", className: "profile" });
    void this.init();
  }

  public async init(): Promise<void> {
    await this.loadUser();
    this.render();
    this.eventsInit();
  }

  private async loadUser(): Promise<void> {
    try {
      this.user = await authApi.getCurrentUser();
      this.getUserInitials();
      console.log(this.user);
    } catch (error) {
      const apiError = error as IApiError;
      Notification.show(apiError.message, NotificationType.ERROR);
    }
  }

  private getUserInitials(): void {
    if (this.user?.name) {
      this.userInitials = this.user.name
        .split(" ")
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase();
    }
  }

  // Renders
  private render(): void {
    this.getNode().replaceChildren();
    this.renderTitle();
    this.renderMainContent();
  }

  private renderTitle(): void {
    new BaseComponent({
      tag: "h1",
      text: i18n.t().profile.title,
      className: "profile__title",
      parent: this,
    });
  }

  private renderMainContent(): void {
    const wrapper = new BaseComponent({
      className: "profile__content-wrapper",
      parent: this,
    });
    this.renderLeftColumn(wrapper);
    this.renderRightColumn(wrapper);
  }

  private renderLeftColumn(parent: BaseComponent): void {
    const leftCol = new BaseComponent({
      className: "profile__left-column",
      parent: parent,
    });
    this.renderAvatarBlock(leftCol);
    this.renderDivider(leftCol);
    this.renderNameBlock(leftCol);
  }

  private renderAvatarBlock(parent: BaseComponent): void {
    const avatarBlock = new BaseComponent({
      className: "profile__avatar-block",
      parent: parent,
    });

    new BaseComponent({
      className: "profile__avatar",
      parent: avatarBlock,
      text: this.userInitials,
    });

    const changeAvatar = new BaseComponent({
      tag: "label",
      className: "profile__avatar-button",
      text: i18n.t().profile.changeAvatar,
      attributes: {
        for: "file-upload",
      },
      parent: avatarBlock,
    });

    new BaseComponent({
      tag: "input",
      className: "profile__avatar-file-input",
      attributes: {
        id: "file-upload",
        type: "file",
      },
      parent: avatarBlock,
    });

    changeAvatar.on("click", () => {
      console.log("Change Avatar");
    });
  }

  private renderDivider(parent: BaseComponent): void {
    new BaseComponent({
      className: "profile__divider",
      parent: parent,
    });
  }

  private renderNameBlock(parent: BaseComponent): void {
    const nameBlock = new BaseComponent({
      className: "profile__name-block",
      parent: parent,
    });

    this.renderNameChanger(nameBlock);
    this.renderMailChanger(nameBlock);
  }

  private renderNameChanger(parent: BaseComponent): void {
    this.nameWrapper = new BaseComponent({
      className: "profile__name-wrapper",
      parent: parent,
    });

    new BaseComponent({
      className: "profile__name-title-wrapper",
      text: i18n.t().profile.name,
      parent: this.nameWrapper,
    });

    const nameInputWrapper = new BaseComponent({
      className: "profile__name-input-wrapper",
      parent: this.nameWrapper,
    });

    this.nameInput = new BaseComponent({
      tag: "input",
      className: "profile__name-input",
      attributes: {
        id: "user-name-input",
        type: "text",
        Value: this.user?.name as string,
      },
      parent: nameInputWrapper,
    });

    this.nameChangeBtn = new BaseComponent({
      tag: "button",
      className: "profile__name-change-button",
      text: i18n.t().profile.change,
      parent: nameInputWrapper,
    });

    this.nameError = new BaseComponent({
      className: "profile__name-error",
      parent: this.nameWrapper,
    });
  }

  private renderMailChanger(parent: BaseComponent): void {
    const nameWrapper = new BaseComponent({
      className: "profile__name-wrapper",
      parent: parent,
    });

    new BaseComponent({
      className: "profile__name-title-wrapper",
      text: i18n.t().profile.email,
      parent: nameWrapper,
    });

    const nameInputWrapper = new BaseComponent({
      className: "profile__name-input-wrapper",
      parent: nameWrapper,
    });

    new BaseComponent({
      tag: "input",
      className: "profile__name-input",
      attributes: {
        id: "user-mail-input",
        type: "text",
        value: this.user?.email as string,
      },
      parent: nameInputWrapper,
    });

    const nameChange = new BaseComponent({
      tag: "button",
      className: "profile__name-change-button",
      text: i18n.t().profile.change,
      parent: nameInputWrapper,
    });

    nameChange.on("click", () => {
      console.log("Change Mail");
    });
  }

  private renderRightColumn(parent: BaseComponent): void {
    const rightCol = new BaseComponent({
      className: "profile__right-column",
      parent: parent,
    });

    this.renderRightColTitle(rightCol);
    this.renderPasswd(rightCol);
    this.renderConfirmPasswd(rightCol);
  }

  private renderRightColTitle(parent: BaseComponent): void {
    new BaseComponent({
      tag: "h2",
      className: "profile__right-column-title",
      text: i18n.t().profile.changePassword,
      parent: parent,
    });
  }

  private renderPasswd(parent: BaseComponent): void {
    new BaseComponent({
      className: "profile__right-column-label",
      text: i18n.t().profile.newPassword,
      parent: parent,
    });

    new BaseComponent({
      tag: "input",
      className: "profile__passwd",
      attributes: {
        id: "profile-passwd",
        type: "password",
        placeholder: "******",
      },
      parent: parent,
    });
  }

  private renderConfirmPasswd(parent: BaseComponent): void {
    new BaseComponent({
      className: "profile__right-column-label",
      text: i18n.t().profile.confirmPassword,
      parent: parent,
    });

    new BaseComponent({
      tag: "input",
      className: "profile__passwd",
      attributes: {
        id: "profile-confirm-passwd",
        type: "password",
        placeholder: "******",
      },
      parent: parent,
    });

    const changePasswd = new BaseComponent({
      tag: "button",
      className: "profile__change-passwd-button",
      text: i18n.t().profile.changePassword,
      parent: parent,
    });

    changePasswd.on("click", () => {
      console.log("Change Password");
    });
  }

  private validateName(value: string): IValidationResult {
    const MIN_LENGTH = 2;
    const MAX_LENGTH = 30;

    if (!value.trim()) {
      return { success: false, message: i18n.t().common.validation.empty };
    }

    if (value.length < MIN_LENGTH || value.length > MAX_LENGTH) {
      return {
        success: false,
        message: `${i18n.t().common.validation.too_short}: ${MIN_LENGTH},  ${i18n.t().common.validation.too_long}: ${MAX_LENGTH}`,
      };
    }

    if (!this.NAME_REGEX.test(value)) {
      return {
        success: false,
        message: i18n.t().common.validation.name_error,
      };
    }

    return { success: true, message: "" };
  }

  // Events
  private eventsInit() {
    this.nameInput.on("input", () => {
      const inputElement = this.nameInput.getNode();
      const validateResult = this.validateName(inputElement.value);

      if (validateResult.success) {
        this.nameWrapper.toggleClass("error", false);
        this.nameError.setText("");
      } else {
        this.nameWrapper.toggleClass("error", true);
        this.nameError.setText(validateResult.message);
      }
    });

    this.nameChangeBtn.on("click", () => {
      console.log("Change Name");
    });
  }

  public destroy(): void {
    super.destroy();
  }
}
