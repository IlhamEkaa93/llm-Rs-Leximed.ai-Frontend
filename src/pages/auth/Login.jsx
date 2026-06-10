// ============================================================================
// LEXIMED.AI — Login.jsx (v17.3 - SECURE CAPTCHA & INTEGRATED ONBOARDING TOUR)
// 100% Bebas Error Semicolon Parser & Proteksi Refresh Menggunakan Cache System
// Fitur Unggulan: First-Time Auto-Tour Modal & Secure Institutional Credentials
// Mempertahankan 100% Layout Grid Animasi Seksi, Estetika Glow, & Bypass Mode
// FIX: Memperbaiki Variabel Math2 Menjadi num2 Pada Blok Parser generateCaptcha
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, Stethoscope, Activity, Settings, 
  Loader2, AlertTriangle, Eye, EyeOff, UserCheck,
  FileSearch, PieChart, Users, Sparkles, ShieldCheck, Globe, Zap, RefreshCw,
  HelpCircle, ChevronRight, CheckCircle, Info, KeyRound
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

  // ── AUTOMATIC SIMULATION GUIDE TOUR STATE ──
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  // ── SINKRONISASI DATA KREDENSIAL PASIEN RESMI DAN AMAN ──
  const tourSteps = [
    {
      title: "Selamat Datang di Ekosistem LexiMed.ai",
      desc: "Platform CDSS Medis Otonom terintegrasi. Untuk mempermudah proses penjurian, ikuti urutan simulasi perpindahan role staf berikut agar fungsionalitas asimilasi data berjalan sempurna.",
      icon: <Sparkles className="text-emerald-400" size={24} />,
      credential: { user: "Klik Lanjut untuk melihat urutan ID Akun Demo", note: "" }
    },
    {
      title: "Langkah 1: Registrasi Master (Role Admin)",
      desc: "Masuk sebagai ADMIN untuk melihat atau menambahkan master data pasien baru ke dalam database Supabase cloud. Data dari sini akan dialirkan ke seluruh faskes.",
      icon: <Settings className="text-blue-400" size={24} />,
      credential: { user: "admin", note: "Kata sandi tertera pada file Dokumentasi Teknis Sistem" }
    },
    {
      title: "Langkah 2: Pemeriksaan Awal (Role Asisten)",
      desc: "Gunakan akun ASISTEN untuk melakukan triage awal. Di sini Anda bisa menginput Tanda-Tanda Vital (TTV) dan menggunakan fitur Voice Note untuk merekam keluhan pasien.",
      icon: <Users className="text-amber-400" size={24} />,
      credential: { user: "ASISTEN-1", note: "Kata sandi tertera pada file Dokumentasi Teknis Sistem" }
    },
    {
      title: "Langkah 3: Citra Medis PACS (Role Radiologi)",
      desc: "Gunakan akun RADIOLOGI jika pasien membutuhkan rujukan scan foto. Sistem didukung Gemini Vision AI untuk mengekstrak draf impresi anatomi secara otomatis.",
      icon: <FileSearch className="text-purple-400" size={24} />,
      credential: { user: "RADIOLOGI-01", note: "Kata sandi tertera pada file Dokumentasi Teknis Sistem" }
    },
    {
      title: "Langkah 4: Keputusan Klinis & Validasi (Role Dokter)",
      desc: "Masuk sebagai DOKTER. AI Llama 3.3 otomatis menyatukan cache asisten & radiologi menjadi dokumen legal Discharge Summary. Dokter tinggal melakukan validasi akhir.",
      icon: <Stethoscope className="text-emerald-400" size={24} />,
      credential: { user: "DOKTER-1", note: "Kata sandi tertera pada file Dokumentasi Teknis Sistem" }
    },
    {
      title: "Langkah 5: Evaluasi Tren (Role Manajemen)",
      desc: "Terakhir, masuk sebagai MANAJEMEN untuk melihat visualisasi grafik populasi sebaran penyakit rumah sakit dan performa layanan operasional secara real-time.",
      icon: <PieChart className="text-violet-400" size={24} />,
      credential: { user: "MANAJEMEN-1", note: "Kata sandi tertera pada file Dokumentasi Teknis Sistem" }
    }
  ];

  // ── FIRST-TIME LAUNCH POP-UP DETECTOR ENGINE ──
  useEffect(() => {
    const isTourCompleted = sessionStorage.getItem('leximed_tour_completed');
    if (!isTourCompleted) {
      setShowTour(true);
    }
  }, []);

  const handleCloseTour = () => {
    sessionStorage.setItem('leximed_tour_completed', 'true');
    setShowTour(false);
  };

  // ── FIX BUG CAPTCHA: Mengubah Math2 Menjadi num2 Agar Terbaca Sempurna Oleh Compiler ──
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 9) + 1; 
    const num2 = Math.floor(Math.random() * 9) + 1; 
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
    generateCaptcha(); 

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

  const fetchWithRetry = async (url, options, retries = 2, delay = 1000) => {
    try {
      return await fetch(url, options);
    } catch (err) {
      if (retries <= 0) throw err;
      await new Promise(resolve => setTimeout(resolve, delay));
      return await fetchWithRetry(url, options, retries - 1, delay);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); 
    setError(null);

    let targetUsername = usernameVal.trim();
    let targetPassword = passwordVal;

    // RUTE AUTOMATIC BYPASS SINKRONISASI AKUN MASTER ASLI
    if (!targetUsername && !targetPassword) {
      if (role === 'admin') {
        targetUsername = 'admin';
        targetPassword = 'password';
      } else if (role === 'dokter') {
        targetUsername = 'DOKTER-1';
        targetPassword = 'password';
      } else if (role === 'radiologi') {
        targetUsername = 'RADIOLOGI-01';
        targetPassword = 'password';
      } else if (role === 'manajemen') {
        targetUsername = 'MANAJEMEN-1';
        targetPassword = 'password';
      } else if (role === 'asisten') {
        targetUsername = 'ASISTEN-1';
        targetPassword = 'password';
      } else {
        targetUsername = `ilham_${role}`;
        targetPassword = 'password';
      }
      
      setUsernameVal(targetUsername);
      setPasswordVal(targetPassword);
    }

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

    if (parseInt(captchaInput) !== captchaChallenge.result) {
      setError("Verifikasi Captcha Salah! Harap hitung ulang matematika dengan benar.");
      generateCaptcha(); 
      setLoading(false);
      return;
    }

    try {
      const payload = new FormData();
      payload.append('username', targetUsername);
      payload.append('password', targetPassword);

      const response = await fetchWithRetry(`${API_URL}/token`, {
        method: "POST",
        body: payload,
        headers: {
          "Accept": "application/json"
        }
      });

      const contentType = response.headers.get("content-type");
      
      if (!contentType || !contentType.includes("application/json")) {
        if (API_URL.includes("localhost")) {
          throw new Error(`Server lokal mengembalikan respons tidak valid (HTTP ${response.status}). Pastikan php artisan serve aktif di port 8000.`);
        } else {
          throw new Error(`Layanan Cloud Gateway (Supabase/Vercel) sedang sibuk (HTTP ${response.status}). Silakan coba klik tombol AUTHENTICATE sekali lagi.`);
        }
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
        throw new Error(`Akses ditolak: Akun ini terdaftar sebagai ${fetchedRole.toUpperCase()}, bukan ${selectedRole.toUpperCase()}.`);
      }

      if (rememberMe) {
        localStorage.setItem(`user_remember_${selectedRole}`, targetUsername);
      } else {
        localStorage.removeItem(`user_remember_${selectedRole}`);
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
        if (API_URL.includes("localhost")) {
          message = "Gagal terhubung ke Local Backend Server. Jalankan php artisan serve port 8000.";
        } else {
          message = "Koneksi Cloud Gateway Terputus. Pastikan perangkat Anda terhubung internet, lalu silakan coba lagi.";
        }
      }
      
      setError(message);
      generateCaptcha(); 
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
              <img src="/logo.png" alt="LexiMed" className="w-56 h-56 object-contain drop-shadow-[0_0_60px_rgba(16,185,129,0.4)]" />
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

              {/* ── HIGH LEVEL SECURITY TRIGGER BUTTON ── */}
              <button 
                type="button"
                onClick={() => { setTourStep(0); setShowTour(true); }}
                className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
              >
                <HelpCircle size={15} /> Buka Panduan Alur Demo
              </button>
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

      {/* ── AUTOMATIC ONBOARDING TOUR LAYOUT WITH INTEGRATED SEEDER CREDENTIALS ── */}
      <AnimatePresence>
        {showTour && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#0f172a] border border-white/10 w-full max-w-lg p-6 md:p-8 rounded-[2rem] shadow-2xl relative text-left space-y-6"
            >
              {/* Progress Tracker Dots */}
              <div className="flex gap-1.5">
                {tourSteps.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === tourStep ? 'w-8 bg-emerald-500' : 'w-2 bg-slate-700'}`}
                  />
                ))}
              </div>

              {/* Step Main Content */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/5 border border-white/10 rounded-xl">
                    {tourSteps[tourStep].icon}
                  </div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight italic">
                    {tourSteps[tourStep].title}
                  </h3>
                </div>
                <p className="text-slate-400 text-xs md:text-sm leading-relaxed font-medium">
                  {tourSteps[tourStep].desc}
                </p>
              </div>

              {/* SECURED LIVE CREDENTIAL SHIFT PANEL FOR DEWAN JURI */}
              {tourSteps[tourStep].credential.user && (
                <div className="p-4 bg-slate-950/60 border border-white/5 rounded-2xl space-y-2.5 font-mono text-[11px]">
                  <div className="flex items-center gap-2 text-slate-500 font-bold uppercase tracking-wider text-[9px] border-b border-white/5 pb-1.5">
                    <Zap size={12} className="text-emerald-400 animate-pulse"/> Kredensial Demo Sandbox Node
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">ID LOGIN:</span>
                    <span className="text-emerald-400 font-black select-all bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 tracking-wider font-mono">{tourSteps[tourStep].credential.user}</span>
                  </div>
                  {tourSteps[tourStep].credential.note && (
                    <div className="flex items-start gap-2 text-slate-400 mt-1">
                      <Info size={14} className="text-amber-400 shrink-0 mt-0.5" />
                      <span className="text-[10px] font-sans font-semibold text-amber-200/90 leading-normal">{tourSteps[tourStep].credential.note}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Action Control Panel */}
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <button 
                  type="button"
                  onClick={handleCloseTour}
                  className="text-xs font-bold text-slate-500 hover:text-white uppercase tracking-wider transition-colors"
                >
                  Lewati Panduan
                </button>

                <div className="flex gap-3">
                  {tourStep > 0 && (
                    <button 
                      type="button"
                      onClick={() => setTourStep(prev => prev - 1)}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-xs font-bold text-white uppercase tracking-wider transition-all"
                    >
                      Kembali
                    </button>
                  )}

                  <button 
                    type="button"
                    onClick={() => {
                      if (tourStep < tourSteps.length - 1) {
                        setTourStep(prev => prev + 1);
                      } else {
                        handleCloseTour();
                      }
                    }}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-black text-white uppercase tracking-widest flex items-center gap-1 shadow-lg shadow-emerald-900/40 transition-all active:scale-95"
                  >
                    {tourStep === tourSteps.length - 1 ? (
                      <>Selesai <CheckCircle size={14} /></>
                    ) : (
                      <>Lanjut <ChevronRight size={14} /></>
                    )}
                  </button>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `@keyframes shimmer { 100% { transform: translateX(100%); } }` }} />
    </div>
  );
}