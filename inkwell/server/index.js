import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import db, { DATA_DIR, UPLOAD_DIR, countWords, uniqueSlug } from './db.js';
import { seed } from './seed.js';
import { decodeDataUrl, processCover, removeCoverFiles } from './covers.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, '..', 'dist');
const PORT = Number(process.env.PORT) || 3000;
const COOKIE = 'inkwell_token';

// JWT secret: env, else a random one persisted next to the database.
const SECRET = process.env.JWT_SECRET || (() => {
  const f = path.join(DATA_DIR, '.jwt-secret');
  if (!fs.existsSync(f)) fs.writeFileSync(f, crypto.randomBytes(32).toString('hex'), { mode: 0o600 });
  return fs.readFileSync(f, 'utf8').trim();
})();

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', true);
app.use(express.json({ limit: '12mb' }));
app.use(cookieParser());

// ───────────────────────── helpers ─────────────────────────
class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
const fail = (status, message) => { throw new HttpError(status, message); };
const route = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const toInt = (v) => { const n = Number.parseInt(v, 10); return Number.isFinite(n) ? n : null; };
const isEditor = (req) => req.user?.role === 'editor';
const pickFields = (body, fields) => Object.fromEntries(fields.filter((f) => body[f] !== undefined).map((f) => [f, body[f]]));

function publicUser(u) {
  if (!u) return null;
  const { password_hash, ...rest } = u;
  return rest;
}

function cookieOpts(req) {
  const https = req.secure || req.get('x-forwarded-proto') === 'https';
  // The live preview is embedded cross-site, so https needs SameSite=None.
  return https
    ? { httpOnly: true, secure: true, sameSite: 'none', partitioned: true, maxAge: 30 * 86400000, path: '/' }
    : { httpOnly: true, sameSite: 'lax', maxAge: 30 * 86400000, path: '/' };
}

function issueSession(req, res, user) {
  const token = jwt.sign({ sub: user.id, role: user.role }, SECRET, { expiresIn: '30d' });
  res.cookie(COOKIE, token, cookieOpts(req));
  return { user: publicUser(user), token };
}

app.use((req, _res, next) => {
  const header = req.get('authorization');
  const token = req.cookies[COOKIE] || (header?.startsWith('Bearer ') ? header.slice(7) : null);
  if (token) {
    try {
      const { sub } = jwt.verify(token, SECRET);
      req.user = db.prepare('SELECT * FROM users WHERE id = ?').get(sub) || null;
    } catch { req.user = null; }
  }
  next();
});
const requireAuth = (req, _res, next) => (req.user ? next() : next(new HttpError(401, 'Please sign in')));
const requireEditor = (req, _res, next) =>
  !req.user ? next(new HttpError(401, 'Please sign in')) : isEditor(req) ? next() : next(new HttpError(403, 'Publishers only'));

const logEvent = (userId, type, magazineId = null, articleId = null) =>
  db.prepare('INSERT INTO events (user_id,type,magazine_id,article_id) VALUES (?,?,?,?)').run(userId ?? null, type, magazineId, articleId);

// ───────────────────────── magazines SQL ─────────────────────────
const MAG_SELECT = `
  SELECT m.*, c.slug AS category_slug, c.name_en AS category_en, c.name_bn AS category_bn, c.color AS category_color,
    (SELECT COUNT(*) FROM issues i WHERE i.magazine_id = m.id) AS issue_count,
    (SELECT COUNT(*) FROM articles a WHERE a.magazine_id = m.id AND a.status = 'published') AS article_count,
    (SELECT COUNT(*) FROM articles a WHERE a.magazine_id = m.id) AS article_total,
    (SELECT ROUND(AVG(rating), 1) FROM reviews r WHERE r.magazine_id = m.id) AS rating,
    (SELECT COUNT(*) FROM reviews r WHERE r.magazine_id = m.id) AS review_count,
    (SELECT COUNT(*) FROM events e WHERE e.magazine_id = m.id AND e.type = 'read') AS reads,
    (SELECT COUNT(*) FROM subscriptions s WHERE s.magazine_id = m.id AND s.status = 'active') AS subscriber_count,
    (SELECT MAX(published_at) FROM issues i WHERE i.magazine_id = m.id) AS latest_issue_at,
    EXISTS (SELECT 1 FROM library l WHERE l.magazine_id = m.id AND l.user_id = @uid) AS in_library,
    (SELECT status FROM subscriptions s WHERE s.magazine_id = m.id AND s.user_id = @uid) AS subscription_status
  FROM magazines m LEFT JOIN categories c ON c.id = m.category_id`;

const shapeMag = (m) => m && ({ ...m, in_library: !!m.in_library });

function getMagazine(idOrSlug, uid = 0) {
  const byId = /^\d+$/.test(String(idOrSlug));
  return shapeMag(db.prepare(`${MAG_SELECT} WHERE ${byId ? 'm.id = @key' : 'm.slug = @key'}`).get({ uid, key: byId ? Number(idOrSlug) : idOrSlug }));
}

const MAG_FIELDS = ['title_en', 'title_bn', 'tagline_en', 'tagline_bn', 'description_en', 'description_bn', 'category_id', 'language',
  'frequency', 'price_poisha', 'status', 'cover_color', 'cover_accent', 'cover_style', 'cover_url', 'cover_thumb', 'cover_lang', 'publisher'];

