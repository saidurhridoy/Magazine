import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, X, Loader2, Inbox, AlertTriangle, Check, Plus } from 'lucide-react';
import { useLang } from '../lib/i18n.jsx';

/* ───────────────────── covers ───────────────────── */

function hash(str) {
  let h = 2166136261;
  for (const c of String(str)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  return Math.abs(h);
}

/** Masthead language: Bengali titles for bn publications, English for en, UI language for bilingual. */
function mastheadTitle(mag, lang) {
  if (mag.language === 'bn') return mag.title_bn || mag.title_en;
  if (mag.language === 'en') return mag.title_en || mag.title_bn;
  return (lang === 'bn' ? mag.title_bn : mag.title_en) || mag.title_en || mag.title_bn;
}

function Pattern({ style, accent, seed }) {
  const r = (n) => (seed >> n) % 100;
  switch (style) {
    case 'grid':
      return (
        <g stroke={accent} strokeOpacity=".35" strokeWidth="1">
          {Array.from({ length: 11 }, (_, i) => <line key={'v' + i} x1={i * 30} y1="110" x2={i * 30} y2="400" />)}
          {Array.from({ length: 10 }, (_, i) => <line key={'h' + i} x1="0" y1={110 + i * 30} x2="300" y2={110 + i * 30} />)}
          <rect x={60 + (r(2) % 4) * 30} y={170 + (r(5) % 3) * 30} width="90" height="120" fill={accent} fillOpacity=".85" stroke="none" />
          <rect x={30 + (r(7) % 5) * 30} y={260} width="30" height="30" fill={accent} fillOpacity=".5" stroke="none" />
        </g>
      );
    case 'waves':
      return (
        <g fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round">
          {Array.from({ length: 9 }, (_, i) => {
            const y = 190 + i * 22; const a = 8 + (i % 3) * 4; const o = (r(i % 8) % 40);
            return <path key={i} strokeOpacity={0.25 + i * 0.08} d={`M -20 ${y} q ${40 + o / 4} -${a} 80 0 t 80 0 t 80 0 t 80 0 t 80 0`} />;
          })}
          <circle cx={200 + (r(3) % 50)} cy="150" r="26" fill={accent} stroke="none" />
        </g>
      );
    case 'circles':
      return (
        <g>
          <circle cx={150 + (r(1) % 60) - 30} cy="250" r="105" fill={accent} fillOpacity=".9" />
          <circle cx={150 + (r(1) % 60) - 30} cy="250" r="70" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="1.5" />
          <circle cx={60 + (r(4) % 40)} cy="350" r="22" fill="#fff" fillOpacity=".25" />
          <circle cx={240} cy={150 + (r(6) % 30)} r="10" fill={accent} />
        </g>
      );
    case 'stripes':
      return (
        <g>
          <clipPath id={`clip-${seed}`}><rect x="0" y="150" width="300" height="250" /></clipPath>
          <g clipPath={`url(#clip-${seed})`}>
            {Array.from({ length: 14 }, (_, i) => (
              <rect key={i} x={-200 + i * 40} y="100" width="16" height="420" fill={accent} fillOpacity={i % 3 === 0 ? 0.9 : 0.35} transform="rotate(-28 150 275)" />
            ))}
          </g>
        </g>
      );
    case 'arcs':
    default:
      return (
        <g fill="none" stroke={accent} strokeWidth="14">
          {Array.from({ length: 6 }, (_, i) => (
            <circle key={i} cx="300" cy="400" r={60 + i * 42} strokeOpacity={0.95 - i * 0.14} />
          ))}
        </g>
      );
  }
}

export function GenerativeCover({ mag, label, className = '' }) {
  const { lang } = useLang();
  const title = mastheadTitle(mag, lang);
  const seed = hash((mag.slug || mag.title_en || '') + (mag.cover_style || ''));
  const size = title.length > 14 ? 28 : title.length > 9 ? 36 : 46;
  const bnTitle = /[\u0980-\u09FF]/.test(title);
  return (
    <svg viewBox="0 0 300 400" className={`block h-full w-full ${className}`} role="img" aria-label={title} preserveAspectRatio="xMidYMid slice">
      <rect width="300" height="400" fill={mag.cover_color || '#0f766e'} />
      <Pattern style={mag.cover_style} accent={mag.cover_accent || '#f59e0b'} seed={seed} />
      <text x="22" y="64" fill="#fff" fontSize={size} fontWeight="700"
        fontFamily={bnTitle ? '"Noto Serif Bengali", serif' : '"Noto Serif", Georgia, serif'}>{title}</text>
      <line x1="22" y1="84" x2="278" y2="84" stroke="#fff" strokeOpacity=".5" />
      {label && <text x="22" y="102" fill="#fff" fillOpacity=".8" fontSize="11" fontFamily='"Noto Sans", "Noto Sans Bengali", sans-serif' letterSpacing="1.5">{label}</text>}
    </svg>
  );
}

/**
 * Publication cover. Uses the uploaded photo (thumbnail by default) with a
 * masthead overlay; falls back to the generative SVG if there is no photo or it fails to load.
 */
export function Cover({ mag, full = false, label, className = '', rounded = 'rounded-lg', masthead = true }) {
  const { lang } = useLang();
  const src = full ? mag?.cover_url || mag?.cover_thumb : mag?.cover_thumb || mag?.cover_url;
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (!mag) return <div className={`aspect-[3/4] skeleton ${rounded} ${className}`} />;
  const title = mastheadTitle(mag, lang);
  const bnTitle = /[\u0980-\u09FF]/.test(title);
  return (
    <div className={`relative aspect-[3/4] overflow-hidden bg-paper-200 shadow-cover ${rounded} ${className}`} style={{ containerType: 'inline-size' }}>
      {src && !failed ? (
        <>
          <img src={src} alt={title} loading="lazy" decoding="async" onError={() => setFailed(true)} className="absolute inset-0 h-full w-full object-cover" />
          {masthead && (
            <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/65 via-black/25 to-transparent px-[7%] pb-[18%] pt-[6%]">
              <div className={`${bnTitle ? 'font-bnserif' : 'font-serif'} font-bold leading-tight text-white drop-shadow`}
                style={{ fontSize: title.length > 12 ? 'clamp(10px, 9cqw, 40px)' : 'clamp(11px, 12cqw, 52px)' }}>
                {title}
              </div>
              {label && <div className="mt-1 text-[9px] font-medium uppercase tracking-widest text-white/80">{label}</div>}
            </div>
          )}
        </>
      ) : (
        <GenerativeCover mag={mag} label={label} className="absolute inset-0" />
      )}
    </div>
  );
}

/* ───────────────────── badges & bits ───────────────────── */

export function LangBadge({ code, className = '' }) {
  const { languageName } = useLang();
  const styles = { bn: 'bg-delta-50 text-delta-700', en: 'bg-indigo-50 text-indigo-700', both: 'bg-amber-50 text-amber-800' };
  return <span className={`chip ${styles[code] || 'bg-paper-200'} ${className}`}>{code === 'both' ? 'বাং · EN' : code === 'bn' ? 'বাংলা' : 'EN'}<span className="sr-only"> {languageName(code)}</span></span>;
}

export function StatusBadge({ status }) {
  const { L } = useLang();
  return status === 'published'
    ? <span className="chip bg-emerald-50 text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{L('Published', 'প্রকাশিত')}</span>
    : <span className="chip bg-paper-200 text-ink-500"><span className="h-1.5 w-1.5 rounded-full bg-ink-300" />{L('Draft', 'খসড়া')}</span>;
}

export function Stars({ value = 0, size = 14, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} aria-label={`${value} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} className={i <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'fill-paper-200 text-paper-300'} />
      ))}
    </span>
  );
}

export function StarInput({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <span className="inline-flex gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <button type="button" key={i} onMouseEnter={() => setHover(i)} onClick={() => onChange(i)} aria-label={`${i} stars`}>
          <Star size={24} className={i <= (hover || value) ? 'fill-amber-400 text-amber-400' : 'fill-paper-100 text-paper-300'} />
        </button>
      ))}
    </span>
  );
}

export function ProgressBar({ value = 0, className = '', tone = 'delta' }) {
  return (
    <div className={`h-1.5 overflow-hidden rounded-full bg-paper-200 ${className}`}>
      <div className={`h-full rounded-full transition-all ${tone === 'delta' ? 'bg-delta' : 'bg-amber-500'}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function Avatar({ user, size = 36 }) {
  const name = user?.name || '?';
  const initials = name.split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  return (
    <span className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{ width: size, height: size, background: user?.avatar_color || '#57534e', fontSize: size * 0.38 }}>
      {initials}
    </span>
  );
}

export function Spinner({ size = 18, className = '' }) {
  return <Loader2 size={size} className={`animate-spin ${className}`} />;
}

export function StatTile({ icon: Icon, label, value, hint, tone = 'delta' }) {
  const tones = { delta: 'bg-delta-50 text-delta-700', amber: 'bg-amber-50 text-amber-700', rose: 'bg-rose-50 text-rose-700', indigo: 'bg-indigo-50 text-indigo-700' };
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-ink-400">{label}</span>
        {Icon && <span className={`rounded-lg p-1.5 ${tones[tone]}`}><Icon size={16} /></span>}
      </div>
      <div className="mt-2 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">{value}</div>
      {hint && <div className="mt-1 text-xs text-ink-400">{hint}</div>}
    </div>
  );
}

export function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <div className="eyebrow mb-1">{eyebrow}</div>}
        <h1 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-2xl text-sm text-ink-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ───────────────────── states ───────────────────── */

