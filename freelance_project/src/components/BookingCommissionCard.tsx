import React, { useState, useEffect } from 'react';
import { Edit2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateCommissionInfoAPI, API_URL } from '../services/api'; // 🔴 IMPORT ADDED
import { fmtINR } from '../utils/helpers';

interface BookingCommissionProps {
  caseData: any;
  onRefresh: () => void;
}

export const BookingCommissionCard: React.FC<BookingCommissionProps> = ({ caseData, onRefresh }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState<any[]>([]);
  
  const p = caseData.plot || {};
  const extentSqft = p.extentSqft || 0;

  const [formData, setFormData] = useState({
    bookedBy: '',
    commissionPerSqft: 0,
    commissionPaid: 0,
  });

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const token = localStorage.getItem('token');
        // 🔴 HARDCODED URL REMOVED
        const response = await fetch(`${API_URL}/api/settings/get-all`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data && data.staff) {
          setStaffList(data.staff);
        }
      } catch (err) {
        console.error("Failed to fetch staff list", err);
      }
    };
    fetchStaff();
  }, []);

  useEffect(() => {
    setFormData({
      bookedBy: p.bookedBy !== '—' ? (p.bookedBy || '') : '',
      commissionPerSqft: p.commissionPerSqft || 0,
      commissionPaid: p.commissionPaidAmount || 0,
    });
  }, [caseData]);

  // Auto Calculations
  const totalCommissionCalc = formData.commissionPerSqft * extentSqft;
  const commissionBalanceCalc = Math.max(0, totalCommissionCalc - formData.commissionPaid);

  const handleSave = async () => {
    setLoading(true);
    const fd = new FormData();
    fd.append('plot_id', caseData.id.toString());
    fd.append('booked_by', formData.bookedBy || '—');
    fd.append('commission_per_sqft', formData.commissionPerSqft.toString());
    fd.append('commission_paid', formData.commissionPaid.toString());

    const tid = toast.loading("Saving commission details...");
    try {
      await updateCommissionInfoAPI(fd);
      toast.success("Commission updated!", { id: tid });
      setIsEditing(false);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to save", { id: tid });
    }
    setLoading(false);
  };

  const handleMarkFullPaid = async () => {
    const fd = new FormData();
    fd.append('plot_id', caseData.id.toString());
    fd.append('commission_paid', totalCommissionCalc.toString());

    const tid = toast.loading("Marking as full paid...");
    try {
      await updateCommissionInfoAPI(fd);
      toast.success("Commission marked as fully paid!", { id: tid });
      onRefresh();
    } catch (err: any) {
      toast.error("Action failed", { id: tid });
    }
  };

  const Row = ({ label, value, isBold = false }: { label: string, value: React.ReactNode, isBold?: boolean }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9', fontSize: '13px' }}>
      <span style={{ color: '#64748b' }}>{label}</span>
      <span style={{ fontWeight: isBold ? 700 : 500, color: '#0D3613', textAlign: 'right' }}>{value}</span>
    </div>
  );

  return (
    <div className="card" style={{ padding: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0D3613', marginBottom: '4px' }}>Booking & Commission</h3>
          <div className="card-sub" style={{ fontSize: '12.5px', color: '#3D5E42', fontWeight: 500, margin: 0 }}>Who booked this client and agent payout status</div>
        </div>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '6px', borderRadius: '6px', cursor: 'pointer', color: '#64748b' }} title="Edit Details">
            <Edit2 size={16} />
          </button>
        )}
      </div>

      {isEditing ? (
        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
            
            {/* 🔴 BOOKED BY DROPDOWN SELECTION */}
            <div>
              <label style={{fontSize:'12px', color:'#64748b', display:'block', marginBottom:'4px'}}>Booked By (Select Staff)</label>
              <select 
                className="form-input" 
                value={formData.bookedBy} 
                onChange={e => setFormData({...formData, bookedBy: e.target.value})} 
                style={{width:'100%', padding:'6px', border:'1px solid #cbd5e1', borderRadius:'4px', fontSize:'13px', background:'#fff'}}
              >
                <option value="">-- Select Staff Member --</option>
                {staffList.map((staff) => (
                  <option key={staff.id} value={staff.name}>
                    {staff.name} ({staff.role})
                  </option>
                ))}
              </select>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{fontSize:'12px', color:'#64748b', display:'block', marginBottom:'4px'}}>Commission per Sqft (₹)</label>
                <input type="number" className="form-input" value={formData.commissionPerSqft} onChange={e => setFormData({...formData, commissionPerSqft: Number(e.target.value)})} style={{width:'100%', padding:'6px', border:'1px solid #cbd5e1', borderRadius:'4px', fontSize:'13px'}} />
              </div>
              <div>
                <label style={{fontSize:'12px', color:'#64748b', display:'block', marginBottom:'4px'}}>Total Commission (Auto-calc)</label>
                <div style={{ padding:'6px', border:'1px solid #e2e8f0', background:'#f1f5f9', borderRadius:'4px', fontSize:'13px', fontWeight:600, color:'#334155' }}>
                  {fmtINR(totalCommissionCalc)}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{fontSize:'12px', color:'#64748b', display:'block', marginBottom:'4px'}}>Commission Paid So Far (₹)</label>
                <input type="number" className="form-input" value={formData.commissionPaid} onChange={e => setFormData({...formData, commissionPaid: Number(e.target.value)})} style={{width:'100%', padding:'6px', border:'1px solid #cbd5e1', borderRadius:'4px', fontSize:'13px'}} />
              </div>
              <div>
                <label style={{fontSize:'12px', color:'#64748b', display:'block', marginBottom:'4px'}}>Balance Pending (Auto-calc)</label>
                <div style={{ padding:'6px', border:'1px solid #e2e8f0', background:'#f1f5f9', borderRadius:'4px', fontSize:'13px', fontWeight:600, color: commissionBalanceCalc > 0 ? '#b45309' : '#15803d' }}>
                  {fmtINR(commissionBalanceCalc)}
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button onClick={() => setIsEditing(false)} style={{ display:'flex', alignItems:'center', gap:'4px', padding: '6px 12px', border: '1px solid #cbd5e1', background: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize:'13px' }}><X size={14}/> Cancel</button>
            <button onClick={handleSave} disabled={loading} style={{ display:'flex', alignItems:'center', gap:'4px', padding: '6px 12px', border: 'none', background: '#0f766e', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize:'13px' }}>
              <Save size={14}/> {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: '0px' }}>
          <Row label="Booked By" value={p.bookedBy || '—'} />
          <Row label="Commission per Sqft" value={fmtINR(p.commissionPerSqft || 0)} isBold />
          <Row label="Total Commission" value={fmtINR(p.totalCommission || 0)} isBold />
          <Row label="Commission Paid" value={fmtINR(p.commissionPaidAmount || 0)} isBold />
          
          <div style={{ height: '1px', background: '#eef0f7', margin: '12px 0' }}></div>
          
          <Row label="Commission Balance" value={fmtINR(Math.max(0, (p.totalCommission || 0) - (p.commissionPaidAmount || 0)))} isBold />
          
          {Math.max(0, (p.totalCommission || 0) - (p.commissionPaidAmount || 0)) > 0 && (
            <div style={{ marginTop: '16px', textAlign: 'right' }}>
              <button className="btn btn-sm btn-outline" onClick={handleMarkFullPaid} style={{ fontSize:'12px', padding:'6px 12px', background:'#fff', border:'1px solid #cbd5e1', borderRadius:'6px', cursor:'pointer' }}>
                Mark Full Commission Paid
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};