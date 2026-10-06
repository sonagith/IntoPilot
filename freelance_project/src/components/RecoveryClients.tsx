// src/components/RecoveryClients.tsx
import React, { useState, useEffect } from 'react';
import { Download, FileDown } from 'lucide-react'; 
import { fmtINR, balanceOf, overdueDays, stageOf, statusBadge, badge, paginate } from '../utils/helpers';
import { fetchSettingsData } from '../services/api';

interface RecoveryClientsProps {
  cases: any[];
  projects: any[];
  selectedProject: string;
  setSelectedProject: (id: string) => void;
  setSelectedCaseId: (id: number) => void;
  setActiveTab: (tab: string) => void;
  openAddClientModal: () => void;
}

export const RecoveryClients: React.FC<RecoveryClientsProps> = ({
  cases,
  projects,
  selectedProject,
  setSelectedProject,
  setSelectedCaseId,
  setActiveTab,
  openAddClientModal
}) => {
  const [clientPage, setClientPage] = useState<number>(1);
  const [searchQ, setSearchQ] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isBtnHovered, setIsBtnHovered] = useState(false); 
  
  const [showExportMenu, setShowExportMenu] = useState(false);

  const [automationSettings, setAutomationSettings] = useState({
    sms_day: 11,
    wa_day: 13,
    escalate_day: 16
  });

  useEffect(() => {
    const getSettings = async () => {
      try {
        const data = await fetchSettingsData();
        if (data && data.status === 'success' && data.automation) {
          setAutomationSettings(data.automation);
        }
      } catch (error) {
        console.error("Failed to fetch settings", error);
      }
    };
    getSettings();
  }, []);

  const proj = projects.find((p: any) => p.id === selectedProject) || projects[0] || { name: 'Unknown Project' };
  
  let list = cases.filter((c: any) => c.projectId === selectedProject).filter((c: any) => {
    const q = searchQ.toLowerCase();
    const matchQ = !q || c.buyer?.name?.toLowerCase().includes(q) || c.plot?.plotNumber?.toLowerCase().includes(q) || c.code?.toLowerCase().includes(q);
    const matchS = filterStatus === 'all' || c.status === filterStatus;
    return matchQ && matchS;
  });

  const pg = paginate(list, clientPage, 20);

  const btnColor = '#758A78';
  const btnHoverColor = '#5c6e5e';

  const graceEnd = automationSettings.sms_day > 0 ? automationSettings.sms_day - 1 : 10;

  const handleExportCSV = (excludeCash: boolean = false) => {
    const projectCases = cases.filter((c: any) => c.projectId === selectedProject);
    
    if (projectCases.length === 0) {
      alert("No clients found in this project to export.");
      return;
    }

    const headers = [
      "Case ID", "Status", "Buyer Name", "Phone", "Email", "Address",
      "Plot Number", "Booking Date", "Agreement No", "Extent (SqFt)", "Rate/SqFt", "Total Plot Value",
      "Total DP", "Installment Amount", "Next Due Date", "Due Balance", "Overdue Days",
      "Payment S.No", "Payment Date", "Payment Amount", "Payment Mode/Bank", "Cheque / RTGS No", "Payment Remark", "Received By"
    ];
    
    const rows = projectCases.flatMap((c: any) => {
      const bal = balanceOf(c);
      const od = overdueDays(c);
      
      const baseData = [
        c.code || "—",
        c.status ? c.status.toUpperCase() : "—",
        c.buyer?.name || "—",
        c.buyer?.phone || "—",
        c.buyer?.email || "—",
        c.buyer?.address || "—",
        c.plot?.plotNumber || "—",
        c.plot?.bookingDate || "—",
        c.plot?.agreementNo || "—",
        c.plot?.extentSqft || 0,
        c.plot?.ratePerSqft || 0,
        c.plot?.totalValue || 0,
        c.totalDp || 0,
        c.installmentAmount ? Math.round(c.installmentAmount) : 0,
        c.dueDate || "—",
        bal || 0,
        od && od > 0 ? od : 0
      ];

      let payments = c.payments || [];
      if (excludeCash) {
        payments = payments.filter((p: any) => {
          const bankName = (p.bankName || "").toLowerCase();
          const remark = (p.remark || "").toLowerCase();
          return !bankName.includes("cash") && !remark.includes("cash");
        });
      }

      if (payments.length > 0) {
        return payments.map((p: any) => {
          const paymentData = [
            p.rn || "—",
            p.date || "—",
            p.amount || 0,
            p.bankName || "—", 
            p.chNo || "—",
            p.remark || "—",
            p.bookedBy || "—"
          ];
          return [...baseData, ...paymentData].map(val => `"${String(val).replace(/"/g, '""')}"`).join(",");
        });
      } else {
        const noPaymentData = ["—", "—", 0, "—", "—", "—", "—"];
        return [[...baseData, ...noPaymentData].map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")];
      }
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    
    const fileSuffix = excludeCash ? "_No_Cash_Data.csv" : "_Complete_Data.csv";
    link.setAttribute("download", `${proj.name.replace(/\s+/g, '_')}${fileSuffix}`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Recovery Clients</h1>
          <p>{cases.length} clients total &middot; viewing {proj.name}</p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          
          <div 
            style={{ position: 'relative' }} 
            onMouseLeave={() => setShowExportMenu(false)}
          >
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '6px', 
                backgroundColor: '#fff', border: `1px solid ${btnColor}`, 
                color: btnColor, padding: '10px 16px', borderRadius: '8px', 
                cursor: 'pointer', fontWeight: 600, fontSize: '14px'
              }}
            >
              <Download size={16} /> Export ▼
            </button>

            {showExportMenu && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: '6px',
                backgroundColor: '#fff', border: '1px solid #e5e7eb',
                borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                minWidth: '180px', zIndex: 10, display: 'flex', flexDirection: 'column',
                overflow: 'hidden'
              }}>
                <button 
                  onClick={() => { handleExportCSV(false); setShowExportMenu(false); }}
                  style={{
                    padding: '12px 14px', textAlign: 'left', background: 'none', 
                    border: 'none', borderBottom: '1px solid #f3f4f6', cursor: 'pointer',
                    fontSize: '13.5px', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Download size={14} /> Export All
                </button>
                <button 
                  onClick={() => { handleExportCSV(true); setShowExportMenu(false); }}
                  style={{
                    padding: '12px 14px', textAlign: 'left', background: 'none', 
                    border: 'none', cursor: 'pointer',
                    fontSize: '13.5px', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <FileDown size={14} /> Export (No Cash)
                </button>
              </div>
            )}
          </div>

          <button 
            onClick={openAddClientModal}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '6px', 
              backgroundColor: isBtnHovered ? btnHoverColor : btnColor, 
              color: '#fff', border: 'none', padding: '10px 16px', 
              borderRadius: '8px', cursor: 'pointer', fontWeight: 600, 
              fontSize: '14px', transition: 'background 0.2s ease'
            }}
            onMouseEnter={() => setIsBtnHovered(true)}
            onMouseLeave={() => setIsBtnHovered(false)}
          >
            + Add New Client
          </button>
        </div>
      </div>

      <div className="proj-tabs">
        {projects.map((p: any) => {
          const count = cases.filter((c: any) => c.projectId === p.id).length;
          return (
            <div 
              key={p.id} 
              className={`proj-tab ${selectedProject === p.id ? 'active' : ''}`}
              onClick={() => { setSelectedProject(p.id); setClientPage(1); }}
            >
              <span>{p.name}</span>
              <span className="pt-count">{count} clients</span>
            </div>
          );
        })}
      </div>

      <div className="card" style={{ background: '#f0fdf4', borderColor: '#bbf7d0', marginBottom: '20px' }}>
        <b style={{ fontSize: '13px', color: '#15803d' }}>Reminder rule:</b>
        <span style={{ fontSize: '13px', color: '#166534', marginLeft: '6px' }}> 
          Day {automationSettings.sms_day} &rarr; SMS &nbsp;&middot;&nbsp; 
          Day {automationSettings.wa_day} &rarr; WhatsApp &nbsp;&middot;&nbsp; 
          
          Day {automationSettings.escalate_day}+ &rarr; Escalated to recovery staff.
        </span>
      </div>

      <div className="search-row">
        <input 
          id="search-box" 
          placeholder="Search by client name, plot number or case ID..." 
          value={searchQ} 
          onChange={(e) => { setSearchQ(e.target.value); setClientPage(1); }} 
        />
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setClientPage(1); }}>
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      <div style={{ fontSize: '12.5px', color: 'var(--muted)', marginBottom: '10px' }}>
        Showing {pg.rows.length} of {pg.total} clients in {proj.name}
      </div>

      {pg.rows.map((c: any) => {
        const st = stageOf(c);
        const bal = balanceOf(c);
        const od = overdueDays(c);
        
        // 🔴 UPDATED: 6 Steps added with Email and AI Voice (short names for small cards)
        const steps = [
          { label: 'Grace', day: `Day 0-${graceEnd}` },
          { label: 'SMS', day: `Day ${automationSettings.sms_day}` },
          { label: 'WhatsApp', day: `Day ${automationSettings.wa_day}` },
          { label: 'Escalated', day: `Day ${automationSettings.escalate_day}+` }
        ];
        
        // 🔴 UPDATED: Status Index Map adjusted for 6 items
        const stepIdx = { ontrack: 0, grace: 0, sms: 1, wa: 2,  escalated: 3, paid: 4 }[st.key] ?? 0;

        return (
          <div 
            key={c.id} 
            className="case-card" 
            onClick={() => { setSelectedCaseId(c.id); setActiveTab('case-detail'); }}
          >
            <div className="case-top">
              <div>
                <div className="case-id">
                  {c.code} &middot; <span dangerouslySetInnerHTML={{ __html: statusBadge(c.status) }} /> <span dangerouslySetInnerHTML={{ __html: badge(st.label, st.color) }} />
                </div>
                <div className="case-name">{c.buyer?.name}</div>
              </div>
              <div>
                <div className="case-amt">{fmtINR(bal)}</div>
                <div className="case-amt-sub">{bal <= 0 ? 'fully recovered' : (od && od > 0 ? `${od}d overdue` : 'not yet due')}</div>
              </div>
            </div>

            {/* 🔴 Added overflowX for horizontal scrolling if items get squished */}
            <div className="stepper" style={{ overflowX: 'auto', paddingBottom: '8px' }}>
              {steps.map((s, i) => {
                const idx = i + 1;
                const cls = idx < stepIdx + 1 ? 'done' : (idx === stepIdx + 1 ? 'current' : '');
                return (
                  <div key={i} className={`step ${cls}`} style={{ minWidth: '75px' }}>
                    <div className="step-line"></div>
                    <div className="step-dot">{idx < stepIdx + 1 ? '✓' : idx}</div>
                    <div className="step-label" style={{ fontSize: '11px' }}>{s.label}</div>
                    <div className="step-day" style={{ fontSize: '10px' }}>{s.day}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {pg.totalPages > 1 && (
        <div className="pager">
          <button disabled={clientPage <= 1} onClick={() => setClientPage(clientPage - 1)}>&larr; Prev</button>
          <span>Page {clientPage} of {pg.totalPages}</span>
          <button disabled={clientPage >= pg.totalPages} onClick={() => setClientPage(clientPage + 1)}>Next &rarr;</button>
        </div>
      )}
    </div>
  );
};