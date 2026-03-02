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
export type WidgetType =
  | "quiz"
  | "true-false"
  | "code-completion"
  | "code-ordering";

/**
 * Difficulty levels for widgets.
 */
export type WidgetDifficulty = 1 | 2 | 3;

/**
 * Localized string structure for multi-language support.
 */
export interface LocalizedString {
  ru: string;
  en: string;
}

/**
 * Payload structure for "quiz" type widgets.
 */
export interface QuizPayload {
  question: LocalizedString;
  options: LocalizedString[];
  correctIndex?: number;
}

/**
 * Payload structure for "true-false" type widgets.
 */
export interface TrueFalsePayload {
  statement: LocalizedString;
  explanation: LocalizedString;
  correctValue?: boolean;
}

/**
 * Payload structure for "code-completion" type widgets.
 */
export interface CodeCompletionPayload {
  code: string; // "const result = arr.___(x => x > 0);"
  hints: LocalizedString[];
  solutions: string[]; // ["filter"]
}

/**
 * Payload structure for "code-ordering" type widgets.
 */
export interface CodeOrderingPayload {
  description: LocalizedString;
  lines: string[];
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
  | (IBaseWidget & { type: "quiz"; payload: QuizPayload })
  | (IBaseWidget & { type: "true-false"; payload: TrueFalsePayload })
  | (IBaseWidget & { type: "code-completion"; payload: CodeCompletionPayload })
  | (IBaseWidget & { type: "code-ordering"; payload: CodeOrderingPayload });

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
  type: string;
  render(
    widget: Widget,
    onAnswer: (answer: WidgetAnswer) => void,
  ): BaseComponent;
  validate(answer: WidgetAnswer, widget: Widget): boolean;
}
