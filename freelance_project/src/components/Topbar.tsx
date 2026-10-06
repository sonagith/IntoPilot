// src/components/Topbar.tsx
import React, { useState, useRef, useEffect } from 'react';
import { API_URL } from '../services/api'; 
import { Settings, LogOut, ChevronDown } from 'lucide-react'; 

interface TopbarProps {
  onOpenIntegrations: () => void;
  profile: any; 
  onSignOut: () => void;
  // Tab change function add kiya gaya
  onNavigateToProfile: () => void; 
}

export const Topbar: React.FC<TopbarProps> = ({  profile, onSignOut, onNavigateToProfile }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const businessName = profile?.business_name || "";
  const logoUrl = profile?.logo_url || null; 
  const ownerName = profile?.owner_name || "";

  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div 
      className="topbar" 
      style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 100, 
        backgroundColor: '#FFFF', 
        display: 'flex',
        justifyContent: 'flex-end', 
        alignItems: 'center',
        padding: '17px 24px',
        borderBottom: '1px solid #eef0f7'
      }}
    >
      <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        
        {/* Name and Logo Pill */}
        <div style={{ display: 'flex', alignItems: 'center', background: '#f5f0e6', borderRadius: '30px', padding: '6px 6px 6px 18px', gap: '12px' }}>
            <span style={{ fontWeight: 700, fontSize: '15.5px', color: '#0d3613' }}>
              {businessName || "AscentiQ AI Group"}
            </span>
            
            {logoUrl ? (
              <img 
                src={`${API_URL}${logoUrl}`} 
                alt="Logo" 
                style={{ width: '67px', height: '32px', objectFit: 'contain', borderRadius: '4px' }} 
              />
            ) : (
              <img 
                src="/Ascentiq_logo.jpeg" 
                alt="Ascentiq Logo" 
                style={{ width: '67px', height: '32px', objectFit: 'contain', borderRadius: '4px' }} 
              />
            )}
        </div>

        {/* Profile Dropdown Container */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{ 
                    background: 'transparent', 
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px', 
                    cursor: 'pointer',
                    padding: 0
                }}
            >
                {/* Original Circle Avatar */}
                <div style={{
                    background: '#2c2e2a',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '35px', 
                    height: '35px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '15px',
                    fontWeight: 700,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                }}>
                    {getInitials(ownerName || "Atishay Jain")}
                </div>
                
                <ChevronDown 
                  size={14} 
                  color="#333"
                  style={{ 
                    transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', 
                    transition: 'transform 0.2s ease-in-out' 
                  }} 
                />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
                <div style={{
                    position: 'absolute',
                    top: '52px',
                    right: 0,
                    background: '#fff',
                    border: '1px solid #eef0f7',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    width: '180px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 1000
                }}>
                    <button 
                        onClick={() => { 
                            onNavigateToProfile(); 
                            setDropdownOpen(false); // Menu close karo redirect ke baad
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: 'transparent', border: 'none', borderBottom: '1px solid #eef0f7', width: '100%', textAlign: 'left', fontSize: '14px', fontWeight: 500, color: '#333', cursor: 'pointer' }}
                    >
                        <Settings size={16} /> Account Settings
                    </button>
                    
                    <button 
                        onClick={onSignOut}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: 'transparent', border: 'none', width: '100%', textAlign: 'left', fontSize: '14px', fontWeight: 600, color: '#0d3613', cursor: 'pointer' }}
                    >
                        <LogOut size={16} color="#0d3613" /> Log Out
                    </button>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};