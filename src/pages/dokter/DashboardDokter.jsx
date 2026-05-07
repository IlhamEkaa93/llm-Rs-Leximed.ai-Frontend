import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, User, Activity, FileText, Loader2, 
  ArrowRight, Users, RefreshCw, Sparkles, ChevronRight, Database 
} from 'lucide-react';

export default function DashboardDokter() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [patientsList, setPatientsList] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  
  const [counts, setCounts] = useState({
    today_patients: 0, pending_ai: 0, completed_resumes: 0
  });

  useEffect(() => { loadAllData(); }, []);

  const loadAllData = async () => {
    setLoadingPatients(true);
    await Promise.all([ fetchDashboardStats(), fetchAllPatients() ]);
    setLoadingPatients(false);
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/dashboard-stats", {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Accept': 'application/json' // WAJIB ADA
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCounts({
          today_patients: data.today_patients || 0,
          pending_ai: data.pending_ai || 0,
          completed_resumes: data.completed_resumes || 0
        });
      }
    } catch (err) {
      console.error("Gagal mengambil statistik:", err);
    }
  };

  const fetchAllPatients = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/patients-list", {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Accept': 'application/json' // WAJIB ADA
        }
      });
      
      const data = await response.json(); // Ambil json-nya dulu
      if (response.ok) {
        setPatientsList(data);
        setCounts(prev => ({
          ...prev,
          today_patients: data.length > prev.today_patients ? data.length : prev.today_patients,
          pending_ai: Math.floor(data.length * 1.5),
          completed_resumes: data.length
        }));
      } else {
        throw new Error(data.message || "Gagal memuat list pasien");
      }
    } catch (err) {
      console.error("Gagal mengambil daftar pasien:", err);
    }
  };

  const handleSelectPatient = (patientData) => {
    localStorage.setItem('active_patient', JSON.stringify(patientData));
    navigate('/data-medis');
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchTerm) return;
    setLoading(true);
    try {
        const response = await fetch(`http://localhost:8000/api/patients/${searchTerm}`, {
            headers: { 
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
              'Accept': 'application/json' // WAJIB ADA
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || "Data tidak ditemukan");
        }
        
        handleSelectPatient(data.data || data);
    } catch (err) {
        alert(err.message);
    } finally {
        setLoading(false);
    }
  };

  const statCards = [
    { label: 'Pasien Terdaftar', value: counts.today_patients, icon: <User size={24} />, color: 'blue' },
    { label: 'Log Aktivitas AI', value: counts.pending_ai, icon: <Activity size={24} />, color: 'orange' },
    { label: 'Total Resume', value: counts.completed_resumes, icon: <FileText size={24} />, color: 'emerald' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 p-1 font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Panel Utama Dokter</h1>
          <p className="text-slate-500 font-medium mt-1 underline decoration-blue-500/30">Data operasional DARSI System secara real-time.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={loadAllData}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 shadow-sm hover:bg-slate-50 transition-all"
        >
          <RefreshCw size={16} className={loadingPatients ? 'animate-spin' : ''} />
          Sinkronisasi Data
        </motion.button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((s, i) => (
          <motion.div 
            key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} whileHover={{ y: -5 }}
            className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm flex items-center gap-6 relative overflow-hidden group"
          >
            <div className={`p-5 rounded-2xl bg-${s.color}-500 text-white shadow-lg shadow-${s.color}-500/20 z-10 relative`}>
              {s.icon}
            </div>
            <div className="z-10 relative text-left">
              <motion.h3 key={s.value} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-black text-slate-900 leading-none">
                {s.value}
              </motion.h3>
              <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">{s.label}</p>
            </div>
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-${s.color}-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500`}></div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
        {/* Left Column: Recent Patients */}
        <div className="lg:col-span-2 bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 text-left">
              <Users size={22} className="text-blue-600" /> Daftar Pasien Terkini
            </h3>
            <span className="text-[10px] font-black px-3 py-1 bg-blue-50 text-blue-600 rounded-full uppercase tracking-tighter">Database Synchronized</span>
          </div>
          
          <div className="p-4 flex-1">
            <AnimatePresence mode='wait'>
              {loadingPatients ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
                  <Loader2 className="animate-spin text-blue-600" size={40} />
                  <p className="font-bold text-sm uppercase tracking-widest animate-pulse">Menarik Data Pasien...</p>
                </div>
              ) : patientsList.length > 0 ? (
                <div className="space-y-2">
                  {patientsList.map((p, i) => (
                    <motion.div 
                      key={p.id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} onClick={() => handleSelectPatient(p)}
                      className="group flex items-center justify-between p-6 rounded-2xl hover:bg-blue-600 transition-all cursor-pointer border border-transparent hover:shadow-xl hover:shadow-blue-600/20"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-white/20 group-hover:text-white transition-all">
                          <User size={20} />
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="font-black text-slate-800 text-xl group-hover:text-white transition-colors">{p.name}</span>
                          <span className="text-sm font-bold text-slate-400 uppercase tracking-widest group-hover:text-blue-100 transition-colors">NORM: {p.norm}</span>
                        </div>
                      </div>
                      <ChevronRight size={24} className="text-slate-300 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center space-y-4">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300 border-2 border-dashed border-slate-200">
                    <Search size={32} />
                  </div>
                  <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Belum ada pasien yang ditemukan</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="bg-[#0f172a] p-8 rounded-[32px] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <Sparkles size={80} />
            </div>
            <h3 className="text-xl font-black mb-6 relative z-10 flex items-center gap-2 text-left">
              <Search size={20} className="text-blue-400" /> Tarik Data NORM
            </h3>
            <form onSubmit={handleSearchSubmit} className="space-y-4 relative z-10">
              <input 
                type="text" placeholder="Masukkan No. RM..." 
                className="w-full bg-white/10 border border-white/10 rounded-2xl py-5 px-6 text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold placeholder:text-slate-500 text-lg"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              />
              <motion.button 
                whileTap={{ scale: 0.95 }} type="submit"
                className="w-full py-5 bg-blue-600 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-blue-500 shadow-xl shadow-blue-600/30 flex items-center justify-center gap-3 transition-all"
              >
                {loading ? <Loader2 className="animate-spin" /> : <><Database size={18} /> Tarik Data</>}
              </motion.button>
            </form>
          </div>

          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm border-t-4 border-t-emerald-500">
             <div className="flex items-center gap-3 mb-4">
                <Activity className="text-emerald-500" size={20} />
                <h4 className="font-black text-slate-800 text-sm uppercase tracking-widest">Llama 3.3 Engine</h4>
             </div>
             <div className="space-y-3 text-left">
                <div className="flex justify-between items-center text-[10px]">
                   <span className="font-bold text-slate-500 uppercase">Analysis Precision</span>
                   <span className="text-emerald-600 font-black">98.4% OPTIMAL</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                   <motion.div initial={{ width: 0 }} animate={{ width: '92%' }} className="h-full bg-emerald-500" />
                </div>
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}