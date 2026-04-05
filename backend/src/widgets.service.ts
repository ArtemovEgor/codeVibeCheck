import database from "./database";
import {
  ITopic,
  ITopicRow,
  IWidgetRow,
  IWidgetAnswerData,
  ISubmissionResult,
} from "./types";

export function getAllTopics(): ITopic[] {
  const topics = database
    .prepare<[], ITopicRow>(
      `
      SELECT id, title, description, difficulty, sortOrder
      FROM topics
      ORDER BY sortOrder ASC
    `,
    )
    .all();

  const getRequiredTopics = database.prepare<
    [string],
    { requiredTopicId: string }
  >(`SELECT requiredTopicId FROM topic_requirements WHERE topicId = ?`);

  const getWidgetIds = database.prepare<[string], { id: string }>(
    `SELECT id FROM widgets WHERE topicId = ? ORDER BY sortOrder ASC`,
  );

  return topics.map((topic) => ({
    id: topic.id,
    title: JSON.parse(topic.title),
    description: topic.description ? JSON.parse(topic.description) : undefined,
    difficulty: topic.difficulty,
    order: topic.sortOrder,
    requiredTopicIds: getRequiredTopics
      .all(topic.id)
      .map((row) => row.requiredTopicId),
    widgetIds: getWidgetIds.all(topic.id).map((row) => row.id),
  }));
}

export function getTopicById(id: string): ITopic | null {
  const topic = database
    .prepare<[string], ITopicRow>(
      `
      SELECT id, title, description, difficulty, sortOrder
      FROM topics
      WHERE id = ?
    `,
    )
    .get(id);

  if (!topic) {
    return null;
  }

  const getRequiredTopics = database.prepare<
    [string],
    { requiredTopicId: string }
  >(`SELECT requiredTopicId FROM topic_requirements WHERE topicId = ?`);

  const getWidgetIds = database.prepare<[string], { id: string }>(
    `SELECT id FROM widgets WHERE topicId = ? ORDER BY sortOrder ASC`,
  );

  return {
    id: topic.id,
    title: JSON.parse(topic.title),
    description: topic.description ? JSON.parse(topic.description) : undefined,
    difficulty: topic.difficulty,
    order: topic.sortOrder,
    requiredTopicIds: getRequiredTopics
      .all(id)
      .map((row) => row.requiredTopicId),
    widgetIds: getWidgetIds.all(id).map((row) => row.id),
  };
}

export function getWidgetsByTopicId(topicId: string): {
  id: string;
  type: string;
  difficulty: number;
  version: number;
  tags: string[];
  payload: Record<string, unknown>;
}[] {
  const widgets = database
    .prepare<[string], IWidgetRow>(
      `
      SELECT id, type, difficulty, version, tags, payload
      FROM widgets
      WHERE topicId = ?
      ORDER BY sortOrder ASC
    `,
    )
    .all(topicId);

  return widgets.map((widget) => ({
    id: widget.id,
    type: widget.type,
    difficulty: widget.difficulty,
    version: widget.version,
    tags: widget.tags ? JSON.parse(widget.tags) : [],
    payload: JSON.parse(widget.payload),
  }));
}

export function getWidgetById(widgetId: string): {
  id: string;
  type: string;
  difficulty: number;
  version: number;
  tags: string[];
  payload: Record<string, unknown>;
} | null {
  const widget = database
    .prepare<[string], IWidgetRow>(
      `
      SELECT id, type, difficulty, version, tags, payload
      FROM widgets
      WHERE id = ?
    `,
    )
    .get(widgetId);

  if (!widget) {
    return null;
  }

  return {
    id: widget.id,
    type: widget.type,
    difficulty: widget.difficulty,
    version: widget.version,
    tags: widget.tags ? JSON.parse(widget.tags) : [],
    payload: JSON.parse(widget.payload),
  };
}

export function submitWidgetAnswer(
  widgetId: string,
  userId: string,
  userAnswer: number | boolean | string[] | number[],
): ISubmissionResult {
  const widget = database
    .prepare<
      [string],
      { type: string; difficulty: number; answerData: string }
    >(`SELECT type, difficulty, answerData FROM widgets WHERE id = ?`)
    .get(widgetId);

  if (!widget) {
    throw new Error("WIDGET_NOT_FOUND");
  }

  let answerData: IWidgetAnswerData;
  try {
    answerData = JSON.parse(widget.answerData);
  } catch {
    throw new Error("INVALID_ANSWER_DATA");
  }

  const { correctAnswer, explanation } = answerData;
  const { type, difficulty } = widget;

  let isCorrect: boolean;
  if (type === "quiz" || type === "true-false") {
    isCorrect = userAnswer === correctAnswer;
  } else if (type === "code-completion" || type === "code-ordering") {
    isCorrect = JSON.stringify(userAnswer) === JSON.stringify(correctAnswer);
  } else {
    throw new Error("UNKNOWN_WIDGET_TYPE");
  }

  const xpEarned = isCorrect ? difficulty * 10 : 0;

  const now = new Date().toISOString();

  const stats = database
    .prepare<
      [string],
      { totalXp: number; streak: number }
    >(`SELECT totalXp, streak FROM user_learning_stats WHERE userId = ?`)
    .get(userId);

  const oldStreak = stats?.streak ?? 0;
  const newTotalXp = (stats?.totalXp ?? 0) + xpEarned;
  const newStreak = isCorrect ? oldStreak + 1 : 0;
  const streakUpdated = isCorrect;

  if (stats) {
    database
      .prepare(
        `UPDATE user_learning_stats
        SET totalXp = ?, streak = ?, lastActivityAt = ?, updatedAt = ?
        WHERE userId = ?`,
      )
      .run(newTotalXp, newStreak, now, now, userId);
  } else {
    database
      .prepare(
        `INSERT INTO user_learning_stats (userId, totalXp, streak, lastActivityAt, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(userId, newTotalXp, newStreak, now, now, now);
  }

  // 6. Формируем ответ
  const result: ISubmissionResult = {
    isCorrect,
    xpEarned,
    correctAnswer,
    streakUpdated,
  };

  if (type === "true-false" && explanation) {
    result.explanation = explanation;
  }

  return result;
}
