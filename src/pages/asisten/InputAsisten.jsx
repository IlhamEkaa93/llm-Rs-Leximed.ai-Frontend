import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Activity, HeartPulse, Thermometer, Wind, 
    Save, Mic, MicOff, User, Database, ClipboardList, 
    Loader2, CheckCircle2, AlertCircle, Info
} from 'lucide-react';

const InputAsisten = () => {
    // --- STATE VITAL SIGNS ---
    const [tdSistolik, setTdSistolik] = useState('');
    const [tdDiastolik, setTdDiastolik] = useState('');
    const [nadi, setNadi] = useState('');
    const [suhu, setSuhu] = useState('');
    const [spo2, setSpo2] = useState('');
    
    // --- STATE KELUHAN & UI ---
    const [keluhanAwal, setKeluhanAwal] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [activePatient, setActivePatient] = useState(null);
    const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error'
    const [errorMessage, setErrorMessage] = useState(''); // Menyimpan detail error backend

    const recognitionRef = useRef(null);
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
    const token = localStorage.getItem('access_token');

    // --- 1. INITIAL LOAD & SPEECH SETUP ---
    useEffect(() => {
        // Ambil data pasien aktif
        const savedPatient = localStorage.getItem('active_patient');
        if (savedPatient) {
            try {
                setActivePatient(JSON.parse(savedPatient));
            } catch (e) {
                console.error("Gagal membaca data pasien", e);
            }
        }

        // Inisialisasi Web Speech API
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'id-ID';

            recognition.onresult = (event) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript + ' ';
                    }
                }
                if (finalTranscript) setKeluhanAwal((prev) => prev + finalTranscript);
            };

            recognition.onerror = (event) => {
                console.error("Speech error:", event.error);
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }

        return () => {
            if (recognitionRef.current) recognitionRef.current.stop();
        };
    }, []);

    // --- 2. HANDLERS ---
    const toggleListening = () => {
        if (!recognitionRef.current) return alert("Browser tidak mendukung Voice Note.");
        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const handleSave = async () => {
        // Validasi Dasar
        if (!activePatient) return alert("Silakan pilih pasien di Dashboard terlebih dahulu!");
        if (!tdSistolik || !tdDiastolik || !nadi || !suhu || !spo2 || !keluhanAwal) {
            return alert("Mohon lengkapi seluruh Tanda Vital (TTV) dan Keluhan Pasien sebelum menyimpan.");
        }

        setIsSaving(true);
        setSaveStatus(null);
        setErrorMessage('');

        try {
            // PAYLOAD: Sinkron dengan database PostgreSQL
            const payload = {
                patient_id: activePatient.norm || activePatient.no_rm,
                blood_pressure: `${tdSistolik}/${tdDiastolik}`,
                heart_rate: nadi.toString(),
                temperature: suhu.toString(),
                oxygen_saturation: spo2.toString(),
                raw_content: keluhanAwal,
                source: "manual",
                status: 'draft' // Masuk ke antrean verifikasi dokter
            };

            const response = await axios.post(`${API_URL}/clinical-data`, payload, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (response.data.success) {
                setSaveStatus('success');
                // Auto-clear setelah sukses
                setTdSistolik(''); setTdDiastolik(''); setNadi(''); setSuhu(''); setSpo2(''); setKeluhanAwal('');
                setTimeout(() => setSaveStatus(null), 4000);
            }
        } catch (error) {
            console.error("Simpan Error:", error.response?.data);
            setSaveStatus('error');
            // Menangkap pesan error spesifik dari Laravel agar mudah di-debug
            const backendError = error.response?.data?.message || error.response?.data?.error || "Koneksi ke server terputus.";
            setErrorMessage(backendError);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans pb-24 text-left">
            {/* --- HEADER --- */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }} 
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm"
            >
                <div className="flex items-center gap-5">
                    <div className="p-4 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 text-white">
                        <ClipboardList size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">Pemeriksaan Awal</h1>
                        <p className="text-slate-500 mt-1 font-medium flex items-center gap-2">
                            <User size={16} className="text-blue-500" /> Pasien: 
                            <span className="text-blue-700 bg-blue-50 px-3 py-0.5 rounded-full font-bold">
                                {activePatient ? `${activePatient.name} (${activePatient.norm || activePatient.no_rm})` : 'BELUM DIPILIH'}
                            </span>
                        </p>
                    </div>
                </div>
                <div className="bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100 flex items-center gap-3">
                    <div className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </div>
                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">PostgreSQL Ready</span>
                </div>
            </motion.div>

            <div className="max-w-6xl mx-auto space-y-8">
                
                {/* --- EDUKASI PANEL --- */}
                <div className="flex items-start gap-4 bg-blue-50 p-6 rounded-[2rem] border border-blue-100">
                    <Info className="text-blue-600 mt-1 shrink-0" size={24} />
                    <div>
                        <h4 className="text-sm font-black text-blue-900 uppercase">Instruksi Asisten:</h4>
                        <p className="text-xs text-blue-700 mt-1 font-medium leading-relaxed">
                            Pastikan data Tanda Tanda Vital (TTV) diisi dengan angka yang valid. Data keluhan akan dikirimkan ke Dashboard Dokter dan diolah menggunakan <b>AI Llama 3.3</b> menjadi format SOAP.
                        </p>
                    </div>
                </div>

                {/* --- VITAL SIGNS GRID --- */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Tensi */}
                    <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col items-center transition-all hover:border-blue-400 hover:shadow-md group">
                        <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 mb-4 group-hover:scale-110 transition-transform"><Activity size={24} /></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Tensi (mmHg)</span>
                        <div className="flex items-center gap-2">
                            <input type="number" placeholder="120" value={tdSistolik} onChange={(e)=>setTdSistolik(e.target.value)} className="w-14 text-center text-2xl font-black border-b-2 border-slate-100 outline-none focus:border-blue-500 transition-colors" />
                            <span className="text-xl font-bold text-slate-300">/</span>
                            <input type="number" placeholder="80" value={tdDiastolik} onChange={(e)=>setTdDiastolik(e.target.value)} className="w-14 text-center text-2xl font-black border-b-2 border-slate-100 outline-none focus:border-blue-500 transition-colors" />
                        </div>
                    </motion.div>

                    {/* Nadi */}
                    <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col items-center transition-all hover:border-red-400 hover:shadow-md group">
                        <div className="p-3 bg-red-50 rounded-2xl text-red-600 mb-4 group-hover:scale-110 transition-transform"><HeartPulse size={24} /></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Nadi (bpm)</span>
                        <input type="number" placeholder="80" value={nadi} onChange={(e)=>setNadi(e.target.value)} className="w-20 text-center text-3xl font-black border-b-2 border-slate-100 outline-none focus:border-red-500 transition-colors" />
                    </motion.div>

                    {/* Suhu */}
                    <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col items-center transition-all hover:border-orange-400 hover:shadow-md group">
                        <div className="p-3 bg-orange-50 rounded-2xl text-orange-600 mb-4 group-hover:scale-110 transition-transform"><Thermometer size={24} /></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Suhu (°C)</span>
                        <input type="number" step="0.1" placeholder="36.5" value={suhu} onChange={(e)=>setSuhu(e.target.value)} className="w-24 text-center text-3xl font-black border-b-2 border-slate-100 outline-none focus:border-orange-500 transition-colors" />
                    </motion.div>

                    {/* SpO2 */}
                    <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col items-center transition-all hover:border-cyan-400 hover:shadow-md group">
                        <div className="p-3 bg-cyan-50 rounded-2xl text-cyan-600 mb-4 group-hover:scale-110 transition-transform"><Wind size={24} /></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">SpO2 (%)</span>
                        <input type="number" placeholder="98" value={spo2} onChange={(e)=>setSpo2(e.target.value)} className="w-20 text-center text-3xl font-black border-b-2 border-slate-100 outline-none focus:border-cyan-500 transition-colors" />
                    </motion.div>
                </div>

                {/* --- KELUHAN SECTION --- */}
                <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-200 relative overflow-hidden">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-900 rounded-xl text-white"><ClipboardList size={20}/></div>
                            <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">Wawancara Keluhan Utama</h3>
                        </div>
                        <button 
                            onClick={toggleListening} 
                            className={`flex items-center gap-3 px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-md ${
                                isListening 
                                ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-100' 
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {isListening ? <><Activity size={14} /> Merekam Suara...</> : <><MicOff size={14} /> Gunakan Voice Note</>}
                        </button>
                    </div>

                    <textarea 
                        className="w-full h-[250px] p-8 border-2 border-slate-100 rounded-[2.5rem] outline-none text-lg font-medium leading-relaxed bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all resize-none shadow-inner"
                        placeholder="Klik 'Voice Note' atau ketik keluhan pasien di sini secara detail..." 
                        value={keluhanAwal} 
                        onChange={(e) => setKeluhanAwal(e.target.value)}
                    />

                    {/* STATUS NOTIFICATION */}
                    <AnimatePresence>
                        {saveStatus && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                className={`p-5 rounded-2xl flex items-start gap-3 font-bold text-sm border ${
                                    saveStatus === 'success' 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                    : 'bg-red-50 text-red-700 border-red-200'
                                }`}
                            >
                                {saveStatus === 'success' ? <CheckCircle2 size={24} className="shrink-0 mt-0.5"/> : <AlertCircle size={24} className="shrink-0 mt-0.5"/>}
                                <div className="flex flex-col">
                                    <span>{saveStatus === 'success' ? "Data TTV dan Keluhan berhasil tersinkronisasi ke PostgreSQL!" : "Gagal menyimpan data."}</span>
                                    {saveStatus === 'error' && (
                                        <span className="text-xs font-medium text-red-500 mt-1 uppercase tracking-wider">{errorMessage}</span>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button 
                        onClick={handleSave} 
                        disabled={isSaving || !activePatient} 
                        className={`w-full mt-8 py-7 rounded-[2rem] flex items-center justify-center gap-4 font-black text-sm uppercase tracking-[0.3em] transition-all shadow-2xl ${
                            isSaving || !activePatient 
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border border-slate-200' 
                            : 'bg-[#0f172a] text-white hover:bg-blue-600 hover:-translate-y-1 active:scale-95 shadow-blue-900/20'
                        }`}
                    >
                        {isSaving ? (
                            <><Loader2 className="animate-spin" size={24} /> SINKRONISASI KE DATABASE...</>
                        ) : (
                            <><Save size={24} /> SIMPAN KE REKAM MEDIS DOKTER</>
                        )}
                    </button>
                </div>
            </div>
            
            {/* Info Footer */}
            <div className="mt-12 flex items-center justify-center gap-6 opacity-40">
                <Database size={20} />
                <div className="h-4 w-px bg-slate-400"></div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">
                    PostgreSQL Core • Real-time Data Integrity • DARSI
                </p>
            </div>
        </div>
    );
};

export default InputAsisten;