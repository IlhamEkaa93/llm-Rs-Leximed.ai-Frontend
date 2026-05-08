import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BrainCircuit, Sparkles, ArrowRight, Loader2, Database, 
  ShieldCheck, FileText, Calendar, LayoutList, FilePlus, User
} from 'lucide-react';

export default function DraftDokumentasi() {
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  
  // States Sesuai Ketentuan CRUD (Poin 14)
  const [jenisDokumen, setJenisDokumen] = useState('');
  const [periode, setPeriode] = useState(new Date().toISOString().split('T')[0]);
  const [catatanTambahan, setCatatanTambahan] = useState('');
  const [result, setResult] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [ragSuccess, setRagSuccess] = useState(false);

  useEffect(() => {
    const activePatient = localStorage.getItem('active_patient');
    const handoverData = localStorage.getItem('handover_summary_final');
    
    if (!activePatient) {
        alert("Sesi pasien hilang. Silakan mulai dari Dashboard.");
        navigate('/dashboard-perawat');
        return;
    }
    
    setPatient(JSON.parse(activePatient));

    // Menarik data ringkasan shift dari tahap sebelumnya
    if (handoverData) {
        const data = JSON.parse(handoverData);
        // Menampilkan data ringkasan sementara di kotak hasil
        setResult(`[DATA RINGKASAN SHIFT SEBELUMNYA]\n${data.summary}\n\n---\nSilakan lengkapi form di atas dan klik 'Run RAG Analysis' untuk menyusun Dokumentasi Keperawatan resmi.`);
    }
  }, [navigate]);

  const handleProcessRAG = () => {
    if (!jenisDokumen) return alert("Silakan pilih Jenis Dokumentasi terlebih dahulu.");
    
    setIsGenerating(true);
    setRagSuccess(false);

    // Simulasi Proses RAG (Retrieval-Augmented Generation) + LLM
    setTimeout(() => {
      const generatedDoc = `DOKUMENTASI KEPERAWATAN (${jenisDokumen})\n-------------------------------------------------\nNAMA PASIEN: ${patient.name}\nRM: ${patient.norm}\nPERIODE: ${periode}\n\n[1] DATA SUBJEKTIF (S):\nPasien mengatakan nyeri pada area operasi sudah mulai berkurang jika tidak bergerak. ${catatanTambahan ? `\nCatatan Tambahan: ${catatanTambahan}` : ''}\n\n[2] DATA OBJEKTIF (O):\nKeadaan umum sedang, kesadaran Compos Mentis. Tanda-tanda vital stabil. Luka operasi bersih, tidak ada eksudat berlebih.\n\n[3] ASESMEN / DIAGNOSA (A):\nNyeri Akut b.d agen pencedera fisik (prosedur operasi).\n\n[4] PLANNING / INTERVENSI (P):\n- Evaluasi skala nyeri setiap 4 jam.\n- Ajarkan teknik relaksasi napas dalam.\n- Kolaborasi pemberian analgesik sesuai resep medis.\n\nDIHASILKAN OLEH: Neural RAG Engine RS UNS\nREFERENSI: SDKI, SIKI, SLKI (Standar Keperawatan Indonesia)`;
      
      setResult(generatedDoc);
      setIsGenerating(false);
      setRagSuccess(true);
      
      // Hilangkan pesan sukses setelah 4 detik
      setTimeout(() => setRagSuccess(false), 4000);
    }, 2500);
  };

  const handleNextStep = () => {
    if (!result.includes("DOKUMENTASI KEPERAWATAN")) {
      return alert("Harap jalankan RAG Analysis terlebih dahulu sebelum verifikasi.");
    }
    
    // Simpan hasil draft RAG ke localStorage untuk divalidasi
    localStorage.setItem('draft_dokumentasi_rag', result);
    navigate('/validasi-ai');
  };

  if (!patient) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10 font-sans text-left pb-24 text-slate-900 antialiased">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER SECTION */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} 
          className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none rotate-12"><Database size={200} /></div>
          
          <div className="flex items-center gap-5 w-full xl:w-auto relative z-10">
            <div className="p-4 bg-purple-600 rounded-[1.5rem] text-white shadow-xl shadow-purple-200 shrink-0">
              <BrainCircuit size={32} />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase italic leading-none">Dokumentasi AI (RAG)</h1>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mt-2">Poin 14: LLM + Knowledge Base Integration</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 px-6 py-4 rounded-2xl border border-slate-200 shadow-inner relative z-10 w-full xl:w-auto">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-200 shadow-sm shrink-0">
                <User size={20} className="text-purple-600" />
              </div>
              <div className="text-left leading-tight">
                <p className="font-black text-slate-800 text-sm">{patient.name}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">RM: {patient.norm}</p>
              </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* MAIN FORM AREA (KIRI) */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-8 space-y-8">
            <div className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 space-y-8 relative overflow-hidden">
              
              {/* ROW 1: JENIS DOKUMEN & PERIODE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <div className="space-y-3 text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                    <LayoutList size={14} className="text-purple-500" /> Jenis Dokumentasi
                  </label>
                  <select 
                    value={jenisDokumen} onChange={(e) => setJenisDokumen(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold text-slate-700 outline-none focus:border-purple-500 transition-all cursor-pointer shadow-inner"
                  >
                    <option value="">-- Pilih Jenis --</option>
                    <option value="ASUHAN_KEPERAWATAN">Asuhan Keperawatan Harian (SOAP)</option>
                    <option value="RESUME_PULANG">Resume Keperawatan Pasien Pulang</option>
                    <option value="TINDAKAN_KHUSUS">Laporan Tindakan Keperawatan Khusus</option>
                  </select>
                </div>

                <div className="space-y-3 text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                    <Calendar size={14} className="text-purple-500" /> Periode / Tanggal
                  </label>
                  <input 
                    type="date" 
                    value={periode} onChange={(e) => setPeriode(e.target.value)} 
                    className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold text-slate-700 focus:border-purple-500 outline-none transition-all shadow-inner" 
                  />
                </div>
              </div>

              {/* ROW 2: CATATAN TAMBAHAN */}
              <div className="space-y-3 relative z-10 text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                  <FilePlus size={14} className="text-purple-500" /> Catatan Tambahan (Opsional)
                </label>
                <textarea 
                  className="w-full h-24 p-5 bg-slate-50 border-2 border-slate-100 rounded-[2rem] outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300 resize-none focus:border-purple-500 shadow-inner"
                  placeholder="Tambahkan informasi khusus yang ingin disertakan AI dalam dokumentasi..."
                  value={catatanTambahan}
                  onChange={(e) => setCatatanTambahan(e.target.value)}
                />
              </div>

              <hr className="border-slate-100" />

              {/* ROW 3: LLM RESULT TEXTAREA */}
              <div className="space-y-4 relative z-10 text-left">
                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                  <Database size={18} className="text-purple-500" /> Draft Dokumentasi Akhir
                </label>
                
                <div className="relative">
                  <AnimatePresence>
                    {isGenerating && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-white/90 backdrop-blur-md z-20 rounded-[2.5rem] flex flex-col items-center justify-center border-2 border-purple-100">
                        <div className="relative mb-6">
                           <Loader2 className="animate-spin text-purple-600" size={70} />
                           <Database className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-purple-400" size={24} />
                        </div>
                        <h4 className="text-lg font-black text-slate-900 uppercase italic tracking-tighter">Retrieving Knowledge Base</h4>
                        <p className="text-xs font-bold text-purple-600 uppercase tracking-[0.3em] animate-pulse mt-2 text-center px-10">Cross-referencing with SDKI & SIKI...</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <textarea 
                    className={`w-full h-[400px] p-10 bg-slate-50 border-2 rounded-[3rem] outline-none transition-all font-medium text-slate-700 text-lg leading-relaxed resize-none shadow-inner scrollbar-hide ${
                      ragSuccess ? 'border-emerald-400 bg-emerald-50/30' : 'border-transparent focus:border-purple-500 focus:bg-white'
                    }`}
                    value={result}
                    onChange={(e) => setResult(e.target.value)}
                  />
                  
                  <AnimatePresence>
                    {ragSuccess && (
                      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="absolute bottom-8 right-8 bg-emerald-500 text-white px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
                        <ShieldCheck size={16} /> Data RAG Tersinkronisasi
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ACTION SIDEBAR (KANAN) */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-4 space-y-6 text-left">
            <div className="bg-[#0f172a] p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group border-[6px] border-white">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-600/20 rounded-full blur-3xl group-hover:bg-purple-600/40 transition-all duration-700" />
              
              <div className="relative z-10 space-y-8">
                <div className="w-16 h-16 bg-purple-600 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-purple-500/40 group-hover:scale-110 transition-transform duration-500">
                  <Database size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black italic tracking-tighter uppercase leading-none">RAG Engine<br/>Analysis</h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-4 leading-relaxed opacity-80">
                    Sistem akan memproses ringkasan shift dan menyusunnya berdasarkan Pedoman Asuhan Keperawatan standar.
                  </p>
                </div>
                <button 
                  disabled={isGenerating}
                  onClick={handleProcessRAG}
                  className={`w-full py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-2xl ${
                    isGenerating 
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                    : 'bg-purple-600 hover:bg-purple-500 shadow-purple-900/50 active:scale-95'
                  }`}
                >
                  {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} className="fill-current text-purple-200" />}
                  Run RAG Analysis
                </button>
              </div>
            </div>

            <button 
              onClick={handleNextStep}
              className="w-full py-8 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[3.5rem] font-black text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-4 shadow-2xl shadow-emerald-200 transition-all active:scale-95 group"
            >
              Step 15: Verifikasi <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
            </button>

            <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm space-y-5">
                <div className="flex items-center gap-3 text-[10px] font-black text-purple-600 uppercase tracking-[0.2em]">
                  <FileText size={18} className="text-emerald-500" />
                  <span>SOP Integration</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed font-bold uppercase tracking-tight">
                  Dokumen ini dihasilkan secara otomatis oleh AI dan harus melewati tahap verifikasi manusia sebelum dienkripsi ke database medis RS UNS.
                </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}