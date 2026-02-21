export interface BaseComponentProperties {
  tag?: keyof HTMLElementTagNameMap;
  classNames?: string[];
  id?: string;
  textContent?: string;
  parentNode?: HTMLElement | BaseComponent;
  attributes?: Record<string, string>;
}

export default class BaseComponent<T extends HTMLElement = HTMLElement> {
  private element: T;

  constructor({
    tag = "div",
    classNames = [],
    id = "",
    textContent = "",
    parentNode,
    attributes,
  }: BaseComponentProperties) {
    this.element = document.createElement(tag) as T;

    if (classNames.length > 0) this.element.classList.add(...classNames);
    if (id.length > 0) this.element.id = id;
    if (textContent.length > 0) this.element.textContent = textContent;
    if (parentNode) parentNode.append(this.element);

    if (attributes && Object.keys(attributes).length > 0) {
      for (const [key, value] of Object.entries(attributes)) {
        this.element.setAttribute(key, value);
      }
    }
  }

  public getNode(): T {
    return this.element;
  }

  public append(child: BaseComponent | HTMLElement): void {
    if (child instanceof BaseComponent) {
      this.element.append(child.getNode());
    } else {
      this.element.append(child);
    }
  }

  public appendChildren(children: BaseComponent[] | HTMLElement[]): void {
    for (const child of children) this.append(child);
  }

  public addEventListener(
    event: string,
    callback: (event: Event) => void,
  ): void {
    this.element.addEventListener(event, callback);
  }

  public destroy(): void {
    this.element.remove();
  }
}
