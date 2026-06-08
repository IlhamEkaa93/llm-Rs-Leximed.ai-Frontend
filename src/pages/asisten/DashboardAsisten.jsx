import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, Search, Calendar, UserPlus, 
    ArrowRight, Loader2, Database, AlertCircle, CheckCircle2 
} from 'lucide-react';

const DashboardAsisten = () => {
    const navigate = useNavigate();
    
    const [patients, setPatients] = useState([]); 
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activePatientNorm, setActivePatientNorm] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || "https://lexi-med-ai-llm-rs-back-end.vercel.app/api";
    const token = localStorage.getItem('access_token');

    useEffect(() => {
        const savedPatient = localStorage.getItem('active_patient');
        if (savedPatient) {
            try {
                const parsedPatient = JSON.parse(savedPatient);
                // Kompatibilitas untuk property norm atau no_rm
                setActivePatientNorm(parsedPatient.norm || parsedPatient.no_rm);
            } catch (e) {
                console.error("Format active_patient invalid");
            }
        }
        fetchPatients();
    }, []);

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

            // Ekstrak data dengan aman (apakah berwujud object {data: []} atau langsung array [])
            const rawData = response.data;
            const patientsArray = Array.isArray(rawData) ? rawData : (rawData.data || []);

            // Ambil tanggal hari ini format lokal (dd/mm/yyyy)
            const today = new Date().toLocaleDateString('id-ID', {
                day: '2-digit', month: '2-digit', year: 'numeric'
            });

            // Filter pasien hari ini
            const todaysPatients = patientsArray.filter(p => {
                const isTodayStr = p.date === today;
                const isTodayIso = p.created_at && String(p.created_at).startsWith(new Date().toISOString().split('T')[0]);
                return isTodayStr || isTodayIso;
            });
            
            // Atur ke state
            setPatients(todaysPatients);
            setFilteredPatients(todaysPatients);
            setError(null);
        } catch (err) {
            if (err.response?.status === 401) {
                setError('Sesi (Token) tidak valid atau kedaluwarsa. Silakan Logout dan Login kembali.');
            } else {
                setError('Gagal memuat data pasien. Pastikan database PostgreSQL aktif.');
            }
            console.error("Error Fetch Patients:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
        
        if (!query) {
            setFilteredPatients(patients);
            return;
        }

        const filtered = patients.filter(p => {
            const name = p.name ? String(p.name).toLowerCase() : '';
            // PERBAIKAN: Gunakan p.norm atau p.no_rm sesuai format JSON backend
            const norm = (p.norm || p.no_rm) ? String(p.norm || p.no_rm).toLowerCase() : '';
            return name.includes(query) || norm.includes(query);
        });
        setFilteredPatients(filtered);
    };

    const handleSelectPatient = (patient) => {
        // PERBAIKAN: Pastikan kita menyimpan identifier RM yang valid
        const rmIdentifier = patient.norm || patient.no_rm;
        
        // Simpan data utuh pasien ke local storage dengan format konsisten
        const patientDataToSave = { ...patient, norm: rmIdentifier };
        localStorage.setItem('active_patient', JSON.stringify(patientDataToSave));
        
        setActivePatientNorm(rmIdentifier);
        navigate('/asisten/input-pemeriksaan');
    };

    return (
        <div className="space-y-8 pb-20">
            <motion.div 
                initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
            >
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-3">
                        <Users className="text-teal-600 w-8 h-8" />
                        Antrean Pasien Hari Ini
                    </h1>
                    <p className="text-slate-500 font-medium mt-2 flex items-center gap-2">
                        <Calendar size={16} className="text-teal-400" /> 
                        Data ditarik dari Master Pendaftaran ({new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })})
                    </p>
                </div>

                <div className="bg-emerald-50 px-5 py-3 rounded-2xl border border-emerald-100 flex items-center gap-3">
                    <Database className="text-emerald-500" size={18} />
                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Master Data Terhubung</span>
                </div>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-lg relative z-10"
            >
                <div className="relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-teal-500" size={24} />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={handleSearch}
                        placeholder="Cari nama pasien atau Nomor RM..." 
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-5 pl-16 pr-6 text-slate-700 outline-none focus:border-teal-500 focus:bg-white transition-all font-bold text-lg placeholder:text-slate-400 placeholder:font-medium" 
                    />
                </div>
            </motion.div>

            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 min-h-[400px]">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Daftar Pasien Menunggu</h3>
                    <span className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
                        Total: {filteredPatients.length} Pasien
                    </span>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
                        <Loader2 className="animate-spin w-10 h-10 text-teal-500" />
                        <p className="font-bold uppercase tracking-widest text-xs">Menarik data dari database...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 text-red-400 space-y-4 bg-red-50 rounded-3xl">
                        <AlertCircle className="w-12 h-12" />
                        <p className="font-bold text-center px-4">{error}</p>
                    </div>
                ) : filteredPatients.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
                        <UserPlus className="w-12 h-12 text-slate-300" />
                        <p className="font-bold uppercase tracking-widest text-xs">Tidak ada antrean hari ini.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredPatients.map((patient, index) => {
                                // Ekstraksi Nomor RM yang aman
                                const rmNumber = patient.norm || patient.no_rm;
                                const isActive = activePatientNorm === rmNumber;
                                
                                return (
                                    <motion.div 
                                        key={patient.id || rmNumber || index}
                                        initial={{ opacity: 0, scale: 0.9 }} 
                                        animate={{ opacity: 1, scale: 1 }} 
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`relative group bg-white border-2 rounded-3xl p-6 transition-all hover:shadow-xl ${
                                            isActive 
                                            ? 'border-teal-500 shadow-teal-500/20' 
                                            : 'border-slate-100 hover:border-teal-300'
                                        }`}
                                    >
                                        {isActive && (
                                            <div className="absolute -top-3 -right-3 bg-teal-500 text-white p-1 rounded-full shadow-lg">
                                                <CheckCircle2 size={20} />
                                            </div>
                                        )}
                                        
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Nomor RM</span>
                                                <span className="bg-slate-100 text-slate-700 font-mono font-bold px-3 py-1 rounded-lg text-sm">
                                                    {rmNumber}
                                                </span>
                                            </div>
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                                                patient.status === 'Gawat Darurat' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                                            }`}>
                                                {patient.status || 'Rawat Jalan'}
                                            </span>
                                        </div>

                                        <h4 className="text-xl font-black text-slate-800 leading-tight mb-6 truncate" title={patient.name}>
                                            {patient.name}
                                        </h4>

                                        <button 
                                            onClick={() => handleSelectPatient(patient)}
                                            className={`w-full py-3 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest transition-all ${
                                                isActive
                                                ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30'
                                                : 'bg-slate-100 text-slate-600 group-hover:bg-teal-500 group-hover:text-white'
                                            }`}
                                        >
                                            {isActive ? 'Lanjut Pemeriksaan' : 'Mulai Pemeriksaan'} <ArrowRight size={16} />
                                        </button>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardAsisten;