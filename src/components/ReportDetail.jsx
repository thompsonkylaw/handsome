import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, ChevronDown, ChevronRight, Save, Pencil, X, Plus, Trash2 } from 'lucide-react';
import { getPersonAnalysis, SummaryList, formatCurrency, API_BASE_URL } from '../utils';
import NumberPad from './NumberPad';
import { wpBtn, wpInput, wpSelect } from '../wpStyles';

/* ── tiny helpers ────────────────────────────────────── */
const LIMITS = {
  single: { asset: 406000, income: 10770 },
  couple: { asset: 616000, income: 16440 },
};

const recalc = (sd) => {
  const married = sd.isMarried;
  const p1a = getPersonAnalysis(sd.p1, married);
  const p2a = married ? getPersonAnalysis(sd.p2, married) : { totalAsset: 0, totalIncome: 0 };
  const totalAsset = p1a.totalAsset + p2a.totalAsset;
  const totalIncome = p1a.totalIncome + p2a.totalIncome;
  const lim = married ? LIMITS.couple : LIMITS.single;
  return { totalAsset, totalIncome, isEligible: totalAsset <= lim.asset && totalIncome <= lim.income };
};

// Helper for formatting numeric inputs with commas while typing
const formatInputDisplay = (val) => {
  if (val === null || val === undefined || val === '') return '';
  const str = String(val);
  const parts = str.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
};

