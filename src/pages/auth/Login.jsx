import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, Stethoscope, Activity, Settings, 
  Loader2, AlertTriangle, Eye, EyeOff, CheckCircle2, 
  UserCircle2, FileSearch, PieChart 
} from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState('dokter'); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.target);
    const username = formData.get('username').trim();

    try {
      // Pastikan endpoint ini sesuai dengan backend Laravel Anda
      const response = await fetch("http://127.0.0.1:8000/api/token", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Kredensial tidak valid.");

      // --- VALIDASI ROLE KETAT ---
      // Mengecek apakah role di database cocok dengan role yang dipilih di tab UI
      // (FR-01)
      if (data.user && data.user.role !== role) {
        throw new Error(`Akses Ditolak: Akun Anda terdaftar sebagai ${data.user.role.toUpperCase()}, bukan ${role.toUpperCase()}.`);
      }

      // Simpan Token dan Data User
      localStorage.setItem('access_token', data.access_token);
      
      const userData = {
        id: username,
        name: data.user?.name || getFallbackName(username),
        role: data.user?.role || role, 
      };

      localStorage.setItem('user', JSON.stringify(userData));
      setLoginSuccess(true);
      
      // Delay sedikit agar animasi "Akses Diberikan" terlihat
      setTimeout(() => {
        // Navigasi berdasarkan Role (FR-01 & Modul Radiologi)
        const routes = {
          perawat: '/dashboardperawat',
          admin: '/dashboard-admin',
          dokter: '/dashboard',
          radiologi: '/dashboard-radiologi', // Pengalihan khusus Radiologi
          manajemen: '/dashboard-manajemen'
        };
        navigate(routes[userData.role] || '/', { replace: true });
      }, 1500);
      
    } catch (err) {
      setError(err.message === "Failed to fetch" ? "Server backend mati." : err.message);
      setLoading(false);
    }
  };

  // Fungsi fallback jika API tidak mengirimkan nama lengkap
  const getFallbackName = (user) => {
    if (user.includes('admin')) return 'Admin IT DARSI';
    if (user.includes('perawat')) return 'Ns. Siti Aminah, S.Kep';
    if (user.includes('rad')) return 'dr. Tirta, Sp.Rad';
    return 'dr. Ilham Eka';
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0f1d] flex items-center justify-center p-4 md:p-8 overflow-hidden relative font-sans text-left">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], x: [0, 100, 0], y: [0, 50, 0], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px]"
        />
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 bg-white/5 backdrop-blur-3xl rounded-[40px] border border-white/10 shadow-2xl overflow-hidden z-10">
        
        {/* Panel Kiri: Animasi Logo */}
        <div className="hidden lg:flex relative flex-col items-center justify-center p-16 bg-gradient-to-br from-blue-600/20 via-transparent border-r border-white/10">
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, type: "spring" }} className="relative group">
            <div className="absolute inset-0 bg-blue-500 rounded-full blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
            <motion.img animate={{ y: [0, -15, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} src="/LOGO-1.png" alt="Logo RS UNS" className="w-56 h-56 object-contain relative z-20 drop-shadow-[0_0_40px_rgba(37,99,235,0.4)]" />
          </motion.div>
          <div className="mt-16 text-center space-y-6 relative z-20">
            <h1 className="text-6xl font-black text-white tracking-tighter">DARSI <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">SYSTEM</span></h1>
            <p className="text-slate-400 text-lg max-w-sm mx-auto italic underline decoration-blue-500/30 font-medium">Digital Assistant Rumah Sakit berbasis RAG & LLM.</p>
          </div>
        </div>

        {/* Panel Kanan: Form Login */}
        <div className="flex flex-col justify-center p-8 md:p-20 relative bg-[#0f172a]/40 text-left">
          <div className="space-y-3 mb-12">
            <h2 className="text-4xl font-black text-white tracking-tight">Otentikasi</h2>
            <p className="text-slate-400 font-semibold text-lg italic uppercase tracking-widest">Pilih peran kerja Anda</p>
          </div>

          {/* Notifikasi Error/Success */}
          <AnimatePresence mode='wait'>
            {error && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="mb-8 p-4 bg-red-500/10 border-l-4 border-red-500 rounded-xl flex items-center gap-4 text-red-400">
                <AlertTriangle size={20} />
                <span className="text-sm font-bold">{error}</span>
              </motion.div>
            )}
            {loginSuccess && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mb-8 p-4 bg-emerald-500/10 border-l-4 border-emerald-500 rounded-xl flex items-center gap-4 text-emerald-400">
                <CheckCircle2 size={20} />
                <span className="text-sm font-bold">Akses Diberikan!</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-8">
            {/* Tab Seleksi Role */}
            <div className="grid grid-cols-5 gap-2 p-1.5 bg-white/5 rounded-[20px] border border-white/10">
              {[
                { id: 'dokter', icon: <Stethoscope size={16}/> },
                { id: 'perawat', icon: <Activity size={16}/> },
                { id: 'admin', icon: <Settings size={16}/> },
                { id: 'radiologi', icon: <FileSearch size={16}/> },
                { id: 'manajemen', icon: <PieChart size={16}/> }
              ].map((r) => (
                <button key={r.id} type="button" onClick={() => setRole(r.id)} className={`py-3.5 rounded-[15px] flex flex-col items-center gap-1.5 transition-all ${role === r.id ? 'bg-blue-600 text-white shadow-lg scale-100' : 'text-slate-500 hover:text-slate-300 scale-95'}`}>
                  {r.icon}
                  <span className="text-[7px] font-black uppercase tracking-tighter">{r.id}</span>
                </button>
              ))}
            </div>

            {/* Input Kredensial */}
            <div className="space-y-5 text-left">
              <div className="relative">
                <UserCircle2 className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={22} />
                <input name="username" type="text" placeholder={`ID ${role.toUpperCase()}`} required className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white outline-none focus:border-blue-500 transition-all font-bold" />
              </div>

              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={22} />
                <input name="password" type={showPassword ? "text" : "password"} placeholder="KATA SANDI" required className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-14 text-white outline-none focus:border-blue-500 transition-all font-bold tracking-widest" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500">
                  {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              </div>
            </div>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full py-5 rounded-2xl font-black text-sm tracking-[0.2em] bg-blue-600 text-white shadow-xl hover:bg-blue-500 transition-all">
              {loading ? <Loader2 className="animate-spin mx-auto" /> : 'SIGN IN TO SYSTEM'}
            </motion.button>
          </form>
        </div>
      </div>
    </div>
  );
}