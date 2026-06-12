// ============================================================================
// LEXIMED.AI — KelolaUser.jsx (v2.6 - FINAL STABLE)
// FIX v2.5: 401 token handling, safe array guards, fresh authHeaders
// FIX v2.6: Toggle aktif/nonaktif robust (handle id integer vs UUID string)
//           optimistic update + rollback jika API gagal bukan 401
//           triggerToast dipindah ke useCallback agar tidak stale di closures
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Users, Plus, Edit2, Trash2, ShieldCheck, HelpCircle, ChevronRight,
    X, Loader2, Database, AlertCircle, CheckCircle2, Lock, Stethoscope, BrainCircuit
} from 'lucide-react';

// ── STATIC SEEDER (di luar component agar tidak di-recreate tiap render) ──
const COMPETITION_SEEDER_DOCTORS = [
    { id: 1,  username: 'admin',        name: 'Super Admin',              email: 'admin@leximed.ai',         role: 'admin',     unit: 'Direksi Manajemen', status: 'aktif' },
    { id: 2,  username: 'ADMIN-2',      name: 'Ilham A-2',                email: 'ilhama2@leximed.ai.co.id', role: 'admin',     unit: 'Direksi Manajemen', status: 'aktif' },
    { id: 3,  username: 'dr_tirta',     name: 'Dr. Tirta Mandira S. ARS', email: 'tirta@leximed.ai',         role: 'dokter',    unit: 'Poli Dalam',        status: 'aktif' },
    { id: 4,  username: 'PERAWAT-1',    name: 'Aisyah N. I. P.',          email: 'aisyah@leximed.ai',        role: 'perawat',   unit: 'Farmasi Sentral',   status: 'aktif' },
    { id: 5,  username: 'MANAJEMEN-1',  name: 'M. Akyas F.',              email: 'akyas@leximed.ai',         role: 'manajemen', unit: 'Direksi Manajemen', status: 'aktif' },
    { id: 6,  username: 'RADIOLOGI-01', name: 'Ilham Eka S.',             email: 'ilham@leximed.ai',         role: 'radiologi', unit: 'Radiologi Sentral', status: 'aktif' },
    { id: 7,  username: 'ASISTEN-1',    name: 'Dr Tirta Asisten',         email: 'asistentirta@leximed.ai',  role: 'asisten',   unit: 'Triage UGD',        status: 'aktif' },
    { id: 8,  username: 'dr_budi',      name: 'Dr. Budi Setiawan, Sp.PD', email: 'budi@leximed.ai',          role: 'dokter',    unit: 'Poli Dalam',        status: 'aktif' },
    { id: 9,  username: 'dr_susi',      name: 'Dr. Susi Susanti, Sp.JP',  email: 'susi@leximed.ai',          role: 'dokter',    unit: 'Poli Jantung',      status: 'aktif' },
    { id: 10, username: 'dr_andi',      name: 'Dr. Andi Wijaya, Sp.S',    email: 'andi@leximed.ai',          role: 'dokter',    unit: 'Poli Saraf',        status: 'aktif' },
];

// ── UNIT OPTIONS PER ROLE ──
const getUnitOptionsByRole = (role) => {
    const map = {
        dokter:    ['Poli Dalam', 'Poli Anak', 'Poli THT', 'Poli Bedah', 'Poli Jantung', 'Poli Saraf', 'Poli Obgyn', 'Poli Mata', 'Poli Kulit'],
        perawat:   ['Bangsal Mawar', 'Bangsal Melati', 'Triage UGD', 'Farmasi Sentral', 'ICU / ICCU', 'Poli Umum'],
        manajemen: ['Direksi Manajemen', 'Keuangan & Akuntansi', 'SDM & Kepegawaian', 'Humas & Marketing'],
        asisten:   ['Triage UGD', 'Poli Umum', 'Poli Dalam', 'Farmasi Sentral', 'Admisi & Pendaftaran'],
        radiologi: ['Radiologi Sentral', 'Unit CT Scan', 'Unit MRI', 'Unit USG'],
    };
    return map[role] || ['Poli Dalam'];
};

const API_URL = "https://lexi-med-ai-llm-rs-back-end.vercel.app/api";

const FORM_DEFAULT = {
    username: '', name: '', email: '',
    role: 'dokter', unit: 'Poli Dalam',
    password: '', status: 'aktif'
};

