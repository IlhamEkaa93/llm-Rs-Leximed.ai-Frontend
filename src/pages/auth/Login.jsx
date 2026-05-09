import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, Stethoscope, Activity, Settings, 
  Loader2, AlertTriangle, Eye, EyeOff, CheckCircle2, 
  UserCircle2, FileSearch, PieChart, Users 
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
      const response = await fetch("http://127.0.0.1:8000/api/token", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Kredensial tidak valid.");

      if (data.user && data.user.role !== role) {
        throw new Error(`Akses Ditolak: Akun Anda terdaftar sebagai ${data.user.role.toUpperCase()}, bukan ${role.toUpperCase()}.`);
      }

      localStorage.setItem('access_token', data.access_token);
      
      const userData = {
        id: username,
        name: data.user?.name || getFallbackName(username, role),
        role: data.user?.role || role, 
      };

      localStorage.setItem('user', JSON.stringify(userData));
      setLoginSuccess(true);
      
      setTimeout(() => {
        const routes = {
          perawat: '/dashboard-perawat',
          admin: '/dashboard-admin',
          dokter: '/dashboard',
          radiologi: '/dashboard-radiologi',
          manajemen: '/dashboard-manajemen',
          asisten: '/dashboard-asisten'
        };
        navigate(routes[userData.role] || '/', { replace: true });
      }, 1500);
      
    } catch (err) {
      setError(err.message === "Failed to fetch" ? "Server backend (Laravel) mati atau belum dijalankan." : err.message);
      setLoading(false);
    }
  };

  const getFallbackName = (user, currentRole) => {
    if (user.includes('admin')) return 'Admin IT LexiMed';
    if (user.includes('perawat')) return 'Ns. Siti Aminah, S.Kep';
    if (user.includes('rad')) return 'dr. Tirta, Sp.Rad';
    if (currentRole === 'asisten') return 'Asisten Ners Budi';
    return 'dr. Ilham Eka';
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4 md:p-8 overflow-hidden relative font-sans text-left">
      
      {/* Background Effect (Futuristic Glow) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], x: [0, 100, 0], y: [0, 50, 0], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-blue-600/20 rounded-full blur-[100px] md:blur-[120px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], x: [0, -100, 0], y: [0, -50, 0], rotate: [0, -90, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-emerald-600/10 rounded-full blur-[100px] md:blur-[120px]"
        />
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 bg-white/5 backdrop-blur-3xl rounded-[30px] md:rounded-[40px] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden z-10 relative">
        
        {/* LEFT BRANDING (Visible only on Desktop/Tablet) */}
        <div className="hidden lg:flex relative flex-col items-center justify-center p-16 bg-gradient-to-br from-blue-900/20 via-transparent border-r border-white/10">
          
          {/* Logo Animation with Floating Effect */}
          <motion.div 
            initial={{ opacity: 0, y: -50 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 1, type: "spring" }} 
            className="relative group mb-10 flex justify-center items-center"
          >
            {/* Cahaya berpendar di belakang logo */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
            
            {/* Logo Asli (Mengambang Naik Turun) */}
            <motion.img 
              animate={{ y: [0, -15, 0] }} 
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} 
              src="/logo.png" 
              alt="LexiMed Logo" 
              className="w-48 h-48 object-contain relative z-20 drop-shadow-[0_10px_30px_rgba(16,185,129,0.3)]"
            />
          </motion.div>

          <div className="text-center space-y-6 relative z-20">
            <h1 className="text-5xl xl:text-6xl font-black text-white tracking-tighter">
              LexiMed<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">.ai</span>
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-emerald-400 mx-auto rounded-full"></div>
            <p className="text-slate-400 text-base xl:text-lg max-w-sm mx-auto font-medium leading-relaxed">
              "Satu AI untuk Seluruh Alur Rumah Sakit: Mengotomatisasi Ringkasan Medis, Rekomendasi Guideline, Operan Shift, Analisis Radiologi, dan Laporan Eksekutif."
            </p>
          </div>
        </div>

        {/* RIGHT LOGIN FORM */}
        <div className="flex flex-col justify-center p-6 md:p-12 lg:p-16 relative bg-[#0f172a]/60 text-left">
          
          {/* Mobile Branding (Only visible on small screens) */}
          <div className="lg:hidden flex items-center gap-4 mb-10">
            <div className="relative w-14 h-14 flex items-center justify-center">
               <div className="absolute inset-0 bg-emerald-500 rounded-full blur-[15px] opacity-30"></div>
               <img src="/logo.png" alt="LexiMed Logo" className="w-12 h-12 object-contain relative z-10 drop-shadow-md" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
              LexiMed<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">.ai</span>
            </h1>
          </div>

          <div className="space-y-2 mb-8">
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">Otentikasi</h2>
            <p className="text-slate-400 font-bold text-xs md:text-sm uppercase tracking-widest">Verifikasi Peran Kerja Anda</p>
          </div>

          {/* Notifikasi Status */}
          <AnimatePresence mode='wait'>
            {error && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="mb-6 p-4 bg-red-500/10 border-l-4 border-red-500 rounded-xl flex items-center gap-4 text-red-400 shadow-sm">
                <AlertTriangle size={20} className="shrink-0" />
                <span className="text-sm font-bold leading-tight">{error}</span>
              </motion.div>
            )}
            {loginSuccess && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mb-6 p-4 bg-emerald-500/10 border-l-4 border-emerald-500 rounded-xl flex items-center gap-4 text-emerald-400 shadow-sm">
                <CheckCircle2 size={20} className="shrink-0" />
                <span className="text-sm font-bold">Akses Diberikan! Memuat Workspace...</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-6 md:space-y-8">
            
            {/* ROLE SELECTOR (Responsive Grid) */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 p-1.5 bg-slate-900/50 rounded-2xl md:rounded-3xl border border-white/10">
              {[
                { id: 'dokter', icon: <Stethoscope size={18}/> },
                { id: 'perawat', icon: <Activity size={18}/> },
                { id: 'admin', icon: <Settings size={18}/> },
                { id: 'radiologi', icon: <FileSearch size={18}/> },
                { id: 'manajemen', icon: <PieChart size={18}/> },
                { id: 'asisten', icon: <Users size={18}/> }
              ].map((r) => (
                <button 
                  key={r.id} 
                  type="button" 
                  onClick={() => setRole(r.id)} 
                  className={`py-3 md:py-4 px-1 rounded-xl md:rounded-[20px] flex flex-col items-center gap-2 transition-all duration-300 ${
                    role === r.id 
                    ? 'bg-gradient-to-br from-blue-600 to-emerald-500 text-white shadow-lg shadow-blue-900/50 scale-100' 
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 scale-95'
                  }`}
                >
                  {r.icon}
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-tighter truncate w-full text-center">
                    {r.id}
                  </span>
                </button>
              ))}
            </div>

            {/* INPUT FIELDS */}
            <div className="space-y-4 md:space-y-5 text-left">
              <div className="relative group">
                <UserCircle2 className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={22} />
                <input 
                  name="username" type="text" placeholder={`ID ${role.toUpperCase()}`} required 
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 md:py-5 pl-14 pr-6 text-white outline-none focus:border-emerald-500 focus:bg-slate-900/80 transition-all font-bold placeholder:text-slate-600" 
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={22} />
                <input 
                  name="password" type={showPassword ? "text" : "password"} placeholder="KATA SANDI" required 
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 md:py-5 pl-14 pr-14 text-white outline-none focus:border-emerald-500 focus:bg-slate-900/80 transition-all font-bold tracking-widest placeholder:text-slate-600 placeholder:tracking-normal" 
                />
                <button 
                  type="button" onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <motion.button 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }} 
              type="submit" 
              disabled={loading || loginSuccess} 
              className={`w-full py-4 md:py-5 rounded-2xl font-black text-sm tracking-[0.2em] shadow-xl transition-all ${
                loginSuccess 
                ? 'bg-emerald-600 text-white shadow-emerald-900/50' 
                : 'bg-gradient-to-r from-blue-600 to-emerald-500 text-white shadow-blue-900/30 hover:shadow-emerald-500/40'
              }`}
            >
              {loading ? (
                <Loader2 className="animate-spin mx-auto" size={24} />
              ) : loginSuccess ? (
                'OTENTIKASI SUKSES'
              ) : (
                'SECURE LOGIN'
              )}
            </motion.button>
          </form>
        </div>
      </div>
    </div>
  );
}