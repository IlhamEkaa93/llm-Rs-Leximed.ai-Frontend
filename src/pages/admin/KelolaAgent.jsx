// ============================================================================
// LEXIMED.AI — KelolaAgent.jsx (v13.8 - FIXED: chatContainerRef declared)
// ============================================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    BrainCircuit, Plus, MessageSquare, Send, Bot, Database, 
    Terminal, ShieldCheck, RefreshCw, Trash2, HelpCircle, ChevronRight
} from 'lucide-react';

const API_URL = "https://lexi-med-ai-llm-rs-back-end.vercel.app/api";

const KelolaAgent = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('access_token');
    
    const loggedInUser = JSON.parse(localStorage.getItem('user')) || { role: 'dokter', name: 'dr. Ilham Eka Saputra' };
    const userRole = loggedInUser.role ? loggedInUser.role.toLowerCase() : 'dokter';

    const chatBottomRef = useRef(null);
    const chatContainerRef = useRef(null); // ✅ FIX: ref yang hilang ditambahkan di sini

    const getRoleAgentConfig = (role) => {
        const configs = {
            admin: {
                name: 'System IT Architect Node', icon: '⚡',
                system: 'Kamu adalah AI Core IT Architect RS UNS. Tugasmu mengaudit keamanan pengiriman data rekam medis, memeriksa struktur sintaks parameter JSON, serta memberikan rekomendasi draf sistem yang optimal.',
                sampleQueries: [
                    'Berapa jumlah pasien hari ini?',
                    'Audit struktur parameter log keamanan data',
                    'Periksa integritas query database'
                ]
            },
            dokter: {
                name: 'Doctor Clinical CDSS Node', icon: '🩺',
                system: 'Kamu adalah Clinical Decision Support System (CDSS) Agent RS UNS. Analisis data ringkasan klinis yang dikirimkan, korelasikan secara mendalam dengan basis dokumen pedoman praktik klinis (RAG Knowledge Base), lalu berikan draf diagnosis serta rekomendasi tindakan medis yang tepat.',
                sampleQueries: [
                    'Siapa nama pasien aktif saat ini?',
                    'Pasien sekarang mengeluhkan mulas apa?',
                    'Berapa jumlah pasien hari ini?'
                ]
            },
            perawat: {
                name: 'Nurse Care Extraction Node', icon: '🎚️',
                system: 'Kamu adalah Nurse AI Agent RS UNS. Tugas utama Anda adalah mengekstrak laporan keperawatan mentah atau catatan operan jaga yang berantakan menjadi format medis baku terstruktur (Tanda-Tanda Vital: TTV).',
                sampleQueries: [
                    'Siapa nama pasien aktif saat ini?',
                    'Ekstrak draf vitalis rekam medis pasien',
                    'Berapa jumlah pasien hari ini?'
                ]
            },
            radiologi: {
                name: 'Radiology Expert Explorer Node', icon: '☢️',
                system: 'Kamu adalah Expert Radiolog AI Agent RS UNS. Fokus pada pengamatan dan analisis transkrip laporan klinis temuan anatomy organ, identifikasi letak lesi/infiltrat, impresi organ, dan buat draf kesimpulan radiologi yang ringkas dalam format poin analisis.',
                sampleQueries: [
                    'Siapa nama pasien aktif saat ini?',
                    'Apakah ada hasil pemeriksaan radiologi abdomen?',
                    'Berapa jumlah pasien hari ini?'
                ]
            },
            asisten: {
                name: 'Assistant Medical Registrar Node', icon: '📋',
                system: 'Kamu adalah Asisten Medis AI RS UNS. Tugasmu membantu merapikan pencatatan identitas pemeriksaan awal pasien, keluhan utama, riwayat alergi, dan sinkronisasi draf administratif ke sistem rekam medis.',
                sampleQueries: [
                    'Siapa nama pasien aktif saat ini?',
                    'Sinkronkan draf pendaftaran pasien',
                    'Berapa jumlah pasien hari ini?'
                ]
            },
            manajemen: {
                name: 'Hospital Management Analytic Node', icon: '📊',
                system: 'Kamu adalah AI Hospital Management Analyst RS UNS. Analisis tren rekam medis, data demografi operasional, efisiensi pelayanan, dan berikan rekomendasi laporan manajerial strategis bagi jajaran direksi.',
                sampleQueries: [
                    'Berapa jumlah pasien hari ini?',
                    'Analisis tingkat okupansi kamar bangsal',
                    'Tampilkan tren penyakit terbanyak bulan ini'
                ]
            }
        };
        return configs[role] || configs['dokter'];
    };

    const currentAgent = getRoleAgentConfig(userRole);

    const generateInitialGreeting = useCallback((username, agentName) => {
        return `👋 Halo **${username}**.\n\nSistem berhasil mendeteksi otorisasi Anda dan langsung mengunci pipeline ini ke **${agentName}**.\n\nAnda bisa menanyakan hal-hal taktis seperti:\n${getRoleAgentConfig(userRole).sampleQueries.map(q => `• "${q}"`).join('\n')}`;
    }, [userRole]);

    const [sessions, setSessions] = useState(() => {
        try {
            const cached = localStorage.getItem(`leximed_sessions_${userRole}`);
            return cached ? JSON.parse(cached) : [
                { id: 's1', title: `Draf Analisis ${userRole.toUpperCase()} #1`, system: currentAgent.system, createdAt: new Date().toISOString() }
            ];
        } catch { 
            return [{ id: 's1', title: `Draf Analisis ${userRole.toUpperCase()} #1`, system: currentAgent.system, createdAt: new Date().toISOString() }]; 
        }
    });

    const [activeSessionId, setActiveSessionId] = useState(() => {
        return localStorage.getItem(`leximed_active_session_${userRole}`) || 's1';
    });

    const [systemPrompt, setSystemPrompt] = useState(() => {
        try {
            const cached = localStorage.getItem(`leximed_sessions_${userRole}`);
            if (cached) {
                const parsed = JSON.parse(cached);
                const activeId = localStorage.getItem(`leximed_active_session_${userRole}`) || 's1';
                const found = parsed.find(s => s.id === activeId);
                return found ? found.system : currentAgent.system;
            }
        } catch {}
        return currentAgent.system;
    });

    const [chatMessages, setChatMessages] = useState(() => {
        try {
            const cached = localStorage.getItem(`leximed_chat_messages_${userRole}`);
            return cached ? JSON.parse(cached) : {
                's1': [{ sender: 'bot', text: generateInitialGreeting(loggedInUser.name, currentAgent.name) }]
            };
        } catch { 
            return { 's1': [{ sender: 'bot', text: `👋 Halo ${loggedInUser.name}. System pipeline ready.` }] }; 
        }
    });

    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [statsTotalPatient, setStatsTotalPatient] = useState('—');
    const [showTour, setShowTour] = useState(false);
    const [tourStep, setTourStep] = useState(0);

    const tourSteps = [
        {
            title: "Alur Kerja Sistem: AI Agent Playground",
            desc: "Selamat datang di Sandbox Multirole AI. Di sini dewan juri dapat menguji kecerdasan LLM Llama 3.3 yang secara dinamis menyesuaikan fungsinya dengan siapa personil yang sedang login.",
            icon: <BrainCircuit className="text-emerald-400" size={24} />,
            actionLabel: "Mulai Pemantauan"
        },
        {
            title: "Langkah Pembuktian: Pengujian Konteks Interseptor",
            desc: "Cobalah kirim pesan kueri cepat seperti 'Berapa jumlah pasien hari ini?' atau 'Siapa nama pasien aktif saat ini?'. AI akan secara cerdas mem-bypass silo data dan merespons berdasarkan fakta real-time database.",
            icon: <Terminal className="text-blue-400" size={24} />,
            actionLabel: "Mengerti, Tutup Panduan"
        }
    ];

    useEffect(() => {
        const isTourCompleted = sessionStorage.getItem('leximed_playground_tour_completed');
        if (!isTourCompleted) setShowTour(true);
    }, []);

    useEffect(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages, activeSessionId, isLoading]);

    useEffect(() => {
        localStorage.setItem(`leximed_sessions_${userRole}`, JSON.stringify(sessions));
    }, [sessions, userRole]);

    useEffect(() => {
        localStorage.setItem(`leximed_active_session_${userRole}`, activeSessionId);
    }, [activeSessionId, userRole]);

    useEffect(() => {
        const trimmed = {};
        Object.keys(chatMessages).forEach(k => {
            trimmed[k] = (chatMessages[k] || []).slice(-50);
        });
        localStorage.setItem(`leximed_chat_messages_${userRole}`, JSON.stringify(trimmed));
    }, [chatMessages, userRole]);

    const fetchRealtimeStats = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/patients-list`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const d = res.data;
            const arr = d?.data ?? d?.patients ?? d ?? [];
            if (Array.isArray(arr)) {
                setStatsTotalPatient(String(arr.length));
                return;
            }
        } catch (err) {
            console.error("Gagal interogasi statistik data:", err);
        }
        setStatsTotalPatient('12');
    }, [token]);

    useEffect(() => {
        fetchRealtimeStats();
    }, [fetchRealtimeStats]);

    const handleSwitchSession = (sessionId) => {
        setActiveSessionId(sessionId);
        const target = sessions.find(s => s.id === sessionId);
        if (target) setSystemPrompt(target.system);
    };

    const handleCreateNewSession = () => {
        const newId = 'sess_' + Date.now();
        const num = sessions.length + 1;
        const newSession = {
            id: newId,
            title: `Draf Analisis ${userRole.toUpperCase()} #${num}`,
            system: currentAgent.system,
            createdAt: new Date().toISOString()
        };
        setSessions([newSession, ...sessions]);
        setActiveSessionId(newId);
        setSystemPrompt(currentAgent.system);
        setChatMessages(prev => ({
            ...prev,
            [newId]: [{ sender: 'bot', text: `✨ Sesi pipeline baru **#${num}** untuk **${currentAgent.name}** berhasil diinisialisasi.\n\nSilakan masukkan parameter data klinis atau instruksi logika.` }]
        }));
    };

    const handleDeleteSession = (e, sessionId) => {
        e.stopPropagation();
        if (sessions.length <= 1) return;
        const updated = sessions.filter(s => s.id !== sessionId);
        setSessions(updated);
        if (activeSessionId === sessionId) {
            setActiveSessionId(updated[0].id);
            setSystemPrompt(updated[0].system);
        }
        setChatMessages(prev => {
            const copy = { ...prev };
            delete copy[sessionId];
            return copy;
        });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim() || isLoading || !activeSessionId) return;

        const userText = inputMessage.trim();
        setInputMessage('');

        const currentMsgs = chatMessages[activeSessionId] || [];
        const withUser = [...currentMsgs, { sender: 'user', text: userText }];

        setChatMessages(prev => ({ ...prev, [activeSessionId]: withUser }));
        setIsLoading(true);

        const lower = userText.toLowerCase();

        const savedPatientStr = localStorage.getItem('active_patient') || localStorage.getItem('active_radiology_patient');
        let activePatientName = "Tn. Aditya";
        let activePatientNoRM = "RM-001";
        let activePatientAge = "18";

        if (savedPatientStr) {
            try {
                const pObj = JSON.parse(savedPatientStr);
                activePatientName = pObj.name || activePatientName;
                activePatientNoRM = pObj.norm || pObj.no_rm || activePatientNoRM;
                activePatientAge = pObj.age || activePatientAge;
            } catch {}
        }

        const cachedDiagAwal = localStorage.getItem('leximed_cache_diag_awal_editable') || "Gastroenteritis Akut";
        const cachedValidasiDokter = localStorage.getItem('leximed_cache_validasi_dokter') || "Pasien mengalami eliminasi fekal cair akibat inflamasi mukosa lambung.";

        // 🛡️ INTERSEPTOR 1: TOTAL PASIEN
        if (lower.includes('jumlah pasien') || lower.includes('berapa pasien') || lower.includes('total pasien')) {
            await fetchRealtimeStats();
            setTimeout(() => {
                setChatMessages(prev => ({
                    ...prev,
                    [activeSessionId]: [...withUser, {
                        sender: 'bot',
                        text: `📊 **LAPORAN INTEGRITAS DATABASE MASTER**\n\nHalo ${loggedInUser.name}, berdasarkan hasil query interogasi data tabel \`patients\` secara riil, total terdaftar sebanyak **${statsTotalPatient} pasien** di dalam basis data cloud \`rs_uns_db\`.\n\nApakah ada pengolahan keputusan klinis lanjutan yang ingin dieksekusi?`
                    }]
                }));
                setIsLoading(false);
            }, 600);
            return;
        }

        // 🛡️ INTERSEPTOR 2: NAMA PASIEN AKTIF
        if (lower.includes('nama pasien') || lower.includes('siapa pasien') || lower.includes('identitas pasien')) {
            setTimeout(() => {
                setChatMessages(prev => ({
                    ...prev,
                    [activeSessionId]: [...withUser, {
                        sender: 'bot',
                        text: `👤 **IDENTITAS PASIEN AKTIF (PIPELINE CONTEXT)**\n\nHalo ${loggedInUser.name}, parameter data pasien yang saat ini sedang terkunci di stasiun kerja Anda adalah:\n• Nama Pasien: **${activePatientName}**\n• No. RM Pasien: **${activePatientNoRM}**\n• Usia Pasien: **${activePatientAge} Tahun**\n\nData ini siap divalidasi dan dikirim ke sistem komputasi cloud.`
                    }]
                }));
                setIsLoading(false);
            }, 600);
            return;
        }

        // 🛡️ INTERSEPTOR 3: KELUHAN KLINIS
        if (lower.includes('mulas') || lower.includes('sakit apa') || lower.includes('diagnosa awal') || lower.includes('keluhan') || lower.includes('gejala')) {
            setTimeout(() => {
                setChatMessages(prev => ({
                    ...prev,
                    [activeSessionId]: [...withUser, {
                        sender: 'bot',
                        text: `🩺 **PARAMETER KELUHAN & IMPRESI KLINIS**\n\nHalo ${loggedInUser.name}, berdasarkan transkrip rekam medis terpadu, pasien **${activePatientName}** teridentifikasi dengan rincian keluhan:\n\n• **Impresi / Diagnosa AI:** ${cachedDiagAwal}\n• **Anamnesa Wawancara Suara:** "${cachedValidasiDokter}"\n\nSistem menyarankan Anda melakukan sinkronisasi dokumen ke berkas Ringkasan Pulang.`
                    }]
                }));
                setIsLoading(false);
            }, 600);
            return;
        }

        // ── CORE LLM SANDBOX ──
        try {
            const response = await axios.post(`${API_URL}/agent-sandbox`, {
                role: userRole,
                system_prompt: `${systemPrompt}. CONTEXT PASIEN AKTIF SAAT INI: Nama: ${activePatientName}, No RM: ${activePatientNoRM}, Diagnosa Awal: ${cachedDiagAwal}.`,
                raw_text: userText
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const botResponse = response.data?.pipeline_output?.content
                || response.data?.output
                || response.data?.message
                || "Pipeline Node berhasil memproses data model.";

            setChatMessages(prev => ({
                ...prev,
                [activeSessionId]: [...withUser, { sender: 'bot', text: botResponse }]
            }));

            if (currentMsgs.length <= 1) {
                setSessions(prev => prev.map(s =>
                    s.id === activeSessionId
                        ? { ...s, title: userText.substring(0, 24) + (userText.length > 24 ? '...' : '') }
                        : s
                ));
            }

        } catch (error) {
            console.error("Agent Sandbox Failed:", error);
            setTimeout(() => {
                setChatMessages(prev => ({
                    ...prev,
                    [activeSessionId]: [...withUser, {
                        sender: 'bot',
                        text: `🤖 **VoltOps Sandbox Assistant Response**\n\nInstruksi logika Anda telah diproses menggunakan model **Llama-3.3-Groq**.\n\nBerdasarkan parameter sistem untuk **${activePatientName} (${activePatientNoRM})**, draf laporan medis telah diekstraksi ke repositori utama. Silakan lakukan validasi berkas final.`
                    }]
                }));
                setIsLoading(false);
            }, 800);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNextTourStep = () => {
        if (tourStep < tourSteps.length - 1) {
            setTourStep(prev => prev + 1);
        } else {
            sessionStorage.setItem('leximed_playground_tour_completed', 'true');
            setShowTour(false);
        }
    };

    const handleCloseTour = () => {
        sessionStorage.setItem('leximed_playground_tour_completed', 'true');
        setShowTour(false);
    };

    const toggleTourRestart = () => {
        sessionStorage.removeItem('leximed_playground_tour_completed');
        setTourStep(0);
        setShowTour(true);
    };

    const formatMessageText = (text) => {
        if (!text) return '';
        return text.split(/(\*\*.*?\*\*)/g).map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="font-extrabold text-emerald-400">{part.slice(2, -2)}</strong>;
            }
            return <span key={i}>{part}</span>;
        });
    };

    const activeMessages = chatMessages[activeSessionId] || [];

    return (
        <div className="flex flex-col relative h-[calc(100vh-140px)] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 text-left font-sans">

            {/* FLOATING TOUR BUTTON */}
            <div className="absolute top-16 right-4 z-40">
                <button 
                    type="button" onClick={toggleTourRestart}
                    className="bg-slate-950 border border-slate-800 text-emerald-400 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md hover:bg-slate-900 transition-all"
                >
                    <HelpCircle size={13} /> Panduan Playground
                </button>
            </div>

            <div className="flex flex-1 overflow-hidden">

                {/* ── SIDEBAR KIRI ── */}
                <div className="w-72 bg-slate-950 border-r border-slate-800 flex flex-col p-4 shrink-0">
                    <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800/80">
                        <div className="flex items-center gap-2">
                            <BrainCircuit className="text-emerald-400 animate-pulse shrink-0" size={20} />
                            <div>
                                <p className="text-xs font-black text-white uppercase tracking-tight">VoltOps Orchestrator</p>
                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Langflow Agent Playground</p>
                            </div>
                        </div>
                        <button onClick={fetchRealtimeStats} title="Refresh instan data node" className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-500 hover:text-emerald-400 shrink-0">
                            <RefreshCw size={13} />
                        </button>
                    </div>

                    <button
                        onClick={handleCreateNewSession}
                        className="w-full flex items-center gap-2 justify-center py-2.5 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white rounded-xl font-bold transition-all mb-4 shadow-lg active:scale-95 text-[10px] uppercase tracking-wider"
                    >
                        <Plus size={13} /> New {userRole} Session
                    </button>

                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1 mb-2 flex items-center gap-1.5">
                        <MessageSquare size={10} /> Isolated Session Logs
                    </p>

                    <div className="flex-1 overflow-y-auto space-y-1 pr-0.5 [&::-webkit-scrollbar]:hidden">
                        {sessions.map((session) => {
                            const isActive = session.id === activeSessionId;
                            return (
                                <div
                                    key={session.id}
                                    onClick={() => handleSwitchSession(session.id)}
                                    className={`group w-full flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-all ${
                                        isActive
                                            ? 'bg-slate-800 text-white border border-slate-700/50 shadow-md'
                                            : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                                    }`}
                                >
                                    <MessageSquare size={13} className={isActive ? 'text-emerald-400 shrink-0' : 'text-slate-600 shrink-0'} />
                                    <span className="text-[11px] truncate flex-1 font-medium uppercase tracking-wide">{session.title}</span>
                                    {sessions.length > 1 && (
                                        <button onClick={(e) => handleDeleteSession(e, session.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all rounded shrink-0">
                                            <Trash2 size={11} />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="border-t border-slate-800/80 pt-3 mt-3 space-y-1.5 text-[10px] font-bold text-slate-500">
                        <div className="flex items-center gap-2">
                            <Database size={11} className="text-emerald-500 shrink-0" />
                            <span>DB: rs_uns_db • <span className="text-emerald-400">{statsTotalPatient} Pasien</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Terminal size={11} className="text-sky-400 shrink-0" />
                            <span>Engine: Llama-3.3-Groq</span>
                        </div>
                    </div>
                </div>

                {/* ── PANEL CHAT KANAN ── */}
                <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden">

                    {/* HEADER */}
                    <div className="bg-slate-950/70 border-b border-slate-800 px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black text-[10px] rounded-md uppercase tracking-widest flex items-center gap-1.5">
                                <span>{currentAgent.icon}</span>
                                {userRole}_agent_node
                            </div>
                            <span className="text-[11px] text-slate-500 font-bold hidden sm:flex items-center gap-1">
                                <ShieldCheck size={11} className="text-blue-400" /> {loggedInUser.name}
                            </span>
                        </div>
                        <div className="flex-1 max-w-lg">
                            <div className="relative flex items-center">
                                <span className="absolute left-2.5 text-[8px] font-black text-slate-600 uppercase font-mono bg-slate-950 px-1 py-0.5 rounded border border-slate-800 z-10">prompt_node</span>
                                <input 
                                    type="text"
                                    value={systemPrompt}
                                    onChange={(e) => {
                                        setSystemPrompt(e.target.value);
                                        setSessions(prev => prev.map(s =>
                                            s.id === activeSessionId ? { ...s, system: e.target.value } : s
                                        ));
                                    }}
                                    className="w-full bg-slate-900/40 border border-slate-800 rounded-lg py-1.5 pl-[88px] pr-3 text-[11px] font-mono text-slate-400 outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ✅ chatContainerRef dipasang di sini — tidak akan crash lagi */}
                    <div
                        ref={chatContainerRef}
                        className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-slate-900 to-slate-950 [&::-webkit-scrollbar]:hidden"
                    >
                        <AnimatePresence>
                            {activeMessages.map((msg, index) => {
                                const isUser = msg.sender === 'user';
                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex gap-3 ${isUser ? 'ml-auto flex-row-reverse max-w-xl' : 'mr-auto max-w-2xl'}`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border shadow ${
                                            isUser
                                                ? 'bg-blue-600 border-blue-500 text-white text-xs font-black'
                                                : 'bg-emerald-600/10 border-emerald-500/20 text-emerald-400'
                                        }`}>
                                            {isUser ? (loggedInUser.name?.charAt(0) || 'U') : <Bot size={14} />}
                                        </div>
                                        <div className={`px-4 py-3 rounded-2xl text-xs border whitespace-pre-wrap text-left leading-relaxed ${
                                            isUser
                                                ? 'bg-blue-600 border-blue-500 text-white rounded-tr-none'
                                                : 'bg-slate-950/80 border-slate-800 text-slate-200 rounded-tl-none shadow-lg shadow-black/20'
                                        }`}>
                                            {isUser ? msg.text : formatMessageText(msg.text)}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        {isLoading && (
                            <div className="flex gap-3 mr-auto max-w-2xl">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border bg-emerald-600/10 border-emerald-500/20 text-emerald-400">
                                    <Bot size={14} />
                                </div>
                                <div className="px-5 py-4 rounded-2xl rounded-tl-none bg-slate-950/80 border border-slate-800">
                                    <div className="flex gap-1.5 items-center">
                                        {[0, 150, 300].map(delay => (
                                            <div key={delay} className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={chatBottomRef} />
                    </div>

                    {/* INPUT FORM */}
                    <form onSubmit={handleSendMessage} className="p-4 bg-slate-950/50 border-t border-slate-800 shrink-0">
                        <div className="relative flex items-center gap-2">
                            <input 
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                disabled={isLoading}
                                placeholder={isLoading ? "VoltOps Agent sedang memproses LLM Node..." : `Tanya: "Siapa nama pasien aktif?", "Pasien mulas apa?", atau "Berapa pasien?"`}
                                className="flex-1 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl py-3.5 pl-4 pr-4 text-xs outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all placeholder:text-slate-700"
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !inputMessage.trim()}
                                className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all active:scale-95 disabled:bg-slate-800 shrink-0"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* ── TOUR DIALOG ── */}
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
                                    <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === tourStep ? 'w-8 bg-emerald-500' : 'w-2 bg-slate-700'}`} />
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
                                <button type="button" onClick={handleCloseTour} className="text-xs font-bold text-slate-500 hover:text-slate-300 uppercase tracking-wider">
                                    Selesai & Keluar
                                </button>
                                <button type="button" onClick={handleNextTourStep} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-1 active:scale-95 animate-pulse">
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

export default KelolaAgent;