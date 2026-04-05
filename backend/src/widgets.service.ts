import database from "./database";
import { ITopic } from "./types";

interface ITopicRow {
  id: string;
  title: string;
  description: string | null;
  difficulty: number;
  sortOrder: number;
}

interface IWidgetRow {
  id: string;
  type: string;
  difficulty: number;
  version: number;
  tags: string | null;
  payload: string;
  sortOrder: number;
}

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
