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
        setTimeout(() => {
          if (role === "admin") navigate("/admin");
          else if (role === "dokter") navigate("/dokter");
          else if (role === "perawat") navigate("/perawat");
          else if (role === "radiologi") navigate("/radiologi");
          else if (role === "manajemen") navigate("/manajemen");
          else if (role === "asisten") navigate("/asisten");
          else navigate("/unauthorized");
        }, 300);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Gagal menghubungi server. Periksa koneksi internet."
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
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-blue-500 selection:text-white">
      
      {/* Background Orbs Animation */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }} 
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }} 
        className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[120px] pointer-events-none" 
      />
      <motion.div 
        animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }} 
        transition={{ duration: 15, repeat: Infinity, delay: 2, ease: "linear" }} 
        className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-emerald-600/30 rounded-full blur-[120px] pointer-events-none" 
      />

      {/* Main Login Card */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 60, damping: 15 }}
        className="w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/20 p-8 sm:p-10 relative z-10"
      >
        {/* Tombol Kembali ke Landing Page */}
        <button 
          onClick={() => navigate("/")}
          className="absolute top-6 left-6 text-slate-400 hover:text-slate-800 transition-colors flex items-center gap-1.5 font-bold text-xs bg-slate-100/50 hover:bg-slate-100 px-3 py-1.5 rounded-full"
        >
          <ArrowRight className="rotate-180" size={14} /> Beranda
        </button>

        {/* Logo & Header */}
        <div className="flex flex-col items-center mt-6 mb-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-5">
            <BrainCircuit className="text-white" size={32} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">LexiMed<span className="text-blue-600">.ai</span></h2>
          <p className="text-slate-500 font-medium mt-2 text-sm">Sistem Keputusan Klinis Vokasi</p>
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0, marginBottom: 0 }} 
              animate={{ opacity: 1, height: "auto", marginBottom: 20 }} 
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl flex items-start gap-3 text-sm font-medium overflow-hidden"
            >
              <AlertCircle className="shrink-0 mt-0.5" size={18} />
              <p className="leading-relaxed">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Input */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2 ml-1">Username</label>
            <input
              type="text"
              placeholder="Masukkan username"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl p-4 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2 ml-1">Kata Sandi</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl p-4 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-900 text-white font-bold rounded-2xl p-4 mt-4 hover:bg-blue-600 transition-all flex justify-center items-center gap-2 shadow-xl shadow-slate-900/10 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            {isLoading ? (
              <><Loader2 className="animate-spin" size={20} /> Memverifikasi...</>
            ) : (
              <>Masuk ke Sistem <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
            )}
          </button>
        </form>

        {/* Dummy Accounts Grid */}
        <div className="mt-10 pt-8 border-t border-slate-100">
          <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5">Jalan Pintas Akses Demo</p>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <button onClick={() => setDummyAccount("dokter")} type="button" className="flex flex-col items-center justify-center p-3 rounded-2xl bg-blue-50/50 hover:bg-blue-100 border border-blue-100 hover:border-blue-200 text-blue-600 transition-all group">
              <Stethoscope size={20} className="mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold">Dokter</span>
            </button>
            <button onClick={() => setDummyAccount("perawat")} type="button" className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-50/50 hover:bg-emerald-100 border border-emerald-100 hover:border-emerald-200 text-emerald-600 transition-all group">
              <Activity size={20} className="mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold">Perawat</span>
            </button>
            <button onClick={() => setDummyAccount("radiologi")} type="button" className="flex flex-col items-center justify-center p-3 rounded-2xl bg-purple-50/50 hover:bg-purple-100 border border-purple-100 hover:border-purple-200 text-purple-600 transition-all group">
              <Microscope size={20} className="mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold">Radiologi</span>
            </button>
            <button onClick={() => setDummyAccount("manajemen")} type="button" className="flex flex-col items-center justify-center p-3 rounded-2xl bg-amber-50/50 hover:bg-amber-100 border border-amber-100 hover:border-amber-200 text-amber-600 transition-all group">
              <LineChart size={20} className="mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold">Manajemen</span>
            </button>
            <button onClick={() => setDummyAccount("asisten")} type="button" className="flex flex-col items-center justify-center p-3 rounded-2xl bg-indigo-50/50 hover:bg-indigo-100 border border-indigo-100 hover:border-indigo-200 text-indigo-600 transition-all group">
              <BrainCircuit size={20} className="mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold">Asisten AI</span>
            </button>
            <button onClick={() => setDummyAccount("admin")} type="button" className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-800 text-white hover:bg-slate-900 transition-all shadow-lg shadow-slate-900/20 group">
              <Lock size={20} className="mb-2 group-hover:scale-110 transition-transform text-slate-300" />
              <span className="text-[10px] font-bold">Admin IT</span>
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
};

export default Login;
