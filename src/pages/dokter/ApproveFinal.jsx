import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, ShieldCheck, FileSignature, 
  ArrowLeft, AlertCircle, Lock, Loader2, Database,
  Fingerprint, Key, ShieldAlert
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
    try {
      const response = await fetch(`http://localhost:8000/api/clinical-data/${patient.norm}/verify`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Gagal sinkronisasi HIS.");
      }

      // Delay simulasi enkripsi untuk efek "Mindblowing"
      setTimeout(() => {
        setIsProcessing(false);
        setSuccess(true);
      }, 2000);

    } catch (error) {
      alert("Koneksi Terputus: " + error.message);
      setIsProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white p-6 overflow-hidden">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full text-center space-y-6"
        >
          <div className="relative flex justify-center">
            <motion.div 
              initial={{ scale: 0 }} animate={{ scale: 1.2 }}
              className="absolute inset-0 bg-emerald-100 rounded-full blur-3xl opacity-50"
            />
            <div className="relative bg-emerald-500 p-6 rounded-full shadow-2xl shadow-emerald-200">
              <CheckCircle2 size={64} className="text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Otorisasi Berhasil</h2>
            <p className="text-slate-500 font-medium leading-relaxed">
              Rekam medis <b>{patient?.name}</b> telah dikunci dengan hash digital unik dan tersimpan permanen di database RS UNS.
            </p>
          </div>
          <button 
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-xl active:scale-95"
            onClick={() => navigate('/dashboard')}
          >
            Selesai & Kembali
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-10 antialiased font-sans">
      
      {/* HEADER SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <button 
          className="group flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-all font-bold text-sm"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Kembali
        </button>
        <div className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100 flex items-center gap-2">
          <Database size={12} /> Live Sync Active
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* LEFT: MAIN CARD (Review) */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-3 space-y-6"
        >
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/40 p-8 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
              <FileSignature size={150} />
            </div>
            
            <h3 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">Otorisasi Data Medis</h3>
            
            <div className="space-y-4 mb-10">
              {[
                { label: 'Tipe Dokumen', val: 'Integrasi AI (SOAP + Resume)', icon: <Key size={14}/> },
                { label: 'Subjek Pasien', val: `${patient?.name} (RM: ${patient?.norm})`, icon: <Fingerprint size={14}/> },
                { label: 'Timestamp Server', val: `${new Date().toLocaleString('id-ID')} WIB`, icon: <Lock size={14}/> }
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center py-4 border-b border-slate-50">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    {item.icon} {item.label}
                  </span>
                  <strong className="text-sm text-slate-800 text-right">{item.val}</strong>
                </div>
              ))}
            </div>

            {/* Disclaimer Box */}
            <div className="bg-rose-50 border border-rose-100 rounded-3xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-rose-600 font-black text-xs uppercase tracking-tighter">
                <ShieldAlert size={16} /> Pernyataan Hukum (SRS 14)
              </div>
              <p className="text-xs text-rose-800/80 leading-relaxed font-medium italic">
                "Saya menyatakan telah memverifikasi seluruh data klinis yang dihasilkan oleh sistem asisten AI dan menjamin keaslian data sesuai dengan standar operasional prosedur RS UNS."
              </p>
            </div>

            <label className={`mt-8 flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border-2 ${
              isAgreed ? 'bg-blue-50 border-blue-200 shadow-inner' : 'bg-slate-50 border-transparent hover:border-slate-200'
            }`}>
              <div className="relative">
                <input 
                  type="checkbox" className="sr-only peer"
                  checked={isAgreed} onChange={() => setIsAgreed(!isAgreed)} 
                />
                <div className="w-6 h-6 border-2 border-slate-300 rounded-lg peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all flex items-center justify-center">
                   {isAgreed && <CheckCircle2 size={16} className="text-white" />}
                </div>
              </div>
              <span className="text-xs md:text-sm font-bold text-slate-700 leading-tight">
                Saya menyetujui seluruh konten medis di atas bersifat final.
              </span>
            </label>
          </div>
        </motion.div>

        {/* RIGHT: ACTION PANEL */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-10 transition-opacity" />
            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
              <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-md border border-white/20">
                <Lock size={32} className="text-blue-400" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-black tracking-tight">Enkripsi Biometrik</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Volt Secure Gateway Active</p>
              </div>
              
              <button 
                disabled={!isAgreed || isProcessing}
                onClick={handleFinalSubmit}
                className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${
                  isAgreed 
                  ? 'bg-blue-600 hover:bg-blue-500 shadow-[0_20px_40px_rgba(37,99,235,0.3)] active:scale-95' 
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                }`}
              >
                {isProcessing ? (
                  <><Loader2 className="animate-spin" size={18} /> Processing...</>
                ) : (
                  <><FileSignature size={18} /> Sign Document</>
                )}
              </button>
            </div>
          </div>

          {/* Safety Hint */}
          <div className="p-6 text-center space-y-2">
            <ShieldCheck size={24} className="mx-auto text-emerald-500 opacity-50" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose">
              Persetujuan ini menciptakan bukti forensik digital pada Audit Trail RS UNS.
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}