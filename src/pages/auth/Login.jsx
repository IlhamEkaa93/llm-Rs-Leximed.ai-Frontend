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
        // --- PERBAIKAN: Rute disamakan persis dengan App.jsx ---
        const routes = {
          perawat: '/dashboard-perawat', // <-- INI YANG TADI SALAH KETIK (Kurang strip)
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
    if (user.includes('admin')) return 'Admin IT DARSI';
    if (user.includes('perawat')) return 'Ns. Siti Aminah, S.Kep';
    if (user.includes('rad')) return 'dr. Tirta, Sp.Rad';
    if (currentRole === 'asisten') return 'Asisten Ners Budi';
    return 'dr. Ilham Eka';
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0f1d] flex items-center justify-center p-4 md:p-8 overflow-hidden relative font-sans text-left">
      
      {/* Background Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], x: [0, 100, 0], y: [0, 50, 0], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px]"
        />
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 bg-white/5 backdrop-blur-3xl rounded-[40px] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden z-10">
        
        {/* LEFT BRANDING */}
        <div className="hidden lg:flex relative flex-col items-center justify-center p-16 bg-gradient-to-br from-blue-600/10 via-transparent border-r border-white/10">
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, type: "spring" }} className="relative group">
            <div className="absolute inset-0 bg-blue-500 rounded-full blur-[80px] opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
            <motion.img animate={{ y: [0, -15, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} src="/LOGO-1.png" alt="Logo RS UNS" className="w-56 h-56 object-contain relative z-20 drop-shadow-[0_0_40px_rgba(37,99,235,0.5)]" />
          </motion.div>
          <div className="mt-16 text-center space-y-6 relative z-20">
            <h1 className="text-6xl font-black text-white tracking-tighter">DARSI <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">SYSTEM</span></h1>
            <p className="text-slate-400 text-lg max-w-sm mx-auto italic underline decoration-blue-500/30 font-medium">Digital Assistant Rumah Sakit berbasis RAG & LLM.</p>
          </div>
        </div>

        {/* RIGHT LOGIN FORM */}
        <div className="flex flex-col justify-center p-8 md:p-16 relative bg-[#0f172a]/40 text-left">
          <div className="space-y-3 mb-10">
            <h2 className="text-4xl font-black text-white tracking-tight">Otentikasi</h2>
            <p className="text-slate-400 font-bold text-sm italic uppercase tracking-widest">Verifikasi Peran Kerja Anda</p>
          </div>

          {/* Notifikasi Status */}
          <AnimatePresence mode='wait'>
            {error && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="mb-8 p-4 bg-red-500/10 border-l-4 border-red-500 rounded-xl flex items-center gap-4 text-red-400 shadow-sm">
                <AlertTriangle size={20} className="shrink-0" />
                <span className="text-sm font-bold leading-tight">{error}</span>
              </motion.div>
            )}
            {loginSuccess && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mb-8 p-4 bg-emerald-500/10 border-l-4 border-emerald-500 rounded-xl flex items-center gap-4 text-emerald-400 shadow-sm">
                <CheckCircle2 size={20} className="shrink-0" />
                <span className="text-sm font-bold">Akses Diberikan! Memuat *Dashboard*...</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-8">
            
            {/* ROLE SELECTOR */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 p-1.5 bg-white/5 rounded-3xl border border-white/10">
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
                  className={`py-4 px-1 rounded-[20px] flex flex-col items-center gap-2 transition-all duration-300 ${
                    role === r.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 scale-100' 
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 scale-95'
                  }`}
                >
                  {r.icon}
                  <span className="text-[8px] font-black uppercase tracking-tighter truncate w-full text-center">
                    {r.id}
                  </span>
                </button>
              ))}
            </div>

            {/* INPUT FIELDS */}
            <div className="space-y-5 text-left">
              <div className="relative group">
                <UserCircle2 className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={22} />
                <input 
                  name="username" type="text" placeholder={`ID ${role.toUpperCase()}`} required 
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white outline-none focus:border-blue-500 focus:bg-slate-900/80 transition-all font-bold placeholder:text-slate-600" 
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={22} />
                <input 
                  name="password" type={showPassword ? "text" : "password"} placeholder="KATA SANDI" required 
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-5 pl-14 pr-14 text-white outline-none focus:border-blue-500 focus:bg-slate-900/80 transition-all font-bold tracking-widest placeholder:text-slate-600 placeholder:tracking-normal" 
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
              className={`w-full py-5 rounded-2xl font-black text-sm tracking-[0.2em] shadow-xl transition-all ${
                loginSuccess 
                ? 'bg-emerald-600 text-white shadow-emerald-900/50' 
                : 'bg-blue-600 text-white shadow-blue-900/50 hover:bg-blue-500'
              }`}
            >
              {loading ? (
                <Loader2 className="animate-spin mx-auto" size={24} />
              ) : loginSuccess ? (
                'OTENTIKASI SUKSES'
              ) : (
                'SIGN IN TO SYSTEM'
              )}
            </motion.button>
          </form>
        </div>
      </div>
    </div>
  );
}