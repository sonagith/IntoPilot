// src/components/PlotInfoCard.tsx
import React, { useState } from 'react';
import { Edit2, Save, X, UploadCloud, Trash2, Eye, FileText, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { updatePlotInfoAPI, uploadPlotDocAPI, deletePlotDocAPI, API_URL } from '../services/api'; // 🔴 IMPORTED API_URL
import { fmtINR } from '../utils/helpers';

// 🔴 NAYA FUNCTION YAHAN BHI ADD KIYA HAI
const getFullFileUrl = (url: string) => {
  if (!url || url === '—') return '#';
  if (url.startsWith('http')) return url;
  if (!url.startsWith('/')) url = '/' + url;
  return `${API_URL}${url}`;
};

interface PlotInfoProps {
  caseData: any;
  onRefresh: () => void;
}

export const PlotInfoCard: React.FC<PlotInfoProps> = ({ caseData, onRefresh }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [showUploadSection, setShowUploadSection] = useState(false);
  
  const p = caseData.plot || {};
  const docs = p.documents || [];

  const [formData, setFormData] = useState({
    plotNumber: p.plotNumber || '',
    surveyNumber: p.surveyNumber === '—' ? '' : (p.surveyNumber || ''),
    extentSqft: p.extentSqft || '',
    facing: p.facing === '—' ? '' : (p.facing || ''),
    ratePerSqft: p.ratePerSqft || '',
    totalDp: caseData.totalDp || '',
    monthlyEmi: caseData.installmentAmount || '',
    registrationStatus: p.registrationStatus || 'Pending',
    bookingDate: p.bookingDate || '',
    endDate: p.endDate || '' 
  });

  const [docName, setDocName] = useState('Registry');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSave = async () => {
    setLoading(true);
    const fd = new FormData();
    fd.append('plot_id', caseData.id.toString());
    fd.append('plot_number', formData.plotNumber);
    fd.append('survey_number', formData.surveyNumber);
    fd.append('extent', formData.extentSqft.toString());
    fd.append('facing', formData.facing);
    fd.append('rate', formData.ratePerSqft.toString());
    fd.append('total_dp', formData.totalDp.toString());
    fd.append('monthly_emi', formData.monthlyEmi.toString());
    fd.append('registration_status', formData.registrationStatus);
    if (formData.bookingDate) fd.append('booking_date', formData.bookingDate);
    if (formData.endDate) fd.append('end_date', formData.endDate);

    const tid = toast.loading("Saving changes...");
    try {
      await updatePlotInfoAPI(fd);
      toast.success("Plot details updated!", { id: tid });
      setIsEditing(false);
      onRefresh(); 
    } catch (err: any) {
      toast.error(err.message || "Failed to save", { id: tid });
    }
    setLoading(false);
  };

  const handleUpload = async () => {
    if (!selectedFile) return toast.error("Please select a file to upload");
    if (!docName.trim()) return toast.error("Document name is required");

    setUploading(true);
    const fd = new FormData();
    fd.append('plot_id', caseData.id.toString());
    fd.append('doc_name', docName);
    fd.append('file', selectedFile);

    const tid = toast.loading("Uploading document...");
    try {
      await uploadPlotDocAPI(fd);
      toast.success("Document uploaded!", { id: tid });
      setSelectedFile(null);
      setDocName('Registry');
      setShowUploadSection(false);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Upload failed", { id: tid });
    }
    setUploading(false);
  };

  const handleDeleteDoc = async (docId: number) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    
    const tid = toast.loading("Deleting document...");
    try {
      const fd = new FormData();
      fd.append('doc_id', docId.toString());
      await deletePlotDocAPI(fd);
      toast.success("Document removed", { id: tid });
      onRefresh();
    } catch (err: any) {
      toast.error("Failed to delete", { id: tid });
    }
  };

  const Row = ({ label, value, isBold = false }: { label: string, value: React.ReactNode, isBold?: boolean }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9', fontSize: '13px' }}>
      <span style={{ color: '#0D3613', opacity: 0.8 }}>{label}</span>
      <span style={{ fontWeight: isBold ? 700 : 500, color: '#0D3613', textAlign: 'right' }}>{value}</span>
    </div>
  );

  return (
    <div className="card" style={{ padding: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0D3613', marginBottom: '4px' }}>Plot Information</h3>
          <div className="card-sub" style={{ fontSize: '12.5px', color: '#0D3613', opacity: 0.8, fontWeight: 700, margin: 0 }}>Survey & financial details</div>
        </div>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '6px', borderRadius: '6px', cursor: 'pointer', color: '#0D3613' }} title="Edit Plot Details">
            <Edit2 size={16} />
          </button>
        )}
      </div>

      {isEditing ? (
        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div><label style={{fontSize:'12px', color:'#0D3613', fontWeight: 600}}>Plot Number</label><input className="form-input" value={formData.plotNumber} onChange={e => setFormData({...formData, plotNumber: e.target.value})} style={{width:'100%', padding:'6px', border:'1px solid #cbd5e1', borderRadius:'4px', fontSize:'13px', color: '#0D3613'}} /></div>
            <div><label style={{fontSize:'12px', color:'#0D3613', fontWeight: 600}}>Survey Number</label><input className="form-input" value={formData.surveyNumber} onChange={e => setFormData({...formData, surveyNumber: e.target.value})} style={{width:'100%', padding:'6px', border:'1px solid #cbd5e1', borderRadius:'4px', fontSize:'13px', color: '#0D3613'}} /></div>
            <div><label style={{fontSize:'12px', color:'#0D3613', fontWeight: 600}}>Extent (sqft)</label><input type="number" className="form-input" value={formData.extentSqft} onChange={e => setFormData({...formData, extentSqft: e.target.value})} style={{width:'100%', padding:'6px', border:'1px solid #cbd5e1', borderRadius:'4px', fontSize:'13px', color: '#0D3613'}} /></div>
            <div><label style={{fontSize:'12px', color:'#0D3613', fontWeight: 600}}>Facing</label><input className="form-input" value={formData.facing} onChange={e => setFormData({...formData, facing: e.target.value})} style={{width:'100%', padding:'6px', border:'1px solid #cbd5e1', borderRadius:'4px', fontSize:'13px', color: '#0D3613'}} /></div>
            <div><label style={{fontSize:'12px', color:'#0D3613', fontWeight: 600}}>Rate / sqft (₹)</label><input type="number" className="form-input" value={formData.ratePerSqft} onChange={e => setFormData({...formData, ratePerSqft: e.target.value})} style={{width:'100%', padding:'6px', border:'1px solid #cbd5e1', borderRadius:'4px', fontSize:'13px', color: '#0D3613'}} /></div>
            <div><label style={{fontSize:'12px', color:'#0D3613', fontWeight: 600}}>Reg. Status</label>
              <select className="form-input" value={formData.registrationStatus} onChange={e => setFormData({...formData, registrationStatus: e.target.value})} style={{width:'100%', padding:'6px', border:'1px solid #cbd5e1', borderRadius:'4px', fontSize:'13px', color: '#0D3613'}}>
                <option value="Pending">Pending</option>
                <option value="Registered">Registered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div><label style={{fontSize:'12px', color:'#0D3613', fontWeight: 600}}>Booking Date</label><input type="date" className="form-input" value={formData.bookingDate} onChange={e => setFormData({...formData, bookingDate: e.target.value})} style={{width:'100%', padding:'6px', border:'1px solid #cbd5e1', borderRadius:'4px', fontSize:'13px', color: '#0D3613'}} /></div>
      
      <div><label style={{fontSize:'12px', color:'#0D3613', fontWeight: 600}}>End Date</label><input type="date" className="form-input" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} style={{width:'100%', padding:'6px', border:'1px solid #cbd5e1', borderRadius:'4px', fontSize:'13px', color: '#0D3613'}} /></div>
            <div><label style={{fontSize:'12px', color:'#0D3613', fontWeight: 600}}>Total DP (₹)</label><input type="number" className="form-input" value={formData.totalDp} onChange={e => setFormData({...formData, totalDp: e.target.value})} style={{width:'100%', padding:'6px', border:'1px solid #cbd5e1', borderRadius:'4px', fontSize:'13px', color: '#0D3613'}} /></div>
            <div><label style={{fontSize:'12px', color:'#0D3613', fontWeight: 600}}>Monthly EMI (₹)</label><input type="number" className="form-input" value={formData.monthlyEmi} onChange={e => setFormData({...formData, monthlyEmi: e.target.value})} style={{width:'100%', padding:'6px', border:'1px solid #cbd5e1', borderRadius:'4px', fontSize:'13px', color: '#0D3613'}} /></div>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button onClick={() => setIsEditing(false)} style={{ display:'flex', alignItems:'center', gap:'4px', padding: '6px 12px', border: '1px solid #cbd5e1', background: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize:'13px', color: '#0D3613' }}><X size={14}/> Cancel</button>
            <button onClick={handleSave} disabled={loading} style={{ display:'flex', alignItems:'center', gap:'4px', padding: '6px 12px', border: 'none', background: '#0D3613', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize:'13px' }}>
              <Save size={14}/> {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: '0px' }}>
          <Row label="Plot Number" value={p.plotNumber} isBold />
          <Row label="Project / Phase" value={p.project} isBold />
          <Row label="Survey Number" value={p.surveyNumber || '—'} />
          <Row label="Extent" value={`${p.extentSqft} sqft`} isBold />
          <Row label="Facing" value={p.facing || '—'} />
          <Row label="Rate / sqft" value={fmtINR(p.ratePerSqft)} isBold />
          <Row label="Total Value" value={fmtINR(p.totalValue)} isBold />
          
          <div style={{ height: '1px', background: '#eef0f7', margin: '12px 0' }}></div>
          
          <Row label="Total DP" value={fmtINR(caseData.totalDp)} isBold />
          <Row label="Monthly EMI" value={fmtINR(caseData.installmentAmount)} isBold />

          <div style={{ height: '1px', background: '#eef0f7', margin: '12px 0' }}></div>

          <Row label="Booking Date" value={p.bookingDate || '—'} isBold />
          <Row label="End Date" value={p.endDate || '—'} isBold />
          <Row label="Registration Status" value={
            <span style={{ color: p.registrationStatus === 'Registered' ? '#15803d' : '#b45309' }}>{p.registrationStatus}</span>
          } isBold />
        </div>
      )}

      {/* Property Documents Section */}
      <div style={{ marginTop: '24px', borderTop: '2px dashed #e2e8f0', paddingTop: '16px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0D3613', margin: 0 }}>Property Documents</h4>
          {!showUploadSection && (
            <button 
              onClick={() => setShowUploadSection(true)} 
              style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#F5F0E6', border: '1px solid #cbd5e1', color: '#0D3613', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
            >
              <Plus size={14} /> Add
            </button>
          )}
        </div>
        
        {docs.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: showUploadSection ? '16px' : '0' }}>
            {docs.map((doc: any) => (
              <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={16} color="#0D3613"/>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#0D3613' }}>{doc.name}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {/* 🔴 URL FIX YAHAN APPLY KIYA */}
                  <a href={getFullFileUrl(doc.url)} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#000', textDecoration: 'none', background: '#F5F0E6', padding: '4px 6px', borderRadius: '4px' }}>
                    <Eye size={12}/> View
                  </a>
                  <button onClick={() => handleDeleteDoc(doc.id)} style={{ display: 'flex', alignItems: 'center', background: '#F5F0E6', border: 'none', color: '#dc2626', padding: '4px 6px', borderRadius: '4px', cursor: 'pointer' }}>
                    <Trash2 size={12}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !showUploadSection && <p style={{ fontSize: '12px', color: '#0D3613', opacity: 0.7, margin: 0 }}>No documents uploaded yet.</p>
        )}

        {showUploadSection && (
          <div style={{ background: '#f1f5f9', padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', animation: 'fadeIn 0.2s ease-in-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#0D3613' }}>Upload New Document</span>
              <button onClick={() => setShowUploadSection(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0D3613' }}><X size={14}/></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#0D3613', fontWeight: 600, display: 'block', marginBottom: '2px' }}>Document Name</label>
                <input type="text" className="form-input" value={docName} onChange={e => setDocName(e.target.value)} placeholder="e.g. Registry" style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px', background: '#fff', color: '#0D3613' }} />
              </div>
              <div>
                 <label style={{ fontSize: '11px', color: '#0D3613', fontWeight: 600, display: 'block', marginBottom: '2px' }}>Select File</label>
                 <input type="file" onChange={e => setSelectedFile(e.target.files ? e.target.files[0] : null)} style={{ width: '100%', padding: '5px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px', color: '#0D3613' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                <button onClick={() => setShowUploadSection(false)} style={{ padding: '6px 12px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', color: '#0D3613' }}>Cancel</button>
                <button onClick={handleUpload} disabled={uploading || !selectedFile} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#0D3613', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '4px', cursor: selectedFile ? 'pointer' : 'not-allowed', fontWeight: 600, fontSize: '12px' }}>
                  <UploadCloud size={14} /> {uploading ? 'Uploading...' : 'Upload Document'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};