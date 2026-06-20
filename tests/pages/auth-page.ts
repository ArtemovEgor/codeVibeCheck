import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./base-page";
import type { ILoginCredentials } from "../../backend/src/types";
import { expect } from "@playwright/test";

export class AuthPage extends BasePage {
  private readonly loginButton: Locator;
  private readonly registerButton: Locator;
  readonly loginForm: Locator;
  readonly registerForm: Locator;
  readonly loginSubmitButton: Locator;
  readonly registerSubmitButton: Locator;
  readonly authErrors: { email: Locator; password: Locator };
  readonly registrationErrors: {
    name: Locator;
    email: Locator;
    password: Locator;
  };

  constructor(page: Page) {
    super(page);
    this.loginButton = page.getByTestId("auth-switch__login");
    this.registerButton = page.getByTestId("auth-switch__register");
    this.loginForm = page.getByTestId("auth-form");
    this.registerForm = page.getByTestId("register-form");
    this.loginSubmitButton = this.loginForm.getByTestId("auth-form-btn");
    this.registerSubmitButton =
      this.registerForm.getByTestId("register-form-btn");
    this.authErrors = {
      email: this.loginForm.getByTestId("auth-email-error"),
      password: this.loginForm.getByTestId("auth-password-error"),
    };
    this.registrationErrors = {
      name: this.registerForm.getByTestId("register-name-error"),
      email: this.registerForm.getByTestId("register-email-error"),
      password: this.registerForm.getByTestId("register-password-error"),
    };
  }

  async switchTab(tab: "login" | "register") {
    if (tab === "login") {
      await this.loginButton.click();
    } else if (tab === "register") {
      await this.registerButton.click();
    }
  }

  async fillField(fieldTestId: string, value: string) {
    const field = this.page.getByTestId(fieldTestId);
    await field.fill(value);
  }

  async fillLoginForm(email: string, password: string) {
    await this.switchTab("login");
    await this.fillField("auth-email", email);
    await this.fillField("auth-password", password);
  }

  async validateLoginForm() {
    await Promise.all([
      this.loginForm.getByTestId("auth-email").dispatchEvent("input"),
      this.loginForm.getByTestId("auth-password").dispatchEvent("input"),
    ]);
  }

  async fillRegistrationForm(name: string, email: string, password: string) {
    await this.switchTab("register");
    await this.fillField("register-name", name);
    await this.fillField("register-email", email);
    await this.fillField("register-password", password);
  }

  async submitLogin() {
    await this.loginSubmitButton.click();
  }

  async submitRegistration() {
    await this.registerSubmitButton.click();
  }

  async authorize(action: "login" | "register") {
    const endpoint = `/api/auth/${action}`;
    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.url().includes(endpoint) &&
        response.status() >= 200 &&
        response.status() < 300,
    );

    const submitButton = (await this.loginForm.isVisible())
      ? this.loginSubmitButton
      : this.registerSubmitButton;

    await submitButton.click();

    await responsePromise;
  }

  async login(credentials: ILoginCredentials) {
    if (!this.loginForm) {
      await this.loginButton.click();
    }
    await expect(this.loginForm).toBeVisible();

    await this.fillLoginForm(credentials.email, credentials.password);

    await this.authorize("login");
  }

  async getCurrentLanguage() {
    return this.page.locator("html").getAttribute("lang");
  }
}
