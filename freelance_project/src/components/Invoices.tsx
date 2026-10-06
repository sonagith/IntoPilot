// src/components/Invoices.tsx
import React, { useState } from 'react';
import { fmtINR, fmtDate, balanceOf, stageOf, overdueDays, badge, paginate } from '../utils/helpers';

interface InvoicesProps {
  cases: any[];
  projects: any[];
  setSelectedCaseId: (id: number) => void;
  setActiveTab: (tab: string) => void;
}

export const Invoices: React.FC<InvoicesProps> = ({ cases, projects, setSelectedCaseId, setActiveTab }) => {
  const [invProject, setInvProject] = useState<string>('all');
  const [invStatus, setInvStatus] = useState<string>('all');
  const [invSearch, setInvSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const perPage = 25;

  let list = cases.filter((c: any) => invProject === 'all' || c.projectId === invProject);
  list = list.filter((c: any) => {
    const stKey = stageOf(c).key;
    const st = stKey === 'paid' ? 'recovered' : ((stKey === 'escalated' || stKey === 'voice') ? 'in_progress' : 'pending');
    const matchS = invStatus === 'all' || st === invStatus;
    const q = invSearch.toLowerCase();
    const matchQ = !q || c.buyer?.name?.toLowerCase().includes(q) || c.plot?.plotNumber?.toLowerCase().includes(q) || c.code?.toLowerCase().includes(q);
    return matchS && matchQ;
  });

  const pg = paginate(list, page, perPage);

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Invoices</h1>
          <p>{cases.length} installment invoices tracked across all projects</p>
        </div>
      </div>

      <div className="search-row">
        <input 
          id="inv-search" 
          placeholder="Search invoice, client or plot number..." 
          value={invSearch} 
          onChange={(e) => { setInvSearch(e.target.value); setPage(1); }} 
        />
        <select value={invProject} onChange={(e) => { setInvProject(e.target.value); setPage(1); }}>
          <option value="all">All Projects</option>
          {projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={invStatus} onChange={(e) => { setInvStatus(e.target.value); setPage(1); }}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="recovered">Recovered</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Debtor</th>
                <th>Project</th>
                <th>Amount</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Overdue</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pg.rows.map((c: any) => {
                const bal = balanceOf(c);
                const st = stageOf(c);
                const od = overdueDays(c);
                const label = st.key === 'paid' ? ['recovered', 'green'] : ((st.key === 'escalated' || st.key === 'voice') ? ['in progress', 'orange'] : ['pending', 'blue']);
                
                const paymentsLength = c.payments ? c.payments.length : 0;
                const lastPay = paymentsLength > 0 ? c.payments[paymentsLength - 1] : { amount: 0, date: '' };

                return (
                  <tr 
                    key={c.id} 
                    className="clickable" 
                    onClick={() => { setSelectedCaseId(c.id); setActiveTab('case-detail'); }}
                  >
                    <td><b>{c.plot?.plotNumber}-INV{String(paymentsLength + 1).padStart(2, '0')}</b></td>
                    <td>
                      {c.buyer?.name}<br />
                      <span style={{ color: 'var(--muted)', fontSize: '11px' }}>{c.buyer?.email}</span>
                    </td>
                    <td>{c.plot?.project?.split(',')[0]}</td>
                    <td>{fmtINR(bal > 0 ? (c.installmentAmount || bal) : lastPay.amount)}</td>
                    <td>{fmtDate(lastPay.date)}</td>
                    <td>{c.dueDate ? fmtDate(c.dueDate) : '—'}</td>
                    <td>{od && od > 0 ? <span className="badge b-red">{od}d</span> : '—'}</td>
                    <td><span className={`badge b-${label[1]}`}>{label[0]}</span></td>
                    <td>&rarr;</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {pg.totalPages > 1 && (
        <div className="pager">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>&larr; Prev</button>
          <span>Page {page} of {pg.totalPages}</span>
          <button disabled={page >= pg.totalPages} onClick={() => setPage(page + 1)}>Next &rarr;</button>
        </div>
      )}
    </div>
  );
};