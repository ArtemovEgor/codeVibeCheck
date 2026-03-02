import { INPUT_VALIDATION } from "@/constants/input-validation";
import { EN } from "@/locale/en";
import type { IFieldConfig } from "@/types/types";
import { BaseAuthForm } from "./base-auth-form";
import { authApi } from "@/api/auth.api";

export default class RegisterForm extends BaseAuthForm {
  constructor() {
    super("register-form");
  }

  protected getFieldConfigs(): IFieldConfig[] {
    return [
      {
        id: "register-name",
        type: "text",
        label: EN.common.auth.name,
        placeholder: EN.common.auth.name_placeholder,
        pattern: INPUT_VALIDATION.NAME,
        errorMessage: EN.common.validation.name_error,
        minLength: 2,
        maxLength: 40,
      },
      {
        id: "register-email",
        type: "email",
        label: EN.common.auth.email,
        placeholder: EN.common.auth.email_placeholder,
        pattern: INPUT_VALIDATION.EMAIL,
        errorMessage: EN.common.validation.email_error,
        minLength: 5,
        maxLength: 254,
      },
      {
        id: "register-password",
        type: "password",
        label: EN.common.auth.password,
        placeholder: EN.common.auth.password_placeholder,
        pattern: INPUT_VALIDATION.PASSWORD,
        errorMessage: EN.common.validation.password_error,
        minLength: 6,
        maxLength: 50,
      },
    ];
  }

  protected getSubmitButtonText(): string {
    return EN.common.auth.register_button;
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