function validateMag(data, partial = false) {
  if (!partial || data.title_en !== undefined) {
    if (!String(data.title_en || '').trim() && !String(data.title_bn || '').trim()) fail(400, 'A title (English or Bengali) is required');
  }
  if (data.language !== undefined && !['bn', 'en', 'both'].includes(data.language)) fail(400, 'Language must be bn, en or both');
  if (data.status !== undefined && !['published', 'draft'].includes(data.status)) fail(400, 'Status must be published or draft');
  if (data.cover_lang !== undefined && data.cover_lang !== null && !['bn', 'en', 'both'].includes(data.cover_lang)) fail(400, 'Invalid cover language');
  if (data.price_poisha !== undefined) {
    const p = toInt(data.price_poisha);
    if (p === null || p < 0 || p > 10_000_00) fail(400, 'Price must be between ৳0 and ৳10,000');
    data.price_poisha = p;
  }
  for (const k of ['cover_color', 'cover_accent']) {
    if (data[k] !== undefined && !/^#[0-9a-f]{6}$/i.test(data[k])) fail(400, `${k} must be a hex colour`);
  }
  for (const k of ['cover_url', 'cover_thumb']) {
    if (data[k] && !String(data[k]).startsWith('/api/uploads/')) fail(400, 'Covers must be uploaded through /api/uploads');
  }
  return data;
}

// ───────────────────────── auth ─────────────────────────
const DEMO = { reader: 'reader@inkwell.com.bd', editor: 'editor@inkwell.com.bd', desk: 'desk@inkwell.com.bd' };

app.post('/api/auth/register', route(async (req, res) => {
  const { name, email, password, role } = req.body || {};
  if (!String(name || '').trim()) fail(400, 'Name is required');
  if (!/^\S+@\S+\.\S+$/.test(String(email || ''))) fail(400, 'Enter a valid email');
  if (String(password || '').length < 6) fail(400, 'Password must be at least 6 characters');
  if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(email)) fail(409, 'An account with that email already exists');
  const dbRole = role === 'publisher' || role === 'editor' ? 'editor' : 'reader';
  const colors = ['#0f766e', '#b45309', '#be123c', '#4338ca', '#c2410c', '#1e3a8a'];
  const info = db.prepare(`INSERT INTO users (email,password_hash,name,role,avatar_color,title) VALUES (?,?,?,?,?,?)`)
    .run(email.trim(), await bcrypt.hash(password, 10), name.trim(), dbRole, colors[Math.floor(Math.random() * colors.length)], dbRole === 'editor' ? 'Publisher' : 'Reader');
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(issueSession(req, res, user));
}));

app.post('/api/auth/login', route(async (req, res) => {
  const { email, password } = req.body || {};
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(String(email || '').trim());
  if (!user || !(await bcrypt.compare(String(password || ''), user.password_hash))) fail(401, 'Incorrect email or password');
  res.json(issueSession(req, res, user));
}));

app.post('/api/auth/demo', route(async (req, res) => {
  const email = DEMO[req.body?.account] || DEMO.reader;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) fail(404, 'Demo account missing — run npm run seed -- --force');
  res.json(issueSession(req, res, user));
}));

app.post('/api/auth/logout', (req, res) => {
  const { maxAge, ...opts } = cookieOpts(req);
  res.clearCookie(COOKIE, opts);
  res.json({ ok: true });
});

app.get('/api/auth/me', (req, res) => res.json({ user: publicUser(req.user) }));

app.patch('/api/auth/me', requireAuth, route(async (req, res) => {
  const data = pickFields(req.body || {}, ['name', 'name_bn', 'bio', 'avatar_color', 'title']);
  if (data.name !== undefined && !String(data.name).trim()) fail(400, 'Name cannot be empty');
  if (data.avatar_color !== undefined && !/^#[0-9a-f]{6}$/i.test(data.avatar_color)) fail(400, 'Invalid colour');
  if (req.body?.new_password) {
    if (String(req.body.new_password).length < 6) fail(400, 'New password must be at least 6 characters');
    if (!(await bcrypt.compare(String(req.body.current_password || ''), req.user.password_hash))) fail(400, 'Current password is incorrect');
    data.password_hash = await bcrypt.hash(req.body.new_password, 10);
  }
  if (Object.keys(data).length) {
    const sets = Object.keys(data).map((k) => `${k} = @${k}`).join(', ');
    db.prepare(`UPDATE users SET ${sets} WHERE id = @id`).run({ ...data, id: req.user.id });
  }
  res.json({ user: publicUser(db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)) });
}));

// ───────────────────────── catalogue ─────────────────────────
app.get('/api/categories', (_req, res) => {
  res.json(db.prepare(`SELECT c.*, (SELECT COUNT(*) FROM magazines m WHERE m.category_id = c.id AND m.status = 'published') AS magazine_count
    FROM categories c ORDER BY c.id`).all());
});

app.get('/api/magazines', (req, res) => {
  const { q, category, language, sort, scope, status } = req.query;
  const where = [];
  const params = { uid: req.user?.id ?? 0 };
  if (scope === 'studio' && isEditor(req)) {
    if (status === 'published' || status === 'draft') { where.push('m.status = @status'); params.status = status; }
  } else {
    where.push("m.status = 'published'");
  }
  if (category && category !== 'all') { where.push('c.slug = @category'); params.category = category; }
  if (language === 'bn' || language === 'en') { where.push("(m.language = @language OR m.language = 'both')"); params.language = language; }
  if (language === 'both') where.push("m.language = 'both'");
  if (q) {
    where.push(`(m.title_en LIKE @q OR m.title_bn LIKE @q OR m.tagline_en LIKE @q OR m.tagline_bn LIKE @q OR m.publisher LIKE @q
      OR c.name_en LIKE @q OR c.name_bn LIKE @q)`);
    params.q = `%${q}%`;
  }
  const order = {
    newest: 'latest_issue_at DESC, m.id DESC',
    rating: 'rating DESC NULLS LAST, review_count DESC',
    price_asc: 'm.price_poisha ASC',
    price_desc: 'm.price_poisha DESC',
    title: 'm.title_en COLLATE NOCASE ASC',
    updated: 'm.updated_at DESC',
  }[sort] || 'reads DESC, rating DESC';
  const rows = db.prepare(`${MAG_SELECT} ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY ${order}`).all(params);
  res.json(rows.map(shapeMag));
});

