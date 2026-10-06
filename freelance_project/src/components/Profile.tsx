// src/components/Profile.tsx
import React, { useState, useEffect } from 'react';
import { UserPlus, Upload } from 'lucide-react';
import { State, City } from 'country-state-city'; 
import toast from 'react-hot-toast';
import { fetchSettingsData, updateProfileAPI, updateAutomationAPI, uploadLogoAPI, API_URL } from '../services/api';
import { AddStaffModal } from './AddStaffModal';

interface Props {
  onOpenIntegrations: () => void;
  triggerAppReload: () => void;
}

export const Profile: React.FC<Props> = ({ onOpenIntegrations, triggerAppReload }) => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>({});
  const [staff, setStaff] = useState<any[]>([]);
  const [auto, setAuto] = useState<any>({});
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);

  // Dropdown States
  const [indiaStates] = useState(State.getStatesOfCountry('IN'));
  const [cities, setCities] = useState<any[]>([]);

  const loadData = async () => {
    try {
      const res = await fetchSettingsData();
      if (res.status === 'success') {
        setProfile(res.profile);
        setStaff(res.staff);
        setAuto(res.automation);

        // State ke hisaab se city load karna
        if (res.profile?.state) {
          const matchedState = State.getStatesOfCountry('IN').find(s => s.name === res.profile.state);
          if (matchedState) {
            setCities(City.getCitiesOfState('IN', matchedState.isoCode));
          }
        }
      }
    } catch (err) { 
      console.error(err); 
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedStateName = e.target.value;
    setProfile({ ...profile, state: selectedStateName, city: '' });
    
    const matchedState = indiaStates.find(s => s.name === selectedStateName);
    if (matchedState) {
      setCities(City.getCitiesOfState('IN', matchedState.isoCode));
    } else {
      setCities([]);
    }
  };

  const handleProfileSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const pan = formData.get('pan') as string;
    const gstin = formData.get('gstin') as string;

    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i; 
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i; 

    if (pan && !panRegex.test(pan)) {
      toast.error('Invalid PAN format! e.g. ABCDE1234F');
      return;
    }

    if (gstin && !gstinRegex.test(gstin)) {
      toast.error('Invalid GSTIN format! e.g. 27ABCDE1234F1Z5');
      return;
    }

    const toastId = toast.loading('Saving business profile...'); 

    try {
      const res = await updateProfileAPI(formData);
      
      if (res && res.status === 'error') {
        toast.error(res.message || 'Failed to save profile. Please check the data.', { id: toastId });
        return;
      }

      toast.success('Business profile saved successfully!', { id: toastId });
      triggerAppReload(); 

    } catch (err: any) { 
      const errorMsg = 
        err?.response?.data?.message || 
        err?.response?.data?.detail || 
        err?.message || 
        'An unexpected server error occurred';
        
      toast.error(errorMsg, { id: toastId }); 
    }
  };

  const handleAutoSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append('sms_on', auto.sms_on ? '1' : '0');
    formData.append('wa_on', auto.wa_on ? '1' : '0');
    formData.append('escalate_on', auto.escalate_on ? '1' : '0');
    
    const toastId = toast.loading('Saving automation settings...');
    
    try {
      const res = await updateAutomationAPI(formData);
      if (res && res.status === 'error') {
        toast.error(res.message || 'Failed to update settings', { id: toastId });
        return;
      }
      toast.success('Automation Schedule saved!', { id: toastId });
    } catch (err: any) { 
      const errorMsg = err?.response?.data?.message || err?.response?.data?.detail || err?.message || 'Error saving automation';
      toast.error(errorMsg, { id: toastId });
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      
      const toastId = toast.loading('Uploading logo...');
      try {
        const res = await uploadLogoAPI(formData);
        if (res.status === 'success') {
          toast.success('Logo uploaded successfully!', { id: toastId });
          setProfile({ ...profile, logo_url: res.logo_url }); 
          triggerAppReload(); 
        } else {
          toast.error(res.message || 'Upload failed', { id: toastId });
        }
      } catch (err: any) {
        const errorMsg = err?.response?.data?.message || err?.response?.data?.detail || err?.message || 'Server error during upload';
        toast.error(errorMsg, { id: toastId });
      }
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading Settings...</div>;

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Profile &amp; Settings</h1>
          <p>Manage your business details and repayment automation</p>
        </div>
      </div>

      <div className="grid-2">
        <div>
          {/* Business Information Form */}
          <div className="card">
            <h3>Business Information</h3>
            <div className="card-sub">Manage your business details and account settings</div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', padding: '16px', background: '#f9fafb', borderRadius: '8px', border: '1px dashed #d1d5db' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '8px', background: '#fff', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {profile.logo_url ? (
                  <img src={`${API_URL}${profile.logo_url}`} alt="Business Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <span style={{ fontSize: '24px' }}>🏢</span>
                )}
              </div>
              <div>
                <label className="btn btn-sm btn-outline" style={{ cursor: 'pointer',color:'#0D3613', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Upload size={14} /> Upload New Logo
                  <input type="file" accept="image/png, image/jpeg" style={{ display: 'none' }} onChange={handleLogoUpload} />
                </label>
                <div style={{ fontSize: '11px', color: '#0D3613', marginTop: '6px' }}>Recommended: (PNG/JPG) under 2MB</div>
              </div>
            </div>

            <form onSubmit={handleProfileSave}>
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
                <div className="field"><label>Business Name *</label><input name="business_name" defaultValue={profile.business_name} required/></div>
                <div className="field"><label>Contact Person *</label><input name="owner_name" defaultValue={profile.owner_name} required/></div>
                <div className="field"><label>Phone Number *</label><input name="phone_number" defaultValue={profile.phone_number} required/></div>
                <div className="field"><label>PAN *</label><input name="pan" defaultValue={profile.pan} placeholder="e.g. ABCDE1234F" style={{ textTransform: 'uppercase' }} required/></div>
                
                <div className="field">
                  <label>State *</label>
                  <select name="state" value={profile.state || ""} onChange={handleStateChange} required style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', width: '100%' }}>
                    <option value="">Select State</option>
                    {indiaStates.map(s => (
                      <option key={s.isoCode} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label>City *</label>
                  <select name="city" value={profile.city || ""} onChange={(e) => setProfile({...profile, city: e.target.value})} required style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', width: '100%' }} disabled={!profile.state}>
                    <option value="">Select City</option>
                    {cities.map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="field"><label>PIN Code *</label><input name="pin_code" type="number" defaultValue={profile.pin_code} placeholder="e.g. 462001" required/></div>
                <div className="field"><label>Industry</label><input name="industry" defaultValue={profile.industry} /></div>
                <div className="field"><label>GSTIN</label><input name="gstin" defaultValue={profile.gstin} placeholder="e.g. 27ABCDE1234F1Z5" style={{ textTransform: 'uppercase' }} /></div>
                <div className="field"><label>RERA Registration No.</label><input name="rera_no" defaultValue={profile.rera_no} /></div>
              </div>
              <div className="modal-actions" style={{ justifyContent: 'flex-start', marginTop: '16px' }}>
                <button type="submit" className="btn btn-navy btn-sm">Save Changes</button>
              </div>
            </form>
          </div>

          {/* Assigned Recovery Staff */}
          <div className="card">
            <h3>Assigned Recovery Staff</h3>
            <div className="card-sub">Team members who handle escalated calls</div>
            {staff.map(s => {
              const initials = s.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();
              return (
                <div key={s.id} className="staff-list-row" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid #f4f5f9' }}>
                  <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '11px' }}>{initials}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '13px' }}>{s.name}</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--muted)' }}>{s.role} &middot; {s.phone}</div>
                  </div>
                  <a className="btn btn-sm btn-outline" href={`tel:${s.phone}`}>📞 Call</a>
                </div>
              );
            })}
            <button className="btn btn-sm btn-outline" style={{ marginTop: '12px' }} onClick={() => setIsStaffModalOpen(true)}>
              <UserPlus size={14} /> + Add Staff Member
            </button>
          </div>
        </div>

        <div>
          {/* Repayment Automation Settings */}
          <div className="card">
            <h3>Repayment Automation Settings</h3>
            <div className="card-sub">Configure the reminder &amp; escalation cascade for overdue installments</div>
            <form onSubmit={handleAutoSave}>
              <div className="toggle-row">
                <div>
                  <b style={{ fontSize: '13px' }}>SMS Reminder</b>
                  <div style={{ fontSize: '11.5px', color: 'var(--muted)' }}>
                    Triggers on day <input name="sms_day" className="day-input" type="number" defaultValue={auto.sms_day} style={{width:'40px', padding:'2px', textAlign:'center', margin:'0 4px', border:'1px solid #ccc', borderRadius:'4px'}} /> after due date
                  </div>
                </div>
                <div className={`toggle ${auto.sms_on ? 'on' : ''}`} onClick={() => setAuto({...auto, sms_on: !auto.sms_on})}>
                  <div className="knob"></div>
                </div>
              </div>

              <div className="toggle-row">
                <div>
                  <b style={{ fontSize: '13px' }}>WhatsApp Reminder</b>
                  <div style={{ fontSize: '11.5px', color: 'var(--muted)' }}>
                    Triggers on day <input name="wa_day" className="day-input" type="number" defaultValue={auto.wa_day} style={{width:'40px', padding:'2px', textAlign:'center', margin:'0 4px', border:'1px solid #ccc', borderRadius:'4px'}} /> after due date
                  </div>
                </div>
                <div className={`toggle ${auto.wa_on ? 'on' : ''}`} onClick={() => setAuto({...auto, wa_on: !auto.wa_on})}>
                  <div className="knob"></div>
                </div>
              </div>

              {/* 🔴 NEW STATIC ROW: Email Reminder */}
             

              {/* 🔴 NEW STATIC ROW: AI Voice Call */}
             

              <div className="toggle-row">
                <div>
                  <b style={{ fontSize: '13px' }}>Escalate to Staff</b>
                  <div style={{ fontSize: '11.5px', color: 'var(--muted)' }}>
                    Triggers on day <input name="escalate_day" className="day-input" type="number" defaultValue={auto.escalate_day} style={{width:'40px', padding:'2px', textAlign:'center', margin:'0 4px', border:'1px solid #ccc', borderRadius:'4px'}} /> after due date
                  </div>
                </div>
                <div className={`toggle ${auto.escalate_on ? 'on' : ''}`} onClick={() => setAuto({...auto, escalate_on: !auto.escalate_on})}>
                  <div className="knob"></div>
                </div>
              </div>

              <button type="submit" className="btn btn-navy btn-sm" style={{ marginTop: '14px' }}>Save Schedule</button>
            </form>
            <div className="esc-note" style={{ marginTop: '14px' }}>
              Reminders trigger this many days after the installment due date. Toggling a channel off skips that step.
            </div>
          </div>

          {/* Notification Channels */}
          <div className="card">
            <h3>Notification Channels</h3>
            <div className="card-sub">Where reminders are sent from</div>
            <div className="kv" style={kvStyle}><span>SMS Gateway</span><b>MSG91 — Connected</b></div>
            <div className="kv" style={kvStyle}><span>WhatsApp</span><b>WhatsApp Business API — Connected</b></div>
            <div className="kv" style={kvStyle}><span>Payment Collection</span><b>Razorpay — Not Connected</b></div>
            <button className="btn btn-sm btn-outline" style={{ marginTop: '12px' }} onClick={onOpenIntegrations}>Manage Integrations</button>
          </div>
        </div>
      </div>

      <AddStaffModal isOpen={isStaffModalOpen} onClose={() => setIsStaffModalOpen(false)} onSuccess={loadData} />
    </div>
  );
};

const kvStyle = { display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f9f9f9', fontSize: '13px' };