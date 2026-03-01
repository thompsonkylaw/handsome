import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, Loader2, FileText } from 'lucide-react';
import { API_BASE_URL, getPersonAnalysis } from '../utils';
import { wpBtn, wpInput } from '../wpStyles';
import PDFReportContent from './PDFReportContent';
import { generateAssessmentPDF } from '../generatePDF';

const LIMITS = {
  single: { asset: 406000, income: 10770 },
  couple: { asset: 616000, income: 16440 },
};

const ReportList = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [pdfGeneratingId, setPdfGeneratingId] = useState(null);

  const getUserEmail = () => window.root14appSettings?.user_email || "none@gmail.com";

  const fetchAssessments = async (searchTerm = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('user_email', getUserEmail());
      if (searchTerm) params.append('search', searchTerm);
      const response = await fetch(`${API_BASE_URL}/assessments/?${params.toString()}`);
      if (response.ok) {
        console.log('Debug - Backend connection successful: Reports fetched');
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

  const handleGeneratePDF = async (e, item) => {
    e.stopPropagation();

    if (pdfGeneratingId !== null) return;

    const submissionData = item?.submission_data;
    if (!submissionData?.p1) {
      window.alert('此記錄沒有可用的體檢資料，無法建立 PDF。');
      return;
    }

    setPdfGeneratingId(item.id);

    const mountNode = document.createElement('div');
    const root = createRoot(mountNode);

    try {
      const isMarried = !!submissionData.isMarried;
      const p1 = submissionData.p1;
      const p2 = submissionData.p2 || {};
      const currentLimit = isMarried ? LIMITS.couple : LIMITS.single;

      const p1Analysis = getPersonAnalysis(p1, isMarried);
      const p2Analysis = isMarried
        ? getPersonAnalysis(p2, isMarried)
        : { totalAsset: 0, totalIncome: 0, details: [] };

      const totalAssets = p1Analysis.totalAsset + p2Analysis.totalAsset;
      const totalIncome = p1Analysis.totalIncome + p2Analysis.totalIncome;
      const isEligible = totalAssets <= currentLimit.asset && totalIncome <= currentLimit.income;

      mountNode.style.position = 'fixed';
      mountNode.style.left = '-9999px';
      mountNode.style.top = '0';
      mountNode.style.opacity = '0';
      mountNode.style.pointerEvents = 'none';
      mountNode.style.zIndex = '-1';
      document.body.appendChild(mountNode);

      root.render(
        <PDFReportContent
          p1={p1}
          p2={p2}
          isMarried={isMarried}
          p1Analysis={p1Analysis}
          p2Analysis={p2Analysis}
          totalAssets={totalAssets}
          totalIncome={totalIncome}
          currentLimit={currentLimit}
          isEligible={isEligible}
        />
      );

      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

      const fileName = p1.name || item.primary_name || `Assessment_${item.id}`;
      await generateAssessmentPDF({ resultNode: mountNode, fileName });
    } catch (error) {
      console.error('PDF export failed in report list:', error);
      const errorMsg = error?.message ? `\n\n錯誤：${error.message}` : '';
      window.alert(`PDF 生成失敗，請稍後再試。${errorMsg}`);
    } finally {
      root.unmount();
      mountNode.remove();
      setPdfGeneratingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            style={wpBtn({ padding:'0.75rem', backgroundColor:'#ffffff', borderRadius:'0.75rem', boxShadow:'0 1px 2px 0 rgba(0,0,0,0.05)', color:'#64748b' })}
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
            style={wpInput({ width:'100%', padding:'1rem', paddingLeft:'3rem', borderRadius:'1rem', border:'2px solid #f1f5f9', backgroundColor:'#ffffff', boxShadow:'0 1px 2px 0 rgba(0,0,0,0.05)', fontSize:'inherit', fontWeight:'inherit' })}
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
                  <th className="p-4 font-black text-slate-600 text-sm">建立 PDF</th>
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
                        <td className="p-4">
                          <button
                            onClick={(e) => handleGeneratePDF(e, item)}
                            disabled={pdfGeneratingId !== null}
                            style={wpBtn({
                            display:'inline-flex', alignItems:'center', gap:'0.25rem',
                            paddingLeft:'0.5rem', paddingRight:'0.5rem', paddingTop:'0.25rem', paddingBottom:'0.25rem',
                            borderRadius:'0.5rem', fontSize:'0.75rem', fontWeight:'700',
                            backgroundColor:'#7c3aed', color:'#ffffff',
                            opacity: pdfGeneratingId !== null ? 0.7 : 1,
                            })}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-violet-600 text-white text-xs font-bold rounded-lg hover:bg-violet-700 transition-colors disabled:cursor-not-allowed"
                          >
                            {pdfGeneratingId === item.id ? <Loader2 size={12} className="animate-spin" /> : <FileText size={12} />}
                            {pdfGeneratingId === item.id ? '生成中' : '建立 PDF'}
                          </button>
                        </td>
                        </tr>
                    );
                })}
                {assessments.length === 0 && (
                    <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400 font-bold">
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
