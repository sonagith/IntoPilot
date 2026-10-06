// src/components/CaseDetail.tsx
import React, { useState, useEffect } from 'react';
import { fmtINR, fmtDate, totalPaid, balanceOf, overdueDays, stageOf, statusBadge, badge } from '../utils/helpers';
import { Eye } from 'lucide-react'; 
import { PlotInfoCard } from './PlotInfoCard'; 
import { BookingCommissionCard } from './BookingCommissionCard';
import { BuyerKYCCard } from './BuyerKYCCard';
import { AssignedStaffCard } from './AssignedStaffCard';
import { fetchSettingsData, API_URL } from '../services/api'; 
import { ClientNotesCard } from './ClientNotesCard'; 

const getFullFileUrl = (url: string) => {
  if (!url || url === '—') return '#';
  if (url.startsWith('http')) return url;
  if (!url.startsWith('/')) url = '/' + url;
  return `${API_URL}${url}`;
};

interface CaseDetailProps {
  cases: any[];
  caseId: number;
  setActiveTab: (tab: string) => void;
  openAddPaymentModal: (id: number) => void;
  onRefresh: () => void;
}

export const CaseDetail: React.FC<CaseDetailProps> = ({ cases, caseId, setActiveTab, openAddPaymentModal, onRefresh }) => {
  const [autoSettings, setAutoSettings] = useState({
    sms_day: 11,
    wa_day: 13,
    escalate_day: 16
  });

  useEffect(() => {
    const getSettings = async () => {
      try {
        const data = await fetchSettingsData();
        if (data && data.status === 'success' && data.automation) {
          setAutoSettings(data.automation);
        }
      } catch (err) {
        console.error("Failed to fetch settings", err);
      }
    };
    getSettings();
  }, []);

  const c = cases.find((item: any) => Number(item.id) === Number(caseId));

  if (!c) {
    return (
      <div className="empty" style={{ textAlign: 'center', padding: '50px', color: 'var(--muted)' }}>
        Client not found. <button onClick={() => setActiveTab('clients')} style={{ color: 'var(--blue)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' }}>Back to list</button>
      </div>
    );
  }

  const st = stageOf(c);
  const bal = balanceOf(c);
  const od = overdueDays(c);

  const graceEnd = autoSettings.sms_day > 0 ? autoSettings.sms_day - 1 : 10;
  
  // 🔴 UPDATED: Stepper mein 2 nayi static fields add kar di hain
  const steps = [
    { label: 'Grace Period', day: `Day 0-${graceEnd}` },
    { label: 'SMS Reminder', day: `Day ${autoSettings.sms_day}` },
    { label: 'WhatsApp Reminder', day: `Day ${autoSettings.wa_day}` },
    
    { label: 'Staff Escalation', day: `Day ${autoSettings.escalate_day}+` }
  ];
  
  // 🔴 UPDATED: Index mapping taaki naye steps theek se highlight ho
  const stepIdx = { ontrack: 0, grace: 0, sms: 1, wa: 2,  escalated: 3, paid: 4 }[st.key] ?? 0;

  let running = c.plot?.totalValue || 0;
  const ledgerRows = (c.payments || []).map((p: any) => {
    running -= p.amount;
    return { ...p, balance: running };
  });

  return (
    <div style={{ color: '#0D3613' }}>
      <button className="btn btn-outline btn-sm" onClick={() => setActiveTab('clients')} style={{ marginBottom: '14px', color: '#0D3613', borderColor: '#0D3613' }}>
        &larr; Back to Recovery Clients
      </button>

      <div className="page-head">
        <div>
          <div style={{ fontSize: '11.5px', color: 'var(--muted)', fontWeight: 700 }}>{c.code}</div>
          <h1 style={{ marginTop: '2px', color: '#0D3613' }}>{c.buyer?.name}</h1>
          <p style={{ color: '#0D3613' }}>
            {c.plot?.plotNumber} &middot; {c.plot?.project} &nbsp;
            <span dangerouslySetInnerHTML={{ __html: statusBadge(c.status) }} /> <span dangerouslySetInnerHTML={{ __html: badge(st.label, st.color) }} />
          </p>
        </div>
        <button className="btn btn-navy" onClick={() => openAddPaymentModal(c.id)}>+ Record Payment</button>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card">
          <div className="lbl" style={{ color: '#0D3613' }}>Total Plot Value</div>
          <div className="val" style={{ color: '#0D3613' }}>{fmtINR(c.plot?.totalValue || 0)}</div>
        </div>
        <div className="stat-card">
          <div className="lbl" style={{ color: '#0D3613' }}>Paid Till Date</div>
          <div className="val" style={{ color: 'var(--green)' }}>{fmtINR(totalPaid(c))}</div>
        </div>
        <div className="stat-card">
          <div className="lbl" style={{ color: '#0D3613' }}>Balance Due</div>
          <div className="val" style={{ color: bal > 0 ? 'var(--orange)' : 'var(--green)' }}>{fmtINR(bal)}</div>
        </div>
        <div className="stat-card">
          <div className="lbl" style={{ color: '#0D3613' }}>Next Due Date</div>
          <div className="val" style={{ fontSize: '18px', color: '#0D3613' }}>{c.dueDate ? fmtDate(c.dueDate) : '—'}</div>
          <div className="sub" style={{ color: '#0D3613' }}>{c.installmentAmount ? `${fmtINR(c.installmentAmount)} installment${od && od > 0 ? ` · ${od}d overdue` : ''}` : 'no dues pending'}</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ color: '#0D3613' }}>Reminder &amp; Escalation Timeline</h3>
        <div className="card-sub" style={{ color: '#0D3613' }}>
          {st.key === 'paid' ? 'No outstanding balance.' : (od !== null ? `${od} day(s) since due date — current stage: ${st.label}` : 'Next installment not yet due.')}
        </div>
        <div className="stepper" style={{ overflowX: 'auto', paddingBottom: '10px' }}>
          {steps.map((s, i) => {
            const idx = i + 1;
            const cls = idx < stepIdx + 1 ? 'done' : (idx === stepIdx + 1 ? 'current' : '');
            return (
              <div key={i} className={`step ${cls}`} style={{ minWidth: '120px' }}>
                <div className="step-line"></div>
                <div className="step-dot">{idx < stepIdx + 1 ? '✓' : idx}</div>
                <div className="step-label" style={{ color: '#0D3613', fontSize: '12px' }}>{s.label}</div>
                <div className="step-day" style={{ fontSize: '11px' }}>{s.day}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid-2">
        {/* ================= LEFT COLUMN ================= */}
        <div>
         <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div>
                <h3 style={{ marginBottom: '2px', color: '#0D3613' }}>Payment History</h3>
                <div className="card-sub" style={{ color: '#0D3613' }}>All receipts recorded against this plot</div>
              </div>
              <button className="btn btn-sm btn-navy" onClick={() => openAddPaymentModal(c.id)}>+ Add Payment</button>
            </div>
            
            {/* 🔴 OVERFLOW AND ALIGNMENT FIX APPLIED HERE */}
            <div className="table-wrap" style={{ overflowX: 'auto' }}>
              <table style={{ color: '#0D3613', width: '100%', minWidth: '600px' }}>
                <thead>
                  <tr style={{ whiteSpace: 'nowrap', textAlign: 'left' }}>
                    <th style={{ color: '#0D3613', padding: '12px 8px' }}>S. No.</th>
                    {/* 👇 In teeno columns me padding 8px se badhakar 24px kar di hai */}
                    <th style={{ color: '#0D3613', padding: '12px 15px' }}>Date</th>
                    <th style={{ color: '#0D3613', padding: '12px 15px' }}>Amount</th>
                    <th style={{ color: '#0D3613', padding: '12px 15px' }}>Ch / RTGS No</th>
                    <th style={{ color: '#0D3613', padding: '12px 8px' }}>Bank Name</th>
                    <th style={{ color: '#0D3613', padding: '12px 8px' }}>Remark</th>
                    <th style={{ color: '#0D3613', padding: '12px 8px', textAlign: 'center' }}>Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {(c.payments || []).map((p: any) => (
                    <tr key={p.rn}>
                      <td style={{ padding: '12px 8px' }}>{p.rn}</td>
                      {/* 👇 Same padding update in table data (td) */}
                      <td style={{ padding: '12px 15px', whiteSpace: 'nowrap' }}>{fmtDate(p.date)}</td>
                      <td style={{ fontWeight: 600, padding: '12px 15px', whiteSpace: 'nowrap' }}>{fmtINR(p.amount)}</td>
                      <td style={{ padding: '12px 15px' }}>{p.chNo || '—'}</td>
                      <td style={{ padding: '12px 8px' }}>{p.bankName || '—'}</td>
                      
                      {/* 🔴 ELLIPSIS FIX WITH MAX-WIDTH */}
                      <td 
                        title={p.remark} 
                        style={{ 
                          padding: '12px 8px',
                          maxWidth: '120px', 
                          whiteSpace: 'nowrap', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis' 
                        }}
                      >
                        {p.remark}
                      </td>
                      
                      <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                        {p.receiptUrl ? (
                          <a 
                            href={getFullFileUrl(p.receiptUrl)} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={{ 
                              color: '#0D3613', 
                              display: 'inline-flex', 
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '6px',
                              borderRadius: '4px',
                              background: '#f4f5f9'
                            }}
                            title="View Receipt"
                          >
                            <Eye size={16} />
                          </a>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <h3 style={{ color: '#0D3613' }}>Total Payment Ledger</h3>
            <div className="card-sub" style={{ color: '#0D3613' }}>Running balance against total plot value {fmtINR(c.plot?.totalValue || 0)}</div>
            <div className="table-wrap" style={{ overflowX: 'auto' }}>
              <table style={{ color: '#0D3613', width: '100%', minWidth: '500px' }}>
                <thead>
                  <tr style={{ whiteSpace: 'nowrap' }}>
                    <th style={{ color: '#0D3613', padding: '12px 8px' }}>S. No.</th>
                    <th style={{ color: '#0D3613', padding: '12px 8px' }}>Date</th>
                    <th style={{ color: '#0D3613', padding: '12px 8px' }}>Amount</th>
                    <th style={{ color: '#0D3613', padding: '12px 8px' }}>Ch / RTGS No</th>
                    <th style={{ color: '#0D3613', padding: '12px 8px' }}>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {ledgerRows.map((r: any) => (
                    <tr key={r.rn}>
                      <td style={{ padding: '12px 8px' }}>{r.rn}</td>
                      <td style={{ padding: '12px 8px', whiteSpace: 'nowrap' }}>{fmtDate(r.date)}</td>
                      <td style={{ padding: '12px 8px', whiteSpace: 'nowrap' }}>{fmtINR(r.amount)}</td>
                      <td style={{ padding: '12px 8px' }}>{r.chNo}</td>
                      <td style={{ padding: '12px 8px' }}><b style={{ color: '#0D3613' }}>{fmtINR(r.balance)}</b></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
           <div style={{ marginBottom: '20px' }}>
             <ClientNotesCard caseData={c} />
          </div>

          <div className="card">
            <h3 style={{ color: '#0D3613' }}>Activity Timeline</h3>
            <div className="card-sub" style={{ color: '#0D3613' }}>Full audit trail for this recovery case</div>
            {(c.activity || []).length > 0 ? (
              [...c.activity].map((a: any, i: number) => (
                <div key={i} className="timeline-item" style={{ display: 'flex', gap: '12px', padding: '10px 0', borderBottom: '1px solid #f4f5f9' }}>
                  <div className="t-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--blue)', marginTop: '5px' }}></div>
                  <div>
                    <div className="t-title" style={{ fontWeight: 600, fontSize: '13.5px', color: '#0D3613' }}>{a.title}</div>
                    <div className="t-desc" style={{ fontSize: '12.5px', color: '#0D3613' }}>{a.desc}</div>
                    <div className="t-date" style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>{fmtDate(a.date)}</div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: 'var(--muted)', fontSize: '13px', padding: '10px 0' }}>No activity recorded yet.</div>
            )}
          </div>
        </div>

        {/* ================= RIGHT COLUMN ================= */}
        <div>
          <div style={{ marginBottom: '20px' }}>
            <PlotInfoCard caseData={c} onRefresh={onRefresh} />
          </div>
          <div style={{ marginBottom: '20px' }}>
             <BookingCommissionCard caseData={c} onRefresh={onRefresh} />
          </div>
          <div style={{ marginBottom: '20px' }}>
             <BuyerKYCCard caseData={c} onRefresh={onRefresh} />
          </div>
          <div style={{ marginBottom: '20px' }}>
             <AssignedStaffCard caseData={c} onRefresh={onRefresh} />
          </div>
          <div className="card" style={{ background: '#fdfbf7', borderColor: '#fef3c7', marginBottom: '20px' }}>
            <h3 style={{ color: '#0D3613' }}>Statutory Notes</h3>
            <div className="card-sub" style={{ color: '#0D3613' }}>Applicable to plot sale agreements in India</div>
            <div className="esc-note" style={{ fontSize: '12px', lineHeight: '1.6', color: '#0D3613' }}>
              &bull; Stamp duty &amp; registration charges as per state rates, payable at registration.<br/>
              &bull; GST applies only on under-construction/development agreements, not ready plots.<br/>
              &bull; TDS @1% under Sec 194-IA applies if consideration exceeds ₹50 lakh.<br/>
              &bull; Verify Encumbrance Certificate &amp; RERA registration before final registration.
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};