# ইঙ্কওয়েল / Inkwell — a Bangladeshi magazine newsstand & publishing studio

A full-stack publication platform in the spirit of Magzter, **built only for the Bangladesh
market**: Bengali and English publications side by side, ৳ (BDT) pricing, and a bilingual
interface. Readers browse the catalogue, read full issues in the browser, keep a shelf,
bookmark pieces, subscribe and track progress. Publishers get a studio with real CRUD,
cover uploads, drafts, analytics and subscriber revenue.

Built for **both personas** the brief asked for: a reader storefront *and* an admin CMS.

---

## Run it

```bash
cd inkwell
npm install
npm run dev          # builds the client once if dist/ is missing or stale, then serves client + API on :3000
```

First boot seeds the database automatically, so the app is populated on the very first load.
For hot reload while developing the UI, run `node server/index.js` and `npx vite` side by side —
Vite serves on `:5173` and proxies `/api` to the Express server.

| command | what it does |
| --- | --- |
| `npm run dev` / `npm start` | Express API + built SPA on `http://0.0.0.0:3000` (`PORT` overrides) |
| `npm run build` | Vite production build → `dist/` |
| `npm run seed -- --force` | wipe and re-seed demo data |
| `npm run seed` | seed only if the database is empty |

Data lives in `server/data/inkwell.db` (SQLite, WAL mode) and **persists across restarts** —
library entries, subscriptions, reviews, bookmarks, reading progress, drafts and analytics
events are all real rows you can edit.

## Bangladesh market

| Concern | Decision |
| --- | --- |
| Language | Bengali (`bn`) and English (`en`) publications, plus `both` bilingual titles. Every magazine keeps English **and** Bengali title, tagline and description; articles store both bodies. |
| Pricing | Stored in poisha, displayed as **৳** (e.g. `৳350/mo`, `৳450/mo`). Typical BD digital range is ৳250–৳450. |
| UI language | বাংলা is the default; a `বাংলা / EN` switch in the header persists the choice. |
| Reading language | Independent of the UI: each article has a বাংলা / English toggle so a reader can keep an English interface but read Bengali text (or the reverse). |
| Typography | Noto Serif/Sans Bengali with Noto Serif/Sans for Latin, **self-hosted** via `@fontsource` (no Google Fonts round-trip; unicode-range subsets load on demand). The Latin drop cap and letter-spaced labels are disabled for Bengali because they break conjunct clusters. |
| Locale details | Categories are bilingual (নকশা / Design), seed content names Dhaka, Chattogram, Sylhet, Kuakata, Tanguar Haor, the Sundarbans. |

## Demo accounts

The login screen has one-click demo sign-in for all three:

| account | email | password | can do |
| --- | --- | --- | --- |
| Reader (পাঠক) | `reader@inkwell.com.bd` | `reader123` | read, bookmark, subscribe, review |
| Editor (সম্পাদক, admin) | `editor@inkwell.com.bd` | `editor123` | everything + full studio |
| Desk editor (ডেস্ক) | `desk@inkwell.com.bd` | `editor123` | everything + full studio |

New sign-ups can choose **reader** or **publisher**; readers are blocked from `/studio`
(both in the UI and by `requireEditor` on the API).

## Cover uploads

Publishers can upload a real cover from the studio:

- Drag-and-drop or click-to-browse, PNG / JPEG / WebP / AVIF, max 8 MB
- The server (`sharp`) normalises the cover (≤1200×1600, mojibake-free re-encode) **and
  generates a 300×400 thumbnail** that is used on cards, lists, bookmarks and the sidebar
- Uploaded files are served from `/api/uploads/*` with immutable caching
- Replacing a cover deletes the old generated files; the immediate preview is optimistic
  with rollback on failure
- Stored as `magazines.cover_url` + `magazines.cover_thumb`; issues inherit the publication's
  art unless they have their own. `cover_lang` records which language is printed on the art
- If an image ever fails to load, the card falls back to the generative SVG cover

## What's seeded

6 bilingual categories · 9 publications (7 published, 2 in draft; 4 Bengali-only, 3 bilingual,
2 English-only — one of each draft is Bengali and English) · 25 issues · 118 articles **with English and Bengali bodies** · 6 Bangladeshi
users · library entries, subscriptions in ৳, bilingual reviews, bookmarks, ~84 progress rows
and ~660 analytics events over 90 days. Eight cover photographs ship in `server/uploads/` so
thumbnails are real on first load.

---

## Features

**Reader side**
- Marketing landing page with generative cover art (SVG, no external images)
- Dashboard: stat tiles, continue-reading with progress bars, 14-day reading chart,
  activity feed, recommendations derived from library categories
