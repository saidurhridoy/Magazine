// `npm run dev` / `npm start` serve the built SPA. Build it once if dist/ is missing
// (or older than src/), so a fresh clone works with a single command.
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const index = path.join(root, 'dist', 'index.html');

const newest = (dir) => {
  let t = 0;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    t = Math.max(t, e.isDirectory() ? newest(p) : fs.statSync(p).mtimeMs);
  }
  return t;
};

const srcTime = Math.max(newest(path.join(root, 'src')), fs.statSync(path.join(root, 'index.html')).mtimeMs);
if (!fs.existsSync(index) || fs.statSync(index).mtimeMs < srcTime) {
  console.log('[inkwell] building client…');
  execSync('npx vite build', { cwd: root, stdio: 'inherit' });
}
