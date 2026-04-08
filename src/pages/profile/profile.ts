import BaseComponent from "@/components/base/base-component";
import type Page from "../page";
import { i18n } from "@/services/localization-service";
// import Notification from "@/components/notification/notification";
// import { NotificationType } from "@/constants/notification";
// import { Button } from "@/components/button/button";
import "./profile.scss";

export class ProfilePage extends BaseComponent implements Page {
  constructor() {
    super({ tag: "div", className: "profile" });
    void this.init();
  }

  public async init(): Promise<void> {
    this.render();
  }

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
      text: "A",
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
    const nameWrapper = new BaseComponent({
      className: "profile__name-wrapper",
      parent: parent,
    });

    new BaseComponent({
      className: "profile__name-title-wrapper",
      text: i18n.t().profile.name,
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
        id: "user-name-input",
        type: "text",
        Value: "Alex",
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
      console.log("Change Name");
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
        value: "alex@test.com",
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

  public destroy(): void {
    super.destroy();
  }
}
