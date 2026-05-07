import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Sparkles, Send, Database, AlertCircle, 
    Loader2, ClipboardCheck, History, Info,
    Cpu, Zap, Save, AlertTriangle, Edit3, User
} from 'lucide-react';

const InputKlinis = () => {
    const [rawText, setRawText] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // --- STATE UNTUK PASIEN & HUMAN-IN-THE-LOOP ---
    const [activePatient, setActivePatient] = useState(null);
    const [editableSummary, setEditableSummary] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    const API_URL = "http://localhost:8000/api";
    const token = localStorage.getItem('access_token');

    // PERBAIKAN: Menarik Pasien Aktif dari LocalStorage
    useEffect(() => {
        const savedPatient = localStorage.getItem('active_patient');
        if (savedPatient) setActivePatient(JSON.parse(savedPatient));
    }, []);

    const handleSummarize = async () => {
        if (!activePatient) return alert("PERHATIAN: Anda belum memilih pasien! Silakan kembali ke Dashboard dan pilih pasien.");
        if (!rawText) return alert("Mohon isi data mentah terlebih dahulu!");
        
        setLoading(true);
        setResult(null); 
        try {
            const response = await axios.post(`${API_URL}/clinical-data`, {
                // PERBAIKAN: Gunakan No RM Asli, bukan Math.random()
                patient_id: activePatient.norm, 
                source: "manual",
                raw_content: rawText
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            setResult(response.data.data);
            setEditableSummary(response.data.data.ai_summary);
            
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Gagal memproses data klinis.";
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        setIsVerifying(true);
        try {
            const response = await axios.patch(`${API_URL}/clinical-data/${result.patient_id}/verify`, {
                final_summary: editableSummary 
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if(response.data.success) {
                alert("Data berhasil diverifikasi dan disimpan permanen sebagai Rekam Medis sah!");
                setResult(null);
                setRawText('');
                setEditableSummary('');
            }
        } catch (error) {
            alert("Gagal melakukan verifikasi. Cek koneksi backend.");
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-left pb-20">
            {/* --- HEADER SECTION --- */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm"
            >
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3 italic uppercase">
                        <Sparkles className="text-blue-600 w-8 h-8" />
                        Input Klinis AI
                    </h1>
                    <p className="text-slate-500 font-medium flex items-center gap-2">
                        <User size={16} className="text-blue-400" /> Pasien Aktif: 
                        <strong className="text-blue-600 ml-1 bg-blue-50 px-2 py-0.5 rounded-md">
                            {activePatient ? `${activePatient.name} (${activePatient.norm})` : 'Belum Dipilih'}
                        </strong>
                    </p>
                </div>
                
                <div className="bg-emerald-50 px-5 py-3 rounded-2xl border border-emerald-100 flex items-center gap-3">
                    <div className="relative">
                        <Database className="text-emerald-500" size={18} />
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                    </div>
                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">PostgreSQL Sync</span>
                </div>
            </motion.div>

            {/* --- MAIN CONTENT GRID --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                
                {/* --- INPUT PANEL (KIRI) --- */}
                <motion.div 
                    initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                    className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-200 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full opacity-50 z-0"></div>
                    
                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Zap size={16} className="text-amber-500" /> Catatan Naratif Dokter (Raw Data)
                            </label>
                        </div>

                        <textarea 
                            className="w-full h-[450px] p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-blue-500 focus:bg-white outline-none transition-all resize-none text-slate-700 leading-relaxed font-medium placeholder:text-slate-300"
                            placeholder="Contoh: Pasien datang dengan keluhan sesak nafas sejak 2 hari yang lalu. Riwayat asma (+), tekanan darah 140/90..."
                            value={rawText}
                            onChange={(e) => setRawText(e.target.value)}
                        />

                        <motion.button 
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
                            onClick={handleSummarize}
                            disabled={loading || !activePatient}
                            className={`w-full py-5 rounded-[20px] flex items-center justify-center gap-4 font-black text-sm uppercase tracking-widest transition-all shadow-xl ${
                                loading || !activePatient ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-blue-600'
                            }`}
                        >
                            {loading ? (
                                <><Loader2 className="animate-spin" size={20} /> Memproses AI...</>
                            ) : (
                                <><Send size={18} /> GENERATE DRAFT RINGKASAN</>
                            )}
                        </motion.button>
                    </div>
                </motion.div>

                {/* --- RESULT PANEL HUMAN IN THE LOOP (KANAN) --- */}
                <motion.div 
                    initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
                    className="relative min-h-[600px]"
                >
                    <AnimatePresence mode='wait'>
                        {!result ? (
                            <motion.div 
                                key="empty"
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}
                                className="h-full w-full bg-slate-100/50 rounded-[2.5rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-center"
                            >
                                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg mb-6">
                                    <AlertCircle size={40} className="text-slate-300" />
                                </div>
                                <h3 className="text-xl font-black text-slate-400 mb-2 italic">Ready for Analysis</h3>
                                <p className="text-slate-400 max-w-[280px] font-medium leading-relaxed">Masukkan data klinis di panel kiri untuk memulai analisis otomatis.</p>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="result"
                                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-full"
                            >
                                <div className="p-8 border-b border-blue-500 bg-gradient-to-r from-blue-600 to-indigo-700 flex justify-between items-center text-white">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                                            <ClipboardCheck size={28} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black leading-none italic tracking-tight">Draft Ringkasan AI</h3>
                                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 flex items-center gap-1 mt-1">
                                                <Edit3 size={10} /> Mode Editor Aktif
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-[10px] font-black opacity-60 uppercase tracking-widest">NORM Pasien</span>
                                        <span className="text-lg font-mono font-bold tracking-tighter bg-white/20 px-2 py-1 rounded-md">{result.patient_id}</span>
                                    </div>
                                </div>

                                <div className="p-8 flex-1 bg-gradient-to-b from-blue-50/30 to-transparent flex flex-col">
                                    
                                    <div className="flex items-start gap-3 bg-amber-50 p-4 rounded-xl border border-amber-200 mb-6">
                                        <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
                                        <p className="text-xs text-amber-800 font-medium leading-relaxed">
                                            <b>Human-in-the-loop:</b> Silakan periksa dan edit ringkasan di bawah ini jika terdapat kekeliruan AI. Ringkasan ini belum disimpan permanen sebelum Anda menekan tombol verifikasi.
                                        </p>
                                    </div>

                                    <textarea 
                                        className="w-full flex-1 min-h-[250px] p-6 bg-blue-50/30 border-2 border-blue-100 rounded-3xl focus:border-blue-500 focus:bg-white outline-none transition-all resize-none text-slate-800 text-lg leading-relaxed font-medium"
                                        value={editableSummary}
                                        onChange={(e) => setEditableSummary(e.target.value)}
                                    />

                                    <div className="mt-6 pt-6 border-t border-slate-100">
                                        <button 
                                            onClick={handleVerify}
                                            disabled={isVerifying || !editableSummary.trim()}
                                            className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-lg ${
                                                isVerifying || !editableSummary.trim() 
                                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 active:scale-95'
                                            }`}
                                        >
                                            {isVerifying ? <Loader2 className="animate-spin" /> : <Save />}
                                            {isVerifying ? 'Menyimpan...' : 'Verifikasi & Simpan Final'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
};

export default InputKlinis;