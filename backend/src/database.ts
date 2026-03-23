import Database from "better-sqlite3";
import path from "node:path";

const databasePath = path.resolve(__dirname, "../database.sqlite");

const dataBase = new Database(databasePath);

dataBase.pragma("foreign_keys = ON");

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

dataBase.exec(`
  CREATE INDEX IF NOT EXISTS idx_user_stats_userId ON user_stats(userId)
`);

export default dataBase;
