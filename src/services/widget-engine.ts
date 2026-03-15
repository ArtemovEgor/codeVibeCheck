import type BaseComponent from "@/components/base/base-component";
import type {
  IVerdict,
  IWidgetStrategy,
  Widget,
  WidgetAnswer,
} from "@/types/shared/widget.types";

class WidgetEngine {
  private strategies = new Map<string, IWidgetStrategy>();

  public register(strategy: IWidgetStrategy): void {
    this.strategies.set(strategy.type, strategy);
  }

  public getStrategy(type: string): IWidgetStrategy | undefined {
    return this.strategies.get(type);
  }

  public clear(): void {
    this.strategies.clear();
  }

  public renderWidget(
    widget: Widget,
    onAnswer: (answer: WidgetAnswer) => void,
  ): BaseComponent | undefined {
    const strategy = this.getStrategy(widget.type);

    if (!strategy) {
      // TODO: replace with throw when all strategies are implemented
      console.warn(
        `Strategy for widget type "${widget.type}" is not registered.`,
      );

      return undefined;
    }

    return strategy.render(widget, onAnswer);
  }

  public showVerdict(widget: Widget, verdict: IVerdict): void {
    const strategy = this.getStrategy(widget.type);

    if (!strategy) {
      console.warn(
        `Strategy for widget type "${widget.type}" is not registered.`,
      );
      return;
    }

    strategy.showVerdict(verdict, widget);
  }
}

export default new WidgetEngine();
