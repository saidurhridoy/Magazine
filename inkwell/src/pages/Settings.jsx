import { useEffect, useState } from 'react';
import { Check, ShieldCheck } from 'lucide-react';
import { useAuth } from '../lib/auth.jsx';
import { useLang } from '../lib/i18n.jsx';
import { useToast } from '../lib/toast.jsx';
import { Avatar, PageHeader, Spinner } from '../components/ui.jsx';
import { LangSwitch } from '../components/Shell.jsx';

const COLORS = ['#0f766e', '#006a4e', '#b45309', '#be123c', '#4338ca', '#c2410c', '#1e3a8a', '#701a75', '#44403c'];

export default function SettingsPage() {
  const { user, update } = useAuth();
  const { L, date } = useLang();
  const toast = useToast();
  const [form, setForm] = useState({ name: '', name_bn: '', bio: '', title: '', avatar_color: '' });
  const [pw, setPw] = useState({ current_password: '', new_password: '' });
  const [busy, setBusy] = useState(null);

  useEffect(() => { setForm({ name: user.name || '', name_bn: user.name_bn || '', bio: user.bio || '', title: user.title || '', avatar_color: user.avatar_color }); }, [user]);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const dirty = ['name', 'name_bn', 'bio', 'title', 'avatar_color'].some((k) => (form[k] || '') !== (user[k] || ''));

  const save = async (e) => {
    e.preventDefault(); setBusy('profile');
    try { await update(form); toast(L('Profile saved', 'প্রোফাইল সংরক্ষিত হয়েছে')); } catch (err) { toast(err.message, { type: 'error' }); } finally { setBusy(null); }
  };
  const savePw = async (e) => {
    e.preventDefault(); setBusy('pw');
    try { await update(pw); setPw({ current_password: '', new_password: '' }); toast(L('Password changed', 'পাসওয়ার্ড বদলানো হয়েছে')); }
    catch (err) { toast(err.message, { type: 'error' }); } finally { setBusy(null); }
  };

  return (
    <div className="max-w-3xl">
      <PageHeader eyebrow={L('Account', 'অ্যাকাউন্ট')} title={L('Settings', 'সেটিংস')} />
      <form onSubmit={save} className="card p-5 sm:p-6">
        <h2 className="font-serif text-lg font-semibold">{L('Profile', 'প্রোফাইল')}</h2>
        <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar user={{ ...user, ...form }} size={64} />
          <div>
            <span className="label">{L('Avatar colour', 'অ্যাভাটারের রং')}</span>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button type="button" key={c} onClick={() => setForm((f) => ({ ...f, avatar_color: c }))} className="flex h-8 w-8 items-center justify-center rounded-full ring-offset-2 transition"
                  style={{ background: c, boxShadow: form.avatar_color === c ? `0 0 0 2px #fff, 0 0 0 4px ${c}` : 'none' }} aria-label={c}>
                  {form.avatar_color === c && <Check size={14} className="text-white" />}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div><label className="label" htmlFor="s-name">{L('Name (English)', 'নাম (ইংরেজি)')}</label><input id="s-name" className="input" value={form.name} onChange={set('name')} required /></div>
          <div><label className="label" htmlFor="s-namebn">{L('Name (Bengali)', 'নাম (বাংলা)')}</label><input id="s-namebn" className="input" value={form.name_bn} onChange={set('name_bn')} placeholder="যেমন: নুসরাত জাহান" /></div>
          <div className="sm:col-span-2"><label className="label" htmlFor="s-title">{L('Title', 'পদবি')}</label><input id="s-title" className="input" value={form.title} onChange={set('title')} /></div>
          <div className="sm:col-span-2"><label className="label" htmlFor="s-bio">{L('Bio', 'পরিচিতি')}</label><textarea id="s-bio" className="input min-h-[80px]" value={form.bio} onChange={set('bio')} maxLength={400} /></div>
        </div>
        <div className="mt-5 flex justify-end"><button className="btn-primary" disabled={!dirty || busy === 'profile'}>{busy === 'profile' && <Spinner size={14} />}{L('Save changes', 'পরিবর্তন সংরক্ষণ')}</button></div>
      </form>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="card p-5 sm:p-6">
          <h2 className="font-serif text-lg font-semibold">{L('Account', 'অ্যাকাউন্ট')}</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-ink-400">{L('Email', 'ইমেইল')}</dt><dd className="truncate font-medium">{user.email}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-ink-400">{L('Role', 'ভূমিকা')}</dt>
              <dd><span className={`chip ${user.role === 'editor' ? 'bg-amber-50 text-amber-800' : 'bg-delta-50 text-delta-700'}`}><ShieldCheck size={11} />{user.role === 'editor' ? L('Editor · studio access', 'সম্পাদক · স্টুডিও অ্যাক্সেস') : L('Reader', 'পাঠক')}</span></dd></div>
            <div className="flex justify-between gap-4"><dt className="text-ink-400">{L('Member since', 'সদস্য হয়েছেন')}</dt><dd className="font-medium">{date(user.created_at)}</dd></div>
            <div className="flex items-center justify-between gap-4"><dt className="text-ink-400">{L('Interface language', 'ইন্টারফেসের ভাষা')}</dt><dd><LangSwitch /></dd></div>
          </dl>
        </div>
        <form onSubmit={savePw} className="card p-5 sm:p-6">
          <h2 className="font-serif text-lg font-semibold">{L('Password', 'পাসওয়ার্ড')}</h2>
          <div className="mt-4 space-y-3">
            <div><label className="label" htmlFor="pw-c">{L('Current password', 'বর্তমান পাসওয়ার্ড')}</label><input id="pw-c" type="password" className="input" value={pw.current_password} onChange={(e) => setPw((p) => ({ ...p, current_password: e.target.value }))} required autoComplete="current-password" /></div>
            <div><label className="label" htmlFor="pw-n">{L('New password', 'নতুন পাসওয়ার্ড')}</label><input id="pw-n" type="password" className="input" value={pw.new_password} onChange={(e) => setPw((p) => ({ ...p, new_password: e.target.value }))} required minLength={6} autoComplete="new-password" /></div>
          </div>
          <div className="mt-4 flex justify-end"><button className="btn-outline" disabled={busy === 'pw'}>{busy === 'pw' && <Spinner size={14} />}{L('Update password', 'পাসওয়ার্ড বদলান')}</button></div>
        </form>
      </div>
    </div>
  );
}
