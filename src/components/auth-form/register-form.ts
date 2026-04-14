import { INPUT_VALIDATION } from "@/constants/input-validation";
import type { IFieldConfig } from "@/types/types";
import { BaseAuthForm } from "./base-auth-form";
import { authApi } from "@/api/auth.api";
import { i18n } from "@/services/localization-service.ts";

export default class RegisterForm extends BaseAuthForm {
  constructor() {
    super("register-form");
  }

  protected getFieldConfigs(): IFieldConfig[] {
    return [
      {
        id: "register-name",
        type: "text",
        label: i18n.t().common.auth.name,
        placeholder: i18n.t().common.auth.name_placeholder,
        pattern: INPUT_VALIDATION.NAME,
        errorMessage: i18n.t().common.validation.name_error,
        minLength: 2,
        maxLength: 40,
      },
      {
        id: "register-email",
        type: "email",
        label: i18n.t().common.auth.email,
        placeholder: i18n.t().common.auth.email_placeholder,
        pattern: INPUT_VALIDATION.EMAIL,
        errorMessage: i18n.t().common.validation.email_error,
        minLength: 5,
        maxLength: 254,
      },
      {
        id: "register-password",
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
    return i18n.t().common.auth.register_button;
  }

  protected async handleSubmit(): Promise<void> {
    const name = this.getInputValue("register-name");
    const email = this.getInputValue("register-email");
    const password = this.getInputValue("register-password");

    await authApi.register({
      name,
      email,
      password,
    });
  }
}
