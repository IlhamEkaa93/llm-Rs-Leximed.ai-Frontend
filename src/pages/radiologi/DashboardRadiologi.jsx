import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScanLine, Activity, FilePlus, ChevronRight, Loader2, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardRadiologi() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ pending: 0, completed: 0, today: 0 });
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const API_URL = "http://localhost:8000/api";
  const token = localStorage.getItem('access_token');

  // --- 1. FETCH DATA DARI LARAVEL (POSTGRESQL) ---
  const fetchDashboardData = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    else setIsRefreshing(true);

    try {
      // Endpoint ini asumsikan mengembalikan { stats: {...}, queue: [...] }
      const response = await fetch(`${API_URL}/radiology/dashboard`, {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      
      if (!response.ok) throw new Error("Gagal mengambil data");
      
      const data = await response.json();
      setStats(data.stats || { pending: 0, completed: 0, today: 0 });
      setQueue(data.queue || []);
    } catch (err) {
      console.warn("Backend offline, memuat data mockup untuk UI.");
      // Fallback Mockup Data jika Laravel mati
      setStats({ pending: 8, completed: 24, today: 32 });
      setQueue([
        { id: 1, patient_id: 'RM-001', name: 'Tn. Budi Santoso', modality: 'X-Ray Thorax', raw_findings: 'Corak bronkovaskuler normal...', status: 'draft' },
        { id: 2, patient_id: 'RM-002', name: 'Ny. Siti Aminah', modality: 'CT-Scan Kepala', raw_findings: 'Tidak tampak infark/pendarahan...', status: 'draft' }
      ]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [token]);

  // --- 2. FITUR REAL-TIME (POLLING) ---
  useEffect(() => {
    fetchDashboardData(); // Load pertama kali

    // Polling setiap 5 detik untuk cek antrean baru
    const intervalId = setInterval(() => {
      fetchDashboardData(true);
    }, 5000);

    return () => clearInterval(intervalId); // Bersihkan interval saat pindah halaman
  }, [fetchDashboardData]);

  // --- 3. HANDLE KLIK ANTREAN ---
  const handleProcessItem = (item) => {
    // Simpan data antrean ke localStorage agar ditangkap oleh halaman AnalisisRadiologi
    const draftData = {
      id: item.id,
      norm: item.patient_id,
      name: item.name,
      modality: item.modality,
      findings: item.raw_findings
    };
    localStorage.setItem('radiology_draft', JSON.stringify(draftData));
    navigate('/radiologi/analisis');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-left pb-20">
      
      {/* Header */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        {/* Indikator Real-Time (Progress Bar Atas) */}
        {isRefreshing && (
          <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
            <motion.div 
              initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="h-full bg-indigo-500 w-1/3"
            />
          </div>
        )}

        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 italic uppercase tracking-tight">
            <ScanLine className="text-indigo-600" size={32} /> RADIOLOGI CENTER
          </h1>
          <p className="text-slate-500 font-medium mt-1">Sistem interpretasi citra dan penyusunan laporan berbasis AI.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">
             <Database size={14} /> {isRefreshing ? 'Syncing...' : 'Live'}
          </div>
          <button 
            onClick={() => navigate('/radiologi/input')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-3 shadow-lg shadow-indigo-200 transition-all active:scale-95"
          >
            <FilePlus size={20} /> Input Pemeriksaan
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { title: 'Total Pemeriksaan Hari Ini', val: stats.today, color: 'blue' },
          { title: 'Menunggu Validasi (Draft)', val: stats.pending, color: 'amber' },
          { title: 'Laporan Selesai', val: stats.completed, color: 'emerald' }
        ].map((s, i) => (
          <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{s.title}</p>
            <p className={`text-5xl font-black tracking-tighter text-${s.color}-600`}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Daftar Antrean */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-black text-slate-800 text-lg">Antrean Analisis AI (Terbaru)</h3>
          <span className="text-[10px] bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-black uppercase tracking-widest border border-indigo-100">
            {queue.length} Pasien
          </span>
        </div>
        
        <div className="p-6 space-y-4 bg-slate-50/30">
          <AnimatePresence>
            {loading ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-12 text-center">
                <Loader2 className="animate-spin text-indigo-500 mx-auto mb-4" size={32} />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Memuat Antrean Database...</p>
              </motion.div>
            ) : queue.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-12 text-center">
                <p className="text-sm font-bold text-slate-400">Tidak ada antrean draft saat ini.</p>
              </motion.div>
            ) : (
              queue.map((item) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                  key={item.id} 
                  onClick={() => handleProcessItem(item)} 
                  className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-white border border-slate-100 hover:border-indigo-300 hover:shadow-lg rounded-[2rem] cursor-pointer transition-all group gap-4"
                >
                  <div className="flex items-center gap-5">
                    <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
                      <Activity size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 text-lg tracking-tight">
                        {item.name || `Pasien (${item.patient_id})`} <span className="text-sm text-slate-400 font-mono font-bold ml-2">({item.patient_id})</span>
                      </h4>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
                        Modalitas: <span className="text-indigo-600">{item.modality}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 self-end md:self-auto">
                    <span className="bg-amber-100 text-amber-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                      Butuh Validasi
                    </span>
                    <div className="p-2 rounded-full bg-slate-50 group-hover:bg-indigo-50 transition-colors">
                       <ChevronRight className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}