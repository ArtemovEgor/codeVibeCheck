import type BaseComponent from "@/components/base/base-component";

export interface IBaseComponentConfig {
  tag?: keyof HTMLElementTagNameMap;
  className?: string;
  id?: string;
  text?: string;
  parent?: HTMLElement | BaseComponent<HTMLElement>;
  children?: (HTMLElement | BaseComponent<HTMLElement> | null)[];
  attributes?: Record<string, string>;
}

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export interface IClickableConfig extends Omit<IBaseComponentConfig, "tag"> {
  onClick?: (event: MouseEvent) => void;
  variant?: ButtonVariant;
}

export interface ILinkConfig extends IClickableConfig {
  href: string;
  isExternal?: boolean;
}

export interface IFieldConfig {
  id: string;
  type: string;
  label: string;
  placeholder: string;
  pattern: string;
  errorMessage: string;
  minLength: number;
  maxLength: number;
}
