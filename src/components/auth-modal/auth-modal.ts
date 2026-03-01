import { EN } from "@/locale/en";
import BaseComponent from "../base/base-component";
import Modal from "../modal/modal";
import LoginForm from "../auth-form/login-form";
import RegisterForm from "../auth-form/register-form";
import "./auth-modal.scss";
import type { BaseAuthForm } from "../auth-form/base-auth-form";

type AuthTab = "login" | "register";

export default class AuthModal extends Modal {
  declare content;
  private form: BaseComponent | undefined = undefined;
  private currentTab: AuthTab;
  private loginTabButton: BaseComponent<HTMLButtonElement> | undefined =
    undefined;
  private registerTabButton: BaseComponent<HTMLButtonElement> | undefined =
    undefined;

  constructor(tab: AuthTab = "login") {
    super("modal modal--auth");
    this.currentTab = tab;
    this.render(this.currentTab);
  }

  private render(tab: AuthTab): void {
    this.renderSwitch();
    this.renderForm(tab);
  }

  private renderSwitch(): void {
    const tabSwitch = new BaseComponent({
      tag: "div",
      className: "auth-switch",
      parent: this.content,
    });

    this.loginTabButton = new BaseComponent<HTMLButtonElement>({
      tag: "button",
      text: EN.common.auth.login,
      className: "auth-switch__tab",
    });
    this.loginTabButton.on("click", () => this.showTab("login"));

    this.registerTabButton = new BaseComponent<HTMLButtonElement>({
      tag: "button",
      text: EN.common.auth.signup,
      className: "auth-switch__tab",
    });
    this.registerTabButton.on("click", () => this.showTab("register"));

    tabSwitch.addChildren([this.loginTabButton, this.registerTabButton]);

    this.activateTabButton(this.currentTab);
  }

  private showTab(tab: AuthTab): void {
    if (tab === this.currentTab) return;
    this.currentTab = tab;
    this.activateTabButton(tab);

    const formNode = this.form?.getNode();
    const form: BaseAuthForm =
      tab === "register" ? new RegisterForm() : new LoginForm();

    formNode?.replaceChildren(form.getNode());
  }

  private activateTabButton(tab: AuthTab): void {
    this.loginTabButton?.toggleClass(
      "auth-switch__tab--active",
      tab === "login",
    );
    this.registerTabButton?.toggleClass(
      "auth-switch__tab--active",
      tab === "register",
    );
  }

  private renderForm(tab: AuthTab): void {
    this.form = new BaseComponent({
      tag: "div",
      className: "form-wrapper",
      parent: this.content,
    });

    if (tab === "register") {
      this.form.addChildren([new RegisterForm()]);
    } else {
      this.form.addChildren([new LoginForm()]);
    }
  }
}
