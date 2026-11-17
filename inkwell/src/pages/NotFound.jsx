import { Link } from 'react-router-dom';
import { useLang } from '../lib/i18n.jsx';

export default function NotFound() {
  const { L } = useLang();
  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <div className="font-serif text-6xl font-bold text-paper-300">৪০৪</div>
      <h1 className="mt-4 font-serif text-2xl font-semibold">{L('This page went to press without us', 'এই পাতাটি খুঁজে পাওয়া যায়নি')}</h1>
      <p className="mt-2 text-sm text-ink-500">{L('The link may be old, or the publication is still a draft.', 'লিংকটি পুরোনো হতে পারে, অথবা পত্রিকাটি এখনো খসড়া।')}</p>
      <Link to="/discover" className="btn-primary mt-6">{L('Browse the newsstand', 'পত্রিকার স্টলে যান')}</Link>
    </div>
  );
}
