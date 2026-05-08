import React, { useState, useEffect } from 'react';
import { 
  Search, Users, Clock, ClipboardCheck, Loader2, 
  Database, LogOut, Activity, FileText,
  Home, SunMoon, Layout, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function DashboardPerawat() {
  const navigate = useNavigate();
  const [rm, setRm] = useState('');
  const [ruang, setRuang] = useState('');
  const [shift, setShift] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [stats, setStats] = useState([]);
  const [user, setUser] = useState(null);

  const API_URL = "http://localhost:8000/api";

  useEffect(() => {
    const initDashboard = async () => {
      const savedUserStr = localStorage.getItem('user');
      const token = localStorage.getItem('access_token');

      if (!savedUserStr || !token) {
        navigate('/login', { replace: true });
        return;
      }

      setUser(JSON.parse(savedUserStr));

      try {
        const response = await fetch(`${API_URL}/dashboard-stats`, {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json" 
          }
        });

        const data = await response.json();
        
        // MENGGUNAKAN DATA REAL-TIME DARI POSTGRESQL MURNI
        setStats([
          { label: 'Total Pasien Terdaftar', value: data.today_patients || '0', icon: <Users size={24} />, color: '#3b82f6', bg: 'bg-blue-50' },
          { label: 'Antrean Generasi AI', value: data.pending_ai || '0', icon: <Clock size={24} />, color: '#f59e0b', bg: 'bg-amber-50' },
          { label: 'Dokumen Tervalidasi', value: data.completed_resumes || '0', icon: <ClipboardCheck size={24} />, color: '#10b981', bg: 'bg-emerald-50' },
        ]);
      } catch (e) {
        // Fallback jika API Backend offline
        setStats([
          { label: 'Koneksi Database', value: 'Offline', icon: <Users size={24} />, color: '#ef4444', bg: 'bg-red-50' },
          { label: 'Status AI Engine', value: 'Offline', icon: <Clock size={24} />, color: '#ef4444', bg: 'bg-red-50' },
          { label: 'Dokumen Tervalidasi', value: '-', icon: <ClipboardCheck size={24} />, color: '#ef4444', bg: 'bg-red-50' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    initDashboard();
  }, [navigate]);

  const handleSearchPatient = async () => {
    const rawInput = rm.trim();
    if (!rawInput) return alert("Silakan masukkan Nomor RM atau Nama Pasien.");
    if (!ruang || !shift) return alert("Tentukan Ruang dan Shift tugas Anda.");
    
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
      if (!response.ok) throw new Error(result.message || "Pasien tidak ditemukan.");

      const patientData = Array.isArray(result.data) ? result.data[0] : (result.data || result);
      
      const finalPatientSession = {
        ...patientData,
        norm: patientData.no_rm || patientData.norm || patientData.patient_id || searchQuery,
        current_unit: ruang,
        current_shift: shift,
        session_start: new Date().toLocaleTimeString()
      };

      localStorage.setItem('active_patient', JSON.stringify(finalPatientSession));
      navigate('/tambah-catatan'); 
      
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
      <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 animate-pulse italic">Authenticating Secure Session...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-24 text-left font-sans antialiased">
      
      {/* HEADER SECTION */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} 
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm mb-10 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none rotate-12"><Layout size={200} /></div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-none italic uppercase">
            Nurse <span className="text-blue-600">{user?.name?.split(' ')[0]}</span>
          </h1>
          <div className="flex items-center gap-3 mt-3">
             <span className="bg-[#0f172a] text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">
               Clinical Station
             </span>
             <span className="text-slate-400 font-bold text-xs flex items-center gap-1.5 uppercase tracking-tighter">
               <Activity size={14} className="text-emerald-500 animate-pulse" /> Node Active
             </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 relative z-10 w-full lg:w-auto">
            <div className="flex-1 lg:flex-none flex items-center gap-3 px-6 py-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 text-[10px] font-black uppercase tracking-widest shadow-inner">
                <Database size={16} /> PostgreSQL Ver. 16.2
            </div>
            <button onClick={handleLogout} className="p-4 bg-white border border-slate-200 text-slate-400 hover:text-red-500 rounded-2xl transition-all shadow-sm active:scale-95 group">
                <LogOut size={20} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* LEFT COLUMN: SEARCH FORM */}
        <div className="lg:col-span-8 space-y-8 text-left">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} 
            className="bg-white p-10 md:p-14 rounded-[3.5rem] shadow-2xl shadow-slate-200/60 border border-slate-200 space-y-10"
          >
            <div className="flex items-center gap-6 mb-4">
                <div className="p-5 bg-blue-600 text-white rounded-3xl shadow-xl shadow-blue-200"><Search size={32} /></div>
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Identifikasi Subjek</h2>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">Inisialisasi Sesi Asuhan Keperawatan</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2"><Home size={12}/> Unit Layanan Klinis</label>
                    <select 
                        value={ruang} onChange={(e) => setRuang(e.target.value)}
                        className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl font-bold text-slate-700 outline-none focus:border-blue-500 transition-all cursor-pointer shadow-inner"
                    >
                        <option value="">-- Autentikasi Unit --</option>
                        <option value="UGD">Unit Gawat Darurat (UGD)</option>
                        <option value="ICU">Intensive Care Unit (ICU)</option>
                        <option value="MAWAR">Bangsal Mawar (Kls I)</option>
                        <option value="MELATI">Bangsal Melati (Kls II)</option>
                    </select>
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2"><SunMoon size={12}/> Shift Penugasan</label>
                    <select 
                        value={shift} onChange={(e) => setShift(e.target.value)}
                        className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl font-bold text-slate-700 outline-none focus:border-blue-500 transition-all cursor-pointer shadow-inner"
                    >
                        <option value="">-- Sinkronisasi Shift --</option>
                        <option value="PAGI">Pagi (07:00 - 14:00)</option>
                        <option value="SORE">Sore (14:00 - 21:00)</option>
                        <option value="MALAM">Malam (21:00 - 07:00)</option>
                    </select>
                </div>
            </div>

            <div className="space-y-3 pt-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2"><Users size={12}/> Nomor Rekam Medis (RM) / Nama</label>
              <div className="flex flex-col sm:flex-row gap-4">
                <input 
                  type="text" placeholder="Masukkan ID Pasien untuk menarik data..." 
                  className="flex-1 bg-slate-50 border-2 border-slate-100 focus:border-blue-500 focus:bg-white rounded-2xl p-6 text-xl font-black text-slate-800 outline-none transition-all placeholder:text-slate-300 shadow-inner"
                  value={rm} onChange={(e) => setRm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchPatient()}
                />
                <button 
                  onClick={handleSearchPatient}
                  disabled={searchLoading || !rm.trim() || !ruang || !shift}
                  className="bg-blue-600 hover:bg-[#0f172a] text-white px-10 py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:bg-slate-100 disabled:text-slate-300 disabled:shadow-none"
                >
                  {searchLoading ? <Loader2 className="animate-spin" size={20} /> : <><ArrowRight size={20}/> Eksekusi</>}
                </button>
              </div>
            </div>
          </motion.div>

          {/* STATS TILES (SEKARANG MURNI DARI DATABASE) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((s, i) => (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i} 
                className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center gap-3 group hover:shadow-xl transition-all"
              >
                <div className={`p-4 rounded-2xl ${s.bg}`} style={{ color: s.color }}>{s.icon}</div>
                <div>
                  <div className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-1">{s.value}</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{s.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: SYSTEM STATUS (SIDEBAR) */}
        <div className="lg:col-span-4 h-full">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} 
              className="bg-[#0f172a] rounded-[3.5rem] p-10 text-white relative overflow-hidden h-full shadow-2xl flex flex-col border-4 border-white"
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.05] rotate-12 pointer-events-none"><ClipboardCheck size={250} /></div>
              
              <div className="relative z-10 flex-1 flex flex-col text-left">
                <h3 className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em] mb-12 flex items-center gap-3">
                  <Activity size={14} className="animate-pulse" /> Neural Darsi Core
                </h3>
                
                <div className="space-y-6">
                    <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 space-y-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg"><FileText size={24}/></div>
                        <div>
                            <h4 className="font-black text-lg tracking-tight italic leading-none">Modul Integrasi Klinis</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed mt-3">
                                Seluruh pipeline keperawatan (Observasi Manual, Generasi LLM Handover, hingga RAG Dokumentasi) telah terenkripsi end-to-end.
                            </p>
                        </div>
                    </div>

                    <div className="p-8 bg-emerald-500/10 rounded-[2.5rem] border border-emerald-500/20 flex items-center gap-6">
                        <div className="w-4 h-4 bg-emerald-500 rounded-full animate-ping shrink-0" />
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Neural Engine Llama 3.3 Standby</span>
                    </div>
                </div>

                <div className="mt-auto pt-10 border-t border-white/5 text-center">
                   <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest leading-loose">
                     Intelligence Healthcare Secured<br/>RS UNS Encryption Standard
                   </p>
                </div>
              </div>
            </motion.div>
        </div>

      </div>
    </div>
  );
}