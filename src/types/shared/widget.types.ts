/**
 * codeVibeCheck — Widget Engine Types
 *
 * Generic types and interfaces for the Widget System.
 * Defines the contract between backend widget data, frontend strategies,
 * and the rendering engine.
 */

import type BaseComponent from "@/components/base/base-component";

/**
 * Supported widget types.
 * Add new types here to support them in the engine.
 */
export const WIDGET_TYPES = {
  QUIZ: "quiz",
  TRUE_FALSE: "true-false",
  CODE_COMPLETION: "code-completion",
  CODE_ORDERING: "code-ordering",
} as const;

export type WidgetType = (typeof WIDGET_TYPES)[keyof typeof WIDGET_TYPES];

/**
 * Difficulty levels for widgets.
 */
export type WidgetDifficulty = 1 | 2 | 3;

/**
 * Localized string structure for multi-language support.
 */
export interface ILocalizedString {
  ru: string;
  en: string;
}

/**
 * Payload structure for "quiz" type widgets.
 */
export interface IQuizPayload {
  question: ILocalizedString;
  options: ILocalizedString[];
  correctIndex?: number;
}

/**
 * Payload structure for "true-false" type widgets.
 */
export interface ITrueFalsePayload {
  statement: ILocalizedString;
  explanation: ILocalizedString;
  correctValue?: boolean;
}

/**
 * Payload structure for "code-completion" type widgets.
 */
export interface ICodeCompletionPayload {
  code: string; // "const result = arr.___(x => x > 0);"
  hints: ILocalizedString[];
  correctValues: string[]; // ["filter"]
}

/**
 * Payload structure for "code-ordering" type widgets.
 */
export interface ICodeOrderingPayload {
  description: ILocalizedString;
  lines: string[];
  correctOrder: number[];
}

/**
 * Answer Definitions for "quiz" type widgets.
 */
export interface IQuizAnswer {
  selectedIndex: number;
}

/**
 * Answer Definitions for "true-false" type widgets.
 */
export interface ITrueFalseAnswer {
  value: boolean;
}

/**
 * Answer Definitions for "code-completion" type widgets.
 */
export interface ICodeCompletionAnswer {
  values: string[];
}

/**
 * Answer Definitions for "code-ordering" type widgets.
 */
export interface ICodeOrderingAnswer {
  order: number[];
}

/**
 * Base properties common to all widgets.
 */
interface IBaseWidget {
  id: string;
  type: WidgetType;
  version: number;
  difficulty: WidgetDifficulty;
  tags: string[];
}

/**
 * Discriminated Union for safe type narrowing in strategies.
 */
export type Widget =
  | (IBaseWidget & { type: "quiz"; payload: IQuizPayload })
  | (IBaseWidget & { type: "true-false"; payload: ITrueFalsePayload })
  | (IBaseWidget & { type: "code-completion"; payload: ICodeCompletionPayload })
  | (IBaseWidget & { type: "code-ordering"; payload: ICodeOrderingPayload });

/**
 * Combined type for any widget answer
 */
export type WidgetAnswer =
  | IQuizAnswer
  | ITrueFalseAnswer
  | ICodeCompletionAnswer
  | ICodeOrderingAnswer;

/**
 * Interface for implementing new widget rendering strategies.
 */
export interface IWidgetStrategy {
  type: WidgetType;
  render(
    widget: Widget,
    onAnswer: (answer: WidgetAnswer) => void,
  ): BaseComponent;
  validate(answer: WidgetAnswer, widget: Widget): boolean;
}

/**
 *  Interface for implementing topics
 */
export interface ITopic {
  id: string;
  title: ILocalizedString;
  description: ILocalizedString;
  difficulty: WidgetDifficulty;
  order: number;
  requiredTopicIds: string[];
  widgetIds: string[];
}

/**
 * Verdict returned after submitting a widget answer.
 */
export interface IVerdict {
  isCorrect: boolean;
  explanation?: ILocalizedString;
  xpEarned: number;
  streakUpdated: boolean;
}
