import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";
import { 
  BrainCircuit, 
  Stethoscope, 
  Activity, 
  Microscope, 
  LineChart, 
  Lock, 
  ArrowRight, 
  Loader2,
  AlertCircle
} from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await api.post("/token", { username, password });
      
      if (response.data.success) {
        localStorage.setItem("access_token", response.data.access_token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        const role = response.data.user.role;
        // Animasi transisi sebelum pindah halaman
        setTimeout(() => {
          if (role === "admin") navigate("/admin");
          else if (role === "dokter") navigate("/dokter");
          else if (role === "perawat") navigate("/perawat");
          else if (role === "radiologi") navigate("/radiologi");
          else if (role === "manajemen") navigate("/manajemen");
          else if (role === "asisten") navigate("/asisten");
          else navigate("/unauthorized");
        }, 500);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Gagal menghubungi server. Periksa koneksi internet Anda."
      );
      setIsLoading(false);
    }
  };

  const setDummyAccount = (role) => {
    setError("");
    switch (role) {
      case "dokter":
        setUsername("dokter1");
        setPassword("password");
        break;
      case "perawat":
        setUsername("perawat1");
        setPassword("password");
        break;
      case "radiologi":
        setUsername("radiologi1");
        setPassword("password");
        break;
      case "manajemen":
        setUsername("manajemen1");
        setPassword("password");
        break;
      case "asisten":
        setUsername("asisten1");
        setPassword("password");
        break;
      case "admin":
        setUsername("admin1");
        setPassword("password");
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans selection:bg-blue-500 selection:text-white">
      
      {/* ===== SISI KIRI: BRANDING & ANIMASI (Hidden di HP) ===== */}
      <div className="hidden lg:flex w-1/2 relative bg-slate-900 overflow-hidden items-center justify-center flex-col p-12 text-center">
        {/* Animated Background Orbs */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }} 
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }} 
          className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }} 
          transition={{ duration: 20, repeat: Infinity, delay: 2, ease: "linear" }} 
          className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-emerald-600/20 rounded-full blur-[120px]" 
        />

        {/* Branding Content */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-emerald-400 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/40 mb-8">
            <BrainCircuit className="text-white w-12 h-12" />
          </div>
          
          <h1 className="text-5xl font-black text-white tracking-tight mb-6">
            LexiMed<span className="text-blue-400">.ai</span>
          </h1>
          
          <p className="text-slate-300 text-lg leading-relaxed max-w-md font-medium">
            Sistem pendukung keputusan klinis berbasis AI untuk mempercepat alur kerja tenaga medis vokasi.
          </p>

          <div className="mt-16 grid grid-cols-2 gap-4 opacity-80">
            <div className="flex items-center gap-3 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 backdrop-blur-md">
              <ShieldCheck className="text-emerald-400" size={24} />
              <span className="text-sm text-slate-300 font-semibold text-left">Terjamin Keamanannya</span>
            </div>
            <div className="flex items-center gap-3 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 backdrop-blur-md">
              <Zap className="text-blue-400" size={24} />
              <span className="text-sm text-slate-300 font-semibold text-left">Super Cepat & Akurat</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== SISI KANAN: FORM LOGIN ===== */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-24 bg-white relative">
        {/* Tombol Kembali (Mobile Only) */}
        <button 
          onClick={() => navigate("/")}
          className="absolute top-6 left-6 lg:top-12 lg:left-12 text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-2 font-semibold text-sm"
        >
          <ArrowRight className="rotate-180" size={16} /> Kembali
        </button>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Header Form */}
          <div className="mb-10 text-center lg:text-left">
            <div className="lg:hidden w-16 h-16 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 mx-auto mb-6">
              <BrainCircuit className="text-white" size={32} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Selamat Datang,</h2>
            <p className="text-slate-500">Silakan masuk menggunakan kredensial Anda.</p>
          </div>

          {/* Alert Error */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10, height: 0 }} 
                animate={{ opacity: 1, y: 0, height: "auto" }} 
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="mb-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-start gap-3 text-sm font-medium"
              >
                <AlertCircle className="shrink-0 mt-0.5" size={18} />
                <p>{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Input */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Username</label>
              <input
                type="text"
                placeholder="Contoh: dokter1"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-4 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Kata Sandi</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-4 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 text-white font-bold rounded-xl p-4 mt-2 hover:bg-blue-600 transition-all flex justify-center items-center gap-2 shadow-xl shadow-slate-900/10 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <><Loader2 className="animate-spin" size={20} /> Memverifikasi...</>
              ) : (
                <><Lock size={18} /> Masuk ke Dashboard</>
              )}
            </button>
          </form>

          {/* Tombol Dummy Account (Untuk Demo/Testing) */}
          <div className="mt-12 pt-8 border-t border-slate-100">
            <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Jalan Pintas Akses Demo</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <button onClick={() => setDummyAccount("dokter")} type="button" className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 text-slate-600 hover:text-blue-600 transition-all group">
                <Stethoscope size={20} className="mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">Dokter</span>
              </button>
              <button onClick={() => setDummyAccount("perawat")} type="button" className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 text-slate-600 hover:text-emerald-600 transition-all group">
                <Activity size={20} className="mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">Perawat</span>
              </button>
              <button onClick={() => setDummyAccount("radiologi")} type="button" className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-100 hover:border-purple-200 text-slate-600 hover:text-purple-600 transition-all group">
                <Microscope size={20} className="mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">Radiologi</span>
              </button>
              <button onClick={() => setDummyAccount("manajemen")} type="button" className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-100 hover:border-amber-200 text-slate-600 hover:text-amber-600 transition-all group">
                <LineChart size={20} className="mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">Manajemen</span>
              </button>
              <button onClick={() => setDummyAccount("asisten")} type="button" className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 text-slate-600 hover:text-indigo-600 transition-all group">
                <BrainCircuit size={20} className="mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">Asisten AI</span>
              </button>
              <button onClick={() => setDummyAccount("admin")} type="button" className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 group">
                <Lock size={20} className="mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">Admin IT</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  );
};

export default Login;
