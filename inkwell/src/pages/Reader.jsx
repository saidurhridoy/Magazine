import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Bookmark, BookmarkCheck, Share2, List, Minus, Plus, X, CircleCheck, Lock } from 'lucide-react';
import { useLang } from '../lib/i18n.jsx';
import { useAuth } from '../lib/auth.jsx';
import { useToast } from '../lib/toast.jsx';
import { useFetch } from '../lib/useFetch.js';
import { api } from '../lib/api.js';
import { Cover, ErrorState, Spinner, StatusBadge } from '../components/ui.jsx';
import { LangSwitch } from '../components/Shell.jsx';

const SIZES = [16, 17, 18, 20, 22, 24];
const store = {
  get: (k, d) => { try { return localStorage.getItem(k) ?? d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } },
};

export default function Reader() {
  const { id } = useParams();
  const { L, pick, num, date, lang: uiLang } = useLang();
  const { isEditor } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { data: a, setData, loading, error, reload } = useFetch(`/api/articles/${id}`);

  const [size, setSize] = useState(() => Number(store.get('inkwell.fontSize', 2)));
  const [readLang, setReadLang] = useState(null);
  const [toc, setToc] = useState(false);
  const [percent, setPercent] = useState(0);
  const articleRef = useRef(null);
  const lastSent = useRef(-1);
  const pending = useRef(null);
  const resumed = useRef(false);
  const latest = useRef(0);
  const finished = useRef(false); // re-reading a finished piece shouldn't mark it unfinished

  // Reading language: explicit choice > single-language publication > interface language.
  useEffect(() => {
    if (!a) return;
    const saved = store.get('inkwell.readLang', null);
    const hasBn = !!a.body_bn?.trim(); const hasEn = !!a.body_en?.trim();
    let l = saved || (a.magazine_language === 'en' ? 'en' : a.magazine_language === 'bn' ? 'bn' : uiLang);
    if (l === 'bn' && !hasBn) l = 'en';
    if (l === 'en' && !hasEn) l = 'bn';
    setReadLang(l);
  }, [a?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { store.set('inkwell.fontSize', size); }, [size]);
  useEffect(() => { finished.current = (a?.id === Number(id) && a?.progress >= 100); }, [a?.id, id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { resumed.current = false; lastSent.current = -1; latest.current = 0; setPercent(0); setToc(false); }, [id]);

  const send = useCallback((p) => {
    if (p === lastSent.current || (finished.current && p < 100)) return;
    lastSent.current = p;
    api.post(`/api/me/progress/${id}`, { percent: p }).catch(() => {});
  }, [id]);

  // Scroll tracking → progress bar + debounced save.
  useEffect(() => {
    if (!a || !readLang) return undefined;
    const onScroll = () => {
      const el = articleRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight * 0.6;
      const read = Math.min(Math.max(-rect.top + window.innerHeight * 0.4, 0), Math.max(total, 1));
      const p = total <= 0 ? 100 : Math.round((read / total) * 100);
      setPercent(p);
      latest.current = p;
      clearTimeout(pending.current);
      if (p > 0) pending.current = setTimeout(() => send(p >= 97 ? 100 : p), p >= 97 ? 0 : 1200);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(pending.current);
      if (latest.current > 0) send(latest.current >= 97 ? 100 : latest.current); // flush on leave
    };
  }, [a, readLang, send]);

  // Resume from saved position once text has rendered.
  useEffect(() => {
    if (!a || !readLang || resumed.current) return;
    resumed.current = true;
    const saved = a.progress;
    if (saved > 3 && saved < 97) {
      requestAnimationFrame(() => {
        const el = articleRef.current;
        if (!el) return;
        const top = el.offsetTop + (el.offsetHeight - window.innerHeight * 0.6) * (saved / 100) - window.innerHeight * 0.4;
        window.scrollTo({ top: Math.max(0, top), behavior: 'auto' });
        toast(L(`Resumed at ${saved}%`, `${num(saved)}% থেকে আবার শুরু`), {
          action: { label: L('Start over', 'শুরু থেকে'), onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
        });
      });
    } else {
      window.scrollTo(0, 0);
    }
  }, [a, readLang]); // eslint-disable-line react-hooks/exhaustive-deps

  const chooseLang = (l) => { setReadLang(l); store.set('inkwell.readLang', l); };

  const toggleBookmark = async () => {
    const was = a.bookmarked;
    setData((d) => ({ ...d, bookmarked: !was }));
    try {
      if (was) await api.del(`/api/me/bookmarks/${a.id}`); else await api.post(`/api/me/bookmarks/${a.id}`);
      toast(was ? L('Bookmark removed', 'বুকমার্ক সরানো হয়েছে') : L('Saved to bookmarks', 'বুকমার্কে রাখা হয়েছে'));
    } catch (e) { setData((d) => ({ ...d, bookmarked: was })); toast(e.message, { type: 'error' }); }
  };

  const share = async () => {
    const url = window.location.href;
    const title = pick(a, 'title');
    try {
      if (navigator.share) { await navigator.share({ title, url }); return; }
      await navigator.clipboard.writeText(url);
      toast(L('Link copied', 'লিংক কপি হয়েছে'));
    } catch { /* user cancelled */ }
  };

  if (error?.status === 404) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <Lock className="text-ink-300" size={32} />
        <h1 className="mt-4 font-serif text-2xl font-semibold">{L('Article not available', 'লেখাটি পাওয়া যাচ্ছে না')}</h1>
        <p className="mt-2 text-sm text-ink-500">{L('It may be unpublished or removed.', 'এটি অপ্রকাশিত বা মুছে ফেলা হতে পারে।')}</p>
        <Link to="/discover" className="btn-primary mt-6">{L('Back to the newsstand', 'স্টলে ফিরে যান')}</Link>
      </div>
    );
  }
  if (error) return <div className="mx-auto max-w-xl p-6"><ErrorState error={error} onRetry={reload} /></div>;
  if (loading || !a || !readLang) return <div className="flex min-h-screen items-center justify-center text-ink-400"><Spinner size={24} /></div>;

  const body = (readLang === 'bn' ? a.body_bn : a.body_en) || a.body_en || a.body_bn || '';
  const title = pick(a, 'title', readLang);
  const dek = pick(a, 'dek', readLang);
  const done = percent >= 97;

  return (
    <div className="min-h-screen bg-[#fdfbf7]">
      <div className="fixed inset-x-0 top-0 z-50 h-1 bg-transparent"><div className="h-full bg-delta transition-[width] duration-150" style={{ width: `${percent}%` }} /></div>

      <header className="sticky top-0 z-40 border-b border-paper-200 bg-[#fdfbf7]/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-2 px-3 sm:px-5">
          <Link to={`/m/${a.magazine_slug}`} className="flex min-w-0 items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-ink-500 hover:bg-paper-200 hover:text-ink">
            <ArrowLeft size={16} className="shrink-0" /><span className="hidden truncate font-medium sm:inline">{pick(a, 'magazine_title')}</span>
          </Link>
          <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
            <div className="inline-flex rounded-full border border-paper-300 bg-white p-0.5 text-xs font-semibold" role="group" aria-label={L('Reading language', 'পড়ার ভাষা')} title={L('Reading language', 'পড়ার ভাষা')}>
              {[['bn', 'বাংলা', a.body_bn], ['en', 'English', a.body_en]].map(([code, label, has]) => (
                <button key={code} disabled={!has?.trim()} onClick={() => chooseLang(code)} aria-pressed={readLang === code}
                  className={`rounded-full px-2.5 py-1 transition disabled:opacity-30 ${readLang === code ? 'bg-delta text-white' : 'text-ink-500 hover:text-ink'}`}>{label}</button>
              ))}
            </div>
            <div className="hidden items-center rounded-full border border-paper-300 bg-white sm:inline-flex">
              <button className="p-1.5 text-ink-500 hover:text-ink disabled:opacity-30" disabled={size <= 0} onClick={() => setSize((s) => s - 1)} aria-label={L('Smaller text', 'ছোট লেখা')}><Minus size={14} /></button>
              <span className="px-0.5 text-xs font-semibold text-ink-500">Aa</span>
              <button className="p-1.5 text-ink-500 hover:text-ink disabled:opacity-30" disabled={size >= SIZES.length - 1} onClick={() => setSize((s) => s + 1)} aria-label={L('Larger text', 'বড় লেখা')}><Plus size={14} /></button>
            </div>
            <button onClick={toggleBookmark} className={`rounded-full p-2 transition ${a.bookmarked ? 'text-delta' : 'text-ink-500 hover:bg-paper-200 hover:text-ink'}`} aria-label={L('Bookmark', 'বুকমার্ক')} aria-pressed={a.bookmarked}>
              {a.bookmarked ? <BookmarkCheck size={18} className="fill-delta/15" /> : <Bookmark size={18} />}
            </button>
            <button onClick={share} className="rounded-full p-2 text-ink-500 hover:bg-paper-200 hover:text-ink" aria-label={L('Share', 'শেয়ার')}><Share2 size={18} /></button>
            <button onClick={() => setToc(true)} className="rounded-full p-2 text-ink-500 hover:bg-paper-200 hover:text-ink" aria-label={L('Contents', 'সূচিপত্র')}><List size={18} /></button>
            <div className="hidden md:block"><LangSwitch /></div>
          </div>
        </div>
      </header>

      <article className="mx-auto max-w-2xl px-5 pb-24 pt-10 sm:pt-16">
        <div className={`mb-6 flex flex-wrap items-center gap-2 text-xs font-semibold text-delta ${readLang === 'en' ? 'uppercase tracking-[0.14em]' : ''}`}>
          <Link to={`/m/${a.magazine_slug}`} className="hover:underline">{pick(a, 'magazine_title', readLang)}</Link>
          <span className="text-ink-300">·</span><span className="text-ink-400">{pick(a, 'issue_title', readLang).split(' · ').slice(0, 2).join(' · ')}</span>
          {isEditor && a.status === 'draft' && <StatusBadge status="draft" />}
        </div>
        <h1 lang={readLang} className={`${readLang === 'bn' ? 'font-bnserif leading-snug' : 'font-serif leading-tight'} text-3xl font-bold tracking-tight sm:text-[2.6rem]`}>{title}</h1>
        {dek && <p lang={readLang} className="mt-4 font-serif text-lg leading-relaxed text-ink-500 sm:text-xl">{dek}</p>}
        <div className="mt-6 flex items-center gap-3 border-y border-paper-200 py-4 text-sm text-ink-500">
          <span className="font-semibold text-ink">{a.author}</span>
          <span className="text-ink-300">·</span><span>{date(a.published_at)}</span>
          <span className="text-ink-300">·</span><span>{num(a.read_minutes)} {L('min read', 'মিনিটের পড়া')}</span>
        </div>

        <div ref={articleRef} lang={readLang} className="reading dropcap mt-8" style={{ fontSize: SIZES[size] ?? 18 }}>
          {body.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}
        </div>

        <div className="mt-12 flex items-center justify-center gap-2 text-sm text-ink-400">
          <span className="h-px w-10 bg-paper-300" />
          {done ? <span className="inline-flex items-center gap-1.5 font-medium text-delta"><CircleCheck size={16} />{L('Finished', 'পড়া শেষ')}</span> : <span>◆</span>}
          <span className="h-px w-10 bg-paper-300" />
        </div>

        <nav className="mt-10 grid gap-3 sm:grid-cols-2">
          {a.prev ? (
            <button onClick={() => navigate(`/read/${a.prev.id}`)} className="card group p-4 text-left hover:border-delta">
              <div className="flex items-center gap-1 text-xs text-ink-400"><ArrowLeft size={13} />{L('Previous', 'আগের লেখা')}</div>
              <div className="mt-1 line-clamp-2 font-serif font-semibold group-hover:text-delta">{pick(a.prev, 'title', readLang)}</div>
            </button>
          ) : <div className="hidden sm:block" />}
          {a.next && (
            <button onClick={() => navigate(`/read/${a.next.id}`)} className="card group p-4 text-right hover:border-delta">
              <div className="flex items-center justify-end gap-1 text-xs text-ink-400">{L('Next', 'পরের লেখা')}<ArrowRight size={13} /></div>
              <div className="mt-1 line-clamp-2 font-serif font-semibold group-hover:text-delta">{pick(a.next, 'title', readLang)}</div>
            </button>
          )}
        </nav>

        {!a.subscribed && (
          <div className="card mt-10 flex items-center gap-4 p-5">
            <div className="w-14 shrink-0"><Cover mag={a} masthead={false} rounded="rounded-md" /></div>
            <div className="min-w-0 flex-1 text-sm">
              <div className="font-semibold">{L('Enjoying this?', 'ভালো লাগছে?')}</div>
              <div className="text-ink-500">{L('Subscribe to support the writers and get every issue.', 'লেখকদের পাশে থাকতে আর প্রতিটি সংখ্যা পেতে সাবস্ক্রাইব করুন।')}</div>
            </div>
            <Link to={`/m/${a.magazine_slug}`} className="btn-dark btn-sm">{L('Subscribe', 'সাবস্ক্রাইব')}</Link>
          </div>
        )}
      </article>

      {toc && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={() => setToc(false)} />
          <aside className="absolute inset-y-0 right-0 flex w-80 max-w-[88vw] animate-rise flex-col bg-white shadow-cover">
            <div className="flex items-center justify-between border-b border-paper-200 p-4">
              <div>
                <div className="eyebrow">{L('In this issue', 'এই সংখ্যায়')}</div>
                <div className="mt-0.5 text-sm font-semibold">{pick(a, 'issue_title').split(' · ').slice(0, 2).join(' · ')}</div>
              </div>
              <button className="rounded-full p-1.5 text-ink-400 hover:bg-paper-100" onClick={() => setToc(false)} aria-label="Close"><X size={18} /></button>
            </div>
            <ol className="flex-1 overflow-y-auto p-2">
              {a.siblings.map((s, i) => (
                <li key={s.id}>
                  <Link to={`/read/${s.id}`} className={`flex gap-3 rounded-xl p-3 text-sm ${s.id === a.id ? 'bg-delta-50 text-delta-800' : 'hover:bg-paper-100'}`}>
                    <span className="font-serif text-ink-300">{num(i + 1)}</span>
                    <span className="flex-1">
                      <span className="block font-medium leading-snug">{pick(s, 'title', readLang)}</span>
                      <span className="text-xs text-ink-400">{num(s.read_minutes)} {L('min', 'মিনিট')}{s.progress ? ` · ${num(s.progress)}%` : ''}</span>
                    </span>
                    {s.progress >= 100 && <CircleCheck size={15} className="mt-0.5 text-delta" />}
                  </Link>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      )}
    </div>
  );
}
