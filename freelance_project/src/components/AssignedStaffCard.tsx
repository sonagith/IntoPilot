import React, { useState, useEffect } from 'react';
import { Edit2, Save, X, Phone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_URL } from '../services/api'; // 🔴 IMPORT ADDED

interface AssignedStaffProps {
  caseData: any;
  onRefresh: () => void;
}

export const AssignedStaffCard: React.FC<AssignedStaffProps> = ({ caseData, onRefresh }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState<any[]>([]);
  
  const plot = caseData.plot || {};
  const currentStaff = plot.assignedStaff || {};

  const [selectedStaffId, setSelectedStaffId] = useState(currentStaff.id || '');

  // 1. Staff list fetch karna settings API se
  useEffect(() => {
    // 🔴 HARDCODED URL REMOVED
    fetch(`${API_URL}/api/settings/get-all`)
      .then(res => res.json())
      .then(data => {
        if (data && data.staff) {
          setStaffList(data.staff);
        }
      })
      .catch(err => console.error("Error fetching staff list", err));
  }, []);

  useEffect(() => {
    setSelectedStaffId(currentStaff.id || '');
  }, [caseData]);

  // Selected staff details for auto-fill preview
  const selectedStaffDetails = staffList.find(s => s.id.toString() === selectedStaffId.toString()) || currentStaff;

  const handleSave = async () => {
    if (!selectedStaffId) {
      toast.error("Please select a staff member");
      return;
    }

    setLoading(true);
    const fd = new FormData();
    fd.append('plot_id', caseData.id.toString());
    fd.append('staff_id', selectedStaffId.toString());

    const tid = toast.loading("Assigning recovery staff...");
    try {
      // 🔴 HARDCODED URL REMOVED
      const response = await fetch(`${API_URL}/api/dashboard/assign-staff`, {
        method: 'POST',
        body: fd
      });
      const result = await response.json();
      
      if (result.status === 'success') {
        toast.success("Staff assigned successfully!", { id: tid });
        setIsEditing(false);
        onRefresh();
      } else {
        toast.error(result.message || "Failed to assign", { id: tid });
      }
    } catch (err: any) {
      toast.error("Network error occurred", { id: tid });
    }
    setLoading(false);
  };
  return (
    <div className="card" style={{ padding: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0D3613', marginBottom: '4px' }}>Assigned Recovery Staff</h3>
          <div style={{ fontSize: '12.5px', color: '#0D3613', fontWeight: 500 }}>Point of contact for this client</div>
        </div>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)} 
            style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '6px', borderRadius: '6px', cursor: 'pointer', color: '#64748b' }} 
            title="Edit Assigned Staff"
          >
            <Edit2 size={16} />
          </button>
        )}
      </div>

      {isEditing ? (
        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Select Recovery Staff</label>
            <select 
              value={selectedStaffId} 
              onChange={e => setSelectedStaffId(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff', fontSize: '13px' }}
            >
              <option value="">-- Choose Staff Member --</option>
              {staffList.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.role})
                </option>
              ))}
            </select>
          </div>

          {selectedStaffId && (
            <div style={{ fontSize: '12.5px', color: '#334155', marginBottom: '16px', background: '#f1f5f9', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div>📞 Phone: <b>{selectedStaffDetails.phone || '—'}</b></div>
              <div>✉️ Email: <b>{selectedStaffDetails.email || '—'}</b></div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button 
              onClick={() => setIsEditing(false)} 
              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', border: '1px solid #cbd5e1', background: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
            >
              <X size={14}/> Cancel
            </button>
            <button 
              onClick={handleSave} 
              disabled={loading} 
              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', border: 'none', background: '#0D3613', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
            >
              <Save size={14}/> {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#0D3613' }}>{currentStaff.name || 'Unassigned'}</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>{currentStaff.role || 'Staff'}</div>
          
          {/* 🔴 Phone aur Email dono ke liye proper styled action buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <a 
              href={`tel:${currentStaff.phone}`} 
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#F5F0E6', color: '#064E3B', borderRadius: '6px', fontSize: '12px', textDecoration: 'none', fontWeight: 700 }}
            >
              <Phone size={14} /> {currentStaff.phone || '—'}
            </a>
            <a 
              href={`mailto:${currentStaff.email}`} 
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#F5F0E6', color: '#064E3B', borderRadius: '6px', fontSize: '12px', textDecoration: 'none', fontWeight: 700 }}
            >
              <Mail size={14} /> {currentStaff.email || 'Email'}
            </a>
          </div>
        </div>
      )}

    </div>
  );
};