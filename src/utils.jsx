import React from 'react';

// API Configuration
// In development, this is empty (uses Vite proxy).
// For production, set VITE_API_URL in your environment variables.
let apiUrl = import.meta.env.VITE_API_URL || '';
if (apiUrl && !apiUrl.startsWith('http')) {
  apiUrl = `https://${apiUrl}`;
}
console.log('Debug - VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('Debug - Computed API_BASE_URL:', apiUrl);
export const API_BASE_URL = apiUrl;

export const formatCurrency = (num) => {
  return new Intl.NumberFormat('zh-HK', { 
    style: 'currency', 
    currency: 'HKD', 
    maximumFractionDigits: 0 
  }).format(num || 0);
};

export const getPersonAnalysis = (person, isMarried) => {
  const details = [];
  const age = parseInt(person.age) || 0;
  
  // 1. Core Assets
  Object.entries(person.assets).forEach(([key, item]) => {
    if (item.enabled && item.value > 0) {
      details.push({ label: item.label, value: item.value, type: 'asset', isExempt: false, category: '基礎' });
    }
  });

  // 2. Properties
  if (person.propertyEnabled) {
    person.properties.forEach(p => {
      if (p.value > 0) {
        details.push({ 
          label: `物業-${p.type}`, 
          value: p.value, 
          type: 'asset', 
          isExempt: p.type === '自住物業', 
          category: '物業' 
        });
      }
    });
  }

  // 3. MPF Logic
  if (person.mpfEnabled) {
    person.mpfItems.forEach(item => {
      if (item.value > 0) {
        let exempt = false;
        if (item.type === '可扣稅自願性供款') {
          exempt = true;
        } else if (item.type === '強制性供款') {
          exempt = age < 65;
        } else if (item.type === '自願性供款') {
          exempt = false; 
        } else if (item.type === '公積金') {
          exempt = item.status === '保留中';
        }
        details.push({ label: `MPF-${item.type}`, value: item.value, type: 'asset', isExempt: exempt, category: '強積金' });
      }
    });
  }

  // 4. Insurance
  if (person.insuranceEnabled) {
    person.insurancePolicies.forEach(p => {
      if (p.enabled && p.value > 0) {
        details.push({ 
          label: `保單-${p.type}`, 
          value: p.value, 
          type: 'asset', 
          isExempt: p.type !== '儲蓄', 
          category: '保險' 
        });
      }
    });
  }

  // 5. Income
  Object.entries(person.income).forEach(([key, item]) => {
    if (item.enabled && item.value > 0) {
      const isExempt = (key === 'policyReverse' || key === 'propertyReverse');
      details.push({ label: item.label, value: item.value, type: 'income', isExempt, category: '入息' });
    }
  });

  const totalAsset = details.filter(d => d.type === 'asset' && !d.isExempt).reduce((sum, d) => sum + d.value, 0);
  const totalIncome = details.filter(d => d.type === 'income' && !d.isExempt).reduce((sum, d) => sum + d.value, 0);

  return { totalAsset, totalIncome, details };
};

export const SummaryList = ({ name, details }) => {
  if (!details || details.length === 0) return null;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
        <div className="text-lg font-black text-slate-800">{name} 的申報詳情</div>
      </div>
      <div className="grid gap-2">
        {details.map((d, i) => (
          <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white transition-all shadow-sm">
            <div className="flex flex-col">
              <span className="font-bold text-slate-700 text-sm">{d.label}</span>
              {d.isExempt && <span className="text-[9px] text-emerald-600 font-black uppercase tracking-wider mt-1">✨ 法定豁免項目</span>}
            </div>
            <span className={`text-lg font-black ${d.isExempt ? 'text-slate-300 line-through' : (d.type === 'asset' ? 'text-blue-600' : 'text-amber-600')}`}>
              {formatCurrency(d.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
