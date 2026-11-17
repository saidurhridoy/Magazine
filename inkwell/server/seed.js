import bcrypt from 'bcryptjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import db, { countWords, COVER_DIR, SEED_IMG_DIR } from './db.js';
import { processCover } from './covers.js';
import {
  AUTHORS, BN_MONTHS, CATEGORIES, EN_MONTHS, GENERIC_PARAGRAPHS, MAGAZINES, PLACES, POOLS, REVIEWS, toBnDigits,
} from './content.js';

// Deterministic PRNG so every seed produces the same catalogue.
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20261117);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const int = (lo, hi) => lo + Math.floor(rand() * (hi - lo + 1));
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

const pad = (n) => String(n).padStart(2, '0');
const sqlTime = (d) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
const daysAgo = (days, jitterHours = 0) => {
  const d = new Date(Date.now() - days * 86400000 - Math.floor(rand() * jitterHours * 3600000));
  return sqlTime(d);
};

const fill = (text, place) =>
  text.replaceAll('{place}', place.en).replaceAll('{place_bn}', place.bn).replaceAll('{loc_bn}', place.loc);

export const USERS = [
  { email: 'reader@inkwell.com.bd', password: 'reader123', name: 'Nusrat Jahan', name_bn: 'নুসরাত জাহান', role: 'reader', avatar_color: '#0f766e', title: 'Reader', bio: 'Architect in Dhanmondi. Reads about design, food and rivers.' },
  { email: 'editor@inkwell.com.bd', password: 'editor123', name: 'Tanvir Ahmed', name_bn: 'তানভীর আহমেদ', role: 'editor', avatar_color: '#b45309', title: 'Editor-in-chief', bio: 'Runs the Inkwell studio. Former features editor in Dhaka.' },
  { email: 'desk@inkwell.com.bd', password: 'editor123', name: 'Farhana Rahman', name_bn: 'ফারহানা রহমান', role: 'editor', avatar_color: '#be123c', title: 'Desk editor', bio: 'Copy desk, Bengali style guide and late-night proofs.' },
  { email: 'rafiq@inkwell.com.bd', password: 'reader123', name: 'Rafiqul Islam', name_bn: 'রফিকুল ইসলাম', role: 'reader', avatar_color: '#4338ca', title: 'Reader', bio: 'Banker in Chattogram.' },
  { email: 'sumaiya@inkwell.com.bd', password: 'reader123', name: 'Sumaiya Akter', name_bn: 'সুমাইয়া আক্তার', role: 'reader', avatar_color: '#c2410c', title: 'Reader', bio: 'Graduate student in Sylhet.' },
  { email: 'arif@inkwell.com.bd', password: 'reader123', name: 'Arif Hossain', name_bn: 'আরিফ হোসেন', role: 'reader', avatar_color: '#1e3a8a', title: 'Reader', bio: 'Software engineer, Rajshahi.' },
];

function wipe() {
  db.exec(`
    DELETE FROM events; DELETE FROM progress; DELETE FROM bookmarks; DELETE FROM reviews;
    DELETE FROM subscriptions; DELETE FROM library; DELETE FROM articles; DELETE FROM issues;
    DELETE FROM magazines; DELETE FROM categories; DELETE FROM users;
    DELETE FROM sqlite_sequence;
  `);
  for (const f of fs.readdirSync(COVER_DIR)) fs.rmSync(path.join(COVER_DIR, f), { force: true });
}

function buildBody(pool, place) {
  const own = shuffle(pool.paragraphs);
  const generic = shuffle(GENERIC_PARAGRAPHS);
  const order = [own[0], generic[0], own[1], own[2] || own[0], generic[1]];
  if (rand() > 0.4) order.push(generic[2]);
  if (own[3] && rand() > 0.5) order.splice(4, 0, own[3]);
  return {
    en: order.map((p) => fill(p.en, place)).join('\n\n'),
    bn: order.map((p) => fill(p.bn, place)).join('\n\n'),
  };
}

