// src/components/BuyerKYCCard.tsx
import React, { useState, useEffect } from 'react';
import { Edit2, Save, X, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateKycInfoAPI, API_URL } from '../services/api'; // 🔴 IMPORTED API_URL

// 🔴 NAYA FUNCTION YAHAN BHI
const getFullFileUrl = (url: string) => {
  if (!url || url === '—') return '#';
  if (url.startsWith('http')) return url;
  if (!url.startsWith('/')) url = '/' + url;
  return `${API_URL}${url}`;
};

interface BuyerKYCProps {
  caseData: any;
  onRefresh: () => void;
}

export const BuyerKYCCard: React.FC<BuyerKYCProps> = ({ caseData, onRefresh }) => {
  const buyerData = caseData.buyer || {};
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', address: '',
    pan: '', aadhaar: '', nationalId: '',
  });

  const [panFile, setPanFile] = useState<File | null>(null);
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [nidFile, setNidFile] = useState<File | null>(null);

  useEffect(() => {
    setFormData({
      name: buyerData.name && buyerData.name !== '—' ? buyerData.name : '',
      phone: buyerData.phone && buyerData.phone !== '—' ? buyerData.phone : '',
      email: buyerData.email && buyerData.email !== '—' ? buyerData.email : '',
      address: buyerData.address && buyerData.address !== '—' ? buyerData.address : '',
      pan: buyerData.pan && buyerData.pan !== '—' ? buyerData.pan : '',
      aadhaar: '', 
      nationalId: buyerData.nationalId && buyerData.nationalId !== '—' ? buyerData.nationalId : '',
    });
  }, [caseData, buyerData]);

  const handleSave = async () => {
    if (!buyerData.id) return toast.error("Client ID missing.");
    
    setLoading(true);
    const fd = new FormData();
    
    fd.append('plot_id', caseData.id.toString()); 
    fd.append('client_id', buyerData.id.toString());
    
    if (formData.name) fd.append('name', formData.name);
    if (formData.phone) fd.append('phone', formData.phone);
    if (formData.email) fd.append('email', formData.email);
    if (formData.address) fd.append('address', formData.address);
    if (formData.pan) fd.append('pan', formData.pan);
    if (formData.aadhaar) fd.append('aadhaar', formData.aadhaar); 
    if (formData.nationalId) fd.append('national_id', formData.nationalId);

    if (panFile) fd.append('pan_file', panFile);
    if (aadhaarFile) fd.append('aadhaar_file', aadhaarFile);
    if (nidFile) fd.append('national_id_file', nidFile);

    const tid = toast.loading("Updating KYC...");
    try {
      await updateKycInfoAPI(fd);
      toast.success("KYC Details saved!", { id: tid });
      setIsEditing(false);
      setPanFile(null); 
      setAadhaarFile(null); 
      setNidFile(null);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update", { id: tid });
    }
    setLoading(false);
  };

  const Row = ({ label, value, docUrl }: { label: string, value: React.ReactNode, docUrl?: string }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9', fontSize: '13px' }}>
      <span style={{ color: '#0D3613', opacity: 0.8 }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontWeight: 500, color: '#0D3613', textAlign: 'right', maxWidth:'180px', wordWrap:'break-word' }}>{value}</span>
        {docUrl && (
          /* 🔴 URL FIX YAHAN */
          <a href={getFullFileUrl(docUrl)} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#000', textDecoration: 'none', background: '#F5F0E6', padding: '4px 8px', borderRadius: '4px' }}>
            <Eye size={12}/> View Doc
          </a>
        )}
      </div>
    </div>
  );

  return (
    <div className="card" style={{ padding: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0D3613', marginBottom: '4px' }}>Buyer (KYC)</h3>
          <div className="card-sub" style={{ fontSize: '12.5px', color: '#0D3613', opacity: 0.8, fontWeight: 500, margin: 0 }}>Contact & Identification</div>
        </div>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '6px', borderRadius: '6px', cursor: 'pointer', color: '#0D3613' }} title="Edit KYC Details">
            <Edit2 size={16} />
          </button>
        )}
      </div>

      {isEditing ? (
        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div><label style={{fontSize:'12px', color:'#0D3613', fontWeight: 600, display:'block', marginBottom:'4px'}}>Name</label><input type="text" className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{width:'100%', padding:'6px', border:'1px solid #cbd5e1', borderRadius:'4px', fontSize:'13px', color: '#0D3613'}} /></div>
            <div><label style={{fontSize:'12px', color:'#0D3613', fontWeight: 600, display:'block', marginBottom:'4px'}}>Phone</label><input type="text" className="form-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{width:'100%', padding:'6px', border:'1px solid #cbd5e1', borderRadius:'4px', fontSize:'13px', color: '#0D3613'}} /></div>
            <div style={{ gridColumn: 'span 2' }}><label style={{fontSize:'12px', color:'#0D3613', fontWeight: 600, display:'block', marginBottom:'4px'}}>Email</label><input type="email" className="form-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{width:'100%', padding:'6px', border:'1px solid #cbd5e1', borderRadius:'4px', fontSize:'13px', color: '#0D3613'}} /></div>
            <div style={{ gridColumn: 'span 2' }}><label style={{fontSize:'12px', color:'#0D3613', fontWeight: 600, display:'block', marginBottom:'4px'}}>Address</label><textarea className="form-input" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} rows={2} style={{width:'100%', padding:'6px', border:'1px solid #cbd5e1', borderRadius:'4px', fontSize:'13px', color: '#0D3613'}} /></div>
            
            <div style={{gridColumn:'span 2', height:'1px', background:'#cbd5e1', margin:'10px 0'}}></div>

            <div>
              <label style={{fontSize:'12px', color:'#0D3613', fontWeight: 600, display:'block', marginBottom:'4px'}}>PAN Number</label>
              <input type="text" className="form-input" value={formData.pan} onChange={e => setFormData({...formData, pan: e.target.value})} style={{width:'100%', padding:'6px', border:'1px solid #cbd5e1', borderRadius:'4px', fontSize:'13px', color: '#0D3613'}} />
            </div>
            <div>
              <label style={{fontSize:'12px', color:'#0D3613', fontWeight: 600, display:'block', marginBottom:'4px'}}>{buyerData.panDocUrl ? 'Replace PAN Doc' : 'Upload PAN Doc'}</label>
              <input type="file" onChange={e => setPanFile(e.target.files ? e.target.files[0] : null)} style={{width:'100%', padding:'4px', background:'#fff', border:'1px solid #cbd5e1', borderRadius:'4px', fontSize:'11px', color: '#0D3613'}} />
            </div>

            <div>
              <label style={{fontSize:'12px', color:'#0D3613', fontWeight: 600, display:'block', marginBottom:'4px'}}>Aadhar ID</label>
              <input type="text" className="form-input" placeholder="Enter ID to update" value={formData.aadhaar} onChange={e => setFormData({...formData, aadhaar: e.target.value})} style={{width:'100%', padding:'6px', border:'1px solid #cbd5e1', borderRadius:'4px', fontSize:'13px', color: '#0D3613'}} />
            </div>
             <div>
              <label style={{fontSize:'12px', color:'#0D3613', fontWeight: 600, display:'block', marginBottom:'4px'}}>{buyerData.aadhaarDocUrl ? 'Replace Aadhar Doc' : 'Upload Govt ID Doc'}</label>
              <input type="file" onChange={e => setAadhaarFile(e.target.files ? e.target.files[0] : null)} style={{width:'100%', padding:'4px', background:'#fff', border:'1px solid #cbd5e1', borderRadius:'4px', fontSize:'11px', color: '#0D3613'}} />
            </div>

             <div>
              <label style={{fontSize:'12px', color:'#0D3613', fontWeight: 600, display:'block', marginBottom:'4px'}}>National Govt. ID</label>
              <input type="text" className="form-input" value={formData.nationalId} onChange={e => setFormData({...formData, nationalId: e.target.value})} style={{width:'100%', padding:'6px', border:'1px solid #cbd5e1', borderRadius:'4px', fontSize:'13px', color: '#0D3613'}} />
            </div>
             <div>
              <label style={{fontSize:'12px', color:'#0D3613', fontWeight: 600, display:'block', marginBottom:'4px'}}>{buyerData.nationalIdDocUrl ? 'Replace National ID Doc' : 'Upload Other ID Doc'}</label>
              <input type="file" onChange={e => setNidFile(e.target.files ? e.target.files[0] : null)} style={{width:'100%', padding:'4px', background:'#fff', border:'1px solid #cbd5e1', borderRadius:'4px', fontSize:'11px', color: '#0D3613'}} />
            </div>
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
          <Row label="Name" value={buyerData.name || '—'} />
          <Row label="Phone" value={buyerData.phone || '—'} />
          <Row label="Email" value={buyerData.email || '—'} />
          <Row label="Address" value={<span style={{ maxWidth: '180px', display: 'inline-block' }}>{buyerData.address || '—'}</span>} />
          <div style={{ height: '1px', background: '#eef0f7', margin: '12px 0' }}></div>
          <Row label="PAN" value={buyerData.pan || '—'} docUrl={buyerData.panDocUrl} />
          <Row label="Aadhar ID" value={buyerData.aadhaar || '[Aadhaar Redacted]'} docUrl={buyerData.aadhaarDocUrl} />
          <Row label="National ID" value={buyerData.nationalId || '—'} docUrl={buyerData.nationalIdDocUrl} />
        </div>
      )}
    </div>
  );
};