# Widget Engine

## How to add a new widget type

1. Add type to `WidgetType` in `widget.types.ts`
2. Create payload interface `IXxxPayload`
3. Create answer interface `IXxxAnswer`
4. Add to `Widget` Discriminated Union
5. Create `src/components/widgets/xxx/xxx-strategy.ts`
6. Register in `app.ts` → `registerWidgets()`
7. Add mock data to `widgets.mock.data.ts`

## Example: QuizStrategy

\`\`\`TypeScript
export class QuizStrategy implements IWidgetStrategy {
public type = WIDGET_TYPES.QUIZ;
public render(widget, onAnswer): BaseComponent { ... }
public validate(answer, widget): boolean { ... }
}
\`\`\`
