import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './lib/auth.jsx';
import { useLang } from './lib/i18n.jsx';
import Shell from './components/Shell.jsx';
import { Spinner } from './components/ui.jsx';
import Landing from './pages/Landing.jsx';
import Auth from './pages/Auth.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Discover from './pages/Discover.jsx';
import Magazine from './pages/Magazine.jsx';
import Reader from './pages/Reader.jsx';
import LibraryPage from './pages/Library.jsx';
import Bookmarks from './pages/Bookmarks.jsx';
import Subscriptions from './pages/Subscriptions.jsx';
import SettingsPage from './pages/Settings.jsx';
import NotFound from './pages/NotFound.jsx';

// The studio pulls in Recharts; keep it out of the reader bundle.
const Analytics = lazy(() => import('./pages/studio/Analytics.jsx'));
const Publications = lazy(() => import('./pages/studio/Publications.jsx'));
const Articles = lazy(() => import('./pages/studio/Articles.jsx'));

function FullPageSpinner() {
  return <div className="flex min-h-[50vh] items-center justify-center text-ink-400"><Spinner size={24} /></div>;
}

function RequireAuth({ children, editor = false }) {
  const { user, ready } = useAuth();
  const { L } = useLang();
  const location = useLocation();
  if (!ready) return <FullPageSpinner />;
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  if (editor && user.role !== 'editor') {
    return (
      <div className="card mx-auto mt-10 max-w-md p-8 text-center">
        <h2 className="font-serif text-xl font-semibold">{L('Publishers only', 'শুধু প্রকাশকদের জন্য')}</h2>
        <p className="mt-2 text-sm text-ink-500">{L('The publishing studio is available to editor accounts. Sign in as an editor to manage publications.', 'প্রকাশনা স্টুডিও শুধু সম্পাদক অ্যাকাউন্টের জন্য। পত্রিকা পরিচালনা করতে সম্পাদক হিসেবে সাইন ইন করুন।')}</p>
      </div>
    );
  }
  return children;
}

function Home() {
  const { user, ready } = useAuth();
  if (!ready) return <FullPageSpinner />;
  return user ? <Navigate to="/dashboard" replace /> : <Landing />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/welcome" element={<Landing />} />
      <Route path="/login" element={<Auth mode="login" />} />
      <Route path="/register" element={<Auth mode="register" />} />
      <Route path="/read/:id" element={<RequireAuth><Reader /></RequireAuth>} />
      <Route element={<Shell />}>
        <Route path="/discover" element={<Discover />} />
        <Route path="/m/:slug" element={<Magazine />} />
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/library" element={<RequireAuth><LibraryPage /></RequireAuth>} />
        <Route path="/bookmarks" element={<RequireAuth><Bookmarks /></RequireAuth>} />
        <Route path="/subscriptions" element={<RequireAuth><Subscriptions /></RequireAuth>} />
        <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
        <Route path="/studio" element={<RequireAuth editor><Suspense fallback={<FullPageSpinner />}><Analytics /></Suspense></RequireAuth>} />
        <Route path="/studio/publications" element={<RequireAuth editor><Suspense fallback={<FullPageSpinner />}><Publications /></Suspense></RequireAuth>} />
        <Route path="/studio/articles" element={<RequireAuth editor><Suspense fallback={<FullPageSpinner />}><Articles /></Suspense></RequireAuth>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
