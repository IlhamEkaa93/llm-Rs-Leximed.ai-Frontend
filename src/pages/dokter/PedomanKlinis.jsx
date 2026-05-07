import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, ExternalLink, ShieldCheck, 
  Zap, Info, FileText, Loader2, AlertCircle, ArrowLeft,
  Binary, FileSearch, Fingerprint
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

  // --- FUNGSI UNTUK MEMBUKA PDF (DIPERBAIKI) ---
  const handleOpenPDF = () => {
    if (recommendation?.pdfPath && recommendation.pdfPath !== "#") {
      window.open(recommendation.pdfPath, '_blank');
    } else {
      alert("Dokumen PDF rujukan belum tersedia untuk kasus ini.");
    }
  };

  const handleGetGuideline = async () => {
    if (!patient) return;
    
    setLoading(true);
    setRecommendation(null);
    setErrorMsg("");
    
    try {
      const promptQuery = `Analisis rekam medis NORM ${patient.norm}. Temukan Pedoman Praktik Klinis (PPK) internal RS UNS yang relevan.`;

      const response = await fetch("http://localhost:8000/api/rag-guideline", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('access_token')}`,
          "Accept": "application/json"
        },
        body: JSON.stringify({ 
          patient_id: patient.norm,
          query: promptQuery 
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.message || `Server Error (${response.status})`);
      }

      const data = await response.json();
      
      setRecommendation({
        source: data.source || "PPK Internal RS UNS",
        rekomendasi: data.ai_recommendation || "Sesuai standar operasional medis.", 
        pertimbangan: data.clinical_notes || "Lakukan observasi berkala pada tanda vital.",
        level: data.evidence_level || "Level of Evidence: A",
        pdfPath: data.document_url || "#" 
      });

    } catch (err) {
      setErrorMsg(`RAG Engine Failure: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!patient) return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-slate-500 p-6 text-center">
      <AlertCircle size={64} className="mb-6 text-amber-500 animate-bounce" />
      <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">AKSES DITOLAK</h2>
      <p className="max-w-xs font-medium">Anda belum memilih pasien aktif di Dashboard.</p>
      <motion.button 
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/dashboard')} 
        className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-200"
      >
        Kembali ke Dashboard
      </motion.button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pb-24 font-sans antialiased text-slate-900">
      
      {/* --- HEADER SECTION --- */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/40 mb-8 relative overflow-hidden"
      >
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none rotate-12">
            <BookOpen size={240} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-3">
            <button 
              onClick={() => navigate(-1)} 
              className="group flex items-center text-slate-400 hover:text-blue-600 font-bold transition-all text-xs uppercase tracking-[0.2em]"
            >
              <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Kembali
            </button>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter flex items-center gap-5">
              <div className="p-3.5 bg-blue-600 rounded-[22px] text-white shadow-xl shadow-blue-500/30">
                <Binary size={32} />
              </div>
              Neural RAG
            </h1>
            <p className="text-slate-500 font-semibold text-sm md:text-lg">
                Referensi klinis untuk <span className="text-blue-600 font-black italic underline decoration-blue-200">{patient.name}</span>
            </p>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGetGuideline}
            disabled={loading}
            className={`w-full md:w-auto flex items-center justify-center gap-4 px-12 py-5 rounded-[22px] font-black text-sm uppercase tracking-[0.2em] shadow-2xl transition-all ${
              loading 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
              : 'bg-[#0f172a] text-white hover:bg-blue-600 shadow-blue-500/20'
            }`}
          >
            {loading ? <Loader2 className="animate-spin" size={22} /> : <Zap size={22} className="text-blue-400 fill-current" />}
            {loading ? "Searching..." : "CARI PEDOMAN"}
          </motion.button>
        </div>
      </motion.div>

      {/* --- ERROR MESSAGE --- */}
      <AnimatePresence mode='wait'>
        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-red-50 border-l-4 border-red-500 p-6 mb-8 rounded-[20px] flex items-center gap-5 text-red-800 shadow-sm"
          >
            <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="text-red-600" />
            </div>
            <span className="font-bold text-sm uppercase tracking-tight leading-tight">{errorMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- CONTENT LAYOUT --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* --- LEFT SIDEBAR: PARAMETERS --- */}
        <motion.aside 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-4 xl:col-span-3 space-y-6 lg:sticky lg:top-8"
        >
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                <Fingerprint size={16} className="text-blue-500" /> Neural Context
            </h3>
            <div className="space-y-5">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:border-blue-200 transition-all">
                <span className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Target NORM</span>
                <span className="text-lg font-mono font-bold text-slate-800 tracking-tighter">{patient.norm}</span>
              </div>
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:border-blue-200 transition-all">
                <span className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Model Index</span>
                <span className="text-sm font-black text-blue-600 italic leading-none block">Vector Similarity Engine</span>
              </div>
            </div>
            <p className="mt-10 text-[11px] text-slate-400 font-bold leading-relaxed italic uppercase tracking-wider">
              Data diproses menggunakan Llama-3.3-70B melalui basis pengetahuan PPK RS UNS terverifikasi.
            </p>
          </div>
        </motion.aside>

        {/* --- MAIN AREA: RESULTS --- */}
        <main className="lg:col-span-8 xl:col-span-9">
          <AnimatePresence mode="wait">
            {!recommendation && !loading ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-white/40 border-4 border-dashed border-slate-200 rounded-[3.5rem] p-16 md:p-32 flex flex-col items-center justify-center text-center"
              >
                <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-inner mb-10 border border-slate-100">
                  <FileSearch size={48} className="text-slate-200" />
                </div>
                <h3 className="text-3xl font-black text-slate-800 tracking-tight">Siap Menganalisis</h3>
                <p className="text-slate-400 mt-5 max-w-sm font-bold uppercase text-[10px] tracking-[0.2em] leading-relaxed">Klik tombol cari untuk memulai pencarian cerdas berbasis dokumen klinis.</p>
              </motion.div>
            ) : !recommendation && loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-white rounded-[3.5rem] p-24 border border-slate-200 flex flex-col items-center justify-center shadow-2xl shadow-blue-900/5"
              >
                <div className="relative flex items-center justify-center mb-12">
                    <div className="absolute w-32 h-32 bg-blue-500/10 rounded-full animate-ping"></div>
                    <div className="absolute w-20 h-20 bg-blue-500/20 rounded-full animate-pulse"></div>
                    <Loader2 size={72} className="animate-spin text-blue-600 relative z-10" />
                </div>
                <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-[11px] animate-pulse">Cross-Referencing Knowledge...</p>
              </motion.div>
            ) : (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-white p-8 md:p-14 rounded-[3.5rem] border border-slate-200 shadow-2xl shadow-blue-900/10 relative overflow-hidden">
                  
                  {/* Result Header */}
                  <div className="flex flex-col md:flex-row justify-between pb-12 border-b border-slate-100 mb-12 gap-8">
                    <div className="flex items-center gap-6">
                      <div className="p-5 bg-emerald-50 rounded-[28px] text-emerald-600 shadow-inner ring-4 ring-emerald-50/50">
                        <FileText size={38} />
                      </div>
                      <div className="text-left space-y-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block">Source Document</span>
                        <strong className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter italic">{recommendation.source}</strong>
                      </div>
                    </div>
                    <div className="flex items-center">
                        <span className="px-8 py-3 bg-emerald-500 text-white font-black text-[11px] rounded-2xl uppercase tracking-[0.2em] shadow-xl shadow-emerald-200 flex items-center gap-2">
                            <ShieldCheck size={16} /> {recommendation.level}
                        </span>
                    </div>
                  </div>

                  {/* Result Content */}
                  <div className="space-y-16">
                    <section className="space-y-6">
                      <label className="text-[11px] font-black text-blue-600 uppercase tracking-[0.4em] flex items-center gap-4">
                        <div className="w-12 h-1 bg-blue-600 rounded-full"></div> AI Analysis Recommendation
                      </label>
                      <div className="p-10 bg-gradient-to-br from-blue-50/80 to-transparent rounded-[3rem] border border-blue-100/50 text-slate-800 leading-relaxed text-xl md:text-2xl font-medium italic italic shadow-inner">
                        "{recommendation.rekomendasi}"
                      </div>
                    </section>
                    
                    <section className="space-y-6 text-left">
                      <label className="text-[11px] font-black text-amber-600 uppercase tracking-[0.4em] flex items-center gap-4">
                        <div className="w-12 h-1 bg-amber-500 rounded-full"></div> Clinical Pertinence
                      </label>
                      <div className="flex flex-col md:flex-row items-start gap-8 p-10 bg-amber-50/60 rounded-[3rem] border border-amber-100 text-amber-950 shadow-sm relative overflow-hidden group">
                        <div className="p-4 bg-white rounded-3xl text-amber-600 shadow-md group-hover:scale-110 transition-transform"><Info size={32} /></div>
                        <p className="font-bold leading-relaxed text-lg md:text-xl flex-1">{recommendation.pertimbangan}</p>
                      </div>
                    </section>
                  </div>

                  {/* Footer Actions */}
                  <div className="mt-16 pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex items-center gap-5 text-slate-400 max-w-md text-left">
                      <ShieldCheck size={32} className="shrink-0 text-emerald-500" />
                      <span className="text-[10px] font-bold uppercase leading-relaxed tracking-wider">
                        Verifikasi DPJP bersifat mandatori. Output ini merupakan sistem pendukung keputusan (DSS) berbasis data primer PPK RS UNS.
                      </span>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
                      onClick={handleOpenPDF} 
                      className="w-full md:w-auto px-10 py-5 bg-[#0f172a] text-white rounded-[20px] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-2xl shadow-blue-900/20"
                    >
                      <ExternalLink size={20}/> OPEN PDF ARCHIVE
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}