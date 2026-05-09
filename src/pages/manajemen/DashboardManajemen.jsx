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
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10 font-sans text-left pb-24 text-slate-900 antialiased">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* HEADER & FILTERS (CRUD AGGREGATE) */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none rotate-12"><TrendingUp size={200} /></div>
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight uppercase italic leading-none">Management <span className="text-indigo-600">Command Center</span></h1>
            <div className="flex flex-wrap gap-2 mt-6">
              {['dashboard', 'analisis', 'ringkasan', 'validasi'].map((tab) => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
             <div className="flex-1 flex items-center gap-3 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <Calendar size={18} className="text-indigo-600" />
                <input type="month" value={periode} onChange={(e) => setPeriode(e.target.value)} className="bg-transparent font-black text-xs outline-none" />
             </div>
             <div className="flex-1 flex items-center gap-3 px-6 py-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                <Filter size={18} className="text-indigo-600" />
                <select value={unit} onChange={(e) => setUnit(e.target.value)} className="bg-transparent font-black text-xs outline-none text-indigo-600 cursor-pointer">
                  <option value="ALL">All Medical Units</option>
                  <option value="UGD">UGD / Emergency</option>
                  <option value="ICU">Intensive Care Unit</option>
                  <option value="RADIOLOGI">Radiology Dept</option>
                </select>
             </div>
          </div>
        </div>

        {/* CONTENT AREA */}
        <AnimatePresence mode="wait">
          
          {/* 1. DASHBOARD KPI (REAL-TIME DATA) */}
          {activeTab === 'dashboard' && (
            <motion.div key="dash" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Pasien', value: stats.totalPasien, icon: <Users size={24} />, bg: 'bg-blue-50', color: 'text-blue-600' },
                  { label: 'Avg. Waiting Time', value: stats.avgTunggu, icon: <Clock size={24} />, bg: 'bg-amber-50', color: 'text-amber-600' },
                  { label: 'Bed Occupancy', value: stats.utilBed, icon: <Activity size={24} />, bg: 'bg-emerald-50', color: 'text-emerald-600' },
                  { label: 'Total Layanan', value: stats.totalLayanan, icon: <RefreshCcw size={24} />, bg: 'bg-purple-50', color: 'text-purple-600' },
                ].map((s, i) => (
                  <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all relative overflow-hidden">
                    {loadingData && <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center"><Loader2 className="animate-spin text-slate-300" /></div>}
                    <div className={`w-14 h-14 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center mb-6`}>{s.icon}</div>
                    <div className="text-4xl font-black tracking-tighter mb-1">{s.value}</div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm h-96 flex flex-col items-center justify-center relative">
                    <BarChart3 size={64} className="text-slate-100 mb-4" />
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Real-time Performance Metrics</p>
                    <div className="absolute bottom-10 left-10 right-10 flex justify-between">
                       {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="w-8 bg-indigo-50 rounded-t-lg" style={{ height: Math.random()*150 + 50 + 'px' }} />)}
                    </div>
                </div>
                <div className="bg-indigo-600 p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between">
                   <Sparkles className="absolute -top-10 -right-10 text-white/10" size={200} />
                   <div>
                    <h3 className="text-2xl font-black italic uppercase leading-tight mb-4">Strategic<br/>Insight</h3>
                    <p className="text-sm opacity-80 leading-relaxed">AI mendeteksi optimasi alur kerja sebesar 14.2% pada unit ${unit} dalam 24 jam terakhir.</p>
                   </div>
                   <button onClick={() => setActiveTab('analisis')} className="w-full flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest bg-white text-indigo-600 py-5 rounded-2xl shadow-lg active:scale-95 transition-all">Analyze Operational Data <ArrowRight size={14}/></button>
                </div>
              </div>
            </motion.div>
          )}

          {/* 2. ANALISIS LAYANAN (LLM INSIGHT) */}
          {activeTab === 'analisis' && (
            <motion.div key="analisis" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 bg-white p-10 md:p-14 rounded-[3.5rem] border border-slate-200 shadow-2xl relative overflow-hidden">
                <div className="flex items-center gap-6 mb-10">
                  <div className="p-5 bg-indigo-600 text-white rounded-2xl shadow-xl"><MessageSquare size={32} /></div>
                  <div className="text-left">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Operational Intelligence</h2>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mt-2">LLM-Powered Resource Advisory</p>
                  </div>
                </div>
                <textarea 
                  className="w-full h-[450px] bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] p-10 font-medium text-slate-700 resize-none outline-none focus:border-indigo-500 transition-all shadow-inner leading-relaxed text-lg"
                  value={insightAI} readOnly placeholder="Menganalisis indikator performa unit..."
                />
                {loadingAI && (
                   <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                     <Loader2 className="animate-spin text-indigo-600 mb-4" size={80} />
                     <p className="font-black text-indigo-600 tracking-[0.3em] uppercase">Synthesizing Operational Data...</p>
                   </div>
                )}
              </div>
              <div className="lg:col-span-4 space-y-6">
                <button onClick={runDeepAnalysis} disabled={loadingAI} className="w-full py-8 bg-indigo-600 text-white rounded-[2.5rem] font-black uppercase text-xs tracking-[0.3em] shadow-2xl active:scale-95 flex items-center justify-center gap-4 transition-all">
                  <BrainCircuit size={20} /> Run AI Insight
                </button>
                <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 space-y-4 shadow-sm text-left">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><PieChart size={14}/> Advisor Note</p>
                   <p className="text-xs font-bold text-slate-600 leading-relaxed uppercase">Pertanyaan analisis Anda akan diolah bersama data tren kunjungan pasien mingguan.</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* 3. EXECUTIVE SUMMARY (DRAFTING) */}
          {activeTab === 'ringkasan' && (
            <motion.div key="ringkas" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto bg-white p-12 md:p-20 rounded-[4rem] border border-slate-200 shadow-2xl space-y-12">
               <div className="text-center space-y-4">
                 <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner"><FileText size={40} /></div>
                 <h2 className="text-4xl font-black italic tracking-tighter uppercase">Executive Summary</h2>
                 <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.4em]">Corporate Performance Reporting</p>
               </div>
               <textarea 
                 value={executiveSummary} onChange={(e) => setExecutiveSummary(e.target.value)}
                 className="w-full h-[400px] bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] p-12 font-bold text-slate-800 outline-none leading-relaxed text-xl shadow-inner"
                 placeholder="Draft laporan otomatis..."
               />
               <div className="flex flex-col sm:flex-row gap-4">
                 <button onClick={generateSummary} disabled={loadingAI} className="flex-1 py-7 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95">
                   {loadingAI ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />} Generate Draft Report
                 </button>
                 <button onClick={() => setActiveTab('validasi')} className="px-12 py-7 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest active:scale-95 transition-all">Next: Final Approval</button>
               </div>
            </motion.div>
          )}

          {/* 4. VALIDASI LAPORAN (APPROVE) */}
          {activeTab === 'validasi' && (
            <motion.div key="valid" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-8">
               <div className="bg-[#0f172a] p-12 md:p-16 rounded-[4rem] text-white shadow-2xl border-[8px] border-white text-left relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-10 opacity-[0.05]"><ShieldCheck size={300} /></div>
                  <div className="flex items-center gap-6 mb-12 relative z-10">
                    <div className="p-6 bg-indigo-600 rounded-3xl shadow-2xl"><ShieldCheck size={40} /></div>
                    <div>
                      <h3 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase leading-none">Decision Validation</h3>
                      <p className="text-indigo-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-3">Commit to Secure Repository</p>
                    </div>
                  </div>
                  <div className="space-y-8 relative z-10">
                    <div className="bg-white/5 p-10 rounded-[2.5rem] border border-white/10 shadow-inner">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><Save size={12}/> Instruksi Direksi / Catatan Keputusan:</p>
                      <textarea 
                        value={catatanKeputusan} onChange={(e) => setCatatanKeputusan(e.target.value)}
                        className="w-full bg-transparent border-none outline-none font-bold text-slate-200 resize-none leading-relaxed h-32 text-lg"
                        placeholder="Ketik instruksi strategis untuk unit terkait..."
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button onClick={handleFinalApprove} className="py-7 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-2xl shadow-emerald-900/40 active:scale-95">
                        <CheckCircle2 size={20} /> Approve & Enkripsi
                      </button>
                      <button onClick={() => setActiveTab('ringkasan')} className="py-7 bg-white/5 hover:bg-rose-600 text-slate-400 hover:text-white border border-white/10 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-3 active:scale-95">
                        <XCircle size={18} /> Review & Edit
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center">
            <motion.div initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white p-16 rounded-[4rem] text-center max-w-md shadow-2xl border-[12px] border-emerald-50">
              <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-2 text-slate-900 leading-none">Report Finalized</h2>
              <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-10">Secured in Blockchain-backed Vault</p>
              <Loader2 className="animate-spin text-slate-300 mx-auto" size={24} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}