app.get('/api/magazines/:key', (req, res) => {
  const uid = req.user?.id ?? 0;
  const mag = getMagazine(req.params.key, uid);
  if (!mag || (mag.status !== 'published' && !isEditor(req))) fail(404, 'Publication not found');
  const showDrafts = isEditor(req);
  const issues = db.prepare('SELECT * FROM issues WHERE magazine_id = ? ORDER BY published_at DESC, number DESC').all(mag.id);
  const arts = db.prepare(`SELECT a.id, a.issue_id, a.title_en, a.title_bn, a.dek_en, a.dek_bn, a.author, a.read_minutes, a.word_count,
      a.position, a.status, p.percent AS progress
    FROM articles a LEFT JOIN progress p ON p.article_id = a.id AND p.user_id = ?
    WHERE a.magazine_id = ? ${showDrafts ? '' : "AND a.status = 'published'"} ORDER BY a.position`).all(uid, mag.id);
  for (const i of issues) i.articles = arts.filter((a) => a.issue_id === i.id);
  const reviews = db.prepare(`SELECT r.*, u.name, u.name_bn, u.avatar_color FROM reviews r JOIN users u ON u.id = r.user_id
    WHERE r.magazine_id = ? ORDER BY r.updated_at DESC`).all(mag.id);
  const subscription = uid ? db.prepare('SELECT * FROM subscriptions WHERE user_id = ? AND magazine_id = ?').get(uid, mag.id) : null;
  const distribution = [5, 4, 3, 2, 1].map((star) => ({ star, count: reviews.filter((r) => r.rating === star).length }));
  logEvent(req.user?.id, 'open', mag.id);
  res.json({ ...mag, issues: issues.filter((i) => showDrafts || i.articles.length), reviews, distribution, subscription: subscription || null,
    my_review: reviews.find((r) => r.user_id === uid) || null });
});

app.post('/api/magazines', requireEditor, (req, res) => {
  const data = validateMag(pickFields(req.body || {}, MAG_FIELDS));
  const slug = uniqueSlug('magazines', data.title_en || data.title_bn);
  const info = db.prepare(`INSERT INTO magazines (slug, owner_id, title_en, ${Object.keys(data).filter((k) => k !== 'title_en').join(', ')})
    VALUES (@slug, @owner_id, @title_en ${Object.keys(data).filter((k) => k !== 'title_en').map((k) => ', @' + k).join('')})`)
    .run({ title_en: '', ...data, slug, owner_id: req.user.id });
  res.status(201).json(getMagazine(info.lastInsertRowid, req.user.id));
});

app.patch('/api/magazines/:id', requireEditor, (req, res) => {
  const id = toInt(req.params.id);
  const before = db.prepare('SELECT * FROM magazines WHERE id = ?').get(id);
  if (!before) fail(404, 'Publication not found');
  const data = validateMag(pickFields(req.body || {}, MAG_FIELDS), true);
  if (Object.keys(data).length) {
    const sets = Object.keys(data).map((k) => `${k} = @${k}`).join(', ');
    db.prepare(`UPDATE magazines SET ${sets}, updated_at = datetime('now') WHERE id = @id`).run({ ...data, id });
  }
  if ('cover_url' in data && before.cover_url && before.cover_url !== data.cover_url) removeCoverFiles(before.cover_url, before.cover_thumb);
  res.json(getMagazine(id, req.user.id));
});

app.delete('/api/magazines/:id', requireEditor, (req, res) => {
  const id = toInt(req.params.id);
  const m = db.prepare('SELECT * FROM magazines WHERE id = ?').get(id);
  if (!m) fail(404, 'Publication not found');
  const issueCovers = db.prepare('SELECT cover_url, cover_thumb FROM issues WHERE magazine_id = ?').all(id);
  db.prepare('DELETE FROM magazines WHERE id = ?').run(id);
  removeCoverFiles(m.cover_url, m.cover_thumb, ...issueCovers.flatMap((i) => [i.cover_url, i.cover_thumb]));
  res.json({ ok: true, id });
});

// ───────────────────────── issues ─────────────────────────
app.get('/api/magazines/:id/issues', (req, res) => {
  const id = toInt(req.params.id);
  const m = db.prepare('SELECT status FROM magazines WHERE id = ?').get(id);
  if (!m || (m.status !== 'published' && !isEditor(req))) fail(404, 'Publication not found');
  res.json(db.prepare(`SELECT i.*, (SELECT COUNT(*) FROM articles a WHERE a.issue_id = i.id) AS article_count
    FROM issues i WHERE magazine_id = ? ORDER BY published_at DESC, number DESC`).all(id));
});

app.post('/api/issues', requireEditor, (req, res) => {
  const b = req.body || {};
  const magId = toInt(b.magazine_id);
  if (!db.prepare('SELECT 1 FROM magazines WHERE id = ?').get(magId)) fail(400, 'Choose a publication');
  const number = toInt(b.number) ?? (db.prepare('SELECT COALESCE(MAX(number), 0) + 1 AS n FROM issues WHERE magazine_id = ?').get(magId).n);
  const info = db.prepare(`INSERT INTO issues (magazine_id, number, title_en, title_bn, published_at, cover_url, cover_thumb)
    VALUES (?, ?, ?, ?, COALESCE(?, date('now')), ?, ?)`)
    .run(magId, number, String(b.title_en || `No. ${number}`), String(b.title_bn || ''), b.published_at || null, b.cover_url || null, b.cover_thumb || null);
  res.status(201).json(db.prepare('SELECT * FROM issues WHERE id = ?').get(info.lastInsertRowid));
});