const firstSentence = (text, lang) => {
  const para = text.split('\n\n')[0];
  const m = lang === 'bn' ? para.match(/^.*?[।?!]/) : para.match(/^.*?[.?!](\s|$)/);
  return (m ? m[0] : para).trim();
};

export async function seed({ force = false, log = console.log } = {}) {
  const { n } = db.prepare('SELECT COUNT(*) AS n FROM users').get();
  if (n > 0 && !force) {
    log('[seed] database already populated — skipping (use --force to re-seed)');
    return false;
  }
  log('[seed] seeding Inkwell demo data…');

  // Cover processing is async, so do it before the synchronous transaction.
  const covers = {};
  for (const m of MAGAZINES) {
    if (!m.image) continue;
    const file = path.join(SEED_IMG_DIR, m.image);
    if (!fs.existsSync(file)) continue;
    covers[m.slug] = { pending: fs.readFileSync(file) };
  }
  const passwordHashes = Object.fromEntries(USERS.map((u) => [u.email, bcrypt.hashSync(u.password, 10)]));

  if (force || n > 0) wipe();
  for (const slug of Object.keys(covers)) covers[slug] = await processCover(covers[slug].pending, slug);

  const stats = {};
  db.transaction(() => {
    // Users
    const insUser = db.prepare(`INSERT INTO users (email,password_hash,name,name_bn,role,avatar_color,title,bio,created_at)
      VALUES (@email,@hash,@name,@name_bn,@role,@avatar_color,@title,@bio,@created_at)`);
    const users = USERS.map((u, i) => {
      const info = insUser.run({ ...u, hash: passwordHashes[u.email], created_at: daysAgo(120 - i * 5) });
      return { ...u, id: Number(info.lastInsertRowid) };
    });
    const editor = users.find((u) => u.role === 'editor');
    const readers = users.filter((u) => u.role === 'reader');

    // Categories
    const insCat = db.prepare('INSERT INTO categories (slug,name_en,name_bn,color) VALUES (@slug,@name_en,@name_bn,@color)');
    const catId = {};
    for (const c of CATEGORIES) catId[c.slug] = Number(insCat.run(c).lastInsertRowid);

    // Magazines → issues → articles
    const insMag = db.prepare(`INSERT INTO magazines
      (slug,title_en,title_bn,tagline_en,tagline_bn,description_en,description_bn,category_id,language,frequency,
       price_poisha,status,cover_color,cover_accent,cover_style,cover_url,cover_thumb,cover_lang,publisher,owner_id,created_at,updated_at)
      VALUES (@slug,@title_en,@title_bn,@tagline_en,@tagline_bn,@description_en,@description_bn,@category_id,@language,@frequency,
       @price_poisha,@status,@cover_color,@cover_accent,@cover_style,@cover_url,@cover_thumb,@cover_lang,@publisher,@owner_id,@created_at,@created_at)`);
    const insIssue = db.prepare(`INSERT INTO issues (magazine_id,number,title_en,title_bn,published_at,created_at)
      VALUES (?,?,?,?,?,?)`);
    const insArticle = db.prepare(`INSERT INTO articles
      (issue_id,magazine_id,title_en,title_bn,dek_en,dek_bn,author,body_en,body_bn,word_count,read_minutes,position,status,created_at,updated_at)
      VALUES (@issue_id,@magazine_id,@title_en,@title_bn,@dek_en,@dek_bn,@author,@body_en,@body_bn,@word_count,@read_minutes,@position,@status,@created_at,@created_at)`);

    const mags = [];
    const articles = [];
    let issueCounter = 0;
    const now = new Date();
    for (const [mi, m] of MAGAZINES.entries()) {
      const cover = covers[m.slug];
      const magId = Number(insMag.run({
        ...m, category_id: catId[m.category], frequency: m.frequency || 'monthly', price_poisha: m.price * 100,
        cover_url: cover?.url ?? null, cover_thumb: cover?.thumb ?? null, cover_lang: cover ? m.cover_lang : null,
        owner_id: editor.id, created_at: daysAgo(150 - mi * 6),
      }).lastInsertRowid);
      const mag = { ...m, id: magId, articles: [] };
      mags.push(mag);

      const pool = POOLS[m.slug];
      const templated = shuffle(PLACES).flatMap((place, k) => {
        const t = pool.templates[k % pool.templates.length];
        return [{ en: fill(t[0], place), bn: fill(t[1], place), place }];
      });
      const titleQueue = [
        ...shuffle(pool.titles).map(([en, bn]) => ({ en, bn, place: pick(PLACES) })),
        ...templated,
      ];

      const issueCount = m.status === 'published' ? 3 : 2;
      const step = m.frequency === 'quarterly' ? 3 : 1;
      for (let k = 0; k < issueCount; k++) {
        const monthsBack = (issueCount - 1 - k) * step;
        const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsBack, 1 + (mi % 5)));
        const theme = pool.themes[k % pool.themes.length];
        const number = 10 + mi * 3 + k;
        const titleEn = `No. ${number} · ${theme[0]} · ${EN_MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
        const titleBn = `সংখ্যা ${toBnDigits(number)} · ${theme[1]} · ${BN_MONTHS[d.getUTCMonth()]} ${toBnDigits(d.getUTCFullYear())}`;
        const issueDate = d > now ? now : d;
        const issueId = Number(insIssue.run(magId, number, titleEn, titleBn, sqlTime(issueDate).slice(0, 10), sqlTime(issueDate)).lastInsertRowid);

        const perIssue = (issueCounter * 7) % 25 < 18 ? 5 : 4;
        issueCounter += 1;
        for (let p = 0; p < perIssue; p++) {
          const t = titleQueue.shift();
          const body = buildBody(pool, t.place);
          const words = countWords(body.en);
          const isLatest = k === issueCount - 1;
          const status = m.status === 'draft' || (isLatest && p === perIssue - 1 && mi % 2 === 0) ? 'draft' : 'published';
          const created = sqlTime(new Date(issueDate.getTime() - (perIssue - p) * 3600000 * 20));
          const id = Number(insArticle.run({
            issue_id: issueId, magazine_id: magId, title_en: t.en, title_bn: t.bn,
            dek_en: firstSentence(body.en, 'en'), dek_bn: firstSentence(body.bn, 'bn'),
            author: pick(AUTHORS), body_en: body.en, body_bn: body.bn, word_count: words,
            read_minutes: Math.max(2, Math.ceil(words / 200)), position: p, status, created_at: created,
          }).lastInsertRowid);
          const art = { id, magazine_id: magId, status };
          mag.articles.push(art);
          articles.push(art);
        }
      }
    }

    const published = mags.filter((m) => m.status === 'published');
    const readable = (m) => m.articles.filter((a) => a.status === 'published');

    // Library, subscriptions, reviews, bookmarks, progress
    const insLib = db.prepare('INSERT OR IGNORE INTO library (user_id,magazine_id,added_at) VALUES (?,?,?)');
    const insSub = db.prepare(`INSERT OR IGNORE INTO subscriptions (user_id,magazine_id,plan,price_poisha,status,started_at,renews_at,cancelled_at)
      VALUES (?,?,?,?,?,?,?,?)`);
    const insRev = db.prepare('INSERT OR IGNORE INTO reviews (user_id,magazine_id,rating,body,lang,created_at,updated_at) VALUES (?,?,?,?,?,?,?)');
    const insBm = db.prepare('INSERT OR IGNORE INTO bookmarks (user_id,article_id,created_at) VALUES (?,?,?)');
    const insProg = db.prepare('INSERT OR REPLACE INTO progress (user_id,article_id,percent,updated_at) VALUES (?,?,?,?)');
    const insEvent = db.prepare('INSERT INTO events (user_id,type,magazine_id,article_id,created_at) VALUES (?,?,?,?,?)');

    let reviewIdx = 0;
    const libraryOf = {};
    for (const [ui, u] of users.entries()) {
      const isDemoReader = u.email === 'reader@inkwell.com.bd';
      const lib = isDemoReader
        ? published.filter((m) => ['noksha', 'dhaka-table', 'nodimatrik', 'byte-bangla'].includes(m.slug))
        : shuffle(published).slice(0, int(2, 4));
      libraryOf[u.id] = lib;
      lib.forEach((m, k) => insLib.run(u.id, m.id, daysAgo(60 - k * 7, 12)));

      // Subscriptions
      const subs = lib.slice(0, isDemoReader ? 3 : int(1, 2));
      subs.forEach((m, k) => {
        const plan = k === 1 ? 'yearly' : 'monthly';
        const price = plan === 'yearly' ? m.price * 1000 : m.price * 100;
        const started = daysAgo(50 - k * 9, 10);
        const cancelled = (isDemoReader && k === 2) || (!isDemoReader && rand() > 0.75);
        const renews = sqlTime(new Date(Date.now() + (plan === 'yearly' ? 300 : int(3, 28)) * 86400000));
        insSub.run(u.id, m.id, plan, price, cancelled ? 'cancelled' : 'active', started, cancelled ? null : renews, cancelled ? daysAgo(int(2, 10)) : null);
        insEvent.run(u.id, 'subscribe', m.id, null, started);
      });

      // Reviews (a few per reader, editors review too so averages are lively)
      shuffle(published).slice(0, isDemoReader ? 2 : int(2, 4)).forEach((m) => {
        const r = REVIEWS[reviewIdx++ % REVIEWS.length];
        const at = daysAgo(int(3, 40), 12);
        insRev.run(u.id, m.id, r.rating, r.body, r.lang, at, at);
      });

      // Bookmarks
      const libArticles = lib.flatMap(readable);
      shuffle(libArticles).slice(0, isDemoReader ? 8 : int(2, 4)).forEach((a) => {
        insBm.run(u.id, a.id, daysAgo(int(0, 30), 20));
        insEvent.run(u.id, 'bookmark', a.magazine_id, a.id, daysAgo(int(0, 30), 20));
      });

      // Reading progress (~14 rows per user)
      const pool = shuffle([...libArticles, ...shuffle(published.flatMap(readable)).slice(0, 6)]);
      const seen = new Set();
      let made = 0;
      for (const a of pool) {
        if (made >= 14 || seen.has(a.id)) continue;
        seen.add(a.id);
        const percent = made < 4 ? int(18, 82) : rand() > 0.35 ? 100 : int(10, 95);
        insProg.run(u.id, a.id, percent, daysAgo(made < 4 ? made * 0.6 : int(1, 40), 18));
        made += 1;
      }
      void ui;
    }

    // Analytics events: ~660 over 90 days, gently trending up.
    const weights = published.map((m, i) => ({ m, w: 6 - (i % 4) }));
    const totalW = weights.reduce((s, x) => s + x.w, 0);
    const weightedMag = () => {
      let r = rand() * totalW;
      for (const x of weights) { r -= x.w; if (r <= 0) return x.m; }
      return weights[0].m;
    };
    const current = db.prepare('SELECT COUNT(*) AS n FROM events').get().n;
    for (let i = current; i < 660; i++) {
      const day = Math.floor(Math.pow(rand(), 1.35) * 90); // skew toward recent days
      const m = weightedMag();
      const r = rand();
      const type = r < 0.72 ? 'read' : r < 0.95 ? 'open' : 'share';
      const art = type === 'open' ? null : pick(readable(m));
      const user = rand() < 0.8 ? pick(users).id : null;
      insEvent.run(user, type, m.id, art?.id ?? null, daysAgo(day, 23));
    }

    Object.assign(stats, {
      users: users.length, readers: readers.length, categories: CATEGORIES.length, magazines: mags.length,
      issues: db.prepare('SELECT COUNT(*) n FROM issues').get().n,
      articles: articles.length,
      progress: db.prepare('SELECT COUNT(*) n FROM progress').get().n,
      events: db.prepare('SELECT COUNT(*) n FROM events').get().n,
      covers: Object.keys(covers).length,
    });
  })();

  log(`[seed] done: ${JSON.stringify(stats)}`);
  return stats;
}

// CLI: `npm run seed` / `npm run seed -- --force`
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  seed({ force: process.argv.includes('--force') })
    .then(() => process.exit(0))
    .catch((err) => { console.error(err); process.exit(1); });
}
