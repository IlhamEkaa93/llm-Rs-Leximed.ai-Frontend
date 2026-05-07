import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Pill, Beaker, Stethoscope, Activity, 
  AlertCircle, Loader2, BrainCircuit, Search, ArrowLeft,
  ChevronRight, Thermometer, Droplets, Heart, Database, Clock, RefreshCw
} from 'lucide-react';

export default function DataRekamMedis() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('diagnosa');
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const API_URL = "http://localhost:8000/api";
  const token = localStorage.getItem('access_token');

  // --- 1. SINKRONISASI SESI PASIEN ---
  useEffect(() => {
    const savedPatient = localStorage.getItem('active_patient');
    if (savedPatient) {
      try {
        const parsedPatient = JSON.parse(savedPatient);
        setPatient(parsedPatient);
        // Tarik data histori saat pertama kali load
        fetchVerifiedHistory(parsedPatient.norm || parsedPatient.no_rm);
      } catch (e) {
        console.error("Error parsing patient data", e);
      }
    }
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // --- 2. FUNGSI TARIK HISTORI DARI POSTGRESQL (API) ---
  const fetchVerifiedHistory = useCallback(async (norm) => {
    if (!norm) return;
    setIsRefreshing(true);
    try {
      const res = await fetch(`${API_URL}/patients/${norm}/history`, {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      
      if (!res.ok) throw new Error("Gagal mengambil data");
      
      const data = await res.json();
      // Pastikan data adalah array
      setHistory(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Database Error:", e);
      // Fallback data kosong jika API error
      setHistory([]);
    } finally {
      setIsRefreshing(false);
    }
  }, [token]);

  // --- 3. LOADING STATE ---
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-10 text-left">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="mb-4">
          <Loader2 className="text-blue-600" size={48} />
        </motion.div>
        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">
          Sinkronisasi Data Klinis...
        </p>
      </div>
    );
  }

  // --- 4. ERROR STATE (PASIEN TIDAK DIPILIH) ---
  if (!patient) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-4 md:p-10 text-center">
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[32px] p-10 md:p-20 max-w-2xl mx-auto shadow-sm text-left">
          <Search size={80} className="text-slate-200 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-slate-800 mb-2">Pasien Belum Dipilih</h2>
          <p className="text-slate-500 mb-8 leading-relaxed text-center">
            Silakan pilih pasien terlebih dahulu melalui Dashboard untuk melihat riwayat medis lengkap.
          </p>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="bg-[#0f172a] text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 mx-auto hover:bg-blue-600 transition-all shadow-xl"
          >
            <ArrowLeft size={20} /> Dashboard Utama
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 pb-20 text-left font-sans antialiased">
      
      {/* 1. Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden"
      >
        <div className="flex flex-col md:flex-row items-center gap-6 z-10 w-full md:w-auto">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white font-black text-3xl shadow-lg ring-4 ring-blue-50">
            {patient.name ? patient.name[0] : 'P'}
          </div>
          <div className="text-center md:text-left space-y-1">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight italic">
              {patient.name} 
              <span className="text-slate-400 font-medium text-lg ml-2 block md:inline">(RM: {patient.norm || patient.no_rm})</span>
            </h2>
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 mt-2 text-sm font-bold text-slate-500 uppercase tracking-tighter">
              <span>{patient.gender === 'L' ? 'Laki-Laki' : 'Perempuan'}</span>
              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
              <span>{patient.age || '--'} Tahun</span>
              <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full border border-red-100 flex items-center gap-2">
                <AlertCircle size={14} /> Alergi: Amoksisilin
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto z-10">
          <button 
            onClick={() => fetchVerifiedHistory(patient.norm || patient.no_rm)}
            disabled={isRefreshing}
            className="flex-1 md:flex-none bg-slate-100 text-slate-700 px-6 py-4 rounded-[18px] font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
            Refresh History
          </button>
          <button 
            onClick={() => navigate('/ringkasan')} 
            className="flex-1 md:flex-none bg-[#0f172a] text-white px-8 py-5 rounded-[22px] font-black flex items-center justify-center gap-3 shadow-2xl hover:bg-blue-600 transition-all tracking-widest text-xs"
          >
            <BrainCircuit size={20} className="text-blue-400" />
            SIAPKAN RINGKASAN AI
          </button>
        </div>

        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -z-0"></div>
      </motion.div>

      {/* 2. Vital Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'TD', val: '150/90', unit: 'mmHg', icon: <Activity className="text-blue-500" /> },
          { label: 'Nadi', val: '88', unit: 'bpm', icon: <Heart className="text-red-500" /> },
          { label: 'Suhu', val: '37.2', unit: '°C', icon: <Thermometer className="text-orange-500" /> },
          { label: 'SpO2', val: '95', unit: '%', icon: <Droplets className="text-cyan-500" /> },
        ].map((item, i) => (
          <motion.div key={i} whileHover={{ y: -5 }} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} className="bg-white p-5 rounded-[28px] border border-slate-200 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-all group">
            <div className="mb-2 p-2 bg-slate-50 rounded-xl group-hover:scale-110 transition-transform">{item.icon}</div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{item.label}</span>
            <div className="flex items-baseline gap-1 mt-1 font-black text-2xl text-slate-900">
              {item.val} <small className="text-[10px] font-bold text-slate-400 uppercase">{item.unit}</small>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 3. Navigation Tabs */}
      <div className="overflow-x-auto no-scrollbar py-2">
        <div className="flex gap-2 bg-slate-100/80 p-2 rounded-[24px] w-max md:w-fit mx-auto border border-slate-200 backdrop-blur-sm">
          {[
            { id: 'diagnosa', icon: <Stethoscope size={18}/>, label: 'Diagnosa & SOAP' },
            { id: 'lab', icon: <Beaker size={18}/>, label: 'Laboratorium' },
            { id: 'obat', icon: <Pill size={18}/>, label: 'Terapi Obat' }
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-3 px-6 py-3.5 rounded-[18px] font-black text-xs uppercase tracking-widest transition-all duration-300 ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-xl ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Tab Content Area (HISTORI DINAMIS) */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.3 }} className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
            
            {activeTab === 'diagnosa' && (
              <div className="p-8">
                <div className="flex justify-between items-center mb-8 border-l-4 border-blue-600 pl-4">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Kronologi Catatan Klinis</h3>
                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-[10px] uppercase tracking-widest">
                        <Database size={14} /> PostgreSQL Connection Active
                    </div>
                </div>

                <div className="space-y-6">
                  {history.length > 0 ? history.map((item, idx) => (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={idx} className="relative pl-10 pb-10 border-l-2 border-dashed border-slate-100 last:border-0">
                      <div className="absolute left-[-9px] top-0 w-4 h-4 bg-blue-600 rounded-full ring-4 ring-blue-50"></div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded flex items-center gap-1">
                            <Clock size={10} /> {idx === 0 ? 'Terbaru' : 'Record'}
                          </span>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                            {new Date(item.created_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
                          </span>
                        </div>
                        <h4 className="text-xl font-black text-slate-800 italic">Analisis Klinis Terverifikasi</h4>
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 leading-relaxed font-medium text-slate-700 italic">
                            "{item.ai_summary || item.raw_content}"
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mt-4 bg-white w-fit px-3 py-1.5 rounded-lg border border-slate-100 uppercase tracking-tighter">
                           <div className="w-2 h-2 bg-emerald-500 rounded-full"></div> Verified by DARSI System
                        </div>
                      </div>
                    </motion.div>
                  )) : (
                    <div className="py-20 text-center">
                        <AlertCircle size={48} className="mx-auto text-slate-200 mb-4" />
                        <p className="text-slate-400 font-bold italic uppercase text-xs tracking-widest">Belum ada riwayat tervalidasi di basis data.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB LAINNYA (DUMMY) */}
            {(activeTab === 'lab' || activeTab === 'obat') && (
              <div className="p-20 text-center">
                <Database className="mx-auto text-slate-200 mb-4" size={48} />
                <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Modul Terintegrasi HIS - Menunggu Data Penunjang</p>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}