app.patch('/api/issues/:id', requireEditor, (req, res) => {
  const id = toInt(req.params.id);
  const before = db.prepare('SELECT * FROM issues WHERE id = ?').get(id);
  if (!before) fail(404, 'Issue not found');
  const data = pickFields(req.body || {}, ['number', 'title_en', 'title_bn', 'published_at', 'cover_url', 'cover_thumb']);
  if (Object.keys(data).length) {
    db.prepare(`UPDATE issues SET ${Object.keys(data).map((k) => `${k} = @${k}`).join(', ')} WHERE id = @id`).run({ ...data, id });
  }
  if ('cover_url' in data && before.cover_url && before.cover_url !== data.cover_url) removeCoverFiles(before.cover_url, before.cover_thumb);
  res.json(db.prepare('SELECT * FROM issues WHERE id = ?').get(id));
});

app.delete('/api/issues/:id', requireEditor, (req, res) => {
  const id = toInt(req.params.id);
  const i = db.prepare('SELECT * FROM issues WHERE id = ?').get(id);
  if (!i) fail(404, 'Issue not found');
  db.prepare('DELETE FROM issues WHERE id = ?').run(id);
  removeCoverFiles(i.cover_url, i.cover_thumb);
  res.json({ ok: true, id });
});

// ───────────────────────── articles ─────────────────────────
const ART_LIST = `
  SELECT a.id, a.issue_id, a.magazine_id, a.title_en, a.title_bn, a.dek_en, a.dek_bn, a.author, a.word_count, a.read_minutes,
    a.position, a.status, a.created_at, a.updated_at,
    m.title_en AS magazine_title_en, m.title_bn AS magazine_title_bn, m.slug AS magazine_slug, m.language AS magazine_language,
    m.cover_color, m.cover_accent, m.cover_style, m.cover_thumb, m.cover_url, m.status AS magazine_status,
    i.title_en AS issue_title_en, i.title_bn AS issue_title_bn, i.number AS issue_number,
    (SELECT COUNT(*) FROM events e WHERE e.article_id = a.id AND e.type = 'read') AS reads
  FROM articles a JOIN magazines m ON m.id = a.magazine_id JOIN issues i ON i.id = a.issue_id`;

app.get('/api/articles', (req, res) => {
  const { magazine_id, issue_id, status, q, scope } = req.query;
  const where = [];
  const p = {};
  if (!(scope === 'studio' && isEditor(req))) where.push("a.status = 'published' AND m.status = 'published'");
  else if (status === 'published' || status === 'draft') { where.push('a.status = @status'); p.status = status; }
  if (toInt(magazine_id)) { where.push('a.magazine_id = @mid'); p.mid = toInt(magazine_id); }
  if (toInt(issue_id)) { where.push('a.issue_id = @iid'); p.iid = toInt(issue_id); }
  if (q) { where.push('(a.title_en LIKE @q OR a.title_bn LIKE @q OR a.author LIKE @q)'); p.q = `%${q}%`; }
  res.json(db.prepare(`${ART_LIST} ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY m.title_en, i.published_at DESC, a.position LIMIT 500`).all(p));
});

const fullArticle = (id) => db.prepare(`SELECT a.*, m.title_en AS magazine_title_en, m.title_bn AS magazine_title_bn, m.slug AS magazine_slug,
  m.language AS magazine_language, m.cover_color, m.cover_accent, m.cover_style, m.cover_url, m.cover_thumb, m.status AS magazine_status,
  i.title_en AS issue_title_en, i.title_bn AS issue_title_bn, i.number AS issue_number, i.published_at
  FROM articles a JOIN magazines m ON m.id = a.magazine_id JOIN issues i ON i.id = a.issue_id WHERE a.id = ?`).get(id);

app.get('/api/articles/:id', requireAuth, (req, res) => {
  const id = toInt(req.params.id);
  const a = fullArticle(id);
  const editor = isEditor(req);
  if (!a || (!editor && (a.status !== 'published' || a.magazine_status !== 'published'))) fail(404, 'Article not found');
  const uid = req.user.id;
  const pub = editor ? '' : "AND a.status = 'published'";
  const siblings = db.prepare(`SELECT a.id, a.title_en, a.title_bn, a.read_minutes, a.position, a.status, p.percent AS progress
    FROM articles a LEFT JOIN progress p ON p.article_id = a.id AND p.user_id = ? WHERE a.issue_id = ? ${pub} ORDER BY a.position`).all(uid, a.issue_id);
  const ordered = db.prepare(`SELECT a.id, a.title_en, a.title_bn FROM articles a JOIN issues i ON i.id = a.issue_id
    WHERE a.magazine_id = ? ${pub} ORDER BY i.published_at DESC, i.number DESC, a.position`).all(a.magazine_id);
  const idx = ordered.findIndex((x) => x.id === id);
  const progress = db.prepare('SELECT percent, updated_at FROM progress WHERE user_id = ? AND article_id = ?').get(uid, id);
  const bookmarked = !!db.prepare('SELECT 1 FROM bookmarks WHERE user_id = ? AND article_id = ?').get(uid, id);
  const subscribed = !!db.prepare("SELECT 1 FROM subscriptions WHERE user_id = ? AND magazine_id = ? AND status = 'active'").get(uid, a.magazine_id);
  const recent = db.prepare(`SELECT 1 FROM events WHERE user_id = ? AND article_id = ? AND type = 'read' AND created_at > datetime('now', '-1 hour')`).get(uid, id);
  if (!recent && !req.query.studio) logEvent(uid, 'read', a.magazine_id, id);
  res.json({
    ...a, siblings, progress: progress?.percent ?? 0, progress_updated_at: progress?.updated_at ?? null, bookmarked, subscribed,
    prev: idx > 0 ? ordered[idx - 1] : null, next: idx >= 0 && idx < ordered.length - 1 ? ordered[idx + 1] : null,
  });
});

