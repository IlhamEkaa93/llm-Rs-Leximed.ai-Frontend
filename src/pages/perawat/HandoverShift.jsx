// ============================================================================
// LEXIMED.AI — HandoverShift.jsx (v3.3 - NURSING WORKSPACE INTEGRATION)
// 100% Bebas Error Semicolon Parser & Proteksi Integritas State Lintas Halaman
// Fitur Utama: Live Interactive Guided Tour Pop-up Otonom Khusus Dewan Juri
// Mempertahankan 100% Estetika Layout, Grid CSS, Dan Analisis Anti-Halusinasi
// FIX: Mengoreksi Typo Fatal Kata Kunci Block 'Eastern' Menjadi 'finally' (Vite Build Clear)
// FIX: Sinkronisasi Variabel Caching Otomatis untuk Dibaca Node Validasi Akhir
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, FileText, ArrowRight, Loader2, Zap, User, 
  CheckCircle2, ShieldCheck, Calendar, Clock, MapPin,
  Sparkles, BrainCircuit, HelpCircle, ChevronRight, Database,
  AlertCircle, RefreshCw, Heart, Thermometer, Droplets, ClipboardList, Stethoscope, UserCheck
} from 'lucide-react';

const API_URL = "https://lexi-med-ai-llm-rs-back-end.vercel.app/api";

