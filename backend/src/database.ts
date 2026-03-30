import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

const databasePath = path.resolve(__dirname, "../data/database.sqlite");

if (!fs.existsSync(path.dirname(databasePath))) {
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
}

const dataBase = new Database(databasePath);

dataBase.pragma("foreign_keys = ON");

// Users
dataBase.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,
    avatarUrl TEXT,
    createdAt TEXT NOT NULL
  )
`);

// AI Chat
dataBase.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    xpAwarded INTEGER DEFAULT 0
  )
`);

dataBase.exec(`
  CREATE TABLE IF NOT EXISTS user_stats (
    userId TEXT PRIMARY KEY,
    totalXp INTEGER DEFAULT 0,
    chatSessionsCompleted INTEGER DEFAULT 0,
    lastChatXpEarned INTEGER DEFAULT 0,
    lastSessionResult TEXT,
    FOREIGN KEY (userId) REFERENCES users(id)
  )
`);

// Widgets
dataBase.exec(`
  CREATE TABLE IF NOT EXISTS topics (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    difficulty INTEGER DEFAULT 1 CHECK(difficulty BETWEEN 1 AND 3),
    sortOrder INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

dataBase.exec(`
  CREATE TABLE IF NOT EXISTS topic_requirements (
    topicId TEXT NOT NULL,
    requiredTopicId TEXT NOT NULL,
    PRIMARY KEY (topicId, requiredTopicId),
    FOREIGN KEY (topicId) REFERENCES topics(id),
    FOREIGN KEY (requiredTopicId) REFERENCES topics(id)
  )
`);

// Indexes
dataBase.exec(`
  CREATE INDEX IF NOT EXISTS idx_user_stats_userId ON user_stats(userId)
`);

dataBase.exec(`
  CREATE INDEX IF NOT EXISTS idx_topics_sortOrder ON topics(sortOrder)
`);

dataBase.exec(`
  CREATE INDEX IF NOT EXISTS idx_topics_difficulty ON topics(difficulty)
`);

dataBase.exec(`
  CREATE INDEX IF NOT EXISTS idx_topic_requirements_required ON topic_requirements(requiredTopicId)
`);

export default dataBase;
