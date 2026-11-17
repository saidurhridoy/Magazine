import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { useLang } from '../lib/i18n.jsx';
import { useToast } from '../lib/toast.jsx';
import { api } from '../lib/api.js';
import { Modal, Spinner } from './ui.jsx';

/** Plan picker. `monthly` is the publication's price in poisha; yearly = 10× (two months free). */
export default function SubscribeModal({ open, onClose, mag, current, onDone }) {
  const { L, taka, pick, bn } = useLang();
  const toast = useToast();
  const [plan, setPlan] = useState(current?.plan || 'monthly');
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (open) setPlan(current?.status === 'active' ? (current.plan === 'monthly' ? 'yearly' : 'monthly') : current?.plan || 'monthly'); }, [open, current]);
  if (!mag) return null;
  const monthly = mag.price_poisha ?? mag.monthly_price;
  const plans = [
    { id: 'monthly', name: L('Monthly', 'মাসিক'), price: monthly, unit: L('/month', '/মাস'), note: L('Cancel anytime', 'যেকোনো সময় বাতিল করুন') },
    { id: 'yearly', name: L('Yearly', 'বার্ষিক'), price: monthly * 10, unit: L('/year', '/বছর'), note: L(`2 months free · ${taka(Math.round((monthly * 10) / 12))}/mo`, `২ মাস ফ্রি · ${taka(Math.round((monthly * 10) / 12))}/মাস`) },
  ];
  const isChange = current?.status === 'active';

  const confirm = async () => {
    setBusy(true);
    try {
      const sub = await api.post('/api/subscriptions', { magazine_id: mag.magazine_id || mag.id, plan });
      toast(isChange ? L('Plan updated', 'প্ল্যান বদলানো হয়েছে') : L(`Subscribed to ${mag.title_en}`, `${mag.title_bn || mag.title_en}-এ সাবস্ক্রাইব করেছেন`));
      onDone?.(sub);
      onClose();
    } catch (e) { toast(e.message, { type: 'error' }); }
    finally { setBusy(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title={isChange ? L('Change plan', 'প্ল্যান বদলান') : L('Subscribe', 'সাবস্ক্রাইব করুন')}
      footer={<>
        <button className="btn-ghost" onClick={onClose}>{L('Cancel', 'বাতিল')}</button>
        <button className="btn-primary" onClick={confirm} disabled={busy || (isChange && plan === current.plan)}>
          {busy && <Spinner size={14} />}{L('Confirm', 'নিশ্চিত করুন')} · {taka(plans.find((p) => p.id === plan).price)}
        </button>
      </>}>
      <p className="mb-4 text-sm text-ink-500">{bn ? `${pick(mag, 'title')} — সব সংখ্যা, সব লেখা, বাংলা ও ইংরেজিতে।` : `${pick(mag, 'title')} — every issue and every article, in Bangla and English.`}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {plans.map((p) => (
          <button key={p.id} onClick={() => setPlan(p.id)}
            className={`relative rounded-2xl border-2 p-4 text-left transition ${plan === p.id ? 'border-delta bg-delta-50/50' : 'border-paper-200 hover:border-paper-300'}`}>
            {p.id === 'yearly' && <span className="chip absolute right-3 top-3 bg-amber-100 text-amber-800">{L('Best value', 'সেরা মূল্য')}</span>}
            <div className="text-sm font-semibold">{p.name}{current?.status === 'active' && current.plan === p.id && <span className="ml-2 text-xs font-normal text-delta">({L('current', 'বর্তমান')})</span>}</div>
            <div className="mt-2 font-serif text-2xl font-semibold">{taka(p.price)}<span className="text-sm font-normal text-ink-400">{p.unit}</span></div>
            <div className="mt-1 text-xs text-ink-500">{p.note}</div>
            {plan === p.id && <span className="absolute bottom-3 right-3 rounded-full bg-delta p-1 text-white"><Check size={12} /></span>}
          </button>
        ))}
      </div>
      <p className="mt-4 text-xs text-ink-400">{L('Prices include VAT. Pay with bKash, Nagad, Rocket or card (demo — no charge is made).', 'দামে ভ্যাট অন্তর্ভুক্ত। বিকাশ, নগদ, রকেট বা কার্ডে পরিশোধ (ডেমো — কোনো টাকা কাটা হবে না)।')}</p>
    </Modal>
  );
}
