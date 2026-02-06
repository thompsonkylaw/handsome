import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPersonAnalysis, SummaryList, formatCurrency, API_BASE_URL } from '../utils';
import { 
  Calculator, Users, User, Landmark, Coins, HeartPulse, 
  CheckCircle2, XCircle, ArrowRight, ArrowLeft, ShieldCheck, 
  Undo2, Plus, Trash2, Phone, UserCircle, Calendar, ClipboardList,
  Home, Building2, ListChecks, Download, RefreshCcw, PieChart, Activity, Info,
  PiggyBank, Wallet, Construction, Settings, X
} from 'lucide-react';

const COMPANIES = [
  { color: '#009739', company: 'Manulife' },
  { color: '#E4002B', company: 'AIA' },
  { color: '#FFCD00', company: 'Sunlife' },
  { color: '#00008F', company: 'AXA' },
  { color: '#004A9F', company: 'Chubb' },
  { color: '#ed1b2e', company: 'Prudential' },
  { color: '#e67e22', company: 'FWD' },
];

// --- Constants & Helpers ---

const LIMITS = {
  single: { asset: 406000, income: 10770 }, // 2025/26 Standard
  couple: { asset: 616000, income: 16440 }
};

const createEmptyPerson = () => ({
  name: '',
  age: '',
  phone: '',
  assets: {
    bank: { enabled: false, value: 0, label: "現金及銀行存款" },
    stock: { enabled: false, value: 0, label: "股票、基金及債券" },
    gold: { enabled: false, value: 0, label: "金條、金幣及古董" },
    land: { enabled: false, value: 0, label: "土地及車位" },
    business: { enabled: false, value: 0, label: "商業資產 (店鋪/公司)" },
    vehicle: { enabled: false, value: 0, label: "營運車輛 (如的士/小巴)" },
  },
  propertyEnabled: false,
  properties: [{ id: Date.now(), type: '自住物業', value: 0 }],
  mpfEnabled: false,
  mpfItems: [{ id: Date.now(), type: '強制性供款', value: 0, status: '保留中' }],
  insuranceEnabled: false,
  insurancePolicies: [{ id: Date.now(), type: '儲蓄', value: 0, enabled: true }],
  income: {
    work: { enabled: false, value: 0, label: "每月工作薪金" },
    pension: { enabled: false, value: 0, label: "每月退休金 (長俸)" },
    annuity: { enabled: false, value: 0, label: "每月年金給付" },
    rental: { enabled: false, value: 0, label: "每月租金收入" },
    dividend: { enabled: false, value: 0, label: "每月股息/利息" },
    policyReverse: { enabled: false, value: 0, label: "保單逆按揭年金 (豁免)" },
    propertyReverse: { enabled: false, value: 0, label: "物業逆按揭年金 (豁免)" }
  }
});

// --- UI Components ---

const ToggleButton = ({ active, onClick, color = "bg-blue-600" }) => (
  <button 
    onClick={onClick} 
    className={`relative w-14 h-7 rounded-full transition-all duration-300 ${active ? color : 'bg-slate-200'}`}
  >
    <div className={`absolute w-5 h-5 bg-white rounded-full top-1 shadow-md transition-all duration-300 ${active ? 'left-8' : 'left-1'}`} />
  </button>
);

const GaugeChart = ({ value, limit, label }) => {
  const percentage = Math.min((value / limit) * 100, 100);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  let statusColor = "stroke-emerald-500";
  if (percentage > 100) statusColor = "stroke-rose-500";
  else if (percentage > 85) statusColor = "stroke-amber-500";

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl shadow-sm border border-slate-100 flex-1">
      <div className="relative flex items-center justify-center">
        <svg className="w-32 h-32 transform -rotate-90">
          <circle className="text-slate-100 stroke-current" strokeWidth="10" fill="transparent" r={radius} cx="64" cy="64" />
          <circle 
            className={`${statusColor} stroke-current transition-all duration-1000 ease-out`} 
            strokeWidth="10" 
            strokeDasharray={circumference} 
            strokeDashoffset={offset} 
            strokeLinecap="round" 
            fill="transparent" 
            r={radius} 
            cx="64" 
            cy="64" 
          />
        </svg>
        <div className="absolute flex flex-col items-center text-center">
          <span className="text-2xl font-black text-slate-800">{Math.round(percentage)}%</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
        </div>
      </div>
      <div className="mt-4 text-center">
        <div className="text-lg font-black text-slate-700">{formatCurrency(value)}</div>
        <div className="text-[10px] text-slate-400 font-bold tracking-wider">上限 {formatCurrency(limit)}</div>
      </div>
    </div>
  );
};

