import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { getPersonAnalysis, SummaryList, formatCurrency } from '../utils';

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/assessments/${id}`);
        if(res.ok) {
            setData(await res.json());
        }
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-500" /></div>;
  if (!data) return <div className="p-12 text-center text-slate-400">找不到記錄</div>;

  const { p1, p2, isMarried } = data.submission_data;
  const p1Analysis = getPersonAnalysis(p1, isMarried);
  const p2Analysis = isMarried ? getPersonAnalysis(p2, isMarried) : null;

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
         <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-xl shadow-sm text-slate-500 hover:text-slate-800 transition-colors"><ArrowLeft size={20} /></button>
          <h1 className="text-2xl font-black text-slate-800">體檢報告詳情</h1>
        </div>
        
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

             <div className="grid gap-10">
              <SummaryList name={p1.name} details={p1Analysis.details} />
              {isMarried && <SummaryList name={p2.name} details={p2Analysis.details} />}
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
      </div>
    </div>
  );
};

export default ReportDetail;