- Discover: category rail, search, sort, grid/list views, skeleton + empty states
- Magazine detail: issues accordion → article list, ratings, reviews (create/edit/delete)
- Reader view: scroll-tracked reading progress, resume anywhere, font-size control,
  issue table of contents, bookmark, share, prev/next article, drop cap typography
- Library, Bookmarks (grouped by publication, undo on removal), Subscriptions
  (cancel → reactivate, plan picker, monthly totals)

**Publishing studio (editors)**
- Analytics: 30-day reads chart, catalogue mix, most-read titles/articles, MRR, drafts
- Publications: full CRUD, inline status changes, colour-picker covers with live preview,
  delete confirmation with cascade warning, deep link `?edit=<id>`
- Articles: full CRUD with publication → issue pickers, word count, publish/draft toggle,
  grouped-by-publication table
- Settings: profile, avatar colour, role display

**Craft details**
- Optimistic updates everywhere (library toggles, deletes with undo, status switches)
- Loading skeletons, purposeful empty states, toasts, rollback on failure
- Responsive from 390 px up — sidebar collapses to a drawer, tables reflow, magazine
  hero stacks
- Cookie (JWT) auth with bcrypt hashing and role guards. The cookie is `SameSite=None; Secure;
  Partitioned` over HTTPS so it works inside embedded previews, and the token is also sent as a
  `Bearer` header as a fallback for browsers that block third-party cookies

## Stack

- **Frontend** — React 18, React Router 6, Tailwind CSS 3, Recharts, lucide-react, Vite
- **Backend** — Express 4, better-sqlite3, jsonwebtoken, bcryptjs, sharp
- **Data** — SQLite (`server/db.js` schema), seeded by `server/seed.js`

```
server/
  db.js        schema + slug helpers
  content.js   bilingual seed copy (titles, paragraphs, places, reviews)
  seed.js      demo data generator
  covers.js    sharp pipeline: normalise cover + 300×400 thumbnail
  index.js     REST API + static SPA host
  uploads/seed/  the eight shipped cover photographs (generated covers go to uploads/covers/, git-ignored)
supabase/
  schema.sql   Postgres mirror with RLS policies
src/
  lib/         api client, auth context, toast, useFetch
  components/  Shell (sidebar), ui.jsx (covers, cards, states, modal)
  pages/       Landing, Auth, Dashboard, Discover, Magazine, Reader, Library,
               Bookmarks, Subscriptions, Settings, studio/*
```

## API surface (all JSON, cookie auth)

```
POST   /api/auth/register | login | logout | demo     GET/PATCH /api/auth/me
GET    /api/categories
GET    /api/magazines            POST   /api/magazines
GET    /api/magazines/:idOrSlug  PATCH  /api/magazines/:id     DELETE /api/magazines/:id
GET    /api/magazines/:id/issues POST   /api/issues            PATCH/DELETE /api/issues/:id
GET    /api/articles             POST   /api/articles          PATCH/DELETE /api/articles/:id
GET    /api/articles/:id         (returns siblings, progress, bookmarks, next/prev)
GET    /api/me/library           POST/DELETE /api/me/library/:magazineId
GET    /api/me/bookmarks         POST/DELETE /api/me/bookmarks/:articleId
POST   /api/me/progress/:articleId
GET    /api/me/subscriptions     POST /api/subscriptions  POST /api/subscriptions/:id/cancel
POST   /api/magazines/:id/reviews  DELETE /api/reviews/:id
POST   /api/uploads                 (editor only, base64 JSON → cover + 300×400 thumbnail)
DELETE /api/uploads                 (editor only, removes a generated cover)
GET    /api/dashboard  /api/analytics  /api/search  /api/health
GET    /api/magazines?language=bn|en|all   (bilingual catalogue filter)
```

## Moving to Supabase / Vercel

`supabase/schema.sql` mirrors this schema for Postgres (tables, FKs, indexes, RLS-ready
policies for a `user_id` column pattern). The API layer is thin — every route maps to a
single table operation — so swapping `better-sqlite3` calls for `supabase-js` queries is
mechanical. On Vercel, deploy the client as a static build and the Express app as a
serverless function; `PORT` is read from the environment and the server already binds
`0.0.0.0`. SQLite files don't persist on serverless platforms, so move the data layer to Supabase
(and covers to a Storage bucket — see the commented policies at the end of `schema.sql`) before deploying there.

> Note: the app ships with its own persistent SQLite layer rather than a live Supabase project,
> so nothing here depends on credentials. Set `JWT_SECRET` in production; otherwise a random secret
> is generated and stored in `server/data/.jwt-secret`.