const ToggleInput = ({ label, enabled, value, onToggle, onValueChange, color="blue", subtext="" }) => (
  <div className={`p-5 rounded-2xl border-2 transition-all ${enabled ? (color==='blue' ? 'border-blue-400 bg-blue-50/50 shadow-inner' : 'border-amber-400 bg-amber-50/50 shadow-inner') : 'border-slate-100 bg-white'}`}>
    <div className="flex justify-between items-center mb-2">
      <div className="flex flex-col">
        <span className="text-base font-bold text-slate-700">{label}</span>
        {subtext && <span className="text-[10px] font-bold text-blue-600 leading-tight mt-1">{subtext}</span>}
      </div>
      <ToggleButton active={enabled} onClick={onToggle} color={color === 'blue' ? 'bg-blue-600' : 'bg-amber-600'} />
    </div>
    {enabled && (
      <div className="relative mt-2 animate-in fade-in zoom-in-95 duration-200">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
        <input 
          type="number" 
          value={value === 0 ? '' : value} 
          onChange={(e) => onValueChange(e.target.value)} 
          className="w-full pl-8 pr-4 py-2 text-xl font-bold rounded-xl border-2 border-transparent focus:border-blue-300 outline-none bg-white shadow-sm" 
          placeholder="0" 
        />
      </div>
    )}
  </div>
);

