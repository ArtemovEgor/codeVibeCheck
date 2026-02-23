import type { IBaseComponentConfig } from "@/types/types";

export default class BaseComponent<T extends HTMLElement = HTMLElement> {
  private readonly node: T;
  private listeners: (() => void)[] = [];
  private children: BaseComponent<HTMLElement>[] = [];

  constructor({
    tag = "div",
    className = "",
    id = "",
    text = "",
    parent,
    children = [],
  }: IBaseComponentConfig = {}) {
    this.node = document.createElement(tag) as T;

    if (className) {
      const classList = className.split(" ").filter(Boolean);
      this.node.classList.add(...classList);
    }

    if (id) this.node.id = id;
    if (text) this.node.textContent = text;
    if (children.length > 0) this.addChildren(children);
    if (parent) this.addTo(parent);
  }

  public setText(text: string): this {
    this.node.textContent = text;
    return this;
  }

  public on<K extends keyof HTMLElementEventMap>(
    type: K,
    callback: (event: HTMLElementEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions,
  ): this {
    this.node.addEventListener(type, callback, options);
    this.listeners.push(() => this.node.removeEventListener(type, callback));
    return this;
  }

  public addTo(parent: HTMLElement | BaseComponent): this {
    const parentNode = parent instanceof BaseComponent ? parent.node : parent;
    parentNode.append(this.node);
    return this;
  }

  public addChildren(children: (HTMLElement | BaseComponent | null)[]): this {
    for (const child of children) {
      if (!child) continue;

      if (child instanceof BaseComponent) {
        this.children.push(child);
        this.node.append(child.node);
      } else {
        this.node.append(child);
      }
    }

    return this;
  }

  public toggleClass(className: string, state?: boolean): this {
    this.node.classList.toggle(className, state);
    return this;
  }

  public getNode(): T {
    return this.node;
  }

  public destroy(): void {
    for (const child of this.children) {
      child.destroy();
    }
    this.children = [];
    for (const removeEventListenerHandler of this.listeners) {
      removeEventListenerHandler();
    }
    this.listeners = [];
    this.node.remove();
  }
}
