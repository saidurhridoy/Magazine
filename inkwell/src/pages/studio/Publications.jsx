import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Pencil, Trash2, UploadCloud, ImageOff, ExternalLink, Search, BookOpen, Check, X } from 'lucide-react';
import { useLang } from '../../lib/i18n.jsx';
import { useToast } from '../../lib/toast.jsx';
import { useFetch } from '../../lib/useFetch.js';
import { api, qs } from '../../lib/api.js';
import { ConfirmDialog, Cover, EmptyState, ErrorState, LangBadge, Modal, PageHeader, RowsSkeleton, Spinner } from '../../components/ui.jsx';

const MAX_BYTES = 8 * 1024 * 1024;
const TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/avif'];
const STYLES = ['arcs', 'grid', 'waves', 'circles', 'stripes'];
const BLANK = {
  title_en: '', title_bn: '', tagline_en: '', tagline_bn: '', description_en: '', description_bn: '', category_id: '', language: 'bn',
  frequency: 'monthly', price: 350, status: 'draft', publisher: '', cover_color: '#006a4e', cover_accent: '#fcd34d', cover_style: 'arcs',
  cover_url: null, cover_thumb: null, cover_lang: null,
};

const readFile = (file) => new Promise((resolve, reject) => {
  const r = new FileReader();
  r.onload = () => resolve(r.result);
  r.onerror = () => reject(new Error('Could not read file'));
  r.readAsDataURL(file);
});

