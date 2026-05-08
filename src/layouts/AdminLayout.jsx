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
    
    // --- SECTION MANAJEMEN ---
    { name: 'Executive View', path: '/dashboard-manajemen', icon: <TrendingUp size={20} />, roles: ['manajemen'] },

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
          width: isMobile ? (isSidebarOpen ? 280 : 0) : (isSidebarOpen ? 280 : 95),
          x: isMobile ? (isSidebarOpen ? 0 : -280) : 0
        }}
        transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
        className={`bg-[#0f172a] text-white flex flex-col shadow-2xl z-50 overflow-hidden ${isMobile ? 'fixed h-full' : 'relative shrink-0'}`}
      >
        {/* LOGO */}
        <div className="p-6 flex items-center gap-4 border-b border-slate-800/50 h-[90px] shrink-0 justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0 border border-blue-400/20">
              <img src="/LOGO-1.png" alt="Logo" className="w-7 h-7 object-contain" />
            </div>
            {(isSidebarOpen || isMobile) && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col overflow-hidden whitespace-nowrap text-left">
                <span className="font-black tracking-tighter text-xl leading-none uppercase">DARSI <span className="text-blue-500">SYSTEM</span></span>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1 italic">RS Intelligence</span>
              </motion.div>
            )}
          </div>
          {isMobile && (
            <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-white"><X size={24} /></button>
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
                    ${isActive ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/40' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'}`}
                >
                  <div className={`p-2.5 rounded-xl shrink-0 transition-all ${isActive ? 'bg-white/20' : 'bg-slate-800 group-hover:bg-slate-700'}`}>
                    {item.icon}
                  </div>
                  {(isSidebarOpen || isMobile) && <span className="font-bold text-sm whitespace-nowrap">{item.name}</span>}
                  {isActive && (isSidebarOpen || isMobile) && <ChevronRight size={14} className="ml-auto opacity-50" />}
                </motion.div>
              );
            })}
        </nav>

        {/* SETTINGS & LOGOUT */}
        <div className="p-4 border-t border-slate-800/50 space-y-2 shrink-0 bg-[#0b1221]">
          <div 
            onClick={() => { navigate('/pengaturan'); if (isMobile) setIsSidebarOpen(false); }}
            className="flex items-center gap-4 p-3.5 rounded-2xl text-slate-400 hover:bg-slate-800/60 hover:text-white cursor-pointer transition-all group"
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
      <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc]">
        <header className="h-[90px] bg-white/80 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-6 md:px-10 sticky top-0 z-30 shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
             <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-600 border border-slate-200 shadow-sm bg-white"
             >
                {isMobile ? <Menu size={22} /> : <Command size={22} />}
             </motion.button>
             <div className="hidden md:flex items-center bg-slate-50 border border-slate-200 px-5 py-2.5 rounded-2xl gap-4 w-96 transition-all shadow-inner focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-50">
                <Search size={18} className="text-slate-400" />
                <input type="text" placeholder="Global search..." className="bg-transparent border-none outline-none text-sm w-full font-bold text-slate-700 placeholder:text-slate-300" />
             </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
               <Zap size={16} className="text-amber-500 fill-amber-500" />
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Neural v3.3</span>
            </div>
            <div className="text-right hidden sm:block leading-tight">
              <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{user.name}</p>
              <div className="flex items-center justify-end gap-1.5 mt-1">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{user.role} • ONLINE</p>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg border-2 border-white hover:rotate-6 transition-transform cursor-pointer shadow-blue-200">
              <User size={24} />
            </div>
          </div>
        </header>

        {/* --- MAIN CONTENT AREA --- */}
        <main className="flex-1 overflow-y-auto p-4 md:p-10 hide-scrollbar bg-[#f8fafc]">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="max-w-7xl mx-auto h-full"
            >
              {/* KUNCI PERBAIKAN: GUNAKAN <Outlet /> */}
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}