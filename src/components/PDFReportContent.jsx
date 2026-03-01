import React, { forwardRef } from 'react';
import { formatCurrency } from '../utils';

// Narrower fixed-width layout for denser single-page export
const PDF_WIDTH = 680;

// ─── Styles ───
const s = {
  page: {
    width: PDF_WIDTH,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans TC", "Microsoft JhengHei", sans-serif',
    backgroundColor: '#ffffff',
    color: '#1e293b',
    fontSize: 12,
    lineHeight: 1.45,
  },
  // Header
  header: {
    background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 100%)',
    color: '#ffffff',
    padding: '24px 28px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: { fontSize: 22, fontWeight: 900, letterSpacing: -0.5, margin: 0, color: '#ffffff', WebkitTextFillColor: '#ffffff' },
  headerSub: { fontSize: 12, opacity: 0.8, marginTop: 4, fontWeight: 600, color: '#ffffff', WebkitTextFillColor: '#ffffff' },
  headerBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: '8px 14px',
    borderRadius: 12,
    textAlign: 'center',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  headerBadgeYear: { fontSize: 16, fontWeight: 900, letterSpacing: 1, color: '#ffffff', WebkitTextFillColor: '#ffffff' },
  headerBadgeLabel: { fontSize: 9, textTransform: 'uppercase', letterSpacing: 2, opacity: 0.7, color: '#ffffff', WebkitTextFillColor: '#ffffff' },

  // Body
  body: { padding: '20px 28px' },

  // Section
  section: { marginBottom: 18 },
  sectionTitle: {
    fontSize: 15, fontWeight: 900, color: '#1e293b',
    borderBottom: '2px solid #2563eb', paddingBottom: 6, marginBottom: 10,
    display: 'flex', alignItems: 'center', gap: 8,
  },
  sectionIcon: { display: 'inline-block', width: 5, height: 16, borderRadius: 3, marginRight: 4 },

  // Applicant info grid
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
  },
  infoCard: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: 12,
    padding: '12px 14px',
  },
  infoCardTitle: { fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 },
  infoRow: { display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f1f5f9' },
  infoLabel: { fontSize: 12, fontWeight: 600, color: '#64748b' },
  infoValue: { fontSize: 12, fontWeight: 800, color: '#1e293b' },

  // Result banner
  resultBanner: (pass) => ({
    background: pass
      ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
      : 'linear-gradient(135deg, #dc2626 0%, #f43f5e 100%)',
    color: '#ffffff',
    padding: '16px 18px',
    borderRadius: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  }),
  resultIcon: { fontSize: 32, marginRight: 10 },
  resultText: { fontSize: 18, fontWeight: 900 },
  resultSubtext: { fontSize: 11, opacity: 0.85, marginTop: 2, fontWeight: 600 },

  // Progress bar
  progressContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
    marginBottom: 4,
  },
  progressCard: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: 12,
    padding: '12px 14px',
  },
  progressLabel: { fontSize: 10, fontWeight: 800, color: '#64748b', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.8 },
  progressBarOuter: {
    width: '100%', height: 9, backgroundColor: '#e2e8f0', borderRadius: 6, overflow: 'hidden', marginBottom: 6,
  },
  progressBarInner: (pct, pass) => ({
    width: `${Math.min(pct, 100)}%`,
    height: '100%',
    backgroundColor: pct > 100 ? '#ef4444' : (pct > 85 ? '#f59e0b' : '#10b981'),
    borderRadius: 6,
    transition: 'width 0.5s',
  }),
  progressNumbers: { display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 700 },
  progressValue: { color: '#1e293b' },
  progressLimit: { color: '#94a3b8' },

  // Table
  table: { width: '100%', borderCollapse: 'separate', borderSpacing: '0 2px' },
  th: {
    textAlign: 'left', padding: '6px 8px', fontSize: 9, fontWeight: 800,
    color: '#64748b', textTransform: 'uppercase', letterSpacing: 1,
    borderBottom: '2px solid #e2e8f0',
  },
  thRight: {
    textAlign: 'right', padding: '6px 8px', fontSize: 9, fontWeight: 800,
    color: '#64748b', textTransform: 'uppercase', letterSpacing: 1,
    borderBottom: '2px solid #e2e8f0',
  },
  thCenter: {
    textAlign: 'center', padding: '6px 8px', fontSize: 9, fontWeight: 800,
    color: '#64748b', textTransform: 'uppercase', letterSpacing: 1,
    borderBottom: '2px solid #e2e8f0',
  },
  td: (even) => ({
    padding: '6px 8px', fontSize: 10, fontWeight: 600, color: '#334155',
    backgroundColor: even ? '#f8fafc' : '#ffffff',
  }),
  tdRight: (even) => ({
    padding: '6px 8px', fontSize: 10, fontWeight: 800, color: '#1e293b', textAlign: 'right',
    backgroundColor: even ? '#f8fafc' : '#ffffff',
  }),
  tdCenter: (even) => ({
    padding: '6px 8px', fontSize: 9, fontWeight: 700, textAlign: 'center',
    backgroundColor: even ? '#f8fafc' : '#ffffff',
  }),
  exemptBadge: {
    display: 'inline-block', padding: '1px 6px', borderRadius: 6,
    fontSize: 9, fontWeight: 800,
    backgroundColor: '#d1fae5', color: '#059669',
  },
  countedBadge: {
    display: 'inline-block', padding: '1px 6px', borderRadius: 6,
    fontSize: 9, fontWeight: 800,
    backgroundColor: '#fee2e2', color: '#dc2626',
  },
  exemptValue: { textDecoration: 'line-through', color: '#94a3b8' },

  // Subtotal row
  subtotalRow: {
    padding: '6px 8px', fontWeight: 900, fontSize: 10,
    backgroundColor: '#f1f5f9', borderTop: '2px solid #cbd5e1',
  },

  // Footer / Disclaimer
  disclaimer: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: 12,
    padding: '10px 12px',
    fontSize: 9,
    color: '#94a3b8',
    fontWeight: 600,
    lineHeight: 1.8,
    marginTop: 10,
  },

  // Page break hint
  pageBreak: { pageBreakBefore: 'always', marginTop: 12 },

  // Divider
  divider: { height: 1, backgroundColor: '#e2e8f0', margin: '12px 0' },
};


