import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search, FileText, ExternalLink } from 'lucide-react';
import { useLang } from '../../lib/i18n.jsx';
import { useToast } from '../../lib/toast.jsx';
import { useAuth } from '../../lib/auth.jsx';
import { useFetch } from '../../lib/useFetch.js';
import { api, qs } from '../../lib/api.js';
import { ConfirmDialog, Cover, EmptyState, ErrorState, Modal, PageHeader, RowsSkeleton, Spinner } from '../../components/ui.jsx';

const words = (s) => String(s || '').split(/\s+/).filter(Boolean).length;
const BLANK = { magazine_id: '', issue_id: '', title_en: '', title_bn: '', dek_en: '', dek_bn: '', author: '', body_en: '', body_bn: '', status: 'draft' };

function ArticleEditor({ open, articleId, presetMagazine, magazines, onClose, onSaved }) {
  const { L, pick, num } = useLang();
  const { user } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState(BLANK);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [bodyLang, setBodyLang] = useState('bn');
  const { data: issues } = useFetch(form.magazine_id ? `/api/magazines/${form.magazine_id}/issues` : null);

  useEffect(() => {
    if (!open) return;
    if (!articleId) {
      const mag = presetMagazine || magazines?.[0]?.id || '';
      setForm({ ...BLANK, magazine_id: mag, author: user?.name || '' });
      setBodyLang('bn');
      return;
    }
    setLoading(true);
    api.get(`/api/articles/${articleId}?studio=1`)
      .then((a) => { setForm({ ...BLANK, ...a }); setBodyLang(a.body_bn ? 'bn' : 'en'); })
      .catch((e) => { toast(e.message, { type: 'error' }); onClose(); })
      .finally(() => setLoading(false));
  }, [open, articleId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (open && !articleId && !form.magazine_id && magazines?.length) setForm((f) => ({ ...f, magazine_id: magazines[0].id }));
  }, [open, articleId, magazines, form.magazine_id]);

  // Default to the newest issue when the publication changes.
  useEffect(() => {
    if (!issues) return;
    setForm((f) => (issues.some((i) => i.id === Number(f.issue_id)) ? f : { ...f, issue_id: issues[0]?.id || '' }));
  }, [issues]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const wc = Math.max(words(form.body_en), words(form.body_bn));

  const save = async (statusOverride) => {
    if (!form.issue_id) { toast(L('Choose an issue (add one in Publications first)', 'একটি সংখ্যা বাছুন (আগে পত্রিকায় সংখ্যা যোগ করুন)'), { type: 'error' }); return; }
    if (!form.title_en.trim() && !form.title_bn.trim()) { toast(L('Add a title', 'শিরোনাম দিন'), { type: 'error' }); return; }
    setBusy(true);
    const payload = { issue_id: Number(form.issue_id), title_en: form.title_en, title_bn: form.title_bn, dek_en: form.dek_en, dek_bn: form.dek_bn,
      author: form.author, body_en: form.body_en, body_bn: form.body_bn, status: statusOverride || form.status };
    try {
      const saved = articleId ? await api.patch(`/api/articles/${articleId}`, payload) : await api.post('/api/articles', payload);
      onSaved(saved, !articleId);
      toast(payload.status === 'published' ? L('Article published', 'লেখা প্রকাশিত হয়েছে') : L('Draft saved', 'খসড়া সংরক্ষিত'));
      onClose();
    } catch (e) { toast(e.message, { type: 'error' }); } finally { setBusy(false); }
  };

  return (
    <Modal open={open} onClose={onClose} wide title={articleId ? L('Edit article', 'লেখা সম্পাদনা') : L('New article', 'নতুন লেখা')}
      footer={<>
        {articleId && <Link to={`/read/${articleId}`} className="btn-ghost mr-auto"><ExternalLink size={14} />{L('Preview', 'প্রিভিউ')}</Link>}
        <button className="btn-ghost" onClick={onClose}>{L('Cancel', 'বাতিল')}</button>
        <button className="btn-outline" disabled={busy} onClick={() => save('draft')}>{L('Save draft', 'খসড়া সংরক্ষণ')}</button>
        <button className="btn-primary" disabled={busy} onClick={() => save('published')}>{busy && <Spinner size={14} />}{form.status === 'published' && articleId ? L('Update', 'হালনাগাদ') : L('Publish', 'প্রকাশ করুন')}</button>
      </>}>
      {loading ? <div className="flex h-60 items-center justify-center"><Spinner size={22} /></div> : (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div><label className="label">{L('Publication', 'পত্রিকা')}</label>
              <select className="input" value={form.magazine_id} onChange={(e) => setForm((f) => ({ ...f, magazine_id: Number(e.target.value), issue_id: '' }))}>
                {(magazines || []).map((m) => <option key={m.id} value={m.id}>{pick(m, 'title')}{m.status === 'draft' ? ` (${L('draft', 'খসড়া')})` : ''}</option>)}
              </select></div>
            <div><label className="label">{L('Issue', 'সংখ্যা')}</label>
              <select className="input" value={form.issue_id} onChange={set('issue_id')} disabled={!issues}>
                {(issues || []).length === 0 && <option value="">{L('No issues yet', 'কোনো সংখ্যা নেই')}</option>}
                {(issues || []).map((i) => <option key={i.id} value={i.id}>{pick(i, 'title')}</option>)}
              </select></div>
            <div><label className="label">{L('Author', 'লেখক')}</label><input className="input" value={form.author} onChange={set('author')} /></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label">{L('Headline (English)', 'শিরোনাম (ইংরেজি)')}</label><input className="input font-serif text-base" value={form.title_en} onChange={set('title_en')} /></div>
            <div><label className="label">{L('Headline (Bengali)', 'শিরোনাম (বাংলা)')}</label><input className="input font-bnserif text-base" lang="bn" value={form.title_bn} onChange={set('title_bn')} /></div>
            <div><label className="label">{L('Standfirst (English)', 'সারসংক্ষেপ (ইংরেজি)')}</label><input className="input" value={form.dek_en} onChange={set('dek_en')} /></div>
            <div><label className="label">{L('Standfirst (Bengali)', 'সারসংক্ষেপ (বাংলা)')}</label><input className="input" lang="bn" value={form.dek_bn} onChange={set('dek_bn')} /></div>
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <div className="inline-flex rounded-full border border-paper-300 bg-white p-0.5 text-xs font-semibold">
                {[['bn', 'বাংলা', form.body_bn], ['en', 'English', form.body_en]].map(([c, label, body]) => (
                  <button type="button" key={c} onClick={() => setBodyLang(c)} className={`rounded-full px-3 py-1 ${bodyLang === c ? 'bg-delta text-white' : 'text-ink-500'}`}>{label} <span className="opacity-60">{num(words(body))}</span></button>
                ))}
              </div>
              <span className="text-xs text-ink-400">{num(wc)} {L('words', 'শব্দ')} · {num(Math.max(1, Math.ceil(wc / 200)))} {L('min read', 'মিনিটের পড়া')}</span>
            </div>
            <textarea key={bodyLang} lang={bodyLang} className={`input min-h-[280px] leading-relaxed ${bodyLang === 'bn' ? 'font-bnserif' : 'font-serif'}`}
              value={bodyLang === 'bn' ? form.body_bn : form.body_en} onChange={set(bodyLang === 'bn' ? 'body_bn' : 'body_en')}
              placeholder={bodyLang === 'bn' ? 'লেখা এখানে… অনুচ্ছেদের মাঝে একটি ফাঁকা লাইন রাখুন।' : 'Write here… leave a blank line between paragraphs.'} />
          </div>
        </div>
      )}
    </Modal>
  );
}

export default function Articles() {
  const { L, pick, num, ago } = useLang();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || 'all';
  const magFilter = params.get('magazine') || 'all';
  const [q, setQ] = useState('');
  const { data: magazines } = useFetch('/api/magazines?scope=studio&sort=title');
  const { data, setData, loading, error, reload } = useFetch(`/api/articles${qs({ scope: 'studio', status, magazine_id: magFilter })}`);
  const [confirm, setConfirm] = useState(null);

  const setParam = (k, v) => { const n = new URLSearchParams(params); if (!v || v === 'all') n.delete(k); else n.set(k, v); n.delete('edit'); n.delete('new'); setParams(n, { replace: true }); };
  const editId = params.get('edit');
  const isNew = params.get('new') === '1';
  const closeEditor = () => { const n = new URLSearchParams(params); n.delete('edit'); n.delete('new'); setParams(n, { replace: true }); };

  const groups = useMemo(() => {
    const out = [];
    for (const a of data || []) {
      if (q && !`${a.title_en} ${a.title_bn} ${a.author}`.toLowerCase().includes(q.toLowerCase())) continue;
      let g = out.find((x) => x.id === a.magazine_id);
      if (!g) { g = { id: a.magazine_id, mag: a, items: [] }; out.push(g); }
      g.items.push(a);
    }
    return out;
  }, [data, q]);

  const togglePublish = async (a) => {
    const next = a.status === 'published' ? 'draft' : 'published';
    setData((l) => l.map((x) => (x.id === a.id ? { ...x, status: next } : x)));
    try { await api.patch(`/api/articles/${a.id}`, { status: next }); toast(next === 'published' ? L('Published', 'প্রকাশিত') : L('Unpublished', 'অপ্রকাশিত')); }
    catch (e) { setData((l) => l.map((x) => (x.id === a.id ? { ...x, status: a.status } : x))); toast(e.message, { type: 'error' }); }
  };

  const remove = async () => {
    const a = confirm;
    setConfirm(null);
    const snapshot = data;
    setData((l) => l.filter((x) => x.id !== a.id));
    try { await api.del(`/api/articles/${a.id}`); toast(L('Article deleted', 'লেখা মুছে ফেলা হয়েছে')); } catch (e) { setData(snapshot); toast(e.message, { type: 'error' }); }
  };

  const onSaved = (saved, created) => {
    if (created) reload({ silent: true });
    else setData((l) => l.map((x) => (x.id === saved.id ? { ...x, ...saved, body_en: undefined, body_bn: undefined } : x)));
  };

  const total = groups.reduce((s, g) => s + g.items.length, 0);

  return (
    <div>
      <PageHeader eyebrow={L('Publishing studio', 'প্রকাশনা স্টুডিও')} title={L('Articles', 'লেখা')}
        subtitle={L('Write in Bengali, English or both. Drafts stay private until you publish.', 'বাংলা, ইংরেজি বা দুই ভাষাতেই লিখুন। প্রকাশ না করা পর্যন্ত খসড়া গোপন থাকে।')}
        actions={<button className="btn-primary" onClick={() => { const n = new URLSearchParams(params); n.set('new', '1'); setParams(n); }}><Plus size={15} />{L('New article', 'নতুন লেখা')}</button>} />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-full border border-paper-300 bg-white p-0.5 text-xs font-semibold">
          {[['all', L('All', 'সব')], ['published', L('Published', 'প্রকাশিত')], ['draft', L('Drafts', 'খসড়া')]].map(([v, label]) => (
            <button key={v} onClick={() => setParam('status', v)} className={`rounded-full px-3 py-1.5 ${status === v ? 'bg-ink text-paper' : 'text-ink-500'}`}>{label}</button>
          ))}
        </div>
        <select className="rounded-full border border-paper-300 bg-white px-3 py-1.5 text-xs font-semibold text-ink-600" value={magFilter} onChange={(e) => setParam('magazine', e.target.value)} aria-label={L('Publication', 'পত্রিকা')}>
          <option value="all">{L('All publications', 'সব পত্রিকা')}</option>
          {(magazines || []).map((m) => <option key={m.id} value={m.id}>{pick(m, 'title')}</option>)}
        </select>
        <div className="relative ml-auto w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
          <input className="input rounded-full py-1.5 pl-9" placeholder={L('Filter by title or author', 'শিরোনাম বা লেখক')} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      {error ? <ErrorState error={error} onRetry={reload} /> : loading && !data ? <RowsSkeleton n={6} /> : total === 0 ? (
        <EmptyState icon={FileText} title={L('No articles match', 'মিলে যাওয়া কোনো লেখা নেই')} />
      ) : (
        <div className="space-y-6">
          <div className="text-sm text-ink-400">{num(total)} {L('articles', 'টি লেখা')}</div>
          {groups.map((g) => (
            <section key={g.id} className="card overflow-hidden">
              <div className="flex items-center gap-3 border-b border-paper-200 bg-paper-100/50 px-4 py-3">
                <div className="w-7"><Cover mag={g.mag} masthead={false} rounded="rounded-sm" /></div>
                <span className="font-serif font-semibold">{pick(g.mag, 'magazine_title')}</span>
                <span className="text-xs text-ink-400">{num(g.items.length)}</span>
              </div>
              <ul className="divide-y divide-paper-200">
                {g.items.map((a) => (
                  <li key={a.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
                    <div className="min-w-0 flex-1">
                      <button onClick={() => { const n = new URLSearchParams(params); n.set('edit', a.id); setParams(n); }} className="line-clamp-1 text-left font-medium hover:text-delta">{pick(a, 'title') || L('Untitled', 'শিরোনামহীন')}</button>
                      <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-ink-400">
                        <span>{pick(a, 'issue_title').split(' · ').slice(0, 2).join(' · ')}</span><span>{a.author}</span>
                        <span>{num(a.word_count)} {L('words', 'শব্দ')}</span><span>{num(a.reads)} {L('reads', 'পাঠ')}</span><span>{ago(a.updated_at)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => togglePublish(a)} role="switch" aria-checked={a.status === 'published'}
                        className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold transition ${a.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-paper-200 text-ink-500'}`}>
                        <span className={`relative h-3.5 w-6 rounded-full transition ${a.status === 'published' ? 'bg-emerald-500' : 'bg-ink-300'}`}>
                          <span className={`absolute top-0.5 h-2.5 w-2.5 rounded-full bg-white transition-all ${a.status === 'published' ? 'left-3' : 'left-0.5'}`} />
                        </span>
                        {a.status === 'published' ? L('Published', 'প্রকাশিত') : L('Draft', 'খসড়া')}
                      </button>
                      <button className="rounded-lg p-2 text-ink-400 hover:bg-paper-100 hover:text-ink" onClick={() => { const n = new URLSearchParams(params); n.set('edit', a.id); setParams(n); }} aria-label="Edit"><Pencil size={15} /></button>
                      <button className="rounded-lg p-2 text-ink-400 hover:bg-sun-50 hover:text-sun" onClick={() => setConfirm(a)} aria-label="Delete"><Trash2 size={15} /></button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <ArticleEditor open={isNew || !!editId} articleId={editId ? Number(editId) : null} presetMagazine={magFilter !== 'all' ? Number(magFilter) : null}
        magazines={magazines} onClose={closeEditor} onSaved={onSaved} />
      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)} onConfirm={remove} title={L('Delete article?', 'লেখা মুছবেন?')}
        body={confirm && L(`“${confirm.title_en || confirm.title_bn}” and its reader bookmarks and progress will be removed.`, `“${confirm.title_bn || confirm.title_en}” এবং এর বুকমার্ক ও পাঠের অগ্রগতি মুছে যাবে।`)} />
    </div>
  );
}