export function EmptyState({ icon: Icon = Inbox, title, body, action }) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      <span className="mb-4 rounded-2xl bg-paper-100 p-4 text-ink-400"><Icon size={28} /></span>
      <h3 className="font-serif text-lg font-semibold">{title}</h3>
      {body && <p className="mt-1.5 max-w-sm text-sm text-ink-500">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  const { L } = useLang();
  return (
    <div className="card flex flex-col items-center px-6 py-12 text-center">
      <AlertTriangle className="mb-3 text-sun" size={28} />
      <h3 className="font-serif text-lg font-semibold">{L('Something went wrong', 'কিছু একটা ভুল হয়েছে')}</h3>
      <p className="mt-1 text-sm text-ink-500">{error?.message}</p>
      {onRetry && <button className="btn-outline mt-4" onClick={() => onRetry()}>{L('Try again', 'আবার চেষ্টা করুন')}</button>}
    </div>
  );
}

export function CardGridSkeleton({ n = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: n }, (_, i) => (
        <div key={i}><div className="skeleton aspect-[3/4]" /><div className="skeleton mt-3 h-4 w-3/4" /><div className="skeleton mt-2 h-3 w-1/2" /></div>
      ))}
    </div>
  );
}

export function RowsSkeleton({ n = 5 }) {
  return <div className="space-y-3">{Array.from({ length: n }, (_, i) => <div key={i} className="skeleton h-16" />)}</div>;
}

