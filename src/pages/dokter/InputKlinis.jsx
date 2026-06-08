// ============================================================================
// LEXIMED.AI — InputKlinis.jsx (v12.3 - ANTI-RESET SESSION & SMART PERSISTENCE)
// 100% Mengunci Teks dari Error Refresh Menggunakan Local Storage Cache Engine
// Fokus Hulu Ingesti: Catatan Keluhan Komprehensif + Pemicu Ekstraksi AI Fase 1
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Sparkles, Save, Database, User, Mic, MicOff, FileText, Activity, 
    Loader2, CheckCircle2, Info, XCircle
} from 'lucide-react';

const InputKlinis = () => {
    const navigate = useNavigate();
    
    // ANTI-RESET: Membaca cache ketikan terakhir langsung saat state pertama kali dibuat
    const [rawText, setRawText] = useState(() => {
        const cachedText = localStorage.getItem('leximed_cached_raw_text');
        return cachedText || '';
    });
    
    const [isSaving, setIsSaving] = useState(false);
    const [activePatient, setActivePatient] = useState(null);
    const [lastVitalSigns, setLastVitalSigns] = useState(null); 
    const [isListening, setIsListening] = useState(false);
    
    // Status Notifikasi
    const [saveStatus, setSaveStatus] = useState(null); 
    const [errorMessage, setErrorMessage] = useState('');

    const recognitionRef = useRef(null);

    const API_URL = import.meta.env.VITE_API_URL || "https://lexi-med-ai-llm-rs-back-end.vercel.app/api";
    const token = localStorage.getItem('access_token');

    // ANTI-RESET AUTOMATION: Menyimpan teks ketikan secara real-time ke browser cache setiap ada perubahan
    useEffect(() => {
        localStorage.setItem('leximed_cached_raw_text', rawText);
    }, [rawText]);

    // Inisialisasi Ambil Data Pasien Aktif
    useEffect(() => {
        const savedPatient = localStorage.getItem('active_patient');
        if (savedPatient) {
            try {
                const parsed = JSON.parse(savedPatient);
                setActivePatient(parsed);
                const rm = parsed.norm || parsed.no_rm;
                if (rm) fetchLastVitals(rm);
            } catch (error) {
                console.error("Format data pasien tidak valid.");
            }
        }

        // Setup Web Speech API (Untuk Perekam Voice Note)
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'id-ID';

            recognition.onresult = (event) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript + ' ';
                }
                if (finalTranscript) setRawText((prev) => prev + finalTranscript);
            };
            
            recognition.onerror = (event) => {
                console.error("Microphone Error: ", event.error);
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }
    }, []);

    const fetchLastVitals = async (rm) => {
        try {
            const res = await axios.get(`${API_URL}/clinical-data/${rm}`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            if (res.data) setLastVitalSigns(res.data);
        } catch (e) {
            console.log("Informasi: Pasien ini belum memiliki riwayat vital sign/clinical data sebelumnya.");
        }
    };

    const toggleListening = () => {
        if (!recognitionRef.current) return alert("Browser tidak mendukung fitur Voice-to-Text (Gunakan Chrome/Edge terbaru).");
        
        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const handleSaveRawData = async () => {
        if (!activePatient) return alert("Silakan pilih pasien di Dashboard terlebih dahulu!");
        if (!rawText.trim()) return alert("Catatan klinis atau instruksi medis tidak boleh kosong!");
        
        setIsSaving(true);
        setSaveStatus(null);
        setErrorMessage('');

        try {
            const rmIdentifier = activePatient.norm || activePatient.no_rm;

            const payload = {
                patient_id: rmIdentifier,
                raw_content: rawText,
                blood_pressure: lastVitalSigns?.blood_pressure || "---/--",
                heart_rate: lastVitalSigns?.heart_rate ? String(lastVitalSigns.heart_rate) : "--",
                temperature: lastVitalSigns?.temperature ? String(lastVitalSigns.temperature) : "--",
                oxygen_saturation: lastVitalSigns?.oxygen_saturation ? String(lastVitalSigns.oxygen_saturation) : "--",
                status: "draft" 
            };

            const response = await axios.post(`${API_URL}/clinical-data`, payload, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (response.data || response.status === 201 || response.status === 200) {
                setSaveStatus('success');
                
                // DATA DISAVE PERMANEN: Bersihkan cache anti-reset agar form kembali kosong untuk pasien berikutnya
                localStorage.removeItem('leximed_cached_raw_text');
                setRawText(''); 
                if (isListening) toggleListening(); 
                
                // Tahan 1.5 detik agar notifikasi sukses terbaca, lalu pindah otomatis kembali ke resume medis
                setTimeout(() => {
                    setSaveStatus(null);
                    navigate('/data-medis'); 
                }, 1500);
            }
            
        } catch (error) {
            console.error("Gagal Simpan Clinical Data:", error.response?.data);
            setSaveStatus('error');
            setErrorMessage(error.response?.data?.message || error.response?.data?.error || "Gagal menyimpan data ke PostgreSQL rs_uns_db.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fcfcfd] p-4 md:p-8 font-sans text-left pb-24">
            
            {/* ── HEADER PROFIL PASIEN AKTIF ── */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm"
            >
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-blue-600 rounded-3xl shadow-xl shadow-blue-100 text-white">
                        <Sparkles size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Update Catatan Medis</h1>
                        <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
                            <User size={16} className="text-blue-500" /> Pasien Aktif: 
                            <span className="text-blue-700 bg-blue-50 px-3 py-0.5 rounded-full font-bold">
                                {activePatient ? `${activePatient.name} (${activePatient.norm || activePatient.no_rm})` : 'BELUM ADA PASIEN DIPILIH'}
                            </span>
                        </p>
                    </div>
                </div>
                
                <div className="bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100 flex items-center gap-3">
                    <div className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </div>
                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest flex items-center gap-2">
                        <Database size={14} /> PostgreSQL SQL Link Active
                    </span>
                </div>
            </motion.div>

            <div className="max-w-4xl mx-auto space-y-6">
                {/* INSTRUCTION PANEL */}
                <div className="flex items-start gap-5 bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100">
                    <Info className="text-indigo-600 mt-1 shrink-0" size={24} />
                    <div>
                        <h4 className="text-sm font-black text-indigo-900 uppercase">Protokol Inteligensi Medis:</h4>
                        <p className="text-xs text-indigo-700 mt-1 font-medium leading-relaxed">
                            Input catatan klinis Anda secara detail. Sistem sudah dilengkapi pengaman **Anti-Reset Session** (ketikan aman dari refresh tidak sengaja). Setelah disimpan, data mentah keluhan ini otomatis diproses oleh **Groq AI Engine** di dashboard utama rekam medis.
                        </p>
                    </div>
                </div>

                {/* TEXT AREA CARD KELUHAN TERPADU */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden"
                >
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <FileText size={18} className="text-blue-500" /> Catatan Keluhan Utama & Instruksi Medis Pasien
                            </label>

                            <button onClick={toggleListening}
                                className={`flex items-center justify-center gap-3 px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${
                                    isListening ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-100 shadow-lg shadow-red-500/30' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 shadow-sm'
                                }`}
                            >
                                {isListening ? <><Activity size={16} /> Merekam Suara...</> : <><Mic size={16} /> Aktifkan Voice Note (Mic)</>}
                            </button>
                        </div>

                        <textarea 
                            className={`w-full h-[350px] p-8 border-2 rounded-[2.5rem] outline-none transition-all resize-none text-lg font-medium leading-relaxed shadow-inner ${
                                isListening ? 'bg-red-50/20 border-red-200 focus:border-red-400' : 'bg-[#fcfcfd] border-slate-100 focus:border-blue-500 focus:bg-white text-slate-700'
                            }`}
                            placeholder="Ketik catatan keluhan awal pasien di sini (Contoh: Pasien datang dengan keluhan diare semenjak 2 hari yang lalu...)"
                            value={rawText}
                            onChange={(e) => setRawText(e.target.value)}
                        />

                        {/* STATUS NOTIFICATION (SUCCESS / ERROR) */}
                        <AnimatePresence mode="wait">
                            {saveStatus && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0, marginTop: 0 }} 
                                    animate={{ opacity: 1, height: 'auto', marginTop: 16 }} 
                                    exit={{ opacity: 0, height: 0, marginTop: 0 }} 
                                    className={`p-5 rounded-2xl flex items-start gap-3 font-bold text-sm border-2 ${
                                        saveStatus === 'success' 
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                        : 'bg-red-50 text-red-700 border-red-100'
                                    }`}
                                >
                                    {saveStatus === 'success' ? <CheckCircle2 size={24} className="shrink-0 text-emerald-500" /> : <XCircle size={24} className="shrink-0 text-red-500" />}
                                    <div className="flex flex-col gap-1">
                                        <span>
                                            {saveStatus === 'success' 
                                                ? 'Berhasil Tersimpan! Memindahkan data keluhan asisten menuju Groq Engine...' 
                                                : 'Gagal Menyimpan Data.'
                                            }
                                        </span>
                                        {saveStatus === 'error' && errorMessage && (
                                            <span className="text-xs text-red-500 font-medium uppercase tracking-wider">{errorMessage}</span>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button 
                            onClick={handleSaveRawData} disabled={isSaving || !activePatient}
                            className={`w-full py-7 rounded-[2rem] flex items-center justify-center gap-4 font-black text-sm uppercase tracking-[0.3em] transition-all shadow-2xl ${
                                isSaving || !activePatient 
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-2 border-slate-100' 
                                : 'bg-[#0f172a] text-white hover:bg-blue-600 shadow-blue-900/20 hover:-translate-y-1 active:scale-95'
                            }`}
                        >
                            {isSaving ? <><Loader2 className="animate-spin" size={24} /> SINKRONISASI DATABASE POSTGRESQL...</> : <><Save size={24} /> SIMPAN & SINKRON KE REKAM MEDIS</>}
                        </button>
                    </div>
                </motion.div>
            </div>
            
            <div className="mt-16 flex items-center justify-center gap-6 opacity-30">
                <Database size={20} />
                <div className="h-4 w-px bg-slate-500"></div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">
                    PostgreSQL Core • Real-time Data Integrity • LexiMed.ai
                </p>
            </div>
        </div>
    );
};

export default InputKlinis;