/* ── Expandable section wrapper ─────────────────────── */
const Section = ({ title, badge, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-100 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        style={wpBtn({ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1rem', backgroundColor:'#f8fafc' })}
        className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <span className="font-bold text-slate-700 flex items-center gap-2">
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          {title}
        </span>
        {badge !== undefined && (
          <span className="text-xs font-bold text-slate-400">{badge}</span>
        )}
      </button>
      {open && <div className="p-4 space-y-3 bg-white">{children}</div>}
    </div>
  );
};

/* ── Editable field row ─────────────────────────────── */
const Field = ({ label, value, onChange, type = 'text', suffix, openNumpad, numpadAnchorRef }) => (
  <div className="flex items-center justify-between gap-4">
    <label className="text-sm font-bold text-slate-500 whitespace-nowrap">{label}</label>
    <div className="flex items-center gap-1">
      <input
        type={type === 'number' || openNumpad ? 'text' : type}
        inputMode={type === 'number' && openNumpad ? 'none' : undefined}
        readOnly={type === 'number' && !!openNumpad}
        value={type === 'number' ? formatInputDisplay(value) : (value ?? '')}
        onChange={(e) => {
          const val = e.target.value;
          if (type === 'number') {
            const clean = val.replace(/,/g, '');
            if (clean === '' || clean === '.') onChange(clean);
            else {
               const num = parseFloat(clean);
               onChange(isNaN(num) ? clean : num);
            }
          } else {
            onChange(val);
          }
        }}
        onClick={type === 'number' && openNumpad ? (e) => { if (numpadAnchorRef) numpadAnchorRef.current = e.target; openNumpad(value, onChange, { allowDecimal: type === 'number' }); } : undefined}
        style={wpInput({ width:'12rem', paddingLeft:'0.75rem', paddingRight:'0.75rem', paddingTop:'0.375rem', paddingBottom:'0.375rem', border:'1px solid #e2e8f0', borderRadius:'0.75rem', fontSize:'0.875rem', textAlign:'right', backgroundColor:'#ffffff', cursor: type === 'number' && openNumpad ? 'pointer' : 'auto' })}
        className={`w-48 px-3 py-1.5 border border-slate-200 rounded-xl text-sm text-right focus:border-indigo-400 outline-none transition-colors ${type === 'number' && openNumpad ? 'cursor-pointer' : ''}`}
      />
      {suffix && <span className="text-xs text-slate-400">{suffix}</span>}
    </div>
  </div>
);

/* ── Toggle row ─────────────────────────────────────── */
const Toggle = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between gap-4">
    <span className="text-sm font-bold text-slate-500">{label}</span>
    <button
      onClick={() => onChange(!checked)}
      style={wpBtn({ position:'relative', width:'3rem', height:'1.5rem', borderRadius:'9999px', backgroundColor: checked ? '#3b82f6' : '#e2e8f0' })}
    >
      <div style={{ position:'absolute', width:'1rem', height:'1rem', backgroundColor:'white', borderRadius:'9999px', top:'0.25rem', left: checked ? '1.75rem' : '0.25rem', boxShadow:'0 1px 3px rgba(0,0,0,0.1)', transition:'all 0.2s' }} />
    </button>
  </div>
);

/* ── Asset items editor ─────────────────────────────── */
const AssetsEditor = ({ assets, onChange, openNumpad, numpadAnchorRef }) => (
  <>
    {Object.entries(assets).map(([key, item]) => (
      <div key={key} className="space-y-1">
        <Toggle
          label={item.label}
          checked={item.enabled}
          onChange={v => onChange({ ...assets, [key]: { ...item, enabled: v } })}
        />
        {item.enabled && (
          <Field
            label="金額"
            value={item.value}
            type="number"
            onChange={v => onChange({ ...assets, [key]: { ...item, value: v } })}
            openNumpad={openNumpad}
            numpadAnchorRef={numpadAnchorRef}
          />
        )}
      </div>
    ))}
  </>
);

/* ── Generic list editor (properties / mpf / insurance) */
const ListEditor = ({ items, onChange, typeOptions, fields, openNumpad, numpadAnchorRef }) => {
  const add = () => onChange([...items, { id: Date.now(), type: typeOptions[0], value: 0, enabled: true, status: '保留中' }]);
  const remove = (idx) => onChange(items.filter((_, i) => i !== idx));
  const update = (idx, patch) => onChange(items.map((it, i) => i === idx ? { ...it, ...patch } : it));

  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={item.id || idx} className="flex flex-wrap items-center gap-2 bg-slate-50 p-3 rounded-xl">
          <select
            value={item.type}
            onChange={e => update(idx, { type: e.target.value })}
            style={wpSelect({ paddingLeft:'0.5rem', paddingRight:'0.5rem', paddingTop:'0.25rem', paddingBottom:'0.25rem', border:'1px solid #e2e8f0', borderRadius:'0.5rem', fontSize:'0.875rem', flex:1, minWidth:'120px', backgroundColor:'#ffffff' })}
            className="px-2 py-1 border border-slate-200 rounded-lg text-sm flex-1 min-w-[120px]"
          >
            {typeOptions.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          {fields.includes('status') && (
            <select
              value={item.status || '保留中'}
              onChange={e => update(idx, { status: e.target.value })}
              style={wpSelect({ paddingLeft:'0.5rem', paddingRight:'0.5rem', paddingTop:'0.25rem', paddingBottom:'0.25rem', border:'1px solid #e2e8f0', borderRadius:'0.5rem', fontSize:'0.875rem', backgroundColor:'#ffffff' })}
              className="px-2 py-1 border border-slate-200 rounded-lg text-sm"
            >
              <option value="保留中">保留中</option>
              <option value="已提取">已提取</option>
            </select>
          )}
          <input
            type="text"
            inputMode={openNumpad ? 'none' : undefined}
            readOnly={!!openNumpad}
            value={formatInputDisplay(item.value)}
            onChange={e => {
                const val = e.target.value;
                const clean = val.replace(/,/g, '');
                if (clean === '' || clean === '.') update(idx, { value: clean });
                else {
                    const num = parseFloat(clean);
                    update(idx, { value: isNaN(num) ? clean : num });
                }
            }}
            onClick={openNumpad ? (e) => { if (numpadAnchorRef) numpadAnchorRef.current = e.target; openNumpad(item.value, (v) => update(idx, { value: parseFloat(v) || 0 })); } : undefined}
            style={wpInput({ width:'8rem', paddingLeft:'0.5rem', paddingRight:'0.5rem', paddingTop:'0.25rem', paddingBottom:'0.25rem', border:'1px solid #e2e8f0', borderRadius:'0.5rem', fontSize:'0.875rem', textAlign:'right', backgroundColor:'#ffffff', cursor: openNumpad ? 'pointer' : 'auto' })}
            className={`w-32 px-2 py-1 border border-slate-200 rounded-lg text-sm text-right ${openNumpad ? 'cursor-pointer' : ''}`}
          />
          <button onClick={() => remove(idx)} style={wpBtn({ color:'#fb7185', padding:'0.25rem' })} className="text-rose-400 hover:text-rose-600 p-1"><Trash2 size={14} /></button>
        </div>
      ))}
      <button onClick={add} style={wpBtn({ display:'flex', alignItems:'center', gap:'0.25rem', fontSize:'0.75rem', fontWeight:'700', color:'#3b82f6' })} className="flex items-center gap-1 text-xs font-bold text-blue-500 hover:text-blue-700">
        <Plus size={14} /> 新增項目
      </button>
    </div>
  );
};