const InputField = ({ label, icon, value, onChange, type="text", placeholder, error }) => (
  <div className="space-y-1 w-full">
    <label className={`text-sm font-bold flex items-center gap-2 transition-colors ${error ? 'text-rose-600' : 'text-slate-600'}`}>
      {icon} {label}
    </label>
    <input 
      type={type} 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      className={`w-full p-4 text-lg font-bold border-2 rounded-2xl bg-white outline-none shadow-sm transition-all ${error ? 'border-rose-500 bg-rose-50 focus:border-rose-600' : 'border-slate-100 focus:border-blue-400'}`} 
      placeholder={placeholder} 
    />
    {error && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1 animate-pulse">{error}</p>}
  </div>
);

// --- Main App ---

const AssessmentForm = () => {
  const navigate = useNavigate();
  const [themeColor, setThemeColor] = useState('#009739');
  const [showSettings, setShowSettings] = useState(false);
  const [step, setStep] = useState('landing');
  const [isMarried, setIsMarried] = useState(false);
  const [p1, setP1] = useState(createEmptyPerson());
  const [p2, setP2] = useState(createEmptyPerson());
  const [showExportMsg, setShowExportMsg] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // idle | saving | success | error

  const getUserEmail = () => window.root13appSettings?.user_email || "none@gmail.com";

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [step]);

  const currentLimit = isMarried ? LIMITS.couple : LIMITS.single;

  const p1Analysis = useMemo(() => getPersonAnalysis(p1, isMarried), [p1, isMarried]);
  const p2Analysis = useMemo(() => isMarried ? getPersonAnalysis(p2, isMarried) : { totalAsset: 0, totalIncome: 0, details: [] }, [p2, isMarried]);
  
  const totalAssets = p1Analysis.totalAsset + p2Analysis.totalAsset;
  const totalIncome = p1Analysis.totalIncome + p2Analysis.totalIncome;
  const isAssetOk = totalAssets <= currentLimit.asset;
  const isIncomeOk = totalIncome <= currentLimit.income;
  const isEligible = isAssetOk && isIncomeOk;

  const validatePhone = (phone) => /^\d{8}$/.test(phone);
  const getPhoneError = (phone) => {
    if (!phone) return null;
    if (!/^\d{8}$/.test(phone)) return "手機號碼需為8位數字";
    return null;
  };

  const p1PhoneError = getPhoneError(p1.phone);
  const p2PhoneError = isMarried ? getPhoneError(p2.phone) : null;
  const canGoNext = p1.name && p1.age && validatePhone(p1.phone) && (!isMarried || (p2.name && p2.age && validatePhone(p2.phone)));

  const handleReset = () => {
    setP1(createEmptyPerson());
    setP2(createEmptyPerson());
    setIsMarried(false);
    setStep('landing');
  };

  const exportToCSV = () => {
    let csv = "\ufeff類別,項目,持有人,金額,是否豁免\n";
    const reportData = [
      { name: p1.name, details: p1Analysis.details },
      ...(isMarried ? [{ name: p2.name, details: p2Analysis.details }] : [])
    ];
    reportData.forEach(p => {
      p.details.forEach(d => {
        csv += `${d.type === 'asset' ? '資產' : '入息'},${d.label},${p.name},${d.value},${d.isExempt ? '是' : '否'}\n`;
      });
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `OALA_2526年度報告_${p1.name}.csv`;
    link.click();
    setShowExportMsg(true);
    setTimeout(() => setShowExportMsg(false), 3000);
  };

  const saveToDatabase = async () => {
    setSaveStatus('saving');
    try {
      const payload = {
        user_email: getUserEmail(),
        primary_name: p1.name,
        secondary_name: isMarried ? p2.name : null,
        is_married: isMarried,
        total_asset_value: totalAssets,
        total_income_value: totalIncome,
        is_eligible: isEligible,
        submission_data: { p1, p2, isMarried }
      };

      const response = await fetch(`${API_BASE_URL}/assessments/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Server Error:", errText);
        throw new Error(`Saving failed: ${response.status} ${response.statusText} - ${errText}`);
      }
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error(error);
      setSaveStatus('error');
    }
  };

  if (step === 'landing') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative">
        <style>{`
            .theme-text { color: ${themeColor}; }
            .theme-bg { background-color: ${themeColor}; }
            .theme-border { border-color: ${themeColor}; }
            .theme-hover-bg:hover { background-color: ${themeColor}; }
            .theme-hover-text:hover { color: ${themeColor}; }
            .theme-hover-border:hover { border-color: ${themeColor}; }
            .theme-light-bg { background-color: ${themeColor}20; }
            .group:hover .group-hover-theme-bg { background-color: ${themeColor}; }
            .group:hover .group-hover-theme-text { color: ${themeColor}; }
        `}</style>

         <button 
           onClick={() => setShowSettings(true)}
           className="absolute top-6 right-6 p-3 bg-white hover:bg-slate-100 rounded-full shadow-lg transition-all text-slate-400 hover:text-slate-600 z-10"
         >
            <Settings size={24} />
         </button>

         {showSettings && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
               <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl space-y-6">
                  <div className="flex items-center justify-between">
                     <h3 className="text-xl font-black text-slate-800">選擇主題顏色</h3>
                     <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                     </button>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                     {COMPANIES.map((c) => (
                        <button 
                           key={c.company}
                           onClick={() => { setThemeColor(c.color); setShowSettings(false); }}
                           className="flex flex-col items-center gap-2 group"
                        >
                           <div 
                              className="w-12 h-12 rounded-full shadow-md group-hover:scale-110 transition-transform flex items-center justify-center ring-2 ring-transparent group-hover:ring-offset-2"
                              style={{ backgroundColor: c.color, '--tw-ring-color': c.color }}
                           >
                              {themeColor === c.color && <CheckCircle2 className="text-white" size={20} />}
                           </div>
                           <span className="text-[10px] font-bold text-slate-500">{c.company}</span>
                        </button>
                     ))}
                  </div>
               </div>
            </div>
         )}

        <div className="max-w-xl w-full text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
           <div className="inline-block p-4 bg-white rounded-full shadow-lg mb-4">
             <HeartPulse size={48} className="text-rose-500" />
           </div>
           <h1 className="text-4xl font-black text-slate-800 tracking-tight">請選擇體檢項目</h1>
           <p className="text-slate-500 font-bold">歡迎使用自助評估系統</p>
           
           <div className="grid gap-6 mt-8">
             <button onClick={() => setStep('intro')} className="p-8 bg-white rounded-[2rem] shadow-xl border-4 border-slate-50 theme-hover-border hover:shadow-2xl hover:scale-[1.02] transition-all group text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 theme-bg text-white font-black text-xs rounded-bl-2xl">熱門</div>
                <div className="flex items-center gap-6 relative z-10">
                   <div className="theme-light-bg p-5 rounded-2xl theme-text group-hover-theme-bg group-hover:text-white transition-colors duration-300">
                      <Calculator size={40} />
                   </div>
                   <div>
                      <h3 className="text-2xl font-black text-slate-800 group-hover-theme-text transition-colors">長者生活津貼體檢</h3>
                      <p className="text-slate-500 font-bold mt-2 text-sm">資產及入息審查 • 合資格預算</p>
                   </div>
                   <ArrowRight className="ml-auto text-slate-300 group-hover-theme-text group-hover:translate-x-2 transition-all" size={32} />
                </div>
             </button>

             <button onClick={() => setStep('general_checkup')} className="p-8 bg-white rounded-[2rem] shadow-xl border-4 border-slate-50 hover:border-emerald-500 hover:shadow-2xl hover:scale-[1.02] transition-all group text-left opacity-80 hover:opacity-100">
                <div className="flex items-center gap-6">
                   <div className="bg-emerald-100 p-5 rounded-2xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                      <Activity size={40} />
                   </div>
                   <div>
                      <h3 className="text-2xl font-black text-slate-800 group-hover:text-emerald-600 transition-colors">一般體檢</h3>
                      <p className="text-slate-500 font-bold mt-2 text-sm">身體檢查 • 健康報告</p>
                   </div>
                   <ArrowRight className="ml-auto text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-2 transition-all" size={32} />
                </div>
             </button>

             <button onClick={() => navigate('/reports')} className="p-8 bg-white rounded-[2rem] shadow-xl border-4 border-slate-50 hover:border-blue-500 hover:shadow-2xl hover:scale-[1.02] transition-all group text-left opacity-80 hover:opacity-100">
                <div className="flex items-center gap-6">
                   <div className="bg-blue-100 p-5 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                      <ListChecks size={40} />
                   </div>
                   <div>
                      <h3 className="text-2xl font-black text-slate-800 group-hover:text-blue-600 transition-colors">查詢體檢報告</h3>
                      <p className="text-slate-500 font-bold mt-2 text-sm">搜尋往日記錄 • 詳細資料</p>
                   </div>
                   <ArrowRight className="ml-auto text-slate-300 group-hover:text-blue-500 group-hover:translate-x-2 transition-all" size={32} />
                </div>
             </button>
           </div>
        </div>
      </div>
    );
  }

  if (step === 'general_checkup') {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-8 p-10 bg-white rounded-[3rem] shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300">
                <div className="bg-amber-100 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 shrink-0">
                     <Construction size={64} className="text-amber-600" />
                </div>
                <div className="space-y-4">
                  <h2 className="text-4xl font-black text-slate-800">功能建設中</h2>
                  <p className="text-slate-400 font-bold text-xl uppercase tracking-widest">Under Construction</p>
                </div>
                <div className="pt-8">
                  <button onClick={() => setStep('landing')} className="w-full py-4 bg-slate-800 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-black hover:scale-105 transition-all flex items-center justify-center gap-3">
                      <Undo2 size={20} /> 返回首頁
                  </button>
                </div>
            </div>
        </div>
      )
  }

  if (step === 'intro') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <style>{`
            .theme-text { color: ${themeColor}; }
            .theme-bg { background-color: ${themeColor}; }
            .theme-border { border-color: ${themeColor}; }
            .theme-hover-bg:hover { background-color: ${themeColor}; }
            .theme-hover-text:hover { color: ${themeColor}; }
            .theme-hover-border:hover { border-color: ${themeColor}; }
        `}</style>
        <div className="max-w-xl w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
          <div className="theme-bg p-8 text-white text-center relative">
            <button 
                onClick={() => setStep('landing')}
                className="absolute left-6 top-6 bg-white/20 p-2 rounded-xl hover:bg-white/30 transition-all text-white"
            >
                <ArrowLeft size={24} />
            </button>
            <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <Calculator className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-black tracking-tight">長者生活津貼體檢</h1>
            <p className="text-white/90 mt-1 font-bold text-sm">2025 / 2026 年度入息及資產審核</p>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setIsMarried(false)} className={`py-4 rounded-2xl font-bold border-2 transition-all flex items-center justify-center gap-2 ${!isMarried ? 'theme-bg text-white theme-border shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}>
                <User size={18} /> 個人申請
              </button>
              <button onClick={() => setIsMarried(true)} className={`py-4 rounded-2xl font-bold border-2 transition-all flex items-center justify-center gap-2 ${isMarried ? 'theme-bg text-white theme-border shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}>
                <Users size={18} /> 夫婦申請
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                <h3 className="font-black text-slate-800 flex items-center gap-2"><UserCircle className="theme-text" /> {isMarried ? "第一位申請人" : "您的個人資料"}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="姓名" icon={<User size={14} />} value={p1.name} onChange={v => setP1({...p1, name: v})} placeholder="陳大文" />
                  <InputField label="年齡" icon={<Calendar size={14} />} type="number" value={p1.age} onChange={v => setP1({...p1, age: v})} placeholder="65" />
                </div>
                <InputField label="聯絡電話" icon={<Phone size={14} />} value={p1.phone} onChange={v => setP1({...p1, phone: v})} placeholder="輸入8位數字" error={p1PhoneError} />
              </div>

              {isMarried && (
                <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100 space-y-4 animate-in slide-in-from-top-4 duration-300">
                  <h3 className="font-black text-indigo-800 flex items-center gap-2"><Users className="text-indigo-600" /> 第二位申請人 (配偶)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="姓名" icon={<User size={14} />} value={p2.name} onChange={v => setP2({...p2, name: v})} placeholder="王小梅" />
                    <InputField label="年齡" icon={<Calendar size={14} />} type="number" value={p2.age} onChange={v => setP2({...p2, age: v})} placeholder="65" />
                  </div>
                  <InputField label="聯絡電話" icon={<Phone size={14} />} value={p2.phone} onChange={v => setP2({...p2, phone: v})} placeholder="輸入8位數字" error={p2PhoneError} />
                </div>
              )}
            </div>

            <button 
              disabled={!canGoNext}
              onClick={() => setStep('p1_calc')}
              className={`w-full py-5 rounded-full text-xl font-black shadow-xl transition-all flex items-center justify-center gap-3 ${canGoNext ? 'bg-amber-500 text-white hover:bg-amber-600 active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
            >
              填寫資產資料 <ArrowRight size={24} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderCalculator = (person, setPerson, isFirst) => {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center pb-24 pt-6 px-4">
        <div className="max-w-2xl w-full bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100">
          <div className="bg-blue-700 p-6 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
               <button onClick={() => setStep(isFirst ? 'intro' : 'p1_calc')} className="bg-white/20 p-2 rounded-xl hover:bg-white/30 transition-all"><ArrowLeft size={20}/></button>
               <h2 className="text-xl font-black">體檢項目：{person.name || (isFirst ? "第一位" : "第二位")}</h2>
            </div>
            <div className="bg-amber-500 px-4 py-1 rounded-full font-black text-xs shadow-md uppercase tracking-widest">{isFirst ? '1' : '2'} / {isMarried ? '2' : '1'}</div>
          </div>

          <div className="p-6 space-y-10">
            {/* Property Section */}
            <section className="space-y-4">
              <div className="flex justify-between items-center border-b-2 border-blue-500 pb-2">
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><Building2 size={20} className="text-blue-600" /> 物業清單</h3>
                <ToggleButton active={person.propertyEnabled} onClick={() => setPerson({...person, propertyEnabled: !person.propertyEnabled})} />
              </div>
              {person.propertyEnabled && (
                <div className="grid gap-3 animate-in fade-in slide-in-from-top-2">
                  {person.properties.map((prop, idx) => (
                    <div key={prop.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex gap-2">
                        {['自住物業', '非自住物業'].map(t => (
                          <button key={t} onClick={() => {
                            const newProps = [...person.properties];
                            newProps[idx] = { ...newProps[idx], type: t };
                            setPerson({...person, properties: newProps});
                          }} className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all ${prop.type === t ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-slate-400 border-transparent'}`}>{t}</button>
                        ))}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-300">$</span>
                          <input type="number" value={prop.value || ''} onChange={e => {
                            const newProps = [...person.properties];
                            newProps[idx] = { ...newProps[idx], value: e.target.value === '' ? 0 : parseFloat(e.target.value) };
                            setPerson({...person, properties: newProps});
                          }} className="w-full pl-10 pr-4 py-3 text-lg font-black rounded-xl border-2 border-white focus:border-blue-400 outline-none shadow-sm" placeholder="物業估值" />
                        </div>
                        <button onClick={() => setPerson({...person, properties: person.properties.filter(p => p.id !== prop.id)})} className="text-rose-400 p-2 hover:bg-rose-50 rounded-full transition-all"><Trash2 size={20}/></button>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setPerson({...person, properties: [...person.properties, { id: Date.now(), type: '非自住物業', value: 0 }]})} className="w-full py-3 border-2 border-dashed border-blue-200 rounded-2xl text-blue-600 font-bold text-sm flex justify-center items-center gap-2 hover:bg-blue-50 transition-colors"><Plus size={16}/> 新增物業</button>
                </div>
              )}
            </section>

            {/* MPF Section */}
            <section className="space-y-4">
              <div className="flex justify-between items-center border-b-2 border-indigo-500 pb-2">
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><PiggyBank size={20} className="text-indigo-600" /> 強積金 (MPF)</h3>
                <ToggleButton active={person.mpfEnabled} onClick={() => setPerson({...person, mpfEnabled: !person.mpfEnabled})} color="bg-indigo-600" />
              </div>
              {person.mpfEnabled && (
                <div className="grid gap-3">
                  {person.mpfItems.map((item, idx) => (
                    <div key={item.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {['公積金', '強制性供款', '自願性供款', '可扣稅自願性'].map(t => (
                          <button key={t} onClick={() => {
                            const newMpf = [...person.mpfItems];
                            newMpf[idx] = { ...newMpf[idx], type: t };
                            setPerson({...person, mpfItems: newMpf});
                          }} className={`px-3 py-1.5 rounded-lg text-[10px] font-black border-2 ${item.type === t ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-slate-400 border-transparent'}`}>{t}</button>
                        ))}
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 items-center">
                        <div className="relative flex-1 w-full">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-300">$</span>
                          <input type="number" value={item.value || ''} onChange={e => {
                            const newMpf = [...person.mpfItems];
                            newMpf[idx] = { ...newMpf[idx], value: e.target.value === '' ? 0 : parseFloat(e.target.value) };
                            setPerson({...person, mpfItems: newMpf});
                          }} className="w-full pl-10 pr-4 py-3 text-lg font-black rounded-xl border-2 border-white focus:border-indigo-400 outline-none shadow-sm" placeholder="戶口價值" />
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          {item.type === '公積金' && (
                            <select value={item.status} onChange={e => {
                              const newMpf = [...person.mpfItems];
                              newMpf[idx] = { ...newMpf[idx], status: e.target.value };
                              setPerson({...person, mpfItems: newMpf});
                            }} className="flex-1 p-3 border-2 border-white bg-white rounded-xl text-xs font-bold shadow-sm outline-none">
                              <option value="保留中">保留中 (不計)</option>
                              <option value="已提取">已提取 (計入)</option>
                            </select>
                          )}
                          <button onClick={() => setPerson({...person, mpfItems: person.mpfItems.filter(m => m.id !== item.id)})} className="text-rose-400 p-2 hover:bg-rose-50 rounded-full transition-all shrink-0"><Trash2 size={20}/></button>
                        </div>
                      </div>
                      <div className="text-[10px] font-black italic text-blue-600 text-right px-1">
                        {item.type === '強制性供款' && (parseInt(person.age) < 65) ? '✓ 未滿65歲：法定豁免' : 
                         (item.type === '強制性供款' && (parseInt(person.age) >= 65) ? '⚠ 年滿65歲：需計入資產' : '按社會福利署指引審核')}
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setPerson({...person, mpfItems: [...person.mpfItems, { id: Date.now(), type: '強制性供款', value: 0, status: '保留中' }]})} className="w-full py-3 border-2 border-dashed border-indigo-200 rounded-2xl text-indigo-600 font-bold text-sm flex justify-center items-center gap-2 hover:bg-indigo-50 transition-colors"><Plus size={16}/> 新增項目</button>
                </div>
              )}
            </section>

            {/* General Assets Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(person.assets).map(([key, item]) => (
                <ToggleInput key={key} label={item.label} enabled={item.enabled} value={item.value} 
                  onToggle={() => {
                    const na = {...person.assets};
                    na[key] = { ...na[key], enabled: !na[key].enabled };
                    setPerson({...person, assets: na});
                  }}
                  onValueChange={v => {
                    const na = {...person.assets};
                    na[key] = { ...na[key], value: v === '' ? 0 : parseFloat(v) };
                    setPerson({...person, assets: na});
                  }}
                />
              ))}
            </div>

            {/* Income Section */}
            <section className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200">
              <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2"><Coins className="text-amber-600" /> 每月穩定收入</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(person.income).map(([key, item]) => (
                  <ToggleInput key={key} label={item.label} enabled={item.enabled} value={item.value} color="amber"
                    onToggle={() => {
                      const ni = {...person.income};
                      ni[key] = { ...ni[key], enabled: !ni[key].enabled };
                      setPerson({...person, income: ni});
                    }}
                    onValueChange={v => {
                      const ni = {...person.income};
                      ni[key] = { ...ni[key], value: v === '' ? 0 : parseFloat(v) };
                      setPerson({...person, income: ni});
                    }}
                    subtext={key.includes('Reverse') ? "註：逆按揭屬法定豁免項目" : ""}
                  />
                ))}
              </div>
            </section>
          </div>

          <div className="p-6 bg-slate-50 border-t flex flex-col sm:flex-row gap-4">
            <button onClick={() => setStep(isFirst ? 'intro' : 'p1_calc')} className="flex-1 py-4 bg-slate-200 text-slate-600 rounded-2xl text-lg font-black transition-all flex items-center justify-center gap-2 hover:bg-slate-300"><ArrowLeft size={20}/> 上一步</button>
            <button onClick={() => { if (isFirst && isMarried) setStep('p2_calc'); else setStep('result'); }} className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl text-xl font-black shadow-lg transition-all flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-95">
              {isFirst && isMarried ? "下一步：配偶資料" : "查看評估報告"} <ArrowRight size={20}/>
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (step === 'p1_calc') return renderCalculator(p1, setP1, true);
  if (step === 'p2_calc') return renderCalculator(p2, setP2, false);

  if (step === 'result') {
    return (
      <div className="min-h-screen bg-slate-50 p-4 pb-20 flex flex-col items-center">
        {showExportMsg && (
          <div className="fixed top-6 bg-emerald-600 text-white px-8 py-3 rounded-full shadow-2xl z-50 flex items-center gap-2 font-black animate-in slide-in-from-top-10">
            <CheckCircle2 size={18} /> 報表導出成功
          </div>
        )}
        
        <div className="max-w-4xl w-full space-y-6">
          {/* Main Status Card */}
          <div className={`p-8 rounded-[3rem] shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-700 ${isEligible ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-rose-500 to-red-600'}`}>
            <div className="flex items-center gap-6 text-white text-center md:text-left flex-col md:flex-row">
              <div className="bg-white/20 p-5 rounded-3xl backdrop-blur-md">
                {isEligible ? <CheckCircle2 size={56} /> : <XCircle size={56} />}
              </div>
              <div>
                <h2 className="text-4xl font-black">{isEligible ? "符合申請資格" : "體檢結果：超標"}</h2>
                <p className="text-white/80 font-bold mt-1">{p1.name} {isMarried && `及 ${p2.name}`} 的專屬分析</p>
              </div>
            </div>
            <div className="bg-black/10 px-6 py-3 rounded-2xl border border-white/20 text-center text-white shrink-0">
              <div className="text-[10px] font-black uppercase opacity-60 tracking-[0.2em]">年度基準</div>
              <div className="text-2xl font-black italic">2025 / 2026</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <GaugeChart value={totalAssets} limit={currentLimit.asset} label="資產總額" />
            <GaugeChart value={totalIncome} limit={currentLimit.income} label="月入總額" />
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
            <h4 className="text-2xl font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4"><ListChecks className="text-blue-600" /> 申報項明細</h4>
            <div className="grid gap-10">
              <SummaryList name={p1.name} details={p1Analysis.details} />
              {isMarried && <SummaryList name={p2.name} details={p2Analysis.details} />}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={saveToDatabase}
              disabled={saveStatus === 'saving' || saveStatus === 'success'}
              className={`py-4 text-white rounded-2xl font-black text-sm shadow-md flex items-center justify-center gap-2 transition-all 
                ${saveStatus === 'success' ? 'bg-emerald-500' : (saveStatus === 'error' ? 'bg-rose-500' : 'bg-indigo-600 hover:bg-indigo-700')}`}
            >
              {saveStatus === 'saving' ? <Activity className="animate-spin" size={18} /> : (saveStatus === 'success' ? <CheckCircle2 size={18} /> : <Landmark size={18} />)} 
              {saveStatus === 'success' ? '已儲存' : (saveStatus === 'error' ? '儲存失敗' : '儲存結果')}
            </button>
            <button onClick={exportToCSV} className="py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-md flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all"><Download size={18}/> 導出報表 (CSV)</button>
            <button onClick={() => setStep(isMarried ? 'p2_calc' : 'p1_calc')} className="py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-md flex items-center justify-center gap-2 hover:bg-blue-700 transition-all"><Undo2 size={18}/> 修改數據</button>
            <button onClick={handleReset} className="py-4 bg-slate-200 text-slate-600 rounded-2xl font-black text-sm shadow-sm flex items-center justify-center gap-2 hover:bg-rose-100 hover:text-rose-600 transition-all"><RefreshCcw size={18}/> 重新體檢</button>
          </div>

          {!isEligible && (
            <div className="bg-amber-50 p-8 rounded-[2.5rem] border-2 border-amber-100 space-y-6">
              <h4 className="text-xl font-black text-amber-800 flex items-center gap-2"><ShieldCheck size={24} /> 專業優化建議範例</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-5 bg-white rounded-2xl border border-amber-200 shadow-sm">
                  <p className="font-black text-amber-900 mb-1">資產分流建議</p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    目前資產超標 {formatCurrency(totalAssets - currentLimit.asset)}。可考慮將部分資金轉移至「年金計劃」，在社署審核中，部分年金僅計算「退保價值」而非原始金額。
                  </p>
                </div>
                <div className="p-5 bg-white rounded-2xl border border-blue-200 shadow-sm">
                  <p className="font-black text-blue-900 mb-1">釋放流動性</p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    若擁有自住物業，可考慮參與「物業逆按揭」。所得月供屬於「貸款」，在法定指引下完全豁免入息審核，不影響津貼申請。
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="p-6 bg-slate-100 rounded-2xl flex gap-3">
            <Info className="text-slate-400 shrink-0" size={20} />
            <p className="text-[10px] text-slate-500 font-bold leading-relaxed italic">免責聲明：本報告基於 2025/2026 年度預期政策指引生成。計算結果僅供參考，最終申請資格、資產定義及批核結果以香港社會福利署之最終決定為準。</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AssessmentForm;