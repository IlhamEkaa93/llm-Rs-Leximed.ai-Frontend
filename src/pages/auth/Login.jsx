// ============================================================================
// LEXIMED.AI — Login.jsx (v15.1 - SHIELD SECURITY CAPTCHA & REMEMBER COMPACT)
// 100% Bebas Error Semicolon Parser & Proteksi Refresh Menggunakan Cache System
// Fitur Tambahan: Ingat Saya (Remember Me) & Keamanan Captcha Matematika Dinamis
// Mempertahankan 100% Layout Grid Animasi Seksi, Estetika Glow, & Bypass Mode
// FIX: Memperbaiki Import Ikon UserCheck Yang Rusak Mengakibatkan Crash Boundary
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, Stethoscope, Activity, Settings, 
  Loader2, AlertTriangle, Eye, EyeOff, UserCircle2, UserCheck,
  FileSearch, PieChart, Users, Sparkles, ShieldCheck, Globe, Zap, RefreshCw
} from 'lucide-react';

const API_URL = "https://lexi-med-ai-llm-rs-back-end.vercel.app/api";

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState('dokter'); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // State untuk melacak nilai input secara dinamis
  const [usernameVal, setUsernameVal] = useState('');
  const [passwordVal, setPasswordVal] = useState('');
  
  // ── REVISI DOSEN: STATE INGAT SAYA & CAPTCHA MATEMATIKA ──
  const [rememberMe, setRememberMe] = useState(false);
  const [captchaChallenge, setCaptchaChallenge] = useState({ num1: 0, num2: 0, result: 0 });
  const [captchaInput, setCaptchaInput] = useState('');

  // Fungsi Generator Captcha Matematika Acak Mandiri
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 9) + 1; // Angka 1-9
    const num2 = Math.floor(Math.random() * 9) + 1; // Angka 1-9
    setCaptchaChallenge({
      num1: num1,
      num2: num2,
      result: num1 + num2
    });
    setCaptchaInput('');
  };

  // Sinkronisasi form & load cache "Ingat Saya" saat inisialisasi halaman atau ganti role
  useEffect(() => {
    setError(null);
    generateCaptcha(); // Buat captcha baru setiap ganti role

    // Memeriksa apakah ada username yang tersimpan di localStorage untuk role aktif ini
    const savedUsername = localStorage.getItem(`leximed_remember_${role}`);
    if (savedUsername) {
      setUsernameVal(savedUsername);
      setRememberMe(true);
    } else {
      setUsernameVal('');
      setRememberMe(false);
    }
    setPasswordVal('');
  }, [role]);

  // Redirect otomatis jika sudah punya token aktif di browser
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    if (token && user) {
      try {
        const parsed = JSON.parse(user);
        const routes = {
          perawat: '/dashboard-perawat',
          admin: '/dashboard-admin',
          dokter: '/dashboard',
          radiologi: '/dashboard-radiologi',
          manajemen: '/dashboard-manajemen',
          asisten: '/dashboard-asisten'
        };
        navigate(routes[parsed.role] || '/', { replace: true });
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      }
    }
  }, [navigate]);

  useEffect(() => {
    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); 
    setError(null);

    // Ambil nilai dari input state lokal
    let targetUsername = usernameVal.trim();
    let targetPassword = passwordVal;

    // 🚀 FITUR AUTOMATIC BYPASS: Jika input kosong, otomatis inject akun seeder lokal sesuai role aktif
    if (!targetUsername && !targetPassword) {
      if (role === 'admin') {
        targetUsername = 'admin_darsi';
        targetPassword = 'password';
      } else if (role === 'dokter') {
        targetUsername = 'ilham_dokter';
        targetPassword = 'password';
      } else {
        targetUsername = `ilham_${role}`;
        targetPassword = 'password';
      }
      
      // Update visual form agar dosen melihat datanya terketik otomatis
      setUsernameVal(targetUsername);
      setPasswordVal(targetPassword);
    }

    // Validasi akhir setelah pengecekan bypass
    if (!targetUsername) {
      setError("Username tidak boleh kosong.");
      setLoading(false);
      return;
    }
    if (!targetPassword) {
      setError("Kata sandi tidak boleh kosong.");
      setLoading(false);
      return;
    }

    // ── REVISI VALIDASI: VALIDASI INPUT CAPTCHA MATEMATIKA DOSEN ──
    if (parseInt(captchaInput) !== captchaChallenge.result) {
      setError("Verifikasi Captcha Salah! Harap hitung ulang matematika dengan benar.");
      generateCaptcha(); // Paksa acak ulang captcha jika salah
      setLoading(false);
      return;
    }

    try {
      const payload = new FormData();
      payload.append('username', targetUsername);
      payload.append('password', targetPassword);

      const response = await fetch(`${API_URL}/token`, {
        method: "POST",
        body: payload,
        headers: {
          "Accept": "application/json"
        }
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(
          `Server mengembalikan respons tidak valid (HTTP ${response.status}). ` +
          `Pastikan backend Laravel lokal (php artisan serve) Anda port 8000 aktif.`
        );
      }

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Username atau Kata Sandi salah.");
      }

      if (!data.user) {
        throw new Error("Gagal memuat data pengguna dari server.");
      }

      const fetchedRole = data.user.role ? data.user.role.toLowerCase() : '';
      const selectedRole = role.toLowerCase();

      if (!fetchedRole) {
        throw new Error("Data role pengguna tidak ditemukan di server.");
      }

      if (fetchedRole !== selectedRole) {
        throw new Error(
          `Akses ditolak: Akun ini terdaftar sebagai ${fetchedRole.toUpperCase()}, ` +
          `bukan ${selectedRole.toUpperCase()}.`
        );
      }

      // ── LOGIK TINDAKAN: MANAJEMEN CACHE INGAT SAYA (REMEMBER ME) ──
      if (rememberMe) {
        localStorage.setItem(`leximed_remember_${selectedRole}`, targetUsername);
      } else {
        localStorage.removeItem(`leximed_remember_${selectedRole}`);
      }

      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify({
        id: targetUsername,
        name: data.user.name || targetUsername,
        role: fetchedRole, 
      }));

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
        navigate(routes[fetchedRole] || '/', { replace: true });
      }, 1500);

    } catch (err) {
      console.error("Login Error:", err);
      let message = err.message;
      if (err.message === "Failed to fetch") {
        message = "Gagal terhubung ke Local Backend Server. Jalankan php artisan serve port 8000.";
      }
      setError(message);
      generateCaptcha(); // Reset captcha jika login gagal dari backend
      setLoading(false);
    }
  };

  const roleList = [
    { id: 'dokter', icon: <Stethoscope size={20}/>, label: 'Dokter' },
    { id: 'perawat', icon: <Activity size={20}/>, label: 'Perawat' },
    { id: 'admin', icon: <Settings size={20}/>, label: 'Admin' },
    { id: 'radiologi', icon: <FileSearch size={20}/>, label: 'Radio' },
    { id: 'manajemen', icon: <PieChart size={20}/>, label: 'Manager' },
    { id: 'asisten', icon: <Users size={20}/>, label: 'Asisten' }
  ];

  return (
    <div className="min-h-screen w-full bg-[#020617] flex items-center justify-center p-4 md:p-10 overflow-hidden relative font-sans antialiased selection:bg-emerald-500/30 text-left">
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ x: mousePos.x / 20, y: mousePos.y / 20 }}
          className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-600/20 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ x: -mousePos.x / 20, y: -mousePos.y / 20 }}
          className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]"
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 bg-white/[0.02] backdrop-blur-3xl rounded-[2.5rem] md:rounded-[3.5rem] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden z-10 relative"
      >
        {/* LEFT PANEL */}
        <div className="hidden lg:flex relative flex-col justify-between p-16 bg-gradient-to-br from-emerald-500/10 via-transparent to-blue-500/5 border-r border-white/5">
          <div className="space-y-6">
            <motion.div 
              initial={{ x: -20, opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }}
              className="inline-flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full"
            >
              <Zap size={14} className="text-emerald-400 fill-emerald-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Enterprise Medical AI</span>
            </motion.div>
            
            <h1 className="text-7xl font-black text-white tracking-tighter italic leading-none">
              LexiMed<span className="text-emerald-500">.ai</span>
            </h1>
            
            <p className="text-slate-400 text-lg leading-relaxed font-medium max-w-md">
              Sistem Otomasi Klinis Terintegrasi. Mengubah data menjadi keputusan medis yang presisi dengan kekuatan <span className="text-white font-bold tracking-tight">Large Language Models.</span>
            </p>
          </div>

          <div className="relative h-64 flex items-center justify-center">
            <motion.div animate={{ rotate: [0, 5, 0, -5, 0], y: [0, -15, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
              <img src="/logo.png" className="w-56 h-56 object-contain drop-shadow-[0_0_60px_rgba(16,185,129,0.4)]" alt="LexiMed" />
            </motion.div>
            <div className="absolute w-72 h-72 border border-emerald-500/20 rounded-full animate-pulse"></div>
          </div>

          <div className="flex items-center gap-6 text-slate-500 font-bold text-[10px] tracking-widest uppercase">
            <div className="flex items-center gap-2 italic"><ShieldCheck size={14}/> Secured by AES-256</div>
            <div className="flex items-center gap-2 italic"><Globe size={14}/> Cloud Infrastructure</div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="p-6 md:p-12 lg:p-20 flex flex-col justify-center bg-[#0f172a]/40 relative">
          <div className="lg:hidden flex flex-col items-center gap-4 mb-12 text-center">
            <motion.img animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }} src="/logo.png" className="w-20 h-20 drop-shadow-2xl" />
            <h1 className="text-5xl font-black text-white tracking-tighter italic">LexiMed<span className="text-emerald-500">.ai</span></h1>
          </div>

          <div className="space-y-3 mb-10 text-center lg:text-left">
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase italic">Login</h2>
            <p className="text-slate-500 font-black text-xs md:text-sm uppercase tracking-[0.4em] flex items-center justify-center lg:justify-start gap-2">
              <Sparkles size={16} className="text-emerald-500" /> Gerbang Otoritas Medis
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-white/5 rounded-[2.5rem] border border-white/5">
              {roleList.map((r) => (
                <button 
                  key={r.id} 
                  type="button" 
                  onClick={() => { setRole(r.id); }}
                  className={`flex flex-col items-center gap-2 py-5 rounded-2xl transition-all duration-500 relative group overflow-hidden ${
                    role === r.id 
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40' 
                      : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className={`${role === r.id ? 'scale-110' : 'scale-100 group-hover:scale-110'} transition-transform`}>
                    {r.icon}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-tighter">{r.label}</span>
                  {role === r.id && <motion.div layoutId="activeRole" className="absolute inset-0 bg-white/10" />}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                  <UserCheck size={22} />
                </div>
                <input 
                  name="username" 
                  type="text" 
                  value={usernameVal}
                  onChange={(e) => setUsernameVal(e.target.value)}
                  placeholder={`ID ${role.toUpperCase()}`} 
                  required={usernameVal === '' && passwordVal === '' ? false : true}
                  autoComplete="username"
                  className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] py-6 pl-16 pr-6 text-white outline-none focus:border-emerald-500 focus:bg-white/10 transition-all font-black text-lg placeholder:text-slate-700 placeholder:font-bold" 
                />
              </div>

              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                  <Lock size={22} />
                </div>
                <input 
                  name="password" 
                  type={showPassword ? "text" : "password"} 
                  value={passwordVal}
                  onChange={(e) => setPasswordVal(e.target.value)}
                  placeholder="KATA SANDI" 
                  required={usernameVal === '' && passwordVal === '' ? false : true}
                  autoComplete="current-password"
                  className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] py-6 pl-16 pr-16 text-white outline-none focus:border-emerald-500 focus:bg-white/10 transition-all font-black text-lg tracking-[0.2em] placeholder:text-slate-700 placeholder:tracking-normal placeholder:font-bold" 
                />
                <button 
                  type="button" 
                  onClick={() => { setShowPassword(!showPassword); }}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              </div>

              {/* INTEGRASI CHECKBOX INGAT SAYA (REMEMBER ME) */}
              <div className="flex items-center justify-between px-2 py-1">
                <label className="flex items-center gap-3 cursor-pointer select-none group text-left">
                  <input 
                    type="checkbox" 
                    checked={rememberMe} 
                    onChange={(e) => setRememberMe(e.target.checked)} 
                    className="w-4 h-4 rounded border-white/10 bg-white/5 accent-emerald-500 cursor-pointer" 
                  />
                  <span className="text-xs font-black text-slate-400 group-hover:text-slate-300 uppercase tracking-widest transition-colors">Ingat Saya</span>
                </label>
              </div>

              {/* DOCKING PANEL SECURE BOT CAPTCHA MATEMATIKA DOSEN */}
              <div className="p-4 bg-white/[0.02] border border-white/10 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-emerald-400 font-black text-lg tracking-wider shadow-inner select-none">
                    {captchaChallenge.num1} + {captchaChallenge.num2} = ?
                  </div>
                  <button 
                    type="button" 
                    onClick={generateCaptcha} 
                    title="Acak Ulang Angka Captcha" 
                    className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-slate-400 hover:text-emerald-400 transition-all active:scale-95 shrink-0"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>
                <input 
                  type="number" 
                  value={captchaInput} 
                  onChange={(e) => setCaptchaInput(e.target.value)} 
                  placeholder="HASIL" 
                  required={usernameVal !== '' || passwordVal !== ''}
                  className="w-28 bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white font-black text-center text-lg outline-none focus:border-emerald-500 focus:bg-white/10 transition-all placeholder:text-slate-700 placeholder:font-bold" 
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0 }} 
                  className="p-5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-black rounded-2xl flex items-start gap-4 italic uppercase tracking-wider text-left"
                >
                  <AlertTriangle size={20} className="shrink-0 mt-0.5" /> 
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button 
              whileHover={{ scale: 1.02, boxShadow: "0 20px 40px -10px rgba(16,185,129,0.3)" }} 
              whileTap={{ scale: 0.98 }} 
              disabled={loading || loginSuccess}
              type="submit"
              className={`w-full py-6 rounded-[1.5rem] font-black text-lg tracking-[0.3em] transition-all relative overflow-hidden group ${
                loginSuccess 
                  ? 'bg-emerald-500 text-white cursor-default' 
                  : loading 
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-white text-slate-950 hover:bg-emerald-400'
              }`}
            >
              <span className="relative z-10">
                {loading 
                  ? <Loader2 className="animate-spin mx-auto" size={28} /> 
                  : loginSuccess 
                    ? 'ACCESS GRANTED ✓' 
                    : 'AUTHENTICATE'
                }
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
            </motion.button>
          </form>

          <div className="hidden lg:block mt-12 text-center text-slate-600 font-bold text-[10px] tracking-widest uppercase italic">
            &copy; 2026 LexiMed Intelligence
          </div>
        </div>
      </motion.div>

      <style dangerouslySetInnerHTML={{ __html: `@keyframes shimmer { 100% { transform: translateX(100%); } }` }} />
    </div>
  );
}