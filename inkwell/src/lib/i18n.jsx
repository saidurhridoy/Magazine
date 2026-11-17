import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const LangContext = createContext(null);
const KEY = 'inkwell.lang';

const BN_DIGITS = '০১২৩৪৫৬৭৮৯';
export const toBn = (s) => String(s).replace(/[0-9]/g, (d) => BN_DIGITS[d]);

const BN_MONTHS = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'];
const EN_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** SQLite "YYYY-MM-DD HH:MM:SS" is UTC; make it parseable everywhere. */
export const parseDate = (s) => (s instanceof Date ? s : new Date(String(s).includes('T') ? s : String(s).replace(' ', 'T') + (String(s).length > 10 ? 'Z' : '')));

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try { return localStorage.getItem(KEY) || 'bn'; } catch { return 'bn'; }
  });
  useEffect(() => {
    document.documentElement.lang = lang;
    try { localStorage.setItem(KEY, lang); } catch { /* private mode */ }
  }, [lang]);

  const setLang = useCallback((l) => setLangState(l === 'en' ? 'en' : 'bn'), []);

  const value = useMemo(() => {
    const bn = lang === 'bn';
    /** Inline bilingual string: L('Discover', 'আবিষ্কার'). */
    const L = (en, bnText) => (bn ? bnText ?? en : en);
    const num = (n) => {
      const s = Number(n || 0).toLocaleString('en-IN');
      return bn ? toBn(s) : s;
    };
    /** Prices are stored in poisha; ৳ with Indian-style grouping, Bengali digits in bn. */
    const taka = (poisha, { decimals = false } = {}) => {
      const v = Number(poisha || 0) / 100;
      const s = v.toLocaleString('en-IN', { minimumFractionDigits: decimals ? 2 : 0, maximumFractionDigits: decimals ? 2 : 0 });
      return '৳' + (bn ? toBn(s) : s);
    };
    /** Pick the localized field from a record (title_en / title_bn) with fallback. */
    const pick = (obj, field, forceLang) => {
      if (!obj) return '';
      const want = forceLang || lang;
      const other = want === 'bn' ? 'en' : 'bn';
      return obj[`${field}_${want}`] || obj[`${field}_${other}`] || '';
    };
    const date = (s, opts = {}) => {
      if (!s) return '';
      const d = parseDate(s);
      const day = d.getDate();
      const month = (bn ? BN_MONTHS : EN_MONTHS)[d.getMonth()];
      const year = opts.year === false ? '' : ` ${d.getFullYear()}`;
      return bn ? toBn(`${day} ${month}${year}`) : `${day} ${month}${year}`;
    };
    const ago = (s) => {
      const diff = (Date.now() - parseDate(s).getTime()) / 1000;
      const fmt = (n, en, bnU) => (bn ? `${toBn(n)} ${bnU} আগে` : `${n}${en} ago`);
      if (diff < 60) return L('just now', 'এইমাত্র');
      if (diff < 3600) return fmt(Math.floor(diff / 60), 'm', 'মিনিট');
      if (diff < 86400) return fmt(Math.floor(diff / 3600), 'h', 'ঘণ্টা');
      if (diff < 86400 * 30) return fmt(Math.floor(diff / 86400), 'd', 'দিন');
      return date(s);
    };
    const perMonth = L('/mo', '/মাস');
    const languageName = (code) => ({ bn: L('Bengali', 'বাংলা'), en: L('English', 'ইংরেজি'), both: L('Bilingual', 'দ্বিভাষিক') })[code] || code;
    return { lang, bn, setLang, L, num, taka, pick, date, ago, perMonth, languageName };
  }, [lang, setLang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