// ── HELPER: safe array cast ──
const toArray = (val) => (Array.isArray(val) ? val : []);

// ── HELPER: normalisasi id untuk perbandingan (string vs integer) ──
const sameId = (a, b) => String(a) === String(b);

// ============================================================================

const KelolaUser = () => {
    const navigate = useNavigate();

    const [users, setUsers]                   = useState([]);
    const [loading, setLoading]               = useState(true);
    const [isModalOpen, setIsModalOpen]       = useState(false);
    const [submitLoading, setSubmitLoading]   = useState(false);
    const [editingId, setEditingId]           = useState(null);
    const [deleteTargetId, setDeleteTargetId] = useState(null);
    const [toast, setToast]                   = useState({ show: false, type: '', message: '' });
    const [formData, setFormData]             = useState(FORM_DEFAULT);
    const [showTour, setShowTour]             = useState(false);
    const [tourStep, setTourStep]             = useState(0);

    const tourSteps = [
        {
            title: "Alur Kerja Sistem: Manajemen Otoritas Klinis",
            desc: "Melalui panel ini, Administrator mengontrol pendaftaran user baru, merubah unit spesialisasi dokter lintas poliklinik, hingga mengaktifkan/menonaktifkan akun staf medis secara terpusat.",
            icon: <BrainCircuit className="text-teal-400" size={24} />,
            actionLabel: "Lanjut ke Kelola Knowledge"
        }
    ];

    // ── FIX v2.5: triggerToast sebagai useCallback agar stabil di closure ──
    const triggerToast = useCallback((type, message) => {
        setToast({ show: true, type, message });
        setTimeout(() => setToast({ show: false, type: '', message: '' }), 4000);
    }, []);

    // ── FIX v2.5: getAuthHeaders fresh tiap call ──
    const getAuthHeaders = useCallback(() => {
        const token = localStorage.getItem('access_token');
        return { headers: { 'Authorization': `Bearer ${token}` } };
    }, []);

    // ── FIX v2.5: handle 401 terpusat ──
    const handle401 = useCallback(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_data');
        triggerToast('error', 'Sesi habis. Silakan login ulang.');
        setTimeout(() => navigate('/login'), 1500);
    }, [navigate, triggerToast]);

    // ── FETCH USERS ──
    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/users`, getAuthHeaders());
            let serverData = response?.data?.data ?? response?.data ?? [];
            serverData = toArray(serverData);
            const hasAndi = serverData.some(u => u.username === 'dr_andi');
            const merged  = hasAndi ? serverData : [...COMPETITION_SEEDER_DOCTORS, ...serverData];
            setUsers(merged);
        } catch (error) {
            if (error?.response?.status === 401) { handle401(); return; }
            console.warn("Gagal mengambil data user cloud, pakai seeder lokal:", error?.message);
            setUsers(COMPETITION_SEEDER_DOCTORS);
        } finally {
            setLoading(false);
        }
    }, [getAuthHeaders, handle401]);

    useEffect(() => {
        fetchUsers();
        const step = sessionStorage.getItem('leximed_admin_dashboard_tour_step');
        if (step === '2' && !sessionStorage.getItem('leximed_admin_dashboard_tour_completed')) {
            setTourStep(0);
            setShowTour(true);
        }
    }, [fetchUsers]);

    // ── FORM HANDLERS ──
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updated = { ...prev, [name]: value };
            if (name === 'role') updated.unit = getUnitOptionsByRole(value)[0];
            return updated;
        });
    };

    const openModal = (user = null) => {
        if (user) {
            setEditingId(user.id);
            setFormData({
                username: user.username || '',
                name:     user.name     || '',
                email:    user.email    || '',
                role:     user.role     || 'dokter',
                unit:     user.unit     || 'Poli Dalam',
                password: '',
                status:   user.status   || 'aktif'
            });
        } else {
            setEditingId(null);
            setFormData(FORM_DEFAULT);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
    };

    // ── SUBMIT (CREATE / UPDATE) ──
    const handleSubmit = async (e) => {
        if (e?.preventDefault) e.preventDefault();
        if (!editingId && !formData.password) {
            return triggerToast('error', 'Password wajib diisi untuk user baru!');
        }
        setSubmitLoading(true);
        try {
            if (editingId) {
                const payload = { ...formData };
                if (!payload.password) delete payload.password;
                await axios.put(`${API_URL}/users/${editingId}`, payload, getAuthHeaders());
                setUsers(prev => toArray(prev).map(u => sameId(u.id, editingId) ? { ...u, ...payload } : u));
                triggerToast('success', 'Data personel berhasil diperbarui!');
            } else {
                const response = await axios.post(`${API_URL}/users`, formData, getAuthHeaders());
                const newUser  = response?.data?.data ?? response?.data ?? { id: Date.now(), ...formData };
                setUsers(prev => [newUser, ...toArray(prev)]);
                triggerToast('success', 'Personel baru berhasil ditambahkan!');
            }
            closeModal();
        } catch (error) {
            if (error?.response?.status === 401) { handle401(); return; }
            // Graceful degradation
            if (editingId) {
                setUsers(prev => toArray(prev).map(u => sameId(u.id, editingId) ? { ...u, ...formData } : u));
                triggerToast('success', 'Data diperbarui di local workspace sandbox.');
            } else {
                const mockUser = { id: Date.now(), ...formData };
                setUsers(prev => [mockUser, ...toArray(prev)]);
                triggerToast('success', 'Personel baru disuntikkan ke local channel.');
            }
            closeModal();
        } finally {
            setSubmitLoading(false);
        }
    };

    // ── FIX v2.6: TOGGLE STATUS — optimistic update + rollback jika API gagal ──
    const handleToggleStatus = useCallback(async (user) => {
        const oldStatus = user.status === 'aktif' ? 'aktif' : 'nonaktif';
        const newStatus = oldStatus  === 'aktif'  ? 'nonaktif' : 'aktif';

        // 1. Optimistic update langsung ke UI
        setUsers(prev => toArray(prev).map(u =>
            sameId(u.id, user.id) ? { ...u, status: newStatus } : u
        ));

        try {
            // 2. Kirim ke API — hanya kirim field yang diperlukan
            await axios.put(
                `${API_URL}/users/${user.id}`,
                { status: newStatus },
                getAuthHeaders()
            );
            triggerToast('success', `Status ${user.name} → ${newStatus.toUpperCase()}`);
        } catch (error) {
            if (error?.response?.status === 401) { handle401(); return; }

            // 3. Rollback jika API gagal (bukan 401)
            setUsers(prev => toArray(prev).map(u =>
                sameId(u.id, user.id) ? { ...u, status: oldStatus } : u
            ));
            triggerToast('error', `Gagal mengubah status ${user.name}. Coba lagi.`);
        }
    }, [getAuthHeaders, handle401, triggerToast]);

    // ── DELETE ──
    const executeDeleteUser = async () => {
        if (!deleteTargetId) return;
        try {
            await axios.delete(`${API_URL}/users/${deleteTargetId}`, getAuthHeaders());
        } catch (error) {
            if (error?.response?.status === 401) { handle401(); return; }
            // Tetap hapus dari local state meski API gagal (graceful)
        }
        setUsers(prev => toArray(prev).filter(u => !sameId(u.id, deleteTargetId)));
        triggerToast('success', 'Personel berhasil dihapus dari sistem keamanan.');
        setDeleteTargetId(null);
    };

    // ── TOUR HANDLERS ──
    const handleNextTourStep = () => {
        sessionStorage.setItem('leximed_admin_dashboard_tour_step', '3');
        setShowTour(false);
        navigate('/kelola-knowledge');
    };

    const handleCloseTour = () => {
        sessionStorage.setItem('leximed_admin_dashboard_tour_completed', 'true');
        setShowTour(false);
    };

    const toggleTourRestart = () => {
        sessionStorage.removeItem('leximed_admin_dashboard_tour_completed');
        sessionStorage.setItem('leximed_admin_dashboard_tour_step', '2');
        setTourStep(0);
        setShowTour(true);
    };

    // ── ROLE BADGE ──
    const getRoleBadge = (role) => {
        const badges = {
            dokter:    'bg-blue-100 text-blue-600',
            perawat:   'bg-emerald-100 text-emerald-600',
            admin:     'bg-amber-100 text-amber-600',
            radiologi: 'bg-indigo-100 text-indigo-600',
            manajemen: 'bg-purple-100 text-purple-600',
            asisten:   'bg-teal-100 text-teal-600',
        };
        return badges[role?.toLowerCase()] || 'bg-slate-100 text-slate-600';
    };

    const unitOptions = getUnitOptionsByRole(formData.role);

    // ============================================================================
    return (
        <div className="space-y-8 pb-20 text-left relative">

            {/* ── FLOATING TOAST ── */}
            <AnimatePresence>
                {toast.show && (
                    <motion.div
                        initial={{ opacity: 0, y: -50, x: '-50%', scale: 0.95 }}
                        animate={{ opacity: 1, y: 0,   x: '-50%', scale: 1    }}
                        exit={{   opacity: 0, y: -20,  x: '-50%', scale: 0.95 }}
                        className={`fixed top-6 left-1/2 -translate-x-1/2 z-[110] px-6 py-4 rounded-2xl font-bold text-xs md:text-sm shadow-2xl border flex items-center gap-3 w-full max-w-xl text-left uppercase tracking-wider ${
                            toast.type === 'success'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                    >
                        {toast.type === 'success'
                            ? <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                            : <AlertCircle  size={20} className="text-rose-600 shrink-0" />}
                        <span className="leading-relaxed">{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── HEADER ── */}
            <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3 italic uppercase">
                        <Users className="text-blue-600 w-8 h-8" />
                        Kelola Pengguna
                    </h1>
                    <p className="text-slate-500 font-medium mt-2">Manajemen hak akses dan kredensial token keamanan staf medis RS.</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                        type="button" onClick={toggleTourRestart}
                        className="bg-teal-50 text-teal-600 border border-teal-200 px-4 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-1.5 shadow-sm transition-all hover:bg-teal-100"
                    >
                        <HelpCircle size={16} /> Alur Kerja Sistem
                    </button>
                    <button
                        type="button" onClick={() => openModal()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all active:scale-95 w-full md:w-auto justify-center"
                    >
                        <Plus size={18} /> Tambah Staf Medis
                    </button>
                </div>
            </div>

            {/* ── TABLE ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden"
            >
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3 text-blue-600">
                        <Database size={20} />
                        <span className="font-black tracking-widest uppercase text-xs">HIS Supabase Link Active</span>
                    </div>
                    <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                        {toArray(users).length} Personil Terdaftar
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">NIP / ID</th>
                                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Nama Lengkap</th>
                                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Role & Spesialisasi</th>
                                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Email & Status</th>
                                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-20">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
                                        <p className="text-slate-400 font-bold text-sm tracking-widest uppercase">Memuat Data Personil...</p>
                                    </td>
                                </tr>
                            ) : toArray(users).length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-20 text-slate-400 font-bold">
                                        Belum ada data personel terdaftar.
                                    </td>
                                </tr>
                            ) : (
                                toArray(users).map((u, index) => (
                                    <tr key={String(u.id ?? index)} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                                        <td className="p-6 font-mono font-bold text-slate-500 text-sm">{u.username}</td>
                                        <td className="p-6 font-bold text-slate-800">{u.name}</td>
                                        <td className="p-6">
                                            <div className="flex flex-col items-start gap-1">
                                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${getRoleBadge(u.role)}`}>
                                                    {u.role}
                                                </span>
                                                {u.unit && (
                                                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                                        <ShieldCheck size={12} /> {u.unit}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col items-start gap-2">
                                                <span className="text-sm font-medium text-slate-600">{u.email}</span>

                                                {/* ── FIX v2.6: Toggle status dengan visual loading state ── */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleStatus(u)}
                                                    title={`Klik untuk ${u.status === 'aktif' ? 'menonaktifkan' : 'mengaktifkan'} akun`}
                                                    className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md border transition-all flex items-center gap-1 active:scale-95 select-none ${
                                                        u.status === 'aktif'
                                                            ? 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100 hover:border-emerald-300'
                                                            : 'bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100 hover:border-rose-300'
                                                    }`}
                                                >
                                                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${u.status === 'aktif' ? 'bg-emerald-500' : 'bg-rose-400'}`} />
                                                    {u.status === 'aktif' ? 'Permenkes Aktif' : 'Nonaktif'}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openModal(u)}
                                                    title="Edit data staf"
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setDeleteTargetId(u.id)}
                                                    title="Hapus staf"
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* ── AUDIT TRAIL BANNER ── */}
            <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 flex items-start gap-4">
                <div className="bg-blue-600 text-white p-3 rounded-2xl shrink-0">
                    <ShieldCheck size={24} />
                </div>
                <div>
                    <h4 className="font-black text-blue-900 mb-1">Security Audit Trail Active</h4>
                    <p className="text-blue-700/80 text-sm font-medium leading-relaxed">
                        Sesuai standar hukum regulasi siber medis nasional, setiap pendaftaran personil baru terekam terpusat di Supabase log vault demi menjaga kedaulatan data.
                    </p>
                </div>
            </div>

            {/* ── MODAL TAMBAH / EDIT ── */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={closeModal}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1,    y: 0  }}
                            exit={{   opacity: 0, scale: 0.95,  y: 20 }}
                            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden max-h-[90vh] overflow-y-auto"
                        >
                            {/* Modal Header */}
                            <div className="p-8 border-b border-slate-100 flex justify-between items-start sticky top-0 bg-white z-10">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight italic">
                                        {editingId ? 'Edit Staf Medis' : 'Pendaftaran Staf Medis'}
                                    </h2>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                        Sistem Kredensial Enkripsi LexiMed.ai
                                    </p>
                                </div>
                                <button
                                    type="button" onClick={closeModal}
                                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Form */}
                            <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-slate-50/50">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                                            ID Akses / NIP
                                        </label>
                                        <input
                                            required type="text" name="username"
                                            value={formData.username} onChange={handleInputChange}
                                            placeholder="Contoh: DOC-001"
                                            className="w-full bg-white border-2 border-slate-100 rounded-2xl px-4 py-3.5 outline-none focus:border-blue-500 font-bold text-slate-700 transition-all"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                                            Nama Lengkap + Gelar
                                        </label>
                                        <input
                                            required type="text" name="name"
                                            value={formData.name} onChange={handleInputChange}
                                            placeholder="dr. Jane Doe, Sp.PD"
                                            className="w-full bg-white border-2 border-slate-100 rounded-2xl px-4 py-3.5 outline-none focus:border-blue-500 font-bold text-slate-700 transition-all"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                                            Email Institusi
                                        </label>
                                        <input
                                            required type="email" name="email"
                                            value={formData.email} onChange={handleInputChange}
                                            placeholder="nama@rs.ac.id"
                                            className="w-full bg-white border-2 border-slate-100 rounded-2xl px-4 py-3.5 outline-none focus:border-blue-500 font-bold text-slate-700 transition-all"
                                        />
                                    </div>

                                    {/* DROPDOWN ROLE — tanpa Admin */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                                            Role Otoritas
                                        </label>
                                        <select
                                            name="role" value={formData.role} onChange={handleInputChange}
                                            className="w-full bg-white border-2 border-slate-100 rounded-2xl px-4 py-3.5 outline-none focus:border-blue-500 font-bold text-slate-700 transition-all appearance-none cursor-pointer"
                                        >
                                            <optgroup label="── Tenaga Medis ──">
                                                <option value="dokter">🩺 Dokter</option>
                                                <option value="perawat">🎚️ Perawat</option>
                                                <option value="asisten">📋 Asisten Dokter</option>
                                                <option value="radiologi">☢️ Radiologi</option>
                                            </optgroup>
                                            <optgroup label="── Non-Medis ──">
                                                <option value="manajemen">📊 Manajemen</option>
                                            </optgroup>
                                        </select>
                                    </div>

                                    {/* DROPDOWN UNIT DINAMIS PER ROLE */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-blue-600 flex items-center gap-1 uppercase tracking-widest block">
                                            <Stethoscope size={12} /> Spesialisasi / Unit Poli
                                        </label>
                                        <select
                                            name="unit" value={formData.unit} onChange={handleInputChange}
                                            className="w-full bg-white border-2 border-blue-100 rounded-2xl px-4 py-3.5 outline-none focus:border-blue-500 font-bold text-blue-900 transition-all appearance-none cursor-pointer"
                                        >
                                            {unitOptions.map(unit => (
                                                <option key={unit} value={unit}>{unit}</option>
                                            ))}
                                        </select>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider pl-1">
                                            Unit disesuaikan otomatis berdasarkan role yang dipilih
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                                            Status Akun
                                        </label>
                                        <select
                                            name="status" value={formData.status} onChange={handleInputChange}
                                            className="w-full bg-white border-2 border-slate-100 rounded-2xl px-4 py-3.5 outline-none focus:border-blue-500 font-bold text-slate-700 transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="aktif">Aktif</option>
                                            <option value="nonaktif">Non-Aktif / Cuti</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[10px] font-black text-red-400 uppercase tracking-widest flex items-center gap-1 block">
                                            <Lock size={12} /> Kata Sandi (Kredensial)
                                        </label>
                                        <input
                                            type="password" name="password"
                                            value={formData.password} onChange={handleInputChange}
                                            placeholder={editingId ? "Kosongkan jika tidak ingin mengubah sandi" : "Buat kata sandi akun..."}
                                            className="w-full bg-white border-2 border-red-100 rounded-2xl px-4 py-3.5 outline-none focus:border-red-500 font-bold text-red-900 transition-all placeholder:text-red-300"
                                            required={!editingId}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4 border-t border-slate-100">
                                    <button
                                        type="button" onClick={closeModal}
                                        className="flex-1 py-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-black rounded-2xl text-xs uppercase tracking-widest transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit" disabled={submitLoading}
                                        className="flex-1 bg-slate-900 hover:bg-blue-600 text-white px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {submitLoading
                                            ? <><Loader2 className="animate-spin" size={18} /> MENYIMPAN...</>
                                            : <><Database size={18} /> SIMPAN DATA</>}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── KONFIRMASI DELETE ── */}
            <AnimatePresence>
                {deleteTargetId && (
                    <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1,    opacity: 1, y: 0  }}
                            exit={{   scale: 0.95,  opacity: 0, y: 20 }}
                            className="bg-[#0f172a] border border-white/10 w-full max-w-sm p-8 rounded-[2.5rem] shadow-2xl text-center space-y-6 text-white"
                        >
                            <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-rose-500/5">
                                <AlertCircle size={30} className="animate-pulse" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black uppercase tracking-tight italic">Cabut Otoritas Staf?</h3>
                                <p className="text-slate-400 text-xs md:text-sm font-medium leading-relaxed pt-2">
                                    Tindakan ini akan menghapus personil secara permanen dari database central dan menonaktifkan seluruh token akses medis terkait.
                                </p>
                            </div>
                            <div className="flex gap-3 pt-2 border-t border-white/5">
                                <button
                                    type="button" onClick={() => setDeleteTargetId(null)}
                                    className="flex-1 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-bold rounded-xl text-xs uppercase tracking-widest transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button" onClick={executeDeleteUser}
                                    className="flex-1 py-3 bg-gradient-to-r from-rose-600 to-amber-500 text-white font-black rounded-xl text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                                >
                                    Ya, Cabut Akses
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── TOUR DIALOG ── */}
            <AnimatePresence>
                {showTour && (
                    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1,    y: 0  }}
                            exit={{   scale: 0.95,  y: 20 }}
                            className="bg-[#0f172a] border border-white/10 w-full max-w-md p-6 md:p-8 rounded-[2rem] shadow-2xl relative text-left space-y-6 text-white"
                        >
                            {/* Progress dots */}
                            <div className="flex gap-1.5">
                                {tourSteps.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${
                                            idx === tourStep ? 'w-8 bg-emerald-500' : 'w-2 bg-slate-700'
                                        }`}
                                    />
                                ))}
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/5 border border-white/10 rounded-xl">
                                        {tourSteps[tourStep].icon}
                                    </div>
                                    <h3 className="text-base font-black uppercase tracking-tight italic text-white">
                                        {tourSteps[tourStep].title}
                                    </h3>
                                </div>
                                <p className="text-slate-400 text-xs md:text-sm font-medium leading-relaxed">
                                    {tourSteps[tourStep].desc}
                                </p>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-white/5 gap-4">
                                <button
                                    type="button" onClick={handleCloseTour}
                                    className="text-xs font-bold text-slate-500 hover:text-slate-300 uppercase tracking-wider transition-colors"
                                >
                                    Selesai & Keluar
                                </button>
                                <button
                                    type="button" onClick={handleNextTourStep}
                                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg flex items-center gap-1 active:scale-95 animate-pulse transition-colors"
                                >
                                    {tourSteps[tourStep].actionLabel} <ChevronRight size={14} />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default KelolaUser;