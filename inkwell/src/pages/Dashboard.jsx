import { Link } from 'react-router-dom';
import { BookCheck, Clock, Library, Bookmark, ArrowRight, BookOpen, CreditCard, Share2, Sparkles } from 'lucide-react';
import { useAuth } from '../lib/auth.jsx';
import { useLang } from '../lib/i18n.jsx';
import { useFetch } from '../lib/useFetch.js';
import { api } from '../lib/api.js';
import { useToast } from '../lib/toast.jsx';
import { Cover, EmptyState, ErrorState, MagazineCard, ProgressBar, StatTile } from '../components/ui.jsx';

function ReadingChart({ data }) {
  const { L, num, bn, date } = useLang();
  const max = Math.max(1, ...data.map((d) => d.reads));
  const total = data.reduce((s, d) => s + d.reads, 0);
  return (
    <div className="card p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="font-serif text-lg font-semibold">{L('Your reading, last 14 days', 'গত ১৪ দিনে আপনার পড়া')}</h2>
        <span className="text-sm text-ink-400">{num(total)} {L('reads', 'বার পড়া')}</span>
      </div>
      <div className="mt-6 flex h-36 items-end gap-1.5 sm:gap-2">
        {data.map((d, i) => {
          const dt = new Date(d.day + 'T00:00:00');
          const isToday = i === data.length - 1;
          return (
            <div key={d.day} className="group relative flex h-full flex-1 flex-col items-center justify-end">
              <div className="pointer-events-none absolute -top-7 z-10 hidden whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[11px] text-paper group-hover:block">
                {date(d.day, { year: false })}: {num(d.reads)}
              </div>
              <div className={`w-full rounded-t-md transition-all ${isToday ? 'bg-delta' : d.reads ? 'bg-delta/35 group-hover:bg-delta/60' : 'bg-paper-200'}`}
                style={{ height: `${d.reads ? Math.max(8, (d.reads / max) * 100) : 4}%` }} />
              <span className={`mt-2 text-[10px] ${isToday ? 'font-semibold text-delta' : 'text-ink-300'}`}>
                {bn ? ['র', 'সো', 'ম', 'বু', 'বৃ', 'শু', 'শ'][dt.getDay()] : ['S', 'M', 'T', 'W', 'T', 'F', 'S'][dt.getDay()]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const ACTIVITY_ICON = { read: BookOpen, bookmark: Bookmark, subscribe: CreditCard, share: Share2 };

export default function Dashboard() {
  const { user } = useAuth();
  const { L, num, pick, bn, ago, taka } = useLang();
  const toast = useToast();
  const { data, loading, error, reload, setData } = useFetch('/api/dashboard');

  const hour = new Date().getHours();
  const greeting = hour < 12 ? L('Good morning', 'শুভ সকাল') : hour < 17 ? L('Good afternoon', 'শুভ অপরাহ্ন') : L('Good evening', 'শুভ সন্ধ্যা');
  const firstName = bn && user.name_bn ? user.name_bn.split(' ')[0] : user.name.split(' ')[0];

  const addToLibrary = async (mag) => {
    setData((d) => ({ ...d, recommendations: d.recommendations.map((m) => (m.id === mag.id ? { ...m, in_library: !m.in_library } : m)) }));
    try {
      if (mag.in_library) await api.del(`/api/me/library/${mag.id}`); else await api.post(`/api/me/library/${mag.id}`);
      toast(mag.in_library ? L('Removed from library', 'লাইব্রেরি থেকে সরানো হয়েছে') : L('Added to your library', 'লাইব্রেরিতে যোগ হয়েছে'));
    } catch (e) {
      setData((d) => ({ ...d, recommendations: d.recommendations.map((m) => (m.id === mag.id ? { ...m, in_library: mag.in_library } : m)) }));
      toast(e.message, { type: 'error' });
    }
  };

  if (error) return <ErrorState error={error} onRetry={reload} />;

  return (
    <div>
      <div className="mb-8">
        <div className="eyebrow">{new Date().toLocaleDateString(bn ? 'bn-BD' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
        <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight">{greeting}, {firstName}</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {loading && !data ? Array.from({ length: 4 }, (_, i) => <div key={i} className="skeleton h-[108px] rounded-2xl" />) : <>
          <StatTile icon={BookCheck} label={L('Articles finished', 'শেষ করা লেখা')} value={num(data.stats.finished)} hint={L(`${data.stats.in_progress} in progress`, `${num(data.stats.in_progress)}টি পড়া চলছে`)} />
          <StatTile icon={Clock} tone="amber" label={L('Minutes read', 'পড়ার সময় (মিনিট)')} value={num(data.stats.minutes)} hint={L('across all titles', 'সব পত্রিকা মিলিয়ে')} />
          <StatTile icon={Library} tone="indigo" label={L('In your library', 'লাইব্রেরিতে')} value={num(data.stats.library)} hint={L(`${data.stats.subscriptions} active subscriptions`, `${num(data.stats.subscriptions)}টি সক্রিয় সাবস্ক্রিপশন`)} />
          <StatTile icon={Bookmark} tone="rose" label={L('Bookmarks', 'বুকমার্ক')} value={num(data.stats.bookmarks)} hint={`${taka(data.stats.monthly_spend)}${L('/mo on subscriptions', '/মাস সাবস্ক্রিপশনে')}`} />
        </>}
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-serif text-xl font-semibold">{L('Continue reading', 'পড়া চালিয়ে যান')}</h2>
          <Link to="/library" className="text-sm font-medium text-delta hover:underline">{L('Your library', 'আপনার লাইব্রেরি')}</Link>
        </div>
        {loading && !data ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 3 }, (_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
        ) : data.continue_reading.length === 0 ? (
          <EmptyState icon={BookOpen} title={L('Nothing in progress', 'চলমান কোনো পড়া নেই')} body={L('Open any article and we\u2019ll keep your place here.', 'যেকোনো লেখা খুলুন, আমরা এখানে আপনার জায়গা মনে রাখব।')}
            action={<Link to="/discover" className="btn-primary">{L('Find something to read', 'পড়ার কিছু খুঁজুন')}</Link>} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {data.continue_reading.map((a) => (
              <Link key={a.id} to={`/read/${a.id}`} className="card group flex animate-rise gap-4 p-4 transition hover:-translate-y-0.5 hover:shadow-cover">
                <div className="w-16 shrink-0"><Cover mag={a} masthead={false} rounded="rounded-md" /></div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="truncate text-xs font-medium text-ink-400">{pick(a, 'magazine_title')}</div>
                  <div className="mt-0.5 line-clamp-2 font-serif font-semibold leading-snug group-hover:text-delta">{pick(a, 'title')}</div>
                  <div className="mt-auto pt-3">
                    <ProgressBar value={a.progress} />
                    <div className="mt-1.5 flex justify-between text-[11px] text-ink-400">
                      <span>{num(a.progress)}% · {ago(a.progress_at)}</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-delta opacity-0 transition group-hover:opacity-100">{L('Resume', 'চালিয়ে যান')}<ArrowRight size={12} /></span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <div className="mt-10 grid items-start gap-6 lg:grid-cols-[1.6fr_1fr]">
        {data ? <ReadingChart data={data.chart} /> : <div className="skeleton h-64 rounded-2xl" />}
        <div className="card p-5">
          <h2 className="font-serif text-lg font-semibold">{L('Recent activity', 'সাম্প্রতিক কার্যকলাপ')}</h2>
          {!data ? <div className="mt-4 space-y-3">{Array.from({ length: 5 }, (_, i) => <div key={i} className="skeleton h-8" />)}</div>
            : data.activity.length === 0 ? <p className="mt-4 text-sm text-ink-400">{L('Your reading history will appear here.', 'আপনার পড়ার ইতিহাস এখানে দেখা যাবে।')}</p>
            : (
              <ol className="mt-4 space-y-3.5">
                {data.activity.map((e) => {
                  const Icon = ACTIVITY_ICON[e.type] || BookOpen;
                  const verb = { read: L('Read', 'পড়েছেন'), bookmark: L('Bookmarked', 'বুকমার্ক করেছেন'), subscribe: L('Subscribed to', 'সাবস্ক্রাইব করেছেন'), share: L('Shared', 'শেয়ার করেছেন') }[e.type];
                  const target = e.article_id ? pick(e, 'article_title') : pick(e, 'magazine_title');
                  return (
                    <li key={e.id} className="flex gap-3 text-sm">
                      <span className="mt-0.5 rounded-lg bg-paper-100 p-1.5 text-ink-500"><Icon size={13} /></span>
                      <div className="min-w-0 flex-1">
                        <div className="line-clamp-2"><span className="text-ink-400">{verb} </span>
                          {e.article_id ? <Link to={`/read/${e.article_id}`} className="font-medium hover:text-delta">{target}</Link> : <Link to={`/m/${e.slug}`} className="font-medium hover:text-delta">{target}</Link>}
                        </div>
                        <div className="text-xs text-ink-300">{ago(e.created_at)}</div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
        </div>
      </div>

      <section className="mt-12">
        <div className="mb-5 flex items-center gap-2">
          <Sparkles size={18} className="text-amber-500" />
          <h2 className="font-serif text-xl font-semibold">{L('Recommended for you', 'আপনার জন্য প্রস্তাবিত')}</h2>
        </div>
        {data ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {data.recommendations.map((m) => <MagazineCard key={m.id} mag={m} onToggleLibrary={addToLibrary} />)}
          </div>
        ) : <div className="skeleton h-72 rounded-2xl" />}
      </section>
    </div>
  );
}
