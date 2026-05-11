import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Users, Clock, Activity, BrainCircuit, 
  Sparkles, FileText, CheckCircle2, ShieldCheck, 
  Calendar, Filter, BarChart3, PieChart, ArrowRight,
  MessageSquare, Loader2, Save, XCircle, RefreshCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardManajemen() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loadingAI, setLoadingAI] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  
  // States Filter (CRUD Agregat)
  const [periode, setPeriode] = useState(new Date().toISOString().slice(0, 7));
  const [unit, setUnit] = useState('ALL');
  
  // Real-time KPI Stats
  const [stats, setStats] = useState({
    totalPasien: 0,
    avgTunggu: '0m',
    utilBed: '0%',
    totalLayanan: 0
  });

  // AI & Form States
  const [insightAI, setInsightAI] = useState('');
  const [executiveSummary, setExecutiveSummary] = useState('');
  const [catatanKeputusan, setCatatanKeputusan] = useState('');

  // --- 1. FETCH DATA REAL-TIME (DASHBOARD KPI) ---
  const fetchRealtimeStats = async () => {
    setLoadingData(true);
    try {
      const response = await fetch(`https://lexi-med-ai-llm-rs-back-end.vercel.app/api/manajemen/dashboard?periode=${periode}&unit=${unit}`, {
        headers: { 
          "Authorization": `Bearer ${localStorage.getItem('access_token')}`,
          "Accept": "application/json"
        }
      });
      const result = await response.json();
      if (result.stats) {
        setStats(result.stats);
      }
    } catch (err) {
      console.error("Gagal mengambil data manajemen:", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchRealtimeStats();
  }, [periode, unit]);

  // --- 2. ANALISIS LAYANAN (DATA OPERASIONAL + LLM) ---
  const runDeepAnalysis = () => {
    setLoadingAI(true);
    setTimeout(() => {
      // Simulasi Logic LLM memproses data agregat yang baru ditarik
      setInsightAI(`INSIGHT EKSEKUTIF - UNIT: ${unit}\n-----------------------------------\n\n1. ANALISIS BEBAN: Berdasarkan data real-time, jumlah layanan mencapai ${stats.totalLayanan}. Terdapat korelasi positif antara waktu tunggu (${stats.avgTunggu}) dengan kepuasan pasien.\n\n2. REKOMENDASI AI: Utilisasi bed berada di angka ${stats.utilBed}. Diperlukan re-alokasi tenaga medis dari unit dengan BOR rendah ke unit ${unit}.\n\n3. PREDIKSI: Model Llama 3.3 memprediksi volume pasien akan stabil namun intensitas tindakan bedah akan meningkat 12% di periode berikutnya.`);
      setLoadingAI(false);
    }, 2000);
  };

  // --- 3. RINGKASAN EKSEKUTIF (LLM GENERATION) ---
  const generateSummary = () => {
    setLoadingAI(true);
    setTimeout(() => {
      setExecutiveSummary(`LAPORAN MANAJERIAL LexiMed.ai\nPERIODE: ${periode}\nUNIT: ${unit}\n\nSistem Darsi Intelligence melaporkan efisiensi operasional yang optimal. Total akumulasi pasien mencapai ${stats.totalPasien} subjek. Tidak ditemukan anomali pada audit trail klinis. Fokus strategis bulan depan: Digitalisasi penuh PACS Radiologi.`);
      setLoadingAI(false);
    }, 1500);
  };

  // --- 4. VALIDASI LAPORAN (FINAL DECISION) ---
  const handleFinalApprove = async () => {
    setIsSuccess(true);
    try {
      // Simpan ke Audit Log Final
      await fetch("https://lexi-med-ai-llm-rs-back-end.vercel.app/api/clinical-data", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ 
          patient_id: "MGMT-REPORT-" + periode,
          raw_content: executiveSummary + "\nCatatan Direksi: " + catatanKeputusan,
          status: "verified",
          source: "management_final_report"
        })
      });

      setTimeout(() => {
        setIsSuccess(false);
        setActiveTab('dashboard');
        setCatatanKeputusan('');
      }, 3000);
    } catch (err) {
      alert("Gagal menyimpan validasi.");
      setIsSuccess(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10 font-sans text-left pb-24 text-slate-900 antialiased overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* HEADER & FILTERS (CRUD AGGREGATE) */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none rotate-12"><TrendingUp size={200} /></div>
          
          <div className="relative z-10 w-full xl:w-auto">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight uppercase italic leading-none">Management <span className="text-emerald-600">Command Center</span></h1>
            <div className="flex flex-wrap gap-2 mt-6">
              {['dashboard', 'analisis', 'ringkasan', 'validasi'].map((tab) => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row gap-4 w-full xl:w-auto mt-4 xl:mt-0">
             <div className="flex-1 flex items-center gap-3 px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl shadow-inner transition-colors focus-within:border-emerald-300">
                <Calendar size={18} className="text-emerald-600" />
                <input type="month" value={periode} onChange={(e) => setPeriode(e.target.value)} className="bg-transparent font-black text-xs md:text-sm text-slate-700 outline-none w-full cursor-pointer" />
             </div>
             <div className="flex-1 flex items-center gap-3 px-5 py-4 bg-emerald-50 border border-emerald-100 rounded-2xl shadow-inner transition-colors hover:bg-emerald-100">
                <Filter size={18} className="text-emerald-600" />
                <div className="relative w-full">
                  <select value={unit} onChange={(e) => setUnit(e.target.value)} className="bg-transparent font-black text-xs md:text-sm text-emerald-700 outline-none w-full appearance-none cursor-pointer pr-6">
                    <option value="ALL">All Medical Units</option>
                    <option value="UGD">UGD / Emergency</option>
                    <option value="ICU">Intensive Care Unit</option>
                    <option value="RADIOLOGI">Radiology Dept</option>
                  </select>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-600">
                      <svg width="10" height="6" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L7 8L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                  </div>
                </div>
             </div>
          </div>
        </div>

        {/* CONTENT AREA */}
        <AnimatePresence mode="wait">
          
          {/* 1. DASHBOARD KPI (REAL-TIME DATA) */}
          {activeTab === 'dashboard' && (
            <motion.div key="dash" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Pasien', value: stats.totalPasien, icon: <Users size={24} />, bg: 'bg-blue-50', color: 'text-blue-600', border: 'border-blue-100' },
                  { label: 'Avg. Waiting Time', value: stats.avgTunggu, icon: <Clock size={24} />, bg: 'bg-amber-50', color: 'text-amber-600', border: 'border-amber-100' },
                  { label: 'Bed Occupancy', value: stats.utilBed, icon: <Activity size={24} />, bg: 'bg-emerald-50', color: 'text-emerald-600', border: 'border-emerald-100' },
                  { label: 'Total Layanan', value: stats.totalLayanan, icon: <RefreshCcw size={24} />, bg: 'bg-teal-50', color: 'text-teal-600', border: 'border-teal-100' },
                ].map((s, i) => (
                  <div key={i} className={`bg-white p-6 md:p-8 rounded-[2rem] border ${s.border} shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group`}>
                    {loadingData && <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 flex items-center justify-center"><Loader2 className="animate-spin text-slate-400" /></div>}
                    <div className={`w-14 h-14 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform`}>{s.icon}</div>
                    <div className="text-3xl md:text-4xl font-black tracking-tighter mb-1 text-slate-800">{s.value}</div>
                    <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                <div className="lg:col-span-2 bg-white p-8 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm h-80 md:h-96 flex flex-col items-center justify-center relative overflow-hidden group">
                    <BarChart3 size={64} className="text-slate-100 mb-4 group-hover:scale-110 transition-transform duration-500" />
                    <p className="text-[9px] md:text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] text-center px-4">Real-time Performance Metrics</p>
                    
                    {/* Simulated Animated Chart */}
                    <div className="absolute bottom-6 md:bottom-10 left-6 md:left-10 right-6 md:right-10 flex justify-between items-end h-32 md:h-48 opacity-30">
                       {[1,2,3,4,5,6,7,8,9,10].map(i => (
                         <motion.div 
                           key={i} 
                           initial={{ height: '10%' }}
                           animate={{ height: `${Math.random() * 80 + 20}%` }}
                           transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: i * 0.1 }}
                           className="w-[6%] bg-gradient-to-t from-emerald-100 to-emerald-300 rounded-t-lg" 
                         />
                       ))}
                    </div>
                </div>
                
                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-8 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[320px] md:min-h-0 border-[6px] border-white group">
                   <div className="absolute -top-10 -right-10 w-40 h-40 bg-teal-400/30 rounded-full blur-3xl pointer-events-none group-hover:bg-teal-400/50 transition-all duration-700" />
                   <Sparkles className="absolute -bottom-10 -right-5 text-white/10 group-hover:rotate-12 transition-transform duration-700" size={150} />
                   
                   <div className="relative z-10">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-6 shadow-inner border border-white/30">
                      <BrainCircuit size={24} className="text-white" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black italic uppercase leading-tight mb-4 tracking-tight drop-shadow-md">Strategic<br/>Insight</h3>
                    <p className="text-xs md:text-sm text-emerald-50 font-medium leading-relaxed max-w-[90%]">
                      AI mendeteksi optimasi alur kerja sebesar 14.2% pada unit {unit === 'ALL' ? 'keseluruhan' : unit} dalam 24 jam terakhir.
                    </p>
                   </div>
                   
                   <button onClick={() => setActiveTab('analisis')} className="w-full relative z-10 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest bg-white text-emerald-700 py-4 md:py-5 rounded-2xl shadow-xl active:scale-95 transition-all hover:bg-slate-50 mt-6">
                     Analyze Data <ArrowRight size={16}/>
                   </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* 2. ANALISIS LAYANAN (LLM INSIGHT) */}
          {activeTab === 'analisis' && (
            <motion.div key="analisis" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
              <div className="lg:col-span-8 bg-white p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-200 shadow-xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-8 md:mb-10">
                  <div className="p-4 md:p-5 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl shadow-xl shadow-emerald-200 shrink-0 self-start sm:self-auto border border-emerald-400">
                    <MessageSquare size={28} className="md:w-8 md:h-8" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Operational Intelligence</h2>
                    <p className="text-emerald-600 font-bold text-[9px] md:text-xs uppercase tracking-[0.2em] mt-2">LLM-Powered Resource Advisory</p>
                  </div>
                </div>
                
                <div className="relative">
                  <textarea 
                    className="w-full h-[350px] md:h-[450px] bg-slate-50 border-2 border-slate-100 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 font-medium text-slate-700 resize-none outline-none focus:border-emerald-500 transition-all shadow-inner leading-relaxed text-sm md:text-lg scrollbar-hide"
                    value={insightAI} readOnly placeholder="Silakan klik 'Run AI Insight' untuk memulai analisis data operasional..."
                  />
                  
                  <AnimatePresence>
                    {loadingAI && (
                       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-white/90 backdrop-blur-md z-20 flex flex-col items-center justify-center rounded-[2rem] md:rounded-[2.5rem] border border-emerald-100">
                         <div className="relative mb-6">
                           <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute inset-0 bg-emerald-400 rounded-full blur-[20px]" />
                           <Loader2 className="animate-spin text-emerald-600 relative z-10" size={60} strokeWidth={1.5} />
                           <BrainCircuit className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-400 z-10" size={24} />
                         </div>
                         <h4 className="text-xl md:text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Synthesizing Data</h4>
                         <p className="text-[9px] md:text-[10px] font-bold text-emerald-600 tracking-[0.3em] uppercase animate-pulse mt-2 text-center px-6">Processing operational indicators...</p>
                       </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              
              <div className="lg:col-span-4 space-y-6">
                <button onClick={runDeepAnalysis} disabled={loadingAI} className="w-full py-6 md:py-8 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-[2rem] md:rounded-[2.5rem] font-black uppercase text-[10px] md:text-xs tracking-[0.2em] shadow-xl shadow-emerald-500/30 active:scale-95 flex items-center justify-center gap-3 transition-all disabled:opacity-70 disabled:cursor-not-allowed border border-emerald-500 group">
                  <BrainCircuit size={20} className="group-hover:rotate-12 transition-transform" /> {loadingAI ? 'Analyzing...' : 'Run AI Insight'}
                </button>
                <div className="p-6 md:p-8 bg-emerald-50 rounded-[2rem] md:rounded-[2.5rem] border border-emerald-100 space-y-4 shadow-sm text-left">
                   <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2"><PieChart size={16}/> Advisor Note</p>
                   <p className="text-[10px] md:text-xs font-bold text-emerald-800 leading-relaxed uppercase">Pertanyaan analisis Anda akan diolah bersama data tren kunjungan pasien mingguan untuk memberikan rekomendasi operasional yang presisi.</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* 3. EXECUTIVE SUMMARY (DRAFTING) */}
          {activeTab === 'ringkasan' && (
            <motion.div key="ringkas" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto bg-white p-6 md:p-16 lg:p-20 rounded-[2.5rem] md:rounded-[4rem] border border-slate-200 shadow-2xl space-y-8 md:space-y-12">
               <div className="text-center space-y-4">
                 <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-50 text-emerald-600 rounded-[1.5rem] flex items-center justify-center mx-auto shadow-inner border border-emerald-100"><FileText size={32} className="md:w-10 md:h-10" /></div>
                 <h2 className="text-3xl md:text-4xl lg:text-5xl font-black italic tracking-tighter uppercase text-slate-900">Executive Summary</h2>
                 <p className="text-slate-400 font-bold text-[9px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em]">Corporate Performance Reporting</p>
               </div>
               
               <div className="relative">
                 <textarea 
                   value={executiveSummary} onChange={(e) => setExecutiveSummary(e.target.value)}
                   className="w-full h-[300px] md:h-[400px] bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 font-bold text-slate-700 outline-none leading-relaxed text-base md:text-xl shadow-inner focus:border-emerald-400 focus:bg-white transition-all scrollbar-hide"
                   placeholder="Menunggu proses generate laporan otomatis..."
                 />
                 {loadingAI && (
                   <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] flex items-center justify-center rounded-[2rem] md:rounded-[3rem]">
                     <Loader2 className="animate-spin text-emerald-500" size={40} strokeWidth={2}/>
                   </div>
                 )}
               </div>

               <div className="flex flex-col sm:flex-row gap-4">
                 <button onClick={generateSummary} disabled={loadingAI} className="flex-1 py-5 md:py-7 bg-white border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 rounded-[1.5rem] md:rounded-2xl font-black uppercase text-[10px] md:text-xs tracking-widest flex items-center justify-center gap-2 md:gap-3 transition-all active:scale-95 disabled:opacity-50">
                   {loadingAI ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />} Generate Draft Report
                 </button>
                 <button onClick={() => setActiveTab('validasi')} className="px-8 md:px-12 py-5 md:py-7 bg-slate-900 text-white rounded-[1.5rem] md:rounded-2xl font-black uppercase text-[10px] md:text-xs tracking-widest active:scale-95 transition-all shadow-xl hover:bg-emerald-600 flex items-center justify-center gap-2">
                   Next: Final Approval <ArrowRight size={16} />
                 </button>
               </div>
            </motion.div>
          )}

          {/* 4. VALIDASI LAPORAN (APPROVE) */}
          {activeTab === 'validasi' && (
            <motion.div key="valid" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-8">
               <div className="bg-[#0f172a] p-8 md:p-12 lg:p-16 rounded-[3rem] md:rounded-[4rem] text-white shadow-2xl border-[6px] md:border-[8px] border-slate-800 text-left relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000"><ShieldCheck size={300} /></div>
                  <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-emerald-600/20 rounded-full blur-[80px] pointer-events-none" />

                  <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-10 md:mb-12 relative z-10">
                    <div className="p-5 md:p-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl md:rounded-3xl shadow-xl shadow-emerald-500/20 self-start sm:self-auto border border-emerald-400">
                      <ShieldCheck size={40} className="md:w-10 md:h-10" />
                    </div>
                    <div>
                      <h3 className="text-2xl md:text-3xl lg:text-4xl font-black italic tracking-tighter uppercase leading-none">Decision Validation</h3>
                      <p className="text-emerald-400 font-bold text-[9px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] mt-2 md:mt-3">Commit to Secure Repository</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6 md:space-y-8 relative z-10">
                    <div className="bg-white/5 p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-white/10 shadow-inner backdrop-blur-sm focus-within:border-emerald-500/50 transition-colors">
                      <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><Save size={14} className="text-emerald-500"/> Instruksi Direksi / Catatan Keputusan:</p>
                      <textarea 
                        value={catatanKeputusan} onChange={(e) => setCatatanKeputusan(e.target.value)}
                        className="w-full bg-transparent border-none outline-none font-bold text-slate-200 resize-none leading-relaxed h-24 md:h-32 text-base md:text-lg placeholder:text-slate-600 scrollbar-hide"
                        placeholder="Ketik instruksi strategis untuk didistribusikan ke unit terkait..."
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button onClick={handleFinalApprove} className="py-5 md:py-7 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[1.5rem] md:rounded-2xl font-black uppercase text-[10px] md:text-xs tracking-[0.2em] transition-all flex items-center justify-center gap-2 md:gap-3 shadow-xl shadow-emerald-900/40 active:scale-95 border border-emerald-400">
                        <CheckCircle2 size={20} className="md:w-5 md:h-5" /> Approve & Enkripsi
                      </button>
                      <button onClick={() => setActiveTab('ringkasan')} className="py-5 md:py-7 bg-white/5 hover:bg-rose-600 text-slate-400 hover:text-white border border-white/10 rounded-[1.5rem] md:rounded-2xl font-black uppercase text-[9px] md:text-[10px] tracking-widest transition-all flex items-center justify-center gap-2 md:gap-3 active:scale-95">
                        <XCircle size={18} className="md:w-5 md:h-5" /> Review & Edit
                      </button>
                    </div>
                  </div>
               </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* SUCCESS OVERLAY */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white p-10 md:p-16 rounded-[3rem] md:rounded-[4rem] text-center max-w-sm md:max-w-md w-full shadow-2xl border-[8px] md:border-[12px] border-emerald-50 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500" />
              <div className="w-20 h-20 md:w-24 md:h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-inner border-4 border-white">
                <CheckCircle2 size={40} className="md:w-12 md:h-12" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter mb-2 text-slate-900 leading-tight">Report Finalized</h2>
              <p className="text-slate-500 font-bold text-[9px] md:text-xs uppercase tracking-[0.2em] md:tracking-widest mb-8 md:mb-10 px-4">Secured in Database Vault</p>
              <Loader2 className="animate-spin text-emerald-300 mx-auto" size={24} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}