const ART_FIELDS = ['title_en', 'title_bn', 'dek_en', 'dek_bn', 'author', 'body_en', 'body_bn', 'status', 'position', 'issue_id'];
function articleStats(data, before = {}) {
  const words = Math.max(countWords(data.body_en ?? before.body_en), countWords(data.body_bn ?? before.body_bn));
  return { word_count: words, read_minutes: Math.max(1, Math.ceil(words / 200)) };
}

app.post('/api/articles', requireEditor, (req, res) => {
  const data = pickFields(req.body || {}, ART_FIELDS);
  const issue = db.prepare('SELECT * FROM issues WHERE id = ?').get(toInt(data.issue_id));
  if (!issue) fail(400, 'Choose an issue');
  if (!String(data.title_en || '').trim() && !String(data.title_bn || '').trim()) fail(400, 'A title is required');
  if (data.status && !['published', 'draft'].includes(data.status)) fail(400, 'Invalid status');
  const position = toInt(data.position) ?? db.prepare('SELECT COALESCE(MAX(position), -1) + 1 AS p FROM articles WHERE issue_id = ?').get(issue.id).p;
  const row = { title_en: '', title_bn: '', dek_en: '', dek_bn: '', author: req.user.name, body_en: '', body_bn: '', status: 'draft', ...data,
    issue_id: issue.id, magazine_id: issue.magazine_id, position, ...articleStats(data) };
  const info = db.prepare(`INSERT INTO articles (issue_id, magazine_id, title_en, title_bn, dek_en, dek_bn, author, body_en, body_bn, status, position, word_count, read_minutes)
    VALUES (@issue_id, @magazine_id, @title_en, @title_bn, @dek_en, @dek_bn, @author, @body_en, @body_bn, @status, @position, @word_count, @read_minutes)`).run(row);
  res.status(201).json(fullArticle(info.lastInsertRowid));
});

app.patch('/api/articles/:id', requireEditor, (req, res) => {
  const id = toInt(req.params.id);
  const before = db.prepare('SELECT * FROM articles WHERE id = ?').get(id);
  if (!before) fail(404, 'Article not found');
  const data = pickFields(req.body || {}, ART_FIELDS);
  if (data.status && !['published', 'draft'].includes(data.status)) fail(400, 'Invalid status');
  if (data.issue_id !== undefined) {
    const issue = db.prepare('SELECT * FROM issues WHERE id = ?').get(toInt(data.issue_id));
    if (!issue) fail(400, 'Choose an issue');
    data.issue_id = issue.id; data.magazine_id = issue.magazine_id;
  }
  if ('body_en' in data || 'body_bn' in data) Object.assign(data, articleStats(data, before));
  if (Object.keys(data).length) {
    db.prepare(`UPDATE articles SET ${Object.keys(data).map((k) => `${k} = @${k}`).join(', ')}, updated_at = datetime('now') WHERE id = @id`).run({ ...data, id });
  }
  res.json(fullArticle(id));
});

app.delete('/api/articles/:id', requireEditor, (req, res) => {
  const id = toInt(req.params.id);
  if (!db.prepare('DELETE FROM articles WHERE id = ?').run(id).changes) fail(404, 'Article not found');
  res.json({ ok: true, id });
});

// ───────────────────────── reader: library / bookmarks / progress ─────────────────────────
app.get('/api/me/library', requireAuth, (req, res) => {
  const uid = req.user.id;
  const rows = db.prepare(`${MAG_SELECT} JOIN library l ON l.magazine_id = m.id AND l.user_id = @uid ORDER BY l.added_at DESC`).all({ uid });
  const prog = db.prepare(`SELECT COUNT(*) AS started, SUM(CASE WHEN p.percent >= 100 THEN 1 ELSE 0 END) AS finished
    FROM progress p JOIN articles a ON a.id = p.article_id WHERE p.user_id = ? AND a.magazine_id = ?`);
  const added = db.prepare('SELECT added_at FROM library WHERE user_id = ? AND magazine_id = ?');
  res.json(rows.map((m) => ({ ...shapeMag(m), ...prog.get(uid, m.id), added_at: added.get(uid, m.id)?.added_at })));
});

app.post('/api/me/library/:magazineId', requireAuth, (req, res) => {
  const mid = toInt(req.params.magazineId);
  if (!db.prepare("SELECT 1 FROM magazines WHERE id = ? AND status = 'published'").get(mid)) fail(404, 'Publication not found');
  db.prepare('INSERT OR IGNORE INTO library (user_id, magazine_id) VALUES (?, ?)').run(req.user.id, mid);
  res.status(201).json({ ok: true, in_library: true });
});

app.delete('/api/me/library/:magazineId', requireAuth, (req, res) => {
  db.prepare('DELETE FROM library WHERE user_id = ? AND magazine_id = ?').run(req.user.id, toInt(req.params.magazineId));
  res.json({ ok: true, in_library: false });
});

app.get('/api/me/bookmarks', requireAuth, (req, res) => {
  res.json(db.prepare(`${ART_LIST.replace('FROM articles a', ', b.created_at AS bookmarked_at, p.percent AS progress FROM articles a')}
    JOIN bookmarks b ON b.article_id = a.id AND b.user_id = @uid
    LEFT JOIN progress p ON p.article_id = a.id AND p.user_id = @uid
    ORDER BY b.created_at DESC`).all({ uid: req.user.id }));
});

