import React, { useState, useEffect, useCallback } from 'react';
import { 
  TrendingUp, Users, Clock, Activity, 
  BrainCircuit, Loader2, Save, FileText, 
  CheckCircle2, AlertTriangle, Send, Database 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardManajemen() {
  const [stats, setStats] = useState({ totalPasien: 0, avgTunggu: '0m', utilBed: '0%', totalLayanan: 0 });
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk AI Executive Summary
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiOutput, setAiOutput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const API_URL = "http://localhost:8000/api";
  const token = localStorage.getItem('access_token');

  // --- 1. FETCH DATA DASHBOARD AGREGAT ---
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/manajemen/dashboard`, {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      if (!response.ok) throw new Error("Gagal memuat data");
      
      const data = await response.json();
      setStats(data.stats);
      setReports(data.reports);
    } catch (err) {
      console.warn("Backend offline. Menggunakan data mockup Direktur.");
      // Fallback Mockup Data
      setStats({ totalPasien: 1245, avgTunggu: '45m', utilBed: '82%', totalLayanan: 3420 });
      setReports([
        { id: 1, date: '2026-05-01', title: 'Evaluasi Waktu Tunggu Radiologi', status: 'Final' },
        { id: 2, date: '2026-05-05', title: 'Ringkasan Utilisasi Bed IGD', status: 'Final' }
      ]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  // --- 2. GENERATE INSIGHT AI (LLM) ---
  const handleGenerateInsight = async (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    try {
      // Simulasi fetch ke RAG/LLM Service Laravel
      // const response = await fetch(`${API_URL}/manajemen/generate-insight`, { ... })
      setTimeout(() => {
        setAiOutput(`RINGKASAN EKSEKUTIF\nTopik: ${aiPrompt}\n\nANALISIS OPERASIONAL:\nBerdasarkan agregasi data minggu ini, terjadi peningkatan waktu tunggu di unit Radiologi sebesar 15%. Hal ini berkorelasi dengan tingginya rujukan dari IGD pada shift malam dan keterbatasan radiografer on-duty.\n\nREKOMENDASI STRATEGIS:\n1. Menambah 1 personel radiografer pada shift malam (20:00 - 08:00).\n2. Mengoptimalkan alur prioritas untuk pasien non-cito agar terdistribusi ke shift pagi.\n\nData Pendukung: Rata-rata utilisasi alat CT-Scan mencapai 92% pada jam sibuk.`);
        setIsGenerating(false);
      }, 3000);
    } catch (err) {
      alert("Gagal menghubungi AI Engine.");
      setIsGenerating(false);
    }
  };

  // --- 3. SIMPAN LAPORAN FINAL (Human-in-the-Loop) ---
  const handleSaveReport = async () => {
    setIsSaving(true);
    try {
      // Simulasi POST ke Laravel
      // const response = await fetch(`${API_URL}/manajemen/reports`, { ... })
      setTimeout(() => {
        alert("Ringkasan Eksekutif Terverifikasi dan Disimpan!");
        setAiOutput("");
        setAiPrompt("");
        fetchDashboardData(); // Refresh list laporan
        setIsSaving(false);
      }, 1500);
    } catch (err) {
      alert("Gagal menyimpan laporan.");
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-left pb-20">
      
      {/* Header Eksekutif */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tight italic uppercase">
            <TrendingUp size={32} className="text-emerald-600" /> Executive Dashboard
          </h1>
          <p className="text-slate-500 font-medium">Analisis performa rumah sakit & ringkasan manajerial berbasis AI.</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg">
           <Database size={16} className="text-emerald-400" /> Aggregate Data Connected
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: 'Total Pasien Bulan Ini', val: stats.totalPasien, icon: <Users size={24}/>, color: 'blue' },
          { title: 'Rata-rata Waktu Tunggu', val: stats.avgTunggu, icon: <Clock size={24}/>, color: 'amber' },
          { title: 'Utilisasi Tempat Tidur (BOR)', val: stats.utilBed, icon: <Activity size={24}/>, color: 'emerald' },
          { title: 'Total Tindakan Layanan', val: stats.totalLayanan, icon: <FileText size={24}/>, color: 'indigo' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-4 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className={`absolute -right-4 -top-4 opacity-5 text-${s.color}-600 group-hover:scale-110 transition-transform`}>
              {React.cloneElement(s.icon, { size: 100 })}
            </div>
            <div className={`w-12 h-12 rounded-xl bg-${s.color}-50 text-${s.color}-600 flex items-center justify-center`}>
              {s.icon}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.title}</p>
              <p className="text-3xl font-black text-slate-800 mt-1">{s.val}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Sisi Kiri: AI Insight Generator */}
        <div className="xl:col-span-8 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-200">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 mb-6">
              <BrainCircuit className="text-blue-600" /> Tanya AI Assistant
            </h2>
            
            <form onSubmit={handleGenerateInsight} className="relative mb-6">
              <input 
                type="text" 
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Contoh: Mengapa waktu tunggu radiologi meningkat minggu ini?" 
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-5 pl-6 pr-16 outline-none focus:border-blue-500 font-bold text-slate-700 transition-all"
                disabled={isGenerating}
              />
              <button 
                type="submit" 
                disabled={isGenerating || !aiPrompt.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl flex items-center justify-center transition-all"
              >
                {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} className="ml-1" />}
              </button>
            </form>

            <AnimatePresence>
              {aiOutput && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden">
                  <div className="flex justify-between items-center mt-4">
                    <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                      <CheckCircle2 size={14} /> Draft Insight Operasional
                    </h3>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-3 py-1 rounded-full font-bold">Editable Draft</span>
                  </div>

                  <textarea 
                    className="w-full min-h-[250px] p-6 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none font-medium text-slate-800 leading-relaxed resize-y"
                    value={aiOutput}
                    onChange={(e) => setAiOutput(e.target.value)}
                  />

                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-3">
                    <AlertTriangle className="text-amber-500 shrink-0" size={18} />
                    <p className="text-xs text-amber-800 font-medium leading-relaxed">
                      <b>Validasi Direksi:</b> Laporan ini disusun oleh AI berdasarkan data agregat. Anda dapat mengedit sebelum menyimpannya sebagai laporan final manajemen.
                    </p>
                  </div>

                  <button 
                    onClick={handleSaveReport}
                    disabled={isSaving}
                    className="w-full py-5 bg-slate-900 hover:bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl"
                  >
                    {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
                    Approve & Simpan Laporan
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sisi Kanan: Daftar Laporan Final */}
        <div className="xl:col-span-4">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden h-full">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-black text-slate-800">Laporan Tervalidasi</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Arsip Manajemen</p>
            </div>
            <div className="p-4 space-y-3">
              {loading ? (
                <div className="py-10 text-center"><Loader2 className="animate-spin text-blue-500 mx-auto" /></div>
              ) : reports.length === 0 ? (
                <div className="py-10 text-center text-sm font-bold text-slate-400">Belum ada laporan final.</div>
              ) : (
                reports.map((rep) => (
                  <div key={rep.id} className="p-4 rounded-2xl border border-slate-100 hover:border-blue-300 hover:shadow-md cursor-pointer transition-all bg-white group">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black text-slate-400 font-mono">{rep.date}</span>
                      <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest">
                        {rep.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors line-clamp-2">
                      {rep.title}
                    </h4>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}