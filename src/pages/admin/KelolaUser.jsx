import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, Plus, Edit2, Trash2, ShieldCheck, 
    X, Loader2, Database, AlertCircle, CheckCircle2,
    Lock, Stethoscope
} from 'lucide-react';

const KelolaUser = () => {
    // --- STATE MANAGEMENT ---
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Notifikasi Toast
    const [toast, setToast] = useState({ show: false, type: '', message: '' });

    // State Form
    const [formData, setFormData] = useState({
        username: '', 
        name: '',
        email: '',
        role: 'dokter',
        unit: '', 
        password: '',
        status: 'aktif'
    });

    const API_URL = import.meta.env.VITE_API_URL || "https://lexi-med-ai-llm-rs-back-end.vercel.app/api";
    const token = localStorage.getItem('access_token');

    // Headers untuk API
    const authHeaders = {
        headers: { 'Authorization': `Bearer ${token}` }
    };

    // --- FETCH DATA (REAL-TIME READ) ---
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/users`, authHeaders);
            setUsers(response.data.data || response.data);
        } catch (error) {
            console.error("Gagal mengambil data user", error);
            showToast('error', 'Gagal memuat data pengguna dari database.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // --- HANDLER MODAL & FORM ---
    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const openModal = (user = null) => {
        if (user) {
            setEditingId(user.id);
            setFormData({
                username: user.username || '',
                name: user.name || '',
                email: user.email || '',
                role: user.role || 'dokter',
                unit: user.unit || '',
                password: '', // Kosongkan password saat edit agar tidak terubah jika tidak diisi
                status: user.status || 'aktif'
            });
        } else {
            setEditingId(null);
            setFormData({
                username: '', name: '', email: '', role: 'dokter', unit: '', password: '', status: 'aktif'
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
    };

    const showToast = (type, message) => {
        setToast({ show: true, type, message });
        setTimeout(() => setToast({ show: false, type: '', message: '' }), 3000);
    };

    // --- CRUD: CREATE & UPDATE ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);

        try {
            if (editingId) {
                // UPDATE
                await axios.put(`${API_URL}/users/${editingId}`, formData, authHeaders);
                
                // Real-time Update State Lokal tanpa perlu reload web
                setUsers(users.map(u => u.id === editingId ? { ...u, ...formData } : u));
                showToast('success', 'Data personel berhasil diperbarui!');
            } else {
                // CREATE
                if (!formData.password) return showToast('error', 'Password wajib diisi untuk user baru!');
                
                const response = await axios.post(`${API_URL}/users`, formData, authHeaders);
                const newUser = response.data.data || response.data;
                
                // Real-time Add to State Lokal
                setUsers([newUser, ...users]);
                showToast('success', 'Personel baru berhasil ditambahkan!');
            }
            closeModal();
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.';
            showToast('error', errorMsg);
        } finally {
            setSubmitLoading(false);
        }
    };

    // --- CRUD: DELETE ---
    const handleDelete = async (id) => {
        if (!window.confirm("Apakah Anda yakin ingin menghapus personel ini dari sistem?")) return;

        try {
            await axios.delete(`${API_URL}/users/${id}`, authHeaders);
            // Real-time Remove from State Lokal
            setUsers(users.filter(u => u.id !== id));
            showToast('success', 'Personel berhasil dihapus dari sistem.');
        } catch (error) {
            showToast('error', 'Gagal menghapus personel.');
        }
    };

    // Helper untuk Warna Role
    const getRoleBadge = (role) => {
        const badges = {
            'dokter': 'bg-blue-100 text-blue-600',
            'perawat': 'bg-emerald-100 text-emerald-600',
            'admin': 'bg-amber-100 text-amber-600',
            'radiologi': 'bg-indigo-100 text-indigo-600',
            'manajemen': 'bg-purple-100 text-purple-600',
            'asisten': 'bg-teal-100 text-teal-600'
        };
        return badges[role?.toLowerCase()] || 'bg-slate-100 text-slate-600';
    };

    return (
        <div className="space-y-8 pb-20 relative">
            {/* TOAST NOTIFICATION */}
            <AnimatePresence>
                {toast.show && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 20, x: '-50%' }}
                        className={`fixed bottom-10 left-1/2 z-50 px-6 py-3 rounded-full font-bold text-sm shadow-2xl flex items-center gap-3 ${
                            toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                        }`}
                    >
                        {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* HEADER */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
            >
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Users className="text-blue-600 w-8 h-8" />
                        Kelola Pengguna
                    </h1>
                    <p className="text-slate-500 font-medium mt-2">Manajemen hak akses dan kredensial staf medis RS .</p>
                </div>

                <button 
                    onClick={() => openModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all active:scale-95"
                >
                    <Plus size={18} /> Tambah Staf Medis
                </button>
            </motion.div>

            {/* TABLE AREA */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden"
            >
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3 text-blue-600">
                        <Database size={20} />
                        <span className="font-black tracking-widest uppercase text-xs">HIS PostgreSQL Link Active</span>
                    </div>
                    <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                        {users.length} Personil Terdaftar
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
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-20 text-slate-400 font-bold">Belum ada data personel terdaftar.</td>
                                </tr>
                            ) : (
                                users.map((u, index) => (
                                    <tr key={u.id || index} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                                        <td className="p-6 font-mono font-bold text-slate-500 text-sm">{u.username}</td>
                                        <td className="p-6 font-bold text-slate-800">{u.name}</td>
                                        <td className="p-6">
                                            <div className="flex flex-col items-start gap-1">
                                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${getRoleBadge(u.role)}`}>
                                                    {u.role}
                                                </span>
                                                {u.unit && <span className="text-xs text-slate-400 font-medium flex items-center gap-1"><ShieldCheck size={12}/> {u.unit}</span>}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col items-start gap-1">
                                                <span className="text-sm font-medium text-slate-600">{u.email}</span>
                                                <span className={`text-[10px] font-bold uppercase tracking-widest ${u.status === 'aktif' ? 'text-emerald-500' : 'text-red-500'}`}>
                                                    {u.status === 'aktif' ? '• Aktif' : '• Nonaktif'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => openModal(u)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                                                    <Edit2 size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(u.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
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

            {/* AUDIT TRAIL BANNER */}
            <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 flex items-start gap-4">
                <div className="bg-blue-600 text-white p-3 rounded-2xl shrink-0"><ShieldCheck size={24} /></div>
                <div>
                    <h4 className="font-black text-blue-900 mb-1">Security Audit Trail Active</h4>
                    <p className="text-blue-700/80 text-sm font-medium leading-relaxed">Sesuai standar, setiap pendaftaran personil medis dan registrasi data pasien terekam secara permanen dalam database audit rumah sakit demi menjaga integritas data klinis LexiMed.ai.</p>
                </div>
            </div>

            {/* MODAL TAMBAH / EDIT */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                        
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden"
                        >
                            <div className="p-8 border-b border-slate-100 flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight italic">
                                        {editingId ? 'Edit Staf Medis' : 'Pendaftaran Staf Medis'}
                                    </h2>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Sistem Informasi Medis RS </p>
                                </div>
                                <button onClick={closeModal} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"><X size={20} /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-slate-50/50">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">ID Akses / NIP</label>
                                        <input required type="text" name="username" value={formData.username} onChange={handleInputChange} placeholder="Contoh: DOC-001" className="w-full bg-white border-2 border-slate-100 rounded-2xl px-4 py-3.5 outline-none focus:border-blue-500 font-bold text-slate-700 transition-all" />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Nama Lengkap + Gelar</label>
                                        <input required type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="dr. Jane Doe, Sp.PD" className="w-full bg-white border-2 border-slate-100 rounded-2xl px-4 py-3.5 outline-none focus:border-blue-500 font-bold text-slate-700 transition-all" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Email Institusi</label>
                                        <input required type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="nama@rs.ac.id" className="w-full bg-white border-2 border-slate-100 rounded-2xl px-4 py-3.5 outline-none focus:border-blue-500 font-bold text-slate-700 transition-all" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Role Otoritas</label>
                                        <select name="role" value={formData.role} onChange={handleInputChange} className="w-full bg-white border-2 border-slate-100 rounded-2xl px-4 py-3.5 outline-none focus:border-blue-500 font-bold text-slate-700 transition-all appearance-none cursor-pointer">
                                            <option value="dokter">Dokter</option>
                                            <option value="perawat">Perawat</option>
                                            <option value="admin">Admin IT</option>
                                            <option value="asisten">Asisten Dokter</option>
                                            <option value="radiologi">Radiologi</option>
                                            <option value="manajemen">Manajemen</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-blue-500 flex items-center gap-1 uppercase tracking-widest block"><Stethoscope size={12}/> Spesialisasi / Unit</label>
                                        <input type="text" name="unit" value={formData.unit} onChange={handleInputChange} placeholder="Contoh: Poli Jantung / ICU" className="w-full bg-white border-2 border-blue-100 rounded-2xl px-4 py-3.5 outline-none focus:border-blue-500 font-bold text-blue-900 transition-all placeholder:text-blue-300" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Status Akun</label>
                                        <select name="status" value={formData.status} onChange={handleInputChange} className="w-full bg-white border-2 border-slate-100 rounded-2xl px-4 py-3.5 outline-none focus:border-blue-500 font-bold text-slate-700 transition-all appearance-none cursor-pointer">
                                            <option value="aktif">Aktif</option>
                                            <option value="nonaktif">Non-Aktif / Cuti</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[10px] font-black text-red-400 uppercase tracking-widest block flex items-center gap-1"><Lock size={12}/> Kata Sandi (Kredensial)</label>
                                        <input 
                                            type="password" name="password" value={formData.password} onChange={handleInputChange} 
                                            placeholder={editingId ? "Ketik sandi baru (kosongkan jika tidak ingin mengubah)" : "Buat kata sandi untuk akun ini..."} 
                                            className="w-full bg-white border-2 border-red-100 rounded-2xl px-4 py-3.5 outline-none focus:border-red-500 font-bold text-red-900 transition-all placeholder:text-red-300" 
                                            required={!editingId} 
                                        />
                                    </div>
                                </div>

                                <button 
                                    type="submit" disabled={submitLoading}
                                    className="w-full mt-4 bg-slate-900 hover:bg-blue-600 text-white px-6 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-slate-900/20"
                                >
                                    {submitLoading ? <Loader2 className="animate-spin" size={18} /> : <Database size={18} />}
                                    {submitLoading ? 'MENYIMPAN...' : 'SIMPAN KE POSTGRESQL RS'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default KelolaUser;