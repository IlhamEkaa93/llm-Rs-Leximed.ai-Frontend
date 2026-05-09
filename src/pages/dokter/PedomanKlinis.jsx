import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, ExternalLink, ShieldCheck, 
  Zap, Info, FileText, Loader2, AlertCircle, ArrowLeft,
  Binary, FileSearch, Fingerprint, Database, Search,
  Cpu, Activity
} from 'lucide-react';

export default function PedomanKlinis() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [patient, setPatient] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const savedPatient = localStorage.getItem('active_patient');
    if (savedPatient) {
      setPatient(JSON.parse(savedPatient));
    }
  }, []);

  const handleOpenPDF = () => {
    if (recommendation?.pdfPath && recommendation.pdfPath !== "#") {
      const fullPath = recommendation.pdfPath.startsWith('http') 
        ? recommendation.pdfPath 
        : `http://localhost:8000/storage/${recommendation.pdfPath}`;
      window.open(fullPath, '_blank');
    } else {
      alert("Dokumen sumber sedang dalam proses digitalisasi atau tidak ditemukan.");
    }
  };

  const handleGetGuideline = async () => {
    if (!patient) return;
    setLoading(true);
    setRecommendation(null);
    setErrorMsg("");
    
    try {
      const response = await fetch("http://localhost:8000/api/rag-guideline", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('access_token')}`,
          "Accept": "application/json"
        },
        body: JSON.stringify({ 
          patient_id: patient.norm || patient.no_rm,
          patient_name: patient.name
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Gagal menghubungkan ke RAG Engine.");

      setRecommendation({
        source: result.source || "PPK Internal LexiMed.ai",
        rekomendasi: result.ai_recommendation,
        pertimbangan: result.clinical_notes,
        level: result.evidence_level || "Level A",
        pdfPath: result.document_url || "#"
      });
    } catch (err) {
      setErrorMsg(`Neural Engine Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!patient) return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 flex flex-col items-center max-w-lg">
        <AlertCircle size={80} className="text-amber-500 mb-6 animate-pulse" />
        <h2 className="text-3xl font-black text-slate-800 mb-4 tracking-tighter uppercase italic">Subject Not Found</h2>
        <p className="text-slate-400 mb-8 font-bold text-xs uppercase tracking-widest leading-loose">Silakan pilih subjek pasien terlebih dahulu pada Dashboard untuk melakukan analisis Neural RAG.</p>
        <button onClick={() => navigate('/dashboard')} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95">Pilih Pasien Sekarang</button>
      </motion.div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-24 px-4 font-sans text-left antialiased">
      
      {/* HEADER SECTION (Pasti muncul di paling atas) */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 md:p-12 rounded-[3rem] border border-slate-200 shadow-2xl shadow-slate-200/40 mb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none rotate-12">
            <Binary size={300} />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div className="space-y-4">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-black transition-all text-[10px] uppercase tracking-[0.2em] bg-slate-50 px-5 py-2.5 rounded-full border border-slate-100">
              <ArrowLeft size={14} /> Back to Session
            </button>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">
              Neural <span className="text-blue-600">RAG</span>
            </h1>
            <div className="flex items-center gap-4 bg-blue-50/50 w-fit px-6 py-3 rounded-2xl border border-blue-100 shadow-sm">
               <Fingerprint size={22} className="text-blue-500" />
               <div>
                  <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest leading-none mb-1">Target Analysis</p>
                  <p className="text-blue-900 font-black text-lg tracking-tight uppercase italic leading-none">{patient.name}</p>
               </div>
            </div>
          </div>

          <button 
            onClick={handleGetGuideline} 
            disabled={loading}
            className={`group relative overflow-hidden px-14 py-8 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] transition-all shadow-2xl active:scale-95 ${
              loading ? 'bg-slate-100 text-slate-400' : 'bg-[#0f172a] text-white hover:bg-blue-600 shadow-blue-900/30'
            }`}
          >
            <div className="relative z-10 flex items-center gap-5">
              {loading ? <Loader2 className="animate-spin" size={24} /> : <Zap size={24} className="text-amber-400 fill-amber-400 group-hover:scale-125 transition-transform" />}
              {loading ? "Neural Core Processing..." : "Execute RAG Analysis"}
            </div>
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* SIDEBAR SYSTEM (DITAMBAHKAN ICON CPUS Agar Terlihat Canggih) */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-[#0f172a] p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden border-[6px] border-white">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent"></div>
            <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] mb-10 flex items-center gap-3 relative z-10">
              <Cpu size={16} className="animate-pulse" /> Infrastructure Status
            </h3>
            <div className="space-y-8 relative z-10">
              <div className="flex justify-between items-center py-4 border-b border-white/5 group">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-white transition-colors">Neural Search</span>
                <span className="text-xs font-black text-blue-400 uppercase italic">Vector Index</span>
              </div>
              <div className="flex justify-between items-center py-4 border-b border-white/5 group">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-white transition-colors">Deep Thinking</span>
                <span className="text-xs font-black text-emerald-400 uppercase italic">Llama 3.3-L</span>
              </div>
              <div className="flex justify-between items-center py-4 group">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-white transition-colors">Safety Filter</span>
                <span className="text-xs font-black text-amber-400 uppercase italic">Guardrail v1</span>
              </div>
            </div>
          </motion.div>
          
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 text-slate-400 text-[10px] font-bold leading-relaxed uppercase tracking-[0.2em] text-center shadow-sm">
            <Info size={20} className="mx-auto mb-4 text-blue-600" />
            Neural RAG mensinkronisasi basis pengetahuan internal LexiMed.ai secara real-time untuk akurasi rekomendasi klinis.
          </div>
        </div>

        {/* RESULT AREA */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loading" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="bg-white rounded-[3.5rem] py-32 px-10 border border-slate-200 flex flex-col items-center justify-center shadow-2xl">
                 <div className="relative mb-12">
                    <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-25"></div>
                    <Loader2 size={100} className="text-blue-600 animate-spin relative z-10" />
                 </div>
                 <h4 className="text-2xl font-black text-slate-900 tracking-tighter mb-3 uppercase italic">Synthesizing Clinical Knowledge...</h4>
                 <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Accessing Secure Research Vault</p>
              </motion.div>
            ) : recommendation ? (
              <motion.div key="result" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="bg-white p-10 md:p-16 rounded-[4rem] border border-slate-200 shadow-2xl relative overflow-hidden">
                  <div className="flex flex-col md:flex-row md:items-center gap-8 mb-16 pb-10 border-b-2 border-slate-50">
                    <div className="p-6 bg-emerald-50 text-emerald-600 rounded-[2.5rem] shadow-inner shrink-0 w-fit"><BookOpen size={48} /></div>
                    <div className="text-left">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] block mb-2">Knowledge Source Reference</span>
                       <h3 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">{recommendation.source}</h3>
                    </div>
                  </div>

                  <div className="space-y-16">
                    <section className="text-left">
                       <label className="text-[10px] font-black text-blue-600 uppercase tracking-[0.5em] block mb-8 flex items-center gap-5">
                          <div className="h-1.5 w-16 bg-blue-600 rounded-full"></div> AI RECOMMENDATION
                       </label>
                       <div className="bg-blue-50/40 p-10 rounded-[3.5rem] border border-blue-50 shadow-inner relative overflow-hidden group">
                          <Zap size={120} className="absolute -bottom-10 -right-10 text-blue-100 opacity-50 group-hover:scale-110 transition-transform duration-700" />
                          <p className="text-2xl md:text-3xl font-bold text-slate-800 leading-snug italic relative z-10">
                            "{recommendation.rekomendasi}"
                          </p>
                       </div>
                    </section>

                    <section className="text-left">
                       <label className="text-[10px] font-black text-amber-600 uppercase tracking-[0.5em] block mb-8 flex items-center gap-5">
                          <div className="h-1.5 w-16 bg-amber-500 rounded-full"></div> CLINICAL PERTINENCE
                       </label>
                       <div className="flex items-start gap-8 p-10 bg-amber-50/40 rounded-[3.5rem] border border-amber-100 relative overflow-hidden group">
                          <Activity size={120} className="absolute -bottom-10 -right-10 text-amber-100 opacity-40 group-hover:rotate-12 transition-transform duration-700" />
                          <Info size={40} className="text-amber-500 shrink-0 mt-1 relative z-10" />
                          <p className="text-xl font-black text-amber-900 leading-relaxed uppercase tracking-tight relative z-10">{recommendation.pertimbangan}</p>
                       </div>
                    </section>
                  </div>

                  <div className="mt-20 pt-10 border-t-2 border-slate-50 flex flex-col xl:flex-row justify-between items-center gap-10">
                     <div className="flex items-center gap-6 text-slate-400 max-w-md">
                        <ShieldCheck size={56} className="text-emerald-500 shrink-0 opacity-80" />
                        <span className="text-[9px] font-black uppercase tracking-[0.15em] leading-relaxed text-left">
                          Hasil ini merupakan assistensi keputusan klinis berbasis AI. Keputusan medis akhir sepenuhnya berada pada DPJP terkait dengan integritas Audit Trail.
                        </span>
                     </div>
                     <button onClick={handleOpenPDF} className="w-full xl:w-auto px-12 py-6 bg-[#0f172a] hover:bg-blue-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 shadow-2xl transition-all active:scale-95 group">
                        <FileSearch size={22} className="group-hover:rotate-12 transition-transform" /> VIEW SOURCE PDF
                     </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-40 text-center border-4 border-dashed border-slate-200 rounded-[5rem] bg-slate-50/30 group hover:border-blue-200 transition-all duration-500">
                <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl border border-slate-100 group-hover:scale-110 transition-transform">
                  <Search size={48} className="text-slate-200 group-hover:text-blue-300 transition-colors" />
                </div>
                <h3 className="text-3xl font-black text-slate-300 uppercase tracking-[0.3em] italic">Neural RAG Engine Ready</h3>
                <p className="text-xs font-bold text-slate-400 mt-4 uppercase tracking-widest opacity-60">Klik tombol di atas untuk sinkronisasi basis pengetahuan medis</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
      
      {/* ERROR MESSAGE (DITAMBAHKAN AGAR MUDAH DEBUG) */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-rose-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl flex items-center gap-3">
             <AlertCircle size={18} /> {errorMsg}
             <button onClick={() => setErrorMsg("")} className="ml-4 hover:scale-110">✕</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}