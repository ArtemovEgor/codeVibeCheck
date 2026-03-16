import Database from "better-sqlite3";
import path from "node:path";

const databasePath =
  process.env.DB_PATH || path.resolve(__dirname, "../database.sqlite");

const aiDataBase = new Database(databasePath);

aiDataBase.pragma("foreign_keys = ON");

aiDataBase.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    xpAwarded INTEGER DEFAULT 0
  )
`);

aiDataBase.exec(`
  CREATE INDEX IF NOT EXISTS idx_messages_userId ON messages(userId)
`);

export default aiDataBase;
