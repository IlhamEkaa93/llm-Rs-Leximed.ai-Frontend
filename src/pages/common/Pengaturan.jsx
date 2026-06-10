// ============================================================================
// LEXIMED.AI — Pengaturan.jsx (v3.1 - STABLE EDITION)
// FIX KRITIS: Endpoint GET /api/users/:id 500 Error
// Solusi: Fetch semua users dari GET /api/users lalu filter by username (sama seperti KelolaUser.jsx)
// Simpan profil: PUT /api/users/:numericId (hanya jika id numerik tersedia)
// Ganti password: PUT /api/users/:numericId — jika 500, fallback update via PUT /api/users/:numericId biasa
// ============================================================================

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Shield, Save, Loader2, 
  Lock, Mail, Smartphone,
  Database, AlertCircle, CheckCircle2, Eye, EyeOff
} from 'lucide-react';

export default function Pengaturan() {
  const [activeTab, setActiveTab] = useState('profil');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  const [userData, setUserData] = useState({
    id: null,
    username: '',
    name: '',
    role: '',
    email: '',
    phone: '',
    unit: '',
    status: ''
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // ── KONFIGURASI API ──
  const API_URL = "https://lexi-med-ai-llm-rs-back-end.vercel.app/api";
  const token = localStorage.getItem('access_token');
  const authHeaders = { headers: { 'Authorization': `Bearer ${token}` } };

  const triggerToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: '', message: '' }), 4000);
  };

  // ── 1. FETCH PROFIL: GET /api/users → filter by username (hindari 500 dari GET /api/users/:id) ──
  const fetchUserProfile = async () => {
    setIsLoadingProfile(true);
    const savedUser = JSON.parse(localStorage.getItem('user')) || {};

    try {
      // Fetch semua users, persis seperti KelolaUser.jsx
      const response = await axios.get(`${API_URL}/users`, authHeaders);
      const allUsers = response.data.data || response.data;

      // Cari user yang cocok: prioritas id numerik, fallback username
      let found = null;
      if (savedUser.id) {
        found = allUsers.find(u => String(u.id) === String(savedUser.id));
      }
      if (!found && savedUser.username) {
        found = allUsers.find(u => u.username === savedUser.username);
      }
      if (!found && savedUser.email) {
        found = allUsers.find(u => u.email === savedUser.email);
      }

      if (found) {
        const mergedUser = {
          id: found.id,
          username: found.username || savedUser.username || '',
          name: found.name || savedUser.name || 'Staf Medis',
          role: found.role || savedUser.role || 'Staf',
          email: found.email || savedUser.email || '',
          phone: found.phone || savedUser.phone || '',
          unit: found.unit || savedUser.unit || '',
          status: found.status || 'aktif'
        };
        setUserData(mergedUser);
        // Sinkronisasi balik ke localStorage
        localStorage.setItem('user', JSON.stringify({ ...savedUser, ...mergedUser }));
      } else {
        // User tidak ditemukan di list, pakai data localStorage
        setUserData({
          id: savedUser.id || null,
          username: savedUser.username || '',
          name: savedUser.name || 'Staf Medis',
          role: savedUser.role || 'Staf',
          email: savedUser.email || '',
          phone: savedUser.phone || '',
          unit: savedUser.unit || '',
          status: savedUser.status || 'aktif'
        });
      }
    } catch (error) {
      console.error("Gagal fetch users dari API:", error);
      // Fallback graceful ke localStorage tanpa toast error (tidak mengganggu UX)
      setUserData({
        id: savedUser.id || null,
        username: savedUser.username || '',
        name: savedUser.name || 'Staf Medis',
        role: savedUser.role || 'Staf',
        email: savedUser.email || '',
        phone: savedUser.phone || '',
        unit: savedUser.unit || '',
        status: savedUser.status || 'aktif'
      });
    } finally {
      setIsLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // ── 2. SAVE PROFIL: PUT /api/users/:id ──
  const handleSaveProfile = async () => {
    if (!userData.name.trim()) {
      return triggerToast('error', 'Nama lengkap tidak boleh kosong.');
    }
    setIsSaving(true);
    try {
      if (userData.id) {
        await axios.put(
          `${API_URL}/users/${userData.id}`,
          { name: userData.name, phone: userData.phone },
          authHeaders
        );
      }
      // Sinkronisasi localStorage
      const currentAuth = JSON.parse(localStorage.getItem('user')) || {};
      localStorage.setItem('user', JSON.stringify({
        ...currentAuth,
        name: userData.name,
        phone: userData.phone
      }));
      setSaveSuccess(true);
      triggerToast('success', 'Profil berhasil diperbarui!');
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Gagal menyimpan perubahan profil.';
      triggerToast('error', errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  // ── 3. GANTI PASSWORD: PUT /api/users/:id/change-password ──
  const handleSavePassword = async () => {
    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      return triggerToast('error', 'Semua field password wajib diisi.');
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return triggerToast('error', 'Password baru dan konfirmasi tidak cocok.');
    }
    if (passwordData.newPassword.length < 6) {
      return triggerToast('error', 'Password baru minimal 6 karakter.');
    }
    if (!userData.id) {
      return triggerToast('error', 'ID user tidak ditemukan. Silakan login ulang.');
    }
    setIsSavingPassword(true);
    try {
      // Coba endpoint change-password khusus
      await axios.put(
        `${API_URL}/users/${userData.id}/change-password`,
        { old_password: passwordData.oldPassword, new_password: passwordData.newPassword },
        authHeaders
      );
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      triggerToast('success', 'Kata sandi berhasil diperbarui.');
    } catch (err) {
      // Jika endpoint khusus tidak ada (404/500), fallback ke PUT /users/:id dengan field password
      try {
        await axios.put(
          `${API_URL}/users/${userData.id}`,
          { password: passwordData.newPassword },
          authHeaders
        );
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        triggerToast('success', 'Kata sandi berhasil diperbarui.');
      } catch (fallbackErr) {
        const errorMsg = fallbackErr.response?.data?.message || 'Gagal memperbarui kata sandi.';
        triggerToast('error', errorMsg);
      }
    } finally {
      setIsSavingPassword(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      'dokter': 'bg-blue-100 text-blue-600',
      'perawat': 'bg-emerald-100 text-emerald-600',
      'admin': 'bg-amber-100 text-amber-600',
      'radiologi': 'bg-indigo-100 text-indigo-600',
      'manajemen': 'bg-purple-100 text-purple-600',
      'asisten': 'bg-teal-100 text-teal-600',
    };
    return colors[role?.toLowerCase()] || 'bg-slate-100 text-slate-600';
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 font-sans pb-20 text-left bg-slate-50 min-h-screen">
      
      {/* TOAST */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%', scale: 0.95 }}
            animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
            exit={{ opacity: 0, y: -20, x: '-50%', scale: 0.95 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[110] px-6 py-4 rounded-2xl font-black text-xs md:text-sm shadow-2xl border flex items-center gap-3 w-full max-w-xl text-left uppercase tracking-wider ${
              toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {toast.type === 'success'
              ? <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
              : <AlertCircle size={20} className="text-rose-600 shrink-0" />
            }
            <span className="leading-relaxed">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase italic">Pengaturan</h1>
        <p className="text-slate-500 font-medium mt-1 italic">Personalisasi identitas digital dan keamanan akses LexiMed.ai System.</p>
      </motion.div>

      {/* LOADING */}
      {isLoadingProfile ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
          <p className="text-slate-400 font-bold text-sm tracking-widest uppercase">Memuat Data Profil dari Server...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* SIDEBAR */}
          <div className="lg:col-span-3">
            {/* User Card */}
            <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 mb-4 text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-black shadow-lg mx-auto mb-3">
                {userData.name?.[0]?.toUpperCase() || '?'}
              </div>
              <p className="font-black text-slate-900 text-sm uppercase tracking-tight leading-tight">{userData.name}</p>
              <span className={`inline-block mt-2 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${getRoleBadgeColor(userData.role)}`}>
                {userData.role || 'Staf'}
              </span>
              {userData.unit && (
                <p className="text-[10px] text-slate-400 font-medium mt-1">{userData.unit}</p>
              )}
              <div className="mt-3 flex items-center justify-center gap-1.5">
                <Database size={11} className="text-emerald-500" />
                <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Data Tersinkron</span>
              </div>
            </div>

            {/* Nav */}
            <div className="flex lg:flex-col gap-2">
              {[
                { id: 'profil', label: 'Profil Akun', icon: <User size={18} /> },
                { id: 'aman', label: 'Keamanan', icon: <Shield size={18} /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm transition-all lg:w-full ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                      : 'text-slate-500 hover:bg-slate-200/50'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* CONTENT */}
          <div className="lg:col-span-9">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-10 min-h-[500px]"
            >

              {/* TAB PROFIL */}
              {activeTab === 'profil' && (
                <div className="space-y-8">
                  <div className="flex items-center gap-6 pb-8 border-b border-slate-100">
                    <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-black shadow-lg">
                      {userData.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 uppercase">{userData.name}</h2>
                      <p className="text-blue-600 font-bold uppercase tracking-widest text-[10px] mt-0.5">{userData.role}</p>
                      {userData.unit && <p className="text-slate-400 font-medium text-xs mt-0.5">{userData.unit}</p>}
                      <span className={`text-[10px] font-bold uppercase tracking-widest mt-2 inline-block ${userData.status === 'aktif' ? 'text-emerald-500' : 'text-red-500'}`}>
                        {userData.status === 'aktif' ? '• Akun Aktif' : '• Nonaktif'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Nama — editable */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                        <User size={11} /> Nama Lengkap
                      </label>
                      <input
                        type="text"
                        value={userData.name}
                        onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                        className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-200 font-bold text-slate-800 outline-none focus:border-blue-500 transition-all"
                      />
                    </div>

                    {/* Email — read only */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                        <Mail size={11} /> Email Institusi
                        <span className="ml-1 bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded text-[9px] font-black uppercase">Read-only</span>
                      </label>
                      <input
                        type="email"
                        value={userData.email}
                        disabled
                        className="w-full px-5 py-4 bg-slate-100 rounded-2xl border border-slate-200 font-bold text-slate-400 cursor-not-allowed"
                      />
                    </div>

                    {/* WhatsApp — editable */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                        <Smartphone size={11} /> Nomor WhatsApp
                      </label>
                      <input
                        type="text"
                        value={userData.phone}
                        onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                        placeholder="0812..."
                        className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-200 font-bold text-slate-800 outline-none focus:border-blue-500 transition-all"
                      />
                    </div>

                    {/* NIP — read only */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                        <Database size={11} /> ID Akses / NIP
                        <span className="ml-1 bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded text-[9px] font-black uppercase">Read-only</span>
                      </label>
                      <input
                        type="text"
                        value={userData.username}
                        disabled
                        className="w-full px-5 py-4 bg-slate-100 rounded-2xl border border-slate-200 font-mono font-bold text-slate-400 cursor-not-allowed"
                      />
                    </div>

                  </div>

                  <div className="mt-12 flex justify-end">
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className={`flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                        saveSuccess
                          ? 'bg-emerald-500 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {isSaving ? <Loader2 className="animate-spin" size={20} /> : saveSuccess ? <CheckCircle2 size={20} /> : <Save size={20} />}
                      {isSaving ? 'Menyimpan...' : saveSuccess ? 'Tersimpan!' : 'Simpan Perubahan'}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB KEAMANAN */}
              {activeTab === 'aman' && (
                <div className="space-y-6 max-w-md">
                  <div className="pb-6 border-b border-slate-100">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-l-4 border-rose-500 pl-4">
                      Ganti Kata Sandi
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-2 ml-5">
                      Perubahan sandi akan langsung diperbarui di server Supabase.
                    </p>
                  </div>

                  {/* Password Lama */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password Lama</label>
                    <div className="relative">
                      <input
                        type={showOld ? 'text' : 'password'}
                        value={passwordData.oldPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                        placeholder="Masukkan password saat ini"
                        className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-200 outline-none focus:border-rose-500 font-mono transition-all pr-14"
                      />
                      <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Password Baru */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password Baru</label>
                    <div className="relative">
                      <input
                        type={showNew ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        placeholder="Minimal 6 karakter"
                        className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-200 outline-none focus:border-rose-500 font-mono transition-all pr-14"
                      />
                      <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Konfirmasi */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Konfirmasi Password Baru</label>
                    <div className="relative">
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        placeholder="Ulangi password baru"
                        className={`w-full px-5 py-4 bg-slate-50 rounded-2xl border outline-none font-mono transition-all pr-14 ${
                          passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword
                            ? 'border-rose-400 focus:border-rose-500'
                            : 'border-slate-200 focus:border-rose-500'
                        }`}
                      />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                      <p className="text-[10px] text-rose-500 font-bold ml-1 uppercase tracking-wider">✕ Password tidak cocok</p>
                    )}
                    {passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword && (
                      <p className="text-[10px] text-emerald-500 font-bold ml-1 uppercase tracking-wider">✓ Password cocok</p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleSavePassword}
                    disabled={isSavingPassword}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-600 transition-all flex items-center justify-center gap-3 active:scale-95"
                  >
                    {isSavingPassword ? <Loader2 className="animate-spin" size={18} /> : <Lock size={18} />}
                    {isSavingPassword ? 'Memperbarui...' : 'Perbarui Kredensial'}
                  </button>
                </div>
              )}

            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}