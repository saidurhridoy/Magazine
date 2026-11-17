import { Link } from 'react-router-dom';
import { ArrowRight, Languages, Wallet, BookOpenText, PenTool, Smartphone, BarChart3 } from 'lucide-react';
import { useLang } from '../lib/i18n.jsx';
import { useFetch } from '../lib/useFetch.js';
import { Cover, GenerativeCover, LangBadge } from '../components/ui.jsx';
import { LangSwitch, Logo } from '../components/Shell.jsx';

const HERO = [
  { slug: 'h1', title_bn: 'নকশা', title_en: 'Noksha', language: 'bn', cover_color: '#7c2d12', cover_accent: '#fdba74', cover_style: 'arcs' },
  { slug: 'h2', title_bn: 'নদীমাতৃক', title_en: 'Nodimatrik', language: 'bn', cover_color: '#0c4a6e', cover_accent: '#fcd34d', cover_style: 'waves' },
  { slug: 'h3', title_bn: 'বাইট বাংলা', title_en: 'Byte Bangla', language: 'en', cover_color: '#1e1b4b', cover_accent: '#22d3ee', cover_style: 'grid' },
  { slug: 'h4', title_bn: 'শিকড়', title_en: 'Shikor', language: 'bn', cover_color: '#881337', cover_accent: '#fde68a', cover_style: 'circles' },
  { slug: 'h5', title_bn: 'ঢাকা টেবিল', title_en: 'Dhaka Table', language: 'en', cover_color: '#431407', cover_accent: '#fb923c', cover_style: 'stripes' },
];

