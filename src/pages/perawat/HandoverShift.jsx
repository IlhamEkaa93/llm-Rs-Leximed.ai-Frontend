import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, FileText, ArrowRight, Loader2, Zap, User, 
  CheckCircle2, ShieldCheck, Wand2, Calendar, Clock, MapPin,
  Sparkles, BrainCircuit
} from 'lucide-react';

export default function HandoverShift() {
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  
  // States Sesuai Ketentuan (CRUD Sistem + AI)
  const [ruang, setRuang] = useState('');
  const [shift, setShift] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [kondisi, setKondisi] = useState('');
  const [intervensi, setIntervensi] = useState('');
  
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [aiSuccess, setAiSuccess] = useState(false);

  useEffect(() => {
    const savedPatient = localStorage.getItem('active_patient');
    const lastNote = localStorage.getItem('last_nurse_note');
    const token = localStorage.getItem('access_token');

    if (!savedPatient || !token) {
      alert("Sesi tidak valid atau pasien belum dipilih.");
      navigate('/dashboard-perawat');
      return;
    }

    const parsedPatient = JSON.parse(savedPatient);
    setPatient(parsedPatient);
    setRuang(parsedPatient.current_unit || 'UGD');
    setShift(parsedPatient.current_shift || 'PAGI');

    // AUTO-SYNC: Tarik data dari Poin 12 (TambahCatatan)
    if (lastNote) {
      const note = JSON.parse(lastNote);
      setKondisi(`KELUHAN: ${note.keluhan}. OBSERVASI: ${note.kondisi_umum}. VITAL SIGN: TD ${note.td_sistolik}/${note.td_diastolik}, Nadi ${note.nadi}, Suhu ${note.suhu}, SpO2 ${note.spo2}%`);
      setIntervensi(note.tindakan);
    }
  }, [navigate]);

  const handleAutoFillDemo = () => {
    setKondisi("Pasien post-op appendictomy hari ke-1. Mengeluh nyeri pada luka operasi skala 6/10. Pasien tampak meringis saat bergerak. Kesadaran CM. TD 125/85, Nadi 92x, RR 20x. Luka operasi bersih, tidak ada rembesan darah.");
    setIntervensi("Berikan Ketorolac 30mg/8jam (masuk jam 08.00). Edukasi teknik relaksasi napas dalam. Ganti verban jadwal besok pagi.");
    setShift("PAGI");
    setRuang("BANGSAL_A");
  };

  const handleGenerateAI = async () => {
    if (!kondisi) return alert("Data observasi kosong. Gunakan fitur Auto-Fill untuk demo.");
    
    setIsProcessingAI(true);
    setAiSuccess(false);

    try {
      // Simulasi Integrasi LLM
      await fetch("http://localhost:8000/api/clinical-data", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ 
          patient_id: patient.norm || patient.no_rm,
          raw_content: `[DATA]: ${kondisi}. [INTERVENSI]: ${intervensi}`,
          source: "nurse_handover_ai" 
        })
      });

      setTimeout(() => {
        const resultAI = `RINGKASAN OPERAN SHIFT (${shift})\n---------------------------\nSTATUS KLINIS: Pasien dalam pengawasan post-operatif aktif. Teridentifikasi nyeri akut post-appendictomy (skala 6/10). Status hemodinamik terkontrol namun membutuhkan manajemen nyeri berkelanjutan.\n\nPROGRESS OBSERVASI: Integritas luka operasi optimal (Surgical site clean). Tidak ditemukan indikasi perdarahan sekunder atau infeksi dini.\n\nRENCANA SHIFT BERIKUTNYA: Lanjutkan protokol analgetik sesuai jadwal. Prioritaskan mobilisasi bertahap dan monitoring drainase luka.`;
        
        setKondisi(resultAI);
        setAiSuccess(true);
        setIsProcessingAI(false);
        setTimeout(() => setAiSuccess(false), 4000);
      }, 2000);

    } catch (err) {
      console.error(err);
      setIsProcessingAI(false);
    }
  };

  const handleNextStep = () => {
    if (!kondisi) return alert("Tolong generate ringkasan AI terlebih dahulu.");
    const draftForDocumentation = { ...patient, summary: kondisi, ruang, shift, tanggal };
    localStorage.setItem('handover_summary_final', JSON.stringify(draftForDocumentation));
    navigate('/draft-dokumentasi'); 
  };

  if (!patient) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10 font-sans text-left pb-24 text-slate-900 antialiased">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} 
          className="flex flex-col xl:flex-row justify-between items-center gap-6 mb-10 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden"
        >
          <div className="flex items-center gap-5 w-full xl:w-auto">
            <div className="p-4 bg-blue-600 rounded-[1.5rem] text-white shadow-xl shadow-blue-200 shrink-0">
              <BrainCircuit size={32} />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase italic leading-none">Ringkasan Shift AI</h1>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mt-2">Poin 13: LLM Shift Handover Assistant</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto justify-end">
            <button 
              onClick={handleAutoFillDemo} 
              className="flex items-center gap-2 px-6 py-4 bg-amber-50 text-amber-600 rounded-2xl text-[10px] font-black uppercase border border-amber-100 hover:bg-amber-100 transition-all shadow-sm active:scale-95"
            >
              <Wand2 size={16} /> Auto-Fill Demo
            </button>
            <div className="flex items-center gap-4 bg-slate-50 px-6 py-3.5 rounded-2xl border border-slate-200 shadow-inner">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-200 shadow-sm shrink-0">
                  <User size={20} className="text-blue-600" />
                </div>
                <div className="text-left leading-tight">
                  <p className="font-black text-slate-800 text-sm">{patient.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">RM: {patient.norm}</p>
                </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* MAIN EDITOR AREA */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-8 space-y-8">
            <div className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 space-y-10 relative overflow-hidden">
              
              {/* TOP INPUTS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                <div className="space-y-3 text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2"><MapPin size={14} className="text-blue-500" /> Ruang/Unit</label>
                  <input value={ruang} readOnly className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl font-bold text-slate-500 cursor-not-allowed shadow-inner" />
                </div>
                <div className="space-y-3 text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2"><Clock size={14} className="text-blue-500" /> Shift Aktif</label>
                  <input value={shift} readOnly className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl font-bold text-slate-500 cursor-not-allowed shadow-inner" />
                </div>
                <div className="space-y-3 text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2"><Calendar size={14} className="text-blue-500" /> Tanggal</label>
                  <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold text-slate-700 focus:border-blue-500 outline-none transition-all shadow-inner" />
                </div>
              </div>

              {/* LLM TEXTAREA */}
              <div className="space-y-4 relative z-10 text-left">
                <div className="flex justify-between items-center px-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                    <Sparkles size={18} className="text-blue-600 animate-pulse" /> Output Generative AI
                  </label>
                </div>
                
                <div className="relative">
                  <AnimatePresence>
                    {isProcessingAI && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-white/90 backdrop-blur-md z-20 rounded-[3rem] flex flex-col items-center justify-center border-2 border-blue-100">
                        <div className="relative mb-6">
                           <Loader2 className="animate-spin text-blue-600" size={80} />
                           <BrainCircuit className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-400" size={32} />
                        </div>
                        <h4 className="text-lg font-black text-slate-900 uppercase italic tracking-tighter">Neural Processing</h4>
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-[0.3em] animate-pulse mt-2 text-center px-10">Llama 3.3 is synthesizing clinical data...</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <textarea 
                    className={`w-full h-[500px] p-10 bg-slate-50 border-2 rounded-[3.5rem] outline-none transition-all font-medium text-slate-700 text-lg leading-relaxed resize-none shadow-inner scrollbar-hide ${
                      aiSuccess ? 'border-emerald-400 bg-emerald-50/30' : 'border-transparent focus:border-blue-500 focus:bg-white'
                    }`}
                    placeholder="Menunggu sinkronisasi data observasi..."
                    value={kondisi}
                    onChange={(e) => setKondisi(e.target.value)}
                  />
                  
                  <AnimatePresence>
                    {aiSuccess && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-10 right-10 bg-emerald-500 text-white px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-emerald-200 flex items-center gap-3">
                        <CheckCircle2 size={18} /> Optimized by Darsi Intelligence
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>

          {/* SIDEBAR ACTION PANEL */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-4 space-y-6 text-left">
            {/* AI BUTTON CARD */}
            <div className="bg-[#0f172a] p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group border-[6px] border-white">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl group-hover:bg-blue-600/40 transition-all duration-700" />
              
              <div className="relative z-10 space-y-8">
                <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-blue-500/40 group-hover:scale-110 transition-transform duration-500">
                  <Sparkles size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black italic tracking-tighter uppercase leading-none">LLM Shift<br/>Synthesizer</h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-4 leading-relaxed opacity-80">
                    Mentransformasi catatan observasi manual menjadi laporan operan standar medis.
                  </p>
                </div>
                <button 
                  disabled={isProcessingAI}
                  onClick={handleGenerateAI}
                  className={`w-full py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-2xl ${
                    isProcessingAI 
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/50 active:scale-95'
                  }`}
                >
                  {isProcessingAI ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} className="fill-current text-yellow-300" />}
                  Generate AI Report
                </button>
              </div>
            </div>

            {/* NAVIGATION BUTTON */}
            <button 
              onClick={handleNextStep}
              className="w-full py-8 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[3.5rem] font-black text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-4 shadow-2xl shadow-emerald-200 transition-all active:scale-95 group"
            >
              Dokumentasi AI <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
            </button>

            {/* INFO CARD */}
            <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm space-y-5">
                <div className="flex items-center gap-3 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">
                  <ShieldCheck size={18} className="text-emerald-500" />
                  <span>Validation Protocol</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed font-bold uppercase tracking-tight">
                  Ringkasan ini bersifat rahasia dan merupakan bagian dari rekam medis pasien. Pastikan data tervalidasi sebelum melanjutkan ke tahap RAG Documentation.
                </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}