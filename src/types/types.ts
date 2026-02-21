import type BaseComponent from "@/components/base/base-component";

export interface IBaseComponentConfig {
  tag?: keyof HTMLElementTagNameMap;
  className?: string;
  id?: string;
  text?: string;
  parent?: HTMLElement | BaseComponent<HTMLElement>;
  children?: (HTMLElement | BaseComponent<HTMLElement> | null)[];
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
