// src/components/AddStaffModal.tsx
import React from 'react';
import { addStaffAPI } from '../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddStaffModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await addStaffAPI(formData);
      alert('Staff Member Added!');
      onClose();
      onSuccess();
    } catch (err) {
      alert("Failed to add staff");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <h2>Add Staff Member</h2>
        <div className="m-sub">Assign a new recovery or sales officer</div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
            <div className="field"><label>Full Name *</label><input name="name" required placeholder="e.g. Ramesh Kumar" /></div>
            <div className="field"><label>Role *</label><input name="role" required placeholder="e.g. Recovery Officer" /></div>
            <div className="field"><label>Phone Number *</label><input name="phone" required placeholder="+91 90000 00000" /></div>
          </div>
          <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-navy">Save Staff</button>
          </div>
        </form>
      </div>
    </div>
  );
};