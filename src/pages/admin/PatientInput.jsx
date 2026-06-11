// ============================================================================
// LEXIMED.AI — PatientInput.jsx (v21.6 - MASTER SYNCHRONIZATION CORE)
// 100% Bebas Error Semicolon Parser & Integrasi Layout Enterprise Dashboard
// Fitur Tambahan: Daftar Pasien Terdaftar, Filter DPJP, & Mode Berobat Ulang Riil
// Fitur UI: Custom Animated Realtime Card & Premium Floating Toast (Bebas Dummy)
// FIX: Sinkronisasi Sinkron Opsi Dropdown Status Kunjungan (Rawat Inap, Rawat Jalan, UGD)
// FIX: Integrasi Saringan Lintas Minggu Menggunakan Modul API /patients-master Supabase
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
    UserPlus, 
    Database, 
    CheckCircle, 
    ArrowLeft, 
    Loader2, 
    ShieldCheck, 
    CalendarClock,
    Stethoscope,
    Building2,
    Users,
    UserCircle2,
    Search,
    ChevronRight,
    HelpCircle,
    CheckCircle2,
    RefreshCw,
    Clock,
    History,
    AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = "https://lexi-med-ai-llm-rs-back-end.vercel.app/api";

export default function PatientInput() {
    const navigate = useNavigate();
    const token = localStorage.getItem('access_token');
    
    const [isSaving, setIsSaving] = useState(false);
    const [doctors, setDoctors] = useState([]);
    const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
    
    // State Daftar Pasien Master Lintas Minggu
    const [patients, setPatients] = useState([]);
    const [isLoadingPatients, setIsLoadingPatients] = useState(true);
    const [filterDpjp, setFilterDpjp] = useState('All');

    // State Pop-up Sesi Berobat Ulang Interaktif
    const [selectedPatientForRevisit, setSelectedPatientForRevisit] = useState(null);
    const [toast, setToast] = useState({ show: false, type: '', message: '' });

    const [formData, setFormData] = useState({
        no_rm: '',
        title: 'Tn.', 
        name: '',
        age: '',
        gender: 'Laki-Laki', 
        unit: 'Poli Umum', 
        dpjp: '',
        status_treatment: 'Rawat Jalan',
        date: new Date().toISOString().split('T')[0] 
    });

    const [showTour, setShowTour] = useState(false);
    const [tourStep, setTourStep] = useState(0);

    const tourSteps = [
        {
            title: "Alur Kerja Sistem: Registrasi Master Data",
            desc: "Selamat datang di Node Admin. Di sini Anda mendaftarkan pasien baru atau memilih pasien lama pada daftar di bawah untuk mensimulasikan proses 'Berobat Ulang'.",
            icon: <Database className="text-blue-400" size={24} />,
            actionLabel: "Mengerti, Lanjut"
        },
        {
            title: "Alur Kerja Sistem: Distribusi Otoritas DPJP",
            desc: "Setelah pasien terdaftar, data tanggal riil harian otomatis tersimpan di Supabase dan didistribusikan secara real-time ke dasbor Dokter dr. Tirta.",
            icon: <ShieldCheck className="text-emerald-400" size={24} />,
            actionLabel: "Simulasikan Input"
        },
        {
            title: "Alur Kerja Sistem: Estafet ke Node Asisten",
            desc: "Mari kita asumsikan pasien telah terdaftar. Klik tombol di bawah untuk memindahkan rute navigasi secara otonom menuju Stasiun Kerja Asisten guna melakukan Triage awal.",
            icon: <ChevronRight className="text-amber-400" size={24} />,
            actionLabel: "Lanjut ke Ruang Asisten"
        }
    ];

    const triggerToast = (type, message) => {
        setToast({ show: true, type, message });
        setTimeout(() => setToast({ show: false, type: '', message: '' }), 4000);
    };

    const fetchDoctors = useCallback(async () => {
        setIsLoadingDoctors(true);
        try {
            const response = await axios.get(`${API_URL}/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const doctorList = response.data.data.filter(u => u.role === 'dokter');
            setDoctors(doctorList);
            if(doctorList.length > 0 && !formData.dpjp) {
                setFormData(prev => ({ ...prev, dpjp: doctorList[0].name }));
            }
        } catch (error) {
            console.error("Gagal memuat daftar dokter:", error);
        } finally {
            setIsLoadingDoctors(false);
        }
    }, [token, formData.dpjp]);

    // ── FETCH DATA MASTER HISTORIS LINTAS MINGGU DARI ENDPOINT SUPABASE BARU ──
    const fetchPatients = useCallback(async () => {
        setIsLoadingPatients(true);
        try {
            const response = await axios.get(`${API_URL}/patients-master`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const dataRaw = response.data.data || response.data;
            if (Array.isArray(dataRaw)) {
                const sorted = dataRaw.sort((a, b) => (b.id || 0) - (a.id || 0));
                setPatients(sorted);
            }
        } catch (error) {
            console.error("Gagal memuat master pasien:", error);
        } finally {
            setIsLoadingPatients(false);
        }
    }, [token]);

    useEffect(() => {
        fetchDoctors();
        fetchPatients();
    }, [fetchDoctors, fetchPatients]);

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!formData.age || parseInt(formData.age) <= 0) {
            return triggerToast('error', "Mohon masukkan umur pasien yang valid.");
        }

        setIsSaving(true);
        try {
            await axios.post(`${API_URL}/patients`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            triggerToast('success', `Registrasi Berhasil! Berkas pasien ${formData.title} ${formData.name} disimpan ke database.`);
            setFormData({ 
                no_rm: '', title: 'Tn.', name: '', age: '', gender: 'Laki-Laki', 
                unit: 'Poli Umum', dpjp: doctors.length > 0 ? doctors[0].name : 'Dr. Tirta', 
                status_treatment: 'Rawat Jalan', date: new Date().toISOString().split('T')[0] 
            });
            fetchPatients();
        } catch (err) {
            triggerToast('error', 'Gagal menyimpan data master ke Supabase Cloud.');
        } finally {
            setIsSaving(false);
        }
    };

    const executeRevisit = async () => {
        if (!selectedPatientForRevisit) return;
        const p = selectedPatientForRevisit;
        
        const revisitPayload = {
            no_rm: p.no_rm || p.norm || '',
            title: p.title || 'Tn.',
            name: p.name || '',
            age: p.age || '',
            gender: p.gender || 'Laki-Laki',
            unit: p.unit || 'Poli Umum',
            dpjp: doctors.length > 0 ? doctors[0].name : 'Dr. Tirta',
            status_treatment: p.status_treatment || 'Rawat Jalan', // Otomatis membawa status perawatan terakhir
            date: new Date().toISOString().split('T')[0] 
        };

        setIsSaving(true);
        setSelectedPatientForRevisit(null);

        try {
            await axios.post(`${API_URL}/patients`, revisitPayload, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            triggerToast('success', `SUKSES BEROBAT ULANG! Sesi pendaftaran baru pasien ${revisitPayload.title} ${revisitPayload.name} berhasil diaktifkan.`);
            fetchPatients(); 
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            console.error("Gagal memproses sesi berobat ulang:", err);
            setFormData(revisitPayload);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleNextTourStep = () => {
        if (tourStep === 0) setTourStep(1);
        else if (tourStep === 1) setTourStep(2);
        else if (tourStep === 2) {
            sessionStorage.setItem('leximed_admin_tour_completed', 'true');
            setShowTour(false);
            navigate('/asisten/input-pemeriksaan');
        }
    };

    const handleCloseTour = () => {
        sessionStorage.setItem('leximed_admin_tour_completed', 'true');
        setShowTour(false);
    };

    const filteredPatients = filterDpjp === 'All' 
        ? patients 
        : patients.filter(p => p.dpjp === filterDpjp);

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans text-left pb-20 relative">
            <AnimatePresence>
                {toast.show && (
                    <motion.div 
                        initial={{ opacity: 0, y: -40, x: '-50%', scale: 0.95 }} 
                        animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }} 
                        exit={{ opacity: 0, y: -20, x: '-50%', scale: 0.95 }}
                        className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 rounded-2xl font-bold text-xs md:text-sm shadow-2xl border flex items-center gap-3 w-full max-w-xl text-left uppercase tracking-wider ${
                            toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                    >
                        {toast.type === 'success' ? <CheckCircle2 size={20} className="text-emerald-600 shrink-0" /> : <AlertCircle size={20} className="text-rose-600 shrink-0" />}
                        <span className="leading-relaxed">{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <motion.button whileHover={{ x: -5 }} onClick={() => navigate(-1)} className="group flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold transition-all bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
                        <ArrowLeft size={18} /> <span>Kembali ke Dashboard</span>
                    </motion.button>
                    <button onClick={() => { setTourStep(0); setShowTour(true); }} className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-black text-[10px] uppercase border border-blue-200 hover:bg-blue-100 flex items-center gap-1.5 transition-all shadow-sm">
                        <HelpCircle size={14} /> PANDUAN ALUR DEMO
                    </button>
                </div>

                <div className="bg-white rounded-[40px] shadow-xl shadow-slate-200/60 border border-slate-200 overflow-hidden">
                    <div className="bg-slate-900 p-10 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 pointer-events-none"><Users size={180} /></div>
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div className="p-5 bg-blue-600 rounded-3xl shadow-2xl shadow-blue-500/40"><UserPlus size={36} className="text-white" /></div>
                                <div>
                                    <h1 className="text-4xl font-black tracking-tight italic">Registrasi Pasien</h1>
                                    <p className="text-blue-400 text-xs font-black uppercase tracking-[0.3em] mt-2 flex items-center gap-2"><Database size={14} /> Master Data Central • Supabase</p>
                                </div>
                            </div>
                            <div className="bg-white/5 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10 flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest text-xs">Status Server</p>
                                    <p className="text-sm font-bold text-emerald-400">AKTIF & TERHUBUNG</p>
                                </div>
                                <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center"><div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping"></div></div>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 md:p-14 space-y-10">
                        <div className="space-y-6">
                            <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.3em] flex items-center gap-2"><UserCircle2 size={16} /> Data Profil Utama</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">No. Rekam Medis</label>
                                    <input type="text" placeholder="RM-0000" className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-mono font-black text-blue-600 text-lg shadow-inner uppercase" value={formData.no_rm} onChange={e => setFormData({...formData, no_rm: e.target.value.toUpperCase()})} required />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Panggilan (Title)</label>
                                    <select className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none font-bold text-slate-700 appearance-none cursor-pointer" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}>
                                        <option value="Tn.">Tn. (Tuan)</option>
                                        <option value="Ny.">Ny. (Nyonya)</option>
                                        <option value="An.">An. (Anak)</option>
                                        <option value="Nona">Nona</option>
                                        <option value="By.">By. (Bayi)</option>
                                    </select>
                                </div>
                                <div className="space-y-3 md:col-span-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap Sesuai KTP</label>
                                    <input type="text" placeholder="Masukkan Nama..." className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none transition-all font-bold text-slate-700 text-lg" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1"><CalendarClock size={14}/> Umur Pasien</label>
                                <div className="relative">
                                    <input type="number" placeholder="0" className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none font-bold text-slate-700 text-lg" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} required />
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-xs text-slate-300 uppercase">Tahun</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Jenis Kelamin</label>
                                <select className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none font-bold text-slate-700 appearance-none cursor-pointer" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                                    <option value="Laki-Laki">Laki-Laki</option>
                                    <option value="Perempuan">Perempuan</option>
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Status Perawatan (Kunjungan)</label>
                                <select className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none font-bold text-slate-700 appearance-none cursor-pointer" value={formData.status_treatment} onChange={e => setFormData({...formData, status_treatment: e.target.value})}>
                                    <option value="Rawat Jalan">Rawat Jalan</option>
                                    <option value="Rawat Inap">Rawat Inap</option>
                                    <option value="UGD">Gawat Darurat (UGD)</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1"><Building2 size={14}/> Unit Pelayanan / Poli</label>
                                <select className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none font-bold text-slate-700 appearance-none cursor-pointer" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} required >
                                    <option value="Poli Umum">Poli Umum</option>
                                    <option value="Poli Penyakit Dalam">Poli Penyakit Dalam</option>
                                    <option value="Poli Jantung">Poli Jantung</option>
                                    <option value="Poli Paru">Poli Paru</option>
                                    <option value="Poli Saraf">Poli Saraf</option>
                                    <option value="Bangsal Mawar">Bangsal Mawar</option>
                                    <option value="Bangsal Melati">Bangsal Melati</option>
                                    <option value="UGD">Zona Triage IGD</option>
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-blue-500 uppercase tracking-widest ml-1 flex items-center gap-1"><Stethoscope size={14}/> Dokter DPJP Tujuan</label>
                                <div className="relative">
                                    <select className="w-full px-5 py-4 bg-blue-50 border-2 border-blue-100 rounded-2xl focus:border-blue-500 outline-none transition-all font-black text-blue-800 appearance-none cursor-pointer" value={formData.dpjp} onChange={e => setFormData({...formData, dpjp: e.target.value})} required disabled={isLoadingDoctors}>
                                        {isLoadingDoctors ? <option>Memuat data dokter...</option> : doctors.map((doc) => <option key={doc.id} value={doc.name}>{doc.name} — {doc.unit || 'Spesialis'}</option>)}
                                    </select>
                                    {isLoadingDoctors && <Loader2 className="absolute right-4 top-4 animate-spin text-blue-500" size={20} />}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1"><Clock size={14}/> Tanggal Registrasi</label>
                                <input type="date" className="w-full px-5 py-4 bg-slate-100 border-2 border-slate-200 rounded-2xl outline-none font-bold text-slate-500 cursor-not-allowed shadow-inner" value={formData.date} disabled />
                            </div>
                        </div>

                        <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="flex items-center gap-4 text-emerald-600 bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100">
                                <ShieldCheck size={24} />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest leading-none">Keamanan Data</p>
                                    <p className="text-xs font-bold mt-1 text-emerald-700">Tersinkronisasi dengan Database Inti</p>
                                </div>
                            </div>
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isSaving} className={`flex items-center justify-center gap-4 px-12 py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl transition-all w-full md:w-auto ${isSaving ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/40'}`}>
                                {isSaving ? <><Loader2 className="animate-spin" size={20} /> <span>Menyimpan...</span></> : <><CheckCircle size={20} /> <span>Registrasi Pasien</span></>}
                            </motion.button>
                        </div>
                    </form>
                </div>

                {/* ── KOTAK DAFTAR PASIEN & MODE BEROBAT ULANG ── */}
                <div className="bg-white rounded-[40px] shadow-xl shadow-slate-200/40 border border-slate-200 overflow-hidden">
                    <div className="p-8 md:p-10 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-50/50">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3"><History className="text-emerald-500" size={28} /> Daftar Pasien Terintegrasi</h2>
                            <p className="text-slate-500 text-sm font-medium mt-1">Klik baris pasien untuk memuat data pendaftaran kunjungan berobat ulang.</p>
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <select value={filterDpjp} onChange={(e) => setFilterDpjp(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 text-xs uppercase tracking-wider outline-none focus:border-blue-500 appearance-none cursor-pointer shadow-sm">
                                    <option value="All">Semua Dokter DPJP</option>
                                    {doctors.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                                </select>
                            </div>
                            <button onClick={fetchPatients} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-blue-600 shadow-sm transition-colors shrink-0">
                                <RefreshCw size={18} className={isLoadingPatients ? "animate-spin text-blue-500" : ""} />
                            </button>
                        </div>
                    </div>

                    <div className="p-4 max-h-[500px] overflow-y-auto [&::-webkit-scrollbar]:hidden">
                        <AnimatePresence mode="popLayout">
                            {isLoadingPatients ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-20 flex flex-col items-center justify-center text-slate-400">
                                    <Loader2 className="animate-spin text-blue-500 mb-4" size={40}/>
                                    <p className="font-bold text-xs uppercase tracking-widest">Menarik Data Pasien...</p>
                                </motion.div>
                            ) : filteredPatients.length > 0 ? (
                                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {filteredPatients.map((p, i) => (
                                        <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.3) }} key={p.id || p.no_rm || p.norm || i} whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} onClick={() => setSelectedPatientForRevisit(p)} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-blue-400 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between gap-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-mono font-black text-lg group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">{p.name ? p.name.charAt(0).toUpperCase() : 'P'}</div>
                                                    <div className="text-left">
                                                        <h4 className="font-black text-slate-800 text-lg line-clamp-1">{p.name}</h4>
                                                        <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                            <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{p.no_rm || p.norm}</span>
                                                            <span>•</span>
                                                            <span>{p.gender || 'Laki-Laki'} ({p.age || '0'} Thn)</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* 🚀 BARU: BADGE DINAMIS KLASIFIKASI KAMAR PASIEN */}
                                                <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 border shadow-sm ${
                                                    p.status_treatment === 'UGD' || p.status_treatment === 'IGD'
                                                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                        : p.status_treatment === 'Rawat Inap'
                                                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                        : 'bg-blue-50 text-blue-700 border-blue-200'
                                                }`}>
                                                    {p.status_treatment || 'Rawat Jalan'}
                                                </span>
                                            </div>
                                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
                                                <span className="text-slate-400 flex items-center gap-1"><Stethoscope size={12}/> {p.dpjp || 'Dr. Tirta'}</span>
                                                <span className="text-emerald-500 flex items-center gap-1">Berobat Ulang <ChevronRight size={12}/></span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-20 text-center text-slate-400">
                                    <Database size={48} className="mx-auto mb-4 opacity-50" />
                                    <p className="font-bold text-xs uppercase tracking-widest">Tidak Ada Pasien Ditemukan</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* ── MODAL BEROBAT ULANG INTERAKTIF ── */}
            <AnimatePresence>
                {selectedPatientForRevisit && (
                    <div className="fixed inset-0 z-[60] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }} 
                            animate={{ scale: 1, opacity: 1, y: 0 }} 
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-md p-8 rounded-[2rem] shadow-2xl relative text-center space-y-6 border border-slate-100"
                        >
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-600 mb-2">
                                <History size={36} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Kunjungan Berobat Ulang</h3>
                                <p className="text-slate-500 text-sm font-medium mt-2 leading-relaxed">
                                    Tarik data pasien <strong className="text-slate-800">{selectedPatientForRevisit.name} ({selectedPatientForRevisit.no_rm || selectedPatientForRevisit.norm})</strong> ke dalam formulir pendaftaran untuk membuat sesi kunjungan klinis baru?
                                </p>
                            </div>
                            <div className="flex gap-3 pt-4 border-t border-slate-100">
                                <button 
                                    type="button"
                                    onClick={() => setSelectedPatientForRevisit(null)}
                                    className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-slate-200 transition-colors"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="button"
                                    onClick={executeRevisit}
                                    className="flex-1 py-3 bg-blue-600 text-white font-black rounded-xl text-xs uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex justify-center items-center gap-2"
                                >
                                    <CheckCircle2 size={16} /> Ya, Tarik Data
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── MULTI-PAGE GUIDED TOUR DIALOG FOR JUDGES ── */}
            <AnimatePresence>
                {showTour && (
                    <div className="fixed inset-0 z-[70] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ scale: 0.95, y: 20 }} 
                            animate={{ scale: 1, y: 0 }} 
                            exit={{ scale: 0.95, y: 20 }} 
                            className="bg-[#0f172a] border border-white/10 w-full max-w-md p-6 md:p-8 rounded-[2rem] shadow-2xl relative text-left space-y-6 text-white"
                        >
                            <div className="flex gap-1.5">
                                {tourSteps.map((_, idx) => (
                                    <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === tourStep ? 'w-8 bg-blue-500' : 'w-2 bg-slate-700'}`}/>
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
                                <p className="text-slate-400 text-sm font-medium leading-relaxed">
                                    {tourSteps[tourStep].desc}
                                </p>
                            </div>
                            
                            <div className="flex items-center justify-between pt-4 border-t border-white/5 gap-4">
                                <button 
                                    type="button"
                                    onClick={handleCloseTour} 
                                    className="text-xs font-bold text-slate-500 hover:text-slate-300 uppercase tracking-wider"
                                >
                                    Selesai & Keluar
                                </button>
                                <button 
                                    type="button"
                                    onClick={handleNextTourStep} 
                                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 active:scale-95 shadow-lg shadow-blue-900/40 transition-all"
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
}