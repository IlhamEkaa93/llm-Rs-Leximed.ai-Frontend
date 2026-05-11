import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom'; 
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, FileSearch, ClipboardList, FileText, 
  BookOpen, CheckSquare, Activity, FileEdit, 
  Users, Database, History, LogOut, 
  User, Search, Settings, ChevronRight, Sparkles,
  Command, UserPlus, BrainCircuit, TrendingUp,
  Stethoscope, Menu, X, ShieldCheck, FileSignature,
  Cpu, Bell, Zap
} from 'lucide-react';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // 1. Responsivitas Otomatis
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 2. Auth Guard & Load User
  useEffect(() => {
    const data = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    
    if (!data || !token) {
      navigate('/login', { replace: true });
    } else {
      try {
        setUser(JSON.parse(data));
      } catch (err) {
        localStorage.clear();
        navigate('/login', { replace: true });
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login', { replace: true });
  };

  const getDashboardPath = () => {
    const role = user?.role;
    const paths = {
      admin: '/dashboard-admin',
      asisten: '/dashboard-asisten',
      perawat: '/dashboard-perawat',
      radiologi: '/dashboard-radiologi',
      manajemen: '/dashboard-manajemen'
    };
    return paths[role] || '/dashboard'; 
  };

  // 3. DEFINISI MENU LENGKAP
  const sidebarMenu = [
    { name: 'Dashboard', path: getDashboardPath(), icon: <LayoutDashboard size={20} />, roles: ['dokter', 'perawat', 'admin', 'radiologi', 'asisten', 'manajemen'] },
    
    // --- SECTION ADMIN ---
    { name: 'Registrasi Pasien', path: '/admin/input-pasien', icon: <UserPlus size={20} />, roles: ['admin'] },
    { name: 'Kelola Pengguna', path: '/kelola-user', icon: <Users size={20} />, roles: ['admin'] },
    { name: 'Kelola Knowledge', path: '/kelola-knowledge', icon: <Database size={20} />, roles: ['admin'] },
    { name: 'Audit Log AI', path: '/log', icon: <History size={20} />, roles: ['admin'] },
    { name: 'AI Governance', path: '/ai-governance', icon: <ShieldCheck size={20} />, roles: ['admin'] },
    
    // --- SECTION DOKTER ---
    { name: 'Input Klinis', path: '/input-klinis', icon: <Sparkles size={20} />, roles: ['dokter'] },
    { name: 'Data Rekam Medis', path: '/data-medis', icon: <FileSearch size={20} />, roles: ['dokter'] },
    { name: 'Pedoman Klinis AI', path: '/pedoman', icon: <BookOpen size={20} />, roles: ['dokter'] }, 
    { name: 'Ringkasan Medis AI', path: '/ringkasan', icon: <ClipboardList size={20} />, roles: ['dokter'] },
    { name: 'Resume Medis', path: '/resume', icon: <FileText size={20} />, roles: ['dokter'] },
    { name: 'Approve Final', path: '/approve', icon: <CheckSquare size={20} />, roles: ['dokter'] },
    
    // --- SECTION ASISTEN ---
    { name: 'Pemeriksaan Awal', path: '/asisten/input-pemeriksaan', icon: <Stethoscope size={20} />, roles: ['asisten'] },
    
    // --- SECTION PERAWAT ---
    { name: 'Tambah Catatan', path: '/tambah-catatan', icon: <FileEdit size={20} />, roles: ['perawat'] },
    { name: 'Ringkasan Shift AI', path: '/handover', icon: <Activity size={20} />, roles: ['perawat'] },
    { name: 'Draft Dokumentasi', path: '/draft-dokumentasi', icon: <BrainCircuit size={20} />, roles: ['perawat'] }, 
    { name: 'Verifikasi Laporan', path: '/validasi-ai', icon: <FileSignature size={20} />, roles: ['perawat'] },
    
    // --- SECTION RADIOLOGI ---
    { name: 'Input Radiologi', path: '/radiologi/input', icon: <Cpu size={20} />, roles: ['radiologi'] },
    { name: 'Analisis Radiologi', path: '/radiologi/analisis', icon: <Activity size={20} />, roles: ['radiologi'] },
    
    // --- SECTION UNIVERSAL ---
    { name: 'Arsip & Export', path: '/arsip-laporan', icon: <FileSearch size={20} />, roles: ['dokter', 'perawat', 'admin', 'radiologi', 'manajemen'] },
  ];

  if (!user) return null;

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans relative text-left">
      
      {/* MOBILE OVERLAY */}
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <motion.aside 
        initial={false}
        animate={{ 
          width: isMobile ? (isSidebarOpen ? 280 : 0) : (isSidebarOpen ? 280 : 90),
          x: isMobile ? (isSidebarOpen ? 0 : -280) : 0
        }}
        transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
        className={`bg-[#0b1120] text-white flex flex-col shadow-2xl z-50 overflow-hidden ${isMobile ? 'fixed h-full border-r border-slate-800' : 'relative shrink-0'}`}
      >
        {/* LOGO & BRANDING */}
        <div className="p-6 flex items-center gap-4 border-b border-slate-800/80 h-[90px] shrink-0 justify-between bg-[#0f172a]/50">
          <div className="flex items-center gap-4">
            {/* Logo Image with ambient glow */}
            <div className="relative w-10 h-10 flex items-center justify-center shrink-0 group cursor-pointer">
               <div className="absolute inset-0 bg-emerald-500 rounded-full blur-[12px] opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
               <img src="/logo.png" alt="LexiMed Logo" className="w-9 h-9 object-contain relative z-10 drop-shadow-md" />
            </div>
            
            {(isSidebarOpen || isMobile) && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col overflow-hidden whitespace-nowrap text-left">
                <span className="font-black tracking-tighter text-[22px] leading-none text-white">
                  LexiMed<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">.ai</span>
                </span>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">AI Healthcare</span>
              </motion.div>
            )}
          </div>
          {isMobile && (
            <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
          )}
        </div>

        {/* NAV MENU */}
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto hide-scrollbar">
          {sidebarMenu
            .filter(m => m.roles.includes(user.role))
            .map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <motion.div
                  key={item.path}
                  whileHover={{ x: 5 }}
                  onClick={() => {
                    navigate(item.path);
                    if (isMobile) setIsSidebarOpen(false);
                  }}
                  className={`flex items-center gap-4 p-3.5 rounded-2xl cursor-pointer transition-all duration-300 group
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-lg shadow-emerald-900/30 border border-emerald-500/20' 
                      : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                    }`}
                >
                  <div className={`p-2.5 rounded-xl shrink-0 transition-all ${isActive ? 'bg-white/20 text-white' : 'bg-slate-800/50 text-slate-400 group-hover:text-emerald-400 group-hover:bg-slate-800'}`}>
                    {item.icon}
                  </div>
                  {(isSidebarOpen || isMobile) && <span className="font-bold text-sm whitespace-nowrap">{item.name}</span>}
                  {isActive && (isSidebarOpen || isMobile) && <ChevronRight size={14} className="ml-auto opacity-70" />}
                </motion.div>
              );
            })}
        </nav>

        {/* SETTINGS & LOGOUT */}
        <div className="p-4 border-t border-slate-800/80 space-y-2 shrink-0 bg-[#070b14]">
          <div 
            onClick={() => { navigate('/pengaturan'); if (isMobile) setIsSidebarOpen(false); }}
            className="flex items-center gap-4 p-3.5 rounded-2xl text-slate-400 hover:bg-slate-800/60 hover:text-emerald-400 cursor-pointer transition-all group"
          >
            <Settings size={20} className="group-hover:rotate-90 transition-transform duration-500" />
            {(isSidebarOpen || isMobile) && <span className="font-bold text-sm">Pengaturan</span>}
          </div>
          <div 
            onClick={handleLogout}
            className="flex items-center gap-4 p-3.5 rounded-2xl text-red-400 hover:bg-red-500/10 cursor-pointer transition-all group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            {(isSidebarOpen || isMobile) && <span className="font-bold text-sm">Keluar Sistem</span>}
          </div>
        </div>
      </motion.aside>

      {/* TOPBAR & CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f4f7f9]">
        <header className="h-[90px] bg-white/70 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-4 md:px-10 sticky top-0 z-30 shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
             <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-600 border border-slate-200/50 shadow-sm bg-white"
             >
                {isMobile ? <Menu size={22} /> : <Command size={22} />}
             </motion.button>
             
             {/* Global Search (Desktop) */}
             <div className="hidden md:flex items-center bg-white border border-slate-200 px-5 py-3 rounded-2xl gap-4 w-80 lg:w-96 transition-all shadow-sm focus-within:border-emerald-300 focus-within:ring-4 focus-within:ring-emerald-50">
                <Search size={18} className="text-slate-400" />
                <input type="text" placeholder="Cari rekam medis, data pasien..." className="bg-transparent border-none outline-none text-sm w-full font-bold text-slate-700 placeholder:text-slate-300" />
             </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100/50">
               <Zap size={16} className="text-emerald-500 fill-emerald-500" />
               <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">LexiCore v1.0</span>
            </div>
            <div className="hidden sm:flex items-center justify-center p-3 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-blue-600 cursor-pointer transition-colors relative">
               <Bell size={20} />
               <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </div>
            <div className="text-right hidden md:block leading-tight border-l border-slate-200 pl-6">
              <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{user.name}</p>
              <div className="flex items-center justify-end gap-1.5 mt-1">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{user.role} • ONLINE</p>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg border-2 border-white hover:rotate-6 transition-transform cursor-pointer shadow-emerald-200">
              <User size={24} />
            </div>
          </div>
        </header>

        {/* --- MAIN CONTENT AREA --- */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 hide-scrollbar bg-[#f4f7f9] relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="max-w-7xl mx-auto h-full"
            >
              {/* Tempat merender konten halaman */}
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}