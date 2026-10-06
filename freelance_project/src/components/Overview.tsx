// src/components/Overview.tsx
import React, { useState, useEffect } from 'react';
import { fmtINR, balanceOf, stageOf, projectStats } from '../utils/helpers';

interface OverviewProps {
  cases: any[];
  projects: any[];
  profile: any;
  setActiveTab: (tab: string) => void;
  setSelectedCaseId: (id: number) => void;
  setSelectedProject: (id: string) => void;
  openAddClientModal: () => void;
}

export const Overview: React.FC<OverviewProps> = ({ cases, projects, profile, setActiveTab, setSelectedCaseId, setSelectedProject }) => {
  const [showValues, setShowValues] = useState(false);
  const [isPieHovered, setIsPieHovered] = useState(false);
  
  // 🔴 Live Clock state for real-time running time
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalValue = cases.reduce((s, c) => s + (c.plot?.totalValue || 0), 0);
  const collected = cases.reduce((s, c) => s + (c.payments ? c.payments.reduce((acc: number, p: any) => acc + p.amount, 0) : 0), 0);
  const pending = totalValue - collected;
  const rate = totalValue ? Math.round((collected / totalValue) * 100) : 0;
  const pendingRate = 100 - rate;

  const stages: any = { grace: 0, sms: 0, wa: 0, voice: 0, escalated: 0, paid: 0, ontrack: 0 };
  cases.forEach(c => { stages[stageOf(c).key]++; });
  const recent = cases.slice(0, 5);

  const currentHour = currentTime.getHours();
  let greeting = "Good Evening";
  if (currentHour < 12) greeting = "Good Morning";
  else if (currentHour < 17) greeting = "Good Afternoon";

  const ownerName = profile?.owner_name || "";

  const displayVal = (val: number, isCurrency = true) => {
    if (!showValues) return '••••••';
    return isCurrency ? fmtINR(val) : `${val}%`;
  };

  const colorRecovered = '#758A78'; 
  const colorPending = '#EAE7DE';   
  const statColor = '#0D3613';

  // Format date and running time cleanly
  const formattedDate = currentTime.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  const formattedTime = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  return (
    <div style={{ backgroundColor: '#FEFCF6', minHeight: '100%', paddingBottom: '30px' }}>
      <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>{greeting}, {ownerName}</h1>
          {/* 🔴 Sirf Day, Date aur Live Current Time dikhega, company name aur clients hata diye gaye hain */}
          <p style={{ color: '#0D3613', fontWeight: 600,marginLeft:10 }}>
            {formattedDate} &middot; <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{formattedTime}</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn" 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', background: '#EAE7DE', color: '#333', borderRadius: '8px' }} 
            onClick={() => setShowValues(!showValues)}
            title={showValues ? 'Hide Stats' : 'Show Stats'}
          >
            {showValues ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            )}
          </button>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="lbl">Total Portfolio Value</div>
          <div className="val" style={{ color: statColor }}>{displayVal(totalValue)}</div>
          <div className="sub">{cases.length} plots tracked</div>
        </div>
        <div className="stat-card">
          <div className="lbl">Recovered</div>
          <div className="val" style={{ color: statColor }}>{displayVal(collected)}</div>
          <div className="sub">all-time collected</div>
        </div>
        <div className="stat-card">
          <div className="lbl">Pending Recovery</div>
          <div className="val" style={{ color: statColor }}>{displayVal(pending)}</div>
          <div className="sub">{stages.sms + stages.wa + stages.voice + stages.escalated} clients in reminder cycle</div>
        </div>
        <div className="stat-card">
          <div className="lbl">Recovery Rate</div>
          <div className="val" style={{ color: statColor }}>{displayVal(rate, false)}</div>
          <div className="sub">of portfolio value</div>
        </div>
      </div>

      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>

        <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <h3>Escalation Funnel</h3>
          <div className="card-sub">Where clients currently stand in the reminder cycle</div>
          <div style={{ flexGrow: 1, marginTop: '10px' }}>
            {funnelRow('Grace Period (Day 0–10)', stages.grace + stages.ontrack, cases.length, 'blue')}
            {funnelRow('SMS Reminder (Day 11–12)', stages.sms, cases.length, 'orange')}
            {funnelRow('WhatsApp Reminder (Day 13–14)', stages.wa, cases.length, 'orange')}
            {funnelRow('Escalated to Staff (Day 15+)', stages.escalated + stages.voice, cases.length, 'red')}
            {funnelRow('Fully Paid', stages.paid, cases.length, 'green')}
          </div>
        </div>

        <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ width: '100%', textAlign: 'left' }}>Portfolio Breakdown</h3>
          <div className="card-sub" style={{ width: '100%', textAlign: 'left' }}>Hover over the chart to see amounts</div>

          <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            <div 
              onMouseEnter={() => setIsPieHovered(true)}
              onMouseLeave={() => setIsPieHovered(false)}
              style={{
                 width: '210px', 
                 height: '210px', 
                 borderRadius: '50%',
                 background: totalValue === 0 ? '#eef0f7' : `conic-gradient(${colorRecovered} 0% ${rate}%, ${colorPending} ${rate}% 100%)`,
                 position: 'relative', 
                 display: 'flex', 
                 alignItems: 'center', 
                 justifyContent: 'center',
                 boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                 cursor: 'pointer',
                 transition: 'all 0.3s ease'
              }}
            >
               <div style={{ 
                  width: '150px', 
                  height: '150px', 
                  background: '#fff', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  padding: '10px',
                  textAlign: 'center',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
               }}>
                  {isPieHovered ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div>
                        <div style={{ fontSize: '10px', color: '#888', fontWeight: 600, textTransform: 'uppercase' }}>Collected</div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: colorRecovered }}>{fmtINR(collected)}</div>
                      </div>
                      <div style={{ width: '80%', height: '1px', background: '#eef0f7', margin: '0 auto' }}></div>
                      <div>
                        <div style={{ fontSize: '10px', color: '#888', fontWeight: 600, textTransform: 'uppercase' }}>Pending</div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#333' }}>{fmtINR(pending)}</div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span style={{ fontSize: '28px', fontWeight: '800', color: colorRecovered }}>
                        {rate}%
                      </span>
                      <span style={{ fontSize: '12px', color: '#888', fontWeight: '600' }}>RECOVERED</span>
                    </>
                  )}
               </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', width: '100%', justifyContent: 'center', marginTop: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: colorRecovered }}></div>
              <b>Recovered</b> ({rate}%)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: colorPending }}></div>
              <b>Pending</b> ({pendingRate}%)
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <h3>Projects Snapshot</h3>
          <div className="card-sub">Click a project to view its clients</div>

          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', marginTop: '15px' }}>
            <div style={{ overflowY: 'auto', maxHeight: '350px', paddingRight: '5px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {projects.map((p: any) => {
                const s = projectStats(cases, p.id);
                return (
                  <div 
                    key={p.id} 
                    className="proj-tab" 
                    style={{ 
                      padding: '12px 16px', 
                      background: '#fff', 
                      border: '1px solid #eef0f7', 
                      borderRadius: '10px', 
                      cursor: 'pointer', 
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => { setSelectedProject(p.id); setActiveTab('clients'); }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#f5f7fa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#041936' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14.5px', color: '#333' }}>{p.name}</div>
                        <div style={{ fontSize: '11.5px', color: '#888', marginTop: '2px' }}>Manage clients & recovery</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="pt-count" style={{ fontSize: '12px', color: '#041936', background: '#eef0f7', padding: '4px 10px', borderRadius: '20px', fontWeight: 600 }}>
                        {s.count} clients
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <h3>Recent Cases</h3>
          <div className="card-sub">Latest recovery activity</div>
          <div style={{ flexGrow: 1, marginTop: '10px' }}>
            {recent.map((c: any) => {
              const st = stageOf(c);
              return (
                <div 
                  key={c.id} 
                  style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #f0f1f6', cursor: 'pointer' }}
                  onClick={() => { setSelectedCaseId(c.id); setActiveTab('case-detail'); }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13.5px' }}>{c.plot?.plotNumber} · {c.buyer?.name}</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--muted)' }}>{c.plot?.project}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span dangerouslySetInnerHTML={{ __html: `<span class="badge b-${st.color}">${st.label}</span>` }} />
                    <div style={{ fontSize: '12px', marginTop: '4px', fontWeight: 600 }}>{fmtINR(balanceOf(c))} due</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
};

function funnelRow(label: string, count: number, total: number, color: string) {
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '5px' }}>
        <span>{label}</span>
        <b>{count}</b>
      </div>
      <div style={{ background: '#eef0f7', borderRadius: '6px', height: '7px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, background: color === 'blue' ? '#041936' : `var(--${color})`, height: '100%', transition: 'width 0.5s ease-in-out' }}></div>
      </div>
    </div>
  );
}