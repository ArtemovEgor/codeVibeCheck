import { renderAuthField } from "@/components/auth-form/create-auth-field";
import BaseComponent from "../base/base-component";
import { EN } from "@/locale/en";
import { Button } from "../button/button";
import { ROUTES } from "@/constants/routes";
import { router } from "@/router/router";
import { NotificationType } from "@/constants/notification";
import Notification from "../notification/notification";
import "./auth-form.scss";
import type { IFieldConfig } from "@/types/types";
import type { IApiError } from "../../types/shared/api.types";

export abstract class BaseAuthForm extends BaseComponent<HTMLFormElement> {
  private fields = new Map<
    string,
    { input: HTMLInputElement; error: HTMLElement; pattern: string }
  >();

  protected submitButton?: Button;

  constructor(className: string) {
    super({
      tag: "form",
      className,
    });

    this.renderFields();
    this.renderSubmitButton();
    this.initListeners();
  }

  protected abstract getFieldConfigs(): IFieldConfig[];

  protected abstract getSubmitButtonText(): string;

  protected abstract handleSubmit(): Promise<void>;

  private renderFields(): void {
    for (const config of this.getFieldConfigs()) {
      const { input, error } = renderAuthField({
        parent: this,
        classNames: {
          div: `form-field form-field--${config.id}`,
          label: "form-field__label",
          input: "form-field__input",
          error: "form-field__error",
        },
        id: config.id,
        type: config.type,
        labelText: config.label,
        placeholderText: config.placeholder,
        validationAttributes: {
          minLength: config.minLength,
          maxLength: config.maxLength,
          errorText: config.errorMessage,
        },
      });

      const [inputNode, errorNode] = [input.getNode(), error.getNode()];

      this.fields.set(config.id, {
        input: inputNode,
        error: errorNode,
        pattern: config.pattern,
      });

      input.on("input", () => this.validateActiveField(config.id));
    }
  }

  private renderSubmitButton(): void {
    this.submitButton = new Button({
      text: this.getSubmitButtonText(),
      className: "button--submit",
      attributes: { disabled: "" },
      parent: this,
    });
  }

  private initListeners(): void {
    this.on("submit", (event) => {
      event.preventDefault();
      this.onSubmit();
    });
  }

  private validateActiveField(fieldId: string): void {
    const field = this.fields.get(fieldId);
    if (field) {
      this.validateField(field.input, field.error, field.pattern);
    }
    this.updateSubmitState();
  }

  protected validateForm(): void {
    for (const [, field] of this.fields) {
      this.validateField(field.input, field.error, field.pattern);
    }
    this.updateSubmitState();
  }

  private updateSubmitState(): void {
    if (!this.submitButton) return;

    let allValid = true;
    for (const [, field] of this.fields) {
      const regex = new RegExp(field.pattern, "u");
      if (!field.input.checkValidity() || !regex.test(field.input.value)) {
        allValid = false;
      }
    }
    this.submitButton.getNode().disabled = !allValid;
  }

  private validateField(
    input: HTMLInputElement,
    errorElement: HTMLElement,
    pattern: string,
  ): boolean {
    input.setCustomValidity("");

    if (!input.checkValidity()) {
      this.showError(input, errorElement, this.getErrorMessage(input));
      return false;
    }

    const regex = new RegExp(pattern, "u");
    if (!regex.test(input.value)) {
      const message =
        input.dataset.errorText || EN.common.validation.default_error;
      this.showError(input, errorElement, message);
      return false;
    }

    this.hideError(input, errorElement);
    return true;
  }

  private getErrorMessage(input: HTMLInputElement): string {
    const { validity } = input;

    if (validity.valueMissing) return EN.common.validation.empty;

    if (input.type === "email" && input.dataset.errorText) {
      return input.dataset.errorText;
    }

    if (validity.tooShort) {
      return `${EN.common.validation.too_short} ${input.minLength} ${EN.common.validation.characters}`;
    }

    if (validity.tooLong) {
      return `${EN.common.validation.too_long} ${input.maxLength} ${EN.common.validation.characters}`;
    }

    if (validity.typeMismatch || validity.patternMismatch) {
      return input.dataset.errorText || EN.common.validation.default_error;
    }

    return input.validationMessage;
  }

  private showError(
    input: HTMLInputElement,
    errorElement: HTMLElement,
    message: string,
  ): void {
    input.closest(".form-field")?.classList.add("form-field--invalid");
    errorElement.classList.add("form-field__error--visible");
    errorElement.textContent = message;
  }

  private hideError(input: HTMLInputElement, errorElement: HTMLElement): void {
    input.closest(".form-field")?.classList.remove("form-field--invalid");
    errorElement.classList.remove("form-field__error--visible");
    errorElement.textContent = "";
  }

  protected getInputValue(fieldId: string): string {
    return this.fields.get(fieldId)?.input.value ?? "";
  }

  private async onSubmit(): Promise<void> {
    if (!this.submitButton) return;

    this.submitButton.getNode().disabled = true;

    try {
      await this.handleSubmit();
      router.navigate(ROUTES.DASHBOARD);
    } catch (error) {
      const apiError = error as IApiError;
      Notification.show(apiError.message, NotificationType.ERROR);
    } finally {
      this.validateForm();
    }
  }
}
