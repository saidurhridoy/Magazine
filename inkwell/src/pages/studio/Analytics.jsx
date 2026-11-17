import { Link } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BookOpen, Wallet, Users, FilePen, TrendingUp, TrendingDown, Plus } from 'lucide-react';
import { useLang } from '../../lib/i18n.jsx';
import { useFetch } from '../../lib/useFetch.js';
import { Cover, ErrorState, PageHeader, StatTile, StatusBadge } from '../../components/ui.jsx';

export default function Analytics() {
  const { L, num, taka, pick, date, ago, languageName } = useLang();
  const { data, loading, error, reload } = useFetch('/api/analytics');

  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (loading || !data) {
    return <div className="space-y-6"><div className="skeleton h-10 w-60" /><div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{Array.from({ length: 4 }, (_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div><div className="skeleton h-80 rounded-2xl" /></div>;
  }

  const t = data.totals;
  const change = t.reads_prev_30 ? Math.round(((t.reads_30 - t.reads_prev_30) / t.reads_prev_30) * 100) : 0;
  const maxRev = Math.max(1, ...data.revenue.map((r) => r.mrr));
  const langColors = { bn: '#006a4e', en: '#4338ca', both: '#d97706' };

  return (
    <div>
      <PageHeader eyebrow={L('Publishing studio', 'প্রকাশনা স্টুডিও')} title={L('Analytics', 'বিশ্লেষণ')}
        subtitle={L('Readership and revenue across the whole catalogue.', 'পুরো ক্যাটালগের পাঠক ও আয়।')}
        actions={<><Link to="/studio/articles?new=1" className="btn-outline"><Plus size={15} />{L('New article', 'নতুন লেখা')}</Link><Link to="/studio/publications?new=1" className="btn-primary"><Plus size={15} />{L('New publication', 'নতুন পত্রিকা')}</Link></>} />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatTile icon={BookOpen} label={L('Reads · 30 days', 'পাঠ · ৩০ দিন')} value={num(t.reads_30)}
          hint={<span className={`inline-flex items-center gap-1 ${change >= 0 ? 'text-emerald-600' : 'text-sun'}`}>{change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}{num(Math.abs(change))}% {L('vs previous 30', 'আগের ৩০ দিনের তুলনায়')}</span>} />
        <StatTile icon={Wallet} tone="amber" label={L('Monthly recurring revenue', 'মাসিক পুনরাবৃত্ত আয়')} value={taka(t.mrr)} hint={L(`${t.active_subscriptions} active subscriptions`, `${num(t.active_subscriptions)}টি সক্রিয় সাবস্ক্রিপশন`)} />
        <StatTile icon={Users} tone="indigo" label={L('Paying subscribers', 'পেইং সাবস্ক্রাইবার')} value={num(t.subscribers)} hint={L(`${t.readers} reader accounts`, `${num(t.readers)}টি পাঠক অ্যাকাউন্ট`)} />
        <StatTile icon={FilePen} tone="rose" label={L('Drafts', 'খসড়া')} value={num(t.draft_articles)} hint={L(`${t.magazines - t.published} unpublished titles`, `${num(t.magazines - t.published)}টি অপ্রকাশিত পত্রিকা`)} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <div className="card p-5">
          <h2 className="font-serif text-lg font-semibold">{L('Reads per day', 'দৈনিক পাঠ')}</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.reads} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#006a4e" stopOpacity={0.3} /><stop offset="100%" stopColor="#006a4e" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid stroke="#ebe3d5" vertical={false} />
                <XAxis dataKey="day" tickFormatter={(d) => date(d, { year: false })} tick={{ fontSize: 11, fill: '#a8a29e' }} axisLine={false} tickLine={false} interval={6} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#a8a29e' }} axisLine={false} tickLine={false} tickFormatter={num} />
                <Tooltip labelFormatter={(d) => date(d)} formatter={(v) => [num(v), L('reads', 'পাঠ')]} contentStyle={{ borderRadius: 12, border: '1px solid #ebe3d5', fontSize: 12 }} />
                <Area type="monotone" dataKey="reads" stroke="#006a4e" strokeWidth={2} fill="url(#g)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card p-5">
          <h2 className="font-serif text-lg font-semibold">{L('Catalogue mix', 'ক্যাটালগের বিন্যাস')}</h2>
          <div className="flex items-center gap-4">
            <div className="h-44 w-44 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.mix} dataKey="value" nameKey="name_en" innerRadius={45} outerRadius={75} paddingAngle={2} stroke="none">
                    {data.mix.map((m) => <Cell key={m.name_en} fill={m.color} />)}
                  </Pie>
                  <Tooltip formatter={(v, _n, p) => [num(v), pick(p.payload, 'name')]} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="flex-1 space-y-1.5 text-sm">
              {data.mix.map((m) => <li key={m.name_en} className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: m.color }} /><span className="flex-1">{pick(m, 'name')}</span><span className="text-ink-400">{num(m.value)}</span></li>)}
            </ul>
          </div>
          <div className="mt-4 border-t border-paper-200 pt-4">
            <div className="eyebrow mb-2">{L('By language', 'ভাষা অনুযায়ী')}</div>
            <div className="flex h-2.5 overflow-hidden rounded-full">
              {data.languages.map((l) => <div key={l.language} style={{ flex: l.value, background: langColors[l.language] }} title={languageName(l.language)} />)}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-500">
              {data.languages.map((l) => <span key={l.language} className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: langColors[l.language] }} />{languageName(l.language)} · {num(l.value)}</span>)}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="font-serif text-lg font-semibold">{L('Most-read titles', 'সবচেয়ে পঠিত পত্রিকা')}</h2>
          <ol className="mt-4 space-y-3">
            {data.top_magazines.map((m, i) => (
              <li key={m.id} className="flex items-center gap-3">
                <span className="w-4 font-serif text-sm text-ink-300">{num(i + 1)}</span>
                <div className="w-9 shrink-0"><Cover mag={m} masthead={false} rounded="rounded" /></div>
                <div className="min-w-0 flex-1"><Link to={`/m/${m.slug}`} className="block truncate text-sm font-semibold hover:text-delta">{pick(m, 'title')}</Link>
                  <div className="text-xs text-ink-400">{num(m.subscriber_count)} {L('subscribers', 'সাবস্ক্রাইবার')} · {m.rating ? `★ ${num(m.rating)}` : '—'}</div></div>
                <div className="text-right"><div className="text-sm font-semibold">{num(m.reads)}</div><div className="text-[11px] text-ink-400">{L('reads', 'পাঠ')}</div></div>
              </li>
            ))}
          </ol>
        </div>
        <div className="card p-5">
          <h2 className="font-serif text-lg font-semibold">{L('Most-read articles', 'সবচেয়ে পঠিত লেখা')}</h2>
          <ol className="mt-4 space-y-3">
            {data.top_articles.map((a, i) => (
              <li key={a.id} className="flex items-start gap-3">
                <span className="w-4 pt-0.5 font-serif text-sm text-ink-300">{num(i + 1)}</span>
                <div className="min-w-0 flex-1"><Link to={`/read/${a.id}`} className="line-clamp-1 text-sm font-semibold hover:text-delta">{pick(a, 'title')}</Link>
                  <div className="truncate text-xs text-ink-400">{pick(a, 'magazine_title')} · {a.author}</div></div>
                <span className="text-sm font-semibold">{num(a.reads)}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="card p-5">
          <h2 className="font-serif text-lg font-semibold">{L('Subscription revenue by title', 'পত্রিকাভিত্তিক সাবস্ক্রিপশন আয়')}</h2>
          <div className="mt-4 space-y-3">
            {data.revenue.map((r) => (
              <div key={r.id}>
                <div className="flex justify-between text-sm"><span className="font-medium">{pick(r, 'title')}</span><span className="font-semibold">{taka(r.mrr)}<span className="font-normal text-ink-400">{L('/mo', '/মাস')}</span></span></div>
                <div className="mt-1 flex items-center gap-2"><div className="h-2 flex-1 overflow-hidden rounded-full bg-paper-200"><div className="h-full rounded-full bg-amber-500" style={{ width: `${(r.mrr / maxRev) * 100}%` }} /></div>
                  <span className="w-20 text-right text-xs text-ink-400">{num(r.subscribers)} {L('subs', 'জন')}</span></div>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between"><h2 className="font-serif text-lg font-semibold">{L('Drafts in progress', 'চলমান খসড়া')}</h2><Link to="/studio/articles?status=draft" className="text-xs font-semibold text-delta hover:underline">{L('View all', 'সব দেখুন')}</Link></div>
          <ul className="mt-4 space-y-3">
            {data.drafts.magazines.map((m) => (
              <li key={'m' + m.id} className="flex items-center gap-2 text-sm"><StatusBadge status="draft" /><Link to={`/studio/publications?edit=${m.id}`} className="flex-1 truncate font-medium hover:text-delta">{pick(m, 'title')}</Link><span className="text-xs text-ink-400">{L('publication', 'পত্রিকা')}</span></li>
            ))}
            {data.drafts.articles.map((a) => (
              <li key={a.id} className="text-sm"><Link to={`/studio/articles?edit=${a.id}`} className="line-clamp-1 font-medium hover:text-delta">{pick(a, 'title')}</Link>
                <div className="text-xs text-ink-400">{pick(a, 'magazine_title')} · {L('edited', 'সম্পাদনা')} {ago(a.updated_at)}</div></li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