/* ───────────────────── modal ───────────────────── */

export function Modal({ open, onClose, title, children, footer, wide = false }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/40 p-0 backdrop-blur-sm sm:items-center sm:p-6" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div role="dialog" aria-modal="true" className={`flex max-h-[92vh] w-full animate-rise flex-col rounded-t-3xl bg-white shadow-cover sm:rounded-3xl ${wide ? 'sm:max-w-4xl' : 'sm:max-w-lg'}`}>
        <div className="flex items-center justify-between border-b border-paper-200 px-5 py-4 sm:px-6">
          <h2 className="font-serif text-lg font-semibold">{title}</h2>
          <button className="rounded-full p-1.5 text-ink-400 hover:bg-paper-100 hover:text-ink" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-paper-200 px-5 py-4 sm:px-6">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, title, body, confirmLabel, onConfirm, onClose, busy }) {
  const { L } = useLang();
  return (
    <Modal open={open} onClose={onClose} title={title}
      footer={<>
        <button className="btn-ghost" onClick={onClose}>{L('Cancel', 'বাতিল')}</button>
        <button className="btn-danger" onClick={onConfirm} disabled={busy}>{busy && <Spinner size={14} />}{confirmLabel || L('Delete', 'মুছুন')}</button>
      </>}>
      <div className="text-sm text-ink-600">{body}</div>
    </Modal>
  );
}

