import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, RefreshCw, CheckCircle, AlertTriangle, FileText, 
  Zap, Loader2, ArrowRight, ClipboardList, LayoutDashboard, 
  ShieldCheck, Database, ChevronRight 
} from 'lucide-react';

export default function RingkasanMedis() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [patient, setPatient] = useState(null);
  const [showExitOptions, setShowExitOptions] = useState(false);

  const API_URL = "http://localhost:8000/api";
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    const saved = localStorage.getItem('active_patient');
    if (!saved) {
      navigate('/dashboard');
    } else {
      const data = JSON.parse(saved);
      setPatient(data);
      // Gunakan norm atau no_rm sesuai struktur data database Anda
      fetchSummary(data.norm || data.no_rm);
    }
  }, [navigate]);

  // FUNGSI TARIK DATA DARI DATABASE (POSTGRESQL)
  const fetchSummary = async (norm) => {
    if (!norm) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/clinical-data/${norm}`, {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      
      const data = await res.json();
      
      if (res.ok && data.ai_summary) {
        setAiResult(data.ai_summary);
        // Jika data dari DB sudah verified, kunci tombol
        if (data.status === 'verified') setIsVerified(true);
      } else {
        // Tampilkan pesan jika draf belum dibuat di halaman Input Klinis
        setAiResult("");
        alert(data.message || "Draf AI tidak ditemukan. Silakan isi 'Input Klinis AI' terlebih dahulu.");
      }
    } catch (e) {
      console.error("Connection Error:", e);
      alert("Gagal terhubung ke Server DARSI.");
    } finally {
      setLoading(false);
    }
  };

  // FUNGSI VERIFIKASI (SIMPAN PERMANEN KE DB)
  const handleApprove = async () => {
    if (!aiResult) return alert("Data klinis kosong.");
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/clinical-data/${patient.norm || patient.no_rm}/verify`, {
        method: "PATCH",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          final_summary: aiResult // Mengirim hasil edit manual dokter jika ada
        })
      });

      if (response.ok) {
        setIsVerified(true);
        setShowExitOptions(true);
      } else {
        alert("Gagal melakukan verifikasi ke database.");
      }
    } catch (e) {
      alert("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  if (!patient) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-left pb-20">
      
      {/* MODAL VERIFIKASI (HUMAN-IN-THE-LOOP SUCCESS) */}
      <AnimatePresence>
        {showExitOptions && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] p-8 md:p-12 text-center shadow-2xl border border-slate-100"
            >
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
                <CheckCircle size={48} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Terverifikasi!</h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-10">
                Ringkasan medis pasien <span className="font-bold text-slate-800">{patient.name}</span> telah aman tersimpan di database PostgreSQL RS UNS.
              </p>
              
              <div className="flex flex-col gap-3">
                <button onClick={() => navigate('/resume')} className="w-full p-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold flex items-center justify-between shadow-lg transition-all">
                  <span className="flex items-center gap-3"><ClipboardList size={20} /> Resume Medis</span>
                  <ChevronRight size={20} />
                </button>
                <button onClick={() => navigate('/dashboard')} className="mt-6 text-xs font-black text-slate-400 hover:text-blue-600 tracking-[0.2em] uppercase flex items-center justify-center gap-2">
                  <LayoutDashboard size={14}/> Kembali ke Dashboard
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER SECTION */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200"><Bot size={28} /></div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">AI Summarizer</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-500">
            <span>Pasien:</span>
            <b className="text-slate-900">{patient.name}</b>
            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full mx-1"></span>
            <span className="bg-blue-50 border border-blue-100 px-3 py-0.5 rounded-lg font-mono text-blue-600">RM: {patient.norm || patient.no_rm}</span>
          </div>
        </div>

        <button 
          onClick={() => fetchSummary(patient.norm || patient.no_rm)} 
          className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm uppercase transition-all border shadow-sm ${
            loading ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white text-slate-700 hover:bg-slate-50'
          }`}
          disabled={loading || isVerified}
        >
          <RefreshCw className={loading ? "animate-spin" : ""} size={18} />
          {loading ? "Syncing..." : "Refresh Data DB"}
        </button>
      </motion.header>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        <motion.div 
          initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
          className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden"
        >
          <div className="bg-slate-50/80 px-8 py-5 border-b border-slate-100 flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Zap size={14} className="text-orange-500" fill="currentColor"/> Analisis Llama 3.3
            </span>
            {isVerified && (
              <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1.5 border border-emerald-100">
                <ShieldCheck size={14}/> TERVERIFIKASI
              </span>
            )}
          </div>
          
          <textarea 
            value={aiResult} 
            onChange={(e) => setAiResult(e.target.value)} 
            disabled={isVerified}
            className="w-full h-[550px] p-8 md:p-12 text-slate-700 text-lg leading-relaxed focus:outline-none resize-none bg-transparent font-medium"
            placeholder="Data tidak ditemukan di database. Pastikan Anda sudah memproses 'Input Klinis AI'."
          />

          <div className="p-6 bg-amber-50/50 border-t border-amber-100 flex items-start gap-4">
            <AlertTriangle className="text-amber-600 shrink-0" size={20} />
            <p className="text-xs text-amber-800 leading-relaxed italic">
              <b>Human-in-the-Loop:</b> Dokter wajib melakukan verifikasi akhir pada draf yang dihasilkan AI sebelum data disimpan permanen ke rekam medis elektronik rumah sakit.
            </p>
          </div>
        </motion.div>

        <motion.aside 
          initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
          className="flex flex-col gap-6"
        >
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Infrastruktur Database</h3>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isVerified ? 'bg-emerald-500' : (aiResult ? 'bg-amber-400 animate-pulse' : 'bg-slate-300')}`}></div>
              <span className="text-sm font-black text-slate-700">
                {isVerified ? 'PostgreSQL Synchronized' : (aiResult ? 'Draft Pending Verification' : 'No Data Active')}
              </span>
            </div>
            <div className="h-[1px] bg-slate-100 w-full"></div>
            <div className="flex items-center gap-4 text-slate-500">
                <Database size={20} />
                <span className="text-xs font-bold uppercase tracking-wider">Audit Trail Enabled</span>
            </div>
          </div>

          <button 
            onClick={handleApprove} 
            disabled={!aiResult || isVerified || loading} 
            className={`w-full py-6 rounded-[2rem] font-black text-sm tracking-[0.2em] flex items-center justify-center gap-4 shadow-2xl transition-all ${
              isVerified 
              ? 'bg-emerald-500 text-white cursor-default' 
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-300'
            }`}
          >
            {isVerified ? <CheckCircle size={24} /> : <Zap size={24} fill="currentColor" />} 
            {isVerified ? 'VERIFIKASI BERHASIL' : 'VERIFIKASI & SIMPAN'}
          </button>
        </motion.aside>

      </div>
    </div>
  );
}