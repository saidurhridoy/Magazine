import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Compass, Library, Bookmark, CreditCard, Settings, BarChart3, BookOpen, FileText, LogOut, Menu, X, Search, LogIn,
} from 'lucide-react';
import { useAuth } from '../lib/auth.jsx';
import { useLang } from '../lib/i18n.jsx';
import { api } from '../lib/api.js';
import { Avatar, Cover } from './ui.jsx';

export function Logo({ compact = false, light = false }) {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <svg viewBox="0 0 64 64" className="h-8 w-8 shrink-0" aria-hidden>
        <rect width="64" height="64" rx="14" fill="#006a4e" />
        <circle cx="32" cy="32" r="14" fill="#e5383b" />
        <path d="M32 12 C38 22 38 30 32 40 C26 30 26 22 32 12Z" fill="#faf7f2" />
      </svg>
      {!compact && (
        <span className="leading-none">
          <span className={`block font-bnserif text-lg font-bold ${light ? 'text-white' : 'text-ink'}`}>ইঙ্কওয়েল</span>
          <span className={`block text-[10px] font-semibold uppercase tracking-[0.25em] ${light ? 'text-white/60' : 'text-ink-400'}`}>Inkwell</span>
        </span>
      )}
    </Link>
  );
}

export function LangSwitch({ className = '' }) {
  const { lang, setLang } = useLang();
  return (
    <div className={`inline-flex rounded-full border border-paper-300 bg-white p-0.5 text-xs font-semibold ${className}`} role="group" aria-label="Interface language">
      {[['bn', 'বাংলা'], ['en', 'EN']].map(([code, label]) => (
        <button key={code} onClick={() => setLang(code)} aria-pressed={lang === code}
          className={`rounded-full px-3 py-1 transition ${lang === code ? 'bg-ink text-paper' : 'text-ink-500 hover:text-ink'}`}>{label}</button>
      ))}
    </div>
  );
}

