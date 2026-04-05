import { ITopic, IWidget } from "./types";
import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

interface IWidgetWithTopic extends IWidget {
  topicId: string;
}

const DATA_DIR = path.resolve(__dirname, "../data");
const ALLOWED_TABLES = new Set(["topics", "topic_requirements", "widgets"]);

type DB = Database.Database;

// Helpers
function validatePrerequisites(database: DB): boolean {
  if (!fs.existsSync(DATA_DIR)) {
    console.warn(`Data directory not found: ${DATA_DIR}`);
    return false;
  }

  const requiredFiles = ["topics.json", "widgets.json"];
  for (const file of requiredFiles) {
    const filePath = path.join(DATA_DIR, file);
    if (!fs.existsSync(filePath)) {
      console.warn(`Required file not found: ${filePath}. Seed skipped.`);
      return false;
    }
  }

  const tablesToCheck = ["topics", "topic_requirements", "widgets"];
  for (const tableName of tablesToCheck) {
    if (!isTableEmpty(database, tableName)) {
      console.log(
        `Table "${tableName}" already contains data. Seed aborted to avoid data corruption.`,
      );
      return false;
    }
  }

  return true;
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

function cleanPayload(widget: IWidget): Record<string, unknown> {
  if (!widget.payload) return {};

  const { type, payload } = widget;
  const fieldsToRemove = ["explanation"];

  switch (type) {
    case "quiz": {
      fieldsToRemove.push("correctIndex");
      break;
    }
    case "true-false": {
      fieldsToRemove.push("correctValue");
      break;
    }
    case "code-completion": {
      fieldsToRemove.push("correctValues");
      break;
    }
    case "code-ordering": {
      fieldsToRemove.push("correctOrder");
      break;
    }
  }

  return Object.fromEntries(
    Object.entries(payload).filter(([key]) => !fieldsToRemove.includes(key)),
  );
}

function tableExists(database: DB, tableName: string): boolean {
  const row = database
    .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`)
    .get(tableName);
  return Boolean(row);
}

function isTableEmpty(database: DB, tableName: string): boolean {
  if (!ALLOWED_TABLES.has(tableName)) {
    throw new Error(`Invalid table name: ${tableName}`);
  }
  if (!tableExists(database, tableName)) {
    return true;
  }
  const hasRows = database
    .prepare(`SELECT EXISTS (SELECT 1 FROM "${tableName}" LIMIT 1)`)
    .pluck()
    .get() as number;
  return hasRows === 0;
}

function loadJSON<T>(filename: string): T[] {
  const filePath = path.join(DATA_DIR, filename);
  const content = fs.readFileSync(filePath, "utf8");
  return JSON.parse(content) as T[];
}

function enableForeignKeys(database: DB): void {
  database.pragma("foreign_keys = ON");
}

function seedTopics(database: DB, topics: ITopic[]): void {
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
  const existingIds = new Set(topics.map((t) => t.id));
  const missingReferences: { topicId: string; requiredId: string }[] = [];

  for (const topic of topics) {
    if (topic.requiredTopicIds?.length) {
      for (const requiredId of topic.requiredTopicIds) {
        if (!existingIds.has(requiredId)) {
          missingReferences.push({ topicId: topic.id, requiredId });
        }
      }
    }
  }

  if (missingReferences.length > 0) {
    console.error("Missing required topic references:");
    for (const { topicId, requiredId } of missingReferences) {
      console.error(
        `  Topic "${topicId}" requires "${requiredId}" which does not exist`,
      );
    }
    throw new Error(
      "Invalid topic requirements: non-existent requiredTopicId(s)",
    );
  }

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
    if (Array.isArray(topic.widgetIds)) {
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

function seedWidgets(database: DB, topics: ITopic[], widgets: IWidget[]): void {
  if (widgets.length === 0) {
    console.log("No widgets to seed");
    return;
  }

  const enrichedWidgets = enrichWidgetsWithTopicId(widgets, topics);
  if (enrichedWidgets.length === 0) {
    console.log(
      "No valid widgets to seed (all skipped due to missing topicId)",
    );
    return;
  }

  const existingTopicIds = new Set(topics.map((t) => t.id));
  const missingTopics = enrichedWidgets.filter(
    (w) => !existingTopicIds.has(w.topicId),
  );
  if (missingTopics.length > 0) {
    console.error("Widgets reference non-existent topics:");
    for (const w of missingTopics) {
      console.error(
        `  Widget ${w.id} references topic ${w.topicId} which does not exist`,
      );
    }
    throw new Error("Invalid widget references: topicId not found");
  }

  console.log("Seeding widgets table...");

  const stmt = database.prepare(`
    INSERT INTO widgets (id, topicId, type, payload, answerData, difficulty, version, tags, sortOrder, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = database.transaction((items: IWidgetWithTopic[]) => {
    const now = new Date().toISOString();

    let order = 0;

    for (const widget of items) {
      const cleanPayloadData = cleanPayload(widget);
      const answerData = buildAnswerData(widget);

      stmt.run(
        widget.id,
        widget.topicId,
        widget.type,
        JSON.stringify(cleanPayloadData),
        JSON.stringify(answerData),
        widget.difficulty ?? 1,
        widget.version ?? 1,
        widget.tags ? JSON.stringify(widget.tags) : null,
        ++order,
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

  if (!validatePrerequisites(database)) {
    return;
  }

  const topics = loadJSON<ITopic>("topics.json");
  if (topics.length === 0) {
    throw new Error("topics.json is empty, cannot proceed");
  }

  const widgets = loadJSON<IWidget>("widgets.json");

  enableForeignKeys(database);

  seedTopics(database, topics);
  seedTopicRequirements(database, topics);
  seedWidgets(database, topics, widgets);

  console.log("Data initialization complete!");
}
