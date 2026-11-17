import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LayoutGrid, List, SearchX, X } from 'lucide-react';
import { useLang } from '../lib/i18n.jsx';
import { useAuth } from '../lib/auth.jsx';
import { useToast } from '../lib/toast.jsx';
import { useFetch } from '../lib/useFetch.js';
import { api, qs } from '../lib/api.js';
import { CardGridSkeleton, EmptyState, ErrorState, MagazineCard, MagazineRow, PageHeader, RowsSkeleton } from '../components/ui.jsx';

export default function Discover() {
  const { L, pick, num } = useLang();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const category = params.get('category') || 'all';
  const language = params.get('language') || 'all';
  const sort = params.get('sort') || 'popular';
  const view = params.get('view') || 'grid';

  const set = (k, v) => {
    const next = new URLSearchParams(params);
    if (!v || v === 'all' || (k === 'sort' && v === 'popular') || (k === 'view' && v === 'grid')) next.delete(k); else next.set(k, v);
    setParams(next, { replace: true });
  };

  const { data: categories } = useFetch('/api/categories');
  const url = useMemo(() => `/api/magazines${qs({ q, category, language, sort })}`, [q, category, language, sort]);
  const { data: mags, loading, error, reload, setData } = useFetch(url);

  const toggleLibrary = async (mag) => {
    if (!user) { navigate(`/login?next=${encodeURIComponent('/discover')}`); return; }
    const flip = (v) => setData((list) => list.map((m) => (m.id === mag.id ? { ...m, in_library: v } : m)));
    flip(!mag.in_library);
    try {
      if (mag.in_library) {
        await api.del(`/api/me/library/${mag.id}`);
        toast(L('Removed from library', 'লাইব্রেরি থেকে সরানো হয়েছে'), {
          action: { label: L('Undo', 'ফিরিয়ে আনুন'), onClick: async () => { flip(true); await api.post(`/api/me/library/${mag.id}`).catch(() => flip(false)); } },
        });
      } else {
        await api.post(`/api/me/library/${mag.id}`);
        toast(L(`${mag.title_en} added to your library`, `${mag.title_bn || mag.title_en} লাইব্রেরিতে যোগ হয়েছে`));
      }
    } catch (e) { flip(mag.in_library); toast(e.message, { type: 'error' }); }
  };

  const chip = (active) => `shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${active ? 'border-ink bg-ink text-paper' : 'border-paper-300 bg-white text-ink-600 hover:border-ink-300'}`;

  return (
    <div>
      <PageHeader eyebrow={L('Newsstand', 'পত্রিকার স্টল')} title={L('Discover', 'আবিষ্কার করুন')}
        subtitle={L('Bengali and English publications from across Bangladesh. Every price in taka.', 'সারা বাংলাদেশের বাংলা ও ইংরেজি পত্রিকা। সব দাম টাকায়।')} />

      <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        <button className={chip(category === 'all')} onClick={() => set('category', 'all')}>{L('All', 'সব')}</button>
        {(categories || []).map((c) => (
          <button key={c.id} className={chip(category === c.slug)} onClick={() => set('category', c.slug)}>
            <span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ background: c.color }} />{pick(c, 'name')}
            <span className="ml-1.5 text-xs opacity-60">{num(c.magazine_count)}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-b border-paper-200 pb-4">
        <div className="inline-flex rounded-full border border-paper-300 bg-white p-0.5 text-xs font-semibold" role="group" aria-label={L('Publication language', 'পত্রিকার ভাষা')}>
          {[['all', L('All languages', 'সব ভাষা')], ['bn', 'বাংলা'], ['en', 'English'], ['both', L('Bilingual', 'দ্বিভাষিক')]].map(([v, label]) => (
            <button key={v} onClick={() => set('language', v)} className={`rounded-full px-3 py-1.5 transition ${language === v ? 'bg-delta text-white' : 'text-ink-500 hover:text-ink'}`}>{label}</button>
          ))}
        </div>
        <select value={sort} onChange={(e) => set('sort', e.target.value)} className="rounded-full border border-paper-300 bg-white px-3 py-1.5 text-xs font-semibold text-ink-600 focus:outline-none" aria-label={L('Sort', 'সাজান')}>
          <option value="popular">{L('Most read', 'সবচেয়ে পঠিত')}</option>
          <option value="newest">{L('Newest issue', 'নতুন সংখ্যা')}</option>
          <option value="rating">{L('Top rated', 'সেরা রেটিং')}</option>
          <option value="price_asc">{L('Price: low to high', 'দাম: কম থেকে বেশি')}</option>
          <option value="price_desc">{L('Price: high to low', 'দাম: বেশি থেকে কম')}</option>
          <option value="title">{L('A–Z', 'নাম অনুযায়ী')}</option>
        </select>
        {q && (
          <span className="chip bg-amber-50 py-1 text-amber-800">“{q}”
            <button onClick={() => set('q', '')} aria-label="Clear search"><X size={12} /></button></span>
        )}
        <div className="ml-auto inline-flex rounded-lg border border-paper-300 bg-white p-0.5">
          <button onClick={() => set('view', 'grid')} className={`rounded-md p-1.5 ${view === 'grid' ? 'bg-paper-200 text-ink' : 'text-ink-400'}`} aria-label="Grid view"><LayoutGrid size={16} /></button>
          <button onClick={() => set('view', 'list')} className={`rounded-md p-1.5 ${view === 'list' ? 'bg-paper-200 text-ink' : 'text-ink-400'}`} aria-label="List view"><List size={16} /></button>
        </div>
      </div>

      <div className="mt-6">
        {error ? <ErrorState error={error} onRetry={reload} />
          : loading && !mags ? (view === 'grid' ? <CardGridSkeleton /> : <RowsSkeleton />)
          : mags.length === 0 ? (
            <EmptyState icon={SearchX} title={L('No publications match', 'মিলে যাওয়া কোনো পত্রিকা নেই')}
              body={L('Try another category or language, or clear the search.', 'অন্য বিভাগ বা ভাষা দেখুন, অথবা খোঁজ মুছে দিন।')}
              action={<button className="btn-outline" onClick={() => setParams({}, { replace: true })}>{L('Clear filters', 'ফিল্টার মুছুন')}</button>} />
          ) : (
            <>
              <div className="mb-4 text-sm text-ink-400">{num(mags.length)} {L(mags.length === 1 ? 'publication' : 'publications', 'টি পত্রিকা')}</div>
              {view === 'grid' ? (
                <div className={`grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 ${loading ? 'opacity-60' : ''}`}>
                  {mags.map((m) => <MagazineCard key={m.id} mag={m} onToggleLibrary={toggleLibrary} />)}
                </div>
              ) : (
                <div className={`space-y-3 ${loading ? 'opacity-60' : ''}`}>{mags.map((m) => <MagazineRow key={m.id} mag={m} onToggleLibrary={toggleLibrary} />)}</div>
              )}
            </>
          )}
      </div>
    </div>
  );
}
