import { INPUT_VALIDATION } from "@/constants/input-validation";
import type { IFieldConfig } from "@/types/types";
import { BaseAuthForm } from "./base-auth-form";
import { authApi } from "@/api/auth.api";
import { i18n } from "@/services/localization-service.ts";

export default class LoginForm extends BaseAuthForm {
  constructor() {
    super("auth-form");
  }

  protected getFieldConfigs(): IFieldConfig[] {
    return [
      {
        id: "auth-email",
        type: "email",
        label: i18n.t().common.auth.email,
        placeholder: i18n.t().common.auth.email_placeholder,
        pattern: INPUT_VALIDATION.EMAIL,
        errorMessage: i18n.t().common.validation.email_error,
        minLength: 5,
        maxLength: 254,
      },
      {
        id: "auth-password",
        type: "password",
        label: i18n.t().common.auth.password,
        placeholder: i18n.t().common.auth.password_placeholder,
        pattern: INPUT_VALIDATION.PASSWORD,
        errorMessage: i18n.t().common.validation.password_error,
        minLength: 6,
        maxLength: 50,
      },
    ];
  }

  protected getSubmitButtonText(): string {
    return i18n.t().common.auth.login_button;
  }

  protected async handleSubmit(): Promise<void> {
    const email = this.getInputValue("auth-email");
    const password = this.getInputValue("auth-password");

    await authApi.login({
      email,
      password,
    });
  }
}
