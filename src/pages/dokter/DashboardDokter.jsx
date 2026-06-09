import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, User, Activity, FileText, Loader2, 
  Users, RefreshCw, Sparkles, ChevronRight, Database, Calendar
} from 'lucide-react';

// Gunakan port lokal dinamis agar terisolasi dari Vercel produksi
const API_URL = "https://lexi-med-ai-llm-rs-back-end.vercel.app/api";

export default function DashboardDokter() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [patientsList, setPatientsList] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  
  // Membaca data user login dengan proteksi fallback objek kosong
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'Dokter Lokal' };

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
      const response = await fetch(`${API_URL}/dashboard-stats`, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        const rawData = await response.json();
        const data = rawData.data || rawData; 
        setCounts(prev => ({
          ...prev,
          pending_ai: data.pending_ai || 0,
          completed_resumes: data.completed_resumes || 0
        }));
      }
    } catch (err) {
      console.error("Gagal mengambil statistik lokal:", err);
    }
  };

  const fetchAllPatients = async () => {
    try {
      const response = await fetch(`${API_URL}/patients-list`, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Accept': 'application/json'
        }
      });
      
      const rawData = await response.json();
      
      if (response.ok) {
        const patientsArray = Array.isArray(rawData) ? rawData : (rawData.data || []);
        
        const today = new Date().toLocaleDateString('id-ID', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });

        const myPatients = patientsArray.filter(p => {
            const isTodayStr = p.date === today;
            const isTodayIso = p.created_at && String(p.created_at).startsWith(new Date().toISOString().split('T')[0]);
            const isToday = isTodayStr || isTodayIso;
            
            return isToday && p.dpjp === user.name;
        });

        setPatientsList(myPatients);
        setCounts(prev => ({
          ...prev,
          today_patients: myPatients.length
        }));
      } else {
        if (response.status === 401) {
            alert("Sesi lokal habis atau database kosong, silakan login ulang.");
            localStorage.clear();
            navigate('/login');
        }
        throw new Error(rawData.message || "Gagal memuat list pasien");
      }
    } catch (err) {
      console.error("Gagal mengambil daftar pasien lokal:", err);
    }
  };

  const handleSelectPatient = (patientData) => {
    const rmIdentifier = patientData.norm || patientData.no_rm;
    const dataToSave = { ...patientData, norm: rmIdentifier };
    
    localStorage.setItem('active_patient', JSON.stringify(dataToSave));
    navigate('/data-medis');
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchTerm) return;
    setLoading(true);
    try {
        const response = await fetch(`${API_URL}/patients/${searchTerm}`, {
            headers: { 
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
              'Accept': 'application/json'
            }
        });
        
        const rawData = await response.json();
        
        if (!response.ok) throw new Error(rawData.message || "Pasien tidak ditemukan atau bukan wewenang Anda");
        
        const patient = rawData.data || rawData;
        if (patient.dpjp !== user.name) {
            alert("Akses Ditolak: Pasien ini terdaftar di bawah DPJP lain.");
            return;
        }

        handleSelectPatient(patient);
    } catch (err) {
        alert(err.message);
    } finally {
        setLoading(false);
    }
  };

  const statCards = [
    { label: 'Pasien Hari Ini', value: counts.today_patients, icon: <User size={24} />, bg: 'bg-blue-500', shadow: 'shadow-blue-500/40' },
    { label: 'Log Aktivitas AI', value: counts.pending_ai, icon: <Activity size={24} />, bg: 'bg-indigo-500', shadow: 'shadow-indigo-500/40' },
    { label: 'Resume Terverifikasi', value: counts.completed_resumes, icon: <FileText size={24} />, bg: 'bg-emerald-500', shadow: 'shadow-emerald-500/40' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 md:space-y-8 p-1 font-sans pb-24">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight uppercase">Dashboard Dokter</h1>
          <p className="text-slate-500 font-medium mt-1 text-sm md:text-base">
            Selamat bekerja, <strong className="text-blue-600">{user.name}</strong>. Memantau pasien hari ini.
          </p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={loadAllData}
          className="flex justify-center items-center gap-2 px-5 py-3 md:py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all"
        >
          <RefreshCw size={16} className={loadingPatients ? 'animate-spin text-blue-600' : ''} />
          Sinkronisasi Real-time
        </motion.button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {statCards.map((s, i) => (
          <motion.div 
            key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} whileHover={{ y: -5 }}
            className="bg-white p-6 md:p-8 rounded-[24px] border border-slate-200 shadow-sm flex items-center gap-5 relative overflow-hidden group cursor-default"
          >
            <div className={`p-4 rounded-2xl ${s.bg} text-white shadow-lg ${s.shadow} z-10`}>
              {s.icon}
            </div>
            <div className="z-10 text-left">
              <motion.h3 key={s.value} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-black text-slate-900 leading-none">
                {s.value}
              </motion.h3>
              <p className="text-[10px] md:text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
        <div className="lg:col-span-2 bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-3">
              <Calendar size={22} className="text-blue-600" /> Antrean Pasien Anda
            </h3>
            <span className="text-[10px] font-black px-4 py-2 bg-blue-100 text-blue-700 rounded-full uppercase tracking-widest">
                {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
            </span>
          </div>
          
          <div className="p-4 flex-1">
            <AnimatePresence mode='wait'>
              {loadingPatients ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
                  <Loader2 className="animate-spin text-blue-600" size={40} />
                  <p className="font-bold text-xs uppercase tracking-widest">Memvalidasi Otoritas Lokal...</p>
                </div>
              ) : patientsList.length > 0 ? (
                <div className="space-y-3">
                  {patientsList.map((p, i) => {
                    const rmNumber = p.norm || p.no_rm;
                    return (
                        <motion.div 
                          key={p.id || rmNumber || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} onClick={() => handleSelectPatient(p)}
                          className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-[20px] hover:bg-[#0f172a] transition-all cursor-pointer border border-slate-100 hover:border-[#0f172a] gap-4"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                              <User size={20} />
                            </div>
                            <div className="flex flex-col text-left">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-black text-slate-800 text-lg group-hover:text-white line-clamp-1">{p.name}</span>
                                <span className="text-[8px] font-black px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded uppercase">Ready</span>
                              </div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-400">
                                RM: {rmNumber} • {p.status || 'Rawat Jalan'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                             <div className="text-left sm:text-right">
                                <p className="text-[8px] font-black text-slate-400 uppercase">Jam Daftar</p>
                                <p className="text-xs font-bold text-slate-600 group-hover:text-white">
                                    {p.created_at ? new Date(p.created_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'}) + ' WIB' : '-'}
                                </p>
                             </div>
                             <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-slate-800 flex items-center justify-center">
                                <ChevronRight size={18} className="text-slate-400 group-hover:text-white group-hover:translate-x-0.5" />
                             </div>
                          </div>
                        </motion.div>
                    )
                  })}
                </div>
              ) : (
                <div className="py-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300 border-2 border-dashed border-slate-200">
                    <Users size={28} />
                  </div>
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Tidak ada antrean pasien lokal hari ini</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="bg-[#0f172a] p-6 rounded-[24px] text-white shadow-2xl relative overflow-hidden group">
            <h3 className="text-lg font-black mb-6 flex items-center gap-2 text-left">
              <Search size={20} className="text-emerald-400" /> Cari Pasien Spesifik
            </h3>
            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <input 
                type="text" placeholder="No. RM atau Nama..." 
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl py-4 px-5 text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold placeholder:text-slate-500 text-sm"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              />
              <motion.button 
                whileTap={{ scale: 0.95 }} type="submit"
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <><Database size={18} /> Tarik Rekam Medis</>}
              </motion.button>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
}