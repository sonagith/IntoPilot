// src/App.tsx
import { useState, useEffect } from 'react';
import Login from './components/Login';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Overview } from './components/Overview';
import { Invoices } from './components/Invoices';
import { RecoveryClients } from './components/RecoveryClients';
import { CaseDetail } from './components/CaseDetail';
import { Installments } from './components/Installments';
import { Profile } from './components/Profile';
import { Projects } from './components/Projects';
import toast, { Toaster } from 'react-hot-toast';

import { IntegrationModal } from './components/IntegrationModal';
import { AddClientModal } from './components/AddClientModal';
import { RecordPaymentModal } from './components/RecordPaymentModal';
// 🔴 Dedicated Import Page
import { ImportData } from './components/ImportData';

import { fetchDashboardData } from './services/api';
import './index.css';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('overview');

  const [dbCases, setDbCases] = useState<any[]>([]);
  const [dbProjects, setDbProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dbProfile, setDbProfile] = useState<any>(null);
  const [dbIntegrations, setDbIntegrations] = useState<any[]>([]);

  const [selectedCaseId, setSelectedCaseId] = useState<number>(1);
  const [selectedProject, setSelectedProject] = useState<string>('');

  // Modal States
  const [isIntegrationModalOpen, setIsIntegrationModalOpen] = useState<boolean>(false);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState<boolean>(false);
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState<boolean>(false);

  const [targetCaseForPayment, setTargetCaseForPayment] = useState<number>(1);

  const loadBackendData = async () => {
    setIsLoading(true);
    try {
      const response = await fetchDashboardData();
      if(response.status === "success") {
        setDbCases(response.cases || []);
        setDbProjects(response.projects || []);
        setDbProfile(response.profile || null);
        setDbIntegrations(response.integrations || []);

        if (response.projects && response.projects.length > 0 && !selectedProject) {
          setSelectedProject(response.projects[0].id);
        }
      }
    } catch (err) {
      console.error(err);
      handleSignOut();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('intopilot_token');
    if (token) {
      setIsAuthenticated(true);
      loadBackendData();
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('intopilot_token');
    localStorage.removeItem('user_email');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => { setIsAuthenticated(true); loadBackendData(); }} />;
  }

  if (isLoading && dbCases.length === 0) {
    return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontWeight: 'bold' }}>Loading Database...</div>;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        // Overview mein hum openAddClientModal pass kar rahe hain (Error fixed in Overview.tsx)
        return <Overview cases={dbCases} projects={dbProjects} profile={dbProfile} setActiveTab={setActiveTab} setSelectedCaseId={setSelectedCaseId} setSelectedProject={setSelectedProject} openAddClientModal={() => setIsAddClientModalOpen(true)} />;
      case 'invoices':
        return <Invoices cases={dbCases} projects={dbProjects} setSelectedCaseId={setSelectedCaseId} setActiveTab={setActiveTab} />;
      case 'projects':
        // Projects mein hum openAddClientModal pass kar rahe hain
        return <Projects cases={dbCases} projects={dbProjects} setSelectedProject={setSelectedProject} setActiveTab={setActiveTab} openAddClientModal={() => setIsAddClientModalOpen(true)} triggerAppReload={loadBackendData} />;
      case 'clients':
        return <RecoveryClients cases={dbCases} projects={dbProjects} selectedProject={selectedProject} setSelectedProject={setSelectedProject} setSelectedCaseId={setSelectedCaseId} setActiveTab={setActiveTab} openAddClientModal={() => setIsAddClientModalOpen(true)} />;
      case 'case-detail':
        return <CaseDetail 
            cases={dbCases} 
            caseId={selectedCaseId} 
            setActiveTab={setActiveTab} 
            openAddPaymentModal={(id) => { setTargetCaseForPayment(id); setIsAddPaymentModalOpen(true); }}
            onRefresh={loadBackendData} // 🔴 Ye wali line zaroor add karna 
         />;
      case 'installments':
        return <Installments cases={dbCases} projects={dbProjects} setSelectedCaseId={setSelectedCaseId} setActiveTab={setActiveTab} />;
      case 'import':
        return <ImportData projects={dbProjects} onSuccess={loadBackendData} />;
      case 'profile':
        return <Profile onOpenIntegrations={() => setIsIntegrationModalOpen(true)} triggerAppReload={loadBackendData} />;
      default:
        return <Overview cases={dbCases} projects={dbProjects} profile={dbProfile} setActiveTab={setActiveTab} setSelectedCaseId={setSelectedCaseId} setSelectedProject={setSelectedProject} openAddClientModal={() => setIsAddClientModalOpen(true)} />;
    }
  };

  return (
    <div className="shell">
      <Toaster position="top-right" reverseOrder={false}>
        {(t) => (
          <div
            style={{
              opacity: t.visible ? 1 : 0,
              transform: t.visible ? 'translateY(0)' : 'translateY(-20px)',
              transition: 'all 0.2s ease-out',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              minWidth: '300px',
              padding: '12px 16px',
              borderRadius: '6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              background: t.type === 'success' ? '#15803d' : t.type === 'error' ? '#dc2626' : '#041936',
              color: '#ffffff',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {t.type === 'success' && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              )}
              {t.type === 'error' && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
              )}
              {t.type === 'blank' && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              )}

              <span style={{ fontSize: '14.5px', fontWeight: 500, letterSpacing: '0.2px' }}>
                {typeof t.message === 'function' ? t.message(t) : t.message}
              </span>
            </div>

            <button 
              onClick={() => toast.dismiss(t.id)} 
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', opacity: 0.8 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        )}
      </Toaster>

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onSignOut={handleSignOut} profile={dbProfile} />

      <div className="main">
        {/* Topbar fixed. Passing ALL required props */}
        <Topbar 
          onOpenIntegrations={() => setIsIntegrationModalOpen(true)} 
          profile={dbProfile} 
          onSignOut={handleSignOut} 
          onNavigateToProfile={() => setActiveTab('profile')} 
        />
        <div className="content">
          {renderContent()}
        </div>
      </div>

      <IntegrationModal isOpen={isIntegrationModalOpen} onClose={() => setIsIntegrationModalOpen(false)} integrations={dbIntegrations} />
      <AddClientModal isOpen={isAddClientModalOpen} onClose={() => setIsAddClientModalOpen(false)} projects={dbProjects} onSuccess={loadBackendData} />
      <RecordPaymentModal isOpen={isAddPaymentModalOpen} onClose={() => setIsAddPaymentModalOpen(false)} caseId={targetCaseForPayment} onSuccess={loadBackendData} />

      <div className="page-bg-glow"></div>
    </div>
  );
}

export default App;