/* ── Income editor ──────────────────────────────────── */
const IncomeEditor = ({ income, onChange, openNumpad, numpadAnchorRef }) => (
  <>
    {Object.entries(income).map(([key, item]) => (
      <div key={key} className="space-y-1">
        <Toggle
          label={item.label}
          checked={item.enabled}
          onChange={v => onChange({ ...income, [key]: { ...item, enabled: v } })}
        />
        {item.enabled && (
          <Field
            label="每月金額"
            value={item.value}
            type="number"
            onChange={v => onChange({ ...income, [key]: { ...item, value: v } })}
            openNumpad={openNumpad}
            numpadAnchorRef={numpadAnchorRef}
          />
        )}
      </div>
    ))}
  </>
);

/* ── Person editor block (all sections for one person) */
const PersonEditor = ({ person, onChange, label, openNumpad, numpadAnchorRef }) => {
  const set = (patch) => onChange({ ...person, ...patch });

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-6 bg-blue-600 rounded-full" />
        <span className="text-lg font-black text-slate-800">{label}</span>
      </div>

      {/* Basic info */}
      <Section title="個人資料" defaultOpen={true}>
        <Field label="姓名" value={person.name} onChange={v => set({ name: v })} />
        <Field label="年齡" value={person.age} type="number" onChange={v => set({ age: v })} openNumpad={openNumpad} numpadAnchorRef={numpadAnchorRef} />
        {person.phone !== undefined && (
          <Field label="電話" value={person.phone} onChange={v => set({ phone: v })} />
        )}
      </Section>

      {/* Assets */}
      <Section title="資產" badge={Object.values(person.assets).filter(a => a.enabled).length + ' 項'}>
        <AssetsEditor assets={person.assets} onChange={a => set({ assets: a })} openNumpad={openNumpad} numpadAnchorRef={numpadAnchorRef} />
      </Section>

      {/* Properties */}
      <Section title="物業">
        <Toggle label="啟用物業" checked={person.propertyEnabled} onChange={v => set({ propertyEnabled: v })} />
        {person.propertyEnabled && (
          <ListEditor
            items={person.properties}
            onChange={v => set({ properties: v })}
            typeOptions={['自住物業', '非自住物業']}
            fields={[]}
            openNumpad={openNumpad}
            numpadAnchorRef={numpadAnchorRef}
          />
        )}
      </Section>

      {/* MPF */}
      <Section title="強積金 (MPF)">
        <Toggle label="啟用強積金" checked={person.mpfEnabled} onChange={v => set({ mpfEnabled: v })} />
        {person.mpfEnabled && (
          <ListEditor
            items={person.mpfItems}
            onChange={v => set({ mpfItems: v })}
            typeOptions={['強制性供款', '自願性供款', '可扣稅自願性供款', '公積金']}
            fields={['status']}
            openNumpad={openNumpad}
            numpadAnchorRef={numpadAnchorRef}
          />
        )}
      </Section>

      {/* Insurance */}
      <Section title="保險">
        <Toggle label="啟用保險" checked={person.insuranceEnabled} onChange={v => set({ insuranceEnabled: v })} />
        {person.insuranceEnabled && (
          <ListEditor
            items={person.insurancePolicies}
            onChange={v => set({ insurancePolicies: v })}
            typeOptions={['儲蓄', '危疾', '人壽', '醫療', '意外', '年金']}
            fields={[]}
            openNumpad={openNumpad}
            numpadAnchorRef={numpadAnchorRef}
          />
        )}
      </Section>

      {/* Income */}
      <Section title="入息" badge={Object.values(person.income).filter(i => i.enabled).length + ' 項'}>
        <IncomeEditor income={person.income} onChange={inc => set({ income: inc })} openNumpad={openNumpad} numpadAnchorRef={numpadAnchorRef} />
      </Section>
    </div>
  );
};

