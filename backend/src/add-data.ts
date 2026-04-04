import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

const DATA_DIR = path.resolve(__dirname, "../data");
const ALLOWED_TABLES = new Set(["topics", "topic_requirements", "widgets"]);

type DB = Database.Database;

interface ITopic {
  id: string;
  title: { ru: string; en: string };
  description?: { ru: string; en: string };
  difficulty: number;
  order: number;
  requiredTopicIds: string[];
  widgetIds?: string[];
}

interface IWidget {
  id: string;
  topicId?: string;
  sortOrder: number;
  type: string;
  version: number;
  difficulty: number;
  tags?: string[];
  payload: Record<string, unknown>;
  answerData: Record<string, unknown>;
}

interface IWidgetWithTopic extends IWidget {
  topicId: string;
}

function buildAnswerData(widget: IWidget): Record<string, unknown> {
  const { type, payload } = widget;
  if (!payload) return { correctAnswer: null };

  let correctAnswer: unknown = null;

  switch (type) {
    case "quiz": {
      if (
        "correctIndex" in payload &&
        typeof payload.correctIndex === "number"
      ) {
        correctAnswer = payload.correctIndex;
      }
      break;
    }
    case "true-false": {
      if (
        "correctValue" in payload &&
        typeof payload.correctValue === "boolean"
      ) {
        correctAnswer = payload.correctValue;
      }
      break;
    }
    case "code-completion": {
      if ("correctValues" in payload && Array.isArray(payload.correctValues)) {
        correctAnswer = payload.correctValues;
      }
      break;
    }
    case "code-ordering": {
      if ("correctOrder" in payload && Array.isArray(payload.correctOrder)) {
        correctAnswer = payload.correctOrder;
      }
      break;
    }
    default: {
      console.warn(
        `Unknown widget type: ${type}, cannot extract correctAnswer`,
      );
    }
  }

  const answerData: Record<string, unknown> = { correctAnswer };

  if ("explanation" in payload && payload.explanation) {
    answerData.explanation = payload.explanation;
  }

  return answerData;
}

function tableExists(database: DB, tableName: string): boolean {
  const row = database
    .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`)
    .get(tableName);
  return !!row;
}

function isTableEmpty(database: DB, tableName: string): boolean {
  if (!ALLOWED_TABLES.has(tableName)) {
    throw new Error(`Invalid table name: ${tableName}`);
  }
  if (!tableExists(database, tableName)) {
    return true;
  }
  const result = database
    .prepare(`SELECT EXISTS (SELECT 1 FROM "${tableName}" LIMIT 1) as hasRows`)
    .get() as { hasRows: number };
  return result.hasRows === 0;
}

function loadJSON<T>(filename: string): T[] {
  const filePath = path.join(DATA_DIR, filename);
  try {
    const content = fs.readFileSync(filePath, "utf8");
    return JSON.parse(content) as T[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    console.error(`Failed to parse ${filename}:`, error);
    throw new Error(`Invalid JSON in ${filename}`, { cause: error });
  }
}

function enableForeignKeys(database: DB): void {
  database.pragma("foreign_keys = ON");
}

function seedTopics(database: DB, topics: ITopic[]): void {
  if (!isTableEmpty(database, "topics")) {
    console.log("Skipping: topics table already contains data");
    return;
  }

  if (topics.length === 0) {
    console.log("No topics to seed");
    return;
  }

  console.log("Seeding topics table...");

  const stmt = database.prepare(`
    INSERT INTO topics (id, title, description, difficulty, sortOrder, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = database.transaction((items: ITopic[]) => {
    const now = new Date().toISOString();
    for (const topic of items) {
      stmt.run(
        topic.id,
        JSON.stringify(topic.title),
        topic.description ? JSON.stringify(topic.description) : null,
        topic.difficulty ?? 1,
        topic.order ?? 0,
        now,
        now,
      );
    }
  });

  insertMany(topics);
  console.log(`Added topics: ${topics.length}`);
}

function seedTopicRequirements(database: DB, topics: ITopic[]): void {
  if (!isTableEmpty(database, "topic_requirements")) {
    console.log("Skipping: topic_requirements table already contains data");
    return;
  }

  if (topics.length === 0) return;

  console.log("Seeding topic_requirements table...");

  const stmt = database.prepare(`
    INSERT OR IGNORE INTO topic_requirements (topicId, requiredTopicId)
    VALUES (?, ?)
  `);

  let count = 0;
  const insertDeps = database.transaction(() => {
    for (const topic of topics) {
      if (topic.requiredTopicIds?.length) {
        for (const requiredId of topic.requiredTopicIds) {
          stmt.run(topic.id, requiredId);
          count++;
        }
      }
    }
  });

  insertDeps();
  console.log(`Added dependencies: ${count}`);
}

function enrichWidgetsWithTopicId(
  widgets: IWidget[],
  topics: ITopic[],
): IWidgetWithTopic[] {
  const widgetToTopic = new Map<string, string>();
  for (const topic of topics) {
    if (topic.widgetIds && Array.isArray(topic.widgetIds)) {
      for (const widgetId of topic.widgetIds) {
        if (widgetToTopic.has(widgetId)) {
          console.warn(
            `Widget ${widgetId} already assigned to topic ${widgetToTopic.get(widgetId)}, overriding with ${topic.id}`,
          );
        }
        widgetToTopic.set(widgetId, topic.id);
      }
    }
  }

  const enriched = widgets
    .map((widget) => {
      const topicId = widgetToTopic.get(widget.id);
      if (!topicId) {
        console.warn(
          `Widget ${widget.id} has no associated topic, it will be skipped`,
        );
        return null;
      }
      return { ...widget, topicId } as IWidgetWithTopic;
    })
    .filter((w): w is IWidgetWithTopic => w !== null);

  return enriched;
}

function seedWidgets(database: DB, topics: ITopic[]): void {
  if (!isTableEmpty(database, "widgets")) {
    console.log("Skipping: widgets table already contains data");
    return;
  }

  const widgets = loadJSON<IWidget>("widgets.json");
  if (widgets.length === 0) return;

  const enrichedWidgets = enrichWidgetsWithTopicId(widgets, topics);
  if (enrichedWidgets.length === 0) {
    console.log(
      "No valid widgets to seed (all skipped due to missing topicId)",
    );
    return;
  }

  console.log("Seeding widgets table...");

  const stmt = database.prepare(`
    INSERT INTO widgets (id, topicId, type, payload, answerData, difficulty, version, tags, sortOrder, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = database.transaction((items: IWidgetWithTopic[]) => {
    const now = new Date().toISOString();
    for (const widget of items) {
      const answerData = buildAnswerData(widget);
      stmt.run(
        widget.id,
        widget.topicId,
        widget.type,
        JSON.stringify(widget.payload ?? {}),
        JSON.stringify(answerData),
        widget.difficulty ?? 1,
        widget.version ?? 1,
        widget.tags ? JSON.stringify(widget.tags) : null,
        widget.sortOrder ?? 0,
        now,
        now,
      );
    }
  });

  insertMany(enrichedWidgets);
  console.log(`Added widgets: ${enrichedWidgets.length}`);
}

export function fillDatabase(database: DB): void {
  console.log("Initializing data...");
  enableForeignKeys(database);

  const topics = loadJSON<ITopic>("topics.json");

  seedTopics(database, topics);
  seedTopicRequirements(database, topics);
  seedWidgets(database, topics);

  console.log("Data initialization complete!");
}
