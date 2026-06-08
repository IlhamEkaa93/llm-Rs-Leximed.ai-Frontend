import React, { useState, useEffect } from 'react';
import { 
  Search, Users, Activity, ScanLine, Loader2, 
  Database, LogOut, FileImage, Layers, ArrowRight,
  MonitorDot, Cpu, FileText // <-- FileText ditambahkan di sini
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardRadiologi() {
  const navigate = useNavigate();
  const [rm, setRm] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [stats, setStats] = useState([]);
  const [user, setUser] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || "https://lexi-med-ai-llm-rs-back-end.vercel.app/api";
  const API_URL_CLOUD = 'https://lexi-med-ai-llm-rs-back-end.vercel.app/api';
  const FINAL_API_URL = import.meta.env.VITE_API_URL || API_URL_CLOUD;

  useEffect(() => {
    const initDashboard = async () => {
      const savedUserStr = localStorage.getItem('user');
      const token = localStorage.getItem('access_token');

      if (!savedUserStr || !token) return navigate('/login', { replace: true });
      setUser(JSON.parse(savedUserStr));

      try {
        const response = await fetch(`${API_URL}/radiology/dashboard`, {
          headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
        });
        
        if (!response.ok) throw new Error("Gagal mengambil data stat");
        
        const data = await response.json();
        
        setStats([
          { label: 'Total Pemeriksaan', value: data.stats?.total_scans || '0', icon: <Layers size={24} />, color: '#0ea5e9', bg: 'bg-sky-50' },
          { label: 'Antrean Analisis AI', value: data.stats?.pending_analysis || '0', icon: <Cpu size={24} />, color: '#f59e0b', bg: 'bg-amber-50' },
          { label: 'Laporan Tervalidasi', value: data.stats?.ai_verified || '0', icon: <FileImage size={24} />, color: '#10b981', bg: 'bg-emerald-50' },
        ]);
      } catch (e) {
        // Fallback Mock Data untuk Demo
        setStats([
          { label: 'Total Pemeriksaan', value: '12', icon: <Layers size={24} />, color: '#0ea5e9', bg: 'bg-sky-50' },
          { label: 'Antrean Analisis AI', value: '4', icon: <Cpu size={24} />, color: '#f59e0b', bg: 'bg-amber-50' },
          { label: 'Laporan Tervalidasi', value: '8', icon: <FileImage size={24} />, color: '#10b981', bg: 'bg-emerald-50' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    initDashboard();
  }, [navigate]);

  const handleSearchPatient = async () => {
    const rawInput = rm.trim();
    if (!rawInput) return alert("Silakan masukkan Nomor Rekam Medis (RM) pasien.");
    
    let searchQuery = rawInput;
    if (/^\d+$/.test(searchQuery)) searchQuery = `RM-${searchQuery}`;
    else if (searchQuery.toLowerCase().startsWith('rm-')) searchQuery = searchQuery.toUpperCase();

    setSearchLoading(true);
    try {
      const response = await fetch(`${API_URL}/patients/${encodeURIComponent(searchQuery)}`, {
        headers: { 
          "Authorization": `Bearer ${localStorage.getItem('access_token')}`,
          "Accept": "application/json"
        }
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "Pasien tidak ditemukan di database.");
      }

      const patientData = Array.isArray(result.data) ? result.data[0] : (result.data || result);
      patientData.norm = patientData.no_rm || patientData.norm || patientData.patient_id || searchQuery;

      localStorage.setItem('active_radiology_patient', JSON.stringify(patientData));
      navigate('/radiologi/input'); 
      
    } catch (err) {
      alert(`Pencarian Gagal: ${err.message}`);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login', { replace: true });
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-cyan-600 mb-4" size={50} />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 animate-pulse italic">Connecting to PACS Server...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-24 text-left font-sans antialiased">
      
      {/* HEADER SECTION */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} 
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-200 shadow-sm mb-10 overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none rotate-12 transform scale-150">
          <ScanLine size={250} />
        </div>
        
        <div className="relative z-10 flex flex-col gap-2">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-none italic uppercase">
            Radiolog <span className="text-cyan-600">{user?.name?.split(' ')[0]}</span>
          </h1>
          <div className="flex items-center gap-4 mt-2">
             <span className="bg-[#0f172a] text-cyan-400 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg flex items-center gap-2">
               <MonitorDot size={14} className="animate-pulse" /> PACS Station Active
             </span>
             <span className="text-slate-400 font-bold text-xs flex items-center gap-1.5 uppercase tracking-tighter">
               <Activity size={14} className="text-emerald-500 animate-pulse" /> Live Monitoring
             </span>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-4 bg-slate-50 px-8 py-5 rounded-[2rem] border border-slate-200">
             <div className="w-14 h-14 bg-cyan-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-cyan-200 shrink-0">
                <Database size={24} />
             </div>
             <div>
                <p className="text-[10px] text-cyan-600 font-black uppercase tracking-[0.2em] mb-1">Server Status</p>
                <p className="font-black text-slate-800 text-lg tracking-tight leading-none">PostgreSQL 16</p>
             </div>
          </div>
          <button onClick={handleLogout} className="p-5 bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-3xl transition-all shadow-sm active:scale-95 group">
              <LogOut size={22} className="group-hover:-translate-x-1 transition-transform" />
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-8 space-y-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} 
            className="bg-white p-10 md:p-14 rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden"
          >
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-50 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex items-center gap-6 mb-10">
                <div className="p-5 bg-cyan-600 text-white rounded-[2rem] shadow-xl shadow-cyan-200">
                  <Search size={32} />
                </div>
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Identifikasi Pasien</h2>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mt-2">Check-in Pasien untuk Input Radiologi</p>
                </div>
            </div>

            <div className="relative z-10 space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                <Users size={14} className="text-cyan-500" /> Nomor Rekam Medis (RM)
              </label>
              <div className="flex flex-col sm:flex-row gap-4">
                <input 
                  type="text" placeholder="Ketik RM Pasien di sini..." 
                  className="flex-1 bg-slate-50 border-2 border-slate-100 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-50 focus:bg-white rounded-[2rem] p-6 text-xl font-black text-slate-800 outline-none transition-all shadow-inner uppercase placeholder:text-slate-300 placeholder:normal-case"
                  value={rm} onChange={(e) => setRm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchPatient()}
                />
                <button 
                  onClick={handleSearchPatient} disabled={searchLoading || !rm.trim()}
                  className="bg-cyan-600 hover:bg-[#0f172a] text-white px-12 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-cyan-200 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:shadow-none"
                >
                  {searchLoading ? <Loader2 className="animate-spin" size={20} /> : <><ArrowRight size={20}/> Eksekusi</>}
                </button>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((s, i) => (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i} 
                className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex flex-col items-center justify-center text-center gap-4 shadow-sm hover:shadow-xl transition-all group"
              >
                <div className={`p-5 rounded-[1.5rem] transition-transform group-hover:scale-110 ${s.bg}`} style={{ color: s.color }}>
                  {s.icon}
                </div>
                <div>
                  <div className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-2">{s.value}</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{s.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 h-full">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} 
              className="bg-[#0f172a] rounded-[3.5rem] p-10 text-white relative overflow-hidden h-full shadow-2xl flex flex-col border-[6px] border-white"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 flex-1 flex flex-col text-left">
                <h3 className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.4em] mb-12 flex items-center gap-3">
                  <Activity size={14} className="animate-pulse" /> Neural LexiMed.ai Core
                </h3>
                
                <div className="space-y-6">
                    <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 space-y-4 hover:bg-white/10 transition-colors">
                        <div className="w-12 h-12 bg-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-900/50">
                          <FileText size={24}/>
                        </div>
                        <div>
                            <h4 className="font-black text-lg tracking-tight italic leading-none">Status Modul Klinis</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed mt-3">
                              Alur kerja Radiologi terhubung langsung dengan sistem Llama 3 untuk ekstraksi temuan medis dan validasi otomatis.
                            </p>
                        </div>
                    </div>

                    <div className="p-8 bg-emerald-500/10 rounded-[2.5rem] border border-emerald-500/20 flex items-center gap-6">
                        <div className="w-4 h-4 bg-emerald-500 rounded-full animate-ping shrink-0" />
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] leading-tight">Neural Engine Llama 3.3 Active</span>
                    </div>
                </div>

                <div className="mt-auto pt-10 border-t border-white/5 text-center">
                   <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-loose">
                     Intelligence Healthcare Secured<br/>LexiMed.ai Encryption Standard
                   </p>
                </div>
              </div>
            </motion.div>
        </div>
      </div>
    </div>
  );
}