/* ══════════════════════════════════════════════════════ */
const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);      // editable copy of submission_data
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // NumberPad popup state
  const [numpad, setNumpad] = useState({ show: false, value: '', allowDecimal: true, fresh: false });
  const numpadCallbackRef = useRef(null);
  const numpadAnchorRef = useRef(null);

  const focusAndSelectAll = (element) => {
    const control = element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement
      ? element
      : element?.querySelector?.('input, textarea');
    if (!control) return;

    window.requestAnimationFrame(() => {
      try {
        control.focus();
        if (typeof control.select === 'function') control.select();
        const len = String(control.value ?? '').length;
        if (typeof control.setSelectionRange === 'function') control.setSelectionRange(0, len);
      } catch {
        // ignore
      }
    });
  };

  const openNumpad = (currentValue, callback, options = {}) => {
    const { allowDecimal = true } = options;
    numpadCallbackRef.current = callback;
    focusAndSelectAll(numpadAnchorRef.current);
    setNumpad({ show: true, value: currentValue ? String(currentValue) : '', allowDecimal, fresh: true });
  };

  const handleNumpadInput = (key) => setNumpad(prev => {
    if (key === '.' && prev.allowDecimal === false) return prev;
    if (!prev.fresh && key === '.' && prev.value.includes('.')) return prev;

    if (prev.fresh) {
      return { ...prev, value: key === '.' ? '0.' : key, fresh: false };
    }

    return { ...prev, value: prev.value + key, fresh: false };
  });
  const handleNumpadDelete = () => setNumpad(prev => ({ ...prev, value: prev.value.slice(0, -1), fresh: false }));
  const handleNumpadClear = () => setNumpad(prev => ({ ...prev, value: '', fresh: false }));
  const handleNumpadConfirm = () => {
    numpadCallbackRef.current = null;
    numpadAnchorRef.current = null;
    setNumpad({ show: false, value: '', allowDecimal: true, fresh: false });
  };

  // Allow physical keyboard input while the numpad popup is open
  useEffect(() => {
    if (!numpad.show) return;

    const onKeyDown = (e) => {
      if (e.defaultPrevented) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const key = e.key;

      // Close
      if (key === 'Enter' || key === 'Escape') {
        e.preventDefault();
        handleNumpadConfirm();
        return;
      }

      // Delete / Clear
      if (key === 'Backspace') {
        e.preventDefault();
        handleNumpadDelete();
        return;
      }
      if (key === 'Delete') {
        e.preventDefault();
        handleNumpadClear();
        return;
      }

      // Numeric input
      if (key >= '0' && key <= '9') {
        e.preventDefault();
        handleNumpadInput(key);
        return;
      }

      // Decimal
      if (key === '.') {
        if (!numpad.allowDecimal) return;
        e.preventDefault();
        handleNumpadInput('.');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [numpad.show, numpad.allowDecimal]);

  // Real-time sync: update the field as the user types on the numpad
  useEffect(() => {
    if (numpad.show && numpadCallbackRef.current) {
      numpadCallbackRef.current(numpad.value === '' ? 0 : (parseFloat(numpad.value) || 0));
    }
  }, [numpad.value, numpad.show]);

  const NumpadPopup = () => {
    if (!numpad.show) return null;
    return (
      <div className="fixed inset-0 z-[100]" onClick={handleNumpadConfirm}>
        <div 
          className="absolute z-[101] flex justify-center"
          style={(() => {
            if (!numpadAnchorRef.current) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
            const rect = numpadAnchorRef.current.getBoundingClientRect();
            return { top: rect.bottom + 8, left: rect.left + rect.width / 2, transform: 'translateX(-50%)' };
          })()}
          onClick={e => e.stopPropagation()}
        >
          <NumberPad
            onInput={handleNumpadInput}
            onDelete={handleNumpadDelete}
            onClear={handleNumpadClear}
            onConfirm={handleNumpadConfirm}
            allowDecimal={numpad.allowDecimal}
          />
        </div>
      </div>
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/assessments/${id}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
          setDraft(JSON.parse(JSON.stringify(json.submission_data)));
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [id]);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2500);
  };

  /* ── Save handler ─────────────────────────────────── */
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const { totalAsset, totalIncome, isEligible } = recalc(draft);
      const body = {
        submission_data: draft,
        primary_name: draft.p1.name,
        user_phone: draft.p1.phone,
        secondary_name: draft.isMarried ? draft.p2.name : null,
        is_married: draft.isMarried,
        total_asset_value: totalAsset,
        total_income_value: totalIncome,
        is_eligible: isEligible,
      };
      const res = await fetch(`${API_BASE_URL}/assessments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const updated = await res.json();
        setData(updated);
        setDraft(JSON.parse(JSON.stringify(updated.submission_data)));
        setEditing(false);
        showToast('已儲存');
      } else {
        showToast('儲存失敗', false);
      }
    } catch (e) {
      console.error(e);
      showToast('儲存失敗', false);
    } finally { setSaving(false); }
  }, [draft, id]);

  const handleCancel = () => {
    setDraft(JSON.parse(JSON.stringify(data.submission_data)));
    setEditing(false);
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-500" /></div>;
  if (!data) return <div className="p-12 text-center text-slate-400">找不到記錄</div>;

  const sd = editing ? draft : data.submission_data;
  const { p1, p2, isMarried } = sd;
  const p1Analysis = getPersonAnalysis(p1, isMarried);
  const p2Analysis = isMarried ? getPersonAnalysis(p2, isMarried) : null;

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-lg font-bold text-sm transition-all ${toast.ok ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
          {toast.msg}
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} style={wpBtn({ padding:'0.75rem', backgroundColor:'#ffffff', borderRadius:'0.75rem', boxShadow:'0 1px 2px 0 rgba(0,0,0,0.05)', color:'#64748b' })} className="p-3 bg-white rounded-xl shadow-sm text-slate-500 hover:text-slate-800 transition-colors"><ArrowLeft size={20} /></button>
            <h1 className="text-2xl font-black text-slate-800">體檢報告詳情</h1>
          </div>
          <div className="flex gap-2">
            {editing ? (
              <>
                <button onClick={handleCancel} style={wpBtn({ display:'flex', alignItems:'center', gap:'0.25rem', paddingLeft:'1rem', paddingRight:'1rem', paddingTop:'0.5rem', paddingBottom:'0.5rem', backgroundColor:'#f1f5f9', color:'#475569', borderRadius:'0.75rem', fontWeight:'700', fontSize:'0.875rem' })} className="flex items-center gap-1 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors">
                  <X size={16} /> 取消
                </button>
                <button onClick={handleSave} disabled={saving} style={wpBtn({ display:'flex', alignItems:'center', gap:'0.25rem', paddingLeft:'1rem', paddingRight:'1rem', paddingTop:'0.5rem', paddingBottom:'0.5rem', backgroundColor:'#2563eb', color:'#ffffff', borderRadius:'0.75rem', fontWeight:'700', fontSize:'0.875rem' })} className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 儲存
                </button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} style={wpBtn({ display:'flex', alignItems:'center', gap:'0.25rem', paddingLeft:'1rem', paddingRight:'1rem', paddingTop:'0.5rem', paddingBottom:'0.5rem', backgroundColor:'#ffffff', border:'1px solid #e2e8f0', color:'#475569', borderRadius:'0.75rem', fontWeight:'700', fontSize:'0.875rem' })} className="flex items-center gap-1 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors">
                <Pencil size={16} /> 編輯
              </button>
            )}
          </div>
        </div>

        {/* ── Editable body ───────────────────────────────── */}
        {editing ? (
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
            {/* Married toggle */}
            <Toggle
              label="已婚 (雙人申請)"
              checked={draft.isMarried}
              onChange={v => setDraft(d => ({ ...d, isMarried: v }))}
            />
            <PersonEditor
              label={`主要申請人 — ${draft.p1.name || '未填寫'}`}
              person={draft.p1}
              onChange={p => setDraft(d => ({ ...d, p1: p }))}
              openNumpad={openNumpad}
              numpadAnchorRef={numpadAnchorRef}
            />
            {draft.isMarried && (
              <PersonEditor
                label={`配偶 — ${draft.p2.name || '未填寫'}`}
                person={draft.p2}
                onChange={p => setDraft(d => ({ ...d, p2: p }))}
                openNumpad={openNumpad}
                numpadAnchorRef={numpadAnchorRef}
              />
            )}
          </div>
        ) : (
          /* ── Read-only view (original, with expandable sections) */
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
            <h4 className="text-2xl font-black text-slate-800 border-b border-slate-100 pb-4">基本資料</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl">
                <p className="text-xs text-slate-400 font-bold uppercase mb-1">主要申請人</p>
                <p className="font-bold text-slate-800 text-lg">{p1.name} ({p1.age}歲)</p>
                <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">📞 {p1.phone}</p>
              </div>
              {isMarried && (
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-xs text-slate-400 font-bold uppercase mb-1">配偶</p>
                  <p className="font-bold text-slate-800 text-lg">{p2.name} ({p2.age}歲)</p>
                </div>
              )}
            </div>

            <div className="grid gap-6">
              {/* P1 expandable detail */}
              <Section title={`${p1.name} 的申報詳情`} badge={`${p1Analysis.details.length} 項`} defaultOpen={true}>
                <SummaryList name={p1.name} details={p1Analysis.details} />
              </Section>
              {isMarried && p2Analysis && (
                <Section title={`${p2.name} 的申報詳情`} badge={`${p2Analysis.details.length} 項`}>
                  <SummaryList name={p2.name} details={p2Analysis.details} />
                </Section>
              )}
            </div>

            <div className="pt-8 border-t border-slate-100 flex justify-between items-center">
              <div>
                <span className="block text-xs uppercase font-bold text-slate-400 mb-1">評估結果</span>
                {data.is_eligible ?
                  <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-600 rounded-xl font-black text-xl">✨ 符合資格</span> :
                  <span className="inline-block px-4 py-2 bg-rose-100 text-rose-600 rounded-xl font-black text-xl">⚠️ 資產或入息超標</span>
                }
              </div>
              <div className="text-right">
                <span className="block text-xs uppercase font-bold text-slate-400 mb-1">總資產值</span>
                <span className="text-indigo-600 font-black text-3xl">{formatCurrency(data.total_asset_value)}</span>
                <p className="text-xs text-slate-400 font-bold mt-1">總入息: {formatCurrency(data.total_income_value)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      <NumpadPopup />
    </div>
  );
};

export default ReportDetail;
