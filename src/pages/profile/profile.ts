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
  private MAIL_REGEX = new RegExp(INPUT_VALIDATION.EMAIL, "u");
  private PASSWORD_REGEX = new RegExp(INPUT_VALIDATION.PASSWORD, "u");

  private nameInput!: BaseComponent<HTMLInputElement>;
  private nameChangeBtn!: BaseComponent<HTMLButtonElement>;
  private nameWrapper!: BaseComponent<HTMLInputElement>;
  private nameError!: BaseComponent<HTMLInputElement>;

  private mailInput!: BaseComponent<HTMLInputElement>;
  private mailChangeBtn!: BaseComponent<HTMLButtonElement>;
  private mailWrapper!: BaseComponent<HTMLInputElement>;
  private mailError!: BaseComponent<HTMLInputElement>;

  private rightColumn!: BaseComponent<HTMLInputElement>;
  private passwdWrapper!: BaseComponent<HTMLInputElement>;
  private passwdInput!: BaseComponent<HTMLInputElement>;
  private passwdError!: BaseComponent<HTMLInputElement>;
  private confirmPasswdWrapper!: BaseComponent<HTMLInputElement>;
  private confirmPasswdInput!: BaseComponent<HTMLInputElement>;
  private confirmPasswdError!: BaseComponent<HTMLInputElement>;
  private changePasswd!: BaseComponent<HTMLButtonElement>;
  private newPassValue = "";

  constructor() {
    super({ tag: "div", className: "profile" });
    void this.init();
  }

  public async init(): Promise<void> {
    await this.loadUser();
    this.render();
    this.nameEventInit();
    this.mailEventInit();
    this.passwordEventInit();
    this.confirmPasswordEventInit();
    this.changeNameInit();
  }

  private async loadUser(): Promise<void> {
    try {
      this.user = await authApi.getCurrentUser();
      this.getUserInitials();
      // console.log(this.user);
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
      className: "profile__name-change-button disabled",
      text: i18n.t().profile.change,
      parent: nameInputWrapper,
    });

    this.nameError = new BaseComponent({
      className: "profile__name-error",
      parent: this.nameWrapper,
    });
  }

  private renderMailChanger(parent: BaseComponent): void {
    this.mailWrapper = new BaseComponent({
      className: "profile__mail-wrapper",
      parent: parent,
    });

    new BaseComponent({
      className: "profile__mail-title-wrapper",
      text: i18n.t().profile.email,
      parent: this.mailWrapper,
    });

    const mailInputWrapper = new BaseComponent({
      className: "profile__mail-input-wrapper",
      parent: this.mailWrapper,
    });

    this.mailInput = new BaseComponent({
      tag: "input",
      className: "profile__mail-input",
      attributes: {
        id: "user-mail-input",
        type: "text",
        value: this.user?.email as string,
      },
      parent: mailInputWrapper,
    });

    this.mailChangeBtn = new BaseComponent({
      tag: "button",
      className: "profile__mail-change-button disabled",
      text: i18n.t().profile.change,
      parent: mailInputWrapper,
    });

    this.mailError = new BaseComponent({
      className: "profile__mail-error",
      parent: this.mailWrapper,
    });
  }

  private renderRightColumn(parent: BaseComponent): void {
    this.rightColumn = new BaseComponent({
      className: "profile__right-column",
      parent: parent,
    });

    this.renderRightColTitle(this.rightColumn);
    this.renderPasswd(this.rightColumn);
    this.renderConfirmPasswd(this.rightColumn);
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
    this.passwdWrapper = new BaseComponent({
      className: "profile__password-wrapper",
      parent: parent,
    });

    new BaseComponent({
      className: "profile__right-column-label",
      text: i18n.t().profile.newPassword,
      parent: this.passwdWrapper,
    });

    this.passwdInput = new BaseComponent({
      tag: "input",
      className: "profile__passwd",
      attributes: {
        id: "profile-passwd",
        type: "password",
        placeholder: "******",
      },
      parent: this.passwdWrapper,
    });

    this.passwdError = new BaseComponent({
      className: "profile__passwd-error",
      parent: this.passwdWrapper,
    });
  }

  private renderConfirmPasswd(parent: BaseComponent): void {
    this.confirmPasswdWrapper = new BaseComponent({
      className: "profile__confirm-password-wrapper",
      parent: parent,
    });

    new BaseComponent({
      className: "profile__right-column-label",
      text: i18n.t().profile.confirmPassword,
      parent: this.confirmPasswdWrapper,
    });

    this.confirmPasswdInput = new BaseComponent({
      tag: "input",
      className: "profile__passwd",
      attributes: {
        id: "profile-confirm-passwd",
        type: "password",
        placeholder: "******",
      },
      parent: this.confirmPasswdWrapper,
    });

    this.confirmPasswdError = new BaseComponent({
      className: "profile__passwd-error",
      parent: this.confirmPasswdWrapper,
    });

    this.changePasswd = new BaseComponent({
      tag: "button",
      className: "profile__change-passwd-button disabled",
      text: i18n.t().profile.changePassword,
      parent: parent,
    });
  }

  // Helpers
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

  private validateMail(value: string): IValidationResult {
    const MAX_LENGTH = 254;

    if (!value.trim()) {
      return { success: false, message: i18n.t().common.validation.empty };
    }

    if (value.length > MAX_LENGTH) {
      return {
        success: false,
        message: `${i18n.t().common.validation.too_long}: ${MAX_LENGTH}`,
      };
    }

    if (!this.MAIL_REGEX.test(value)) {
      return {
        success: false,
        message: i18n.t().common.validation.email_error,
      };
    }

    return { success: true, message: "" };
  }

  private validatePassword(value: string): IValidationResult {
    const MIN_LENGTH = 6;
    const MAX_LENGTH = 50;

    if (!value) {
      return {
        success: false,
        message: i18n.t().common.validation.empty,
      };
    }

    if (!this.PASSWORD_REGEX.test(value)) {
      return {
        success: false,
        message: `${i18n.t().common.validation.from} ${MIN_LENGTH} ${i18n.t().common.validation.to} ${MAX_LENGTH} ${i18n.t().common.validation.characters}`,
      };
    }

    return { success: true, message: "" };
  }

  private validatePasswordConfirm(
    mainPassword: string,
    confirmPassword: string,
  ): IValidationResult {
    if (!confirmPassword) {
      return {
        success: false,
        message: i18n.t().common.validation.empty,
      };
    }

    if (mainPassword !== confirmPassword) {
      return {
        success: false,
        message: i18n.t().common.validation.do_not_match,
      };
    }

    return { success: true, message: "" };
  }

  // Name change
  private async processNameChange(): Promise<void> {
    const newName = this.getNameInputValue();
    if (!this.isNameValidForSubmit(newName)) return;

    this.setNameChangeButtonLoading(true);
    try {
      const { name: updatedName } = await authApi.updateName(newName);
      this.applyNameUpdate(updatedName);
      Notification.show(
        i18n.t().profile.nameUpdateSuccess,
        NotificationType.SUCCESS,
      );
    } catch (error) {
      this.onNameChangeError(error as Error);
    } finally {
      this.setNameChangeButtonLoading(false);
    }
  }

  private getNameInputValue(): string {
    return this.nameInput.getNode().value.trim();
  }

  private isNameValidForSubmit(name: string): boolean {
    const validation = this.validateName(name);
    if (!validation.success) {
      this.nameWrapper.toggleClass("error", true);
      this.nameError.setText(validation.message);
      return false;
    }
    return true;
  }

  private setNameChangeButtonLoading(isLoading: boolean): void {
    const button = this.nameChangeBtn.getNode();
    if (isLoading) {
      button.textContent = i18n.t().profile.saving;
      this.nameChangeBtn.toggleClass("disabled", true);
    } else {
      button.textContent = i18n.t().profile.change;
      const isDisabled = this.user?.name === this.getNameInputValue();
      this.nameChangeBtn.toggleClass("disabled", isDisabled);
    }
  }

  private applyNameUpdate(updatedName: string): void {
    if (this.user) {
      this.user = { ...this.user, name: updatedName };
    }
    this.getUserInitials();

    const avatarElement = document.querySelector(".profile__avatar");
    if (avatarElement) avatarElement.textContent = this.userInitials;

    const sideBarUserNameElement = document.querySelector(".sidebar__username");

    if (sideBarUserNameElement) {
      sideBarUserNameElement.textContent = updatedName;
    }

    this.nameInput.getNode().value = updatedName;
    this.nameWrapper.toggleClass("error", false);
    this.nameError.setText("");
    this.nameChangeBtn.toggleClass("disabled", true);
  }

  private onNameChangeError(error: Error): void {
    Notification.show(
      error.message || i18n.t().profile.nameUpdateError,
      NotificationType.ERROR,
    );
    this.nameChangeBtn.toggleClass("disabled", false);
  }

  // Events
  private nameEventInit() {
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

      if (this.user?.name === inputElement.value) {
        this.nameChangeBtn.toggleClass("disabled", true);
      } else {
        this.nameChangeBtn.toggleClass("disabled", false);
      }
    });
  }

  private mailEventInit() {
    this.mailInput.on("input", () => {
      const inputElement = this.mailInput.getNode();
      const validateResult = this.validateMail(inputElement.value);

      if (validateResult.success) {
        this.mailWrapper.toggleClass("error", false);
        this.mailError.setText("");
      } else {
        this.mailWrapper.toggleClass("error", true);
        this.mailError.setText(validateResult.message);
      }

      if (this.user?.name === inputElement.value) {
        this.mailChangeBtn.toggleClass("disabled", true);
      } else {
        this.mailChangeBtn.toggleClass("disabled", false);
      }
    });

    this.mailChangeBtn.on("click", () => {
      console.log("Change Mail");
    });

    this.changePasswd.on("click", () => {
      console.log("Change Password");
    });
  }

  private passwordEventInit() {
    this.passwdInput.on("input", () => {
      const inputElement = this.passwdInput.getNode();
      const validateResult = this.validatePassword(inputElement.value);

      this.newPassValue = inputElement.value;

      if (validateResult.success) {
        this.passwdWrapper.toggleClass("error", false);
        this.passwdError.setText("");
      } else {
        this.passwdWrapper.toggleClass("error", true);
        this.passwdError.setText(validateResult.message);
      }
    });
  }

  private confirmPasswordEventInit() {
    this.confirmPasswdInput.on("input", () => {
      const inputElement = this.confirmPasswdInput.getNode();
      const validateResult = this.validatePasswordConfirm(
        this.newPassValue,
        inputElement.value,
      );

      if (validateResult.success) {
        this.confirmPasswdWrapper.toggleClass("error", false);
        this.confirmPasswdError.setText("");
        this.changePasswd.toggleClass("disabled", false);
      } else {
        this.confirmPasswdWrapper.toggleClass("error", true);
        this.confirmPasswdError.setText(validateResult.message);
        this.changePasswd.toggleClass("disabled", true);
      }
    });
  }

  private changeNameInit(): void {
    this.nameChangeBtn.on("click", async () => {
      await this.processNameChange();
    });
  }

  public destroy(): void {
    super.destroy();
  }
}
