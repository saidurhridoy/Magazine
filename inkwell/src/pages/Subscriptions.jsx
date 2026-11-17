import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, RotateCcw, Repeat, Wallet, CalendarDays } from 'lucide-react';
import { useLang } from '../lib/i18n.jsx';
import { useToast } from '../lib/toast.jsx';
import { useFetch } from '../lib/useFetch.js';
import { api } from '../lib/api.js';
import { ConfirmDialog, Cover, EmptyState, ErrorState, LangBadge, PageHeader, RowsSkeleton, Spinner, StatTile } from '../components/ui.jsx';
import SubscribeModal from '../components/SubscribeModal.jsx';

const monthlyEquivalent = (s) => (s.plan === 'yearly' ? Math.round(s.price_poisha / 12) : s.price_poisha);

export default function Subscriptions() {
  const { L, pick, taka, num, date, perMonth } = useLang();
  const toast = useToast();
  const { data, setData, loading, error, reload } = useFetch('/api/me/subscriptions');
  const [cancel, setCancel] = useState(null);
  const [changing, setChanging] = useState(null);
  const [busy, setBusy] = useState(null);

  const replace = (sub) => setData((list) => list.map((s) => (s.id === sub.id ? sub : s)));

  const doCancel = async () => {
    const s = cancel;
    setCancel(null);
    const snapshot = data;
    replace({ ...s, status: 'cancelled', cancelled_at: new Date().toISOString() });
    try {
      replace(await api.post(`/api/subscriptions/${s.id}/cancel`));
      toast(L('Subscription cancelled', 'সাবস্ক্রিপশন বাতিল হয়েছে'), {
        action: { label: L('Undo', 'ফিরিয়ে আনুন'), onClick: () => reactivate(s) },
      });
    } catch (e) { setData(snapshot); toast(e.message, { type: 'error' }); }
  };

  const reactivate = async (s) => {
    setBusy(s.id);
    try {
      replace(await api.post('/api/subscriptions', { magazine_id: s.magazine_id, plan: s.plan }));
      toast(L('Welcome back — subscription reactivated', 'সাবস্ক্রিপশন আবার চালু হয়েছে'));
    } catch (e) { toast(e.message, { type: 'error' }); } finally { setBusy(null); }
  };

  const active = (data || []).filter((s) => s.status === 'active');
  const cancelled = (data || []).filter((s) => s.status !== 'active');
  const total = active.reduce((sum, s) => sum + monthlyEquivalent(s), 0);

  const renderRow = (s) => (
    <div className={`card flex animate-rise flex-col gap-4 p-4 sm:flex-row sm:items-center ${s.status !== 'active' ? 'opacity-75' : ''}`}>
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <Link to={`/m/${s.slug}`} className="w-14 shrink-0"><Cover mag={s} masthead={false} rounded="rounded-md" /></Link>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link to={`/m/${s.slug}`} className="font-serif font-semibold hover:text-delta">{pick(s, 'title')}</Link>
            <LangBadge code={s.language} />
          </div>
          <div className="mt-0.5 text-sm text-ink-500">
            {s.plan === 'yearly' ? L('Yearly', 'বার্ষিক') : L('Monthly', 'মাসিক')} · <span className="font-semibold text-ink">{taka(s.price_poisha)}</span>{s.plan === 'yearly' ? L('/yr', '/বছর') : perMonth}
          </div>
          <div className="mt-0.5 text-xs text-ink-400">
            {s.status === 'active' ? <>{L('Renews', 'নবায়ন')} {date(s.renews_at)} · {L('since', 'শুরু')} {date(s.started_at)}</> : <>{L('Cancelled', 'বাতিল')} {date(s.cancelled_at)}</>}
          </div>
        </div>
      </div>
      <div className="flex gap-2 sm:shrink-0">
        {s.status === 'active' ? <>
          <button className="btn-outline btn-sm" onClick={() => setChanging(s)}><Repeat size={13} />{L('Change plan', 'প্ল্যান বদলান')}</button>
          <button className="btn-ghost btn-sm text-sun hover:bg-sun-50" onClick={() => setCancel(s)}>{L('Cancel', 'বাতিল')}</button>
        </> : s.magazine_status === 'published' && (
          <button className="btn-primary btn-sm" disabled={busy === s.id} onClick={() => reactivate(s)}>{busy === s.id ? <Spinner size={13} /> : <RotateCcw size={13} />}{L('Reactivate', 'আবার চালু করুন')}</button>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <PageHeader eyebrow={L('Billing', 'বিল')} title={L('Subscriptions', 'সাবস্ক্রিপশন')} subtitle={L('All prices in Bangladeshi taka, VAT included.', 'সব দাম বাংলাদেশি টাকায়, ভ্যাটসহ।')} />
      {error ? <ErrorState error={error} onRetry={reload} /> : loading && !data ? <RowsSkeleton n={3} /> : (
        <>
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            <StatTile icon={CreditCard} label={L('Active', 'সক্রিয়')} value={num(active.length)} />
            <StatTile icon={Wallet} tone="amber" label={L('Monthly total', 'মাসিক মোট')} value={taka(total)} hint={L('yearly plans spread over 12 months', 'বার্ষিক প্ল্যান ১২ মাসে ভাগ করে')} />
            <div className="col-span-2 sm:col-span-1"><StatTile icon={CalendarDays} tone="indigo" label={L('Per year', 'বছরে')} value={taka(total * 12)} hint={L('at current plans', 'বর্তমান প্ল্যানে')} /></div>
          </div>
          {data.length === 0 ? (
            <EmptyState icon={CreditCard} title={L('No subscriptions yet', 'এখনো কোনো সাবস্ক্রিপশন নেই')}
              body={L('Subscribe from any publication page — plans start at ৳250 a month.', 'যেকোনো পত্রিকার পাতা থেকে সাবস্ক্রাইব করুন — মাসে ৳২৫০ থেকে।')}
              action={<Link to="/discover" className="btn-primary">{L('Browse publications', 'পত্রিকা দেখুন')}</Link>} />
          ) : (
            <div className="space-y-8">
              {active.length > 0 && <section><h2 className="mb-3 font-serif text-lg font-semibold">{L('Active', 'সক্রিয়')}</h2><div className="space-y-3">{active.map((s) => <div key={s.id}>{renderRow(s)}</div>)}</div></section>}
              {cancelled.length > 0 && <section><h2 className="mb-3 font-serif text-lg font-semibold">{L('Cancelled', 'বাতিল')}</h2><div className="space-y-3">{cancelled.map((s) => <div key={s.id}>{renderRow(s)}</div>)}</div></section>}
            </div>
          )}
        </>
      )}
      <ConfirmDialog open={!!cancel} onClose={() => setCancel(null)} onConfirm={doCancel} confirmLabel={L('Cancel subscription', 'সাবস্ক্রিপশন বাতিল')}
        title={L('Cancel subscription?', 'সাবস্ক্রিপশন বাতিল করবেন?')}
        body={cancel && L(`You'll stop being billed for ${cancel.title_en}. You can reactivate anytime.`, `${cancel.title_bn || cancel.title_en}-এর জন্য আর বিল হবে না। যেকোনো সময় আবার চালু করতে পারবেন।`)} />
      <SubscribeModal open={!!changing} onClose={() => setChanging(null)} mag={changing} current={changing} onDone={(sub) => replace(sub)} />
    </div>
  );
}