app.post('/api/me/bookmarks/:articleId', requireAuth, (req, res) => {
  const aid = toInt(req.params.articleId);
  const a = db.prepare('SELECT magazine_id FROM articles WHERE id = ?').get(aid);
  if (!a) fail(404, 'Article not found');
  const info = db.prepare('INSERT OR IGNORE INTO bookmarks (user_id, article_id) VALUES (?, ?)').run(req.user.id, aid);
  if (info.changes) logEvent(req.user.id, 'bookmark', a.magazine_id, aid);
  res.status(201).json({ ok: true, bookmarked: true });
});

app.delete('/api/me/bookmarks/:articleId', requireAuth, (req, res) => {
  db.prepare('DELETE FROM bookmarks WHERE user_id = ? AND article_id = ?').run(req.user.id, toInt(req.params.articleId));
  res.json({ ok: true, bookmarked: false });
});

app.post('/api/me/progress/:articleId', requireAuth, (req, res) => {
  const aid = toInt(req.params.articleId);
  if (!db.prepare('SELECT 1 FROM articles WHERE id = ?').get(aid)) fail(404, 'Article not found');
  const percent = Math.max(0, Math.min(100, Math.round(Number(req.body?.percent) || 0)));
  db.prepare(`INSERT INTO progress (user_id, article_id, percent, updated_at) VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT (user_id, article_id) DO UPDATE SET percent = excluded.percent, updated_at = excluded.updated_at`).run(req.user.id, aid, percent);
  res.json({ ok: true, percent });
});

// ───────────────────────── subscriptions & reviews ─────────────────────────
const SUB_SELECT = `SELECT s.*, m.title_en, m.title_bn, m.slug, m.language, m.price_poisha AS monthly_price, m.cover_color, m.cover_accent,
  m.cover_style, m.cover_thumb, m.cover_url, m.frequency, m.status AS magazine_status,
  c.name_en AS category_en, c.name_bn AS category_bn
  FROM subscriptions s JOIN magazines m ON m.id = s.magazine_id LEFT JOIN categories c ON c.id = m.category_id`;

app.get('/api/me/subscriptions', requireAuth, (req, res) => {
  res.json(db.prepare(`${SUB_SELECT} WHERE s.user_id = ? ORDER BY s.status = 'active' DESC, s.started_at DESC`).all(req.user.id));
});

app.post('/api/subscriptions', requireAuth, (req, res) => {
  const mid = toInt(req.body?.magazine_id);
  const plan = req.body?.plan === 'yearly' ? 'yearly' : 'monthly';
  const m = db.prepare("SELECT * FROM magazines WHERE id = ? AND status = 'published'").get(mid);
  if (!m) fail(404, 'Publication not found');
  const price = plan === 'yearly' ? m.price_poisha * 10 : m.price_poisha; // two months free on yearly
  const renews = plan === 'yearly' ? "datetime('now', '+1 year')" : "datetime('now', '+1 month')";
  const existing = db.prepare('SELECT * FROM subscriptions WHERE user_id = ? AND magazine_id = ?').get(req.user.id, mid);
  if (existing) {
    db.prepare(`UPDATE subscriptions SET plan = ?, price_poisha = ?, status = 'active', cancelled_at = NULL, renews_at = ${renews}
      ${existing.status === 'cancelled' ? ", started_at = datetime('now')" : ''} WHERE id = ?`).run(plan, price, existing.id);
  } else {
    db.prepare(`INSERT INTO subscriptions (user_id, magazine_id, plan, price_poisha, renews_at) VALUES (?, ?, ?, ?, ${renews})`).run(req.user.id, mid, plan, price);
  }
  if (!existing || existing.status === 'cancelled') logEvent(req.user.id, 'subscribe', mid);
  db.prepare('INSERT OR IGNORE INTO library (user_id, magazine_id) VALUES (?, ?)').run(req.user.id, mid);
  res.status(existing ? 200 : 201).json(db.prepare(`${SUB_SELECT} WHERE s.user_id = ? AND s.magazine_id = ?`).get(req.user.id, mid));
});

app.post('/api/subscriptions/:id/cancel', requireAuth, (req, res) => {
  const s = db.prepare('SELECT * FROM subscriptions WHERE id = ? AND user_id = ?').get(toInt(req.params.id), req.user.id);
  if (!s) fail(404, 'Subscription not found');
  db.prepare("UPDATE subscriptions SET status = 'cancelled', cancelled_at = datetime('now') WHERE id = ?").run(s.id);
  res.json(db.prepare(`${SUB_SELECT} WHERE s.id = ?`).get(s.id));
});

app.post('/api/magazines/:id/reviews', requireAuth, (req, res) => {
  const mid = toInt(req.params.id);
  if (!db.prepare('SELECT 1 FROM magazines WHERE id = ?').get(mid)) fail(404, 'Publication not found');
  const rating = toInt(req.body?.rating);
  if (!rating || rating < 1 || rating > 5) fail(400, 'Rating must be 1–5');
  const body = String(req.body?.body || '').trim().slice(0, 2000);
  const lang = /[\u0980-\u09FF]/.test(body) ? 'bn' : 'en';
  db.prepare(`INSERT INTO reviews (user_id, magazine_id, rating, body, lang) VALUES (?, ?, ?, ?, ?)
    ON CONFLICT (user_id, magazine_id) DO UPDATE SET rating = excluded.rating, body = excluded.body, lang = excluded.lang, updated_at = datetime('now')`)
    .run(req.user.id, mid, rating, body, lang);
  res.status(201).json(db.prepare(`SELECT r.*, u.name, u.name_bn, u.avatar_color FROM reviews r JOIN users u ON u.id = r.user_id
    WHERE r.user_id = ? AND r.magazine_id = ?`).get(req.user.id, mid));
});

