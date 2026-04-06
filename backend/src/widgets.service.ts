import database from "./database";
import {
  ITopic,
  ITopicRow,
  IWidgetRow,
  IWidgetAnswerData,
  ISubmissionResult,
  IUserTopicProgress,
  IUserStats,
  IUpdateProgressPayload,
  WidgetAnswer,
  IQuizAnswer,
  ITrueFalseAnswer,
  ICodeCompletionAnswer,
  ICodeOrderingAnswer,
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

export function getAllWidgets(): {
  id: string;
  type: string;
  difficulty: number;
  version: number;
  tags: string[];
  payload: Record<string, unknown>;
}[] {
  const widgets = database
    .prepare<[], IWidgetRow>(
      `
      SELECT id, type, difficulty, version, tags, payload
      FROM widgets
      ORDER BY sortOrder ASC
    `,
    )
    .all();

  return widgets.map((widget) => ({
    id: widget.id,
    type: widget.type,
    difficulty: widget.difficulty,
    version: widget.version,
    tags: widget.tags ? JSON.parse(widget.tags) : [],
    payload: JSON.parse(widget.payload),
  }));
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
  userAnswer: WidgetAnswer,
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
  switch (type) {
    case "quiz": {
      const answer = userAnswer as IQuizAnswer;
      isCorrect = answer.selectedIndex === correctAnswer;
      break;
    }
    case "true-false": {
      const answer = userAnswer as ITrueFalseAnswer;
      isCorrect = answer.value === correctAnswer;
      break;
    }
    case "code-completion": {
      const answer = userAnswer as ICodeCompletionAnswer;
      isCorrect =
        JSON.stringify(answer.values) === JSON.stringify(correctAnswer);
      break;
    }
    case "code-ordering": {
      const answer = userAnswer as ICodeOrderingAnswer;
      isCorrect =
        JSON.stringify(answer.order) === JSON.stringify(correctAnswer);
      break;
    }
    default: {
      throw new Error("UNKNOWN_WIDGET_TYPE");
    }
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

export function getUserProgress(userId: string): IUserTopicProgress[] {
  const rows = database
    .prepare<
      [string],
      {
        topicId: string;
        completedWidgetIds: string;
        xpEarned: number;
        isCompleted: boolean;
        everCompleted: boolean;
        isUnlocked: boolean;
      }
    >(
      `
      SELECT topicId, completedWidgetIds, xpEarned, isCompleted, isUnlocked
      FROM user_topic_progress
      WHERE userId = ?
      ORDER BY createdAt ASC
    `,
    )
    .all(userId);

  return rows.map((row) => ({
    topicId: row.topicId,
    completedWidgetIds: JSON.parse(row.completedWidgetIds),
    xpEarned: row.xpEarned,
    isCompleted: Boolean(row.isCompleted),
    everCompleted: Boolean(row.everCompleted),
    isUnlocked: Boolean(row.isUnlocked),
  }));
}

export function getUserLearningStats(userId: string): IUserStats {
  const row = database
    .prepare<
      [string],
      {
        totalXp: number;
        completedTopicsCount: number;
        streak: number;
        lastActivityAt: string | null;
      }
    >(
      `
      SELECT totalXp, completedTopicsCount, streak, lastActivityAt
      FROM user_learning_stats
      WHERE userId = ?
    `,
    )
    .get(userId);

  if (!row) {
    return {
      totalXp: 0,
      completedTopics: 0,
      streak: 0,
      lastActivityAt: undefined,
    };
  }

  return {
    totalXp: row.totalXp,
    completedTopics: row.completedTopicsCount,
    streak: row.streak,
    lastActivityAt: row.lastActivityAt ?? undefined,
  };
}

export function getUserProgressByTopicId(
  userId: string,
  topicId: string,
): IUserTopicProgress | null {
  const row = database
    .prepare<
      [string, string],
      {
        topicId: string;
        completedWidgetIds: string;
        xpEarned: number;
        isCompleted: boolean;
        everCompleted: boolean;
        isUnlocked: boolean;
      }
    >(
      `
      SELECT topicId, completedWidgetIds, xpEarned, isCompleted, isUnlocked
      FROM user_topic_progress
      WHERE userId = ? AND topicId = ?
    `,
    )
    .get(userId, topicId);

  if (!row) {
    return null;
  }

  return {
    topicId: row.topicId,
    completedWidgetIds: JSON.parse(row.completedWidgetIds),
    xpEarned: row.xpEarned,
    isCompleted: Boolean(row.isCompleted),
    everCompleted: Boolean(row.everCompleted),
    isUnlocked: Boolean(row.isUnlocked),
  };
}

export function initUserTopicProgress(
  userId: string,
  topicId: string,
): IUserTopicProgress {
  const existing = database
    .prepare<
      [string, string],
      {
        topicId: string;
        completedWidgetIds: string;
        xpEarned: number;
        isCompleted: boolean;
        everCompleted: boolean;
        isUnlocked: boolean;
      }
    >(
      `
      SELECT topicId, completedWidgetIds, xpEarned, isCompleted, isUnlocked
      FROM user_topic_progress
      WHERE userId = ? AND topicId = ?
    `,
    )
    .get(userId, topicId);

  if (existing) {
    return {
      topicId: existing.topicId,
      completedWidgetIds: JSON.parse(existing.completedWidgetIds),
      xpEarned: existing.xpEarned,
      isCompleted: Boolean(existing.isCompleted),
      everCompleted: Boolean(existing.everCompleted),
      isUnlocked: Boolean(existing.isUnlocked),
    };
  }

  const requirements = database
    .prepare<
      [string],
      { requiredTopicId: string }
    >(`SELECT requiredTopicId FROM topic_requirements WHERE topicId = ?`)
    .all(topicId);

  let isUnlocked = true;
  if (requirements.length > 0) {
    const allCompleted = requirements.every((request) => {
      const progress = database
        .prepare<[string, string], { isCompleted: boolean }>(
          `
          SELECT isCompleted FROM user_topic_progress
          WHERE userId = ? AND topicId = ?
        `,
        )
        .get(userId, request.requiredTopicId);
      return progress ? Boolean(progress.isCompleted) : false;
    });
    isUnlocked = allCompleted;
  }

  const now = new Date().toISOString();
  const completedWidgetIdsJson = JSON.stringify([]);
  database
    .prepare(
      `
      INSERT INTO user_topic_progress (
        userId, topicId, completedWidgetIds, xpEarned,
        everCompleted, isCompleted, isUnlocked, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    )
    .run(
      userId,
      topicId,
      completedWidgetIdsJson,
      0,
      0, // everCompleted = false
      0, // isCompleted = false
      isUnlocked ? 1 : 0,
      now,
      now,
    );

  return {
    topicId,
    completedWidgetIds: [],
    xpEarned: 0,
    isCompleted: false,
    everCompleted: false,
    isUnlocked,
  };
}

/**
 * Updates the user's progress on the topic after a response to the widget.
 * Called by the front-end after each response.
 * @param userId - User ID
 * @param payload - Data to update
 * @returns - Updated progress record for the topic
 */

export function updateUserTopicProgress(
  userId: string,
  payload: IUpdateProgressPayload,
): IUserTopicProgress {
  const { topicId, widgetId, xpEarned, totalWidgets } = payload;

  let progress = getUserProgressByTopicId(userId, topicId);
  if (!progress) {
    progress = initUserTopicProgress(userId, topicId);
  }

  const completedIds = [...progress.completedWidgetIds];
  const isNewWidget = !completedIds.includes(widgetId);

  if (isNewWidget) {
    completedIds.push(widgetId);
    progress.xpEarned += xpEarned;
  }

  const newCompletedIdsJson = JSON.stringify(completedIds);
  const isCompleted = completedIds.length >= (totalWidgets ?? 0);
  const newEverCompleted = isCompleted || progress.everCompleted ? 1 : 0;
  console.log(isCompleted);

  const now = new Date().toISOString();
  database
    .prepare(
      `
      UPDATE user_topic_progress
      SET completedWidgetIds = ?,
          xpEarned = ?,
          isCompleted = ?,
          everCompleted = ?,
          updatedAt = ?
      WHERE userId = ? AND topicId = ?
    `,
    )
    .run(
      newCompletedIdsJson,
      progress.xpEarned,
      isCompleted ? 1 : 0,
      newEverCompleted,
      now,
      userId,
      topicId,
    );

  database
    .prepare(
      `
      UPDATE user_learning_stats
      SET totalXp = totalXp + ?,
          lastActivityAt = ?,
          updatedAt = ?
      WHERE userId = ?
    `,
    )
    .run(xpEarned, now, now, userId);

  if (isCompleted && !progress.isCompleted) {
    const completedCountResult = database
      .prepare<[string], { count: number }>(
        `
        SELECT COUNT(*) as count
        FROM user_topic_progress
        WHERE userId = ? AND isCompleted = 1
      `,
      )
      .get(userId);

    const completedTopicsCount = completedCountResult?.count ?? 0;
    database
      .prepare(
        `
        UPDATE user_learning_stats
        SET completedTopicsCount = ?
        WHERE userId = ?
      `,
      )
      .run(completedTopicsCount, userId);
  }

  const statsRow = database
    .prepare<
      [string],
      { streak: number }
    >(`SELECT streak FROM user_learning_stats WHERE userId = ?`)
    .get(userId);

  const currentStreak = statsRow?.streak ?? 0;
  const newStreak = xpEarned > 0 ? currentStreak + 1 : 0;
  database
    .prepare(`UPDATE user_learning_stats SET streak = ? WHERE userId = ?`)
    .run(newStreak, userId);

  if (isCompleted && !progress.isCompleted) {
    const dependentTopics = database
      .prepare<
        [string],
        { topicId: string }
      >(`SELECT topicId FROM topic_requirements WHERE requiredTopicId = ?`)
      .all(topicId);

    for (const dep of dependentTopics) {
      const requirements = database
        .prepare<
          [string],
          { requiredTopicId: string }
        >(`SELECT requiredTopicId FROM topic_requirements WHERE topicId = ?`)
        .all(dep.topicId);

      let allCompleted = true;
      for (const request of requirements) {
        const requestProgress = database
          .prepare<
            [string, string],
            { isCompleted: number }
          >(`SELECT isCompleted FROM user_topic_progress WHERE userId = ? AND topicId = ?`)
          .get(userId, request.requiredTopicId);
        if (!requestProgress || !requestProgress.isCompleted) {
          allCompleted = false;
          break;
        }
      }

      if (allCompleted) {
        database
          .prepare(
            `
      INSERT INTO user_topic_progress (
        userId, 
        topicId, 
        isUnlocked, 
        completedWidgetIds, 
        xpEarned, 
        isCompleted, 
        createdAt, 
        updatedAt
      ) 
      VALUES (?, ?, 1, '[]', 0, 0, ?, ?)
      ON CONFLICT(userId, topicId) DO UPDATE SET 
        isUnlocked = 1, 
        updatedAt = excluded.updatedAt
      `,
          )
          .run(userId, dep.topicId, now, now);
      }
    }
  }

  return getUserProgressByTopicId(userId, topicId) as IUserTopicProgress;
}

export function resetUserTopicProgress(
  userId: string,
  topicId: string,
): IUserTopicProgress | null {
  const existing = getUserProgressByTopicId(userId, topicId);
  if (!existing) {
    return null;
  }

  const now = new Date().toISOString();
  const emptyWidgetsJson = JSON.stringify([]);
  database
    .prepare(
      `
      UPDATE user_topic_progress
      SET completedWidgetIds = ?,
          xpEarned = ?,
          isCompleted = ?,
          updatedAt = ?
      WHERE userId = ? AND topicId = ?
    `,
    )
    .run(emptyWidgetsJson, 0, 0, now, userId, topicId);

  return getUserProgressByTopicId(userId, topicId);
}
