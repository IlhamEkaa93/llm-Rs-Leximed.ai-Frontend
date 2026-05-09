import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, User, Activity, FileText, Loader2, 
  ArrowRight, Users, RefreshCw, Sparkles, ChevronRight, Database, Calendar
} from 'lucide-react';

export default function DashboardDokter() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [patientsList, setPatientsList] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  
  // Ambil data user login untuk filter DPJP
  const user = JSON.parse(localStorage.getItem('user'));

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
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        const rawData = await response.json();
        // Mengamankan pembacaan data jika terbungkus { data: {...} }
        const data = rawData.data || rawData; 
        setCounts(prev => ({
          ...prev, // Pertahankan today_patients dari list jika sudah di-set
          pending_ai: data.pending_ai || 0,
          completed_resumes: data.completed_resumes || 0
        }));
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
          'Accept': 'application/json'
        }
      });
      
      const rawData = await response.json();
      
      if (response.ok) {
        // Ekstrak data jadi array murni agar .filter() tidak error
        const patientsArray = Array.isArray(rawData) ? rawData : (rawData.data || []);

        // 1. Ambil Tanggal Hari Ini (format d/m/Y sesuai API)
        const today = new Date().toLocaleDateString('id-ID', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });

        // 2. Filter: Harus Pasien Hari ini DAN Nama Dokter (DPJP) cocok dengan user login
        const myPatients = patientsArray.filter(p => {
            // Cek kompatibilitas tanggal
            const isTodayStr = p.date === today;
            const isTodayIso = p.created_at && String(p.created_at).startsWith(new Date().toISOString().split('T')[0]);
            const isToday = isTodayStr || isTodayIso;
            
            return isToday && p.dpjp === user.name;
        });

        setPatientsList(myPatients);
        
        // Update stats khusus pasien dokter ini
        setCounts(prev => ({
          ...prev,
          today_patients: myPatients.length
        }));
      } else {
        // Redirect ke login jika token expired (401)
        if (response.status === 401) {
            alert("Sesi telah habis, silakan login ulang.");
            localStorage.clear();
            navigate('/login');
        }
        throw new Error(rawData.message || "Gagal memuat list pasien");
      }
    } catch (err) {
      console.error("Gagal mengambil daftar pasien:", err);
    }
  };

  const handleSelectPatient = (patientData) => {
    // Normalisasi nomer RM untuk LocalStorage agar formatnya konsisten
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
        const response = await fetch(`http://localhost:8000/api/patients/${searchTerm}`, {
            headers: { 
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
              'Accept': 'application/json'
            }
        });
        
        const rawData = await response.json();
        
        if (!response.ok) throw new Error(rawData.message || "Pasien tidak ditemukan atau bukan wewenang Anda");
        
        // Cek apakah pasien yang ditarik adalah milik dokter ini (Security Check)
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
          className="flex justify-center items-center gap-2 px-5 py-3 md:py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
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
            className="bg-white p-6 md:p-8 rounded-[24px] md:rounded-[32px] border border-slate-200 shadow-sm flex items-center gap-5 md:gap-6 relative overflow-hidden group cursor-default"
          >
            <div className={`p-4 md:p-5 rounded-2xl ${s.bg} text-white shadow-lg ${s.shadow} z-10 relative`}>
              {s.icon}
            </div>
            <div className="z-10 relative text-left">
              <motion.h3 key={s.value} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-black text-slate-900 leading-none">
                {s.value}
              </motion.h3>
              <p className="text-[10px] md:text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 text-left">
        {/* Left Column: My Patients Today */}
        <div className="lg:col-span-2 bg-white rounded-[24px] md:rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[400px] md:min-h-[500px]">
          <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
            <h3 className="text-lg md:text-xl font-black text-slate-900 flex items-center gap-3">
              <Calendar size={22} className="text-blue-600" /> Antrean Pasien Anda
            </h3>
            <span className="text-[10px] font-black px-4 py-2 bg-blue-100 text-blue-700 rounded-full uppercase tracking-widest text-center">
                {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
            </span>
          </div>
          
          <div className="p-4 md:p-6 flex-1">
            <AnimatePresence mode='wait'>
              {loadingPatients ? (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
                  <Loader2 className="animate-spin text-blue-600" size={40} />
                  <p className="font-bold text-xs md:text-sm uppercase tracking-widest">Memvalidasi Otoritas...</p>
                </motion.div>
              ) : patientsList.length > 0 ? (
                <div className="space-y-3">
                  {patientsList.map((p, i) => {
                    const rmNumber = p.norm || p.no_rm; // Ekstrak RM dengan aman
                    return (
                        <motion.div 
                          key={p.id || rmNumber || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} onClick={() => handleSelectPatient(p)}
                          className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-6 rounded-[20px] hover:bg-[#0f172a] transition-all cursor-pointer border border-slate-100 hover:border-[#0f172a] hover:shadow-2xl gap-4 sm:gap-0"
                        >
                          <div className="flex items-center gap-4 md:gap-5">
                            <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                              <User size={20} className="md:w-6 md:h-6" />
                            </div>
                            <div className="flex flex-col text-left">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-black text-slate-800 text-lg md:text-xl group-hover:text-white transition-colors line-clamp-1">{p.name}</span>
                                <span className="text-[8px] md:text-[9px] font-black px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded uppercase shrink-0">Ready</span>
                              </div>
                              <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-400 transition-colors line-clamp-1">
                                RM: {rmNumber} • {p.status || 'Rawat Jalan'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 border-slate-100 group-hover:border-slate-800 pt-3 sm:pt-0">
                             <div className="text-left sm:text-right">
                                <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase group-hover:text-blue-400">Jam Daftar</p>
                                <p className="text-xs md:text-sm font-bold text-slate-600 group-hover:text-white">
                                    {p.created_at ? new Date(p.created_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'}) + ' WIB' : '-'}
                                </p>
                             </div>
                             <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-slate-800 flex items-center justify-center transition-colors">
                                <ChevronRight size={18} className="text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                             </div>
                          </div>
                        </motion.div>
                    )
                  })}
                </div>
              ) : (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} className="py-20 text-center space-y-4">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300 border-2 border-dashed border-slate-200">
                    <Users size={28} className="md:w-8 md:h-8" />
                  </div>
                  <p className="text-slate-400 font-bold uppercase text-[10px] md:text-xs tracking-widest px-4">Tidak ada antrean pasien untuk Anda hari ini</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: Search & Engine */}
        <div className="space-y-6">
          <div className="bg-[#0f172a] p-6 md:p-8 rounded-[24px] md:rounded-[32px] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform pointer-events-none">
              <Database size={80} />
            </div>
            <h3 className="text-lg md:text-xl font-black mb-6 relative z-10 flex items-center gap-2 text-left">
              <Search size={20} className="text-emerald-400" /> Cari Pasien Spesifik
            </h3>
            <form onSubmit={handleSearchSubmit} className="space-y-4 relative z-10">
              <input 
                type="text" placeholder="Masukkan No. RM atau Nama..." 
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl py-4 md:py-5 px-5 md:px-6 text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold placeholder:text-slate-500 text-sm md:text-base"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              />
              <motion.button 
                whileTap={{ scale: 0.95 }} type="submit"
                className="w-full py-4 md:py-5 bg-gradient-to-r from-blue-600 to-emerald-500 text-white rounded-2xl font-black text-xs md:text-sm uppercase tracking-[0.2em] shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-3 transition-all hover:shadow-emerald-500/40"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <><Database size={18} /> Tarik Rekam Medis</>}
              </motion.button>
            </form>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-[24px] md:rounded-[32px] border border-slate-200 shadow-sm border-t-4 border-t-emerald-500 relative overflow-hidden">
             {/* Logo LexiMed menyatu halus di background box ini */}
             <div className="absolute -bottom-4 -right-4 opacity-5 pointer-events-none grayscale">
               <img src="/logo.png" alt="LexiMed Logo Background" className="w-32 h-32 object-contain" />
             </div>
             
             <div className="flex items-center gap-3 mb-4 relative z-10">
                <Sparkles className="text-emerald-500" size={20} />
                <h4 className="font-black text-slate-800 text-xs md:text-sm uppercase tracking-widest text-left">AI Clinical Assistant</h4>
             </div>
             <div className="space-y-4 text-left relative z-10">
                <p className="text-[11px] md:text-xs text-slate-500 font-medium leading-relaxed">
                    <strong>LexiMed Engine</strong> siap membantu meringkas dan menyusun draf rekam medis klinis secara presisi.
                </p>
                <div className="flex justify-between items-center text-[9px] md:text-[10px] bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                    <span className="font-bold text-slate-400 uppercase">Status</span>
                    <span className="text-emerald-600 font-black flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> ONLINE & SECURE
                    </span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}