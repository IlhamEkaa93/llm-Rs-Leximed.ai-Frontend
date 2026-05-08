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
        // PERBAIKAN MUTLAK: Ekstrak data jadi array murni agar .filter() tidak error
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
    { label: 'Pasien Hari Ini', value: counts.today_patients, icon: <User size={24} />, color: 'blue' },
    { label: 'Log Aktivitas AI', value: counts.pending_ai, icon: <Activity size={24} />, color: 'orange' },
    { label: 'Resume Terverifikasi', value: counts.completed_resumes, icon: <FileText size={24} />, color: 'emerald' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 p-1 font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Dashboard Dokter</h1>
          <p className="text-slate-500 font-medium mt-1">
            Selamat bekerja, <strong className="text-blue-600">{user.name}</strong>. Memantau pasien hari ini.
          </p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={loadAllData}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 shadow-sm hover:bg-slate-50 transition-all"
        >
          <RefreshCw size={16} className={loadingPatients ? 'animate-spin' : ''} />
          Sinkronisasi Real-time
        </motion.button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((s, i) => (
          <motion.div 
            key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} whileHover={{ y: -5 }}
            className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm flex items-center gap-6 relative overflow-hidden group"
          >
            <div className={`p-5 rounded-2xl bg-${s.color}-500 text-white shadow-lg z-10 relative`}>
              {s.icon}
            </div>
            <div className="z-10 relative text-left">
              <motion.h3 key={s.value} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-black text-slate-900 leading-none">
                {s.value}
              </motion.h3>
              <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
        {/* Left Column: My Patients Today */}
        <div className="lg:col-span-2 bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <Calendar size={22} className="text-blue-600" /> Antrean Pasien Anda (Hari Ini)
            </h3>
            <span className="text-[10px] font-black px-4 py-2 bg-blue-100 text-blue-700 rounded-full uppercase tracking-widest">
                {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
            </span>
          </div>
          
          <div className="p-4 flex-1">
            <AnimatePresence mode='wait'>
              {loadingPatients ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
                  <Loader2 className="animate-spin text-blue-600" size={40} />
                  <p className="font-bold text-sm uppercase tracking-widest">Memvalidasi Otoritas...</p>
                </div>
              ) : patientsList.length > 0 ? (
                <div className="space-y-2">
                  {patientsList.map((p, i) => {
                    const rmNumber = p.norm || p.no_rm; // Ekstrak RM dengan aman
                    return (
                        <motion.div 
                          key={p.id || rmNumber || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} onClick={() => handleSelectPatient(p)}
                          className="group flex items-center justify-between p-6 rounded-3xl hover:bg-[#0f172a] transition-all cursor-pointer border border-slate-50 hover:shadow-2xl"
                        >
                          <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                              <User size={24} />
                            </div>
                            <div className="flex flex-col text-left">
                              <div className="flex items-center gap-2">
                                <span className="font-black text-slate-800 text-xl group-hover:text-white transition-colors">{p.name}</span>
                                <span className="text-[9px] font-black px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded uppercase">Ready</span>
                              </div>
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-400 transition-colors">
                                RM: {rmNumber} • {p.status || 'Rawat Jalan'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                             <div className="text-right hidden sm:block">
                                <p className="text-[9px] font-black text-slate-400 uppercase group-hover:text-blue-400">Jam Daftar</p>
                                <p className="text-sm font-bold text-slate-600 group-hover:text-white">
                                    {p.created_at ? new Date(p.created_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'}) + ' WIB' : '-'}
                                </p>
                             </div>
                             <ChevronRight size={24} className="text-slate-300 group-hover:text-white group-hover:translate-x-1 transition-all" />
                          </div>
                        </motion.div>
                    )
                  })}
                </div>
              ) : (
                <div className="py-20 text-center space-y-4">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300 border-2 border-dashed border-slate-200">
                    <Users size={32} />
                  </div>
                  <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Tidak ada antrean pasien untuk Anda hari ini</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: Search & Engine */}
        <div className="space-y-6">
          <div className="bg-[#0f172a] p-8 rounded-[32px] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <Database size={80} />
            </div>
            <h3 className="text-xl font-black mb-6 relative z-10 flex items-center gap-2 text-left">
              <Search size={20} className="text-blue-400" /> Cari Pasien Spesifik
            </h3>
            <form onSubmit={handleSearchSubmit} className="space-y-4 relative z-10">
              <input 
                type="text" placeholder="Masukkan No. RM atau Nama..." 
                className="w-full bg-white/10 border border-white/10 rounded-2xl py-5 px-6 text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold placeholder:text-slate-500 text-lg"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              />
              <motion.button 
                whileTap={{ scale: 0.95 }} type="submit"
                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-blue-500 shadow-xl shadow-blue-600/30 flex items-center justify-center gap-3 transition-all"
              >
                {loading ? <Loader2 className="animate-spin" /> : <><Database size={18} /> Ambil Data Pasien</>}
              </motion.button>
            </form>
          </div>

          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm border-t-4 border-t-emerald-500">
             <div className="flex items-center gap-3 mb-4">
                <Sparkles className="text-emerald-500" size={20} />
                <h4 className="font-black text-slate-800 text-sm uppercase tracking-widest text-left">AI Clinical Assistant</h4>
             </div>
             <div className="space-y-3 text-left">
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    DARSI Engine siap membantu verifikasi draf rekam medis menggunakan <strong>Llama 3.3</strong>.
                </p>
                <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-slate-400 uppercase">Engine Status</span>
                    <span className="text-emerald-600 font-black">ACTIVE & SECURE</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} className="h-full bg-emerald-500" />
                </div>
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}