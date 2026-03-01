import type BaseComponent from "@/components/base/base-component";

type WidgetType = "quiz" | "true-false";

export interface LocalizedString {
  ru: string;
  en: string;
}

export interface QuizPayload {
  question: LocalizedString;
  options: LocalizedString[];
  correctIndex?: number;
}

export interface TrueFalsePayload {
  statement: LocalizedString;
  explanation: LocalizedString;
  correctValue?: boolean;
}

export interface IQuizAnswer {
  selectedIndex: number;
}

export interface ITrueFalseAnswer {
  value: boolean;
}

interface IBaseWidget {
  id: string;
  type: WidgetType;
  version: number;
  difficulty: 1 | 2 | 3;
  tags: string[];
}

export type Widget =
  | (IBaseWidget & { type: "quiz"; payload: QuizPayload })
  | (IBaseWidget & { type: "true-false"; payload: TrueFalsePayload });

export interface IWidgetStrategy {
  type: string;
  render(widget: Widget, onAnswer: (answer: unknown) => void): BaseComponent;
}
