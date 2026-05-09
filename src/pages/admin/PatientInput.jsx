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
    HeartPulse,
    UserCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const PatientInput = () => {
    const navigate = useNavigate();
    const [isSaving, setIsSaving] = useState(false);
    const [doctors, setDoctors] = useState([]);
    const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
    
    // State form lengkap dengan tambahan TITLE (Tn, Ny, dll)
    const [formData, setFormData] = useState({
        no_rm: '',
        title: 'Tn.', // Default Title
        name: '',
        age: '',
        gender: 'Laki-Laki', 
        unit: 'Poli Umum', 
        dpjp: '',
        status_treatment: 'Rawat Jalan',
        date: new Date().toISOString().split('T')[0] 
    });

    // Ambil daftar dokter dari PostgreSQL
    const fetchDoctors = useCallback(async () => {
        setIsLoadingDoctors(true);
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.get('https://lexi-med-ai-llm-rs-back-end.vercel.app/api/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const doctorList = response.data.data.filter(u => u.role === 'dokter');
            setDoctors(doctorList);
            
            // Set default DPJP jika ada data
            if(doctorList.length > 0 && !formData.dpjp) {
                setFormData(prev => ({ ...prev, dpjp: doctorList[0].name }));
            }
        } catch (error) {
            console.error("Gagal memuat daftar dokter:", error);
        } finally {
            setIsLoadingDoctors(false);
        }
    }, [formData.dpjp]);

    useEffect(() => {
        fetchDoctors();
    }, [fetchDoctors]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validasi Umur ketat
        if (!formData.age || parseInt(formData.age) <= 0) {
            return alert("Mohon masukkan umur pasien yang valid.");
        }

        setIsSaving(true);
        try {
            const token = localStorage.getItem('access_token');
            await axios.post('https://lexi-med-ai-llm-rs-back-end.vercel.app/api/patients', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            alert(`SUKSES! Pasien ${formData.title} ${formData.name} berhasil terdaftar di database.`);
            
            // Reset form ke kondisi awal
            setFormData({ 
                no_rm: '', 
                title: 'Tn.',
                name: '', 
                age: '', 
                gender: 'Laki-Laki', 
                unit: 'Poli Umum', 
                dpjp: doctors.length > 0 ? doctors[0].name : '', 
                status_treatment: 'Rawat Jalan', 
                date: new Date().toISOString().split('T')[0] 
            });
            
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Koneksi database terganggu.";
            alert('Gagal simpan data: ' + errorMsg);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans text-left pb-20">
            <div className="max-w-6xl mx-auto px-4 py-8">
                
                <motion.button 
                    whileHover={{ x: -5 }}
                    onClick={() => navigate(-1)}
                    className="group flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 font-bold transition-all bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200"
                >
                    <ArrowLeft size={18} /> 
                    <span>Kembali ke Dashboard</span>
                </motion.button>

                <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/60 border border-slate-200 overflow-hidden">
                    {/* Header Card Modern */}
                    <div className="bg-[#0f172a] p-10 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
                            <Users size={180} />
                        </div>
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div className="p-5 bg-blue-600 rounded-3xl shadow-2xl shadow-blue-500/40">
                                    <UserPlus size={36} className="text-white" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-black tracking-tight italic">Registrasi Pasien</h1>
                                    <p className="text-blue-400 text-xs font-black uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                                        <Database size={14} /> Master Data Central • PostgreSQL
                                    </p>
                                </div>
                            </div>
                            <div className="bg-white/5 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10 flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest text-xs">Status Server</p>
                                    <p className="text-sm font-bold text-emerald-400">AKTIF & TERHUBUNG</p>
                                </div>
                                <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 md:p-14 space-y-10">
                        
                        {/* SECTION 1: Identitas & Panggilan */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.3em] flex items-center gap-2">
                                <UserCircle2 size={16} /> Data Profil Utama
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">No. Rekam Medis</label>
                                    <input 
                                        type="text" 
                                        placeholder="RM-0000"
                                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-mono font-black text-blue-600 text-lg shadow-inner"
                                        value={formData.no_rm}
                                        onChange={e => setFormData({...formData, no_rm: e.target.value.toUpperCase()})}
                                        required 
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Panggilan (Title)</label>
                                    <select 
                                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none font-bold text-slate-700 appearance-none cursor-pointer"
                                        value={formData.title}
                                        onChange={e => setFormData({...formData, title: e.target.value})}
                                    >
                                        <option value="Tn.">Tn. (Tuan)</option>
                                        <option value="Ny.">Ny. (Nyonya)</option>
                                        <option value="An.">An. (Anak)</option>
                                        <option value="Nona">Nona</option>
                                        <option value="By.">By. (Bayi)</option>
                                    </select>
                                </div>
                                <div className="space-y-3 md:col-span-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap Sesuai KTP</label>
                                    <input 
                                        type="text" 
                                        placeholder="Masukkan Nama..."
                                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none transition-all font-bold text-slate-700 text-lg"
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                        required 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* SECTION 2: Medis Dasar */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                                   <CalendarClock size={14}/> Umur Pasien
                                </label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        placeholder="0"
                                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none font-bold text-slate-700 text-lg"
                                        value={formData.age}
                                        onChange={e => setFormData({...formData, age: e.target.value})}
                                        required 
                                    />
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-xs text-slate-300 uppercase">Tahun</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Jenis Kelamin</label>
                                <select 
                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none font-bold text-slate-700 appearance-none cursor-pointer"
                                    value={formData.gender}
                                    onChange={e => setFormData({...formData, gender: e.target.value})}
                                >
                                    <option value="Laki-Laki">Laki-Laki</option>
                                    <option value="Perempuan">Perempuan</option>
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Status Kunjungan</label>
                                <select 
                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none font-bold text-slate-700 appearance-none cursor-pointer"
                                    value={formData.status_treatment}
                                    onChange={e => setFormData({...formData, status_treatment: e.target.value})}
                                >
                                    <option value="Rawat Inap">Rawat Inap</option>
                                    <option value="Rawat Jalan">Rawat Jalan</option>
                                    <option value="IGD">Gawat Darurat (IGD)</option>
                                </select>
                            </div>
                        </div>

                        {/* SECTION 3: Penempatan */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                                    <Building2 size={14}/> Unit Pelayanan / Poli
                                </label>
                                <select 
                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none font-bold text-slate-700 appearance-none cursor-pointer"
                                    value={formData.unit}
                                    onChange={e => setFormData({...formData, unit: e.target.value})}
                                    required 
                                >
                                    <option value="Poli Umum">Poli Umum</option>
                                    <option value="Poli Penyakit Dalam">Poli Penyakit Dalam</option>
                                    <option value="Poli Jantung">Poli Jantung</option>
                                    <option value="Poli Paru">Poli Paru</option>
                                    <option value="Poli Saraf">Poli Saraf</option>
                                    <option value="Bangsal Melati">Bangsal Melati</option>
                                    <option value="Bangsal Teratai">Bangsal Teratai</option>
                                    <option value="IGD Triage">Zona Triage IGD</option>
                                </select>
                            </div>
                            
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-blue-500 uppercase tracking-widest ml-1 flex items-center gap-1">
                                    <Stethoscope size={14}/> Dokter DPJP
                                </label>
                                <div className="relative">
                                    <select 
                                        className="w-full px-5 py-4 bg-blue-50 border-2 border-blue-100 rounded-2xl focus:border-blue-500 outline-none transition-all font-black text-blue-800 appearance-none cursor-pointer"
                                        value={formData.dpjp}
                                        onChange={e => setFormData({...formData, dpjp: e.target.value})}
                                        required 
                                        disabled={isLoadingDoctors}
                                    >
                                        {isLoadingDoctors ? (
                                            <option>Memuat data...</option>
                                        ) : (
                                            doctors.map((doc) => (
                                                <option key={doc.id} value={doc.name}>
                                                    {doc.name} — {doc.unit || 'Spesialis'}
                                                </option>
                                            ))
                                        )}
                                    </select>
                                    {isLoadingDoctors && <Loader2 className="absolute right-4 top-4 animate-spin text-blue-500" size={20} />}
                                </div>
                            </div>
                        </div>

                        {/* Footer & Action */}
                        <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="flex items-center gap-4 text-emerald-600 bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100">
                                <ShieldCheck size={24} />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest leading-none">Keamanan Data</p>
                                    <p className="text-xs font-bold mt-1 text-emerald-700">Tersinkronisasi dengan PostgreSQL</p>
                                </div>
                            </div>
                            
                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit" 
                                disabled={isSaving}
                                className={`flex items-center justify-center gap-4 px-16 py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] shadow-2xl transition-all w-full md:w-auto ${
                                    isSaving 
                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/40'
                                }`}
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="animate-spin" size={22} />
                                        <span>Proses Pendaftaran...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={22} />
                                        <span>Simpan & Daftarkan Pasien</span>
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </form>
                </div>
                
                <div className="mt-10 flex items-center justify-center gap-6 opacity-40">
                    <Database size={20} />
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">
                        LexiMed.ai Smart Record System • 2026
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PatientInput;