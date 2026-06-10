// ============================================================================
// LEXIMED.AI — DashboardAsisten.jsx (v2.7 - ISO REALTIME QUEUE ARCHITECTURE)
// 100% Bebas Error Semicolon Parser & Integrasi Dual-Engine Triage Dashboard
// Fitur Tambahan: Antrean Harian Otomatis + Panel Form Pencarian Spesifik Global
// Fitur Utama: Alur Kerja Sistem Guided Tour Pop-up Lintas Halaman Otonom Juri
// Mempertahankan 100% Layout Grid Animasi Seksi, Estetika Clean, & Motion Core
// FIX: Kalibrasi Filter Penanggalan ISO Standard (Sinkronisasi Mutlak Pasien Re-visit)
// ============================================================================

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, Search, Calendar, UserPlus, HelpCircle,
    ArrowRight, Loader2, Database, AlertCircle, CheckCircle2, ChevronRight, BrainCircuit 
} from 'lucide-react';

const DashboardAsisten = () => {
    const navigate = useNavigate();
    
    // State untuk Antrean Harian
    const [patients, setPatients] = useState([]); 
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activePatientNorm, setActivePatientNorm] = useState(null);

    // State Tambahan untuk Form Pencarian Spesifik
    const [searchTerm, setSearchTerm] = useState('');
    const [searchLoading, setSearchLoading] = useState(false);

    // ── STATE: INTERACTIVE WORKFLOW TOUR PANDUAN JURI ──
    const [showTour, setShowTour] = useState(false);
    const [tourStep, setTourStep] = useState(0);

    const tourSteps = [
        {
            title: "Alur Kerja Sistem: Stasiun Kerja Asisten",
            desc: "Selamat datang di Node Triage Asisten Medis. Di sini, data pasien harian yang dikirim oleh Admin akan muncul di antrean tunggu 'Ready' secara real-time.",
            icon: <BrainCircuit className="text-teal-400" size={24} />,
            actionLabel: "Mulai Panduan"
        },
        {
            title: "Langkah Kunci: Pilih Pasien決 Kunci Konteks",
            desc: "Untuk memulai penginputan Tanda Vital (TTV) dan keluhan utama pasien, klik tombol aksi utama di bawah untuk mengunci data pasien simulasi dari antrean.",
            icon: <Users className="text-blue-400" size={24} />,
            actionLabel: "Simulasikan Pengukuran TTV"
        }
    ];

    const API_URL = "https://lexi-med-ai-llm-rs-back-end.vercel.app/api";
    const token = localStorage.getItem('access_token');

    useEffect(() => {
        const savedPatient = localStorage.getItem('active_patient');
        if (savedPatient) {
            try {
                const parsedPatient = JSON.parse(savedPatient);
                setActivePatientNorm(parsedPatient.norm || parsedPatient.no_rm);
            } catch (e) {
                console.error("Format active_patient invalid");
            }
        }
        fetchPatients();

        // Cek apakah ada pemicu tur berkelanjutan dari halaman pendaftaran admin
        const savedStep = sessionStorage.getItem('leximed_admin_tour_completed');
        if (savedStep && !sessionStorage.getItem('leximed_asisten_tour_completed')) {
            setTourStep(0);
            setShowTour(true);
        }
    }, []);

    // ── 1. AMBIL DATA ANTREAN HARIAN REAL-TIME ──
    const fetchPatients = async () => {
        if (!token) {
            setError("Sesi Anda telah habis. Silakan login kembali.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/patients-list`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            const rawData = response.data;
            const patientsArray = Array.isArray(rawData) ? rawData : (rawData.data || Object.values(rawData || {}));

            // 🚀 FIX MUTLAK: Deteksi penanggalan hari ini menggunakan format ISO (YYYY-MM-DD)
            const todayIso = new Date().toISOString().split('T')[0];

            // Saring ketat antrean pasien harian (Bekerja akurat untuk registrasi baru maupun berobat ulang)
            const todaysPatients = patientsArray.filter(p => {
                const targetDateStr = p.date ? String(p.date) : '';
                const targetCreatedAtStr = p.created_at ? String(p.created_at).split('T')[0] : '';
                
                // Loloskan jika kolom date database cocok ATAU stempel created_at adalah hari ini
                return targetDateStr.includes(todayIso) || targetCreatedAtStr.includes(todayIso);
            });

            // Urutkan antrean agar re-visit atau pendaftaran paling anyar berada di posisi paling atas
            todaysPatients.sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at));

            setPatients(todaysPatients);
            setFilteredPatients(todaysPatients);
            setError(null);
        } catch (err) {
            console.error("Error Fetch Patients:", err);
            setError("Gagal menyinkronkan data dengan Supabase Cloud Gateway Node.");
        } finally {
            setLoading(false);
        }
    };

    // Filter instan pencarian search bar antrean harian
    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
        
        if (!query) {
            setFilteredPatients(patients);
            return;
        }

        const filtered = patients.filter(p => {
            const name = p.name ? String(p.name).toLowerCase() : '';
            const fontNorm = (p.norm || p.no_rm) ? String(p.norm || p.no_rm).toLowerCase() : '';
            return name.includes(query) || fontNorm.includes(query);
        });
        setFilteredPatients(filtered);
    };

    // ── 2. SUBMIT PENCARIAN SPESIFIK GLOBAL (LOOKUP ENGINE MASTER DATABASE) ──
    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) return alert("Masukkan Nomor RM atau Nama pasien terlebih dahulu!");

        setSearchLoading(true);
        try {
            const response = await axios.get(`${API_URL}/patients-master`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const rawData = response.data;
            const fullMasterPatients = Array.isArray(rawData) ? rawData : (rawData.data || Object.values(rawData || {}));

            const target = fullMasterPatients.find(p => 
                String(p.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
                String(p.norm || p.no_rm).toLowerCase().includes(searchTerm.toLowerCase())
            );

            if (target) {
                const rmIdentifier = target.norm || target.no_rm;
                const patientDataToSave = { ...target, norm: rmIdentifier };
                
                localStorage.setItem('active_patient', JSON.stringify(patientDataToSave));
                setActivePatientNorm(rmIdentifier);
                navigate('/asisten/input-pemeriksaan');
            } else {
                alert(`Pasien dengan identitas "${searchTerm}" tidak ditemukan di database global master.`);
            }
        } catch (err) {
            console.error("Global Lookup Error:", err);
            alert("Gagal melakukan penarikan rekam medis global database.");
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSelectPatient = (patient) => {
        const rmIdentifier = patient.norm || patient.no_rm;
        const patientDataToSave = { ...patient, norm: rmIdentifier };
        
        localStorage.setItem('active_patient', JSON.stringify(patientDataToSave));
        setActivePatientNorm(rmIdentifier);
        
        // Pemicu otomatis agar tour pop-up di halaman InputAsisten langsung menyala otonom
        sessionStorage.setItem('leximed_asisten_tour_step', 'input_ttv');
        navigate('/asisten/input-pemeriksaan');
    };

    // ── INTERACTIVE TOUR LOGIC ENGINE AUTOMATION FOR JUDGES ──
    const handleNextTourStep = () => {
        if (tourStep === 0) {
            setTourStep(1);
        } else if (tourStep === 1) {
            // Pilih secara otonom pasien teranyar dari daftar antrean harian riil
            const targetSimPatient = filteredPatients.length > 0 ? filteredPatients[0] : {
                id: 1, name: "TN. ADITYA", norm: "RM-001", status: "Rawat Jalan"
            };
            const rmIdentifier = targetSimPatient.norm || targetSimPatient.no_rm || "RM-001";
            
            localStorage.setItem('active_patient', JSON.stringify({ ...targetSimPatient, norm: rmIdentifier }));
            sessionStorage.setItem('leximed_asisten_tour_step', 'input_ttv');
            setShowTour(false);
            navigate('/asisten/input-pemeriksaan');
        }
    };

    const handleCloseTour = () => {
        sessionStorage.setItem('leximed_asisten_tour_completed', 'true');
        setShowTour(false);
    };

    const toggleTourRestart = () => {
        sessionStorage.removeItem('leximed_asisten_tour_completed');
        setTourStep(0);
        setShowTour(true);
    };

    return (
        <div className="space-y-8 pb-20 text-left relative">
            
            {/* ── HEADER PANEL ── */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
            >
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-3 italic">
                        <Users className="text-teal-600 w-8 h-8" />
                        Antrean Pasien Hari Ini
                    </h1>
                    <p className="text-slate-500 font-bold mt-2 flex items-center gap-2 text-xs uppercase tracking-wider">
                        <Calendar size={16} className="text-teal-400" /> 
                        Data harian terintegrasi sistem rekam medis central
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        type="button"
                        onClick={toggleTourRestart}
                        className="bg-teal-500/10 text-teal-600 border border-teal-500/20 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5 shadow-sm transition-all"
                    >
                        <HelpCircle size={14} /> ALUR KERJA SISTEM
                    </button>
                    <div className="bg-emerald-50 px-5 py-3 rounded-2xl border border-emerald-100 flex items-center gap-3">
                        <Database className="text-emerald-500" size={18} />
                        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Master Data Terhubung</span>
                    </div>
                </div>
            </motion.div>

            {/* ── LAYOUT GRID UTAMA ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* COLUMN KIRI: DAFTAR ANTREAN HARIAN PASIEN */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Search Bar Saring Antrean */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-500" size={18} />
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={handleSearch}
                                placeholder="Saring nama atau nomor RM pasien harian..." 
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none focus:border-teal-500 focus:bg-white transition-all placeholder:text-slate-400" 
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 min-h-[400px]">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-base font-black text-slate-800 uppercase tracking-wider">Daftar Pasien Menunggu</h3>
                            <span className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                                Hari Ini: {filteredPatients.length} Pasien
                            </span>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
                                <Loader2 className="animate-spin w-8 h-8 text-teal-500" />
                                <p className="font-bold uppercase tracking-widest text-[10px]">Sinkronisasi Antrean...</p>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center py-16 text-red-400 space-y-3 bg-red-50 rounded-2xl">
                                <AlertCircle className="w-10 h-10" />
                                <p className="font-bold text-center px-4 text-xs uppercase tracking-wider">{error}</p>
                            </div>
                        ) : filteredPatients.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
                                <UserPlus className="w-10 h-10 text-slate-300" />
                                <p className="font-bold uppercase tracking-widest text-[10px]">Belum ada antrean masuk hari ini.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <AnimatePresence mode="popLayout">
                                    {filteredPatients.map((patient, index) => {
                                        const rmNumber = patient.norm || patient.no_rm;
                                        const isActive = activePatientNorm === rmNumber;
                                        
                                        return (
                                            <motion.div 
                                                key={patient.id || rmNumber || index}
                                                initial={{ opacity: 0, scale: 0.95 }} 
                                                animate={{ opacity: 1, scale: 1 }} 
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className={`relative group bg-white border-2 rounded-2xl p-5 transition-all hover:shadow-lg flex flex-col justify-between h-44 ${
                                                    isActive 
                                                    ? 'border-teal-500 shadow-teal-500/10 bg-teal-50/10' 
                                                    : 'border-slate-100 hover:border-teal-300'
                                                }`}
                                            >
                                                {isActive && (
                                                    <div className="absolute -top-2.5 -right-2.5 bg-teal-500 text-white p-0.5 rounded-full shadow-lg z-20">
                                                        <CheckCircle2 size={16} />
                                                    </div>
                                                )}
                                                
                                                <div>
                                                    <div className="flex items-start justify-between mb-3">
                                                        <span className="bg-slate-100 text-slate-700 font-mono font-bold px-2 py-0.5 rounded-md text-xs">
                                                            {rmNumber}
                                                        </span>
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                                                            {patient.status_treatment || patient.status || 'Rawat Jalan'}
                                                        </span>
                                                    </div>
                                                    <h4 className="text-base font-black text-slate-800 leading-tight uppercase truncate" title={patient.name}>
                                                        {patient.name}
                                                    </h4>
                                                </div>

                                                <button 
                                                    type="button"
                                                    onClick={() => handleSelectPatient(patient)}
                                                    className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all ${
                                                        isActive
                                                        ? 'bg-teal-600 text-white shadow-md'
                                                        : 'bg-slate-100 text-slate-600 group-hover:bg-teal-500 group-hover:text-white'
                                                    }`}
                                                >
                                                    {isActive ? 'Konteks Terkunci' : 'Mulai Triage'} <ArrowRight size={14} />
                                                </button>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>

                {/* COLUMN KANAN: CARD CARI PASIEN SPESIFIK GLOBAL */}
                <div className="space-y-6">
                    <div className="bg-[#0f172a] p-6 rounded-[24px] text-white shadow-2xl relative overflow-hidden group">
                        <h3 className="text-lg font-black mb-6 flex items-center gap-2 text-left">
                            <Search size={20} className="text-emerald-400" /> Cari Pasien Spesifik
                        </h3>
                        <form onSubmit={handleSearchSubmit} className="space-y-4">
                            <input 
                                type="text" 
                                placeholder="No. RM atau Nama..." 
                                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl py-4 px-5 text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold placeholder:text-slate-500 text-sm"
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <motion.button 
                                whileTap={{ scale: 0.95 }} 
                                type="submit"
                                disabled={searchLoading}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {searchLoading ? (
                                    <Loader2 className="animate-spin" size={18} />
                                ) : (
                                    <><Database size={18} /> Tarik Rekam Medis Global</>
                                )}
                            </motion.button>
                        </form>
                    </div>
                </div>

            </div>

            {/* ── ALUR KERJA SISTEM PANDUAN DIALOG FOR DEWAN JURI ── */}
            <AnimatePresence>
                {showTour && (
                    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ scale: 0.95, y: 20 }} 
                            animate={{ scale: 1, y: 0 }} 
                            exit={{ scale: 0.95, y: 20 }} 
                            className="bg-[#0f172a] border border-white/10 w-full max-w-md p-6 md:p-8 rounded-[2rem] shadow-2xl relative text-left space-y-6 text-white"
                        >
                            <div className="flex gap-1.5">
                                {tourSteps.map((_, idx) => (
                                    <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === tourStep ? 'w-8 bg-teal-500' : 'w-2 bg-slate-700'}`}/>
                                ))}
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/5 border border-white/10 rounded-xl">{tourSteps[tourStep].icon}</div>
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
                                    className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 active:scale-95 shadow-lg shadow-teal-900/40 transition-all animate-pulse"
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

export default DashboardAsisten;