export default function Landing() {
  const { L, pick, taka, perMonth, num } = useLang();
  const { data: mags } = useFetch('/api/magazines?sort=popular');

  const features = [
    { icon: Languages, title: L('Bangla and English, side by side', 'বাংলা ও ইংরেজি, পাশাপাশি'), body: L('Switch the interface anytime, and flip each article between Bengali and English independently.', 'ইন্টারফেস যখন খুশি বদলান, আর প্রতিটি লেখা আলাদাভাবে বাংলা বা ইংরেজিতে পড়ুন।') },
    { icon: Wallet, title: L('Priced in taka', 'টাকায় দাম'), body: L('Clear ৳ pricing from ৳250 a month, with yearly plans that include two free months.', 'মাসে ৳২৫০ থেকে স্পষ্ট দাম; বার্ষিক প্ল্যানে দুই মাস ফ্রি।') },
    { icon: BookOpenText, title: L('Read full issues in the browser', 'ব্রাউজারেই পুরো সংখ্যা'), body: L('Typography tuned for Bengali script, resume where you left off, bookmarks and a personal shelf.', 'বাংলা লিপির জন্য সাজানো টাইপোগ্রাফি, যেখানে থেমেছিলেন সেখান থেকে শুরু, বুকমার্ক আর নিজের তাক।') },
    { icon: Smartphone, title: L('Made for phones first', 'আগে মোবাইলের জন্য'), body: L('Fast on modest connections and comfortable on a 390-pixel screen.', 'সাধারণ নেটওয়ার্কেও দ্রুত, ছোট পর্দাতেও আরামদায়ক।') },
    { icon: PenTool, title: L('A real publishing studio', 'সত্যিকারের প্রকাশনা স্টুডিও'), body: L('Publishers manage titles, issues and articles, upload covers and keep drafts private.', 'প্রকাশকেরা পত্রিকা, সংখ্যা ও লেখা পরিচালনা করেন, প্রচ্ছদ আপলোড করেন, খসড়া গোপন রাখেন।') },
    { icon: BarChart3, title: L('Analytics that matter', 'কাজের বিশ্লেষণ'), body: L('Reads, most-read pieces and subscription revenue in taka, at a glance.', 'পাঠ, সবচেয়ে পঠিত লেখা আর টাকায় সাবস্ক্রিপশন আয়, এক নজরে।') },
  ];

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-30 border-b border-paper-200/70 bg-paper/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-2">
            <Link to="/discover" className="btn-ghost hidden sm:inline-flex">{L('Newsstand', 'পত্রিকার স্টল')}</Link>
            <LangSwitch />
            <Link to="/login" className="btn-dark btn-sm">{L('Sign in', 'সাইন ইন')}</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 md:grid-cols-[1.1fr_1fr] md:pb-24 md:pt-20">
          <div className="animate-rise">
            <span className="chip bg-delta-50 text-delta-700">🇧🇩 {L('Made for Bangladesh', 'বাংলাদেশের জন্য তৈরি')}</span>
            <h1 className="mt-5 font-serif text-4xl font-bold leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl">
              {L('Every magazine worth reading, in ', 'পড়ার মতো সব পত্রিকা, ')}
              <span className="text-delta">{L('Bangla', 'বাংলায়')}</span>
              {L(' and English.', ' ও ইংরেজিতে।')}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-500 sm:text-lg">
              {L('Inkwell is a digital newsstand for Bangladeshi publications — design, travel, food, culture, technology and business — priced in taka and readable on any phone.',
                'ইঙ্কওয়েল বাংলাদেশি পত্রিকার ডিজিটাল স্টল — নকশা, ভ্রমণ, খাবার, সংস্কৃতি, প্রযুক্তি আর ব্যবসা — দাম টাকায়, পড়া যায় যেকোনো ফোনে।')}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="btn-primary px-6 py-3 text-base">{L('Start reading free', 'বিনামূল্যে পড়া শুরু করুন')}<ArrowRight size={18} /></Link>
              <Link to="/discover" className="btn-outline px-6 py-3 text-base">{L('Browse the newsstand', 'পত্রিকা দেখুন')}</Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-ink-500">
              <div><span className="font-serif text-2xl font-semibold text-ink">{num(mags?.length || 7)}</span> {L('publications', 'পত্রিকা')}</div>
              <div><span className="font-serif text-2xl font-semibold text-ink">{taka(25000)}–{taka(45000)}</span>{perMonth}</div>
              <div><span className="font-serif text-2xl font-semibold text-ink">{L('2', '২')}</span> {L('languages', 'ভাষা')}</div>
            </div>
          </div>

          <div className="relative mx-auto h-[380px] w-full max-w-[440px] sm:h-[460px]" aria-hidden>
            <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-tr from-delta-100 via-paper-200 to-rose-100 blur-3xl" />
            {HERO.map((m, i) => {
              const angle = (i - 2) * 9;
              const x = (i - 2) * 62;
              return (
                <div key={m.slug} className="absolute left-1/2 top-1/2 w-[160px] overflow-hidden rounded-lg shadow-cover transition-transform duration-500 hover:-translate-y-3 sm:w-[200px]"
                  style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${Math.abs(i - 2) * 14}px)) rotate(${angle}deg)`, zIndex: 10 - Math.abs(i - 2) }}>
                  <div className="aspect-[3/4]"><GenerativeCover mag={m} label={L('NOVEMBER 2026', 'নভেম্বর ২০২৬')} /></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Shelf */}
      <section className="border-y border-paper-200 bg-white/60 py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <div className="eyebrow">{L('On the newsstand now', 'এখন স্টলে')}</div>
              <h2 className="mt-1 font-serif text-2xl font-semibold sm:text-3xl">{L('This month\u2019s issues', 'এ মাসের সংখ্যা')}</h2>
            </div>
            <Link to="/discover" className="btn-ghost">{L('See all', 'সব দেখুন')}<ArrowRight size={16} /></Link>
          </div>
          <div className="scrollbar-none -mx-4 flex snap-x gap-5 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0">
            {(mags || Array.from({ length: 6 }, () => null)).map((m, i) => (
              <Link key={m?.id ?? i} to={m ? `/m/${m.slug}` : '#'} className="w-36 shrink-0 snap-start sm:w-44">
                <Cover mag={m} />
                {m && <>
                  <div className="mt-3 truncate font-serif text-sm font-semibold">{pick(m, 'title')}</div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-ink-500"><LangBadge code={m.language} />{taka(m.price_poisha)}{perMonth}</div>
                </>}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="max-w-2xl">
          <div className="eyebrow">{L('Why Inkwell', 'কেন ইঙ্কওয়েল')}</div>
          <h2 className="mt-1 font-serif text-3xl font-semibold leading-tight sm:text-4xl">{L('A newsstand that speaks your language — literally.', 'যে স্টল আপনার ভাষায় কথা বলে।')}</h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="card p-6">
              <span className="inline-flex rounded-xl bg-delta-50 p-2.5 text-delta"><f.icon size={20} /></span>
              <h3 className="mt-4 font-serif text-lg font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Publisher CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-delta-800 px-6 py-12 text-white sm:px-12">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-sun/80" />
          <div className="relative max-w-xl">
            <h2 className="font-serif text-3xl font-semibold leading-tight">{L('Publish with Inkwell', 'ইঙ্কওয়েলে প্রকাশ করুন')}</h2>
            <p className="mt-3 text-white/75">{L('Bring your magazine online in an afternoon: upload a cover, add issues and articles in both languages, and start earning subscription revenue in taka.',
              'এক বিকেলেই আপনার পত্রিকা অনলাইনে আনুন: প্রচ্ছদ আপলোড করুন, দুই ভাষায় সংখ্যা ও লেখা যোগ করুন, আর টাকায় সাবস্ক্রিপশন আয় শুরু করুন।')}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/register?role=publisher" className="btn bg-white px-5 py-2.5 text-delta-800 hover:bg-paper">{L('Create a publisher account', 'প্রকাশক অ্যাকাউন্ট খুলুন')}</Link>
              <Link to="/login" className="btn border border-white/30 px-5 py-2.5 text-white hover:bg-white/10">{L('Try the demo studio', 'ডেমো স্টুডিও দেখুন')}</Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-paper-200 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-xs text-ink-400 sm:flex-row sm:px-6">
          <Logo />
          <span>{L('© 2026 Inkwell · Dhaka, Bangladesh · Prices in BDT, VAT inclusive', '© ২০২৬ ইঙ্কওয়েল · ঢাকা, বাংলাদেশ · দাম টাকায়, ভ্যাটসহ')}</span>
        </div>
      </footer>
    </div>
  );
}
