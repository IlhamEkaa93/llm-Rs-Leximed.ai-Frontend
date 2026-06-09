import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, CheckCircle, AlertTriangle, FileText, 
  Zap, Loader2, ClipboardList, LayoutDashboard, 
  ShieldCheck, Database, ChevronRight, ArrowLeft, Sparkles 
} from 'lucide-react';

export default function RingkasanMedis() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false); // State khusus untuk loading AI
  const [aiResult, setAiResult] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [patient, setPatient] = useState(null);
  const [showExitOptions, setShowExitOptions] = useState(false);

  const API_URL = "https://lexi-med-ai-llm-rs-back-end.vercel.app/api";
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    const saved = localStorage.getItem('active_patient');
    if (!saved) {
      navigate('/dashboard');
    } else {
      const data = JSON.parse(saved);
      setPatient(data);
      fetchSummary(data.norm || data.no_rm);
    }
  }, [navigate]);

  // 1. FUNGSI TARIK DATA DARI DATABASE
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
      
      if (res.ok && (data.ai_summary || data.raw_content)) {
        setAiResult(data.ai_summary || data.raw_content);
        if (data.status === 'verified') setIsVerified(true);
      } else {
        setAiResult("");
        alert(data.message || "Draf klinis tidak ditemukan. Silakan isi 'Input Klinis' terlebih dahulu.");
      }
    } catch (e) {
      console.error("Connection Error:", e);
      alert("Gagal terhubung ke Server Database.");
    } finally {
      setLoading(false);
    }
  };

  // 2. FUNGSI TRIGGER AI (Merapikan teks mentah menjadi narasi medis)
  const handleGenerateAI = async () => {
    if (!aiResult.trim()) return alert("Teks masih kosong, tidak ada yang bisa dirapikan.");
    
    setIsGeneratingAI(true);
    try {
      // Endpoint ini nanti akan dibuat di Laravel untuk hit API (Claude/Llama/Voltengine)
      const response = await fetch(`${API_URL}/clinical-data/${patient.norm || patient.no_rm}/generate-ai`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ raw_text: aiResult })
      });

      const data = await response.json();

      if (response.ok && data.summary) {
        setAiResult(data.summary); // Update textarea dengan hasil dari AI
      } else {
        alert(data.message || "Endpoint AI di Backend belum tersedia. Pastikan rute /generate-ai sudah dibuat di Laravel.");
      }
    } catch (e) {
      console.error("AI Error:", e);
      alert("Gagal memanggil AI. Pastikan server backend berjalan.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // 3. FUNGSI VERIFIKASI (SIMPAN PERMANEN)
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
          final_summary: aiResult
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
      
      {/* MODAL VERIFIKASI (SUCCESS) */}
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
                Ringkasan medis pasien <span className="font-bold text-slate-800">{patient.name}</span> telah aman tersimpan di database Supabase.
              </p>
              
              <div className="flex flex-col gap-3">
                <button onClick={() => navigate('/data-medis')} className="w-full p-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold flex items-center justify-between shadow-lg transition-all">
                  <span className="flex items-center gap-3"><ClipboardList size={20} /> Lihat Rekam Medis</span>
                  <ChevronRight size={20} />
                </button>
                <button onClick={() => navigate('/dashboard')} className="mt-6 text-xs font-black text-slate-400 hover:text-blue-600 tracking-[0.2em] uppercase flex items-center justify-center gap-2 transition-colors">
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
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/data-medis')} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl text-slate-600 transition-colors" title="Kembali ke Rekam Medis">
               <ArrowLeft size={24} />
            </button>
            <div className="p-2 bg-emerald-600 rounded-xl text-white shadow-lg shadow-emerald-200"><FileText size={28} /></div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Ringkasan Medis</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-500 md:pl-[5.5rem]">
            <span>Pasien:</span>
            <b className="text-slate-900">{patient.name}</b>
            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full mx-1 hidden sm:block"></span>
            <span className="bg-blue-50 border border-blue-100 px-3 py-0.5 rounded-lg font-mono text-blue-600">RM: {patient.norm || patient.no_rm}</span>
          </div>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={() => navigate('/data-medis')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-black text-sm uppercase transition-all bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            <ClipboardList size={18} /> Cek Rekam Medis
          </button>

          <button 
            onClick={() => fetchSummary(patient.norm || patient.no_rm)} 
            className={`flex-1 md:flex-none flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-black text-sm uppercase transition-all border shadow-sm ${
              loading ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
            disabled={loading || isVerified || isGeneratingAI}
          >
            <RefreshCw className={loading ? "animate-spin" : ""} size={18} />
            {loading ? "Menyinkronkan..." : "Refresh Draf"}
          </button>
        </div>
      </motion.header>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        <motion.div 
          initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
          className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden"
        >
          <div className="bg-slate-50/80 px-8 py-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <FileText size={14} className="text-blue-500" fill="currentColor"/> Draf Ringkasan Klinis
            </span>
            
            <div className="flex items-center gap-3">
              {/* TOMBOL REAL AI TRIGGER */}
              {!isVerified && (
                <button 
                  onClick={handleGenerateAI}
                  disabled={isGeneratingAI || !aiResult}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm ${
                    isGeneratingAI || !aiResult
                    ? 'bg-indigo-100 text-indigo-300 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-md hover:shadow-indigo-200'
                  }`}
                >
                  {isGeneratingAI ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  {isGeneratingAI ? 'AI Bekerja...' : 'Rapikan AI'}
                </button>
              )}

              {isVerified && (
                <span className="bg-emerald-50 text-emerald-600 px-3 py-2 rounded-xl text-[10px] font-black flex items-center gap-1.5 border border-emerald-100">
                  <ShieldCheck size={14}/> TERVERIFIKASI
                </span>
              )}
            </div>
          </div>
          
          <div className="relative">
            {isGeneratingAI && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4 animate-pulse">
                  <Sparkles size={32} className="text-indigo-500" />
                </div>
                <p className="text-indigo-800 font-bold tracking-widest text-xs uppercase animate-pulse">Llama AI Sedang Merapikan Teks...</p>
              </div>
            )}
            <textarea 
              value={aiResult} 
              onChange={(e) => setAiResult(e.target.value)} 
              disabled={isVerified || isGeneratingAI}
              className="w-full h-[500px] p-8 md:p-12 text-slate-700 text-lg leading-relaxed focus:outline-none resize-none bg-transparent font-medium"
              placeholder="Data tidak ditemukan. Pastikan Anda sudah menyimpan data pasien ini di halaman 'Input Klinis'."
            />
          </div>

          <div className="p-6 bg-amber-50/50 border-t border-amber-100 flex items-start gap-4">
            <AlertTriangle className="text-amber-600 shrink-0" size={20} />
            <p className="text-xs text-amber-800 leading-relaxed italic">
              <b>Human-in-the-Loop:</b> Dokter wajib melakukan verifikasi akhir pada draf klinis sebelum data dikunci dan disimpan secara permanen ke rekam medis elektronik rumah sakit.
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
                {isVerified ? 'Supabase Synchronized' : (aiResult ? 'Draft Pending Verification' : 'No Data Active')}
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
            disabled={!aiResult || isVerified || loading || isGeneratingAI} 
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