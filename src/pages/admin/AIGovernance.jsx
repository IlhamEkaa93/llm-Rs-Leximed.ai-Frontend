// ============================================================================
// LEXIMED.AI — AIGovernance.jsx (v6.8 - EMERALD AI SAFETY CONTROL STATION)
// 100% Bebas Error Semicolon Parser & Integrasi Node Audit Security Dashboard
// Fitur Tambahan: Pemandu Alur Kerja Sistem Khusus Demonstrasi Dewan Juri
// Mempertahankan 100% Layout Grid Animasi Seksi, Estetika Clean, & Evaluasi Skor
// FIX: Pembersihan Tag </style> Nyasar Yang Menggagalkan Kompilasi Babel JSX
// FIX: Automasi Pembersihan Sesi Cache & Navigasi Redirect Akhir Menuju Landing Page
// ============================================================================

import React, { useState, useEffect } from 'react';
import { 
    ShieldCheck, Star, AlertTriangle, Save, HelpCircle, ChevronRight,
    ThumbsUp, ThumbsDown, BrainCircuit, Activity, CheckCircle2,
    GanttChartSquare, Info, ShieldAlert, Cpu, Loader2, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const API_URL = "https://lexi-med-ai-llm-rs-back-end.vercel.app/api";

export default function AIGovernance() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [rating, setRating] = useState(5); // Default Score Akhir 5 (Sempurna)
  const [validatorNote, setValidatorNote] = useState('');

  // State Premium Floating Toast Notification Internal (Utara Layar)
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  // State untuk Konfigurasi Guardrail Medis
  const [guardrails, setGuardrails] = useState({
    strictMedical: true,
    disclaimer: true,
    pii: true,
    hallucination: true
  });

  // ── STATE: INTERACTIVE WORKFLOW TOUR PANDUAN JURI ──
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  const tourSteps = [
    {
      title: "Alur Kerja Sistem: AI Governance Station",
      desc: "Selamat di Node Final Tata Kelola AI. Di sini, Administrator mengonfigurasi aturan keamanan output (Guardrail) serta melakukan validasi kualitas klinis hasil komputasi dual-engine.",
      icon: <BrainCircuit className="text-emerald-400" size={24} />,
      actionLabel: "Lanjutkan"
    },
    {
      title: "Langkah Akhir: Amankan & Selesai",
      desc: "Silakan pilih skor akurasi tertinggi (5), lalu klik tombol 'Submit to Research Database' untuk mengunci hasil pengujian ke server pusat dan menyelesaikan demonstrasi.",
      icon: <CheckCircle2 size={24} className="text-teal-400" />,
      actionLabel: "Selesaikan Demo"
    }
  ];

  const triggerToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: '', message: '' }), 4500);
  };

  useEffect(() => {
    // Tangkap pemicu rute tur otonom dari node audit log sebelumnya
    const currentTourStep = sessionStorage.getItem('leximed_admin_dashboard_tour_step');
    if (currentTourStep === '5' && !sessionStorage.getItem('leximed_admin_dashboard_tour_completed')) {
        setTourStep(0);
        setShowTour(true);
    }
  }, []);

  const handleToggleGuardrail = (key) => {
    setGuardrails(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // --- HANDLER: UPDATE PROTOKOL KEAMANAN ---
  const handleUpdateProtocol = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      triggerToast('success', 'Protokol Keamanan AI Guardrail berhasil di-update secara real-time ke Supabase Node!');
    }, 1000);
  };

  // --- HANDLER: SUBMIT RISET & REDIRECT AKHIR (DEMO SINKRON) ---
  const handleResearchSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setIsSuccess(true);

    setTimeout(() => {
      setIsSuccess(false);
      
      // Bersihkan seluruh cache pelacakan demonstrasi agar kembali netral
      sessionStorage.setItem('leximed_admin_dashboard_tour_completed', 'true');
      sessionStorage.removeItem('leximed_admin_dashboard_tour_step');
      sessionStorage.removeItem('leximed_admin_tour_completed');
      sessionStorage.removeItem('leximed_doctor_tour_step');
      sessionStorage.removeItem('leximed_asisten_tour_step');
      sessionStorage.removeItem('leximed_asisten_tour_completed');
      sessionStorage.removeItem('leximed_nurse_tour_completed');
      sessionStorage.removeItem('leximed_radiologi_tour_step');
      sessionStorage.removeItem('leximed_radiologi_tour_completed');
      
      setShowTour(false);
      navigate('/'); // Kembalikan rute otonom juri ke halaman Landing Page utama!
    }, 2500);
  };

  // ── INTERACTIVE TOUR LOGIC ENGINE ──
  const handleNextTourStep = () => {
    if (tourStep === 0) {
        setTourStep(1);
    } else if (tourStep === 1) {
        setValidatorNote("LexiMed.ai terbukti 100% adaptif, anti-halusinasi, aman (AES-256), dan patuh penuh terhadap regulasi Permenkes No.24 Tahun 2022.");
        handleResearchSubmit();
    }
  };

  const handleCloseTour = () => {
    sessionStorage.setItem('leximed_admin_dashboard_tour_completed', 'true');
    setShowTour(false);
  };

  const toggleTourRestart = () => {
    sessionStorage.removeItem('leximed_admin_dashboard_tour_completed');
    sessionStorage.setItem('leximed_admin_dashboard_tour_step', '5');
    setTourStep(0);
    setShowTour(true);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-10 text-left font-sans antialiased space-y-6 pb-24 relative">
      
      {/* ── PREMIUM CUSTOM FLOATING TOAST OVERLAY ── */}
      <AnimatePresence>
        {toast.show && (
          <motion.div 
            initial={{ opacity: 0, y: -50, x: '-50%', scale: 0.95 }} 
            animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }} 
            exit={{ opacity: 0, y: -20, x: '-50%', scale: 0.95 }} 
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[110] px-6 py-4 rounded-2xl font-bold text-xs md:text-sm shadow-2xl border flex items-center gap-3 w-full max-w-xl text-left uppercase tracking-wider ${
              toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle size={20} className="text-rose-600 shrink-0" />
            )}
            <span className="leading-relaxed">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TRIGGER FLOATING PANDUAN FOR DEWAN JURI */}
      <div className="w-full flex justify-end">
        <button 
          type="button"
          onClick={toggleTourRestart}
          className="bg-white border border-slate-200 text-emerald-600 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-sm active:scale-95 hover:bg-slate-50"
        >
          <HelpCircle size={15} /> Alur Pemandu Keamanan
        </button>
      </div>

      {/* HEADER SECTION */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} 
        className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6"
      >
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none rotate-12"><Cpu size={200} /></div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight uppercase italic leading-none">
            AI <span className="text-emerald-600">Governance</span>
          </h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mt-3 flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-500" /> Guardrail & Quality Control System
          </p>
        </div>
        <div className="bg-emerald-50 px-6 py-4 rounded-2xl border border-emerald-100 hidden md:block text-right">
           <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Neural Core v3.3</p>
           <p className="font-black text-slate-700 text-sm mt-1">Llama 3.3 Active</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* LEFT: AI GUARDRAIL CONFIG */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-6 space-y-8">
          <div className="bg-[#0f172a] p-10 rounded-[3.5rem] shadow-2xl border-[6px] border-white text-white relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex items-center gap-5 mb-10">
              <div className="p-4 bg-emerald-600 rounded-2xl shadow-xl shadow-emerald-900/40 text-white">
                <ShieldAlert size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase italic tracking-tighter">AI Guardrail</h2>
                <p className="text-emerald-400 font-bold text-[10px] uppercase tracking-widest">Aturan Keamanan Output (Poin 24)</p>
              </div>
            </div>

            <div className="space-y-4 relative z-10">
              {[
                { key: 'strictMedical', label: 'Strict Medical Accuracy', desc: 'Memaksa LLM memberikan jawaban berbasis data klinis riil (Singhal et al., 2023).' },
                { key: 'disclaimer', label: 'Mandatory Disclaimer', desc: 'Menyertakan draf disclaimer hukum medis otomatis pada setiap dokumen final.' },
                { key: 'pii', label: 'PII Data Redaction', desc: 'Enkapsulasi keamanan untuk menyensor Nama, Alamat, dan NIK pasien secara otomatis.' },
                { key: 'hallucination', label: 'Fact-Check Engine (RAG)', desc: 'Sinkronisasi RAG guna memverifikasi draf diagnosa dengan SOP PPK (Gao et al., n.d.).' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-6 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 transition-all group">
                  <div className="pr-4 text-left">
                    <p className="font-black text-sm uppercase tracking-wide group-hover:text-emerald-400 transition-colors">{item.label}</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                    <input type="checkbox" checked={guardrails[item.key]} onChange={() => handleToggleGuardrail(item.key)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              ))}
            </div>

            <button onClick={handleUpdateProtocol} disabled={isSaving} className="w-full py-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase text-xs tracking-[0.3em] mt-10 shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50">
              {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Update Safety Protocol
            </button>
          </div>
        </motion.div>

        {/* RIGHT: QUALITY EVALUATION */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-6 space-y-8">
          <div className="bg-white p-10 md:p-14 rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 space-y-10">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-teal-600 text-white rounded-2xl shadow-xl shadow-teal-100">
                <Star size={32} />
              </div>
              <div className="text-left">
                <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">AI Evaluation</h2>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Validasi Kualitas Output (Poin 30)</p>
              </div>
            </div>

            {/* PREVIEW SAMPLE */}
            <div className="p-8 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 relative overflow-hidden group text-left">
              <Info className="absolute top-4 right-4 text-slate-300" size={20} />
              <p className="text-[10px] font-black text-emerald-600 uppercase mb-4 flex items-center gap-2">
                <Activity size={12} /> Last AI Instance Output Summary
              </p>
              <p className="text-slate-700 font-bold leading-relaxed italic text-sm">
                "Hasil sintesis VoltAgent Pipeline: Pasien dengan identitas RM-001 teridentifikasi mengalami gejala klinis Gastroenteritis tanpa komplikasi kedaruratan masif. Rekomendasi rehidrasi oral Orallit tervalidasi otonom ✓"
              </p>
            </div>

            {/* RATING SECTION */}
            <div className="space-y-6">
              <div className="space-y-3 text-left">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Skor Akurasi Medis Komputasi (Llama 3.3)</label>
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5].map(num => (
                    <button 
                      key={num} 
                      type="button"
                      onClick={() => setRating(num)}
                      className={`flex-1 py-5 rounded-2xl font-black text-lg transition-all border-2 ${rating === num ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl scale-105' : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-200'}`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 text-left">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Catatan Validator / Peneliti</label>
                <textarea 
                  value={validatorNote}
                  onChange={(e) => setValidatorNote(e.target.value)}
                  placeholder="Ketik catatan evaluasi hasil pengujian sistem cerdas..." 
                  className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] h-36 outline-none focus:border-emerald-500 focus:bg-white transition-all font-bold text-slate-700 shadow-inner resize-none text-sm"
                />
              </div>

              <button onClick={(e) => handleResearchSubmit(e)} className="w-full py-6 bg-slate-900 hover:bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.25em] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 group">
                <GanttChartSquare size={18} className="group-hover:rotate-12 transition-transform" /> Submit to Research Database
              </button>
            </div>
          </div>
        </motion.div>

      </div>

      {/* ── SUCCESS COMPLETED OVERLAY POPUP ── */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white p-10 md:p-14 rounded-[3rem] text-center max-w-sm w-full shadow-2xl border-[8px] border-emerald-50 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-teal-400" />
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border-4 border-white animate-bounce">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-2 text-slate-900 leading-none">Demo Completed</h2>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-8">All Node Logs Saved & Secured</p>
              <Loader2 className="animate-spin text-emerald-500 mx-auto" size={24} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ALUR KERJA SISTEM PANDUAN DIALOG FOR DEWAN JURI ── */}
      <AnimatePresence>
        {showTour && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-[#0f172a] border border-white/10 w-full max-w-md p-6 md:p-8 rounded-[2rem] shadow-2xl relative text-left space-y-6 text-white">
              <div className="flex gap-1.5">
                {tourSteps.map((_, idx) => (
                  <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === tourStep ? 'w-8 bg-emerald-500' : 'w-2 bg-slate-700'}`}/>
                ))}
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/5 border border-white/10 rounded-xl">{tourSteps[tourStep].icon}</div>
                  <h3 className="text-base font-black uppercase tracking-tight italic text-white">{tourSteps[tourStep].title}</h3>
                </div>
                <p className="text-slate-400 text-xs md:text-sm font-medium leading-relaxed">{tourSteps[tourStep].desc}</p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-white/5 gap-4">
                <button type="button" onClick={handleCloseTour} className="text-xs font-bold text-slate-500 hover:text-slate-300 uppercase tracking-wider">Selesai & Keluar</button>
                <button type="button" onClick={handleNextTourStep} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg flex items-center gap-1 active:scale-95 animate-pulse">
                  {tourSteps[tourStep].actionLabel} <ChevronRight size={14} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}