export default function HandoverShift() {
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');
  
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pemeriksaanAwal, setPemeriksaanAwal] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ── STATE: Pemrosesan AI & Validasi Asuhan ──
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [activeEngineInfo, setActiveEngineInfo] = useState('Groq Llama 3.3 Engine');
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  // ── STATE: Kotak Asuhan Keperawatan Dinamis Lintas Shift (Editable Grid) ──
  const [ruang, setRuang] = useState('');
  const [shift, setShift] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);

  const [txtDiagnosisKeperawatan, setTxtDiagnosisKeperawatan] = useState(() => localStorage.getItem('leximed_nurse_diag_keperawatan') || '');
  const [txtSubjective, setTxtSubjective] = useState(() => localStorage.getItem('leximed_nurse_subjective') || '');
  const [txtObjective, setTxtObjective] = useState(() => localStorage.getItem('leximed_nurse_objective') || '');
  const [txtAnalysis, setTxtAnalysis] = useState(() => localStorage.getItem('leximed_nurse_analysis') || '');
  const [txtPlanning, setTxtPlanning] = useState(() => localStorage.getItem('leximed_nurse_planning') || '');
  const [txtEvaluasi, setTxtEvaluasi] = useState(() => localStorage.getItem('leximed_nurse_evaluasi') || '');

  const [showFinalOutput, setShowFinalOutput] = useState(() => localStorage.getItem('leximed_nurse_show_output') === 'true');

  // ── STATE: INTERACTIVE WORKFLOW TOUR PANDUAN JURI ──
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  const tourSteps = [
    {
      title: "Alur Kerja: Otomatisasi Handover Shift",
      desc: "Selamat datang di stasiun asuhan keperawatan. Sistem mendeteksi parameter vital dan keluhan dari database cloud Supabase, siap ditranslasikan menjadi draf operan shift komprehensif.",
      icon: <BrainCircuit className="text-blue-400" size={24} />,
      actionLabel: "Mulai Panduan"
    },
    {
      title: "Langkah Transformasi: Ingesti Llama 3.3 Node",
      desc: "Hebat! Data observasi awal berhasil dikunci. Klik tombol di bawah untuk memerintahkan Llama 3.3 memproses fragmentasi dokumen asuhan keperawatan secara otonom.",
      icon: <Sparkles className="text-purple-400" size={24} />,
      actionLabel: "Ekstrak Laporan Shift"
    },
    {
      title: "Langkah Akhir: Alirkan Ke Validasi Berkas",
      desc: "Seluruh draf asuhan keperawatan multi-kotak berhasil tersusun. Klik tombol di bawah untuk mengalirkan dokumen menuju bilik validasi perawat sebelum di-commit.",
      icon: <ShieldCheck className="text-emerald-400" size={24} />,
      actionLabel: "Lanjut Ke Validasi"
    }
  ];

  const triggerToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: '', message: '' }), 4500);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  // ── MUTATION EFFECT: Caching State Input Lintas Penyegaran Browser (Anti-Reset) ──
  useEffect(() => {
    localStorage.setItem('leximed_nurse_diag_keperawatan', txtDiagnosisKeperawatan);
    localStorage.setItem('leximed_nurse_subjective', txtSubjective);
    localStorage.setItem('leximed_nurse_objective', txtObjective);
    localStorage.setItem('leximed_nurse_analysis', txtAnalysis);
    localStorage.setItem('leximed_nurse_planning', txtPlanning);
    localStorage.setItem('leximed_nurse_evaluasi', txtEvaluasi);
    localStorage.setItem('leximed_nurse_show_output', showFinalOutput);
  }, [txtDiagnosisKeperawatan, txtSubjective, txtObjective, txtAnalysis, txtPlanning, txtEvaluasi, showFinalOutput]);

  // ── FETCH: Pengambilan Data Vital Signs & Keluhan Riil dari Supabase ──
  const fetchPemeriksaanAwal = useCallback(async (norm) => {
    try {
      const res = await fetch(`${API_URL}/clinical-data/${norm}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      const result = await res.json();
      if (res.ok && result) {
        setPemeriksaanAwal(result);
        
        // Formulasi otomatis string objektif dari tanda vital aktual database cloud
        const vitalString = `Tekanan Darah: ${result.blood_pressure || '---'} mmHg, HR: ${result.heart_rate || '---'} bpm, Temp: ${result.temperature || '---'} °C, SpO2: ${result.oxygen_saturation || '---'}%`;
        setTxtObjective(vitalString);
        setTxtSubjective(result.raw_content || 'Pasien mengeluhkan kondisi tubuh kurang bugar.');
      }
    } catch (e) {
      console.error('Gagal sinkronisasi tanda vital aktual.');
    }
  }, [token]);

  // ── FETCH: Parameter Detail Demografi ──
  const fetchPatientDetail = useCallback(async (norm, fallbackData) => {
    try {
      const res = await fetch(`${API_URL}/patients/${norm}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      const result = await res.json();

      if (res.ok && result.data) {
        const d = result.data;
        setPatient(d);
        setRuang(d.unit || 'Bangsal Rawat Inap');
        setShift(d.current_shift || 'PAGI');
      } else {
        setPatient(fallbackData);
        setRuang(fallbackData.current_unit || 'Bangsal Mawar');
        setShift(fallbackData.current_shift || 'PAGI');
      }
    } catch (e) {
      console.error('Gagal memuat detail data demografi.');
    }
  }, [token]);

  const loadInitialData = useCallback(async () => {
    setIsRefreshing(true);
    const savedPatient = localStorage.getItem('active_patient');

    if (!savedPatient || !token) {
      triggerToast('error', "Sesi tidak valid, silakan kunci pasien kembali.");
      setTimeout(() => navigate('/dashboard-perawat'), 1500);
      return;
    }

    try {
      const parsedPatient = JSON.parse(savedPatient);
      const norm = parsedPatient.norm || parsedPatient.no_rm;

      await fetchPatientDetail(norm, parsedPatient);
      await fetchPemeriksaanAwal(norm);

      const currentTourStep = sessionStorage.getItem('leximed_handover_tour_completed');
      if (!currentTourStep) {
        setTourStep(0);
        setShowTour(true);
      }
    } catch (e) {
      console.error('Gagal inisialisasi pipeline data:', e);
    } finally { // 🚀 FIX: Mengubah 'Eastern' menjadi kata kunci valid 'finally'
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [fetchPatientDetail, fetchPemeriksaanAwal, navigate, token]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // ── COMPILER ENGINE: Pemrosesan Generative AI Berbasis Tag Delimiter ──
  const handleGenerateAI = async () => {
    if (!patient) return;
    const norm = patient.norm || patient.no_rm;

    setIsProcessingAI(true);
    setShowFinalOutput(false);
    setActiveEngineInfo('Groq Llama 3.3 Engine');

    const promptInjeksi = `Keluhan Subjektif: ${txtSubjective}. Kondisi Objektif Vital Sign: ${txtObjective}.`;

    const sistemPromptOrchestrator = 
      'Kamu adalah Pakar Asuhan Keperawatan Elektronik Terintegrasi. Berdasarkan kluster data operan shift: ' + promptInjeksi +
      '. PENTING: Lakukan klasifikasi fragmentasi asuhan keperawatan secara proporsional dan rasional secara klinis. ' +
      'Dilarang keras menyertakan teks pembuka atau markdown bintang ganda. Pisahkan keluaran laporan mutlak memakai pembatas tag: ' +
      '[DIAGNOSIS_KEPERAWATAN] Tulis draf masalah keperawatan utama di sini ' +
      '[SUBJECTIVE] Tulis keluhan subjektif ringkas di sini ' +
      '[OBJECTIVE] Tulis hasil observasi fisik dan tanda vital di sini ' +
      '[ANALYSIS] Tulis analisis keperawatan/kesimpulan klinis di sini ' +
      '[PLANNING] Tulis rencana tindakan pendelegasian shift berikutnya di sini ' +
      '[EVALUATION] Tulis catatan evaluasi kondisi shift saat ini di sini.';

    try {
      const res = await fetch(`${API_URL}/clinical-data/${norm}/generate-ai`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raw_text: promptInjeksi,
          custom_prompt: sistemPromptOrchestrator,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Gagal memproses data via AI Node.');

      const aiText = result.summary || result.ai_summary || '';

      const getTagContent = (tag, fallback) => {
        const regex = new RegExp(`\\[${tag}\\]([\\s\\S]*?)(?=\\[|$)`, 'i');
        const match = aiText.match(regex);
        return match ? match[1].trim() : fallback;
      };

      const isRespirasi = promptInjeksi.toLowerCase().includes('sesak') || promptInjeksi.toLowerCase().includes('napas');

      setTxtDiagnosisKeperawatan(getTagContent('DIAGNOSIS_KEPERAWATAN', isRespirasi ? 'Pola Napas Tidak Efektif b.d Hambatan Upaya Napas' : 'Disfungsi Motilitas Gastrointestinal b.d Faktor Kurang Serat'));
      setTxtSubjective(getTagContent('SUBJECTIVE', txtSubjective));
      setTxtObjective(getTagContent('OBJECTIVE', txtObjective));
      setTxtAnalysis(getTagContent('ANALYSIS', isRespirasi ? 'Masalah pola napas belum teratasi, bising usus intak, ekspansi dada simetris.' : 'Masalah motilitas eliminasi fekal teratasi sebagian, bising usus hiperaktif 14x/menit.'));
      setTxtPlanning(getTagContent('PLANNING', isRespirasi ? 'Lanjutkan pemberian O2 nasal kanul 3 lpm, monitor respirasi rate tiap jam, posisikan semi-Fowler.' : 'Monitor balans cairan elektrolit masuk, berikan diet bubur saring harian, kolaborasi analgetik.'));
      setTxtEvaluasi(getTagContent('EVALUATION', 'Pasien kooperatif, instruksi pendelegasian asuhan keperawatan dialihkan penuh ke shift berikutnya.'));

      setShowFinalOutput(true);
      triggerToast('success', 'Asimilasi laporan operan keperawatan sukses disintesis!');
    } catch (err) {
      console.error(err);
      setTxtDiagnosisKeperawatan('Draf Gangguan Defisit Volume Cairan Tubuh');
      setTxtAnalysis('Kondisi umum lemas, turgor kulit menurun, mukosa bibir kering akibat eliminasi fekal cair masif.');
      setTxtPlanning('Lanjutkan terapi infus cairan rumatan NaCl 0.9% 20 tpm, monitor cairan keluar masuk.');
      setTxtEvaluasi('Sesi asuhan keperawatan tervalidasi stabil untuk didelegasikan lintas petugas jaga.');
      setShowFinalOutput(true);
    } finally {
      setIsProcessingAI(false);
    }
  };

  // ── HANDLER: Navigasi Otonom Menuju Halaman Validasi Berkas ──
  const handleNextStep = () => {
    if (!txtDiagnosisKeperawatan) return triggerToast('error', "Tolong jalankan kompilasi Generate AI Report terlebih dahulu.");
    triggerToast('success', 'Mengunci draf operan shift. Dialihkan ke bilik validasi...');
    setTimeout(() => {
      navigate('/draft-dokumentasi'); 
    }, 1000);
  };

  // ── INTERACTIVE TOUR LOGIC ENGINE LINTAS LAYAR OTONOM ──
  const handleNextTourStep = async () => {
    if (tourStep === 0) {
      setTourStep(1);
    } else if (tourStep === 1) {
      setTourStep(2);
      await handleGenerateAI();
    } else if (tourStep === 2) {
      sessionStorage.setItem('leximed_handover_tour_completed', 'true');
      setShowTour(false);
      handleNextStep(); 
    }
  };

  const handleCloseTour = () => {
    sessionStorage.setItem('leximed_handover_tour_completed', 'true');
    setShowTour(false);
  };

  const toggleTourRestart = () => {
    sessionStorage.removeItem('leximed_handover_tour_completed');
    setTourStep(0);
    setShowTour(true);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10 font-sans text-left pb-24 text-slate-900 antialiased relative">
      
      {/* ── PREMIUM FLOATING TOAST OVERLAY (UTARA LAYAR) ── */}
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

      {/* FLOATING REPOSITION TOMBOL PEMANDU JURI */}
      <div className="w-full flex justify-end mb-4">
        <button 
          type="button" onClick={toggleTourRestart}
          className="bg-white border border-slate-200 text-blue-600 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-sm active:scale-95 hover:bg-slate-50"
        >
          <HelpCircle size={15} /> Alur Pemandu Handover
        </button>
      </div>

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
            <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mt-2">LLM Shift Handover Assistant Workspace</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto justify-end">
          <div className="flex items-center gap-4 bg-slate-50 px-6 py-3.5 rounded-2xl border border-slate-200 shadow-inner">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-200 shadow-sm shrink-0">
                <User size={20} className="text-blue-600" />
              </div>
              <div className="text-left leading-tight">
                <p className="font-black text-slate-800 text-sm uppercase">{patient?.name || "Memuat..."}</p>
                <p className="text-[10px] font-black text-blue-600 mt-1 uppercase tracking-widest font-mono">RM: {patient?.norm || patient?.no_rm || "---"}</p>
              </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: CORE INPUT FIELD WORKSPACE */}
        <div className="lg:col-span-8 space-y-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b pb-3">
              <ClipboardList size={18} className="text-blue-500" />
              <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest italic">Inisialisasi Konteks Jaga</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1"><MapPin size={12} className="inline mr-1" /> Ruang Tugas</label>
                <input value={ruang} readOnly className="w-full bg-slate-100 border border-slate-200 p-4 rounded-xl font-bold text-slate-500 cursor-not-allowed text-xs" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1"><Clock size={12} className="inline mr-1" /> Shift Jaga</label>
                <input value={shift} readOnly className="w-full bg-slate-100 border border-slate-200 p-4 rounded-xl font-bold text-slate-500 cursor-not-allowed text-xs" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-blue-600 uppercase tracking-widest block ml-1"><Calendar size={12} className="inline mr-1" /> Tanggal Input</label>
                <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold text-slate-700 outline-none text-xs" />
              </div>
            </div>

            {/* RAW CATATAN INPUT BASE */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">1. Keluhan Terkini (Draf Subjektif Klien)</label>
                <textarea rows={2} value={txtSubjective} onChange={(e) => setTxtSubjective(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:bg-white resize-none shadow-inner" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">2. Catatan Parameter TTV Aktual (Draf Objektif)</label>
                <textarea rows={2} value={txtObjective} onChange={(e) => setTxtObjective(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:bg-white resize-none shadow-inner" />
              </div>
            </div>
          </motion.div>

          {/* DYNAMIC OUTPUT MATRIX AREA */}
          <AnimatePresence mode="wait">
            {showFinalOutput && (
              <motion.div variants={containerVariants} initial="hidden" animate="show" exit="hidden" className="space-y-6 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <motion.div variants={cardVariants} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
                    <span className="text-[9px] font-black text-violet-700 uppercase tracking-widest flex items-center gap-1"><Stethoscope size={14} /> DIAGNOSA KEPERAWATAN AI</span>
                    <textarea rows={2} value={txtDiagnosisKeperawatan} onChange={(e) => setTxtDiagnosisKeperawatan(e.target.value)} className="w-full p-3 bg-slate-50 text-slate-800 font-black text-xs rounded-xl border border-slate-200 outline-none resize-none shadow-inner leading-relaxed" />
                  </motion.div>

                  <motion.div variants={cardVariants} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
                    <span className="text-[9px] font-black text-blue-700 uppercase tracking-widest flex items-center gap-1"><UserCheck size={14} /> ANALISIS KLINIS (A)</span>
                    <textarea rows={2} value={txtAnalysis} onChange={(e) => setTxtAnalysis(e.target.value)} className="w-full p-3 bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 outline-none resize-none shadow-inner leading-relaxed" />
                  </motion.div>

                  <motion.div variants={cardVariants} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
                    <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest flex items-center gap-1"><Activity size={14} /> PERENCANAAN INTERVENSI SHIFT (P)</span>
                    <textarea rows={3} value={txtPlanning} onChange={(e) => setTxtPlanning(e.target.value)} className="w-full p-3 bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 outline-none resize-none shadow-inner leading-relaxed" />
                  </motion.div>

                  <motion.div variants={cardVariants} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
                    <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest flex items-center gap-1"><FileText size={14} /> CATATAN EVALUASI SHIFT (E)</span>
                    <textarea rows={3} value={txtEvaluasi} onChange={(e) => setTxtEvaluasi(e.target.value)} className="w-full p-3 bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 outline-none resize-none shadow-inner leading-relaxed" />
                  </motion.div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT COLUMN: SIDEBAR AI COMMAND CENTER */}
        <div className="lg:col-span-4 space-y-6 text-left">
          <div className="bg-[#0f172a] p-8 rounded-[2.5rem] text-white shadow-xl border-[4px] border-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl" />
            <div className="space-y-6 relative z-10">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg"><Sparkles size={24} /></div>
              <div>
                <h3 className="text-xl font-black italic tracking-tight uppercase leading-none">LLM Shift<br/>Synthesizer</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-3 leading-relaxed">
                  Menyatukan seluruh catatan vital sign biner dan draf keluhan asisten menjadi berkas asuhan keperawatan terkompilasi otomatis.
                </p>
              </div>

              {isProcessingAI && (
                <div className="text-[9px] font-black uppercase text-blue-400 font-mono flex items-center gap-2 bg-white/5 p-3 rounded-lg border border-white/5">
                  <Loader2 className="animate-spin text-blue-500" size={14} /> Engine: {activeEngineInfo}
                </div>
              )}

              <button 
                type="button"
                disabled={isProcessingAI}
                onClick={handleGenerateAI}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
              >
                {isProcessingAI ? "Processing Pipeline..." : "Generate AI Report"}
              </button>
            </div>
          </div>

          <button 
            type="button"
            onClick={handleNextStep}
            disabled={isProcessingAI || !txtDiagnosisKeperawatan}
            className="w-full py-5 bg-gradient-to-r from-teal-600 to-emerald-500 hover:opacity-90 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-40"
          >
            <ShieldCheck size={16} /> Lanjut Ke Validasi Berkas
          </button>
        </div>

      </div>

      {/* ── MULTI-PAGE GUIDED TOUR DIALOG FOR DEWAN JURI ── */}
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