app.delete('/api/reviews/:id', requireAuth, (req, res) => {
  const r = db.prepare('SELECT * FROM reviews WHERE id = ?').get(toInt(req.params.id));
  if (!r) fail(404, 'Review not found');
  if (r.user_id !== req.user.id && !isEditor(req)) fail(403, 'You can only delete your own review');
  db.prepare('DELETE FROM reviews WHERE id = ?').run(r.id);
  res.json({ ok: true, id: r.id });
});

// ───────────────────────── uploads ─────────────────────────
app.post('/api/uploads', requireEditor, route(async (req, res) => {
  const { buffer } = decodeDataUrl(req.body?.data);
  let result;
  try { result = await processCover(buffer, 'upload'); } catch { fail(422, 'That file could not be read as an image'); }
  const mid = toInt(req.body?.magazine_id);
  if (mid) {
    const before = db.prepare('SELECT cover_url, cover_thumb FROM magazines WHERE id = ?').get(mid);
    if (!before) { removeCoverFiles(result.url, result.thumb); fail(404, 'Publication not found'); }
    const lang = ['bn', 'en', 'both'].includes(req.body?.cover_lang) ? req.body.cover_lang : null;
    db.prepare(`UPDATE magazines SET cover_url = ?, cover_thumb = ?, cover_lang = COALESCE(?, cover_lang), updated_at = datetime('now') WHERE id = ?`)
      .run(result.url, result.thumb, lang, mid);
    removeCoverFiles(before.cover_url, before.cover_thumb);
  }
  res.status(201).json(result);
}));

app.delete('/api/uploads', requireEditor, (req, res) => {
  const { url, magazine_id } = req.body || {};
  const mid = toInt(magazine_id);
  if (mid) {
    const m = db.prepare('SELECT cover_url, cover_thumb FROM magazines WHERE id = ?').get(mid);
    if (!m) fail(404, 'Publication not found');
    db.prepare("UPDATE magazines SET cover_url = NULL, cover_thumb = NULL, cover_lang = NULL, updated_at = datetime('now') WHERE id = ?").run(mid);
    removeCoverFiles(m.cover_url, m.cover_thumb);
  } else if (url) {
    const inUse = db.prepare('SELECT 1 FROM magazines WHERE cover_url = ? UNION SELECT 1 FROM issues WHERE cover_url = ?').get(url, url);
    if (inUse) fail(409, 'That cover is still in use');
    removeCoverFiles(url, url.replace(/\.webp$/, '-thumb.webp'));
  } else fail(400, 'Provide url or magazine_id');
  res.json({ ok: true });
});

app.use('/api/uploads', express.static(UPLOAD_DIR, { immutable: true, maxAge: '365d', index: false, fallthrough: false }));

// ───────────────────────── dashboard / analytics / search ─────────────────────────
function dayBuckets(days, rows) {
  const map = Object.fromEntries(rows.map((r) => [r.day, r.n]));
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(Date.now() - (days - 1 - i) * 86400000).toISOString().slice(0, 10);
    return { day: d, reads: map[d] || 0 };
  });
}

app.get('/api/dashboard', requireAuth, (req, res) => {
  const uid = req.user.id;
  const one = (sql, ...p) => db.prepare(sql).get(...p);
  const stats = {
    library: one('SELECT COUNT(*) n FROM library WHERE user_id = ?', uid).n,
    finished: one('SELECT COUNT(*) n FROM progress WHERE user_id = ? AND percent >= 100', uid).n,
    in_progress: one('SELECT COUNT(*) n FROM progress WHERE user_id = ? AND percent > 0 AND percent < 100', uid).n,
    bookmarks: one('SELECT COUNT(*) n FROM bookmarks WHERE user_id = ?', uid).n,
    minutes: Math.round(one('SELECT COALESCE(SUM(a.read_minutes * p.percent / 100.0), 0) n FROM progress p JOIN articles a ON a.id = p.article_id WHERE p.user_id = ?', uid).n),
    subscriptions: one("SELECT COUNT(*) n FROM subscriptions WHERE user_id = ? AND status = 'active'", uid).n,
    monthly_spend: one(`SELECT COALESCE(SUM(CASE WHEN plan = 'yearly' THEN price_poisha / 12 ELSE price_poisha END), 0) n
      FROM subscriptions WHERE user_id = ? AND status = 'active'`, uid).n,
  };
  const continueReading = db.prepare(`${ART_LIST.replace('FROM articles a', ', p.percent AS progress, p.updated_at AS progress_at FROM articles a')}
    JOIN progress p ON p.article_id = a.id AND p.user_id = ? WHERE p.percent > 0 AND p.percent < 100 AND a.status = 'published'
    ORDER BY p.updated_at DESC LIMIT 6`).all(uid);
  const chart = dayBuckets(14, db.prepare(`SELECT date(created_at) day, COUNT(*) n FROM events
    WHERE user_id = ? AND type = 'read' AND created_at >= date('now', '-13 days') GROUP BY day`).all(uid));
  const activity = db.prepare(`SELECT e.id, e.type, e.created_at, m.title_en AS magazine_title_en, m.title_bn AS magazine_title_bn, m.slug,
      a.id AS article_id, a.title_en AS article_title_en, a.title_bn AS article_title_bn
    FROM events e LEFT JOIN magazines m ON m.id = e.magazine_id LEFT JOIN articles a ON a.id = e.article_id
    WHERE e.user_id = ? AND e.type IN ('read','bookmark','subscribe','share') ORDER BY e.created_at DESC LIMIT 10`).all(uid);
  let recs = db.prepare(`${MAG_SELECT} WHERE m.status = 'published' AND m.id NOT IN (SELECT magazine_id FROM library WHERE user_id = @uid)
    AND m.category_id IN (SELECT m2.category_id FROM library l JOIN magazines m2 ON m2.id = l.magazine_id WHERE l.user_id = @uid)
    ORDER BY reads DESC LIMIT 4`).all({ uid });
  if (recs.length < 4) {
    const more = db.prepare(`${MAG_SELECT} WHERE m.status = 'published' AND m.id NOT IN (SELECT magazine_id FROM library WHERE user_id = @uid)
      ORDER BY reads DESC LIMIT 6`).all({ uid });
    for (const m of more) if (recs.length < 4 && !recs.some((r) => r.id === m.id)) recs.push(m);
  }
  res.json({ stats, continue_reading: continueReading, chart, activity, recommendations: recs.map(shapeMag) });
});

