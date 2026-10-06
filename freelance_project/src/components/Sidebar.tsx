// src/components/Sidebar.tsx
import React, { useState } from 'react';
import { BarChart3, FileText, Building, Users, Calendar, User, ChevronLeft, ChevronRight, UploadCloud } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSignOut: () => void;
  profile: any; 
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { key: 'overview', label: 'Overview', icon: <BarChart3 size={17} /> },
    { key: 'projects', label: 'Projects', icon: <Building size={17} /> },
    { key: 'import', label: 'Import Data', icon: <UploadCloud size={17} /> },
    { key: 'clients', label: 'Recovery Clients', icon: <Users size={17} /> },
    { key: 'invoices', label: 'Invoices', icon: <FileText size={17} /> },
    { key: 'installments', label: 'Installments', icon: <Calendar size={17} /> },
    { key: 'profile', label: 'Profile', icon: <User size={17} /> },
  ];

  // const ownerName = profile?.owner_name || "";

  // const getInitials = (name: string) => {
  //   if (!name) return "U";
  //   const parts = name.split(' ');
  //   if (parts.length > 1) {
  //     return (parts[0][0] + parts[1][0]).toUpperCase();
  //   }
  //   return name.substring(0, 2).toUpperCase();
  // };

  return (
    <div style={{ display: 'flex', position: 'sticky', top: 0, height: '100vh', zIndex: 9999 }}>
      <div 
        className="sidebar" 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100%', 
          width: isCollapsed ? '80px' : '250px',
          transition: 'width 0.3s ease',
          backgroundColor: '#fff',
          borderRight: '1px solid #eef0f7',
          position: 'relative'
        }}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
              position: 'absolute',
              right: '-12px',
              top: '25px',
              background: '#fff',
              border: '1px solid #eef0f7',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              zIndex: 10000, 
              padding: 0
          }}
        >
          {isCollapsed ? <ChevronRight size={14} color="#333" /> : <ChevronLeft size={14} color="#333" />}
        </button>

        <div className="sidebar-top" style={{ padding: isCollapsed ? '20px 10px' : '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="brand-icon" style={{ minWidth: '40px', display: 'flex', justifyContent: 'center' }}>
                <img 
                  src="/Ascentiq_logo.jpeg" 
                  alt="Ascentiq Logo" 
                  style={{ width: '32px', height: '32px', objectFit: 'contain', borderRadius: '4px' }} 
                />
              </div>
              {!isCollapsed && (
              <div style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
                  <div className="brand-name">IntoPilot</div>
                  <div className="brand-sub">By AscentiQ AI</div>
              </div>
              )}
          </div>
        </div>

        <div className="nav" style={{ flexGrow: 1, overflowY: 'auto', overflowX: 'hidden', padding: isCollapsed ? '10px 5px' : '17px 20px' }}>
          {navItems.map((item) => (
            <button
              key={item.key}
              title={isCollapsed ? item.label : ""} 
              onClick={() => setActiveTab(item.key)}
              /* Add active class dynamically here */
              className={activeTab === item.key ? "active" : ""}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                border: 'none', // Reset default button border
              }}
            >
              <span className="nav-ico" style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span> 
              {!isCollapsed && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 'auto', padding: isCollapsed ? '10px 5px' : '10px 20px', overflow: 'hidden' }}>
          {/* <div className="sidebar-bottom">
            <button 
              onClick={onSignOut} 
              title={isCollapsed ? "Sign out" : ""}
              className="signout" 
              style={{ 
                background: 'none', 
                border: 'none', 
                width: '100%', 
                textAlign: 'left', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                gap: '8px',
                padding: isCollapsed ? '10px' : '10px 12px',
                color: '#0D3613' 
              }}
            >
              <LogOut size={16} /> 
              {!isCollapsed && <span style={{ whiteSpace: 'nowrap' }}>Sign out</span>}
            </button>
          </div>

          <div className="sidebar-user" style={{ marginTop: '10px', display: 'flex', justifyContent: isCollapsed ? 'center' : 'flex-start', alignItems: 'center', gap: '10px' }}>
            <div className="avatar" style={{ minWidth: '35px' }}>{getInitials(ownerName)}</div>
            {!isCollapsed && (
              <div style={{ whiteSpace: 'nowrap' }}>
                <div className="u-name">{ownerName}</div>
                <div className="u-role">Admin Account</div>
              </div>
            )}
          </div> */}
        </div>
      </div>
    </div>
  );
};