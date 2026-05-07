import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, FileSearch, ClipboardList, FileText, 
  BookOpen, CheckSquare, Activity, FileEdit, 
  Save, Users, Layout, Database, History, LogOut, 
  User, Search, Settings, ChevronRight, Sparkles,
  Command, UserPlus, FilePlus, BrainCircuit, TrendingUp // Tambah TrendingUp untuk Manajemen
} from 'lucide-react';

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const data = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    
    if (!data || !token) {
      navigate('/', { replace: true });
    } else {
      try {
        const parsedUser = JSON.parse(data);
        setUser(parsedUser);
      } catch (err) {
        localStorage.clear();
        navigate('/', { replace: true });
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/', { replace: true });
  };

  // Logika penentuan Dashboard berdasarkan Role (UPDATE: Tambah Manajemen)
  const getDashboardPath = () => {
    if (user?.role === 'perawat') return '/dashboardperawat';
    if (user?.role === 'admin') return '/dashboard-admin';
    if (user?.role === 'radiologi') return '/dashboard-radiologi'; 
    if (user?.role === 'manajemen') return '/dashboard-manajemen'; // <--- BARU
    return '/dashboard'; // Default untuk dokter
  };

  // Definisi Menu (Hanya tampil berdasarkan Role)
  const sidebarMenu = [
    // Dashboard standar untuk dokter, perawat, admin, dan radiologi
    { name: 'Dashboard', path: getDashboardPath(), icon: <LayoutDashboard size={20} />, roles: ['dokter', 'perawat', 'admin', 'radiologi'] },
    
    // Dashboard Khusus Eksekutif / Manajemen
    { name: 'Executive Dashboard', path: '/dashboard-manajemen', icon: <TrendingUp size={20} />, roles: ['manajemen'] },
    
    // Menu Khusus Admin
    { name: 'Registrasi Pasien', path: '/admin/input-pasien', icon: <UserPlus size={20} />, roles: ['admin'] },
    { name: 'Kelola Pengguna', path: '/kelola-user', icon: <Users size={20} />, roles: ['admin'] },
    { name: 'Kelola Template', path: '/kelola-template', icon: <Layout size={20} />, roles: ['admin'] },
    { name: 'Kelola Knowledge', path: '/kelola-knowledge', icon: <Database size={20} />, roles: ['admin'] },
    { name: 'Audit Log AI', path: '/log', icon: <History size={20} />, roles: ['admin'] },

    // Menu Khusus Dokter
    { name: 'Input Klinis AI', path: '/dokter/input', icon: <Sparkles size={20} />, roles: ['dokter'] },
    { name: 'Data Rekam Medis', path: '/data-medis', icon: <FileSearch size={20} />, roles: ['dokter'] },
    { name: 'Ringkasan Medis AI', path: '/ringkasan', icon: <ClipboardList size={20} />, roles: ['dokter'] },
    { name: 'Resume Medis', path: '/resume', icon: <FileText size={20} />, roles: ['dokter'] },
    { name: 'Pedoman Klinis', path: '/pedoman', icon: <BookOpen size={20} />, roles: ['dokter'] },
    { name: 'Approve Final', path: '/approve', icon: <CheckSquare size={20} />, roles: ['dokter'] },

    // Menu Khusus Perawat
    { name: 'Handover Shift AI', path: '/handover', icon: <Activity size={20} />, roles: ['perawat'] },
    { name: 'Tambah Catatan', path: '/tambah-catatan', icon: <FileEdit size={20} />, roles: ['perawat'] },
    { name: 'Simpan Handover', path: '/simpan-handover', icon: <Save size={20} />, roles: ['perawat'] },

    // Menu Khusus Radiologi
    { name: 'Input Pemeriksaan', path: '/radiologi/input', icon: <FilePlus size={20} />, roles: ['radiologi'] },
    { name: 'AI Analisis & Draft', path: '/radiologi/analisis', icon: <BrainCircuit size={20} />, roles: ['radiologi'] },
  ];

  if (!user) return null;

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans">
      {/* SIDEBAR */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="bg-[#0f172a] text-white flex flex-col shadow-2xl z-50 relative overflow-hidden"
      >
        <div className="p-6 flex items-center gap-4 border-b border-slate-800/50 mb-4 h-[90px] relative z-10">
          <motion.div 
            whileHover={{ rotate: 180 }}
            className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/40 shrink-0"
          >
            <img src="/LOGO-1.png" alt="Logo" className="w-7 h-7 object-contain" />
          </motion.div>
          {isSidebarOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col overflow-hidden whitespace-nowrap">
              <span className="font-black tracking-tighter text-lg leading-none text-white">DARSI <span className="text-blue-500">SYSTEM</span></span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">RS Intelligence</span>
            </motion.div>
          )}
        </div>

        {/* List Menu */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto hide-scrollbar relative z-10">
          {sidebarMenu
            .filter(m => m.roles.includes(user.role))
            .map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <motion.div
                  key={item.path}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all duration-300 relative group
                    ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
                >
                  <div className={`p-2 rounded-xl shrink-0 ${isActive ? 'bg-white/20' : 'bg-slate-800 group-hover:bg-slate-700'}`}>
                    {item.icon}
                  </div>
                  {isSidebarOpen && (
                    <span className="font-bold text-sm whitespace-nowrap">
                      {item.name}
                    </span>
                  )}
                  {isActive && isSidebarOpen && (
                    <motion.div layoutId="activeIndicator" className="ml-auto">
                        <ChevronRight size={14} />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-slate-800/50 space-y-2 relative z-10">
          <div 
            onClick={() => navigate('/pengaturan')}
            className="flex items-center gap-4 p-3 rounded-2xl text-slate-400 hover:bg-slate-800/50 hover:text-white cursor-pointer transition-all"
          >
            <Settings size={20} />
            {isSidebarOpen && <span className="font-bold text-sm">Pengaturan</span>}
          </div>
          <div 
            onClick={handleLogout}
            className="flex items-center gap-4 p-3 rounded-2xl text-red-400 hover:bg-red-500/10 cursor-pointer transition-all"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-bold text-sm">Keluar Sistem</span>}
          </div>
        </div>
      </motion.aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc]">
        {/* Navbar Atas */}
        <header className="h-[90px] bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
             <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-600 border border-slate-200"
             >
                <Command size={20} />
             </button>
             <div className="hidden md:flex items-center bg-slate-100 px-4 py-2.5 rounded-2xl gap-3 w-80 border border-transparent focus-within:border-blue-500 transition-all">
                <Search size={18} className="text-slate-400" />
                <input type="text" placeholder="Cari rekam medis..." className="bg-transparent border-none outline-none text-sm w-full font-medium" />
             </div>
          </div>

          <div className="flex items-center gap-6">
             <div className="h-10 w-[1px] bg-slate-200 hidden sm:block"></div>
             <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block leading-tight">
                    <p className="text-sm font-black text-slate-900 capitalize">{user.name}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {user.role} • <span className="text-blue-600">ONLINE</span>
                    </p>
                </div>
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg border-2 border-white">
                  <User size={24} />
                </div>
             </div>
          </div>
        </header>

        {/* Slot Page Content */}
        <main className="flex-1 overflow-y-auto p-8 hide-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl mx-auto"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}