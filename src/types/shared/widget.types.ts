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
export type WidgetType = "quiz" | "true-false";

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
 * Answer Definitions
 */
export interface IQuizAnswer {
  selectedIndex: number;
}

/**
 * Answer Definitions
 */
export interface ITrueFalseAnswer {
  value: boolean;
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
  | (IBaseWidget & { type: "true-false"; payload: TrueFalsePayload });

/**
 * Interface for implementing new widget rendering strategies.
 */
export interface IWidgetStrategy {
  type: string;
  render(widget: Widget, onAnswer: (answer: unknown) => void): BaseComponent;
  validate(answer: unknown, widget: Widget): boolean;
}