app.get('/api/analytics', requireEditor, (_req, res) => {
  const one = (sql) => db.prepare(sql).get();
  const totals = {
    magazines: one('SELECT COUNT(*) n FROM magazines').n,
    published: one("SELECT COUNT(*) n FROM magazines WHERE status = 'published'").n,
    articles: one('SELECT COUNT(*) n FROM articles').n,
    draft_articles: one("SELECT COUNT(*) n FROM articles WHERE status = 'draft'").n,
    readers: one("SELECT COUNT(*) n FROM users WHERE role = 'reader'").n,
    subscribers: one("SELECT COUNT(DISTINCT user_id) n FROM subscriptions WHERE status = 'active'").n,
    active_subscriptions: one("SELECT COUNT(*) n FROM subscriptions WHERE status = 'active'").n,
    mrr: one("SELECT COALESCE(SUM(CASE WHEN plan = 'yearly' THEN price_poisha / 12 ELSE price_poisha END), 0) n FROM subscriptions WHERE status = 'active'").n,
    reads_30: one("SELECT COUNT(*) n FROM events WHERE type = 'read' AND created_at >= date('now', '-29 days')").n,
    reads_prev_30: one("SELECT COUNT(*) n FROM events WHERE type = 'read' AND created_at >= date('now', '-59 days') AND created_at < date('now', '-29 days')").n,
  };
  const reads = dayBuckets(30, db.prepare(`SELECT date(created_at) day, COUNT(*) n FROM events WHERE type = 'read'
    AND created_at >= date('now', '-29 days') GROUP BY day`).all());
  const mix = db.prepare(`SELECT c.name_en, c.name_bn, c.color, COUNT(m.id) AS value FROM categories c
    LEFT JOIN magazines m ON m.category_id = c.id GROUP BY c.id HAVING value > 0 ORDER BY value DESC`).all();
  const languages = db.prepare('SELECT language, COUNT(*) AS value FROM magazines GROUP BY language').all();
  const topMagazines = db.prepare(`${MAG_SELECT} ORDER BY reads DESC LIMIT 6`).all({ uid: 0 }).map(shapeMag);
  const topArticles = db.prepare(`${ART_LIST} ORDER BY reads DESC LIMIT 8`).all();
  const draftMagazines = db.prepare("SELECT id, title_en, title_bn, slug, updated_at FROM magazines WHERE status = 'draft' ORDER BY updated_at DESC").all();
  const draftArticles = db.prepare(`${ART_LIST} WHERE a.status = 'draft' ORDER BY a.updated_at DESC LIMIT 8`).all();
  const revenue = db.prepare(`SELECT m.id, m.title_en, m.title_bn, COUNT(s.id) AS subscribers,
      COALESCE(SUM(CASE WHEN s.plan = 'yearly' THEN s.price_poisha / 12 ELSE s.price_poisha END), 0) AS mrr
    FROM magazines m LEFT JOIN subscriptions s ON s.magazine_id = m.id AND s.status = 'active'
    WHERE m.status = 'published' GROUP BY m.id ORDER BY mrr DESC`).all();
  res.json({ totals, reads, mix, languages, top_magazines: topMagazines, top_articles: topArticles,
    drafts: { magazines: draftMagazines, articles: draftArticles }, revenue });
});

app.get('/api/search', (req, res) => {
  const q = String(req.query.q || '').trim();
  if (!q) return res.json({ magazines: [], articles: [] });
  const like = `%${q}%`;
  const magazines = db.prepare(`${MAG_SELECT} WHERE m.status = 'published' AND (m.title_en LIKE @q OR m.title_bn LIKE @q
    OR m.tagline_en LIKE @q OR m.tagline_bn LIKE @q) ORDER BY reads DESC LIMIT 6`).all({ uid: req.user?.id ?? 0, q: like }).map(shapeMag);
  const articles = db.prepare(`${ART_LIST} WHERE a.status = 'published' AND m.status = 'published'
    AND (a.title_en LIKE @q OR a.title_bn LIKE @q OR a.author LIKE @q OR a.dek_en LIKE @q OR a.dek_bn LIKE @q) LIMIT 10`).all({ q: like });
  res.json({ magazines, articles });
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, magazines: db.prepare('SELECT COUNT(*) n FROM magazines').get().n, time: new Date().toISOString() });
});

app.use('/api', (_req, _res, next) => next(new HttpError(404, 'Not found')));

// ───────────────────────── SPA ─────────────────────────
if (fs.existsSync(DIST)) {
  app.use(express.static(DIST, { index: false, maxAge: '1h', setHeaders: (res, file) => {
    if (file.includes(`${path.sep}assets${path.sep}`)) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  } }));
  app.get('*', (_req, res) => res.sendFile(path.join(DIST, 'index.html')));
} else {
  app.get('/', (_req, res) => res.type('text').send('Client not built yet — run `npm run build`.'));
}

app.use((err, _req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: status >= 500 && !err.status ? 'Something went wrong' : err.message });
});

await seed({ log: (m) => console.log(m) });
app.listen(PORT, '0.0.0.0', () => console.log(`[inkwell] listening on http://0.0.0.0:${PORT}`));
