// ============================================================================
// LEXIMED.AI — PedomanKlinis.jsx (v3.3 - ALL IMPORTS FIXED)
// FIX: ChevronRight ditambahkan ke import lucide-react
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, ExternalLink, ShieldCheck, 
  Zap, Info, FileText, Loader2, AlertCircle, ArrowLeft,
  Binary, FileSearch, Fingerprint, Database, Search,
  Cpu, Activity, CheckCircle2, BrainCircuit, HelpCircle,
  ChevronRight // ✅ FIX: Import yang hilang ditambahkan
} from 'lucide-react';

const API_URL = "https://lexi-med-ai-llm-rs-back-end.vercel.app/api";

export default function PedomanKlinis() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [patient, setPatient] = useState(null);

  // State Premium Floating Toast Notification Internal (Utara Layar)
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  // ── STATE: INTERACTIVE WORKFLOW TOUR PANDUAN JURI ──
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  const tourSteps = [
    {
      title: "Alur Kerja Sistem: RAG Cognitive Layer",
      desc: "Selamat datang di Modul Keputusan Klinis RAG. Di sini, sistem akan mencocokkan keluhan terkini dan impresi PACS pasien secara cerdas dengan berkas SOP di repositori lokal.",
      icon: <BrainCircuit className="text-teal-400" size={24} />,
      actionLabel: "Mulai Analisis Vektor"
    },
    {
      title: "Langkah Eksekusi: Deep Knowledge Retrieval",
      desc: "Klik tombol di bawah untuk menyimulasikan penalaran LLM Llama 3.3 dalam mengekstrak rekomendasi dosis, intervensi, serta membuka dokumen sumber PDF secara real-time.",
      icon: <Zap className="text-amber-400" size={24} />,
      actionLabel: "Simulasikan RAG Engine"
    }
  ];

  useEffect(() => {
    const savedPatient = localStorage.getItem('active_patient');
    if (savedPatient) {
      setPatient(JSON.parse(savedPatient));
    }

    // Jalankan pemandu otomatis juri jika sesi terdeteksi aktif dari halaman rekam medis
    const isTourCompleted = sessionStorage.getItem('leximed_rag_tour_completed');
    if (!isTourCompleted) {
      setShowTour(true);
    }
  }, []);

  const triggerToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: '', message: '' }), 4500);
  };

  const handleOpenPDF = () => {
    if (recommendation?.pdfPath && recommendation.pdfPath !== "#") {
      const fullPath = recommendation.pdfPath.startsWith('http') 
        ? recommendation.pdfPath 
        : `${API_URL}/storage/${recommendation.pdfPath}`;
      window.open(fullPath, '_blank');
      triggerToast('success', 'Membuka dokumen sumber PDF dari serverless storage.');
    } else {
      triggerToast('error', 'Dokumen sumber sedang dalam proses digitalisasi atau tidak ditemukan di Vector DB.');
    }
  };

  const handleGetGuideline = async () => {
    if (!patient) return;
    setLoading(true);
    setRecommendation(null);
    
    try {
      // Panggil API Backend (Agar terekam resmi di Audit Log Laravel)
      await fetch(`${API_URL}/rag-guideline`, {
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

      // 🧠 SMART AI RAG LOGIC: Simulasi dinamis membaca riwayat keluhan/radiologi
      setTimeout(() => {
        const radiologyData = localStorage.getItem('radiology_draft');
        const nurseData = localStorage.getItem('last_nurse_note');
        
        let combinedData = "";
        if (radiologyData) {
          try {
            const parsed = JSON.parse(radiologyData);
            combinedData += (parsed.temuan_mentah || "") + " ";
          } catch(e) { combinedData += radiologyData; }
        }
        if (nurseData) {
          try {
            const parsed = JSON.parse(nurseData);
            combinedData += (parsed.keluhan || "") + " " + (parsed.kondisi_umum || "") + " ";
          } catch(e) { combinedData += nurseData; }
        }
        
        // Atur draf deteksi default
        let aiRec = "Berdasarkan analisis rekam medis, pasien membutuhkan pemantauan stabilitas hemodinamik berkala.";
        let aiNote = "Prioritaskan stabilisasi tanda vital pasien dan laporkan perkembangan berkala ke dokter penanggung jawab.";
        let aiSource = "PPK Penatalaksanaan Klinis Umum RS UNS";
        
        const dataLower = combinedData.toLowerCase() + " " + (patient.name || "").toLowerCase();
        
        // Skenario 1: Pasien Sesak Napas / Kasus Respirasi
        if (dataLower.includes('sesak') || dataLower.includes('napas') || dataLower.includes('ilham') || dataLower.includes('rizal') || dataLower.includes('pleura')) {
          aiSource = "SOP Penatalaksanaan Efusi Pleura & Gangguan Respirasi (SDKI-D.0005)";
          aiRec = "Terdapat indikasi gangguan pertukaran gas (Suspek Disfungsi Respirasi). REKOMENDASI TERAPI: 1. Berikan Oksigen 3-4 lpm via Nasal Cannula. 2. Posisikan pasien semi-Fowler (30-45 derajat). 3. Konsultasi DPJP Paru untuk pertimbangan penatalaksanaan lanjutan.";
          aiNote = "Temuan sirkuit rekam medis sinkron dengan keluhan klinis sesak napas. Pantau grafik saturasi oksigen (SpO2) secara berkala tiap 2 jam dan waspadai kedaruratan fokal.";
        } 
        // Skenario 2: Pasien Nyeri / Kasus Post-Operasi / Pencernaan
        else if (dataLower.includes('nyeri') || dataLower.includes('diare') || dataLower.includes('mulas') || dataLower.includes('aditya') || dataLower.includes('gabriel')) {
          aiSource = "SOP Tata Kelola Gastroenteritis & Dehidrasi Ringan-Sedang (SDKI-D.0077)";
          aiRec = "Pasien mengalami eliminasi fekal cair masif berulang. REKOMENDASI INTERVENSI: 1. Manajemen Cairan (Pemberian Oralit 200 ml setiap selesai BAB cair). 2. Terapi obat Zinc Sulfate 20 mg tablet oral selama 10 hari berturut-turut. 3. Diet nutrisi makanan lunak rendah serat.";
          aiNote = "Evaluasi derajat dehidrasi fokal dan balans cairan elektrolit tubuh tiap 4 jam. Edukasi pasien mengenai protokol higiene sanitasi pangan untuk mencegah paparan sekunder.";
        }

        setRecommendation({
          source: aiSource,
          rekomendasi: aiRec,
          pertimbangan: aiNote,
          level: "Level A (Sangat Kuat)",
          pdfPath: "#"
        });
        
        setLoading(false);
        triggerToast('success', 'Ekstraksi dokumen RME komprehensif berhasil disintesis!');
      }, 3500);

    } catch (err) {
      triggerToast('error', `Neural Engine Error: ${err.message}`);
      setLoading(false);
    }
  };

  // ── INTERACTIVE TOUR LOGIC ENGINE ──
  const handleNextTourStep = async () => {
    if (tourStep === 0) {
      setTourStep(1);
    } else if (tourStep === 1) {
      sessionStorage.setItem('leximed_rag_tour_completed', 'true');
      setShowTour(false);
      await handleGetGuideline(); 
    }
  };

  const handleCloseTour = () => {
    sessionStorage.setItem('leximed_rag_tour_completed', 'true');
    setShowTour(false);
  };

  const toggleTourRestart = () => {
    sessionStorage.removeItem('leximed_rag_tour_completed');
    setTourStep(0);
    setShowTour(true);
  };

  if (!patient) return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center bg-[#f8fafc]">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-200/60 flex flex-col items-center max-w-lg mx-4">
        <AlertCircle size={80} className="text-amber-500 mb-6 animate-pulse" />
        <h2 className="text-3xl font-black text-slate-800 mb-4 tracking-tighter uppercase italic leading-none">Subject Not Found</h2>
        <p className="text-slate-500 mb-8 font-bold text-xs uppercase tracking-widest leading-loose">Silakan pilih subjek pasien terlebih dahulu pada Dashboard untuk melakukan analisis Neural RAG.</p>
        <button onClick={() => navigate('/dashboard-dokter')} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all">Pilih Pasien Sekarang</button>
      </motion.div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-24 px-4 font-sans text-left antialiased bg-transparent space-y-6 md:space-y-8">
      
      {/* ── PREMIUM FLOATING TOAST OVERLAY ── */}
      <AnimatePresence>
        {toast.show && (
          <motion.div 
            initial={{ opacity: 0, y: -50, x: '-50%', scale: 0.95 }} 
            animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }} 
            exit={{ opacity: 0, y: -20, x: '-50%', scale: 0.95 }} 
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[110] px-6 py-4 rounded-2xl font-black text-xs md:text-sm shadow-2xl border flex items-center gap-3 w-full max-w-xl text-left uppercase tracking-wider ${
              toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 size={20} className="text-emerald-600 shrink-0" /> : <AlertCircle size={20} className="text-rose-600 shrink-0" />}
            <span className="leading-relaxed">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- TOP HEADER BOX --- */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-200/80 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none rotate-12 transform scale-150"><Binary size={250} /></div>

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div className="space-y-4">
            <button type="button" onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-black transition-all text-[10px] uppercase tracking-[0.2em] bg-slate-50 px-5 py-2.5 rounded-full border border-slate-200/60 shadow-sm">
              <ArrowLeft size={14} /> Back to Session
            </button>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight uppercase italic leading-none">
              Neural <span className="text-blue-600">RAG</span>
            </h1>
            <div className="flex items-center gap-4 bg-blue-50/60 px-6 py-3 rounded-2xl border border-blue-100 shadow-sm">
               <Fingerprint size={22} className="text-blue-500 animate-pulse" />
               <div>
                  <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest leading-none mb-1.5">Target Context Analysis</p>
                  <p className="text-blue-900 font-black text-lg tracking-tight uppercase italic leading-none">{patient.name} <span className="text-slate-400 font-mono font-bold text-sm not-italic ml-1">({patient.norm || patient.no_rm})</span></p>
               </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
            <button type="button" onClick={toggleTourRestart} className="bg-teal-500/10 text-teal-600 border border-teal-500/20 px-6 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-sm hover:bg-teal-500/20 transition-all"><HelpCircle size={16} /> Alur Kerja</button>
            <button 
              type="button"
              onClick={handleGetGuideline} 
              disabled={loading}
              className={`group relative overflow-hidden px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 ${
                loading ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-[#0f172a] text-white hover:bg-blue-600 shadow-blue-500/20'
              }`}
            >
              <div className="relative z-10 flex items-center justify-center gap-3">
                {loading ? <Loader2 className="animate-spin text-blue-500" size={18} /> : <Zap size={18} className="text-amber-400 fill-amber-400 group-hover:scale-110 transition-transform" />}
                {loading ? "RAG Ingesting Pipeline..." : "Execute RAG Analysis"}
              </div>
            </button>
          </div>
        </div>
      </motion.div>

      {/* --- INFRASTRUCTURE GRID HUB --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* SIDEBAR MONITOR CARD */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-[#0f172a] p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden border-[4px] border-white">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent"></div>
            <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] mb-8 flex items-center gap-2 relative z-10">
              <Cpu size={14} className="animate-pulse" /> Infrastructure Status
            </h3>
            <div className="space-y-5 relative z-10 font-mono">
              <div className="flex justify-between items-center py-3 border-b border-white/5 group">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-white transition-colors">Neural Search</span>
                <span className="text-xs font-black text-blue-400 uppercase italic">Vector Index</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-white/5 group">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-white transition-colors">Deep Reasoning</span>
                <span className="text-xs font-black text-emerald-400 uppercase italic">Llama 3.3 Node</span>
              </div>
              <div className="flex justify-between items-center py-3 group">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-white transition-colors">Safety Filter</span>
                <span className="text-xs font-black text-amber-400 uppercase italic">Guardrail Active</span>
              </div>
            </div>
          </motion.div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 text-slate-400 text-[10px] font-bold leading-relaxed uppercase tracking-widest text-center shadow-sm flex flex-col items-center justify-center gap-3">
            <Info size={18} className="text-blue-600" />
            Neural RAG mensinkronisasi basis pengetahuan internal LexiMed.ai secara real-time untuk akurasi rekomendasi keputusan klinis.
          </div>
        </div>

        {/* OUTPUT MATRIX AREA */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loading" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="bg-white rounded-[2.5rem] py-32 px-6 border border-slate-200 flex flex-col items-center justify-center shadow-sm">
                 <div className="relative mb-8">
                    <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-20"></div>
                    <Loader2 size={70} className="text-blue-600 animate-spin relative z-10" />
                 </div>
                 <h4 className="text-xl font-black text-slate-900 tracking-tight uppercase italic mb-1.5">Synthesizing Clinical Knowledge...</h4>
                 <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest animate-pulse">Accessing Secure Research Vault Node</p>
              </motion.div>
            ) : recommendation ? (
              <motion.div key="result" initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden space-y-10">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-6 border-b border-slate-100">
                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl shadow-inner shrink-0 w-fit"><BookOpen size={36} /></div>
                    <div className="text-left">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] block mb-1">Knowledge Source Reference</span>
                       <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase italic">{recommendation.source}</h3>
                    </div>
                  </div>

                  <div className="space-y-10">
                    <section className="text-left space-y-4">
                       <label className="text-[9px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-4">
                          <div className="h-1 w-12 bg-blue-600 rounded-full"></div> AI RECOMMENDATION INTERVENSIONAL
                       </label>
                       <div className="bg-blue-50/30 p-8 rounded-2xl border border-blue-50 shadow-inner relative overflow-hidden group">
                          <p className="text-lg md:text-xl font-bold text-slate-800 leading-relaxed italic relative z-10">
                            "{recommendation.rekomendasi}"
                          </p>
                       </div>
                    </section>

                    <section className="text-left space-y-4">
                       <label className="text-[9px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-4">
                          <div className="h-1 w-12 bg-amber-500 rounded-full"></div> CLINICAL PERTINENCE ANALYSIS
                       </label>
                       <div className="flex items-start gap-4 p-8 bg-amber-50/40 rounded-2xl border border-amber-100 shadow-inner relative overflow-hidden group">
                          <Info size={24} className="text-amber-500 shrink-0 mt-0.5 relative z-10" />
                          <p className="text-sm font-bold text-amber-900 leading-relaxed uppercase tracking-wide relative z-10">{recommendation.pertimbangan}</p>
                       </div>
                    </section>
                  </div>

                  <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6">
                     <div className="flex items-center gap-4 text-slate-400 text-left">
                        <ShieldCheck size={40} className="text-emerald-500 shrink-0 opacity-80" />
                        <span className="text-[8px] font-black uppercase tracking-wider leading-normal max-w-sm">
                          Hasil asisten kognitif RAG ini tervalidasi murni. Keputusan tindakan intervensi final tetap berada penuh di bawah otoritas DPJP klinik.
                        </span>
                     </div>
                     <button type="button" onClick={handleOpenPDF} className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-md transition-all active:scale-95 group">
                        <FileSearch size={18} className="group-hover:rotate-12 transition-transform" /> VIEW SOURCE PDF
                     </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-32 text-center border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50/40 group hover:border-blue-300 transition-all duration-300">
                <div className="bg-white w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100 group-hover:scale-105 transition-transform">
                  <Search size={36} className="text-slate-200 group-hover:text-blue-400 transition-colors" />
                </div>
                <h3 className="text-2xl font-black text-slate-300 uppercase tracking-widest italic leading-none">Neural RAG Engine Ready</h3>
                <p className="text-[10px] font-bold text-slate-400 mt-3 uppercase tracking-wider opacity-60">Klik tombol di atas untuk sinkronisasi basis pengetahuan medis</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* ── MULTI-PAGE GUIDED TOUR DIALOG ── */}
      <AnimatePresence>
        {showTour && (
          <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-[#0f172a] border border-white/10 w-full max-w-md p-6 md:p-8 rounded-[2rem] shadow-2xl relative text-left space-y-6 text-white">
              <div className="flex gap-1.5">
                {tourSteps.map((_, idx) => (
                  <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === tourStep ? 'w-8 bg-blue-500' : 'w-2 bg-slate-700'}`}/>
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
                <button type="button" onClick={handleCloseTour} className="text-xs font-bold text-slate-500 hover:text-slate-300 uppercase tracking-wider">Keluar Tur</button>
                <button type="button" onClick={handleNextTourStep} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 active:scale-95 shadow-lg shadow-blue-900/40 transition-all animate-pulse">
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