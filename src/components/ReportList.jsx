import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, Loader2 } from 'lucide-react';

const ReportList = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchAssessments = async (searchTerm = '') => {
    setLoading(true);
    try {
      const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
      const response = await fetch(`http://127.0.0.1:8000/assessments/${query}`);
      if (response.ok) {
        const data = await response.json();
        setAssessments(data);
      }
    } catch (error) {
      console.error("Failed to fetch reports", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments(search);
  }, [search]); 

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-black text-slate-800">體檢報告查詢</h1>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="搜尋姓名或電話號碼..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-4 pl-12 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 outline-none shadow-sm transition-all"
          />
        </div>

        {loading ? (
             <div className="flex justify-center p-12">
                 <Loader2 className="animate-spin text-indigo-500" size={32} />
             </div>
        ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="p-4 font-black text-slate-600 text-sm">主要申請人</th>
                  <th className="p-4 font-black text-slate-600 text-sm">配偶</th>
                  <th className="p-4 font-black text-slate-600 text-sm">聯絡電話</th>
                  <th className="p-4 font-black text-slate-600 text-sm">提交日期</th>
                  <th className="p-4 font-black text-slate-600 text-sm">狀態</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {assessments.map((item) => {
                    const p1 = item.submission_data?.p1 || {};
                    const p2 = item.submission_data?.p2 || {};
                    const phone = item.user_phone || p1.phone || '-';
                    
                    return (
                        <tr 
                            key={item.id} 
                            onClick={() => navigate(`/reports/${item.id}`)}
                            className="hover:bg-slate-50 cursor-pointer transition-colors group"
                        >
                        <td className="p-4">
                            <div className="font-bold text-slate-800">{item.primary_name}</div>
                            <div className="text-xs text-slate-400">{p1.age} 歲</div>
                        </td>
                        <td className="p-4">
                            {item.is_married ? (
                                <>
                                    <div className="font-bold text-slate-600">{item.secondary_name}</div>
                                    <div className="text-xs text-slate-400">{p2.age} 歲</div>
                                </>
                            ) : <span className="text-slate-300">-</span>}
                        </td>
                        <td className="p-4 font-mono text-slate-500">{phone}</td>
                        <td className="p-4 text-xs font-bold text-slate-400">
                            {new Date(item.created_at).toLocaleDateString()}
                        </td>
                         <td className="p-4">
                            {item.is_eligible ? 
                                <span className="inline-flex px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg">合資格</span> : 
                                <span className="inline-flex px-2 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-lg">超標</span>
                            }
                        </td>
                        </tr>
                    );
                })}
                {assessments.length === 0 && (
                    <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400 font-bold">
                            沒有找到相關記錄
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default ReportList;
