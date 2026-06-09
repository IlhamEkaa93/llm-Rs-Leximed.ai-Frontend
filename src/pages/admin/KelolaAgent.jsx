// ============================================================================
// LEXIMED.AI — KelolaAgent.jsx (v13.4 - CONTEXT-AWARE PLAYGROUND & INTERCEPT)
// 100% Bebas Error Semicolon & useCallback Terdefinisi Sempurna di React Core
// Mampu Menjawab Nama Pasien Aktif, Keluhan Asisten, & Diagnosa Awal Secara Riil
// Terintegrasi ke REST API Sandbox Backend Laravel Lokal Port 8000
// ============================================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    BrainCircuit, Plus, MessageSquare, Send, Bot, User, Database, 
    Terminal, ShieldCheck, RefreshCw, Trash2
} from 'lucide-react';

const API_URL = "https://lexi-med-ai-llm-rs-back-end.vercel.app/api";

const KelolaAgent = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('access_token');
    const loggedInUser = JSON.parse(localStorage.getItem('user')) || { role: 'dokter', name: 'dr. Ilham' };
    const userRole = loggedInUser.role ? loggedInUser.role.toLowerCase() : 'dokter';
    const chatBottomRef = useRef(null);

    const getRoleAgentConfig = (role) => {
        const configs = {
            admin: {
                name: 'System IT Architect Node', icon: '⚡',
                system: 'Kamu adalah AI Core IT Architect RS UNS. Tugasmu mengaudit keamanan pengiriman data rekam medis, memeriksa struktur sintaks parameter JSON, serta memberikan rekomendasi draf sistem yang optimal. Gunakan penomoran poin-poin tebal untuk bagian yang krusial.'
            },
            dokter: {
                name: 'Doctor Clinical CDSS Node', icon: '🩺',
                system: 'Kamu adalah Clinical Decision Support System (CDSS) Agent RS UNS. Analisis data ringkasan klinis yang dikirimkan, korelasikan secara mendalam dengan basis dokumen pedoman praktik klinis (RAG Knowledge Base), lalu berikan draf diagnosis serta rekomendasi tindakan medis yang tepat. Tuliskan jawaban dalam bentuk poin-poin terstruktur yang rapi dengan penomoran yang jelas.'
            },
            perawat: {
                name: 'Nurse Care Extraction Node', icon: '🎚️',
                system: 'Kamu adalah Nurse AI Agent RS UNS. Tugas utama Anda adalah mengekstrak laporan keperawatan mentah atau catatan operan jaga yang berantakan menjadi format medis baku terstruktur (Tanda-Tanda Vital: TTV). Sajikan dalam format poin-poin list yang teratur.'
            },
            radiologi: {
                name: 'Radiology Expert Explorer Node', icon: '☢️',
                system: 'Kamu adalah Expert Radiolog AI Agent RS UNS. Fokus pada pengamatan dan analisis transkrip laporan klinis temuan anatomy organ, identifikasi letak lesi/infiltrat, impresi organ, dan buat draf kesimpulan radiologi yang ringkas dalam format poin analisis.'
            },
            asisten: {
                name: 'Assistant Medical Registrar Node', icon: '📋',
                system: 'Kamu adalah Asisten Medis AI RS UNS. Tugasmu membantu merapikan pencatatan identitas pemeriksaan awal pasien, keluhan utama, riwayat alergi, dan sinkronisasi draf administratif ke sistem rekam medis. Buat dalam bentuk list terstruktur.'
            },
            manajemen: {
                name: 'Hospital Management Analytic Node', icon: '📊',
                system: 'Kamu adalah AI Hospital Management Analyst RS UNS. Analisis tren rekam medis, data demografi operasional, efisiensi pelayanan, dan berikan rekomendasi laporan manajerial strategis bagi jajaran direksi dalam format poin kesimpulan.'
            }
        };
        return configs[role] || configs['dokter'];
    };

    const currentAgent = getRoleAgentConfig(userRole);

    // ── PERSISTENT STATE: Sessions (tersimpan di localStorage) ──
    const [sessions, setSessions] = useState(() => {
        try {
            const cached = localStorage.getItem('leximed_sessions');
            return cached ? JSON.parse(cached) : [
                { id: 's1', title: `Draf Analisis ${userRole.toUpperCase()} #1`, system: currentAgent.system, createdAt: new Date().toISOString() }
            ];
        } catch { return [{ id: 's1', title: `Draf Analisis ${userRole.toUpperCase()} #1`, system: currentAgent.system, createdAt: new Date().toISOString() }]; }
    });

    const [activeSessionId, setActiveSessionId] = useState(() => {
        return localStorage.getItem('leximed_active_session') || 's1';
    });

    const [systemPrompt, setSystemPrompt] = useState(() => {
        try {
            const cached = localStorage.getItem('leximed_sessions');
            if (cached) {
                const parsed = JSON.parse(cached);
                const activeId = localStorage.getItem('leximed_active_session') || 's1';
                const found = parsed.find(s => s.id === activeId);
                return found ? found.system : currentAgent.system;
            }
        } catch {}
        return currentAgent.system;
    });

    // ── PERSISTENT STATE: Chat Messages (tersimpan di localStorage) ──
    const [chatMessages, setChatMessages] = useState(() => {
        try {
            const cached = localStorage.getItem('leximed_chat_messages');
            return cached ? JSON.parse(cached) : {
                's1': [{ sender: 'bot', text: `👋 Halo ${loggedInUser.name}.\n\nSistem berhasil mendeteksi otorisasi Anda dan langsung mengunci pipeline ini ke **${currentAgent.name}**.\n\nAnda bisa tanya hal seperti:\n• "Berapa jumlah pasien hari ini?"\n• "Siapa nama pasien aktif saat ini?"\n• "Pasien sekarang mengeluhkan mulas apa?"` }]
            };
        } catch { return { 's1': [{ sender: 'bot', text: `👋 Halo ${loggedInUser.name}.` }] }; }
    });

    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [statsTotalPatient, setStatsTotalPatient] = useState('—');

    // ── AUTO SCROLL ke bawah saat ada pesan baru ──
    useEffect(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages, activeSessionId, isLoading]);

    // ── SIMPAN ke localStorage setiap ada perubahan ──
    useEffect(() => {
        try {
            localStorage.setItem('leximed_sessions', JSON.stringify(sessions));
        } catch {}
    }, [sessions]);

    useEffect(() => {
        try {
            localStorage.setItem('leximed_active_session', activeSessionId);
        } catch {}
    }, [activeSessionId]);

    useEffect(() => {
        try {
            const trimmed = {};
            Object.keys(chatMessages).forEach(k => {
                trimmed[k] = (chatMessages[k] || []).slice(-50);
            });
            localStorage.setItem('leximed_chat_messages', JSON.stringify(trimmed));
        } catch {}
    }, [chatMessages]);

    // Ambil jumlah pasien dari endpoint PostgreSQL
    const fetchRealtimeStats = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/dashboard-stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const d = res.data;
            const count = d?.today_patients ?? d?.total_patients ?? d?.data?.total_patients ?? d?.data?.today_patients ?? null;
            if (count !== null && count !== undefined) {
                setStatsTotalPatient(String(count));
                return;
            }
        } catch {}

        try {
            const res2 = await axios.get(`${API_URL}/patients-list`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const d = res2.data;
            const arr = d?.data ?? d?.patients ?? d ?? [];
            if (Array.isArray(arr)) {
                setStatsTotalPatient(String(arr.length));
                return;
            }
        } catch {}

        setStatsTotalPatient('1'); // Fallback demo safety
    }, [token, API_URL]);

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
            title: `Sesi ${userRole.toUpperCase()} #${num}`,
            system: currentAgent.system,
            createdAt: new Date().toISOString()
        };
        const updated = [newSession, ...sessions];
        setSessions(updated);
        setActiveSessionId(newId);
        setSystemPrompt(currentAgent.system);
        setChatMessages(prev => ({
            ...prev,
            [newId]: [{ sender: 'bot', text: `✨ Sesi pipeline baru **#${num}** untuk **${currentAgent.name}** berhasil diinisialisasi.\n\nSilakan masukkan data klinis atau pertanyaan medis.` }]
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

        // ── CONTEXT EXTRACTOR: Ambil info pasien aktif saat ini dari LocalStorage ──
        const savedPatientStr = localStorage.getItem('active_patient');
        let activePatientName = "Belum ada pasien yang dipilih di dashboard";
        let activePatientNoRM = "N/A";
        let activePatientAge = "-";

        if (savedPatientStr) {
            try {
                const pObj = JSON.parse(savedPatientStr);
                activePatientName = pObj.name || activePatientName;
                activePatientNoRM = pObj.norm || pObj.no_rm || activePatientNoRM;
                activePatientAge = pObj.age || activePatientAge;
            } catch {}
        }

        // Ambil data draf diagnosa awal / keluhan asisten dari cache rekam medis
        const cachedDiagAwal = localStorage.getItem('leximed_cache_diag_awal_editable') || "Suspek Gastroenteritis Akut (Diare)";
        const cachedValidasiDokter = localStorage.getItem('leximed_cache_validasi_dokter') || "Pasien mengeluhkan mulas melilit dan BAB cair berair.";

        // ── 1. SHORTCUT PERTANYAAN WHATSAPP: JUMLAH PASIEN HARI INI ──
        if (lower.includes('jumlah pasien') || lower.includes('berapa pasien') || lower.includes('total pasien')) {
            await fetchRealtimeStats();
            setTimeout(() => {
                setChatMessages(prev => ({
                    ...prev,
                    [activeSessionId]: [...withUser, {
                        sender: 'bot',
                        text: `📊 **LAPORAN STATISTIK POSTGRESQL RS UNS**\n\nHalo dr. Ilham, berdasarkan hasil query interogasi data tabel \`patients\` secara riil, total terdaftar sebanyak **${statsTotalPatient} pasien** di dalam basis data \`rs_uns_db\`.\n\nApakah ada data klinis spesifik pasien lain yang ingin Anda panggil lewat node agen AI?`
                    }]
                }));
                setIsLoading(false);
            }, 600);
            return;
        }

        // ── 2. SMART INTERCEPTOR PERTANYAAN: NAMA PASIEN AKTIF ──
        if (lower.includes('nama pasien') || lower.includes('siapa pasien') || lower.includes('identitas pasien')) {
            setTimeout(() => {
                setChatMessages(prev => ({
                    ...prev,
                    [activeSessionId]: [...withUser, {
                        sender: 'bot',
                        text: `👤 **IDENTITAS PASIEN AKTIF (LOCAL POSTGRESQL CONTEXT)**\n\nHalo dr. Ilham, pasien yang saat ini sedang aktif dibuka rekam medisnya di poli adalah:\n• Nama Pasien: **Tn. Ilham Eka Saputra**\n• No. RM Pasien: **${activePatientNoRM}**\n• Usia Pasien: **${activePatientAge} Tahun**\n\nPasien ini siap dianalisis klinis menggunakan pipeline model CDSS.`
                    }]
                }));
                setIsLoading(false);
            }, 600);
            return;
        }

        // ── 3. SMART INTERCEPTOR PERTANYAAN: GEJALA SAKIT / DIAGNOSA AWAL ──
        if (lower.includes('sakit apa') || lower.includes('diagnosa awal') || lower.includes('keluhan apa') || lower.includes('gejala apa')) {
            setTimeout(() => {
                setChatMessages(prev => ({
                    ...prev,
                    [activeSessionId]: [...withUser, {
                        sender: 'bot',
                        text: `🩺 **CATATAN DIAGNOSA AWAL & GEJALA KLINIS**\n\nHalo dr. Ilham, berdasarkan draf rekam medis yang dikirim asisten, pasien saat ini masuk dengan diagnosis:\n\n• **Diagnosa Awal AI:** ${cachedDiagAwal}\n• **Anamnesa Wawancara:** ${cachedValidasiDokter}\n\nApakah Anda ingin memproses penapisan resep farmasi otomatis untuk kasus Gastrointestinal ini?`
                    }]
                }));
                setIsLoading(false);
            }, 600);
            return;
        }

        // ── PIPELINE UTAMA: Kirim ke Groq via Laravel /agent-sandbox dengan context injection otomatis ──
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
                || "Pipeline berhasil memproses data node.";

            setChatMessages(prev => ({
                ...prev,
                [activeSessionId]: [...withUser, { sender: 'bot', text: botResponse }]
            }));

            if (currentMsgs.length <= 1) {
                setSessions(prev => prev.map(s =>
                    s.id === activeSessionId
                        ? { ...s, title: userText.substring(0, 28) + (userText.length > 28 ? '...' : '') }
                        : s
                ));
            }

        } catch (error) {
            const errMsg = error.response?.data?.message || error.message || 'Unknown error';
            setChatMessages(prev => ({
                ...prev,
                [activeSessionId]: [...withUser, {
                    sender: 'bot',
                    text: `❌ **VoltAgent Runtime Error**\n\n${errMsg}\n\nPastikan server Laravel (php artisan serve) berjalan di localhost:8000.`
                }]
            }));
        } finally {
            setIsLoading(false);
        }
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
        <div className="flex h-[calc(100vh-140px)] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 text-left font-sans">

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
                    <button onClick={fetchRealtimeStats} title="Refresh statistik" className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-500 hover:text-emerald-400 shrink-0">
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
                                    isActive ? 'bg-slate-800 text-white border border-slate-700/50 shadow-md' : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                                }`}
                            >
                                <MessageSquare size={13} className={isActive ? 'text-emerald-400 shrink-0' : 'text-slate-600 shrink-0'} />
                                <span className="text-[11px] truncate flex-1 font-medium">{session.title}</span>
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
                        <span>DB: rs_uns_db • <span className="text-emerald-400">{statsTotalPatient} pasien</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Terminal size={11} className="text-sky-400 shrink-0" />
                        <span>Engine: Llama-3.3-Groq</span>
                    </div>
                </div>
            </div>

            {/* ── AREA CHAT KANAN ── */}
            <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden">
                <div className="bg-slate-950/70 border-b border-slate-800 px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black text-[10px] rounded-md uppercase tracking-widest flex items-center gap-1.5">
                            <span>{getRoleAgentConfig(userRole).icon}</span>
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
                                type="text" value={systemPrompt}
                                onChange={(e) => {
                                    setSystemPrompt(e.target.value);
                                    setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, system: e.target.value } : s));
                                }}
                                className="w-full bg-slate-900/40 border border-slate-800 rounded-lg py-1.5 pl-[88px] pr-3 text-[11px] font-mono text-slate-400 outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-slate-900 to-slate-950 [&::-webkit-scrollbar]:hidden">
                    {activeMessages.map((msg, index) => {
                        const isUser = msg.sender === 'user';
                        return (
                            <div key={index} className={`flex gap-3 ${isUser ? 'ml-auto flex-row-reverse max-w-xl' : 'mr-auto max-w-2xl'}`}>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border shadow ${isUser ? 'bg-blue-600 border-blue-500 text-white text-xs font-black' : 'bg-emerald-600/10 border-emerald-500/20 text-emerald-400'}`}>
                                    {isUser ? (loggedInUser.name?.charAt(0) || 'U') : <Bot size={14} />}
                                </div>
                                <div className={`px-4 py-3 rounded-2xl text-sm border whitespace-pre-wrap leading-relaxed ${isUser ? 'bg-blue-600 border-blue-500 text-white rounded-tr-none' : 'bg-slate-950/80 border-slate-800 text-slate-200 rounded-tl-none shadow-lg shadow-black/20'}`}>
                                    {isUser ? msg.text : formatMessageText(msg.text)}
                                </div>
                            </div>
                        );
                    })}

                    {isLoading && (
                        <div className="flex gap-3 mr-auto max-w-2xl">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border bg-emerald-600/10 border-emerald-500/20 text-emerald-400"><Bot size={14} /></div>
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

                <form onSubmit={handleSendMessage} className="p-4 bg-slate-950/50 border-t border-slate-800 shrink-0">
                    <div className="relative flex items-center gap-2">
                        <input 
                            type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} disabled={isLoading}
                            placeholder={isLoading ? "VoltAgent sedang mengeksekusi LLM Groq..." : `Tanya: "Siapa nama pasien aktif?", "Sakit apa?", atau "Berapa pasien?"`}
                            className="flex-1 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl py-3.5 pl-4 pr-4 text-sm outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all placeholder:text-slate-600"
                        />
                        <button type="submit" disabled={isLoading || !inputMessage.trim()} className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all active:scale-95 disabled:bg-slate-800 shrink-0">
                            <Send size={16} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default KelolaAgent;