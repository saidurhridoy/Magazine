import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Library as LibraryIcon, X, CreditCard } from 'lucide-react';
import { useLang } from '../lib/i18n.jsx';
import { useToast } from '../lib/toast.jsx';
import { useFetch } from '../lib/useFetch.js';
import { api } from '../lib/api.js';
import { CardGridSkeleton, Cover, EmptyState, ErrorState, LangBadge, PageHeader, ProgressBar } from '../components/ui.jsx';

export default function LibraryPage() {
  const { L, pick, num, date } = useLang();
  const toast = useToast();
  const { data, setData, loading, error, reload } = useFetch('/api/me/library');
  const [tab, setTab] = useState('all');

  const remove = async (mag) => {
    const snapshot = data;
    setData((list) => list.filter((m) => m.id !== mag.id));
    try {
      await api.del(`/api/me/library/${mag.id}`);
      toast(L(`Removed ${mag.title_en}`, `${mag.title_bn || mag.title_en} সরানো হয়েছে`), {
        action: { label: L('Undo', 'ফিরিয়ে আনুন'), onClick: async () => { setData(snapshot); await api.post(`/api/me/library/${mag.id}`).catch(() => reload()); } },
      });
    } catch (e) { setData(snapshot); toast(e.message, { type: 'error' }); }
  };

  const list = (data || []).filter((m) => tab === 'all' || (tab === 'subscribed' ? m.subscription_status === 'active' : m.started > 0));
  const tabs = [['all', L('All', 'সব')], ['subscribed', L('Subscribed', 'সাবস্ক্রাইবড')], ['reading', L('Reading', 'পড়ছি')]];

  return (
    <div>
      <PageHeader eyebrow={L('Your shelf', 'আপনার তাক')} title={L('Library', 'লাইব্রেরি')}
        subtitle={L('Publications you follow. Subscribed titles are marked.', 'যেসব পত্রিকা আপনি অনুসরণ করেন। সাবস্ক্রাইব করা পত্রিকা চিহ্নিত।')}
        actions={<Link to="/discover" className="btn-outline">{L('Add publications', 'পত্রিকা যোগ করুন')}</Link>} />
      <div className="mb-6 flex gap-1 border-b border-paper-200">
        {tabs.map(([v, label]) => (
          <button key={v} onClick={() => setTab(v)} className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition ${tab === v ? 'border-delta text-ink' : 'border-transparent text-ink-400 hover:text-ink'}`}>
            {label}{data && <span className="ml-1.5 text-xs text-ink-300">{num((data || []).filter((m) => v === 'all' || (v === 'subscribed' ? m.subscription_status === 'active' : m.started > 0)).length)}</span>}
          </button>
        ))}
      </div>
      {error ? <ErrorState error={error} onRetry={reload} />
        : loading && !data ? <CardGridSkeleton n={4} />
        : list.length === 0 ? (
          <EmptyState icon={LibraryIcon} title={tab === 'all' ? L('Your library is empty', 'আপনার লাইব্রেরি খালি') : L('Nothing here yet', 'এখানে এখনো কিছু নেই')}
            body={L('Add publications from the newsstand and they\u2019ll live here, with your progress.', 'স্টল থেকে পত্রিকা যোগ করুন, আপনার অগ্রগতিসহ এখানে থাকবে।')}
            action={<Link to="/discover" className="btn-primary">{L('Browse the newsstand', 'পত্রিকা দেখুন')}</Link>} />
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {list.map((m) => {
              const pct = m.article_count ? Math.round(((m.finished || 0) / m.article_count) * 100) : 0;
              return (
                <div key={m.id} className="group relative animate-rise">
                  <Link to={`/m/${m.slug}`} className="block transition group-hover:-translate-y-1"><Cover mag={m} /></Link>
                  <button onClick={() => remove(m)} className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-ink-500 opacity-100 shadow transition hover:text-sun sm:opacity-0 sm:group-hover:opacity-100" aria-label={L('Remove', 'সরান')}><X size={14} /></button>
                  {m.subscription_status === 'active' && <span className="chip absolute bottom-2 left-2 bg-delta text-white shadow"><CreditCard size={10} />{L('Subscribed', 'সাবস্ক্রাইবড')}</span>}
                  <Link to={`/m/${m.slug}`} className="mt-3 block truncate font-serif text-[15px] font-semibold hover:text-delta">{pick(m, 'title')}</Link>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-ink-400"><LangBadge code={m.language} />{L('Latest', 'সর্বশেষ')} {date(m.latest_issue_at, { year: false })}</div>
                  <ProgressBar value={pct} className="mt-2.5" />
                  <div className="mt-1 text-[11px] text-ink-400">{num(m.finished || 0)}/{num(m.article_count)} {L('read', 'পড়া শেষ')}</div>
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
}
