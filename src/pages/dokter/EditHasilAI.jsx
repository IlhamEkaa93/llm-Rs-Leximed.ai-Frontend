import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, Edit3, CheckCircle, AlertCircle, 
  History, Loader2, Sparkles, Save, Info 
} from 'lucide-react';
import './EditHasilAI.css';

export default function EditHasilAI() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);
  const [aiDraft, setAiDraft] = useState("");
  const [patient, setPatient] = useState(null);
  const [lastAudit, setLastAudit] = useState(null);

  // 1. Ambil data pasien aktif dan draft AI terakhir dari DB
  useEffect(() => {
    const fetchData = async () => {
      const savedPatient = localStorage.getItem('active_patient');
      if (!savedPatient) {
        navigate('/dashboard');
        return;
      }

      const patientObj = JSON.parse(savedPatient);
      setPatient(patientObj);

      try {
        // Mengambil log AI terakhir untuk pasien ini dari PostgreSQL
        const response = await fetch(`http://localhost:8000/api/dashboard-stats`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
        });
        
        // Simulasi pengambilan draft terakhir dari tabel audit_logs via backend
        // Dalam implementasi nyata, buatlah endpoint khusus GET /api/audit-logs/{patient_id}
        const mockDraft = `Keluhan Utama: Sesak napas memberat.\nAnalisis AI: Pneumonia Bakterial.\nSaran: Terapi O2 & Antibiotik.`;
        setAiDraft(mockDraft);
        setLastAudit(new Date().toLocaleTimeString());
      } catch (error) {
        console.error("Gagal sinkronisasi database:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleEdit = (e) => {
    setAiDraft(e.target.value);
    setHasChanged(true);
  };

  // 2. Fungsi Simpan Final ke PostgreSQL (Audit Log)
  const handleFinalApprove = async () => {
    if (!patient) return;
    
    setIsSaving(true);
    try {
      const response = await fetch("https://lexi-med-ai-llm-rs-back-end.vercel.app/process-ai?action=final_verification", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ 
          teks: aiDraft, // Draft yang sudah diedit dokter
          patient_id: patient.id 
        })
      });

      if (!response.ok) throw new Error("Gagal menyimpan ke database.");

      alert("Verifikasi DPJP Berhasil. Data telah tersimpan secara permanen di Audit Log.");
      navigate('/resume'); // Arahkan ke halaman Resume Medis setelah approve
    } catch (e) {
      alert("Error Database: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="animate-spin text-blue-600 mr-2" /> Menarik data rekam medis...
    </div>
  );

  return (
    <div className="edit-ai-page animate-fade-in">
      <div className="edit-ai-header">
        <div className="title-block">
          <h1><Edit3 size={24} className="text-blue-600" /> Verifikasi DPJP</h1>
          <p>Pasien: <strong>{patient?.name}</strong> | No. RM: <strong>{patient?.norm}</strong></p>
        </div>
        <div className="edit-status">
          {hasChanged ? 
            <span className="status-badge modified">Draft Telah Diedit</span> : 
            <span className="status-badge original">Original AI Draft</span>
          }
        </div>
      </div>

      <div className="edit-layout">
        <div className="editor-main">
          <div className="editor-toolbar">
            <div className="toolbar-left">
              <Bot size={18} /> <span>Volt Backend Engine (Llama 3)</span>
            </div>
            <div className="toolbar-right">
              <Sparkles size={16} /> <span>Smart Validation Active</span>
            </div>
          </div>
          
          <textarea 
            className="ai-textarea glow-input"
            value={aiDraft}
            onChange={handleEdit}
            placeholder="Memuat data AI..."
          />
          
          <div className="validation-notice">
            <AlertCircle size={18} className="text-amber-500" />
            <p><strong>Legalitas:</strong> Dokumen ini hanya sah menjadi rekam medis elektronik setelah DPJP menekan tombol Approve & Simpan.</p>
          </div>
        </div>

        <div className="editor-sidebar">
          <div className="sidebar-card info-card">
            <h4><History size={16} /> Audit Trail Database</h4>
            <p className="small-text">Log aktivitas PostgreSQL untuk kepatuhan regulasi.</p>
            <div className="change-log">
              <div className="log-item"><span>{lastAudit}</span> AI Generated Draft</div>
              {hasChanged && <div className="log-item active"><span>Baru Saja</span> Perbaikan Manual Dokter</div>}
            </div>
          </div>

          <div className="sidebar-card action-card shadow-glow">
            <button 
              className="btn-approve-save" 
              onClick={handleFinalApprove}
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="spin" /> : <Save size={20} />}
              Approve & Sinkron HIS
            </button>
            <p className="btn-hint">Data akan dikirim ke tabel AuditLog dan di-lock.</p>
          </div>
        </div>
      </div>
    </div>
  );
}