function CoverUploader({ form, setForm, magId, onSaved }) {
  const { L } = useLang();
  const toast = useToast();
  const input = useRef(null);
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);

  const upload = async (file) => {
    if (!file) return;
    if (!TYPES.includes(file.type)) { toast(L('Use a PNG, JPEG, WebP or AVIF image', 'PNG, JPEG, WebP বা AVIF ছবি দিন'), { type: 'error' }); return; }
    if (file.size > MAX_BYTES) { toast(L('Image must be 8 MB or smaller', 'ছবি ৮ MB-এর কম হতে হবে'), { type: 'error' }); return; }
    const before = { cover_url: form.cover_url, cover_thumb: form.cover_thumb };
    const preview = URL.createObjectURL(file);
    setForm((f) => ({ ...f, cover_url: preview, cover_thumb: preview, _preview: true })); // optimistic
    setBusy(true);
    try {
      const data = await readFile(file);
      const lang = form.cover_lang || (form.language === 'both' ? 'both' : form.language);
      const res = await api.post('/api/uploads', { data, magazine_id: magId || undefined, cover_lang: lang });
      setForm((f) => ({ ...f, cover_url: res.url, cover_thumb: res.thumb, cover_lang: f.cover_lang || lang, _preview: false, _uploaded: magId ? null : res.url }));
      if (magId) onSaved?.({ cover_url: res.url, cover_thumb: res.thumb, cover_lang: form.cover_lang || lang });
      toast(magId ? L('Cover updated', 'প্রচ্ছদ হালনাগাদ হয়েছে') : L('Cover uploaded — save to keep it', 'প্রচ্ছদ আপলোড হয়েছে — রাখতে সংরক্ষণ করুন'));
    } catch (e) {
      setForm((f) => ({ ...f, ...before, _preview: false })); // rollback
      toast(e.message, { type: 'error' });
    } finally {
      setBusy(false);
      URL.revokeObjectURL(preview);
    }
  };

  const removeCover = async () => {
    const before = { cover_url: form.cover_url, cover_thumb: form.cover_thumb, cover_lang: form.cover_lang };
    setForm((f) => ({ ...f, cover_url: null, cover_thumb: null, cover_lang: null, _uploaded: null }));
    try {
      if (magId) { await api.del('/api/uploads', { magazine_id: magId }); onSaved?.({ cover_url: null, cover_thumb: null, cover_lang: null }); }
      else if (before.cover_url) await api.del('/api/uploads', { url: before.cover_url });
      toast(L('Cover removed — using generated art', 'প্রচ্ছদ সরানো হয়েছে — তৈরি করা নকশা ব্যবহার হবে'));
    } catch (e) { setForm((f) => ({ ...f, ...before })); toast(e.message, { type: 'error' }); }
  };

  return (
    <div>
      <div onClick={() => !busy && input.current?.click()} role="button" tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && input.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); upload(e.dataTransfer.files?.[0]); }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-6 text-center transition ${drag ? 'border-delta bg-delta-50' : 'border-paper-300 hover:border-ink-300 hover:bg-paper-100/60'}`}>
        {busy ? <Spinner size={22} className="text-delta" /> : <UploadCloud size={22} className="text-ink-400" />}
        <div className="mt-2 text-sm font-medium">{busy ? L('Processing cover…', 'প্রচ্ছদ প্রস্তুত হচ্ছে…') : L('Drop a cover image or click to browse', 'প্রচ্ছদ এখানে ছেড়ে দিন বা ক্লিক করে বাছুন')}</div>
        <div className="mt-0.5 text-xs text-ink-400">PNG · JPEG · WebP · AVIF · {L('max 8 MB', 'সর্বোচ্চ ৮ MB')}</div>
        <input ref={input} type="file" accept={TYPES.join(',')} className="hidden" onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ''; }} />
      </div>
      {form.cover_url && !form._preview && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <select className="input w-auto py-1.5 text-xs" value={form.cover_lang || ''} onChange={(e) => setForm((f) => ({ ...f, cover_lang: e.target.value || null }))} aria-label={L('Language printed on the cover', 'প্রচ্ছদের ভাষা')}>
            <option value="">{L('Cover language…', 'প্রচ্ছদের ভাষা…')}</option>
            <option value="bn">{L('Bengali cover', 'বাংলা প্রচ্ছদ')}</option>
            <option value="en">{L('English cover', 'ইংরেজি প্রচ্ছদ')}</option>
            <option value="both">{L('Bilingual cover', 'দ্বিভাষিক প্রচ্ছদ')}</option>
          </select>
          <button type="button" className="btn-ghost btn-sm text-sun" onClick={removeCover}><ImageOff size={13} />{L('Remove photo', 'ছবি সরান')}</button>
        </div>
      )}
    </div>
  );
}

function IssuesManager({ magId }) {
  const { L, pick, num, date } = useLang();
  const toast = useToast();
  const { data, setData, loading } = useFetch(`/api/magazines/${magId}/issues`);
  const [draft, setDraft] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const save = async () => {
    try {
      if (draft.id) {
        const updated = await api.patch(`/api/issues/${draft.id}`, draft);
        setData((list) => list.map((i) => (i.id === draft.id ? { ...i, ...updated } : i)));
      } else {
        const created = await api.post('/api/issues', { ...draft, magazine_id: magId });
        setData((list) => [{ ...created, article_count: 0 }, ...list]);
      }
      setDraft(null);
      toast(L('Issue saved', 'সংখ্যা সংরক্ষিত'));
    } catch (e) { toast(e.message, { type: 'error' }); }
  };
  const remove = async (issue) => {
    setConfirm(null);
    const snapshot = data;
    setData((list) => list.filter((i) => i.id !== issue.id));
    try { await api.del(`/api/issues/${issue.id}`); toast(L('Issue deleted', 'সংখ্যা মুছে ফেলা হয়েছে')); } catch (e) { setData(snapshot); toast(e.message, { type: 'error' }); }
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="label mb-0">{L('Issues', 'সংখ্যাসমূহ')}</span>
        <button type="button" className="btn-outline btn-sm" onClick={() => setDraft({ title_en: '', title_bn: '', published_at: new Date().toISOString().slice(0, 10) })}><Plus size={13} />{L('Add issue', 'সংখ্যা যোগ')}</button>
      </div>
      {draft && (
        <div className="mb-3 grid gap-2 rounded-xl border border-delta/30 bg-delta-50/40 p-3 sm:grid-cols-[1fr_1fr_140px_auto]">
          <input className="input py-2" placeholder={L('Title (English)', 'শিরোনাম (ইংরেজি)')} value={draft.title_en} onChange={(e) => setDraft((d) => ({ ...d, title_en: e.target.value }))} />
          <input className="input py-2" placeholder={L('Title (Bengali)', 'শিরোনাম (বাংলা)')} value={draft.title_bn} onChange={(e) => setDraft((d) => ({ ...d, title_bn: e.target.value }))} />
          <input className="input py-2" type="date" value={draft.published_at?.slice(0, 10)} onChange={(e) => setDraft((d) => ({ ...d, published_at: e.target.value }))} />
          <div className="flex gap-1"><button type="button" className="btn-primary btn-sm" onClick={save}><Check size={13} /></button><button type="button" className="btn-ghost btn-sm" onClick={() => setDraft(null)}><X size={13} /></button></div>
        </div>
      )}
      {loading && !data ? <div className="skeleton h-20" /> : (
        <ul className="divide-y divide-paper-200 rounded-xl border border-paper-200">
          {(data || []).length === 0 && <li className="p-3 text-sm text-ink-400">{L('No issues yet.', 'এখনো কোনো সংখ্যা নেই।')}</li>}
          {(data || []).map((i) => (
            <li key={i.id} className="flex items-center gap-3 px-3 py-2.5 text-sm">
              <div className="min-w-0 flex-1"><div className="truncate font-medium">{pick(i, 'title')}</div><div className="text-xs text-ink-400">{date(i.published_at)} · {num(i.article_count)} {L('articles', 'লেখা')}</div></div>
              <button type="button" className="rounded-lg p-1.5 text-ink-400 hover:bg-paper-100 hover:text-ink" onClick={() => setDraft(i)} aria-label="Edit issue"><Pencil size={14} /></button>
              <button type="button" className="rounded-lg p-1.5 text-ink-400 hover:bg-sun-50 hover:text-sun" onClick={() => setConfirm(i)} aria-label="Delete issue"><Trash2 size={14} /></button>
            </li>
          ))}
        </ul>
      )}
      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)} onConfirm={() => remove(confirm)} title={L('Delete issue?', 'সংখ্যা মুছবেন?')}
        body={confirm && L(`This also deletes its ${confirm.article_count} articles.`, `এর ${num(confirm.article_count)}টি লেখাও মুছে যাবে।`)} />
    </div>
  );
}

function Editor({ open, mag, categories, onClose, onSaved }) {
  const { L, pick, taka } = useLang();
  const toast = useToast();
  const [form, setForm] = useState(BLANK);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState('details');
  useEffect(() => {
    if (!open) return;
    setTab('details');
    setForm(mag ? { ...BLANK, ...mag, price: mag.price_poisha / 100, category_id: mag.category_id || '' } : { ...BLANK, category_id: categories?.[0]?.id || '' });
  }, [open, mag?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const close = () => {
    if (form._uploaded) api.del('/api/uploads', { url: form._uploaded }).catch(() => {}); // discard unsaved upload
    onClose();
  };

  const save = async (e) => {
    e?.preventDefault();
    if (!form.title_en.trim() && !form.title_bn.trim()) { toast(L('Add a title', 'শিরোনাম দিন'), { type: 'error' }); return; }
    setBusy(true);
    const payload = {
      title_en: form.title_en.trim(), title_bn: form.title_bn.trim(), tagline_en: form.tagline_en, tagline_bn: form.tagline_bn,
      description_en: form.description_en, description_bn: form.description_bn, category_id: form.category_id ? Number(form.category_id) : null,
      language: form.language, frequency: form.frequency, price_poisha: Math.round(Number(form.price || 0) * 100), status: form.status,
      publisher: form.publisher, cover_color: form.cover_color, cover_accent: form.cover_accent, cover_style: form.cover_style, cover_lang: form.cover_lang,
    };
    if (!mag) Object.assign(payload, { cover_url: form.cover_url, cover_thumb: form.cover_thumb });
    try {
      const saved = mag ? await api.patch(`/api/magazines/${mag.id}`, payload) : await api.post('/api/magazines', payload);
      setForm((f) => ({ ...f, _uploaded: null }));
      onSaved(saved, !mag);
      toast(mag ? L('Publication saved', 'পত্রিকা সংরক্ষিত') : L('Publication created', 'পত্রিকা তৈরি হয়েছে'));
      onClose();
    } catch (err) { toast(err.message, { type: 'error' }); } finally { setBusy(false); }
  };

  const preview = { ...form, slug: form.title_en || 'new', price_poisha: form.price * 100 };
  const tabs = [['details', L('Details', 'বিবরণ')], ['cover', L('Cover', 'প্রচ্ছদ')], ...(mag ? [['issues', L('Issues', 'সংখ্যা')]] : [])];

  return (
    <Modal open={open} onClose={close} wide title={mag ? L('Edit publication', 'পত্রিকা সম্পাদনা') : L('New publication', 'নতুন পত্রিকা')}
      footer={<>
        {mag && <Link to={`/m/${mag.slug}`} className="btn-ghost mr-auto"><ExternalLink size={14} />{L('View', 'দেখুন')}</Link>}
        <button className="btn-ghost" onClick={close}>{L('Cancel', 'বাতিল')}</button>
        <button className="btn-primary" onClick={save} disabled={busy}>{busy && <Spinner size={14} />}{mag ? L('Save changes', 'সংরক্ষণ') : L('Create', 'তৈরি করুন')}</button>
      </>}>
      <div className="grid gap-6 md:grid-cols-[1fr_200px]">
        <div>
          <div className="mb-5 flex gap-1 border-b border-paper-200">
            {tabs.map(([v, label]) => <button key={v} type="button" onClick={() => setTab(v)} className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium ${tab === v ? 'border-delta text-ink' : 'border-transparent text-ink-400 hover:text-ink'}`}>{label}</button>)}
          </div>
          {tab === 'details' && (
            <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
              <div><label className="label">{L('Title (English)', 'শিরোনাম (ইংরেজি)')}</label><input className="input" value={form.title_en} onChange={set('title_en')} /></div>
              <div><label className="label">{L('Title (Bengali)', 'শিরোনাম (বাংলা)')}</label><input className="input" lang="bn" value={form.title_bn} onChange={set('title_bn')} /></div>
              <div><label className="label">{L('Tagline (English)', 'ট্যাগলাইন (ইংরেজি)')}</label><input className="input" value={form.tagline_en} onChange={set('tagline_en')} /></div>
              <div><label className="label">{L('Tagline (Bengali)', 'ট্যাগলাইন (বাংলা)')}</label><input className="input" lang="bn" value={form.tagline_bn} onChange={set('tagline_bn')} /></div>
              <div className="sm:col-span-2"><label className="label">{L('Description (English)', 'বিবরণ (ইংরেজি)')}</label><textarea className="input min-h-[70px]" value={form.description_en} onChange={set('description_en')} /></div>
              <div className="sm:col-span-2"><label className="label">{L('Description (Bengali)', 'বিবরণ (বাংলা)')}</label><textarea className="input min-h-[70px]" lang="bn" value={form.description_bn} onChange={set('description_bn')} /></div>
              <div><label className="label">{L('Category', 'বিভাগ')}</label>
                <select className="input" value={form.category_id} onChange={set('category_id')}>{(categories || []).map((c) => <option key={c.id} value={c.id}>{pick(c, 'name')}</option>)}</select></div>
              <div><label className="label">{L('Language', 'ভাষা')}</label>
                <select className="input" value={form.language} onChange={set('language')}>
                  <option value="bn">{L('Bengali', 'বাংলা')}</option><option value="en">{L('English', 'ইংরেজি')}</option><option value="both">{L('Bilingual', 'দ্বিভাষিক')}</option>
                </select></div>
              <div><label className="label">{L('Monthly price (৳)', 'মাসিক দাম (৳)')}</label>
                <input className="input" type="number" min="0" max="10000" step="10" value={form.price} onChange={set('price')} />
                <div className="mt-1 text-xs text-ink-400">{L('Yearly', 'বার্ষিক')}: {taka(form.price * 1000)} · {L('typical BD range ৳250–৳450', 'সাধারণ দাম ৳২৫০–৳৪৫০')}</div></div>
              <div><label className="label">{L('Frequency', 'প্রকাশের হার')}</label>
                <select className="input" value={form.frequency} onChange={set('frequency')}>
                  <option value="weekly">{L('Weekly', 'সাপ্তাহিক')}</option><option value="monthly">{L('Monthly', 'মাসিক')}</option><option value="quarterly">{L('Quarterly', 'ত্রৈমাসিক')}</option>
                </select></div>
              <div><label className="label">{L('Publisher', 'প্রকাশক')}</label><input className="input" value={form.publisher} onChange={set('publisher')} /></div>
              <div><label className="label">{L('Status', 'অবস্থা')}</label>
                <div className="grid grid-cols-2 gap-2">
                  {[['draft', L('Draft', 'খসড়া')], ['published', L('Published', 'প্রকাশিত')]].map(([v, label]) => (
                    <button type="button" key={v} onClick={() => setForm((f) => ({ ...f, status: v }))} className={`rounded-xl border px-3 py-2.5 text-sm font-medium ${form.status === v ? 'border-delta bg-delta-50 text-delta-700' : 'border-paper-300 text-ink-500'}`}>{label}</button>
                  ))}
                </div></div>
              <button type="submit" className="hidden" />
            </form>
          )}
          {tab === 'cover' && (
            <div className="space-y-5">
              <CoverUploader form={form} setForm={setForm} magId={mag?.id} onSaved={(patch) => onSaved({ ...mag, ...patch }, false)} />
              <div>
                <span className="label">{L('Generated cover (used when there is no photo)', 'তৈরি করা প্রচ্ছদ (ছবি না থাকলে)')}</span>
                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 text-sm"><input type="color" value={form.cover_color} onChange={set('cover_color')} className="h-9 w-12 cursor-pointer rounded border border-paper-300" />{L('Base', 'মূল রং')}</label>
                  <label className="flex items-center gap-2 text-sm"><input type="color" value={form.cover_accent} onChange={set('cover_accent')} className="h-9 w-12 cursor-pointer rounded border border-paper-300" />{L('Accent', 'সহায়ক রং')}</label>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {STYLES.map((s) => (
                    <button type="button" key={s} onClick={() => setForm((f) => ({ ...f, cover_style: s }))} className={`w-14 overflow-hidden rounded-md border-2 ${form.cover_style === s ? 'border-delta' : 'border-transparent'}`} aria-label={s}>
                      <Cover mag={{ ...preview, cover_url: null, cover_thumb: null, cover_style: s, title_en: ' ', title_bn: ' ' }} rounded="rounded-none" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {tab === 'issues' && mag && <IssuesManager magId={mag.id} />}
        </div>
        <div className="order-first md:order-none">
          <div className="label">{L('Live preview', 'লাইভ প্রিভিউ')}</div>
          <div className="mx-auto max-w-[180px] md:max-w-none"><Cover mag={preview} full label={L('PREVIEW', 'প্রিভিউ')} /></div>
          <div className="mt-3 text-center text-sm font-semibold">{pick(preview, 'title') || L('Untitled', 'শিরোনামহীন')}</div>
          <div className="mt-1 flex justify-center gap-1.5"><LangBadge code={form.language} /><span className="text-xs text-ink-500">{taka(form.price * 100)}{L('/mo', '/মাস')}</span></div>
        </div>
      </div>
    </Modal>
  );
}

export default function Publications() {
  const { L, pick, num, taka, ago } = useLang();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [status, setStatus] = useState('all');
  const [q, setQ] = useState('');
  const { data: categories } = useFetch('/api/categories');
  const { data, setData, loading, error, reload } = useFetch(`/api/magazines${qs({ scope: 'studio', status, sort: 'updated' })}`);
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const editId = params.get('edit');
  const isNew = params.get('new') === '1';
  const editing = useMemo(() => (editId && data ? data.find((m) => String(m.id) === editId) : null), [editId, data]);
  const closeEditor = () => setParams({}, { replace: true });

  const list = (data || []).filter((m) => !q || `${m.title_en} ${m.title_bn} ${m.publisher}`.toLowerCase().includes(q.toLowerCase()));

  const changeStatus = async (m, next) => {
    setData((l) => l.map((x) => (x.id === m.id ? { ...x, status: next } : x)));
    try {
      await api.patch(`/api/magazines/${m.id}`, { status: next });
      toast(next === 'published' ? L(`${m.title_en} is live`, `${m.title_bn || m.title_en} প্রকাশিত হয়েছে`) : L('Moved to drafts', 'খসড়ায় নেওয়া হয়েছে'));
    } catch (e) { setData((l) => l.map((x) => (x.id === m.id ? { ...x, status: m.status } : x))); toast(e.message, { type: 'error' }); }
  };

  const onSaved = (saved, created) => setData((l) => (created ? [saved, ...l] : l.map((x) => (x.id === saved.id ? { ...x, ...saved } : x))));

  const doDelete = async () => {
    const m = confirm;
    setDeleting(true);
    try {
      await api.del(`/api/magazines/${m.id}`);
      setData((l) => l.filter((x) => x.id !== m.id));
      toast(L('Publication deleted', 'পত্রিকা মুছে ফেলা হয়েছে'));
      setConfirm(null);
    } catch (e) { toast(e.message, { type: 'error' }); } finally { setDeleting(false); }
  };

  return (
    <div>
      <PageHeader eyebrow={L('Publishing studio', 'প্রকাশনা স্টুডিও')} title={L('Publications', 'পত্রিকা')}
        subtitle={L('Create titles, upload covers, manage issues and control what readers can see.', 'পত্রিকা তৈরি, প্রচ্ছদ আপলোড, সংখ্যা পরিচালনা ও পাঠকদের দৃশ্যমানতা নিয়ন্ত্রণ।')}
        actions={<button className="btn-primary" onClick={() => setParams({ new: '1' })}><Plus size={15} />{L('New publication', 'নতুন পত্রিকা')}</button>} />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-full border border-paper-300 bg-white p-0.5 text-xs font-semibold">
          {[['all', L('All', 'সব')], ['published', L('Published', 'প্রকাশিত')], ['draft', L('Drafts', 'খসড়া')]].map(([v, label]) => (
            <button key={v} onClick={() => setStatus(v)} className={`rounded-full px-3 py-1.5 ${status === v ? 'bg-ink text-paper' : 'text-ink-500'}`}>{label}</button>
          ))}
        </div>
        <div className="relative ml-auto w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
          <input className="input rounded-full py-1.5 pl-9" placeholder={L('Filter publications', 'পত্রিকা খুঁজুন')} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      {error ? <ErrorState error={error} onRetry={reload} /> : loading && !data ? <RowsSkeleton /> : list.length === 0 ? (
        <EmptyState icon={BookOpen} title={L('No publications here', 'এখানে কোনো পত্রিকা নেই')} action={<button className="btn-primary" onClick={() => setParams({ new: '1' })}><Plus size={15} />{L('Create one', 'একটি তৈরি করুন')}</button>} />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="hidden border-b border-paper-200 bg-paper-100/60 text-left text-xs uppercase tracking-wider text-ink-400 md:table-header-group">
              <tr><th className="px-4 py-3 font-semibold">{L('Publication', 'পত্রিকা')}</th><th className="px-4 py-3 font-semibold">{L('Status', 'অবস্থা')}</th>
                <th className="px-4 py-3 font-semibold">{L('Price', 'দাম')}</th><th className="px-4 py-3 font-semibold">{L('Content', 'কনটেন্ট')}</th>
                <th className="px-4 py-3 font-semibold">{L('Subscribers', 'সাবস্ক্রাইবার')}</th><th className="px-4 py-3" /></tr>
            </thead>
            <tbody className="divide-y divide-paper-200">
              {list.map((m) => (
                <tr key={m.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4 md:table-row md:p-0">
                  <td className="w-full md:w-auto md:px-4 md:py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 shrink-0"><Cover mag={m} masthead={false} rounded="rounded" /></div>
                      <div className="min-w-0">
                        <button onClick={() => setParams({ edit: String(m.id) })} className="block truncate text-left font-semibold hover:text-delta">{pick(m, 'title')}</button>
                        <div className="flex items-center gap-1.5 text-xs text-ink-400"><LangBadge code={m.language} /><span style={{ color: m.category_color }}>{pick(m, 'category')}</span><span className="hidden lg:inline">· {L('edited', 'সম্পাদনা')} {ago(m.updated_at)}</span></div>
                      </div>
                    </div>
                  </td>
                  <td className="md:px-4 md:py-3">
                    <select value={m.status} onChange={(e) => changeStatus(m, e.target.value)} aria-label={L('Status', 'অবস্থা')}
                      className={`rounded-full border-0 py-1 pl-3 pr-7 text-xs font-semibold focus:ring-2 focus:ring-delta/20 ${m.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-paper-200 text-ink-500'}`}>
                      <option value="published">{L('Published', 'প্রকাশিত')}</option><option value="draft">{L('Draft', 'খসড়া')}</option>
                    </select>
                  </td>
                  <td className="font-medium md:px-4 md:py-3">{taka(m.price_poisha)}<span className="text-xs font-normal text-ink-400">{L('/mo', '/মাস')}</span></td>
                  <td className="text-ink-500 md:px-4 md:py-3">{num(m.issue_count)} {L('issues', 'সংখ্যা')} · {num(m.article_total)} {L('articles', 'লেখা')}</td>
                  <td className="text-ink-500 md:px-4 md:py-3">{num(m.subscriber_count)}</td>
                  <td className="ml-auto md:px-4 md:py-3">
                    <div className="flex justify-end gap-1">
                      <button className="rounded-lg p-2 text-ink-400 hover:bg-paper-100 hover:text-ink" onClick={() => setParams({ edit: String(m.id) })} aria-label="Edit"><Pencil size={15} /></button>
                      <button className="rounded-lg p-2 text-ink-400 hover:bg-sun-50 hover:text-sun" onClick={() => setConfirm(m)} aria-label="Delete"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Editor open={isNew || !!editing} mag={editing} categories={categories} onClose={closeEditor} onSaved={onSaved} />
      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)} onConfirm={doDelete} busy={deleting} title={L('Delete publication?', 'পত্রিকা মুছবেন?')}
        body={confirm && (
          <div className="space-y-2">
            <p>{L(`“${confirm.title_en}” will be permanently deleted.`, `“${confirm.title_bn || confirm.title_en}” স্থায়ীভাবে মুছে যাবে।`)}</p>
            <p className="rounded-xl bg-sun-50 p-3 text-sun-600">{L(`This also deletes ${confirm.issue_count} issues and ${confirm.article_total} articles, and removes it from readers' libraries, bookmarks and ${confirm.subscriber_count} active subscriptions.`,
              `এর ${num(confirm.issue_count)}টি সংখ্যা ও ${num(confirm.article_total)}টি লেখাও মুছে যাবে, আর পাঠকদের লাইব্রেরি, বুকমার্ক ও ${num(confirm.subscriber_count)}টি সক্রিয় সাবস্ক্রিপশন থেকে সরে যাবে।`)}</p>
          </div>
        )} />
    </div>
  );
}
