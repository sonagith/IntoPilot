// src/components/IntegrationModal.tsx
import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  integrations: any[];
}

export const IntegrationModal: React.FC<Props> = ({ isOpen, onClose, integrations }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal int-modal" onClick={e => e.stopPropagation()}>
        <div className="int-head">
          <div className="int-head-left">
            <div className="int-head-icon">🔌</div>
            <div className="int-head-text">
              <h2>Integrations</h2>
              <p>Connect your platforms</p>
            </div>
          </div>
          <button className="int-close" onClick={onClose}>✕</button>
        </div>
        
        <div className="int-list">
          {integrations.map((intg: any) => (
            <div className="int-item" key={intg.id}>
              <div className="int-item-left">
                <div className="int-icon">{intg.icon}</div>
                <div>
                  <div className="int-title">{intg.name}</div>
                  <div className="int-desc">{intg.description}</div>
                </div>
              </div>
              <div>
                {intg.isConnected ? (
                  <button className="btn-connected">✓ Connected</button>
                ) : (
                  <button className="btn-connect">🔗 Connect</button>
                )}
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', padding: '15px', background: '#fff', borderTop: '1px solid #f0f0f0' }}>
           <button style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};