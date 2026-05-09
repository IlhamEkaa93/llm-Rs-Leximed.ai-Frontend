import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, CheckCircle2, XCircle, FileSignature, 
  Loader2, User, AlertTriangle, FileEdit, Database, Save
} from 'lucide-react';

export default function ValidasiAIPerawat() {
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  
  // States Sesuai Ketentuan (CRUD: Edit, Catatan Koreksi)
  const [draftContent, setDraftContent] = useState('');
  const [catatanKoreksi, setCatatanKoreksi] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const activePatient = localStorage.getItem('active_patient');
    const savedDraft = localStorage.getItem('draft_dokumentasi_rag');
    
    if (!activePatient) {
      alert("Sesi pasien hilang. Silakan mulai dari Dashboard.");
      navigate('/dashboard-perawat');
      return;
    }
    
    setPatient(JSON.parse(activePatient));

    // Menarik draf RAG dari Poin 14
    if (savedDraft) {
      setDraftContent(savedDraft);
    } else {
      setDraftContent("Draf dokumentasi tidak ditemukan. Pastikan Anda telah menjalankan RAG Analysis di langkah sebelumnya.");
    }
  }, [navigate]);

  // ACTION: APPROVE & SIMPAN FINAL
  const handleApprove = async () => {
    if (!draftContent) return alert("Konten dokumen tidak boleh kosong.");
    
    setIsSaving(true);
    try {
      const token = localStorage.getItem('access_token');
      const norm = patient.norm || patient.no_rm;
      
      // Hit Backend: Route PATCH /clinical-data/{norm}/verify
      // Route ini secara otomatis akan mengubah status menjadi 'verified' dan masuk ke AUDIT LOG
      const response = await fetch(`https://lexi-med-ai-llm-rs-back-end.vercel.app/api/clinical-data/${norm}/verify`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          final_summary: `[DOKUMEN TERVALIDASI]\n\n${draftContent}\n\n[KOREKSI PERAWAT]: ${catatanKoreksi || 'Tidak ada koreksi.'}` 
        })
      });

      if (response.ok) {
        setIsSuccess(true);
        
        // Bersihkan storage setelah berhasil simpan
        setTimeout(() => {
          localStorage.removeItem('active_patient');
          localStorage.removeItem('last_nurse_note');
          localStorage.removeItem('handover_summary_final');
          localStorage.removeItem('draft_dokumentasi_rag');
          
          navigate('/dashboard-perawat');
        }, 3000);
      } else {
        throw new Error("Gagal melakukan verifikasi ke server.");
      }
    } catch (err) {
      alert("System Error: " + err.message);
      setIsSaving(false);
    }
  };

  // ACTION: REJECT / KEMBALI
  const handleReject = () => {
    const confirmReject = window.confirm("Anda yakin ingin membuang draf ini dan mengulang pembuatan dokumen?");
    if (confirmReject) {
      localStorage.removeItem('draft_dokumentasi_rag');
      navigate('/draft-dokumentasi');
    }
  };

  if (!patient) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10 font-sans text-left pb-24 text-slate-900 antialiased">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER SECTION */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} 
          className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none rotate-12"><ShieldCheck size={200} /></div>
          
          <div className="flex items-center gap-5 w-full xl:w-auto relative z-10">
            <div className="p-4 bg-emerald-600 rounded-[1.5rem] text-white shadow-xl shadow-emerald-200 shrink-0">
              <FileSignature size={32} />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase italic leading-none">Verifikasi Laporan</h1>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mt-2">Validasi & Sinkronisasi Audit Log</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 px-6 py-4 rounded-2xl border border-slate-200 shadow-inner relative z-10 w-full xl:w-auto">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-200 shadow-sm shrink-0">
                <User size={20} className="text-emerald-600" />
              </div>
              <div className="text-left leading-tight">
                <p className="font-black text-slate-800 text-sm">{patient.name}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">RM: {patient.norm}</p>
              </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* EDITOR AREA (KIRI) */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-8 space-y-8">
            <div className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 space-y-8 relative overflow-hidden">
              
              {/* DRAFT REVIEW & EDIT */}
              <div className="space-y-4 relative z-10 text-left">
                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                  <FileEdit size={18} className="text-blue-600" /> Review & Edit Draft AI
                </label>
                <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 mb-2">
                  <p className="text-xs text-blue-700 font-bold leading-relaxed">
                    Silakan tinjau draf yang dihasilkan oleh AI. Anda dapat mengetik langsung di dalam kotak ini untuk memperbaiki atau menambahkan informasi sebelum disimpan ke database.
                  </p>
                </div>
                <textarea 
                  className="w-full h-[400px] p-8 bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-[2.5rem] outline-none transition-all font-medium text-slate-700 leading-relaxed resize-none shadow-inner scrollbar-hide"
                  value={draftContent}
                  onChange={(e) => setDraftContent(e.target.value)}
                />
              </div>

              <hr className="border-slate-100" />

              {/* CATATAN KOREKSI */}
              <div className="space-y-4 relative z-10 text-left">
                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                  <AlertTriangle size={18} className="text-amber-500" /> Catatan Koreksi Perawat
                </label>
                <textarea 
                  className="w-full h-24 p-6 bg-slate-50 border-2 border-slate-100 focus:border-amber-500 rounded-[2rem] outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300 resize-none shadow-inner"
                  placeholder="Tambahkan catatan koreksi atau alasan perubahan jika draf AI direvisi..."
                  value={catatanKoreksi}
                  onChange={(e) => setCatatanKoreksi(e.target.value)}
                />
              </div>

            </div>
          </motion.div>

          {/* ACTION PANEL (KANAN) */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-4 space-y-6 text-left">
            <div className="bg-[#0f172a] p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group border-[6px] border-white">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-600/20 rounded-full blur-3xl group-hover:bg-emerald-600/40 transition-all duration-700" />
              
              <div className="relative z-10 space-y-8">
                <div className="w-16 h-16 bg-emerald-600 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-emerald-500/40">
                  <Database size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black italic tracking-tighter uppercase leading-none">Database<br/>Commit</h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-4 leading-relaxed opacity-80">
                    Menyimpan laporan yang telah divalidasi ke PostgreSQL dan mencatat aktivitas di Audit Log AI.
                  </p>
                </div>
                
                <div className="space-y-4">
                  {/* TOMBOL APPROVE & SIMPAN */}
                  <button 
                    disabled={isSaving || isSuccess}
                    onClick={handleApprove}
                    className={`w-full py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-2xl ${
                      isSuccess ? 'bg-emerald-500 text-white' : 
                      isSaving ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/50 active:scale-95'
                    }`}
                  >
                    {isSaving ? (
                      <><Loader2 className="animate-spin" size={18} /> Mengenkripsi...</>
                    ) : isSuccess ? (
                      <><CheckCircle2 size={18} /> Tersimpan!</>
                    ) : (
                      <><Save size={18} /> Approve & Simpan</>
                    )}
                  </button>

                  {/* TOMBOL REJECT */}
                  <button 
                    disabled={isSaving || isSuccess}
                    onClick={handleReject}
                    className="w-full py-5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 hover:border-rose-500 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <XCircle size={16} /> Reject / Buang Draf
                  </button>
                </div>

              </div>
            </div>

            <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm space-y-5">
                <div className="flex items-center gap-3 text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">
                  <ShieldCheck size={18} />
                  <span>Audit Trail System</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed font-bold uppercase tracking-tight">
                  Tindakan persetujuan Anda akan tercatat secara permanen di sistem dengan timestamp dan ID Perawat untuk menjaga legalitas rekam medis.
                </p>
            </div>
          </motion.div>

        </div>
      </div>
      
      {/* SUCCESS OVERLAY ANIMATION */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-white p-12 rounded-[3.5rem] shadow-2xl flex flex-col items-center max-w-sm text-center"
            >
              <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-2">Validasi Sukses</h2>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">Data tersimpan di PostgreSQL & Audit Log AI.</p>
              <Loader2 className="animate-spin text-slate-300" size={24} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}