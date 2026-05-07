import React, { useState, useEffect } from 'react';
import { Search, Users, Clock, ArrowRight, ClipboardCheck, Loader2, Database, LogOut, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function DashboardPerawat() {
  const navigate = useNavigate();
  const [rm, setRm] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [stats, setStats] = useState([]);
  const [user, setUser] = useState(null);

  // Ambil URL API dari env atau default localhost
  const API_URL = "http://localhost:8000/api";

  useEffect(() => {
    const initDashboard = async () => {
      const savedUserStr = localStorage.getItem('user');
      const token = localStorage.getItem('access_token');

      if (!savedUserStr || !token) {
        navigate('/', { replace: true });
        return;
      }

      const savedUser = JSON.parse(savedUserStr);
      setUser(savedUser);

      try {
        // FETCH STATISTIK NYATA DARI DATABASE
        const response = await fetch(`${API_URL}/dashboard-stats`, {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json" 
          }
        });

        const data = await response.json();
        
        // Mapping data dari backend ke UI stats
        setStats([
          { 
            label: 'Total Pasien Master', 
            value: data.today_patients || '0', 
            icon: <Users />, 
            color: '#3b82f6' 
          },
          { 
            label: 'Antrean Handover (Draft)', 
            value: data.pending_ai || '0', 
            icon: <Clock />, 
            color: '#f59e0b' 
          },
          { 
            label: 'Laporan Terverifikasi', 
            value: data.completed_resumes || '0', 
            icon: <ClipboardCheck />, 
            color: '#10b981' 
          },
        ]);
      } catch (e) {
        console.error("Gagal sinkronisasi dashboard:", e);
        // Fallback jika API bermasalah agar UI tidak kosong melompong
        setStats([
          { label: 'Pasien Terdaftar', value: 'Offline', icon: <Users />, color: '#64748b' },
          { label: 'Status Server', value: 'Error', icon: <Activity />, color: '#ef4444' },
          { label: 'Database', value: 'Disconnected', icon: <Database />, color: '#ef4444' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    initDashboard();
  }, [navigate]);

  const handleSearchPatient = async () => {
    const rawInput = rm.trim();
    if (!rawInput) return alert("Masukkan Nomor Rekam Medis (RM).");
    
    let formattedRM = rawInput.toUpperCase();
    if (/^\d+$/.test(formattedRM)) {
      formattedRM = `RM-${formattedRM}`;
    }

    setSearchLoading(true);
    try {
      const response = await fetch(`${API_URL}/patients/${formattedRM}`, {
        method: "GET",
        headers: { 
          "Authorization": `Bearer ${localStorage.getItem('access_token')}`,
          "Accept": "application/json"
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Pasien ${formattedRM} tidak ditemukan.`);
      }

      // PERBAIKAN: Pastikan kita menyimpan objek pasien yang valid
      // Kadang API Laravel membungkusnya di result.data, kadang array result[0], kadang objek langsung result
      let patientData = null;
      if (result.data && !Array.isArray(result.data)) {
        patientData = result.data;
      } else if (Array.isArray(result.data) && result.data.length > 0) {
        patientData = result.data[0];
      } else if (Array.isArray(result) && result.length > 0) {
        patientData = result[0];
      } else {
        patientData = result;
      }

      // Validasi tambahan sebelum pindah halaman
      if (!patientData || (!patientData.id && !patientData.id_pasien)) {
          console.error("Data pasien tidak lengkap:", result);
          throw new Error("Data pasien tidak valid dari server (Missing ID).");
      }

      // Simpan data pasien ke localstorage agar halaman handover bisa baca
      localStorage.setItem('active_patient', JSON.stringify(patientData));
      navigate('/handover'); 
      
    } catch (err) {
      alert(`Pencarian Gagal: ${err.message}`);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/', { replace: true });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-left">
      {/* Header Perawat */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Selamat Bertugas, {user?.name || 'Tenaga Medis'}
          </h1>
          <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
            <Activity size={16} className="text-blue-500" /> Unit Pelayanan RS UNS • <span className="text-blue-600 font-bold uppercase">{user?.role}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 text-xs font-black uppercase tracking-widest">
                <Database size={14} /> PostgreSQL Connected
            </div>
            <button onClick={handleLogout} className="p-3 bg-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all shadow-sm">
                <LogOut size={24} />
            </button>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
        {/* Kolom Pencarian */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-10 rounded-[40px] shadow-xl shadow-slate-200/50 border border-slate-200">
            <div className="flex items-center gap-4 mb-8 text-left">
                <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
                    <Search size={28} />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-slate-800 leading-none">Cari Pasien</h2>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2 text-left">Gunakan Nomor Rekam Medis</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <input 
                type="text" 
                placeholder="Masukkan No. RM (Contoh: 0111)" 
                className="flex-1 bg-slate-100 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-6 py-5 text-xl font-bold text-slate-700 outline-none transition-all"
                value={rm}
                onChange={(e) => setRm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchPatient()}
              />
              <button 
                onClick={handleSearchPatient}
                disabled={searchLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl font-black text-lg shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {searchLoading ? <Loader2 className="animate-spin" /> : <><Activity size={20}/> Periksa</>}
              </button>
            </div>
          </motion.div>

          {/* Grid Statistik Dinamis */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((s, i) => (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-5 group hover:shadow-md transition-all">
                <div className="p-4 rounded-2xl transition-transform group-hover:scale-110" style={{ backgroundColor: `${s.color}15`, color: s.color }}>
                  {s.icon}
                </div>
                <div className="text-left">
                  <div className="text-2xl font-black text-slate-800">{s.value}</div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-tight">{s.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sidebar Shortcut */}
        <div className="space-y-8">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden h-full min-h-[350px]">
              <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                <ClipboardCheck size={180} />
              </div>
              <div className="relative z-10 text-left">
                <h3 className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8">Nurse Quick Actions</h3>
                <div className="space-y-4">
                    <button onClick={() => navigate('/kelola-user')} className="w-full group flex items-center justify-between bg-white/10 hover:bg-blue-600 p-5 rounded-2xl transition-all border border-white/5">
                        <div className="text-left">
                          <span className="block font-black text-sm">Dashboard Pasien</span>
                          <span className="text-[9px] text-white/50 uppercase font-bold tracking-tighter">Lihat Semua Antrean</span>
                        </div>
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button onClick={() => navigate('/handover')} className="w-full group flex items-center justify-between bg-white/5 hover:bg-slate-800 p-5 rounded-2xl transition-all border border-white/5">
                        <div className="text-left text-white/70">
                          <span className="block font-black text-sm">Draft Handover Shift</span>
                          <span className="text-[9px] uppercase font-bold tracking-tighter">AI Assistant Ready</span>
                        </div>
                        <Clock size={20} />
                    </button>
                </div>
              </div>
            </motion.div>
        </div>
      </div>
    </div>
  );
}