// src/components/ImportData.tsx
import React, { useState } from 'react';
import { 
  Download, UploadCloud, CheckCircle2, X, ShieldCheck, ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import { importExcelAPI } from '../services/api';
import * as XLSX from 'xlsx';

interface Props {
  projects: any[];
  onSuccess: () => void;
}

interface ImportSummary {
  imported: number;
  skipped: number;
  failed_details: { row: number; reason: string }[];
}

export const ImportData: React.FC<Props> = ({ projects, onSuccess }) => {
  const [selectedProject, setSelectedProject] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<ImportSummary | null>(null);

  const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    // 🔴 Naye aur purane saare columns yahan add kar diye hain
    const ws_data = [
      [
        "Buyer Name", "Phone", "Email", "Address", "PAN", "Aadhar ID", "National ID", // KYC Data
        "Plot Number", "Survey Number", "Facing", "Extent (SqFt)", "Rate/SqFt", "Total Plot Value", // Plot Data
        "Booking Date", "End Date", "Agreement No", "Total DP", "Monthly EMI", "Next Due Date", "Due Balance", // Timeline & Balances
        "Booked By", "Commission per Sqft", "Commission Paid", // Staff & Commission
        "Payment Date", "Amount", "Mode/Bank", "Cheque / RTGS No", "Remarks" // Additional Payment
      ]
    ];
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    XLSX.utils.book_append_sheet(wb, ws, "Import_Data");
    XLSX.writeFile(wb, "IntoPilot_Import_Template.xlsx");
  };

  const handleImport = async () => {
    if (!selectedProject) return toast.error("Please select a project");
    if (!file) return toast.error("Please select an Excel file");

    setLoading(true);
    setSummary(null); 
    const formData = new FormData();
    formData.append('project_id', selectedProject);
    formData.append('file', file);

    const tid = toast.loading("Processing Excel File...");
    try {
      const res = await importExcelAPI(formData);
      if (res.status === 'success') {
        toast.success(res.message, { id: tid });
        onSuccess();
        setSummary(res.summary); 
        setFile(null); 
      }
    } catch (err: any) {
      toast.error(err.message, { id: tid });
    }
    setLoading(false);
  };

  const bgColor = '#FEFCF6';
  const btnColor = '#758A78';

  return (
    <div style={{ backgroundColor: bgColor, minHeight: '100vh', padding: '6px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: 700, margin: 0, color: '#0D3613' }}>Import Excel Data</h1>
            </div>
            <p style={{ color: '#0d3613', fontSize: '14px',fontWeight:'600', margin: 0 }}>Follow the 3 steps below to securely import and validate your structured data across the platform.</p>
          </div>
        </div>

        {summary ? (
          <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <CheckCircle2 size={56} color={btnColor} style={{ marginBottom: '12px' }}/>
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b' }}>Import Completed</h2>
              <p style={{ color: '#64748b', fontSize: '15px' }}>
                Imported: {summary.imported} | Skipped: {summary.skipped}
              </p>
              {summary.failed_details.length > 0 && (
                <div style={{ textAlign: 'left', marginTop: '20px', background: '#fff1f2', padding: '15px', borderRadius: '8px' }}>
                  <p style={{ color: '#be123c', fontWeight: 'bold', margin: '0 0 10px 0' }}>Errors encountered:</p>
                  <ul style={{ color: '#be123c', fontSize: '13px', margin: 0 }}>
                    {summary.failed_details.map((f, i) => (
                      <li key={i}>Row {f.row}: {f.reason}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
              <button 
                onClick={() => setSummary(null)} 
                style={{ padding: '12px 24px', fontSize: '15px', backgroundColor: '#fff', border: `1px solid ${btnColor}`, color: btnColor, borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
              >
                Import Another File
              </button>
            </div>
          </div>
        ) : (
          <div>
            
            <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ backgroundColor: '#0d3613', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 600, flexShrink: 0 }}>1</div>
                  <div>
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 700, color: '#0d3613', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      Download Standard Template
                    </h3>
                    <p style={{ margin: 0, color: '#0d3613', fontWeight:'600',fontSize: '13px' }}>Fill out the single <code style={{ backgroundColor: '#f1f5f9', padding: '2px 4px', borderRadius: '4px' }}>"Import_Data"</code> sheet inside the Excel file. Do not alter column headers or formulas.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <button onClick={downloadTemplate} style={{ backgroundColor: '#fff', border: '1px solid #0d3613', padding: '8px 16px', borderRadius: '6px', color: '#0d3613', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <Download size={16} color={btnColor} /> Download Standard Format
                  </button>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ backgroundColor: '#0d3613', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 600, flexShrink: 0 }}>2</div>
                  <div>
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 700, color: '#0d3613' }}>Select Target Destination</h3>
                    <p style={{ margin: 0, color: '#0d3613', fontWeight:'600', fontSize: '13px' }}>Choose the project workspace where incoming records will be synchronized.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ position: 'relative', width: '300px' }}>
                    <select 
                      style={{ 
                        width: '100%', padding: '10px 16px', borderRadius: '6px', 
                        border: '1px solid #0D3613', fontSize: '14px', fontWeight:'600',
                        color:'#0D3613', appearance: 'none', backgroundColor: '#fff', cursor: 'pointer' 
                      }} 
                      value={selectedProject} 
                      onChange={e => setSelectedProject(e.target.value)}
                    >
                      <option value="">Choose Target Project Workspace</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <ChevronDown size={16} color="#64748b" style={{ position: 'absolute', right: '12px', top: '12px', pointerEvents: 'none' }} />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ backgroundColor: '#0d3613', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 600, flexShrink: 0 }}>3</div>
                  <div>
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 700, color: '#0d3613' }}>Upload Filled File & Validate</h3>
                    <p style={{ margin: 0, color: '#0d3613',fontWeight:'600', fontSize: '13px' }}>Upload your populated spreadsheet for real-time validation and dry-run execution.</p>
                  </div>
                </div>
              </div>

              <div style={{ paddingLeft: '44px' }}>
                {!file ? (
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="file" id="excel-upload" accept=".xlsx, .xls, .csv" 
                      onChange={e => setFile(e.target.files ? e.target.files[0] : null)} 
                      style={{ display: 'none' }} 
                    />
                    <label 
                      htmlFor="excel-upload"
                      style={{ 
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        width: '100%', padding: '40px 20px', border: `2px dashed #cbd5e1`, 
                        borderRadius: '8px', backgroundColor: '#fafafa', cursor: 'pointer'
                      }} 
                    >
                      <div style={{ backgroundColor: '#f0fdf4', padding: '12px', borderRadius: '50%', marginBottom: '12px' }}>
                        <UploadCloud size={24} color={btnColor} />
                      </div>
                      <span style={{ fontSize: '15px', color: '#0d3613', marginBottom: '4px' }}>
                        <span style={{ color: btnColor, fontWeight: 500 }}>Click to browse</span> or drag and drop your spreadsheet
                      </span>
                    </label>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: `1px solid #bbf7d0`, backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ backgroundColor: btnColor, color: '#fff', padding: '8px', borderRadius: '6px', fontWeight: 700, fontSize: '12px' }}>
                        XLS
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{file.name}</span>
                          <span style={{ backgroundColor: '#dcfce7', color: btnColor, fontSize: '11px', padding: '2px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={12} /> Ready
                          </span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => setFile(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                      <X size={20} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px' }}>
                <ShieldCheck size={16} color={btnColor} /> 
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', padding: '10px 20px', borderRadius: '6px', color: '#334155', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleImport} 
                  disabled={loading || !file || !selectedProject} 
                  style={{ 
                    backgroundColor: btnColor, color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px',
                    opacity: (loading || !file || !selectedProject) ? 0.6 : 1,
                    cursor: (loading || !file || !selectedProject) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? "Processing..." : "Start Import & Validate →"}
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};