// ─── Helper: build flat item list for a person ───
function buildItemList(person, isMarried) {
  const items = [];
  const age = parseInt(person.age) || 0;

  // Properties
  if (person.propertyEnabled) {
    person.properties.forEach(p => {
      if (p.value > 0) {
        items.push({
          category: '物業',
          label: p.type,
          value: p.value,
          type: 'asset',
          exempt: p.type === '自住物業',
          note: p.type === '自住物業' ? '自住豁免' : '',
        });
      }
    });
  }

  // MPF
  if (person.mpfEnabled) {
    person.mpfItems.forEach(item => {
      if (item.value > 0) {
        let exempt = false;
        let note = '';
        if (item.type === '可扣稅自願性') {
          exempt = true;
          note = '法定豁免';
        } else if (item.type === '強制性供款') {
          exempt = age < 65;
          note = age < 65 ? '未滿65歲豁免' : '年滿65歲需計算';
        } else if (item.type === '自願性供款') {
          exempt = false;
          note = '需計入資產';
        } else if (item.type === '公積金') {
          exempt = item.status === '保留中';
          note = item.status === '保留中' ? '保留中豁免' : '已提取需計算';
        }
        items.push({ category: '強積金', label: `MPF - ${item.type}`, value: item.value, type: 'asset', exempt, note });
      }
    });
  }

  // General assets
  Object.entries(person.assets).forEach(([key, item]) => {
    if (item.enabled && item.value > 0) {
      items.push({ category: '一般資產', label: item.label, value: item.value, type: 'asset', exempt: false, note: '' });
    }
  });

  // Insurance
  if (person.insuranceEnabled) {
    person.insurancePolicies.forEach(p => {
      if (p.enabled && p.value > 0) {
        const exempt = p.type !== '儲蓄';
        items.push({ category: '保險', label: `保單 - ${p.type}`, value: p.value, type: 'asset', exempt, note: exempt ? '非儲蓄型豁免' : '' });
      }
    });
  }

  // Income
  Object.entries(person.income).forEach(([key, item]) => {
    if (item.enabled && item.value > 0) {
      const exempt = (key === 'policyReverse' || key === 'propertyReverse');
      items.push({ category: '每月入息', label: item.label, value: item.value, type: 'income', exempt, note: exempt ? '逆按揭豁免' : '' });
    }
  });

  return items;
}


