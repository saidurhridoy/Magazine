import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DATA_DIR = path.join(__dirname, 'data');
export const UPLOAD_DIR = path.join(__dirname, 'uploads');
export const COVER_DIR = path.join(UPLOAD_DIR, 'covers');
export const SEED_IMG_DIR = path.join(UPLOAD_DIR, 'seed');

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(COVER_DIR, { recursive: true });

export const DB_PATH = process.env.INKWELL_DB || path.join(DATA_DIR, 'inkwell.db');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('busy_timeout = 5000');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL,
  name_bn       TEXT,
  role          TEXT NOT NULL DEFAULT 'reader' CHECK (role IN ('reader','editor')),
  title         TEXT,
  avatar_color  TEXT NOT NULL DEFAULT '#0f766e',
  bio           TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS categories (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  slug     TEXT NOT NULL UNIQUE,
  name_en  TEXT NOT NULL,
  name_bn  TEXT NOT NULL,
  color    TEXT NOT NULL DEFAULT '#0f766e'
);

CREATE TABLE IF NOT EXISTS magazines (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  slug            TEXT NOT NULL UNIQUE,
  title_en        TEXT NOT NULL,
  title_bn        TEXT NOT NULL DEFAULT '',
  tagline_en      TEXT NOT NULL DEFAULT '',
  tagline_bn      TEXT NOT NULL DEFAULT '',
  description_en  TEXT NOT NULL DEFAULT '',
  description_bn  TEXT NOT NULL DEFAULT '',
  category_id     INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  language        TEXT NOT NULL DEFAULT 'bn' CHECK (language IN ('bn','en','both')),
  frequency       TEXT NOT NULL DEFAULT 'monthly',
  price_poisha    INTEGER NOT NULL DEFAULT 35000,
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('published','draft')),
  cover_color     TEXT NOT NULL DEFAULT '#0f766e',
  cover_accent    TEXT NOT NULL DEFAULT '#f59e0b',
  cover_style     TEXT NOT NULL DEFAULT 'arcs',
  cover_url       TEXT,
  cover_thumb     TEXT,
  cover_lang      TEXT CHECK (cover_lang IN ('bn','en','both') OR cover_lang IS NULL),
  publisher       TEXT NOT NULL DEFAULT '',
  owner_id        INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_magazines_status ON magazines(status);
CREATE INDEX IF NOT EXISTS idx_magazines_category ON magazines(category_id);

CREATE TABLE IF NOT EXISTS issues (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  magazine_id   INTEGER NOT NULL REFERENCES magazines(id) ON DELETE CASCADE,
  number        INTEGER NOT NULL,
  title_en      TEXT NOT NULL DEFAULT '',
  title_bn      TEXT NOT NULL DEFAULT '',
  published_at  TEXT NOT NULL DEFAULT (date('now')),
  cover_url     TEXT,
  cover_thumb   TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_issues_magazine ON issues(magazine_id);

CREATE TABLE IF NOT EXISTS articles (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  issue_id      INTEGER NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  magazine_id   INTEGER NOT NULL REFERENCES magazines(id) ON DELETE CASCADE,
  title_en      TEXT NOT NULL DEFAULT '',
  title_bn      TEXT NOT NULL DEFAULT '',
  dek_en        TEXT NOT NULL DEFAULT '',
  dek_bn        TEXT NOT NULL DEFAULT '',
  author        TEXT NOT NULL DEFAULT '',
  body_en       TEXT NOT NULL DEFAULT '',
  body_bn       TEXT NOT NULL DEFAULT '',
  word_count    INTEGER NOT NULL DEFAULT 0,
  read_minutes  INTEGER NOT NULL DEFAULT 1,
  position      INTEGER NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('published','draft')),
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_articles_issue ON articles(issue_id);
CREATE INDEX IF NOT EXISTS idx_articles_magazine ON articles(magazine_id);

CREATE TABLE IF NOT EXISTS library (
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  magazine_id  INTEGER NOT NULL REFERENCES magazines(id) ON DELETE CASCADE,
  added_at     TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, magazine_id)
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  magazine_id   INTEGER NOT NULL REFERENCES magazines(id) ON DELETE CASCADE,
  plan          TEXT NOT NULL DEFAULT 'monthly' CHECK (plan IN ('monthly','yearly')),
  price_poisha  INTEGER NOT NULL,
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','cancelled')),
  started_at    TEXT NOT NULL DEFAULT (datetime('now')),
  renews_at     TEXT,
  cancelled_at  TEXT,
  UNIQUE (user_id, magazine_id)
);

CREATE TABLE IF NOT EXISTS reviews (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  magazine_id  INTEGER NOT NULL REFERENCES magazines(id) ON DELETE CASCADE,
  rating       INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body         TEXT NOT NULL DEFAULT '',
  lang         TEXT NOT NULL DEFAULT 'bn',
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (user_id, magazine_id)
);

CREATE TABLE IF NOT EXISTS bookmarks (
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  article_id  INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, article_id)
);

CREATE TABLE IF NOT EXISTS progress (
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  article_id  INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  percent     INTEGER NOT NULL DEFAULT 0,
  updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, article_id)
);

CREATE TABLE IF NOT EXISTS events (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      INTEGER REFERENCES users(id) ON DELETE SET NULL,
  type         TEXT NOT NULL,
  magazine_id  INTEGER REFERENCES magazines(id) ON DELETE CASCADE,
  article_id   INTEGER REFERENCES articles(id) ON DELETE CASCADE,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_events_created ON events(created_at);
CREATE INDEX IF NOT EXISTS idx_events_user ON events(user_id);
`);

/** Latin slug; Bengali-only titles fall back to a transliteration-free short id. */
export function slugify(input) {
  const s = String(input || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return s || 'pub-' + Math.random().toString(36).slice(2, 8);
}

export function uniqueSlug(table, base, excludeId = null) {
  let slug = slugify(base);
  let n = 1;
  const stmt = db.prepare(`SELECT id FROM ${table} WHERE slug = ?`);
  for (;;) {
    const row = stmt.get(slug);
    if (!row || row.id === excludeId) return slug;
    n += 1;
    slug = `${slugify(base)}-${n}`;
  }
}

export function countWords(text) {
  return String(text || '').split(/\s+/).filter(Boolean).length;
}

export default db;
