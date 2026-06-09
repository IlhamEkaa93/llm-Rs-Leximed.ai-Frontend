import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Bell, Shield, Globe, Save, Loader2, 
  CheckCircle, Lock, Mail, Smartphone, Eye, EyeOff,
  Database, Moon, Sun, Languages
} from 'lucide-react';

export default function Pengaturan() {
  const [activeTab, setActiveTab] = useState('profil');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPassword, setShowSuccess] = useState(false);
  
  // State data profil fungsional
  const [userData, setUserData] = useState({
    name: 'User',
    role: 'dokter',
    email: 'user@rsuns.ac.id',
    phone: '081234567890',
    language: 'Bahasa Indonesia',
    darkMode: false,
    notifications: {
      ai: true,
      audit: false,
      system: true
    }
  });

  // Sinkronisasi data awal
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user'));
    if (savedUser) {
      setUserData(prev => ({
        ...prev,
        name: savedUser.name || prev.name,
        role: savedUser.role || prev.role,
        email: savedUser.email || prev.email
      }));
    }
  }, []);

  const handleSaveSettings = () => {
    setIsSaving(true);
    // Simulasi Save ke Supabase via Backend
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      
      // Update LocalStorage agar sinkron dengan header global
      const currentAuth = JSON.parse(localStorage.getItem('user'));
      localStorage.setItem('user', JSON.stringify({ ...currentAuth, name: userData.name }));
      
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1500);
  };

  const toggleNotif = (key) => {
    setUserData(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: !prev.notifications[key] }
    }));
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 font-sans pb-20">
      {/* HEADER SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Pengaturan</h1>
        <p className="text-slate-500 font-medium mt-1 italic">Personalisasi identitas digital dan keamanan akses LexiMed.ai System.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* SIDEBAR NAV (Responsive: Row di HP, Column di Desktop) */}
        <div className="lg:col-span-3 overflow-x-auto no-scrollbar">
          <div className="flex lg:flex-col gap-2 p-1 bg-slate-100/50 rounded-2xl lg:bg-transparent lg:p-0">
            {[
              { id: 'profil', label: 'Profil Akun', icon: <User size={18} /> },
              { id: 'notif', label: 'Notifikasi', icon: <Bell size={18} /> },
              { id: 'aman', label: 'Keamanan', icon: <Shield size={18} /> },
              { id: 'tampilan', label: 'Tampilan', icon: <Languages size={18} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-6 py-4 rounded-xl font-bold text-sm transition-all whitespace-nowrap lg:w-full ${
                  activeTab === tab.id 
                  ? 'bg-white text-blue-600 shadow-xl shadow-blue-900/5 ring-1 ring-slate-200' 
                  : 'text-slate-500 hover:bg-slate-200/50'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="lg:col-span-9">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-6 md:p-10 min-h-[500px] relative"
          >
            {/* TAB: PROFIL */}
            {activeTab === 'profil' && (
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-slate-100">
                  <div className="relative group">
                    <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-blue-500/40">
                      {userData.name[0]}
                    </div>
                    <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                      <Smartphone size={14} className="text-slate-600" />
                    </button>
                  </div>
                  <div className="text-center md:text-left">
                    <h2 className="text-2xl font-black text-slate-800">{userData.name}</h2>
                    <p className="text-blue-600 font-bold uppercase tracking-widest text-xs mt-1">{userData.role}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                    <input 
                      type="text" 
                      value={userData.name} 
                      onChange={(e) => setUserData({...userData, name: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium"
                    />
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Institusi</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input 
                        type="email" 
                        value={userData.email} 
                        disabled
                        className="w-full pl-14 pr-5 py-4 bg-slate-100 rounded-2xl border border-slate-200 text-slate-400 font-medium cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nomor WhatsApp</label>
                    <input 
                      type="text" 
                      value={userData.phone} 
                      onChange={(e) => setUserData({...userData, phone: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium"
                    />
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Akses Database</label>
                    <div className="w-full px-5 py-4 bg-slate-100 rounded-2xl border border-slate-200 text-slate-400 font-bold flex items-center gap-2">
                       <Database size={16} /> Supabase Connected
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: NOTIFIKASI */}
            {activeTab === 'notif' && (
              <div className="space-y-6">
                <h3 className="text-xl font-black text-slate-800 mb-6 border-l-4 border-blue-600 pl-4">Preferensi Notifikasi</h3>
                {[
                  { id: 'ai', title: 'Analisis AI Selesai', desc: 'Dapatkan alert saat Llama selesai merangkum data klinis.' },
                  { id: 'audit', title: 'Log Aktivitas', desc: 'Pemberitahuan harian terkait riwayat akses data Anda.' },
                  { id: 'system', title: 'Update Sistem', desc: 'Informasi mengenai pemeliharaan berkala server Volt.' },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-[24px] border border-slate-100 transition-all hover:border-blue-200 group text-left">
                    <div className="space-y-1">
                      <strong className="text-slate-800 font-bold block">{item.title}</strong>
                      <span className="text-sm text-slate-500 font-medium">{item.desc}</span>
                    </div>
                    <button 
                      onClick={() => toggleNotif(item.id)}
                      className={`w-14 h-8 rounded-full transition-all relative ${userData.notifications[item.id] ? 'bg-blue-600' : 'bg-slate-300'}`}
                    >
                      <motion.div 
                        animate={{ x: userData.notifications[item.id] ? 26 : 4 }}
                        className="w-6 h-6 bg-white rounded-full absolute top-1 shadow-sm"
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: KEAMANAN */}
            {activeTab === 'aman' && (
              <div className="space-y-8 max-w-md">
                <h3 className="text-xl font-black text-slate-800 mb-6 border-l-4 border-rose-500 pl-4">Ganti Password</h3>
                <div className="space-y-4">
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password Lama</label>
                    <input type="password" placeholder="••••••••" className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-200 outline-none focus:border-rose-500 transition-all font-mono" />
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password Baru</label>
                    <input type="password" placeholder="••••••••" className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-200 outline-none focus:border-rose-500 transition-all font-mono" />
                  </div>
                  <button className="w-full py-4 bg-[#0f172a] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-rose-600 transition-all shadow-xl shadow-slate-900/10">
                    <Lock size={16} /> Perbarui Kredensial
                  </button>
                </div>
              </div>
            )}

            {/* TAB: TAMPILAN */}
            {activeTab === 'tampilan' && (
              <div className="space-y-8">
                 <h3 className="text-xl font-black text-slate-800 mb-6 border-l-4 border-emerald-500 pl-4">Regional & Lokalisasi</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4 text-left">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bahasa Aplikasi</label>
                       <select className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-200 font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-100">
                          <option>Bahasa Indonesia</option>
                          <option>English (Medical Standard)</option>
                       </select>
                    </div>
                    <div className="space-y-4 text-left">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tema Visual</label>
                       <div className="flex gap-2">
                          <button className="flex-1 p-4 rounded-2xl bg-white border-2 border-blue-600 text-blue-600 font-bold flex items-center justify-center gap-2">
                             <Sun size={18} /> Light
                          </button>
                          <button className="flex-1 p-4 rounded-2xl bg-slate-50 border-2 border-transparent text-slate-400 font-bold flex items-center justify-center gap-2">
                             <Moon size={18} /> Dark
                          </button>
                       </div>
                    </div>
                 </div>
              </div>
            )}

            {/* FLOATING SAVE BAR */}
            <div className="mt-12 flex justify-end">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSaveSettings}
                disabled={isSaving}
                className={`flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-2xl ${
                  saveSuccess 
                  ? 'bg-emerald-500 text-white shadow-emerald-200' 
                  : 'bg-blue-600 text-white shadow-blue-300'
                }`}
              >
                {isSaving ? <Loader2 className="animate-spin" size={20} /> : 
                 saveSuccess ? <CheckCircle size={20} /> : <Save size={20} />}
                {isSaving ? "Menyimpan..." : saveSuccess ? "Tersimpan!" : "Simpan Perubahan"}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}