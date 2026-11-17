import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { BookOpen, PenTool, Newspaper } from 'lucide-react';
import { useAuth } from '../lib/auth.jsx';
import { useLang } from '../lib/i18n.jsx';
import { useToast } from '../lib/toast.jsx';
import { GenerativeCover, Spinner } from '../components/ui.jsx';
import { LangSwitch, Logo } from '../components/Shell.jsx';

export default function Auth({ mode }) {
  const { L } = useLang();
  const { login, register, demo } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next');
  const isLogin = mode === 'login';
  const [form, setForm] = useState({ name: '', email: '', password: '', role: params.get('role') === 'publisher' ? 'publisher' : 'reader' });
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState('');

  const done = (user) => {
    toast(L(`Welcome, ${user.name.split(' ')[0]}`, `স্বাগতম, ${user.name_bn || user.name}`));
    navigate(next || (user.role === 'editor' && !isLogin ? '/studio' : '/dashboard'), { replace: true });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setBusy('form');
    try { done(isLogin ? await login(form.email, form.password) : await register(form)); }
    catch (err) { setError(err.message); }
    finally { setBusy(null); }
  };

  const tryDemo = async (account) => {
    setError(''); setBusy(account);
    try { done(await demo(account)); } catch (err) { setError(err.message); } finally { setBusy(null); }
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const demos = [
    { id: 'reader', icon: BookOpen, title: L('Reader', 'পাঠক'), hint: 'reader@inkwell.com.bd' },
    { id: 'editor', icon: PenTool, title: L('Editor (admin)', 'সম্পাদক (অ্যাডমিন)'), hint: 'editor@inkwell.com.bd' },
    { id: 'desk', icon: Newspaper, title: L('Desk editor', 'ডেস্ক সম্পাদক'), hint: 'desk@inkwell.com.bd' },
  ];

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.05fr]">
      <div className="flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between"><Logo /><LangSwitch /></div>
        <div className="mx-auto my-auto w-full max-w-sm py-10">
          <h1 className="font-serif text-3xl font-semibold tracking-tight">{isLogin ? L('Welcome back', 'আবার স্বাগতম') : L('Create your account', 'অ্যাকাউন্ট খুলুন')}</h1>
          <p className="mt-2 text-sm text-ink-500">
            {isLogin ? L('Sign in to pick up where you left off.', 'যেখানে থেমেছিলেন, সেখান থেকে শুরু করতে সাইন ইন করুন।') : L('Free to join. Subscribe only to what you love.', 'যোগ দেওয়া ফ্রি। শুধু পছন্দের পত্রিকায় সাবস্ক্রাইব করুন।')}
          </p>

          <div className="mt-6">
            <div className="eyebrow mb-2">{L('One-click demo', 'এক ক্লিকে ডেমো')}</div>
            <div className="grid gap-2">
              {demos.map((d) => (
                <button key={d.id} onClick={() => tryDemo(d.id)} disabled={!!busy}
                  className="flex items-center gap-3 rounded-xl border border-paper-300 bg-white px-3.5 py-2.5 text-left transition hover:border-delta hover:bg-delta-50/40">
                  <span className="rounded-lg bg-paper-100 p-2 text-delta"><d.icon size={16} /></span>
                  <span className="flex-1"><span className="block text-sm font-semibold">{d.title}</span><span className="block text-xs text-ink-400">{d.hint}</span></span>
                  {busy === d.id && <Spinner size={16} className="text-delta" />}
                </button>
              ))}
            </div>
          </div>

          <div className="my-6 flex items-center gap-3 text-xs text-ink-300"><span className="h-px flex-1 bg-paper-300" />{L('or with email', 'অথবা ইমেইলে')}<span className="h-px flex-1 bg-paper-300" /></div>

          <form onSubmit={submit} className="space-y-4">
            {!isLogin && (
              <div><label className="label" htmlFor="name">{L('Full name', 'পূর্ণ নাম')}</label>
                <input id="name" className="input" value={form.name} onChange={set('name')} required autoComplete="name" placeholder={L('e.g. Ayesha Siddiqua', 'যেমন: আয়েশা সিদ্দিকা')} /></div>
            )}
            <div><label className="label" htmlFor="email">{L('Email', 'ইমেইল')}</label>
              <input id="email" type="email" className="input" value={form.email} onChange={set('email')} required autoComplete="email" placeholder="you@example.com.bd" /></div>
            <div><label className="label" htmlFor="password">{L('Password', 'পাসওয়ার্ড')}</label>
              <input id="password" type="password" className="input" value={form.password} onChange={set('password')} required minLength={6} autoComplete={isLogin ? 'current-password' : 'new-password'} /></div>
            {!isLogin && (
              <div>
                <span className="label">{L('I want to', 'আমি চাই')}</span>
                <div className="grid grid-cols-2 gap-2">
                  {[['reader', L('Read', 'পড়তে')], ['publisher', L('Publish', 'প্রকাশ করতে')]].map(([v, label]) => (
                    <button type="button" key={v} onClick={() => setForm((f) => ({ ...f, role: v }))}
                      className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${form.role === v ? 'border-delta bg-delta-50 text-delta-700' : 'border-paper-300 bg-white text-ink-500'}`}>{label}</button>
                  ))}
                </div>
              </div>
            )}
            {error && <div className="rounded-xl bg-sun-50 px-3.5 py-2.5 text-sm text-sun-600" role="alert">{error}</div>}
            <button className="btn-primary w-full py-2.5" disabled={!!busy}>{busy === 'form' && <Spinner size={16} />}{isLogin ? L('Sign in', 'সাইন ইন') : L('Create account', 'অ্যাকাউন্ট খুলুন')}</button>
          </form>
          <p className="mt-6 text-center text-sm text-ink-500">
            {isLogin ? L('New to Inkwell?', 'ইঙ্কওয়েলে নতুন?') : L('Already have an account?', 'আগেই অ্যাকাউন্ট আছে?')}{' '}
            <Link to={`${isLogin ? '/register' : '/login'}${next ? `?next=${encodeURIComponent(next)}` : ''}`} className="font-semibold text-delta hover:underline">
              {isLogin ? L('Create an account', 'অ্যাকাউন্ট খুলুন') : L('Sign in', 'সাইন ইন')}
            </Link>
          </p>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-delta-800 lg:block">
        <div className="absolute inset-0 grid grid-cols-3 gap-5 p-10 opacity-90" style={{ transform: 'rotate(-8deg) scale(1.25)' }} aria-hidden>
          {[
            ['নকশা', '#7c2d12', '#fdba74', 'arcs'], ['পথে প্রান্তরে', '#064e3b', '#a7f3d0', 'waves'], ['Byte Bangla', '#1e1b4b', '#22d3ee', 'grid'],
            ['শিকড়', '#881337', '#fde68a', 'circles'], ['Dhaka Table', '#431407', '#fb923c', 'stripes'], ['The Delta Ledger', '#0c1a3a', '#facc15', 'grid'],
            ['নদীমাতৃক', '#0c4a6e', '#fcd34d', 'waves'], ['চারুলিপি', '#701a75', '#f0abfc', 'circles'], ['Startup Dhaka', '#111827', '#34d399', 'stripes'],
          ].map(([t, c, a, s], i) => (
            <div key={i} className="aspect-[3/4] overflow-hidden rounded-lg shadow-cover">
              <GenerativeCover mag={{ slug: t, title_en: t, title_bn: t, language: /[a-z]/i.test(t) ? 'en' : 'bn', cover_color: c, cover_accent: a, cover_style: s }} />
            </div>
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-delta-800 via-delta-800/80 to-transparent p-12 pt-40 text-white">
          <p className="max-w-md font-bnserif text-2xl leading-relaxed">“{L('A nation that reads is a nation that thinks.', 'যে জাতি পড়ে, সে জাতি ভাবে।')}”</p>
          <p className="mt-3 text-sm text-white/60">{L('Bengali and English magazines from Bangladesh, in one place.', 'বাংলাদেশের বাংলা ও ইংরেজি পত্রিকা, এক জায়গায়।')}</p>
        </div>
      </div>
    </div>
  );
}
