export const schemaVersion = 1;

export const createSchemaStatements = [
  `CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    amount REAL NOT NULL CHECK (amount >= 0),
    date TEXT NOT NULL,
    recurring INTEGER NOT NULL DEFAULT 0,
    status TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS goals (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    target_amount REAL NOT NULL CHECK (target_amount >= 0),
    current_amount REAL NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
    priority TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS app_meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`,
] as const;
