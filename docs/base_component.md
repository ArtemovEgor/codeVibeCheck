# BaseComponent

Base class for all UI components. Wraps a DOM element, manages child components and event listeners. Every component in the app extends `BaseComponent`.

---

## Configuration Interface

```typescript
interface IBaseComponentConfig {
  tag?: keyof HTMLElementTagNameMap; // default: "div"
  className?: string; // space-separated class names
  id?: string;
  text?: string; // textContent
  parent?: HTMLElement | BaseComponent;
  children?: (HTMLElement | BaseComponent | null)[];
}
```

---

## Creating a Component

```typescript
// Minimal
const wrapper = new BaseComponent({ tag: "section", className: "hero" });

// With text and parent
const title = new BaseComponent({
  tag: "h1",
  className: "hero__title",
  text: "Hello",
  parent: wrapper,
});

// Multiple classes
const card = new BaseComponent({ className: "card card--active" });
```

---

## API

### `node: T`

Direct access to the underlying DOM element. Use when passing to native browser APIs.

```typescript
const input = new BaseComponent<HTMLInputElement>({ tag: "input" });
input.node.placeholder = "Type here...";
```

---

### `setText(text: string): this`

Sets `textContent`. Returns `this` for chaining.

```typescript
label.setText(t("btn_submit"));
```

---

### `on(type, callback, options?): this`

Attaches an event listener. Automatically removed on `destroy()`. Always use instead of `node.addEventListener`.

```typescript
btn.on("click", () => navigate("/register"));

// with options
input.on(
  "keydown",
  (e) => {
    if (e.key === "Enter") handleSubmit();
  },
  { once: true },
);
```

| Parameter  | Type                                 | Description                               |
| ---------- | ------------------------------------ | ----------------------------------------- |
| `type`     | `keyof HTMLElementEventMap`          | Event type — TypeScript will autocomplete |
| `callback` | `(event) => void`                    | Event handler                             |
| `options`  | `boolean \| AddEventListenerOptions` | Optional                                  |

---

### `addTo(parent: HTMLElement | BaseComponent): this`

Mounts the component into a parent. Accepts both `BaseComponent` and native `HTMLElement`.

```typescript
const btn = new BaseComponent({ tag: "button", text: "OK" });
btn.addTo(container);

// chaining
new BaseComponent({ tag: "button", text: "OK" })
  .on("click", handleClick)
  .addTo(container);
```

---

### `addChildren(children: (HTMLElement | BaseComponent | null)[]): this`

Appends child elements. `null` values are ignored — useful for conditional rendering.

```typescript
const isAdmin = false;

card.addChildren([
  new BaseComponent({ tag: "h3", text: "Title" }),
  isAdmin ? new Button({ text: "Delete", variant: "danger" }) : null,
]);
```

> ⚠️ Avoid passing raw `HTMLElement` — they won't be tracked by `destroy()`. Always wrap in `BaseComponent`.

---

### `toggleClass(className: string, state?: boolean): this`

Toggles a CSS class. `state` forces the value (`true` = add, `false` = remove).

```typescript
header.toggleClass("header--scrolled", window.scrollY > 20);
btn.toggleClass("btn--active"); // toggle
btn.toggleClass("btn--disabled", true); // force add
btn.toggleClass("btn--disabled", false); // force remove
```

---

### `getNode(): T`

Returns the underlying DOM element. Alternative to accessing `node` directly.

```typescript
const el = component.getNode();
```

---

### `destroy(): void`

Recursively destroys the component and all its children:

1. Calls `destroy()` on all tracked child `BaseComponent` instances
2. Removes all listeners registered via `on()`
3. Removes `node` from the DOM

```typescript
// on route change
currentPage?.destroy();
currentPage = new LibraryPage();
```

> Always call on route change, modal close, and widget unmount.

---

## Extending BaseComponent

All components extend `BaseComponent` and call `super()` in the constructor:

```typescript
export class QuizWidget extends BaseComponent {
  constructor(private data: QuizWidgetData) {
    super({ tag: "div", className: "widget widget--quiz" });
    this.render();
  }

  private render(): void {
    new BaseComponent({
      tag: "h2",
      className: "widget__question",
      text: t(this.data.payload.question),
      parent: this,
    });

    this.data.payload.options.forEach((opt, i) => {
      new BaseComponent({
        tag: "button",
        className: "widget__option",
        text: t(opt),
      })
        .on("click", () => this.handleAnswer(i))
        .addTo(this);
    });
  }

  // override destroy only if extra cleanup is needed
  public destroy(): void {
    // custom cleanup...
    super.destroy(); // always call super
  }
}
```

---

## Rules

| ✅ Do                                  | ❌ Don't                                            |
| -------------------------------------- | --------------------------------------------------- |
| `component.on("click", handler)`       | `component.node.addEventListener("click", handler)` |
| Pass `BaseComponent` to `addChildren`  | Pass raw `HTMLElement` to `addChildren`             |
| Call `destroy()` when leaving a page   | Leave components without cleanup                    |
| Call `super.destroy()` when overriding | Forget `super.destroy()` in subclasses              |

---

## Chaining Pattern

`on`, `addTo`, `addChildren`, `toggleClass`, and `setText` all return `this` — methods can be chained:

```typescript
new BaseComponent({
  tag: "button",
  className: "btn btn-primary",
  text: "Log In",
})
  .on("click", () => navigate("/login"))
  .toggleClass("btn--loading", isLoading)
  .addTo(actionsContainer);
```
