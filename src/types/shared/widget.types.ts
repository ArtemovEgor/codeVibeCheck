import type BaseComponent from "@/components/base/base-component";

type WidgetType = "quiz" | "true-false";

export interface LocalizedString {
  ru: string;
  en: string;
}

export interface QuizPayload {
  question: LocalizedString;
  options: LocalizedString[];
  answer?: number;
}

export interface TrueFalsePayload {
  statement: LocalizedString;
  explanation: LocalizedString;
  answer?: boolean;
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

export type WidgetAnswer = IQuizAnswer | ITrueFalseAnswer;

export type Widget =
  | (IBaseWidget & { type: "quiz"; payload: QuizPayload })
  | (IBaseWidget & { type: "true-false"; payload: TrueFalsePayload });

export interface IWidgetStrategy<T extends Widget, A> {
  type: T["type"];
  render(widget: T, onAnswer: (answer: A) => void): BaseComponent;
}
