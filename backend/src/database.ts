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

console.log("DB is ready!");

export default dataBase;
