import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BookOpen, Check, ChevronDown, Pencil, Plus, Trash2, CreditCard, Star, CircleCheck, ArrowLeft } from 'lucide-react';
import { useLang } from '../lib/i18n.jsx';
import { useAuth } from '../lib/auth.jsx';
import { useToast } from '../lib/toast.jsx';
import { useFetch } from '../lib/useFetch.js';
import { api } from '../lib/api.js';
import { Avatar, ConfirmDialog, Cover, ErrorState, LangBadge, ProgressBar, Spinner, StarInput, Stars, StatusBadge } from '../components/ui.jsx';
import SubscribeModal from '../components/SubscribeModal.jsx';
import NotFound from './NotFound.jsx';

function Issue({ issue, open, onToggle, isEditor }) {
  const { L, pick, num, date } = useLang();
  const read = issue.articles.filter((a) => a.progress >= 100).length;
  return (
    <div className="card overflow-hidden">
      <button onClick={onToggle} className="flex w-full items-center gap-4 px-4 py-4 text-left sm:px-5" aria-expanded={open}>
        <div className="min-w-0 flex-1">
          <div className="font-serif font-semibold">{pick(issue, 'title')}</div>
          <div className="mt-0.5 text-xs text-ink-400">{date(issue.published_at)} · {num(issue.articles.length)} {L('articles', 'টি লেখা')}{read ? ` · ${num(read)} ${L('read', 'পড়া শেষ')}` : ''}</div>
        </div>
        <ChevronDown size={18} className={`shrink-0 text-ink-400 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ol className="divide-y divide-paper-200 border-t border-paper-200">
          {issue.articles.map((a, i) => (
            <li key={a.id}>
              <Link to={`/read/${a.id}`} className="group flex items-start gap-4 px-4 py-3.5 hover:bg-paper-100/60 sm:px-5">
                <span className="mt-0.5 w-5 shrink-0 font-serif text-sm text-ink-300">{num(i + 1)}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium leading-snug group-hover:text-delta">{pick(a, 'title')}</span>
                    {isEditor && a.status === 'draft' && <StatusBadge status="draft" />}
                  </div>
                  <div className="mt-0.5 line-clamp-1 text-sm text-ink-400">{pick(a, 'dek')}</div>
                  <div className="mt-1 text-xs text-ink-400">{a.author} · {num(a.read_minutes)} {L('min read', 'মিনিটের পড়া')}</div>
                  {a.progress > 0 && a.progress < 100 && <ProgressBar value={a.progress} className="mt-2 max-w-[160px]" />}
                </div>
                {a.progress >= 100 && <CircleCheck size={18} className="mt-0.5 shrink-0 text-delta" aria-label={L('Finished', 'পড়া শেষ')} />}
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function Reviews({ mag, setMag }) {
  const { L, num, ago, bn } = useLang();
  const { user, isEditor } = useAuth();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ rating: 0, body: '' });
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const mine = mag.my_review;

  useEffect(() => { setForm({ rating: mine?.rating || 0, body: mine?.body || '' }); }, [mine]);

  const recompute = (reviews) => {
    const rating = reviews.length ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10 : null;
    return { reviews, rating, review_count: reviews.length, distribution: [5, 4, 3, 2, 1].map((star) => ({ star, count: reviews.filter((r) => r.rating === star).length })) };
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.rating) { toast(L('Pick a star rating', 'স্টার রেটিং দিন'), { type: 'error' }); return; }
    setBusy(true);
    try {
      const r = await api.post(`/api/magazines/${mag.id}/reviews`, form);
      setMag((m) => ({ ...m, my_review: r, ...recompute([r, ...m.reviews.filter((x) => x.id !== r.id)]) }));
      setEditing(false);
      toast(mine ? L('Review updated', 'রিভিউ হালনাগাদ হয়েছে') : L('Thanks for your review', 'রিভিউয়ের জন্য ধন্যবাদ'));
    } catch (err) { toast(err.message, { type: 'error' }); } finally { setBusy(false); }
  };

  const remove = async (r) => {
    const snapshot = mag;
    setMag((m) => ({ ...m, my_review: r.user_id === user?.id ? null : m.my_review, ...recompute(m.reviews.filter((x) => x.id !== r.id)) }));
    setConfirm(null);
    try { await api.del(`/api/reviews/${r.id}`); toast(L('Review deleted', 'রিভিউ মুছে ফেলা হয়েছে')); }
    catch (err) { setMag(snapshot); toast(err.message, { type: 'error' }); }
  };

  const total = mag.review_count || 0;
  return (
    <section className="mt-12">
      <h2 className="font-serif text-xl font-semibold">{L('Ratings & reviews', 'রেটিং ও রিভিউ')}</h2>
      <div className="mt-5 grid gap-6 md:grid-cols-[260px_1fr]">
        <div className="card h-fit p-5">
          <div className="flex items-end gap-2"><span className="font-serif text-5xl font-semibold">{mag.rating ? num(mag.rating) : '–'}</span><span className="mb-2 text-sm text-ink-400">/ {num(5)}</span></div>
          <Stars value={mag.rating || 0} size={16} className="mt-1" />
          <div className="mt-1 text-xs text-ink-400">{num(total)} {L('reviews', 'টি রিভিউ')}</div>
          <div className="mt-4 space-y-1.5">
            {mag.distribution.map((d) => (
              <div key={d.star} className="flex items-center gap-2 text-xs text-ink-500">
                <span className="w-3">{num(d.star)}</span><Star size={11} className="fill-amber-400 text-amber-400" />
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-paper-200"><div className="h-full rounded-full bg-amber-400" style={{ width: `${total ? (d.count / total) * 100 : 0}%` }} /></div>
                <span className="w-4 text-right">{num(d.count)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {user ? (
            (!mine || editing) ? (
              <form onSubmit={save} className="card p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-sm font-semibold">{mine ? L('Edit your review', 'আপনার রিভিউ সম্পাদনা') : L('Write a review', 'রিভিউ লিখুন')}</span>
                  <StarInput value={form.rating} onChange={(rating) => setForm((f) => ({ ...f, rating }))} />
                </div>
                <textarea className="input mt-3 min-h-[90px]" value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                  placeholder={L('What do you like? Bangla or English are both welcome.', 'কী ভালো লাগে? বাংলা বা ইংরেজি — যেকোনো ভাষায় লিখুন।')} maxLength={2000} />
                <div className="mt-3 flex justify-end gap-2">
                  {editing && <button type="button" className="btn-ghost" onClick={() => setEditing(false)}>{L('Cancel', 'বাতিল')}</button>}
                  <button className="btn-primary" disabled={busy}>{busy && <Spinner size={14} />}{mine ? L('Save', 'সংরক্ষণ') : L('Post review', 'রিভিউ দিন')}</button>
                </div>
              </form>
            ) : null
          ) : (
            <div className="card p-5 text-sm text-ink-500"><Link to={`/login?next=/m/${mag.slug}`} className="font-semibold text-delta hover:underline">{L('Sign in', 'সাইন ইন')}</Link> {L('to rate this publication.', 'করে রেটিং দিন।')}</div>
          )}

          {mag.reviews.length === 0 && <p className="py-6 text-center text-sm text-ink-400">{L('No reviews yet — be the first.', 'এখনো কোনো রিভিউ নেই — প্রথম রিভিউটি দিন।')}</p>}
          {mag.reviews.map((r) => (
            <article key={r.id} className="card animate-rise p-5">
              <div className="flex items-start gap-3">
                <Avatar user={r} size={34} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2">
                    <span className="text-sm font-semibold">{bn && r.name_bn ? r.name_bn : r.name}</span>
                    {r.user_id === user?.id && <span className="chip bg-delta-50 text-delta-700">{L('You', 'আপনি')}</span>}
                    <span className="text-xs text-ink-300">{ago(r.updated_at)}</span>
                  </div>
                  <Stars value={r.rating} size={12} className="mt-1" />
                  {r.body && <p lang={r.lang} className="mt-2 text-sm leading-relaxed text-ink-600">{r.body}</p>}
                </div>
                {(r.user_id === user?.id || isEditor) && (
                  <div className="flex shrink-0 gap-1">
                    {r.user_id === user?.id && <button className="rounded-lg p-1.5 text-ink-400 hover:bg-paper-100 hover:text-ink" onClick={() => setEditing(true)} aria-label="Edit"><Pencil size={14} /></button>}
                    <button className="rounded-lg p-1.5 text-ink-400 hover:bg-sun-50 hover:text-sun" onClick={() => setConfirm(r)} aria-label="Delete"><Trash2 size={14} /></button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)} onConfirm={() => remove(confirm)}
        title={L('Delete review?', 'রিভিউ মুছবেন?')} body={L('This can\u2019t be undone.', 'এটি আর ফেরানো যাবে না।')} />
    </section>
  );
}

export default function Magazine() {
  const { slug } = useParams();
  const { L, pick, taka, perMonth, num, languageName, date } = useLang();
  const { user, isEditor } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { data: mag, setData: setMag, loading, error, reload } = useFetch(`/api/magazines/${slug}`);
  const [openIssue, setOpenIssue] = useState(null);
  const [subOpen, setSubOpen] = useState(false);
  const [libBusy, setLibBusy] = useState(false);

  useEffect(() => { if (mag?.issues?.length && openIssue === null) setOpenIssue(mag.issues[0].id); }, [mag, openIssue]);

  if (error?.status === 404) return <NotFound />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (loading || !mag) {
    return <div className="grid gap-8 md:grid-cols-[280px_1fr]"><div className="skeleton aspect-[3/4]" /><div className="space-y-4"><div className="skeleton h-10 w-2/3" /><div className="skeleton h-4 w-1/2" /><div className="skeleton h-24" /></div></div>;
  }

  const requireUser = () => { if (!user) { navigate(`/login?next=/m/${mag.slug}`); return false; } return true; };
  const toggleLibrary = async () => {
    if (!requireUser()) return;
    const was = mag.in_library;
    setMag((m) => ({ ...m, in_library: !was }));
    setLibBusy(true);
    try {
      if (was) await api.del(`/api/me/library/${mag.id}`); else await api.post(`/api/me/library/${mag.id}`);
      toast(was ? L('Removed from library', 'লাইব্রেরি থেকে সরানো হয়েছে') : L('Added to your library', 'লাইব্রেরিতে যোগ হয়েছে'));
    } catch (e) { setMag((m) => ({ ...m, in_library: was })); toast(e.message, { type: 'error' }); }
    finally { setLibBusy(false); }
  };

  const firstArticle = mag.issues[0]?.articles.find((a) => a.status === 'published') || mag.issues[0]?.articles[0];
  const resume = mag.issues.flatMap((i) => i.articles).find((a) => a.progress > 0 && a.progress < 100);
  const active = mag.subscription?.status === 'active';
  const altTitle = pick(mag, 'title') === mag.title_en ? mag.title_bn : mag.title_en;

  return (
    <div>
      <button onClick={() => navigate(-1)} className="mb-5 inline-flex items-center gap-1.5 text-sm text-ink-400 hover:text-ink"><ArrowLeft size={15} />{L('Back', 'ফিরে যান')}</button>
      <div className="grid gap-8 md:grid-cols-[minmax(220px,300px)_1fr] lg:gap-12">
        <div className="mx-auto w-full max-w-[280px] md:max-w-none">
          <Cover mag={mag} full label={mag.issues[0] ? date(mag.issues[0].published_at) : ''} rounded="rounded-xl" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {mag.category_en && <span className="chip text-white" style={{ background: mag.category_color }}>{pick(mag, 'category')}</span>}
            <LangBadge code={mag.language} />
            {mag.status === 'draft' && <StatusBadge status="draft" />}
          </div>
          <h1 className="mt-3 font-serif text-3xl font-bold tracking-tight sm:text-4xl">{pick(mag, 'title')}</h1>
          {altTitle && altTitle !== pick(mag, 'title') && <div className="mt-1 font-serif text-lg text-ink-400">{altTitle}</div>}
          <p className="mt-3 text-lg text-ink-600">{pick(mag, 'tagline')}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-400">
            {mag.rating ? <span className="inline-flex items-center gap-1.5"><Stars value={mag.rating} size={13} />{num(mag.rating)} ({num(mag.review_count)})</span> : null}
            <span>{mag.publisher}</span>
            <span>{languageName(mag.language)}</span>
            <span className="capitalize">{mag.frequency === 'quarterly' ? L('Quarterly', 'ত্রৈমাসিক') : L('Monthly', 'মাসিক')}</span>
            <span>{num(mag.issue_count)} {L('issues', 'টি সংখ্যা')}</span>
          </div>
          <p className="mt-5 max-w-2xl leading-relaxed text-ink-600">{pick(mag, 'description')}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {(resume || firstArticle) && (
              <Link to={user ? `/read/${(resume || firstArticle).id}` : `/login?next=/read/${(resume || firstArticle).id}`} className="btn-primary px-5 py-2.5">
                <BookOpen size={16} />{resume ? L('Continue reading', 'পড়া চালিয়ে যান') : L('Start reading', 'পড়া শুরু করুন')}
              </Link>
            )}
            <button onClick={toggleLibrary} disabled={libBusy} className="btn-outline px-5 py-2.5">
              {mag.in_library ? <><Check size={16} className="text-delta" />{L('In library', 'লাইব্রেরিতে আছে')}</> : <><Plus size={16} />{L('Add to library', 'লাইব্রেরিতে রাখুন')}</>}
            </button>
            {isEditor && <Link to={`/studio/publications?edit=${mag.id}`} className="btn-ghost"><Pencil size={15} />{L('Edit in studio', 'স্টুডিওতে সম্পাদনা')}</Link>}
          </div>

          <div className="card mt-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm text-ink-500">{active ? L('You\u2019re subscribed', 'আপনি সাবস্ক্রাইবার') : L('Subscription', 'সাবস্ক্রিপশন')}</div>
              <div className="mt-0.5 font-serif text-2xl font-semibold">{taka(mag.price_poisha)}<span className="text-sm font-normal text-ink-400">{perMonth}</span>
                <span className="ml-2 text-sm font-normal text-ink-400">{L('or', 'অথবা')} {taka(mag.price_poisha * 10)}{L('/yr', '/বছর')}</span></div>
              {active && <div className="mt-1 text-xs text-delta">{mag.subscription.plan === 'yearly' ? L('Yearly plan', 'বার্ষিক প্ল্যান') : L('Monthly plan', 'মাসিক প্ল্যান')} · {L('renews', 'নবায়ন')} {date(mag.subscription.renews_at)}</div>}
            </div>
            {mag.status === 'published' && (
              active
                ? <Link to="/subscriptions" className="btn-outline"><CreditCard size={15} />{L('Manage', 'পরিচালনা')}</Link>
                : <button className="btn-dark" onClick={() => requireUser() && setSubOpen(true)}><CreditCard size={15} />{mag.subscription ? L('Resubscribe', 'আবার সাবস্ক্রাইব') : L('Subscribe', 'সাবস্ক্রাইব করুন')}</button>
            )}
          </div>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="font-serif text-xl font-semibold">{L('Issues', 'সংখ্যাসমূহ')}</h2>
        <div className="mt-4 space-y-3">
          {mag.issues.length === 0 && <p className="text-sm text-ink-400">{L('No issues published yet.', 'এখনো কোনো সংখ্যা প্রকাশিত হয়নি।')}</p>}
          {mag.issues.map((i) => <Issue key={i.id} issue={i} isEditor={isEditor} open={openIssue === i.id} onToggle={() => setOpenIssue(openIssue === i.id ? 0 : i.id)} />)}
        </div>
      </section>

      <Reviews mag={mag} setMag={setMag} />

      <SubscribeModal open={subOpen} onClose={() => setSubOpen(false)} mag={mag} current={mag.subscription}
        onDone={(sub) => setMag((m) => ({ ...m, subscription: sub, in_library: true, subscription_status: 'active' }))} />
    </div>
  );
}
