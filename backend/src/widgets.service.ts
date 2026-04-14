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
      SELECT id, type, difficulty, version, tags, payload, answerData
      FROM widgets
      ORDER BY sortOrder ASC
    `,
    )
    .all();

  return widgets.map((widget) => {
    const payload = JSON.parse(widget.payload);
    const tags = widget.tags ? JSON.parse(widget.tags) : [];
    let blankWidths: number[] = [];
    if (widget.type === "code-completion" && widget.answerData) {
      try {
        const ad = JSON.parse(widget.answerData) as IWidgetAnswerData;

        if (Array.isArray(ad.correctAnswer)) {
          blankWidths = (ad.correctAnswer as string[]).map(
            (value) => String(value).length,
          );
        }
      } catch (error) {
        console.error(
          `Error parsing answerData for widget ${widget.id}:`,
          error,
        );
      }
    }

    return {
      id: widget.id,
      type: widget.type,
      difficulty: widget.difficulty,
      version: widget.version,
      tags: tags,
      payload: {
        ...payload,
        ...(blankWidths.length > 0 && { blankWidths }),
      },
    };
  });
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
      SELECT id, type, difficulty, version, tags, payload, answerData
      FROM widgets
      WHERE topicId = ?
      ORDER BY sortOrder ASC
    `,
    )
    .all(topicId);

  return widgets.map((widget) => {
    const payload = JSON.parse(widget.payload);
    const tags = widget.tags ? JSON.parse(widget.tags) : [];
    let blankWidths: number[] = [];
    if (widget.type === "code-completion" && widget.answerData) {
      try {
        const ad = JSON.parse(widget.answerData) as IWidgetAnswerData;

        if (Array.isArray(ad.correctAnswer)) {
          blankWidths = (ad.correctAnswer as string[]).map(
            (value) => String(value).length,
          );
        }
      } catch (error) {
        console.error(
          `Error parsing answerData for widget ${widget.id}:`,
          error,
        );
      }
    }

    return {
      id: widget.id,
      type: widget.type,
      difficulty: widget.difficulty,
      version: widget.version,
      tags: tags,
      payload: {
        ...payload,
        ...(blankWidths.length > 0 && { blankWidths }),
      },
    };
  });
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
      const userValues = answer.values.map((v) =>
        String(v).toLowerCase().trim(),
      );
      const correctValues = (correctAnswer as string[]).map((v) =>
        String(v).toLowerCase().trim(),
      );

      isCorrect = JSON.stringify(userValues) === JSON.stringify(correctValues);
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

  const result: ISubmissionResult = {
    isCorrect,
    xpEarned,
    correctAnswer,
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
      SELECT topicId, completedWidgetIds, xpEarned, isCompleted, everCompleted, isUnlocked
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

export function updateUserTopicProgress(
  userId: string,
  payload: IUpdateProgressPayload,
): IUserTopicProgress {
  const { topicId, widgetId, xpEarned, totalWidgets } = payload;
  const now = new Date().toISOString();
  const today = now.split("T")[0];

  const progress =
    getUserProgressByTopicId(userId, topicId) ||
    initUserTopicProgress(userId, topicId);
  const stats = database
    .prepare<
      [string],
      IUserStats
    >(`SELECT streak, lastActivityAt, totalXp, completedTopicsCount AS completedTopics FROM user_learning_stats WHERE userId = ?`)
    .get(userId);

  const completedIds = [...progress.completedWidgetIds];
  const isNewWidget = !completedIds.includes(widgetId);
  if (isNewWidget) {
    completedIds.push(widgetId);
    progress.xpEarned += xpEarned;
  }
  const isCompleted = completedIds.length >= (totalWidgets ?? 0);
  const wasAlreadyCompleted = progress.everCompleted;

  const lastDateFormatted = stats?.lastActivityAt
    ? stats.lastActivityAt.slice(0, 10)
    : "";
  let newStreak = stats?.streak ?? 0;

  if (xpEarned > 0) {
    if (!lastDateFormatted || isMoreThanOneDayAgo(lastDateFormatted)) {
      newStreak = 1;
    } else if (lastDateFormatted !== today) {
      newStreak += 1;
    }
  }

  const newTotalXp = (stats?.totalXp ?? 0) + xpEarned;

  const newCompletedCount =
    isCompleted && !wasAlreadyCompleted
      ? (stats?.completedTopics ?? 0) + 1
      : (stats?.completedTopics ?? 0);

  database
    .prepare(
      `
    UPDATE user_topic_progress
    SET completedWidgetIds = ?, xpEarned = ?, isCompleted = ?, everCompleted = ?, updatedAt = ?
    WHERE userId = ? AND topicId = ?
  `,
    )
    .run(
      JSON.stringify(completedIds),
      progress.xpEarned,
      isCompleted ? 1 : 0,
      isCompleted || progress.everCompleted ? 1 : 0,
      now,
      userId,
      topicId,
    );

  database
    .prepare(
      `
    INSERT INTO user_learning_stats (
      userId, totalXp, streak, lastActivityAt, completedTopicsCount, createdAt, updatedAt
    ) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(userId) DO UPDATE SET
      totalXp = excluded.totalXp,
      streak = excluded.streak,
      lastActivityAt = excluded.lastActivityAt,
      completedTopicsCount = excluded.completedTopicsCount,
      updatedAt = excluded.updatedAt
    `,
    )
    .run(userId, newTotalXp, newStreak, today, newCompletedCount, now, now);

  if (isCompleted && !progress.everCompleted) {
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
            userId, topicId, isUnlocked, completedWidgetIds, 
            xpEarned, isCompleted, everCompleted, createdAt, updatedAt
          ) 
          VALUES (?, ?, 1, '[]', 0, 0, 0, ?, ?)
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

function isMoreThanOneDayAgo(lastDateString: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastDate = new Date(lastDateString);
  lastDate.setHours(0, 0, 0, 0);
  const diffInMs = today.getTime() - lastDate.getTime();
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

  return diffInDays > 1;
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
