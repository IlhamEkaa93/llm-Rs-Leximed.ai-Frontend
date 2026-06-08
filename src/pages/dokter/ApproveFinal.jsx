import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, ShieldCheck, FileSignature, 
  ArrowLeft, Lock, Loader2, Database,
  Fingerprint, Key, ShieldAlert, LayoutDashboard
} from 'lucide-react';

export default function ApproveFinal() {
  const navigate = useNavigate();
  const [isAgreed, setIsAgreed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    const savedPatient = localStorage.getItem('active_patient');
    if (savedPatient) {
      setPatient(JSON.parse(savedPatient));
    } else {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleFinalSubmit = async () => {
    if (!patient) return;
    setIsProcessing(true);
    
    // Pastikan memanggil nomer RM yang tepat
    const rmIdentifier = patient.norm || patient.no_rm;
    
    try {
      const response = await fetch(`http://localhost:8000/api/clinical-data/${rmIdentifier}/verify`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Gagal verifikasi dari server.");
      }

      // Delay simulasi enkripsi & audit trail
      setTimeout(() => {
        setIsProcessing(false);
        setSuccess(true);
      }, 2000);

    } catch (error) {
      alert("Koneksi Error: " + error.message);
      setIsProcessing(false);
    }
  };

  // TAMPILAN POP-UP SUKSES
  if (success) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md overflow-hidden">
        <motion.div 
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          className="max-w-md w-full bg-white rounded-[2.5rem] p-10 md:p-12 text-center shadow-2xl border border-slate-100"
        >
          <div className="relative flex justify-center mb-8">
            <motion.div 
              initial={{ scale: 0 }} animate={{ scale: 1.2 }}
              className="absolute inset-0 bg-emerald-100 rounded-full blur-2xl opacity-60"
            />
            <div className="relative bg-emerald-500 p-6 rounded-full shadow-xl shadow-emerald-200">
              <CheckCircle2 size={56} className="text-white" />
            </div>
          </div>
          <div className="space-y-3 mb-10">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Otorisasi Berhasil!</h2>
            <p className="text-slate-500 font-medium leading-relaxed text-sm">
              Rekam medis pasien <span className="font-bold text-slate-800">{patient?.name}</span> telah dikunci dengan Hash Digital unik dan tersimpan permanen di Audit Trail LexiMed.ai.
            </p>
          </div>
          <button 
            className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
            onClick={() => navigate('/dashboard')}
          >
            <LayoutDashboard size={18} /> Kembali ke Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 md:py-10 antialiased font-sans pb-24">
      
      {/* HEADER SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4"
      >
        <button 
          className="group flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-all font-bold text-sm bg-white px-5 py-2.5 rounded-full shadow-sm border border-slate-200"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Kembali
        </button>
        <div className="bg-blue-50 text-blue-600 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100 flex items-center gap-2 shadow-sm">
          <Database size={14} className="animate-pulse" /> Live Sync Active
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        
        {/* LEFT: MAIN CARD (Review) */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          className="xl:col-span-3 space-y-6"
        >
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/40 p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none rotate-12">
              <FileSignature size={200} />
            </div>
            
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-10 tracking-tight flex items-center gap-3">
              Otorisasi Data Medis
            </h3>
            
            <div className="space-y-4 mb-10">
              {[
                { label: 'Tipe Dokumen', val: 'Integrasi AI (Ringkasan & Resume)', icon: <Key size={16}/> },
                { label: 'Subjek Pasien', val: `${patient?.name} (RM: ${patient?.norm || patient?.no_rm})`, icon: <Fingerprint size={16}/> },
                { label: 'Timestamp Server', val: `${new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })} WIB`, icon: <Lock size={16}/> }
              ].map((item, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 border-b border-slate-100 gap-2">
                  <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2.5">
                    {item.icon} {item.label}
                  </span>
                  <strong className="text-sm md:text-base text-slate-800 sm:text-right">{item.val}</strong>
                </div>
              ))}
            </div>

            {/* Disclaimer Box */}
            <div className="bg-rose-50/80 border border-rose-100 rounded-3xl p-6 md:p-8 space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                 <ShieldAlert size={80} />
              </div>
              <div className="flex items-center gap-2 text-rose-600 font-black text-xs uppercase tracking-widest relative z-10">
                <ShieldAlert size={18} /> Pernyataan Hukum (SRS 14)
              </div>
              <p className="text-sm text-rose-800/80 leading-relaxed font-medium italic relative z-10">
                "Saya menyatakan telah memverifikasi seluruh data klinis yang dihasilkan oleh sistem asisten AI dan menjamin keaslian data sesuai dengan Standar Operasional Prosedur LexiMed.ai."
              </p>
            </div>

            <label className={`mt-8 flex items-start sm:items-center gap-4 p-5 rounded-2xl cursor-pointer transition-all border-2 ${
              isAgreed ? 'bg-blue-50/50 border-blue-500 shadow-md shadow-blue-100/50' : 'bg-slate-50 border-slate-200 hover:border-blue-300'
            }`}>
              <div className="relative shrink-0 mt-0.5 sm:mt-0">
                <input 
                  type="checkbox" className="sr-only peer"
                  checked={isAgreed} onChange={() => setIsAgreed(!isAgreed)} 
                />
                <div className="w-6 h-6 border-2 border-slate-300 rounded-lg peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all flex items-center justify-center">
                   {isAgreed && <CheckCircle2 size={16} className="text-white" />}
                </div>
              </div>
              <span className="text-xs md:text-sm font-bold text-slate-700 leading-snug">
                Saya menyetujui bahwa seluruh konten medis di atas bersifat final dan tidak dapat diubah kembali.
              </span>
            </label>
          </div>
        </motion.div>

        {/* RIGHT: ACTION PANEL */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="xl:col-span-2 space-y-6"
        >
          <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
            <div className="relative z-10 flex flex-col items-center text-center space-y-8">
              <div className="p-5 bg-white/10 rounded-[2rem] backdrop-blur-md border border-white/20 shadow-inner">
                <Lock size={40} className="text-blue-400" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl md:text-2xl font-black tracking-tight">Enkripsi Biometrik</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.25em]">Volt Secure Gateway Active</p>
              </div>
              
              <button 
                disabled={!isAgreed || isProcessing}
                onClick={handleFinalSubmit}
                className={`w-full py-6 rounded-[2rem] font-black text-xs md:text-sm uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${
                  isAgreed 
                  ? 'bg-blue-600 hover:bg-blue-500 shadow-[0_20px_40px_rgba(37,99,235,0.4)] hover:shadow-[0_20px_40px_rgba(37,99,235,0.6)] active:scale-95' 
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                {isProcessing ? (
                  <><Loader2 className="animate-spin" size={20} /> Processing...</>
                ) : (
                  <><FileSignature size={20} /> Sign Document</>
                )}
              </button>
            </div>
          </div>

          {/* Safety Hint */}
          <div className="p-6 text-center space-y-3 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <ShieldCheck size={28} className="mx-auto text-emerald-500 opacity-80" />
            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed px-4">
              Persetujuan ini menciptakan bukti forensik digital pada Audit Trail LexiMed.ai.
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}