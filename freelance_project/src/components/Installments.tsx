// src/components/Installments.tsx
import React, { useState, useEffect } from 'react';
import { fmtINR, fmtDate, overdueDays, paginate } from '../utils/helpers';
import { Calendar, Settings, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchTemplatesAPI, updateTemplateAPI, addPlaceholderAPI } from '../services/api';

interface InstallmentsProps {
  cases: any[];
  projects: any[];
  setSelectedCaseId: (id: number) => void;
  setActiveTab: (tab: string) => void;
}

// Premium UI Styles for Forms
const premiumInput = {
  width: '100%', padding: '12px 16px', borderRadius: '8px', 
  border: '1px solid #d1d5db', backgroundColor: '#f9fafb',
  fontSize: '14px', outline: 'none', transition: 'all 0.2s',
  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)',
  fontFamily: 'inherit', marginBottom: '8px'
};

const premiumTextarea = {
  ...premiumInput, minHeight: '140px', resize: 'vertical' as any, lineHeight: '1.5'
};

export const Installments: React.FC<InstallmentsProps> = ({ cases, projects, setSelectedCaseId, setActiveTab }) => {
  const [subTab, setSubTab] = useState<'plans' | 'templates'>('plans');
  const [instProject, setInstProject] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const perPage = 30;

  const [templates, setTemplates] = useState<any[]>([]);
  const [placeholders, setPlaceholders] = useState<any[]>([]);
  const [previewData, setPreviewData] = useState<{subject: string, body: string} | null>(null);
  const [isPhModalOpen, setIsPhModalOpen] = useState(false);

  const loadTemplatesData = () => {
    fetchTemplatesAPI().then(res => {
      if (res.status === 'success') {
        setTemplates(res.templates || []);
        setPlaceholders(res.placeholders || []); 
      }
    }).catch(() => toast.error('Failed to load templates'));
  };

  useEffect(() => {
    if (subTab === 'templates') loadTemplatesData();
  }, [subTab]);

  const handleTemplateChange = (key: string, field: string, value: any) => {
    setTemplates(templates.map(t => t.template_key === key ? { ...t, [field]: value } : t));
  };

  const insertPlaceholder = (ph: string, templateKey: string) => {
    const textarea = document.getElementById(`tmpl-body-${templateKey}`) as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const token = `{{${ph}}}`;

    setTemplates(templates.map(t => {
      if (t.template_key === templateKey) {
        return { ...t, body: t.body.substring(0, start) + token + t.body.substring(end) };
      }
      return t;
    }));
    setTimeout(() => { textarea.focus(); textarea.setSelectionRange(start + token.length, start + token.length); }, 10);
  };

  const saveTemplate = async (t: any) => {
    const formData = new FormData();
    formData.append('template_key', t.template_key);
    formData.append('subject', t.subject);
    formData.append('body', t.body);
    formData.append('is_enabled', t.is_enabled ? '1' : '0');

    try {
      await updateTemplateAPI(formData);
      toast.success(`${t.title} saved!`);
    } catch { toast.error('Error saving template'); }
  };

  const toggleEnabled = async (t: any) => {
    const updatedStatus = !t.is_enabled;
    handleTemplateChange(t.template_key, 'is_enabled', updatedStatus);
    const formData = new FormData();
    formData.append('template_key', t.template_key);
    formData.append('subject', t.subject);
    formData.append('body', t.body);
    formData.append('is_enabled', updatedStatus ? '1' : '0');
    try {
      await updateTemplateAPI(formData);
      toast.success(`${t.title} ${updatedStatus ? 'Enabled' : 'Disabled'}`);
    } catch { toast.error('Error toggling template'); }
  };

  // 🔴 FIX: Bulletproof Logic for Missing Keys
  const sampleDataMap = (placeholders || []).reduce((acc: any, curr: any) => {
    const key = curr.ph_key || curr.ph; // Handle DB model vs Old static
    const val = curr.sample_value || curr.sample;
    return { ...acc, [key]: val };
  }, {});
  
  const fillPlaceholders = (str: string) => {
    return str.replace(/\{\{(\w+)\}\}/g, (match, key) => sampleDataMap[key] !== undefined ? sampleDataMap[key] : match);
  };
  
  const showPreview = (t: any) => {
    setPreviewData({ subject: fillPlaceholders(t.subject), body: fillPlaceholders(t.body) });
  };

  const handleAddPlaceholder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      const res = await addPlaceholderAPI(formData);
      if (res.status === 'success') {
        toast.success('Custom key added!');
        setIsPhModalOpen(false);
        loadTemplatesData(); 
      } else { toast.error(res.message); }
    } catch { toast.error('Error adding key'); }
  };

  // --- Logic for Plans Table ---
  let rows: any[] = [];
  cases.filter((c: any) => instProject === 'all' || c.projectId === instProject).forEach((c: any) => {
    let running = c.plot?.totalValue || 0;
    (c.payments || []).forEach((p: any) => {
      running -= p.amount;
      rows.push({
        date: p.date, client: c.buyer?.name, plot: c.plot?.plotNumber, project: c.plot?.project?.split(',')[0],
        amount: p.amount, chNo: p.chNo, bank: p.bankName || p.drawnOn, bookedBy: p.bookedBy, caseId: c.id
      });
    });
  });
  rows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const pg = paginate(rows, page, perPage);
  const totalCollected = rows.reduce((s, r) => s + r.amount, 0);
  const overdueCount = cases.filter((c: any) => { const od = overdueDays(c); return od !== null && od > 0; }).length;
  const upcomingCount = cases.filter((c: any) => { const od = overdueDays(c); return od !== null && od < 0; }).length;

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Installments</h1>
          <p>Manage scheduled payment plans, track collections and configure reminder messages</p>
        </div>
      </div>

      <div className="subtab-row">
        <button className={`subtab-btn ${subTab === 'plans' ? 'active' : ''}`} onClick={() => setSubTab('plans')}><Calendar size={15} /> Plans &amp; Tracking</button>
        <button className={`subtab-btn ${subTab === 'templates' ? 'active' : ''}`} onClick={() => setSubTab('templates')}><Settings size={15} /> Reminder Message Templates</button>
      </div>

      {subTab === 'plans' ? (
        <div>
          <div className="stat-grid">
            <div className="stat-card"><div className="lbl">Total Plans</div><div className="val">{cases.length}</div><div className="sub">installment schedules</div></div>
            <div className="stat-card"><div className="lbl">Collected</div><div className="val" style={{ color: 'var(--green)' }}>{fmtINR(totalCollected)}</div><div className="sub">from paid installments</div></div>
            <div className="stat-card"><div className="lbl">Overdue</div><div className="val" style={{ color: 'var(--red)' }}>{overdueCount}</div><div className="sub">installments past due</div></div>
            <div className="stat-card"><div className="lbl">Upcoming</div><div className="val" style={{ color: 'var(--orange)' }}>{upcomingCount}</div><div className="sub">pending installments</div></div>
          </div>
          <div className="search-row">
            <select value={instProject} onChange={(e) => { setInstProject(e.target.value); setPage(1); }}>
              <option value="all">All Projects</option>
              {projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="card" style={{ padding: 0 }}>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Sr</th><th>Date</th><th>Client</th><th>Plot</th><th>Project</th><th>Amount</th><th>Cheque / RTGS No</th><th>Bank</th></tr></thead>
                <tbody>
                  {pg.rows.map((r: any, idx: number) => (
                    <tr key={idx} className="clickable" onClick={() => { setSelectedCaseId(r.caseId); setActiveTab('case-detail'); }}>
                      <td>{(page - 1) * perPage + idx + 1}</td><td>{fmtDate(r.date)}</td><td>{r.client}</td><td>{r.plot}</td><td>{r.project}</td>
                      <td>{fmtINR(r.amount)}</td><td>{r.chNo}</td><td>{r.bank}</td>
                    </tr>
                  ))}
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
      ) : (
        <div>
          <div className="card" style={{ background: 'var(--blue-bg)', borderColor: '#d6e0fb' }}>
            <b style={{ fontSize: '13px' }}>EMI Reminder Settings</b><br />
            <span style={{ fontSize: '13px', color: '#0d3613',fontWeight:'600'}}>Customize the messages sent to clients at each stage of the reminder cascade. Changes apply to all future automated reminders.</span>
          </div>

          {(templates || []).map(t => (
            <div className="tmpl-card" key={t.template_key} style={{ padding: '24px' }}>
              <div className="tmpl-head" style={{ marginBottom: '20px' }}>
                <div className="tmpl-ico" style={{ background: t.bg_color, color: t.text_color }}>{t.icon}</div>
                <div style={{ flex: 1 }}>
                  <div className="tmpl-title" style={{ fontSize: '16px' }}>{t.title}</div>
                  <div className="tmpl-sub">{t.subtitle}</div>
                </div>
                <div className={`toggle ${t.is_enabled ? 'on' : ''}`} onClick={() => toggleEnabled(t)}><div className="knob"></div></div>
              </div>
              
              <div className="tmpl-label" style={{ fontWeight: 600 }}>Subject Line</div>
              <input style={premiumInput} value={t.subject} onChange={(e) => handleTemplateChange(t.template_key, 'subject', e.target.value)} />
              
              <div className="tmpl-label" style={{ fontWeight: 600, marginTop: '12px' }}>Insert Dynamic Key</div>
              <div className="ph-row" style={{ gap: '8px', paddingBottom: '10px' }}>
                
                {/* 🔴 FIX: Rendering Placeholders Confidently 🔴 */}
                {(placeholders || []).map(p => {
                  const phKey = p.ph_key || p.ph; // Dono conditions check kar liye
                  return (
                    <button type="button" key={phKey} className="ph-chip" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px 12px' }} onClick={() => insertPlaceholder(phKey, t.template_key)}>{`{{${phKey}}}`}</button>
                  );
                })}

              </div>
              <div className="ph-hint">Click a placeholder to insert it at the cursor position in the message body.</div>
              
              <div className="tmpl-label" style={{ fontWeight: 600, marginTop: '12px' }}>Message Body</div>
              <textarea style={premiumTextarea} id={`tmpl-body-${t.template_key}`} value={t.body} onChange={(e) => handleTemplateChange(t.template_key, 'body', e.target.value)} />
              
              <div style={{ marginTop: '16px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button className="btn btn-sm btn-outline" onClick={() => showPreview(t)}>👁 Preview Details</button>
                <button className="btn btn-sm btn-navy" onClick={() => saveTemplate(t)}>Save Template</button>
              </div>
            </div>
          ))}

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3>Placeholder Reference (Dynamic Keys)</h3>
                <div className="card-sub">All available dynamic variables you can use in your templates</div>
              </div>
              <button className="btn btn-sm btn-outline" onClick={() => setIsPhModalOpen(true)}>
                <Plus size={14} /> Add Custom Key
              </button>
            </div>
            
            <div className="table-wrap" style={{ marginTop: '15px' }}>
              <table>
                <thead><tr><th>Placeholder Key</th><th>Description</th><th>Sample Data Used in Preview</th></tr></thead>
                <tbody>
                  {/* 🔴 FIX: Table rows map with confident keys */}
                  {(placeholders || []).map(p => {
                    const phKey = p.ph_key || p.ph;
                    const desc = p.description || p.desc;
                    const sampleVal = p.sample_value || p.sample;
                    return (
                      <tr key={phKey}>
                        <td><code>{`{{${phKey}}}`}</code></td>
                        <td>{desc}</td>
                        <td style={{ color: 'var(--muted)' }}>{sampleVal}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewData && (
        <div className="modal-overlay" onClick={() => setPreviewData(null)}>
          <div className="modal" style={{ maxWidth: '520px', padding: '30px' }} onClick={e => e.stopPropagation()}>
            <h2>Message Preview</h2>
            <div className="m-sub">This is how the message looks with sample data filled in.</div>
            
            <div className="tmpl-label" style={{ marginTop: '20px', fontWeight: 600 }}>Subject</div>
            <div style={{ fontSize: '14px', padding: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '16px', color: '#1e293b' }}>{previewData.subject}</div>
            
            <div className="tmpl-label" style={{ fontWeight: 600 }}>Message Body</div>
            <div style={{ fontSize: '14px', whiteSpace: 'pre-wrap', padding: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', lineHeight: 1.6, color: '#334155' }}>{previewData.body}</div>
            
            <div className="modal-actions" style={{ marginTop: '24px' }}>
              <button className="btn btn-navy btn-sm" onClick={() => setPreviewData(null)}>Close Preview</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Placeholder Modal */}
      {isPhModalOpen && (
        <div className="modal-overlay" onClick={() => setIsPhModalOpen(false)}>
          <div className="modal" style={{ maxWidth: '400px', padding: '24px' }} onClick={e => e.stopPropagation()}>
            <h2>Add Custom Key</h2>
            <div className="m-sub">Create a new placeholder for your templates</div>
            <form onSubmit={handleAddPlaceholder}>
              <div className="field" style={{ marginTop: '15px' }}>
                <label>Key Name (no spaces) *</label>
                <input style={premiumInput} name="ph_key" required placeholder="e.g. projectLocation" pattern="[a-zA-Z0-9_]+" title="Only letters, numbers, and underscores allowed" />
              </div>
              <div className="field">
                <label>Description *</label>
                <input style={premiumInput} name="description" required placeholder="e.g. The location of the project" />
              </div>
              <div className="field">
                <label>Sample Value (For Previews) *</label>
                <input style={premiumInput} name="sample_value" required placeholder="e.g. MG Road, Mumbai" />
              </div>
              <div className="modal-actions" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsPhModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-navy">Save Key</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};