import React, { useState } from 'react';
import axios from 'axios';
import { UserPlus, Database, CheckCircle, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PatientInput = () => {
    const navigate = useNavigate();
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        no_rm: '',
        name: '',
        age: '',
        gender: 'L',
        unit: '',
        dpjp: '',
        status_treatment: 'Rawat Inap'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // Mengirim data ke API Laravel
            const response = await axios.post('http://localhost:8000/api/patients', formData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Accept': 'application/json'
                }
            });
            
            alert('Sukses: Pasien ' + response.data.name + ' berhasil disimpan di PostgreSQL!');
            
            // Reset form setelah sukses
            setFormData({ no_rm: '', name: '', age: '', gender: 'L', unit: '', dpjp: '', status_treatment: 'Rawat Inap' });
            e.target.reset();
        } catch (err) {
            console.error(err);
            // Menangkap pesan error dari backend jika ada
            const errorMsg = err.response?.data?.message || err.message;
            alert('Gagal simpan data: ' + errorMsg);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-left pb-20 animate-fade-in">
            <div className="max-w-4xl mx-auto px-4 py-8">
                
                {/* Navigasi Balik */}
                <button 
                    onClick={() => navigate(-1)}
                    className="group flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 font-bold transition-all"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
                    <span>Kembali ke Dashboard</span>
                </button>

                <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
                    {/* Header Card */}
                    <div className="bg-[#0f172a] p-8 text-white relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <UserPlus size={120} />
                        </div>
                        <div className="relative z-10 flex items-center gap-5">
                            <div className="p-4 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/30">
                                <Database size={32} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black tracking-tight">Registrasi Pasien Baru</h1>
                                <p className="text-blue-300 text-sm font-bold uppercase tracking-widest mt-1">Master Data Central (PostgreSQL)</p>
                            </div>
                        </div>
                    </div>

                    {/* Form Utama */}
                    <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* No Rekam Medis */}
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">No. Rekam Medis (NORM)</label>
                                <input 
                                    type="text" 
                                    placeholder="Contoh: RM-1228"
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-mono font-bold text-blue-600 text-lg"
                                    onChange={e => setFormData({...formData, no_rm: e.target.value})}
                                    required 
                                />
                            </div>
                            {/* Nama Pasien */}
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Nama Lengkap Sesuai KTP</label>
                                <input 
                                    type="text" 
                                    placeholder="Masukkan nama pasien..."
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-700 text-lg"
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    required 
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Umur */}
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Umur (Tahun)</label>
                                <input 
                                    type="number" 
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-700"
                                    onChange={e => setFormData({...formData, age: e.target.value})}
                                    required 
                                />
                            </div>
                            {/* Gender */}
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Jenis Kelamin</label>
                                <select 
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-700 appearance-none"
                                    onChange={e => setFormData({...formData, gender: e.target.value})}
                                >
                                    <option value="L">Laki-Laki (L)</option>
                                    <option value="P">Perempuan (P)</option>
                                </select>
                            </div>
                            {/* Status Treatment */}
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Status Perawatan</label>
                                <select 
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-700 appearance-none"
                                    onChange={e => setFormData({...formData, status_treatment: e.target.value})}
                                >
                                    <option value="Rawat Inap">Rawat Inap</option>
                                    <option value="Rawat Jalan">Rawat Jalan</option>
                                    <option value="IGD">IGD</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Unit */}
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Unit / Bangsal</label>
                                <input 
                                    type="text" 
                                    placeholder="Contoh: Melati / Teratai / ICU"
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-700"
                                    onChange={e => setFormData({...formData, unit: e.target.value})}
                                    required 
                                />
                            </div>
                            {/* Dokter */}
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Dokter Penanggung Jawab (DPJP)</label>
                                <input 
                                    type="text" 
                                    placeholder="Nama Dokter Lengkap..."
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-700"
                                    onChange={e => setFormData({...formData, dpjp: e.target.value})}
                                    required 
                                />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                                <ShieldCheck size={18} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Enkripsi Data Aktif</span>
                            </div>
                            
                            <button 
                                type="submit" 
                                disabled={isSaving}
                                className={`flex items-center justify-center gap-3 px-12 py-5 rounded-[22px] font-black text-sm uppercase tracking-[0.2em] shadow-2xl transition-all w-full md:w-auto ${
                                    isSaving 
                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/40 hover:-translate-y-1 active:scale-95'
                                }`}
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        <span>Sinkronisasi...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={20} />
                                        <span>Simpan ke Database</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
                
                {/* Info Footer */}
                <p className="mt-8 text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
                    Sistem Rekam Medis Elektronik RS UNS © 2026
                </p>
            </div>
        </div>
    );
};

export default PatientInput;