function SearchBox() {
  const { L, pick } = useLang();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [res, setRes] = useState(null);
  const [open, setOpen] = useState(false);
  const box = useRef(null);

  useEffect(() => {
    if (!q.trim()) { setRes(null); return undefined; }
    const t = setTimeout(() => api.get(`/api/search?q=${encodeURIComponent(q.trim())}`).then(setRes).catch(() => {}), 180);
    return () => clearTimeout(t);
  }, [q]);
  useEffect(() => {
    const onDown = (e) => box.current && !box.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const go = (to) => { setOpen(false); setQ(''); navigate(to); };
  const empty = res && !res.magazines.length && !res.articles.length;

  return (
    <div ref={box} className="relative w-full max-w-md">
      <form onSubmit={(e) => { e.preventDefault(); if (q.trim()) go(`/discover?q=${encodeURIComponent(q.trim())}`); }}>
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300" />
        <input value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)}
          placeholder={L('Search magazines & articles…', 'পত্রিকা ও লেখা খুঁজুন…')}
          className="w-full rounded-full border border-paper-300 bg-white py-2 pl-10 pr-4 text-sm placeholder:text-ink-300 focus:border-delta focus:outline-none focus:ring-2 focus:ring-delta/15" />
      </form>
      {open && res && (
        <div className="absolute inset-x-0 top-full z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-2xl border border-paper-200 bg-white p-2 shadow-cover">
          {empty && <div className="px-3 py-6 text-center text-sm text-ink-400">{L('No matches', 'কিছু পাওয়া যায়নি')}</div>}
          {res.magazines.length > 0 && <div className="eyebrow px-3 pb-1 pt-2">{L('Publications', 'পত্রিকা')}</div>}
          {res.magazines.map((m) => (
            <button key={m.id} onClick={() => go(`/m/${m.slug}`)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-paper-100">
              <div className="w-8 shrink-0"><Cover mag={m} masthead={false} rounded="rounded" /></div>
              <div className="min-w-0"><div className="truncate text-sm font-semibold">{pick(m, 'title')}</div><div className="truncate text-xs text-ink-400">{pick(m, 'tagline')}</div></div>
            </button>
          ))}
          {res.articles.length > 0 && <div className="eyebrow px-3 pb-1 pt-3">{L('Articles', 'লেখা')}</div>}
          {res.articles.map((a) => (
            <button key={a.id} onClick={() => go(`/read/${a.id}`)} className="block w-full rounded-xl px-3 py-2 text-left hover:bg-paper-100">
              <div className="truncate text-sm font-medium">{pick(a, 'title')}</div>
              <div className="truncate text-xs text-ink-400">{pick(a, 'magazine_title')} · {a.author}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function NavItem({ to, icon: Icon, children, end, onClick }) {
  return (
    <NavLink to={to} end={end} onClick={onClick}
      className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-ink text-paper' : 'text-ink-600 hover:bg-paper-200 hover:text-ink'}`}>
      <Icon size={17} />{children}
    </NavLink>
  );
}

function Sidebar({ onNavigate }) {
  const { user, isEditor, logout } = useAuth();
  const { L, bn } = useLang();
  const navigate = useNavigate();
  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pb-6 pt-5"><Logo /></div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {user && <NavItem to="/dashboard" icon={LayoutDashboard} onClick={onNavigate}>{L('Dashboard', 'ড্যাশবোর্ড')}</NavItem>}
        <NavItem to="/discover" icon={Compass} onClick={onNavigate}>{L('Discover', 'আবিষ্কার')}</NavItem>
        {user && <>
          <NavItem to="/library" icon={Library} onClick={onNavigate}>{L('Library', 'লাইব্রেরি')}</NavItem>
          <NavItem to="/bookmarks" icon={Bookmark} onClick={onNavigate}>{L('Bookmarks', 'বুকমার্ক')}</NavItem>
          <NavItem to="/subscriptions" icon={CreditCard} onClick={onNavigate}>{L('Subscriptions', 'সাবস্ক্রিপশন')}</NavItem>
        </>}
        {isEditor && <>
          <div className="eyebrow px-3 pb-1 pt-6">{L('Publishing studio', 'প্রকাশনা স্টুডিও')}</div>
          <NavItem to="/studio" end icon={BarChart3} onClick={onNavigate}>{L('Analytics', 'বিশ্লেষণ')}</NavItem>
          <NavItem to="/studio/publications" icon={BookOpen} onClick={onNavigate}>{L('Publications', 'পত্রিকা')}</NavItem>
          <NavItem to="/studio/articles" icon={FileText} onClick={onNavigate}>{L('Articles', 'লেখা')}</NavItem>
        </>}
        {user && <div className="pt-6"><NavItem to="/settings" icon={Settings} onClick={onNavigate}>{L('Settings', 'সেটিংস')}</NavItem></div>}
      </nav>
      <div className="border-t border-paper-200 p-3">
        {user ? (
          <div className="flex items-center gap-3 rounded-xl p-2">
            <Avatar user={user} size={36} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{bn && user.name_bn ? user.name_bn : user.name}</div>
              <div className="truncate text-xs text-ink-400">{user.role === 'editor' ? L('Editor', 'সম্পাদক') : L('Reader', 'পাঠক')}</div>
            </div>
            <button className="rounded-lg p-2 text-ink-400 hover:bg-paper-200 hover:text-ink" title={L('Sign out', 'সাইন আউট')}
              onClick={async () => { await logout(); navigate('/'); }}><LogOut size={16} /></button>
          </div>
        ) : (
          <Link to="/login" onClick={onNavigate} className="btn-primary w-full"><LogIn size={16} />{L('Sign in', 'সাইন ইন')}</Link>
        )}
      </div>
    </div>
  );
}

export default function Shell() {
  const [drawer, setDrawer] = useState(false);
  const { user } = useAuth();
  const { L } = useLang();
  const location = useLocation();
  useEffect(() => setDrawer(false), [location.pathname]);
  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

  return (
    <div className="min-h-screen lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-paper-200 bg-paper-100/70 backdrop-blur lg:block">
        <Sidebar />
      </aside>

      {drawer && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setDrawer(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] animate-rise bg-paper shadow-cover">
            <button className="absolute right-3 top-5 rounded-full p-2 text-ink-400 hover:bg-paper-200" onClick={() => setDrawer(false)} aria-label="Close menu"><X size={18} /></button>
            <Sidebar onNavigate={() => setDrawer(false)} />
          </aside>
        </div>
      )}

      <header className="sticky top-0 z-30 border-b border-paper-200 bg-paper/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          <button className="-ml-1 rounded-lg p-2 text-ink-600 hover:bg-paper-200 lg:hidden" onClick={() => setDrawer(true)} aria-label="Open menu"><Menu size={20} /></button>
          <div className="lg:hidden"><Logo compact /></div>
          <div className="flex flex-1 justify-center lg:justify-start"><div className="hidden w-full max-w-md sm:block"><SearchBox /></div></div>
          <LangSwitch />
          {!user && <Link to="/login" className="btn-dark btn-sm hidden sm:inline-flex">{L('Sign in', 'সাইন ইন')}</Link>}
        </div>
        <div className="px-4 pb-3 sm:hidden"><SearchBox /></div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
