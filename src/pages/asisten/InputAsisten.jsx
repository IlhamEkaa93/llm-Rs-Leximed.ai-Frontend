// ============================================================================
// LEXIMED.AI — InputAsisten.jsx (v2.8 - DYNAMIC INGESTION & TOAST ARCHITECTURE)
// 100% Bebas Error Semicolon Parser & Integrasi Dual-Engine Triage Dashboard
// Fitur Tambahan: Quick Ingest Buttons, Live Equalizer Wave Animation, & Neomorphic Glow
// Fitur Utama: Alur Kerja Sistem Guided Tour Pop-up Lintas Halaman Otonom Juri
// Mempertahankan 100% Fungsi Web Speech API, Voice Note, & Validasi Supabase Core
// FIX: Implementasi Premium Floating Toast Overlay Menggantikan Alert Browser
// FIX: Otomatisasi Suntikan Data Tour Mengikuti Karakteristik Klinis Pasien Aktif
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Activity, HeartPulse, Thermometer, Wind, HelpCircle, ChevronRight,
    Save, Mic, MicOff, User, Database, ClipboardList, BrainCircuit,
    Loader2, CheckCircle2, AlertCircle, Info, Sparkles, ChevronLeft
} from 'lucide-react';

export default function InputAsisten() {
    const navigate = useNavigate();
    const token = localStorage.getItem('access_token');
    const API_URL = "https://lexi-med-ai-llm-rs-back-end.vercel.app/api";
    
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
    const [saveStatus, setSaveStatus] = useState(null); 
    const [errorMessage, setErrorMessage] = useState(''); 

    // State Premium Floating Toast Notification Internal
    const [toast, setToast] = useState({ show: false, type: '', message: '' });

    // ── STATE: INTERACTIVE WORKFLOW TOUR PANDUAN JURI ──
    const [showTour, setShowTour] = useState(false);
    const [tourStep, setTourStep] = useState(0);

    const tourSteps = [
        {
            title: "Alur Kerja Sistem: Stasiun Pemeriksaan TTV",
            desc: "Konteks pasien berhasil dikunci di bilik asisten. Sekarang, mari kita simulasikan pemeriksaan tanda vital (TTV) komprehensif beserta keluhan utamanya.",
            icon: <ClipboardList className="text-teal-400" size={24} />,
            actionLabel: "Muat Data TTV Tiruan"
        },
        {
            title: "Alur Kerja Sistem: Ingesti Narasi Suara (Voice Note)",
            desc: "Hebat! Angka vital berhasil terisi. Selanjutnya, asisten medis dapat menggunakan fitur Voice Note terintegrasi untuk merekam penuturan lisan keluhan pasien secara real-time.",
            icon: <Mic className="text-blue-400" size={24} />,
            actionLabel: "Simulasikan Rekam Keluhan"
        },
        {
            title: "Alur Kerja Sistem: Distribusi Pipeline Data Otonom",
            desc: "Seluruh berkas anamnesa awal siap dikirim. Klik tombol di bawah untuk menyinkronkan data ke PostgreSQL cloud, lalu sistem akan mengalihkan rute otonom ke Stasiun Kerja Dokter.",
            icon: <Sparkles className="text-amber-400" size={24} />,
            actionLabel: "Kirim & Lanjut ke Dokter"
        }
    ];

    const recognitionRef = useRef(null);

    const triggerToast = (type, message) => {
        setToast({ show: true, type, message });
        setTimeout(() => setToast({ show: false, type: '', message: '' }), 4000);
    };

    // --- 1. INITIAL LOAD & SPEECH SETUP ---
    useEffect(() => {
        const savedPatient = localStorage.getItem('active_patient');
        if (savedPatient) {
            try {
                setActivePatient(JSON.parse(savedPatient));
            } catch (e) {
                console.error("Gagal membaca data pasien", e);
            }
        }

        // Jalankan pemandu pop-up jika sesi tour asisten terdeteksi aktif
        const currentTourStep = sessionStorage.getItem('leximed_asisten_tour_step');
        if (currentTourStep === 'input_ttv' && !sessionStorage.getItem('leximed_asisten_tour_completed')) {
            setTourStep(0);
            setShowTour(true);
        }

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
        if (!recognitionRef.current) return triggerToast('error', "Browser tidak mendukung Voice Note.");
        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    // Fungsi suntik instan data simulasi menyesuaikan profil keluhan pasien aktif secara dinamis
    const injectSimulationData = () => {
        const patientName = activePatient?.name?.toLowerCase() || '';
        const patientUnit = activePatient?.unit?.toLowerCase() || '';
        
        if (patientName.includes('ilham') || patientUnit.includes('paru') || patientName.includes('eka')) {
            // Setup TTV Kasus Gangguan Respirasi / Sesak Napas
            setTdSistolik('124');
            setTdDiastolik('82');
            setNadi('96');
            setSuhu('36.8');
            setSpo2('94'); // Saturasi agak turun sesuai indikasi sesak
        } else {
            // Setup TTV Kasus Infeksi Pencernaan / Gastroenteritis
            setTdSistolik('112');
            setTdDiastolik('74');
            setNadi('88');
            setSuhu('37.8'); // Agak demam sumeng
            setSpo2('98');
        }
    };

    const handleSave = async () => {
        if (!activePatient) return triggerToast('error', "Silakan pilih pasien di Dashboard terlebih dahulu!");
        if (!tdSistolik || !tdDiastolik || !nadi || !suhu || !spo2 || !keluhanAwal) {
            return triggerToast('error', "Mohon lengkapi seluruh Tanda Vital (TTV) dan Keluhan Utama.");
        }

        setIsSaving(true);
        setSaveStatus(null);
        setErrorMessage('');

        const payload = {
            patient_id: activePatient.no_rm || activePatient.norm,
            blood_pressure: `${tdSistolik}/${tdDiastolik}`,
            heart_rate: nadi.toString(),
            temperature: suhu.toString(),
            oxygen_saturation: spo2.toString(),
            raw_content: keluhanAwal,
            source: "manual",
            status: 'draft' 
        };

        try {
            await axios.post(`${API_URL}/clinical-data`, payload, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            setSaveStatus('success');
            triggerToast('success', "Data TTV dan Keluhan sukses disinkronkan ke Supabase Node!");
            setTdSistolik(''); setTdDiastolik(''); setNadi(''); setSuhu(''); setSpo2(''); setKeluhanAwal('');
            
            sessionStorage.setItem('leximed_asisten_tour_completed', 'true');
            sessionStorage.removeItem('leximed_asisten_tour_step');
            sessionStorage.setItem('leximed_doctor_tour_step', '0'); 

            setTimeout(() => {
                setSaveStatus(null);
                navigate('/dashboard-dokter');
            }, 1200);

        } catch (error) {
            console.error("Simpan Error:", error.response?.data);
            setSaveStatus('error');
            const backendError = error.response?.data?.message || error.response?.data?.error || "Koneksi gateway cloud offline, mengaktifkan bypass sandbox.";
            setErrorMessage(backendError);
            triggerToast('error', backendError);
            
            setTimeout(() => {
                setSaveStatus(null);
                sessionStorage.setItem('leximed_asisten_tour_completed', 'true');
                sessionStorage.setItem('leximed_doctor_tour_step', '0'); 
                navigate('/dashboard-dokter');
            }, 2000);
        } finally {
            setIsSaving(false);
        }
    };

    // ── INTERACTIVE TOUR NAVIGATION ORCHESTRATOR ──
    const handleNextTourStep = () => {
        if (tourStep === 0) {
            injectSimulationData(); 
            setTourStep(1);
            sessionStorage.setItem('leximed_asisten_tour_step', 'input_voice');
        } else if (tourStep === 1) {
            const patientName = activePatient?.name?.toLowerCase() || '';
            const patientUnit = activePatient?.unit?.toLowerCase() || '';

            if (patientName.includes('ilham') || patientUnit.includes('paru') || patientName.includes('eka')) {
                setKeluhanAwal("Pasien mengeluhkan sesak napas berat sejak sore hari setelah beraktivitas di luar ruangan. Dada terasa sempit dan berat, disertai batuk kering sesekali. Riwayat asma positif dari keluarga.");
            } else {
                setKeluhanAwal("Pasien datang mengeluhkan diare cair berulang sebanyak 5 kali sejak semalam. Perut terasa sakit melilit, mual konstan, pusing, dan badan terasa lemas kehilangan cairan tubuh.");
            }
            setTourStep(2);
            sessionStorage.setItem('leximed_asisten_tour_step', 'submit_data');
        } else if (tourStep === 2) {
            handleSave(); 
        }
    };

    const handleCloseTour = () => {
        sessionStorage.setItem('leximed_asisten_tour_completed', 'true');
        sessionStorage.removeItem('leximed_asisten_tour_step');
        setShowTour(false);
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans pb-24 text-left relative">
            
            {/* ── TOAST NOTIFICATION PREMIUM FLOATING ── */}
            <AnimatePresence>
                {toast.show && (
                    <motion.div 
                        initial={{ opacity: 0, y: -40, x: '-50%', scale: 0.95 }} 
                        animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }} 
                        exit={{ opacity: 0, y: -20, x: '-50%', scale: 0.95 }}
                        className={`fixed top-6 left-1/2 -translate-x-1/2 z-[110] px-6 py-4 rounded-2xl font-bold text-xs md:text-sm shadow-2xl border flex items-center gap-3 w-full max-w-xl text-left uppercase tracking-wider ${
                            toast.type === 'success' 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                    >
                        {toast.type === 'success' ? (
                            <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                        ) : (
                            <AlertCircle size={20} className="text-rose-600 shrink-0" />
                        )}
                        <span className="leading-relaxed">{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- HEADER STASIUN ASISTEN MODERN --- */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm"
            >
                <div className="flex items-center gap-5">
                    <button type="button" onClick={() => navigate(-1)} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:text-teal-600 transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <div className="p-4 bg-teal-600 rounded-2xl shadow-lg shadow-teal-100 text-white">
                        <ClipboardList size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic leading-none">Pemeriksaan Awal</h1>
                        <p className="text-slate-500 mt-2 font-bold flex items-center gap-2 text-xs uppercase tracking-wider">
                            <User size={14} className="text-teal-500" /> Profil Pasien Terkunci: 
                            <span className="text-teal-700 bg-teal-50 px-3 py-0.5 rounded-full font-black font-mono">
                                {activePatient ? `${activePatient.name} (${activePatient.no_rm || activePatient.norm})` : 'TN. ADITYA (RM-001)'}
                            </span>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        type="button"
                        onClick={() => { setTourStep(0); setShowTour(true); }}
                        className="bg-teal-500/10 text-teal-600 border border-teal-500/20 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5 shadow-sm transition-all"
                    >
                        <HelpCircle size={14} /> Alur Kerja Sistem
                    </button>
                    <button type="button" onClick={injectSimulationData} className="px-4 py-2.5 bg-white border border-slate-200 hover:border-teal-300 rounded-xl text-[10px] font-black uppercase text-slate-600 transition-all flex items-center gap-1.5 shadow-sm">
                        <Sparkles size={14} className="text-teal-500" /> Ingest Simulation Data
                    </button>
                </div>
            </motion.div>

            <div className="max-w-6xl mx-auto space-y-8">
                
                {/* --- EDUKASI PANEL --- */}
                <div className="flex items-start gap-4 bg-teal-50/50 p-6 rounded-[2rem] border border-teal-100 shadow-sm">
                    <Info className="text-teal-600 mt-1 shrink-0" size={24} />
                    <div>
                        <h4 className="text-sm font-black text-teal-900 uppercase">Protokol Penapisan Asisten Medis:</h4>
                        <p className="text-xs text-teal-700 mt-1 font-medium leading-relaxed">
                            Pastikan data Tanda Tanda Vital (TTV) diisi dengan parameter valid. Data narasi keluhan lisan akan dikirimkan ke Dashboard Dokter dan diolah menggunakan <b>AI Llama 3.3 Engine</b> menjadi format rekam medis SOAP otomatis.
                        </p>
                    </div>
                </div>

                {/* --- VITAL SIGNS NEOMORPHIC GRID --- */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Tensi */}
                    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200/80 shadow-sm flex flex-col items-center transition-all border-b-4 border-b-blue-500 group relative overflow-hidden">
                        <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 mb-4 group-hover:scale-105 transition-transform"><Activity size={24} /></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Tensi (mmHg)</span>
                        <div className="flex items-center justify-center gap-2">
                            <input type="number" placeholder="120" value={tdSistolik} onChange={(e)=>setTdSistolik(e.target.value)} className="w-14 text-center text-2xl font-black bg-transparent border-b-2 border-slate-100 outline-none focus:border-blue-500 transition-colors" />
                            <span className="text-xl font-bold text-slate-300">/</span>
                            <input type="number" placeholder="80" value={tdDiastolik} onChange={(e)=>setTdDiastolik(e.target.value)} className="w-14 text-center text-2xl font-black bg-transparent border-b-2 border-slate-100 outline-none focus:border-blue-500 transition-colors" />
                        </div>
                    </div>

                    {/* Nadi */}
                    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200/80 shadow-sm flex flex-col items-center transition-all border-b-4 border-b-red-500 group relative overflow-hidden">
                        <div className="p-3 bg-red-50 rounded-2xl text-red-600 mb-4 group-hover:scale-105 transition-transform"><HeartPulse size={24} /></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Nadi (bpm)</span>
                        <input type="number" placeholder="80" value={nadi} onChange={(e)=>setNadi(e.target.value)} className="w-20 text-center text-3xl font-black bg-transparent border-b-2 border-slate-100 outline-none focus:border-red-500 transition-colors" />
                    </div>

                    {/* Suhu */}
                    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200/80 shadow-sm flex flex-col items-center transition-all border-b-4 border-b-orange-500 group relative overflow-hidden">
                        <div className="p-3 bg-orange-50 rounded-2xl text-orange-600 mb-4 group-hover:scale-105 transition-transform"><Thermometer size={24} /></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Suhu (°C)</span>
                        <input type="number" step="0.1" placeholder="36.5" value={suhu} onChange={(e)=>setSuhu(e.target.value)} className="w-24 text-center text-3xl font-black bg-transparent border-b-2 border-slate-100 outline-none focus:border-orange-500 transition-colors" />
                    </div>

                    {/* SpO2 */}
                    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200/80 shadow-sm flex flex-col items-center transition-all border-b-4 border-b-cyan-500 group relative overflow-hidden">
                        <div className="p-3 bg-cyan-50 rounded-2xl text-cyan-600 mb-4 group-hover:scale-105 transition-transform"><Wind size={24} /></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">SpO2 (%)</span>
                        <input type="number" placeholder="98" value={spo2} onChange={(e)=>setSpo2(e.target.value)} className="w-20 text-center text-3xl font-black bg-transparent border-b-2 border-slate-100 outline-none focus:border-cyan-500 transition-colors" />
                    </div>
                </div>

                {/* --- KELUHAN WORKSTATION PANEL --- */}
                <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-slate-200 relative overflow-hidden">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4 border-b border-slate-100 pb-5">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-[#0f172a] rounded-xl text-white"><ClipboardList size={18}/></div>
                            <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">Wawancara Keluhan Utama</h3>
                        </div>
                        <div className="flex items-center gap-3">
                            {isListening && (
                                <div className="flex gap-0.5 h-4 items-end px-2">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <motion.div key={i} className="w-1 bg-red-500 rounded-sm" animate={{ height: ['4px', '16px', '4px'] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }} />
                                    ))}
                                </div>
                            )}
                            <button 
                                type="button"
                                onClick={toggleListening} 
                                className={`flex items-center gap-3 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-md active:scale-95 ${
                                    isListening 
                                    ? 'bg-red-500 text-white ring-4 ring-red-100' 
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/60'
                                }`}
                            >
                                {isListening ? <><Mic size={14} /> Hentikan Rekaman</> : <><MicOff size={14} /> Aktifkan Voice Note</>}
                            </button>
                        </div>
                    </div>

                    <textarea 
                        className="w-full h-56 p-6 border-2 border-slate-100 rounded-[2rem] outline-none text-base font-bold text-slate-700 leading-relaxed bg-slate-50 focus:bg-white focus:border-teal-500 transition-all resize-none shadow-inner"
                        placeholder="Gunakan fitur Voice Note lisan atau ketik narasi keluhan komprehensif pasien di sini..." 
                        value={keluhanAwal} 
                        onChange={(e) => setKeluhanAwal(e.target.value)}
                    />

                    <button 
                        type="button"
                        onClick={handleSave} 
                        disabled={isSaving} 
                        className="w-full mt-6 py-5 rounded-2xl flex items-center justify-center gap-3 font-black text-sm uppercase tracking-[0.2em] bg-[#0f172a] text-white hover:bg-teal-600 transition-all active:scale-95 shadow-lg shadow-slate-900/20 disabled:opacity-40"
                    >
                        {isSaving ? (
                            <><Loader2 className="animate-spin" size={20} /> Membuka Gateway Kamar Dokter...</>
                        ) : (
                            <><Save size={20} /> Simpan & Kirim ke Kamar Dokter</>
                        )}
                    </button>
                </div>
            </div>

            {/* Info Footer */}
            <div className="mt-12 flex items-center justify-center gap-6 opacity-40">
                <Database size={20} />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">Supabase Core • Real-time Data Integrity • LexiMed v2026</p>
            </div>

            {/* ── ALUR KERJA SISTEM PANDUAN DIALOG FOR DEWAN JURI ── */}
            <AnimatePresence>
                {showTour && (
                    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-[#0f172a] border border-white/10 w-full max-w-md p-6 md:p-8 rounded-[2rem] shadow-2xl relative text-left space-y-6 text-white">
                            <div className="flex gap-1.5">
                                {tourSteps.map((_, idx) => (
                                    <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === tourStep ? 'w-8 bg-teal-500' : 'w-2 bg-slate-700'}`}/>
                                ))}
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/5 border border-white/10 rounded-xl">{tourSteps[tourStep].icon}</div>
                                    <h3 className="text-base font-black uppercase tracking-tight italic text-white">{tourSteps[tourStep].title}</h3>
                                </div>
                                <p className="text-slate-400 text-xs md:text-sm font-medium leading-relaxed">{tourSteps[tourStep].desc}</p>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-white/5 gap-4">
                                <button type="button" onClick={handleCloseTour} className="text-xs font-bold text-slate-500 hover:text-slate-300 uppercase tracking-wider">Selesai & Keluar</button>
                                <button type="button" onClick={handleNextTourStep} className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg flex items-center gap-1 active:scale-95 animate-pulse">
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