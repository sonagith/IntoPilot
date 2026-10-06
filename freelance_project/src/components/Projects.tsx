// src/components/Projects.tsx
import React, { useState } from 'react';
import { fmtINR, projectStats } from '../utils/helpers';
import toast from 'react-hot-toast';
import { addProjectAPI, updateProjectAPI, deleteProjectAPI } from '../services/api';
import { Edit2, Trash2, Plus } from 'lucide-react';

interface ProjectsProps {
  cases: any[];
  projects: any[];
  setSelectedProject: (id: string) => void;
  setActiveTab: (tab: string) => void;
  openAddClientModal: () => void;
  triggerAppReload: () => void; // App.tsx se loadBackendData aayega
}

const premiumInput = {
  width: '100%', padding: '12px 16px', borderRadius: '8px', 
  border: '1px solid #d1d5db', backgroundColor: '#f9fafb',
  fontSize: '14px', outline: 'none', transition: 'all 0.2s',
  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)',
  marginBottom: '8px',
  boxSizing: 'border-box' as const // Ensure padding doesn't increase width
};

export const Projects: React.FC<ProjectsProps> = ({ cases, projects, setSelectedProject, setActiveTab, openAddClientModal, triggerAppReload }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [isBtnHovered, setIsBtnHovered] = useState(false);

  // 1. ADD PROJECT
  const handleAddProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      const res = await addProjectAPI(formData);
      if (res.status === 'success') {
        toast.success(res.message);
        setIsAddModalOpen(false);
        triggerAppReload();
      } else { toast.error(res.message); }
    } catch { toast.error('Server error adding project'); }
  };

  // 2. EDIT PROJECT
  const openEditModal = (p: any) => {
    setEditingProject(p);
    setIsEditModalOpen(true);
  };

  const handleEditProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append('id', editingProject.id); // Hidden ID field
    try {
      const res = await updateProjectAPI(formData);
      if (res.status === 'success') {
        toast.success(res.message);
        setIsEditModalOpen(false);
        triggerAppReload();
      } else { toast.error(res.message); }
    } catch { toast.error('Server error updating project'); }
  };

  // 3. DELETE PROJECT
  const handleDeleteProject = async (p: any) => {
    const stats = projectStats(cases, p.id);
    if (stats.count > 0) {
      toast.error('Cannot delete: Project has registered clients.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete ${p.name}? This action cannot be undone.`)) return;

    const formData = new FormData();
    formData.append('id', p.id);
    try {
      const res = await deleteProjectAPI(formData);
      if (res.status === 'success') {
        toast.success(res.message);
        triggerAppReload();
      } else { toast.error(res.message); }
    } catch { toast.error('Server error deleting project'); }
  };

  return (
    <div>
      
      <div className="page-head">
  <div><h1>Projects</h1><p>{projects.length} active real estate projects</p></div>
  <div style={{ display: 'flex', gap: '10px' }}>
    
    {/* Updated Button with Hover/Click Color Change */}
    <button 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        // Normal condition me #8a9b8c, click/hover par #758A78
        background: isBtnHovered ? '#758A78' : '#8a9b8c', 
        color: '#fff', 
        border: 'none', 
        padding: '10px 10px', 
        borderRadius: '8px', 
        cursor: 'pointer', 
        fontWeight: 500,
        fontSize: '14px',
        transition: 'background 0.2s ease' // Smooth color transition ke liye
      }} 
      onMouseEnter={() => setIsBtnHovered(true)}
      onMouseLeave={() => setIsBtnHovered(false)}
      onMouseDown={() => setIsBtnHovered(true)}
      onClick={() => setIsAddModalOpen(true)}
    >
      <Plus size={16} style={{ marginRight: '6px' }} /> Add New Project
    </button>

  </div>
</div>

      {projects.map(p => {
        const s = projectStats(cases, p.id);
        return (
          <div key={p.id} className="proj-card">
            <div className="proj-card-top">
              <div>
                <div className="proj-name">{p.name}</div>
                <div className="proj-loc">{p.location} (Prefix: {p.plotPrefix || '—'})</div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-sm btn-outline" style={{ padding: '6px', borderRadius: '6px' }} onClick={() => openEditModal(p)} title="Edit Project">
                  <Edit2 size={16} />
                </button>
                <button className="btn btn-sm btn-outline" style={{ padding: '6px', borderRadius: '6px', color: '#dc2626', borderColor: '#fca5a5' }} onClick={() => handleDeleteProject(p)} title="Delete Project">
                  <Trash2 size={16} />
                </button>
                <button className="btn btn-sm btn-navy" onClick={() => { setSelectedProject(p.id); setActiveTab('clients'); }}>View Clients &rarr;</button>
              </div>
            </div>
            <div className="proj-mini-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
              <div className="pms"><div className="l">Clients</div><div className="v">{s.count}</div></div>
              <div className="pms"><div className="l">Portfolio Value</div><div className="v">{fmtINR(s.totalValue)}</div></div>
              <div className="pms"><div className="l">Recovered</div><div className="v" style={{ color: 'var(--green)' }}>{fmtINR(s.collected)}</div></div>
              <div className="pms"><div className="l">Recovery Rate</div><div className="v">{s.rate}%</div></div>
            </div>
          </div>
        );
      })}

      {/* Add Project Modal */}
      {/* Add Project Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Add New Project</h2>
            <div className="m-sub">Create a new real estate development or phase.</div>
            <form onSubmit={handleAddProject}>
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ width: '100%' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 600 }}>Project Name *</label>
                  <input style={premiumInput} name="name" required placeholder="e.g. Green Valley Phase 3" />
                </div>
                <div style={{ width: '100%' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 600 }}>Location *</label>
                  {/* 🔴 Ensure name="location" */}
                  <input style={premiumInput} name="location" required placeholder="e.g. Bhopal, MP" />
                </div>
                
                <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 600 }}>Plot Prefix (Optional)</label>
                    {/* 🔴 Ensure name="plotPrefix" matching FastAPI */}
                    <input style={premiumInput} name="plotPrefix" placeholder="e.g. H" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 600 }}>Target Capacity (Plots)</label>
                    {/* 🔴 Ensure name="targetClients" matching FastAPI */}
                    <input style={premiumInput} type="number" name="targetClients" defaultValue={100} />
                  </div>
                </div>
              </div>
              <div className="modal-actions" style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-navy" style={{ background: '#758A78', color: 'white', border: 'none' }}>Save Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {isEditModalOpen && editingProject && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Edit Project</h2>
            <div className="m-sub">Update details for {editingProject.name}.</div>
            <form onSubmit={handleEditProject}>
              {/* FIXED GRID LAYOUT */}
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ width: '100%' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 600 }}>Project Name *</label>
                  <input style={premiumInput} name="name" defaultValue={editingProject.name} required />
                </div>
                <div style={{ width: '100%' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 600 }}>Location *</label>
                  <input style={premiumInput} name="location" defaultValue={editingProject.location} required />
                </div>
                
                {/* 50-50 Split for smaller inputs */}
                <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 600 }}>Plot Prefix</label>
                    <input style={premiumInput} name="plotPrefix" defaultValue={editingProject.plotPrefix} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 600 }}>Target Capacity (Plots)</label>
                    <input style={premiumInput} type="number" name="targetClients" defaultValue={editingProject.targetClients} />
                  </div>
                </div>
              </div>
              <div className="modal-actions" style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-navy" style={{ background: '#758A78', color: 'white', border: 'none' }}>Update Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};