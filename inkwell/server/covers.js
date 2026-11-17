import sharp from 'sharp';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { COVER_DIR } from './db.js';

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
export const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/avif'];

/**
 * Normalise a cover image: auto-rotate from EXIF, strip all metadata
 * (so no stray ICC/XMP text survives as mojibake), cap at 1200×1600,
 * re-encode to WebP and emit a 300×400 cover-cropped thumbnail.
 */
export async function processCover(buffer, prefix = 'cover') {
  const meta = await sharp(buffer).metadata();
  if (!meta.width || !meta.height) throw new Error('Unreadable image');
  const id = `${prefix}-${crypto.randomBytes(6).toString('hex')}`;
  const coverFile = `${id}.webp`;
  const thumbFile = `${id}-thumb.webp`;

  await sharp(buffer)
    .rotate()
    .resize({ width: 1200, height: 1600, fit: 'inside', withoutEnlargement: true })
    .toColourspace('srgb')
    .webp({ quality: 84 })
    .toFile(path.join(COVER_DIR, coverFile));

  await sharp(buffer)
    .rotate()
    .resize({ width: 300, height: 400, fit: 'cover', position: 'attention' })
    .toColourspace('srgb')
    .webp({ quality: 78 })
    .toFile(path.join(COVER_DIR, thumbFile));

  return {
    url: `/api/uploads/covers/${coverFile}`,
    thumb: `/api/uploads/covers/${thumbFile}`,
    width: Math.min(meta.width, 1200),
    height: meta.height,
  };
}

/** Delete a generated cover (and its thumbnail) — only files inside COVER_DIR. */
export function removeCoverFiles(...urls) {
  for (const url of urls) {
    if (!url || !url.startsWith('/api/uploads/covers/')) continue;
    const name = path.basename(url);
    const file = path.join(COVER_DIR, name);
    if (path.dirname(file) !== COVER_DIR) continue;
    fs.rm(file, { force: true }, () => {});
  }
}

export function decodeDataUrl(data) {
  const m = /^data:([a-z0-9.+/-]+);base64,(.+)$/i.exec(String(data || ''));
  if (!m) throw Object.assign(new Error('Expected a base64 data URL'), { status: 400 });
  const type = m[1].toLowerCase();
  if (!ALLOWED_TYPES.includes(type)) {
    throw Object.assign(new Error('Use PNG, JPEG, WebP or AVIF'), { status: 415 });
  }
  const buffer = Buffer.from(m[2], 'base64');
  if (buffer.length > MAX_UPLOAD_BYTES) {
    throw Object.assign(new Error('Image is larger than 8 MB'), { status: 413 });
  }
  return { type, buffer };
}
