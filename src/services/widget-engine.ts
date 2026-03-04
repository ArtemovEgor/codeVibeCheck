import type BaseComponent from "@/components/base/base-component";
import type {
  IWidgetStrategy,
  Widget,
  WidgetAnswer,
} from "@/types/shared/widget.types";

class WidgetEngine {
  private strategies = new Map<string, IWidgetStrategy>();

  public register(strategy: IWidgetStrategy): void {
    this.strategies.set(strategy.type, strategy);
  }

  public renderWidget(
    widget: Widget,
    onAnswer: (answer: WidgetAnswer) => void,
  ): BaseComponent | undefined {
    const strategy = this.strategies.get(widget.type);

    if (!strategy) {
      console.warn(`Стратегия для ${widget.type} не зарегистрирована.`);

      return undefined;
    }

    return strategy.render(widget, onAnswer);
  }
}

export default new WidgetEngine();
