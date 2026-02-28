import type BaseComponent from "@/components/base/base-component";
import { QuizStrategy } from "@/components/widgets/quiz/quiz-strategy";
import type {
  IWidgetStrategy,
  WidgetAnswer,
  Widget,
} from "@/types/shared/widget.types";

class WidgetEngine {
  private strategies = new Map<string, IWidgetStrategy<Widget, WidgetAnswer>>();

  constructor() {
    this.register(new QuizStrategy());
  }

  public register(strategy: IWidgetStrategy<Widget, WidgetAnswer>): void {
    this.strategies.set(strategy.type, strategy);
  }

  public renderWidget(
    widget: Widget,
    onAnswer: (answer: unknown) => void,
  ): BaseComponent {
    const strategy = this.strategies.get(widget.type);
    if (!strategy) {
      throw new Error(`Unknown widget type: ${widget.type}`);
    }
    return strategy.render(widget, onAnswer);
  }
}

export default new WidgetEngine();
