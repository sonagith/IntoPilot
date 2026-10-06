// src/components/AddClientModal.tsx
import React from 'react';
import { addClientAPI } from '../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  projects: any[];
  onSuccess: () => void;
}

export const AddClientModal: React.FC<Props> = ({ isOpen, onClose, projects, onSuccess }) => {
  if (!isOpen) return null;

  const handleClientSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await addClientAPI({
        project_id: Number(formData.get('project_id')),
        plot_no: formData.get('plot_no'),
        plot_size_sqft: Number(formData.get('plot_size_sqft')),
        rate: Number(formData.get('rate')),
        buyer_name: formData.get('buyer_name'),
        buyer_phone: formData.get('buyer_phone'),
        buyer_email: formData.get('buyer_email'),
        booking_date: formData.get('booking_date'),
        booking_amount: Number(formData.get('booking_amount')),
        commission_per_sqft: Number(formData.get('commission_per_sqft')),
        commission_paid: Number(formData.get('commission_paid')),
        booked_by: formData.get('booked_by')
      });
      alert('Client successfully sent to Database!');
      onClose();
      onSuccess(); // Yeh function App.tsx ka loadBackendData call karega
    } catch (err) {
      alert("Failed to connect to backend");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>Add New Client</h2>
        <div className="m-sub">Manually register a new plot booking</div>
        <form onSubmit={handleClientSubmit}>
          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
            <div className="field">
              <label>Project *</label>
              <select name="project_id" defaultValue={projects[0]?.id}>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="field"><label>Plot Number *</label><input name="plot_no" required placeholder="e.g. H-115" /></div>
            <div className="field"><label>Extent (sqft) *</label><input name="plot_size_sqft" required type="number" placeholder="e.g. 2000" /></div>
            <div className="field"><label>Rate per sqft (₹) *</label><input name="rate" required type="number" placeholder="e.g. 1200" /></div>
            <div className="field full" style={{ gridColumn: '1 / -1' }}><label>Buyer Name *</label><input name="buyer_name" required placeholder="Enter full name" /></div>
            <div className="field"><label>Buyer Phone *</label><input name="buyer_phone" required placeholder="+91 90000 00000" /></div>
            <div className="field"><label>Buyer Email</label><input name="buyer_email" type="email" placeholder="buyer@gmail.com" /></div>
            <div className="field"><label>Booking Date *</label><input name="booking_date" required type="date" defaultValue={new Date().toISOString().slice(0, 10)} /></div>
            <div className="field"><label>Down Payment Amount (₹) *</label><input name="booking_amount" required type="number" placeholder="e.g. 300000" /></div>
            <div className="field"><label>Commission per Sqft (₹) *</label><input name="commission_per_sqft" required type="number" placeholder="e.g. 65" /></div>
            <div className="field"><label>Commission Paid (₹)</label><input name="commission_paid" type="number" defaultValue="0" /></div>
            <div className="field">
              <label>Booked By *</label>
              <select name="booked_by" defaultValue="Anil Kumar Nair">
                <option>Anil Kumar Nair</option>
                <option>Priya Subramaniam</option>
                <option>Deepak Menon</option>
              </select>
            </div>
          </div>
          <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-navy">Save Client</button>
          </div>
        </form>
      </div>
    </div>
  );
};