/* ───────────────────── magazine cards ───────────────────── */

export function MagazineCard({ mag, onToggleLibrary, showStatus = false }) {
  const { pick, taka, perMonth, num, L } = useLang();
  return (
    <div className="group animate-rise">
      <Link to={`/m/${mag.slug}`} className="block transition duration-300 group-hover:-translate-y-1">
        <Cover mag={mag} />
      </Link>
      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link to={`/m/${mag.slug}`} className="block truncate font-serif text-[15px] font-semibold leading-snug hover:text-delta">{pick(mag, 'title')}</Link>
          <div className="mt-0.5 line-clamp-1 text-xs text-ink-400">{pick(mag, 'tagline')}</div>
        </div>
        {onToggleLibrary && (
          <button onClick={() => onToggleLibrary(mag)} title={mag.in_library ? L('In your library', 'লাইব্রেরিতে আছে') : L('Add to library', 'লাইব্রেরিতে যোগ করুন')}
            className={`mt-0.5 shrink-0 rounded-full border p-1.5 transition ${mag.in_library ? 'border-delta bg-delta text-white' : 'border-paper-300 text-ink-400 hover:border-delta hover:text-delta'}`}>
            {mag.in_library ? <Check size={13} /> : <Plus size={13} />}
          </button>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
        <LangBadge code={mag.language} />
        {showStatus && <StatusBadge status={mag.status} />}
        <span className="font-semibold text-ink-600">{taka(mag.price_poisha)}<span className="font-normal text-ink-400">{perMonth}</span></span>
        {mag.rating ? <span className="inline-flex items-center gap-0.5 text-ink-500"><Star size={11} className="fill-amber-400 text-amber-400" />{num(mag.rating)}</span> : null}
      </div>
    </div>
  );
}

export function MagazineRow({ mag, onToggleLibrary, right }) {
  const { pick, taka, perMonth, num, L } = useLang();
  return (
    <div className="card flex animate-rise items-center gap-4 p-3 sm:p-4">
      <Link to={`/m/${mag.slug}`} className="w-16 shrink-0 sm:w-20"><Cover mag={mag} masthead={false} rounded="rounded-md" /></Link>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link to={`/m/${mag.slug}`} className="font-serif text-base font-semibold hover:text-delta">{pick(mag, 'title')}</Link>
          <LangBadge code={mag.language} />
        </div>
        <p className="mt-0.5 line-clamp-2 text-sm text-ink-500">{pick(mag, 'tagline')}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-400">
          <span style={{ color: mag.category_color }}>{pick(mag, 'category')}</span>
          <span>{num(mag.article_count)} {L('articles', 'লেখা')}</span>
          {mag.rating ? <span className="inline-flex items-center gap-1"><Stars value={mag.rating} size={11} /> {num(mag.rating)}</span> : null}
          <span className="font-semibold text-ink-600">{taka(mag.price_poisha)}{perMonth}</span>
        </div>
      </div>
      {right}
      {onToggleLibrary && (
        <button onClick={() => onToggleLibrary(mag)} className={mag.in_library ? 'btn-outline btn-sm' : 'btn-primary btn-sm'}>
          {mag.in_library ? <><Check size={13} />{L('Saved', 'সংরক্ষিত')}</> : <><Plus size={13} />{L('Library', 'লাইব্রেরি')}</>}
        </button>
      )}
    </div>
  );
}