// ─── Component ───
const PDFReportContent = forwardRef(({
  p1, p2, isMarried, p1Analysis, p2Analysis,
  totalAssets, totalIncome, currentLimit, isEligible
}, ref) => {
  const now = new Date();
  const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
  const p1Items = buildItemList(p1, isMarried);
  const p2Items = isMarried ? buildItemList(p2, isMarried) : [];
  const assetPct = currentLimit.asset > 0 ? (totalAssets / currentLimit.asset) * 100 : 0;
  const incomePct = currentLimit.income > 0 ? (totalIncome / currentLimit.income) * 100 : 0;

  const renderPersonTable = (person, items, analysisData, label) => {
    const assetItems = items.filter(i => i.type === 'asset');
    const incomeItems = items.filter(i => i.type === 'income');
    const countedAssets = assetItems.filter(i => !i.exempt).reduce((s, i) => s + i.value, 0);
    const countedIncome = incomeItems.filter(i => !i.exempt).reduce((s, i) => s + i.value, 0);

    return (
      <div style={s.section} data-pdf-section="person-breakdown">
        <div style={{ ...s.sectionTitle, borderBottomColor: '#2563eb' }}>
          <span style={{ ...s.sectionIcon, backgroundColor: '#2563eb' }} />
          {label}：{person.name}
        </div>

        {/* Asset Table */}
        {assetItems.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#2563eb', marginBottom: 8, paddingLeft: 4 }}>
              ▎資產項目
            </div>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>類別</th>
                  <th style={s.th}>項目名稱</th>
                  <th style={s.thRight}>申報金額</th>
                  <th style={s.thCenter}>審核狀態</th>
                  <th style={s.th}>備註</th>
                </tr>
              </thead>
              <tbody>
                {assetItems.map((item, i) => (
                  <tr key={i}>
                    <td style={s.td(i % 2 === 0)}>{item.category}</td>
                    <td style={s.td(i % 2 === 0)}>{item.label}</td>
                    <td style={{ ...s.tdRight(i % 2 === 0), ...(item.exempt ? s.exemptValue : {}) }}>
                      {formatCurrency(item.value)}
                    </td>
                    <td style={s.tdCenter(i % 2 === 0)}>
                      <span style={item.exempt ? s.exemptBadge : s.countedBadge}>
                        {item.exempt ? '豁免' : '計入'}
                      </span>
                    </td>
                    <td style={s.td(i % 2 === 0)}>{item.note}</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={2} style={{ ...s.subtotalRow, textAlign: 'right', paddingRight: 16 }}>
                    計入資產小計
                  </td>
                  <td style={{ ...s.subtotalRow, textAlign: 'right', paddingRight: 16, color: '#2563eb' }}>
                    {formatCurrency(countedAssets)}
                  </td>
                  <td colSpan={2} style={s.subtotalRow}></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Income Table */}
        {incomeItems.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#d97706', marginBottom: 8, paddingLeft: 4 }}>
              ▎每月收入項目
            </div>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>類別</th>
                  <th style={s.th}>項目名稱</th>
                  <th style={s.thRight}>每月金額</th>
                  <th style={s.thCenter}>審核狀態</th>
                  <th style={s.th}>備註</th>
                </tr>
              </thead>
              <tbody>
                {incomeItems.map((item, i) => (
                  <tr key={i}>
                    <td style={s.td(i % 2 === 0)}>{item.category}</td>
                    <td style={s.td(i % 2 === 0)}>{item.label}</td>
                    <td style={{ ...s.tdRight(i % 2 === 0), ...(item.exempt ? s.exemptValue : {}) }}>
                      {formatCurrency(item.value)}
                    </td>
                    <td style={s.tdCenter(i % 2 === 0)}>
                      <span style={item.exempt ? s.exemptBadge : s.countedBadge}>
                        {item.exempt ? '豁免' : '計入'}
                      </span>
                    </td>
                    <td style={s.td(i % 2 === 0)}>{item.note}</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={2} style={{ ...s.subtotalRow, textAlign: 'right', paddingRight: 16 }}>
                    計入入息小計
                  </td>
                  <td style={{ ...s.subtotalRow, textAlign: 'right', paddingRight: 16, color: '#d97706' }}>
                    {formatCurrency(countedIncome)}
                  </td>
                  <td colSpan={2} style={s.subtotalRow}></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {assetItems.length === 0 && incomeItems.length === 0 && (
          <div style={{ padding: '16px 20px', backgroundColor: '#f8fafc', borderRadius: 12, color: '#94a3b8', fontWeight: 700, fontSize: 13, textAlign: 'center' }}>
            未有申報任何資產或入息項目
          </div>
        )}
      </div>
    );
  };

  return (
    <div ref={ref} style={s.page}>
      {/* ═══ Header ═══ */}
      <div style={s.header} data-pdf-section="header">
        <div>
          <h1 style={s.headerTitle}>長者生活津貼 — 體檢報告</h1>
          <div style={s.headerSub}>Old Age Living Allowance Assessment Report</div>
          <div style={{ ...s.headerSub, marginTop: 12, opacity: 0.6 }}>
            報告日期：{dateStr}
          </div>
        </div>
        <div style={s.headerBadge}>
          <div style={s.headerBadgeLabel}>評估年度</div>
          <div style={s.headerBadgeYear}>2025/26</div>
        </div>
      </div>

      <div style={s.body}>
        {/* ═══ Applicant Info ═══ */}
        <div style={s.section} data-pdf-section="applicant-info">
          <div style={{ ...s.sectionTitle, borderBottomColor: '#0ea5e9' }}>
            <span style={{ ...s.sectionIcon, backgroundColor: '#0ea5e9' }} />
            申請人資料
          </div>
          <div style={s.infoGrid}>
            <div style={s.infoCard}>
              <div style={s.infoCardTitle}>{isMarried ? '申請人 (一)' : '申請人'}</div>
              <div style={s.infoRow}>
                <span style={s.infoLabel}>姓名</span>
                <span style={s.infoValue}>{p1.name || '—'}</span>
              </div>
              <div style={s.infoRow}>
                <span style={s.infoLabel}>年齡</span>
                <span style={s.infoValue}>{p1.age || '—'} 歲</span>
              </div>
              <div style={{ ...s.infoRow, borderBottom: 'none' }}>
                <span style={s.infoLabel}>聯絡電話</span>
                <span style={s.infoValue}>{p1.phone || '—'}</span>
              </div>
            </div>

            {isMarried ? (
              <div style={s.infoCard}>
                <div style={s.infoCardTitle}>申請人 (二) — 配偶</div>
                <div style={s.infoRow}>
                  <span style={s.infoLabel}>姓名</span>
                  <span style={s.infoValue}>{p2.name || '—'}</span>
                </div>
                <div style={s.infoRow}>
                  <span style={s.infoLabel}>年齡</span>
                  <span style={s.infoValue}>{p2.age || '—'} 歲</span>
                </div>
                <div style={{ ...s.infoRow, borderBottom: 'none' }}>
                  <span style={s.infoLabel}>聯絡電話</span>
                  <span style={s.infoValue}>{p2.phone || '—'}</span>
                </div>
              </div>
            ) : (
              <div style={{ ...s.infoCard, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>👤</div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>個人申請</div>
                  <div style={{ fontSize: 12, fontWeight: 600, marginTop: 4 }}>不適用配偶資料</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ═══ Evaluation Result ═══ */}
        <div style={s.section} data-pdf-section="evaluation-result">
          <div style={{ ...s.sectionTitle, borderBottomColor: isEligible ? '#10b981' : '#ef4444' }}>
            <span style={{ ...s.sectionIcon, backgroundColor: isEligible ? '#10b981' : '#ef4444' }} />
            評估結果
          </div>

          {/* Pass / Fail Banner */}
          <div style={s.resultBanner(isEligible)}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={s.resultIcon}>{isEligible ? '✅' : '❌'}</span>
              <div>
                <div style={s.resultText}>{isEligible ? '符合申請資格' : '未符合申請資格'}</div>
                <div style={s.resultSubtext}>
                  {p1.name}{isMarried ? ` 及 ${p2.name}` : ''} 之
                  {isMarried ? '夫婦' : '個人'}合併評估
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right', opacity: 0.9 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, opacity: 0.7 }}>審查標準</div>
              <div style={{ fontSize: 16, fontWeight: 900, marginTop: 4 }}>{isMarried ? '夫婦' : '個人'}限額</div>
            </div>
          </div>

          {/* Progress Bars */}
          <div style={s.progressContainer}>
            <div style={s.progressCard}>
              <div style={s.progressLabel}>📊 資產總額</div>
              <div style={s.progressBarOuter}>
                <div style={s.progressBarInner(assetPct)} />
              </div>
              <div style={s.progressNumbers}>
                <span style={{ ...s.progressValue, color: assetPct > 100 ? '#ef4444' : '#1e293b' }}>
                  {formatCurrency(totalAssets)}
                </span>
                <span style={s.progressLimit}>上限 {formatCurrency(currentLimit.asset)}</span>
              </div>
              <div style={{ textAlign: 'right', fontSize: 20, fontWeight: 900, color: assetPct > 100 ? '#ef4444' : (assetPct > 85 ? '#f59e0b' : '#10b981'), marginTop: 8 }}>
                {Math.round(assetPct)}%
              </div>
            </div>
            <div style={s.progressCard}>
              <div style={s.progressLabel}>💰 每月入息總額</div>
              <div style={s.progressBarOuter}>
                <div style={s.progressBarInner(incomePct)} />
              </div>
              <div style={s.progressNumbers}>
                <span style={{ ...s.progressValue, color: incomePct > 100 ? '#ef4444' : '#1e293b' }}>
                  {formatCurrency(totalIncome)}
                </span>
                <span style={s.progressLimit}>上限 {formatCurrency(currentLimit.income)}</span>
              </div>
              <div style={{ textAlign: 'right', fontSize: 20, fontWeight: 900, color: incomePct > 100 ? '#ef4444' : (incomePct > 85 ? '#f59e0b' : '#10b981'), marginTop: 8 }}>
                {Math.round(incomePct)}%
              </div>
            </div>
          </div>
        </div>

        <div style={s.divider} />

        {/* ═══ Person 1 Detailed Breakdown ═══ */}
        {renderPersonTable(p1, p1Items, p1Analysis, isMarried ? '申請人 (一)' : '申請人')}

        {/* ═══ Person 2 Detailed Breakdown ═══ */}
        {isMarried && (
          <>
            <div style={s.divider} />
            {renderPersonTable(p2, p2Items, p2Analysis, '申請人 (二) — 配偶')}
          </>
        )}

        <div style={s.divider} />

        {/* ═══ Combined Summary ═══ */}
        <div style={s.section} data-pdf-section="combined-summary">
          <div style={{ ...s.sectionTitle, borderBottomColor: '#8b5cf6' }}>
            <span style={{ ...s.sectionIcon, backgroundColor: '#8b5cf6' }} />
            合併結算
          </div>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>項目</th>
                <th style={s.thRight}>計入金額</th>
                <th style={s.thRight}>審查上限</th>
                <th style={s.thCenter}>差額</th>
                <th style={s.thCenter}>結果</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={s.td(true)}>資產總額</td>
                <td style={s.tdRight(true)}>{formatCurrency(totalAssets)}</td>
                <td style={s.tdRight(true)}>{formatCurrency(currentLimit.asset)}</td>
                <td style={{
                  ...s.tdCenter(true),
                  color: totalAssets <= currentLimit.asset ? '#10b981' : '#ef4444',
                  fontWeight: 800, fontSize: 14,
                }}>
                  {totalAssets <= currentLimit.asset ? '−' : '+'}{formatCurrency(Math.abs(currentLimit.asset - totalAssets))}
                </td>
                <td style={s.tdCenter(true)}>
                  <span style={totalAssets <= currentLimit.asset ? s.exemptBadge : s.countedBadge}>
                    {totalAssets <= currentLimit.asset ? '✓ 通過' : '✗ 超標'}
                  </span>
                </td>
              </tr>
              <tr>
                <td style={s.td(false)}>每月入息總額</td>
                <td style={s.tdRight(false)}>{formatCurrency(totalIncome)}</td>
                <td style={s.tdRight(false)}>{formatCurrency(currentLimit.income)}</td>
                <td style={{
                  ...s.tdCenter(false),
                  color: totalIncome <= currentLimit.income ? '#10b981' : '#ef4444',
                  fontWeight: 800, fontSize: 14,
                }}>
                  {totalIncome <= currentLimit.income ? '−' : '+'}{formatCurrency(Math.abs(currentLimit.income - totalIncome))}
                </td>
                <td style={s.tdCenter(false)}>
                  <span style={totalIncome <= currentLimit.income ? s.exemptBadge : s.countedBadge}>
                    {totalIncome <= currentLimit.income ? '✓ 通過' : '✗ 超標'}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ═══ Disclaimer ═══ */}
        <div style={s.disclaimer} data-pdf-section="disclaimer">
          <strong>免責聲明：</strong>本報告基於 2025/2026 年度預期政策指引生成，計算結果僅供參考。
          資產定義、豁免項目及最終申請資格以香港社會福利署之官方審核及最終決定為準。
          本報告不構成任何法律或財務建議。如有疑問，請諮詢持牌專業顧問。
          <br /><br />
          <span style={{ opacity: 0.6 }}>報告生成日期：{dateStr} ｜ 版本：v2.0</span>
        </div>
      </div>
    </div>
  );
});

PDFReportContent.displayName = 'PDFReportContent';
export default PDFReportContent;
