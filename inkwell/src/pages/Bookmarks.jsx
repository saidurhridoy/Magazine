import { Link } from 'react-router-dom';
import { Bookmark, Trash2 } from 'lucide-react';
import { useLang } from '../lib/i18n.jsx';
import { useToast } from '../lib/toast.jsx';
import { useFetch } from '../lib/useFetch.js';
import { api } from '../lib/api.js';
import { Cover, EmptyState, ErrorState, PageHeader, ProgressBar, RowsSkeleton } from '../components/ui.jsx';

export default function Bookmarks() {
  const { L, pick, num, ago } = useLang();
  const toast = useToast();
  const { data, setData, loading, error, reload } = useFetch('/api/me/bookmarks');

  const remove = async (a) => {
    const snapshot = data;
    setData((list) => list.filter((x) => x.id !== a.id));
    try {
      await api.del(`/api/me/bookmarks/${a.id}`);
      toast(L('Bookmark removed', 'বুকমার্ক সরানো হয়েছে'), {
        action: { label: L('Undo', 'ফিরিয়ে আনুন'), onClick: async () => { setData(snapshot); await api.post(`/api/me/bookmarks/${a.id}`).catch(() => reload()); } },
      });
    } catch (e) { setData(snapshot); toast(e.message, { type: 'error' }); }
  };

  // Group by publication, keeping the most recently bookmarked publication first.
  const groups = [];
  for (const a of data || []) {
    let g = groups.find((x) => x.id === a.magazine_id);
    if (!g) { g = { id: a.magazine_id, mag: a, items: [] }; groups.push(g); }
    g.items.push(a);
  }

  return (
    <div>
      <PageHeader eyebrow={L('Saved for later', 'পরে পড়ার জন্য')} title={L('Bookmarks', 'বুকমার্ক')}
        subtitle={data ? L(`${data.length} saved pieces across ${groups.length} publications`, `${num(groups.length)}টি পত্রিকার ${num(data.length)}টি লেখা`) : null} />
      {error ? <ErrorState error={error} onRetry={reload} />
        : loading && !data ? <RowsSkeleton />
        : groups.length === 0 ? (
          <EmptyState icon={Bookmark} title={L('No bookmarks yet', 'এখনো কোনো বুকমার্ক নেই')}
            body={L('Tap the bookmark icon while reading to save a piece here.', 'পড়ার সময় বুকমার্ক আইকনে চাপ দিলে লেখাটি এখানে থাকবে।')}
            action={<Link to="/discover" className="btn-primary">{L('Find something to read', 'পড়ার কিছু খুঁজুন')}</Link>} />
        ) : (
          <div className="space-y-8">
            {groups.map((g) => (
              <section key={g.id}>
                <Link to={`/m/${g.mag.magazine_slug}`} className="mb-3 flex items-center gap-3">
                  <div className="w-9"><Cover mag={g.mag} masthead={false} rounded="rounded" /></div>
                  <div><div className="font-serif text-lg font-semibold hover:text-delta">{pick(g.mag, 'magazine_title')}</div>
                    <div className="text-xs text-ink-400">{num(g.items.length)} {L('saved', 'টি সংরক্ষিত')}</div></div>
                </Link>
                <div className="card divide-y divide-paper-200">
                  {g.items.map((a) => (
                    <div key={a.id} className="group flex animate-rise items-start gap-4 p-4">
                      <Link to={`/read/${a.id}`} className="min-w-0 flex-1">
                        <div className="font-serif font-semibold leading-snug group-hover:text-delta">{pick(a, 'title')}</div>
                        <div className="mt-0.5 line-clamp-1 text-sm text-ink-500">{pick(a, 'dek')}</div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 text-xs text-ink-400">
                          <span>{a.author}</span><span>{num(a.read_minutes)} {L('min', 'মিনিট')}</span><span>{L('saved', 'সংরক্ষণ')} {ago(a.bookmarked_at)}</span>
                        </div>
                        {a.progress > 0 && <ProgressBar value={a.progress} className="mt-2 max-w-[180px]" />}
                      </Link>
                      <button onClick={() => remove(a)} className="rounded-lg p-2 text-ink-300 transition hover:bg-sun-50 hover:text-sun" aria-label={L('Remove bookmark', 'বুকমার্ক সরান')}><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
    </div>
  );
}
