// ============================================================================
// LEXIMED.AI — LandingPage.jsx (v7.0 - FINAL FIX)
// ✅ Agent bisa jawab APAPUN via Anthropic API (claude-sonnet-4-20250514)
// ✅ Bug scroll agent fixed — scroll hanya di dalam container chat
// ✅ Semua animasi dipertahankan (pulse, particles, scan line, counter up)
// ✅ Semua section lengkap: Hero, Modul, Cara Kerja, Arsitektur, Demo AI, CTA, Footer
// ============================================================================

import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, ShieldCheck, Zap, Activity, Cpu, Mail, Phone,
  Database, FileText, Menu, X, Stethoscope, Microscope, LineChart, Lock,
  ChevronRight, PlayCircle, BrainCircuit, TerminalSquare, Network,
  Send, Bot, MessageSquare, Server, Code2, Eye, Sparkles, Users, ClipboardList
} from 'lucide-react';

// ── Floating particle background ──
const FloatingParticles = () => {
  const particles = Array.from({ length: 20 }, (_, i) => i);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-emerald-400/20"
          style={{ left: `${(i * 5.3) % 100}%`, top: `${(i * 7.1) % 100}%` }}
          animate={{ y: [-20, 20, -20], opacity: [0.1, 0.4, 0.1], scale: [1, 1.5, 1] }}
          transition={{ duration: 4 + (i % 3), repeat: Infinity, delay: i * 0.3 }}
        />
      ))}
    </div>
  );
};

// ── Counter up animasi ──
const CountUp = ({ end, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const currentRef = ref.current;
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setStarted(true); },
      { threshold: 0.5 }
    );
    if (currentRef) observer.observe(currentRef);
    return () => { if (currentRef) observer.unobserve(currentRef); };
  }, []);

  useEffect(() => {
    if (!started) return;
    let frame = 0;
    const total = 60;
    const timer = setInterval(() => {
      frame++;
      setCount(Math.round((end * frame) / total));
      if (frame >= total) clearInterval(timer);
    }, 20);
    return () => clearInterval(timer);
  }, [started, end]);

  return <span ref={ref}>{count}{suffix}</span>;
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [agentSimMessage, setAgentSimMessage] = useState(0);

  const heroRef = useRef(null);
  const fiturRef = useRef(null);
  const arsitekturRef = useRef(null);
  const caraKerjaRef = useRef(null);
  const agentRef = useRef(null);
  // Ref untuk scroll HANYA di dalam container chat (bukan window)
  const chatContainerRef = useRef(null);
  const chatBottomRef = useRef(null);

  const { scrollYProgress } = useScroll();
  const yPos = useTransform(scrollYProgress, [0, 1], [0, 150]);

  // ── MINI AGENT STATE ──
  const [agentInput, setAgentInput] = useState('');
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentRole, setAgentRole] = useState('dokter');
  const [agentMessages, setAgentMessages] = useState([
    {
      sender: 'bot',
      text: '👋 Halo! Saya adalah **LexiCore Agent** — AI multi-role CDSS dari LexiMed.ai.\n\nCoba tanya saya:\n• "Apa itu LexiMed?"\n• "Cara kerja modul radiologi?"\n• "Apa fungsi VoltAgent?"\n• "Siapa yang mengembangkan ini?"'
    }
  ]);

  useEffect(() => {
    const interval = setInterval(() => setAgentSimMessage((p) => (p + 1) % 3), 5000);
    return () => clearInterval(interval);
  }, []);

  // ── FIX SCROLL: Scroll hanya di dalam container chat, TIDAK scroll window ──
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [agentMessages, agentLoading]);

  const scrollToSection = (ref) => {
    setMobileMenuOpen(false);
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.12 } }
  };
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 50, damping: 14 } }
  };

  const simTexts = [
    { label: 'VoltAgent [Radiology Node]:', text: 'Mengisolasi draf korelasi infiltrat paru pasien... Berhasil.', color: 'text-teal-400' },
    { label: 'OpenClaw Middleware:', text: 'Injeksi rekam medis Tn. ALex ke PostgreSQL cloud tervalidasi.', color: 'text-blue-400' },
    { label: 'Neural LexiCore Engine:', text: 'One-Click Discharge Summary otomatis tersusun 100% akurat.', color: 'text-emerald-400' },
  ];

  const roleConfigs = {
    dokter: {
      name: 'Doctor CDSS Node', icon: '🩺',
      system: 'Kamu adalah Clinical Decision Support System (CDSS) LexiMed.ai. Jawab pertanyaan tentang fitur dokter, cara kerja CDSS, diagnosis AI, dan hal lainnya tentang sistem rekam medis berbasis AI. Jawaban singkat, padat, informatif, dalam bahasa Indonesia.'
    },
    radiologi: {
      name: 'Radiology Expert Node', icon: '☢️',
      system: 'Kamu adalah Radiology AI Agent LexiMed.ai. Jawab pertanyaan tentang PACS, Gemini Vision, analisis citra medis, dan topik lainnya yang ditanyakan user. Jawaban singkat, informatif, dalam bahasa Indonesia.'
    },
    admin: {
      name: 'System IT Node', icon: '⚡',
      system: 'Kamu adalah IT Admin AI Agent LexiMed.ai. Jawab pertanyaan tentang arsitektur sistem, audit log, keamanan data, dan apapun yang ditanyakan user. Jawaban singkat, informatif, dalam bahasa Indonesia.'
    },
  };

  const formatAgentText = (text) => {
    if (!text) return '';
    return text.split(/(\*\*.*?\*\*)/g).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-extrabold text-emerald-400">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  // ── AGENT SEND: Jawab apapun via Anthropic API, intercept FAQ dulu ──
  const handleAgentSend = async (e) => {
    e.preventDefault();
    if (!agentInput.trim() || agentLoading) return;
    const userText = agentInput.trim();
    setAgentInput('');
    const withUser = [...agentMessages, { sender: 'user', text: userText }];
    setAgentMessages(withUser);
    setAgentLoading(true);

    const lower = userText.toLowerCase();

    // ── Intercept FAQ lokal ──
    if (lower.includes('leximed') && (lower.includes('apa') || lower.includes('what'))) {
      setTimeout(() => {
        setAgentMessages([...withUser, {
          sender: 'bot',
          text: '🏥 **LexiMed.ai** adalah platform CDSS (Clinical Decision Support System) berbasis multi-role AI Agent untuk Rumah Sakit UNS Madiun.\n\nDikembangkan oleh mahasiswa D3 Teknik Informatika Vokasi UNS, sistem ini mengotomatisasi penulisan rekam medis, diagnosis klinis, dan analisis citra radiologi.'
        }]);
        setAgentLoading(false);
      }, 500);
      return;
    }
    if (lower.includes('voltagent') || lower.includes('volt agent')) {
      setTimeout(() => {
        setAgentMessages([...withUser, {
          sender: 'bot',
          text: '⚡ **VoltAgent** adalah pipeline orkestrator AI berbasis **Llama 3.3 via Groq SDK**.\n\nFungsinya: membaca cache konteks pasien dari localStorage, mengekstrak keluhan klinis, dan menyusun dokumen ringkasan rekam medis secara otonom dengan latensi ultra-rendah (<1 detik).'
        }]);
        setAgentLoading(false);
      }, 500);
      return;
    }
    if (lower.includes('radiologi') || lower.includes('pacs') || lower.includes('gemini')) {
      setTimeout(() => {
        setAgentMessages([...withUser, {
          sender: 'bot',
          text: '☢️ **Modul Radiologi** menggunakan pipeline **Hybrid AI**:\n\n1️⃣ **Gemini 1.5 Flash Vision** → analisis citra DICOM/JPEG langsung\n2️⃣ **Groq Llama 3.3** → fallback jika Gemini timeout\n\nHasil impresi radiologi disimpan ke PostgreSQL dan muncul otomatis di timeline rekam medis dokter.'
        }]);
        setAgentLoading(false);
      }, 500);
      return;
    }
    if (lower.includes('arsitektur') || lower.includes('backend') || lower.includes('laravel') || lower.includes('react')) {
      setTimeout(() => {
        setAgentMessages([...withUser, {
          sender: 'bot',
          text: '🏗️ **Arsitektur LexiMed.ai:**\n\n**Frontend:** React.js + Vite + Tailwind CSS + Framer Motion\n**Backend:** Laravel 11 + Sanctum Auth + PostgreSQL\n**AI Stack:** Groq (Llama 3.3) + Gemini 1.5 Flash\n**Middleware:** OpenClaw Layer (serverless REST API bridge)\n**Deploy:** Vercel (frontend) + PostgreSQL cloud (backend)'
        }]);
        setAgentLoading(false);
      }, 500);
      return;
    }
    if (lower.includes('siapa') || lower.includes('pengembang') || lower.includes('developer') || lower.includes('ilham')) {
      setTimeout(() => {
        setAgentMessages([...withUser, {
          sender: 'bot',
          text: '👨‍💻 **Pengembang LexiMed.ai:**\n\nNama: **Ilham Eka Saputra**\nProdi: D3 Teknik Informatika\nInstansi: Sekolah Vokasi — Universitas Sebelas Maret (UNS) Madiun\nEmail: ilhameka93@student.uns.ac.id\nWA: 0852-3128-7023'
        }]);
        setAgentLoading(false);
      }, 500);
      return;
    }
    if (lower.includes('openclaw')) {
      setTimeout(() => {
        setAgentMessages([...withUser, {
          sender: 'bot',
          text: '🌐 **OpenClaw Middleware Layer:**\n\nArsitektur ingestion layer serverless berkecepatan tinggi yang mengamankan lalu lintas payload REST API dari client React menuju database cloud. OpenClaw menjamin keaslian data parameter JSON tanpa interupsi latensi jaringan.'
        }]);
        setAgentLoading(false);
      }, 500);
      return;
    }

    // ── Jawab APAPUN via Anthropic API langsung dari browser ──
    try {
      const systemPrompt = `${roleConfigs[agentRole].system}

Kamu adalah asisten AI dari platform LexiMed.ai — sistem rekam medis berbasis AI untuk RS UNS Madiun.
Informasi penting tentang LexiMed.ai:
- Pengembang: Ilham Eka Saputra, D3 Teknik Informatika, Sekolah Vokasi UNS Madiun
- Frontend: React.js 18 + Vite + Tailwind CSS + Framer Motion
- Backend: Laravel 11 + Sanctum Auth + PostgreSQL (rs_uns_db)
- AI Stack: Groq SDK (Llama 3.3 70B) + Gemini 1.5 Flash Vision
- Middleware: OpenClaw Layer (serverless bridge)
- Orchestrator: VoltAgent Pipeline (context-aware, baca localStorage pasien)
- Fitur: CDSS dokter, modul perawat TTV, PACS radiologi, dashboard manajemen, audit trail admin
- Kontak: ilhameka93@student.uns.ac.id | 0852-3128-7023

Jawab dalam Bahasa Indonesia. Jawaban maksimal 5 kalimat, padat dan informatif.`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: systemPrompt,
          messages: [
            // Sertakan history chat (maks 10 pesan terakhir) untuk konteks
            ...withUser.slice(-10).map(m => ({
              role: m.sender === 'user' ? 'user' : 'assistant',
              content: m.text
            }))
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const botText = data?.content?.[0]?.text || 'Maaf, tidak mendapat respons dari AI.';
      setAgentMessages([...withUser, { sender: 'bot', text: botText }]);
    } catch (err) {
      console.error('Agent error:', err);
      setAgentMessages([...withUser, {
        sender: 'bot',
        text: `🤖 **LexiCore Agent** siap menjawab pertanyaan Anda tentang LexiMed.ai.\n\nCoba tanyakan tentang: fitur sistem, arsitektur teknis, cara kerja per role, atau pengembang platform ini.\n\n_(Catatan: Pastikan koneksi internet stabil untuk jawaban AI penuh)_`
      }]);
    } finally {
      setAgentLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] overflow-x-hidden font-sans text-left selection:bg-emerald-500/30 selection:text-emerald-300 antialiased">

      {/* BACKGROUND GLOW */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          style={{ y: yPos }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute top-[-10%] left-[-10%] w-[900px] h-[900px] bg-emerald-600/10 rounded-full blur-[150px]"
        />
        <motion.div
          style={{ y: yPos }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 18, repeat: Infinity }}
          className="absolute bottom-[20%] right-[-10%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[150px]"
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 brightness-75 contrast-125" />
        <FloatingParticles />
      </div>

      {/* ===== HEADER ===== */}
      <header className="fixed top-0 w-full z-50 bg-[#020617]/70 backdrop-blur-xl border-b border-white/5 py-4 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection(heroRef)}>
            <motion.div
              animate={{ boxShadow: ['0 0 10px rgba(16,185,129,0.2)', '0 0 25px rgba(16,185,129,0.5)', '0 0 10px rgba(16,185,129,0.2)'] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden border border-white/10"
            >
              <img src="/logo.png" alt="LexiMed Logo" className="w-full h-full object-contain" />
            </motion.div>
            <span className="text-xl font-black tracking-tighter text-white italic">LexiMed<span className="text-emerald-500">.ai</span></span>
          </div>

          <nav className="hidden md:flex items-center gap-6 font-bold text-slate-400 text-xs uppercase tracking-widest">
            <button onClick={() => scrollToSection(heroRef)} className="hover:text-emerald-400 transition-colors">Beranda</button>
            <button onClick={() => scrollToSection(fiturRef)} className="hover:text-emerald-400 transition-colors">Modul</button>
            <button onClick={() => scrollToSection(caraKerjaRef)} className="hover:text-emerald-400 transition-colors">Cara Kerja</button>
            <button onClick={() => scrollToSection(arsitekturRef)} className="hover:text-emerald-400 transition-colors">Arsitektur</button>
            <button onClick={() => scrollToSection(agentRef)} className="hover:text-emerald-400 transition-colors">Demo AI</button>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2.5 bg-white text-slate-950 font-black rounded-xl hover:bg-emerald-400 transition-all flex items-center gap-2 text-xs uppercase tracking-wider active:scale-95"
            >
              Masuk Sistem <ArrowRight size={14} />
            </button>
          </div>

          <button className="md:hidden text-white p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#020617]/95 border-b border-white/5 overflow-hidden"
            >
              <div className="flex flex-col px-6 py-4 space-y-2 font-bold uppercase text-xs tracking-wider text-slate-400">
                {[['Beranda', heroRef], ['Modul', fiturRef], ['Cara Kerja', caraKerjaRef], ['Arsitektur', arsitekturRef], ['Demo AI', agentRef]].map(([label, ref]) => (
                  <button key={label} onClick={() => scrollToSection(ref)} className="text-left py-3 border-b border-white/5 hover:text-emerald-400">{label}</button>
                ))}
                <button onClick={() => navigate('/login')} className="py-3.5 bg-emerald-600 text-white rounded-xl flex justify-center items-center gap-2 mt-4 text-xs font-black">
                  Masuk Sistem <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ===== HERO ===== */}
      <section ref={heroRef} className="relative pt-40 pb-20 md:pt-48 md:pb-28 px-6 min-h-screen flex items-center z-10">
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-12 gap-12 items-center">
          <motion.div initial="hidden" animate="show" variants={staggerContainer} className="text-center lg:text-left lg:col-span-7 space-y-6">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-black uppercase tracking-[0.2em]">
              <Zap size={14} className="fill-emerald-400" /> Enterprise Health Orchestration System
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl xl:text-7xl font-black text-white leading-[1.05] tracking-tighter uppercase italic">
              Otomatisasi <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-500">Klinis Otonom</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-sm md:text-base text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Hancurkan birokrasi pengetikan manual hospital. LexiMed mengintegrasikan kekuatan multi-node AI Agent untuk menyusun dokumen rekam medis resmi secara otonom dari narasi klinis dengan presisi tinggi.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-4 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
              >
                Inisialisasi Sistem <ArrowRight size={16} />
              </button>
              <button
                onClick={() => scrollToSection(agentRef)}
                className="px-8 py-4 bg-white/5 border border-white/10 text-slate-300 rounded-xl font-black text-xs uppercase hover:bg-white/10 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <PlayCircle size={16} className="text-emerald-400" /> Coba Demo AI
              </button>
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-6 justify-center lg:justify-start pt-4">
              {[
                { label: 'Role Staf', val: 5, suffix: '+' },
                { label: 'AI Engine', val: 2, suffix: ' API' },
                { label: 'Efisiensi Waktu', val: 85, suffix: '%' },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl font-black text-emerald-400"><CountUp end={s.val} suffix={s.suffix} /></div>
                  <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* VoltOps Console */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:col-span-5 w-full"
          >
            <div className="w-full bg-[#090d16] border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-[0_0_80px_rgba(16,185,129,0.15)] space-y-6 relative overflow-hidden">
              {/* Scan line animation */}
              <motion.div
                className="absolute left-0 w-full h-[1px] bg-emerald-400/10 pointer-events-none"
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              />
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-2.5">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}>
                    <BrainCircuit className="text-emerald-400" size={20} />
                  </motion.div>
                  <span className="text-[10px] font-black uppercase text-white tracking-widest font-mono">VoltOps Orchestrator Console</span>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-2.5 h-2.5 rounded-full bg-emerald-500"
                  />
                </div>
              </div>

              <div className="bg-slate-950 rounded-xl p-4 border border-white/5 font-mono text-[11px] h-32 flex flex-col justify-center space-y-2">
                <div className="flex items-center gap-2">
                  <TerminalSquare size={12} className="text-slate-500" />
                  <span className="text-slate-500">Pipeline Terminal active log listener...</span>
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={agentSimMessage}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-1"
                  >
                    <p className={`font-black uppercase text-[9px] ${simTexts[agentSimMessage].color}`}>{simTexts[agentSimMessage].label}</p>
                    <p className="text-slate-300 font-bold leading-relaxed">{simTexts[agentSimMessage].text}</p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active E-Document Snapshot</span>
                  <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[8px] font-black text-emerald-400 uppercase">One-Click Ready</span>
                </div>
                <p className="text-xs font-black text-white uppercase tracking-tight">Tn. ALex (RM-001)</p>
                <p className="text-[10px] text-emerald-400 font-bold italic">Output: Final Document Discharge Summary Generator Sync Complete ✓</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== 5 MODUL ===== */}
      <section ref={fiturRef} className="py-24 md:py-32 px-6 bg-slate-950/40 relative z-20 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-emerald-400 font-black tracking-[0.3em] uppercase text-xs mb-3">Modular Ecosystem</h2>
            <h3 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase italic">Satu Komputasi Cloud, 5 Node Otomasi</h3>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm mt-3 font-medium">LexiMed memisahkan hak akses fungsionalitas sesuai standarisasi tata kelola rumah sakit modern.</p>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-50px' }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          >
            {[
              { icon: <Stethoscope size={22} />, title: 'Modul Dokter', desc: 'Asistensi diagnosis klinis real-time via CDSS, hybrid AI Groq + Gemini, anti-halusinasi dengan review konservatif TTV.' },
              { icon: <Activity size={22} />, title: 'Modul Perawat', desc: 'Manajemen rekam data tanda vital (TTV) cepat dan sistem operan shift serah terima terstruktur otomatis.' },
              { icon: <Microscope size={22} />, title: 'Modul Radiologi', desc: 'Integrasi PACS dengan Gemini Vision untuk ekstraksi otomatis impresi citra medis DICOM.' },
              { icon: <LineChart size={22} />, title: 'Modul Manajemen', desc: 'Dashboard visualisasi tren kesehatan demografis dan otomasi laporan strategis eksekutif.' },
              { icon: <Lock size={22} />, title: 'Modul Admin & Audit', desc: 'Pemantauan jalur data log terenkripsi, manajemen kredensial user, proteksi keamanan siber rekam medis.', span: 2 },
            ].map((m, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className={`group p-8 bg-white/[0.01] rounded-[2rem] border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/[0.02] transition-all duration-500 h-64 text-left flex flex-col justify-between ${m.span === 2 ? 'lg:col-span-2' : ''}`}
              >
                <div>
                  <div className="w-12 h-12 bg-white/5 border border-white/10 text-emerald-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all duration-300">
                    {m.icon}
                  </div>
                  <h4 className="text-lg font-black text-white uppercase tracking-wide italic mb-2">{m.title}</h4>
                  <p className="text-slate-400 text-xs leading-relaxed font-medium">{m.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== CARA KERJA PER ROLE ===== */}
      <section ref={caraKerjaRef} className="py-24 md:py-32 px-6 bg-[#030712] text-white relative z-20">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center">
            <h2 className="text-emerald-400 font-black tracking-[0.3em] uppercase text-xs mb-3">Human-in-the-Loop System</h2>
            <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tight italic">Cara Kerja Per Role Staf</h3>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm font-medium mt-3">Setiap peran staf memiliki alur kerja AI yang terspesialisasi dan terisolasi.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '🩺', role: 'Dokter Poliklinik', color: 'border-emerald-500/30 bg-emerald-500/[0.03]',
                badge: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
                steps: [
                  { icon: <ClipboardList size={14} />, text: 'Input keluhan pasien & TTV ke formulir rekam medis' },
                  { icon: <Sparkles size={14} />, text: 'AI Groq generate diagnosa awal + 3 pertanyaan anamnesa' },
                  { icon: <BrainCircuit size={14} />, text: 'Gemini review hasil Groq — koreksi diagnosis yang terlalu agresif' },
                  { icon: <Eye size={14} />, text: 'Dokter edit hasil AI, validasi final, simpan ke PostgreSQL' },
                ]
              },
              {
                icon: '☢️', role: 'Radiolog / PACS', color: 'border-cyan-500/30 bg-cyan-500/[0.03]',
                badge: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
                steps: [
                  { icon: <Eye size={14} />, text: 'Terima instruksi rujukan dokter poliklinik dari database' },
                  { icon: <Microscope size={14} />, text: 'Upload foto citra DICOM/JPEG pasien ke workstation PACS' },
                  { icon: <BrainCircuit size={14} />, text: 'Gemini Vision analisis gambar → draf impresi radiologi 5 kalimat' },
                  { icon: <ShieldCheck size={14} />, text: 'Radiolog koreksi & kirim ke timeline rekam medis dokter' },
                ]
              },
              {
                icon: '🎚️', role: 'Perawat', color: 'border-blue-500/30 bg-blue-500/[0.03]',
                badge: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
                steps: [
                  { icon: <Activity size={14} />, text: 'Input TTV pasien: tekanan darah, nadi, suhu, SpO2' },
                  { icon: <Database size={14} />, text: 'Data langsung tersimpan ke PostgreSQL rs_uns_db' },
                  { icon: <ClipboardList size={14} />, text: 'Modul operan shift: ringkasan kondisi pasien otomatis disusun AI' },
                  { icon: <ShieldCheck size={14} />, text: 'Serah terima shift dengan dokumen terstruktur terverifikasi' },
                ]
              },
              {
                icon: '📊', role: 'Manajemen RS', color: 'border-violet-500/30 bg-violet-500/[0.03]',
                badge: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
                steps: [
                  { icon: <LineChart size={14} />, text: 'Akses dashboard statistik pasien & layanan real-time' },
                  { icon: <Database size={14} />, text: 'Visualisasi tren penyakit terbanyak & utilitas kamar' },
                  { icon: <FileText size={14} />, text: 'AI susun laporan performa UGD & rawat inap otomatis' },
                  { icon: <ShieldCheck size={14} />, text: 'Export laporan PDF untuk rapat direksi RS' },
                ]
              },
              {
                icon: '⚡', role: 'Admin & IT', color: 'border-amber-500/30 bg-amber-500/[0.03]',
                badge: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
                steps: [
                  { icon: <Users size={14} />, text: 'Kelola akun staf: tambah, edit, hapus user per role' },
                  { icon: <Lock size={14} />, text: 'Pantau audit log: setiap aksi tercatat dengan timestamp' },
                  { icon: <Database size={14} />, text: 'Inject dokumen SOP/PPK ke Knowledge Base RAG' },
                  { icon: <ShieldCheck size={14} />, text: 'Monitor keamanan siber & integritas data PostgreSQL' },
                ]
              },
              {
                icon: '🤖', role: 'AI Agent Playground', color: 'border-pink-500/30 bg-pink-500/[0.03]',
                badge: 'bg-pink-500/10 border-pink-500/20 text-pink-400',
                steps: [
                  { icon: <MessageSquare size={14} />, text: 'Buat sesi baru multi-role: Dokter, Perawat, Radiolog, dll' },
                  { icon: <BrainCircuit size={14} />, text: 'AI otomatis membaca konteks pasien dari localStorage' },
                  { icon: <Sparkles size={14} />, text: 'Tanya apa saja: identitas pasien, diagnosa, jumlah pasien' },
                  { icon: <Database size={14} />, text: 'Riwayat percakapan tersimpan per sesi & per role' },
                ]
              },
            ].map((role, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`p-6 rounded-[2rem] border ${role.color} space-y-4 text-left`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{role.icon}</span>
                  <span className={`px-2.5 py-1 rounded-md border font-black text-[9px] uppercase tracking-wider ${role.badge}`}>{role.role}</span>
                </div>
                <div className="space-y-2.5">
                  {role.steps.map((step, j) => (
                    <div key={j} className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5 text-slate-400">{step.icon}</div>
                      <p className="text-slate-400 text-[11px] font-medium leading-relaxed">{step.text}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ARSITEKTUR TEKNIS ===== */}
      <section ref={arsitekturRef} className="py-24 md:py-32 px-6 bg-slate-950 text-white relative z-20 border-b border-white/5">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center">
            <h2 className="text-emerald-400 font-black tracking-[0.3em] uppercase text-xs mb-3">Enterprise Core Infrastructure</h2>
            <h3 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase italic">Arsitektur Sistem LexiMed.ai</h3>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm font-medium mt-3">Stack teknologi modern yang menjamin skalabilitas, keamanan, dan kecepatan pemrosesan data medis.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                tag: 'Frontend Layer', tagColor: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
                icon: <Code2 size={28} className="text-blue-400" />, glow: 'shadow-[0_0_40px_rgba(59,130,246,0.1)]',
                title: 'React.js + Vite', border: 'border-blue-500/20',
                items: [
                  { name: 'React.js 18', desc: 'UI framework utama' },
                  { name: 'Vite Build', desc: 'Compiler ultra-cepat' },
                  { name: 'Tailwind CSS', desc: 'Styling utility-first' },
                  { name: 'Framer Motion', desc: 'Animasi & transisi' },
                  { name: 'React Router v6', desc: 'Client-side routing' },
                ]
              },
              {
                tag: 'Backend Layer', tagColor: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
                icon: <Server size={28} className="text-orange-400" />, glow: 'shadow-[0_0_40px_rgba(251,146,60,0.1)]',
                title: 'Laravel 11 API', border: 'border-orange-500/20',
                items: [
                  { name: 'Laravel 11', desc: 'PHP backend framework' },
                  { name: 'Sanctum Auth', desc: 'Token-based auth' },
                  { name: 'PostgreSQL', desc: 'Database utama (rs_uns_db)' },
                  { name: 'Eloquent ORM', desc: 'Model relasi data' },
                  { name: 'REST API', desc: 'JSON endpoint gateway' },
                ]
              },
              {
                tag: 'AI Stack', tagColor: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
                icon: <BrainCircuit size={28} className="text-emerald-400" />, glow: 'shadow-[0_0_40px_rgba(16,185,129,0.1)]',
                title: 'Hybrid AI Engine', border: 'border-emerald-500/20',
                items: [
                  { name: 'Groq SDK', desc: 'Llama 3.3 70B ultra-fast' },
                  { name: 'Gemini 1.5 Flash', desc: 'Vision + text review' },
                  { name: 'OpenClaw Layer', desc: 'Serverless middleware' },
                  { name: 'VoltAgent', desc: 'Context-aware orchestrator' },
                  { name: 'RAG Knowledge', desc: 'PPK/SOP vector base' },
                ]
              },
            ].map((stack, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className={`p-8 bg-gradient-to-br from-slate-900 to-slate-950 border ${stack.border} rounded-[2.5rem] space-y-5 ${stack.glow}`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">{stack.icon}</div>
                  <div>
                    <span className={`px-2.5 py-1 rounded-md border font-black text-[9px] uppercase tracking-wider ${stack.tagColor}`}>{stack.tag}</span>
                    <h4 className="text-base font-black text-white mt-1 uppercase tracking-wide italic">{stack.title}</h4>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {stack.items.map((item, j) => (
                    <div key={j} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <span className="text-white font-black text-xs">{item.name}</span>
                      <span className="text-slate-500 font-medium text-[10px]">{item.desc}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 bg-gradient-to-br from-slate-900 to-emerald-950/20 border border-white/5 rounded-[2.5rem] space-y-4 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 text-emerald-500/10"><Network size={120} /></div>
              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black text-[10px] rounded-md uppercase tracking-wider inline-block">OpenClaw Layer</span>
              <h4 className="text-xl font-black uppercase tracking-wide italic text-white">Middleware Data Ingestion</h4>
              <p className="text-slate-400 text-xs leading-relaxed font-medium">Berfungsi sebagai jembatan serverless runtime berkecepatan tinggi yang menangkap dan mengamankan pertukaran data klinis dari React client menuju Laravel API gateway. OpenClaw memastikan ketersediaan endpoint yang tangguh menghadapi beban komputasi massal tanpa interupsi sesi login.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 bg-gradient-to-br from-slate-900 to-blue-950/20 border border-white/5 rounded-[2.5rem] space-y-4 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 text-blue-500/10"><BrainCircuit size={120} /></div>
              <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 font-black text-[10px] rounded-md uppercase tracking-wider inline-block">VoltAgent Pipeline</span>
              <h4 className="text-xl font-black uppercase tracking-wide italic text-white">Context-Aware Orchestrator</h4>
              <p className="text-slate-400 text-xs leading-relaxed font-medium">Otak pemroses AI berbasis Llama 3.3 via Groq SDK. VoltAgent membaca data kontekstual localStorage cache pasien secara riil, mengasimilasi keluhan wawancara, lalu menyusun dokumen ringkasan rekam medis otonom. Dikombinasikan dengan Gemini sebagai conservative reviewer untuk mencegah over-diagnosis.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== ALUR KERJA SISTEM ===== */}
      <section className="py-24 md:py-32 px-6 bg-[#020a14] text-white relative z-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-full bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent hidden lg:block" />
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight italic">Sintaks Kompilasi Dokumen Otonom</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm font-medium mt-3">Alur penulisan rekam medis otomatis yang memangkas waktu kerja klinis hingga 85%.</p>
          </div>

          <div className="space-y-12 lg:space-y-0">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-24">
              {[
                { n: 1, title: 'Penangkapan Narasi Bebas', desc: 'Perawat/dokter input temuan fisik awal dan catatan keluhan kasar pasien via keyboard atau Voice Note.', right: false },
                { n: 2, title: 'Asimilasi Neural Graph', desc: 'VoltAgent ekstrak entitas rekam medis, cocokkan dengan Knowledge Base, susun rekomendasi diagnosis otonom.', right: true },
              ].map((s) => (
                <motion.div
                  key={s.n}
                  initial={{ opacity: 0, x: s.right ? 40 : -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className={`bg-white/[0.01] p-8 rounded-[2rem] border border-white/5 z-10 shadow-2xl space-y-4 ${s.right ? 'lg:mt-24' : 'lg:text-right'}`}
                >
                  <div className={`w-10 h-10 bg-emerald-600 text-slate-950 rounded-full flex items-center justify-center font-black text-base shadow-lg ${s.right ? '' : 'lg:ml-auto'}`}>{s.n}</div>
                  <h3 className="text-lg font-black uppercase tracking-wide text-white">{s.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed font-medium">{s.desc}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-8 lg:gap-24 mt-8 lg:-mt-12">
              {[
                { n: 3, title: 'Validasi Mutlak Dokter', desc: 'Draf final disajikan di dashboard. Dokter cek, edit dosis, dan klik persetujuan legalitas berkas rekam medis.', right: false },
                { n: 4, title: 'Sinkronisasi PostgreSQL Core', desc: 'Dokumen terkunci ke database PostgreSQL. Siap diunduh PDF, dicetak fisik, dan dilacak via Audit Trail.', right: true },
              ].map((s) => (
                <motion.div
                  key={s.n}
                  initial={{ opacity: 0, x: s.right ? 40 : -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className={`bg-white/[0.01] p-8 rounded-[2rem] border border-white/5 z-10 shadow-2xl space-y-4 ${s.right ? 'lg:mt-24' : 'lg:text-right'}`}
                >
                  <div className={`w-10 h-10 bg-emerald-600 text-slate-950 rounded-full flex items-center justify-center font-black text-base shadow-lg ${s.right ? '' : 'lg:ml-auto'}`}>{s.n}</div>
                  <h3 className="text-lg font-black uppercase tracking-wide text-white">{s.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed font-medium">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== EMBEDDED AI AGENT DEMO ===== */}
      <section ref={agentRef} className="py-24 md:py-32 px-6 bg-slate-950/60 relative z-20 border-y border-white/5">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center">
            <h2 className="text-emerald-400 font-black tracking-[0.3em] uppercase text-xs mb-3">Live AI Demo</h2>
            <h3 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase italic">Tanya LexiCore Agent Sekarang</h3>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm font-medium mt-3">Ini adalah versi demo publik dari AI Agent yang berjalan di dalam sistem LexiMed.ai. Tanya <strong className="text-white">apa saja</strong> tentang platform ini!</p>
          </div>

          <div className="bg-[#090d16] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_0_80px_rgba(16,185,129,0.1)]">
            {/* Agent header */}
            <div className="bg-slate-950/80 border-b border-white/5 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}>
                  <BrainCircuit className="text-emerald-400" size={18} />
                </motion.div>
                <div>
                  <p className="text-[10px] font-black text-white uppercase tracking-widest">LexiCore Agent — Demo Publik</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Powered by {roleConfigs[agentRole].name}</p>
                </div>
              </div>
              {/* Role switcher */}
              <div className="flex gap-2">
                {Object.entries(roleConfigs).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => setAgentRole(key)}
                    className={`px-3 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-wider transition-all ${agentRole === key ? 'bg-emerald-600 text-white' : 'bg-white/5 text-slate-500 hover:bg-white/10 hover:text-white'}`}
                  >
                    {cfg.icon} {key}
                  </button>
                ))}
              </div>
            </div>

            {/* Messages container — scroll hanya di sini */}
            <div
              ref={chatContainerRef}
              className="h-80 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-slate-950 to-[#090d16] [&::-webkit-scrollbar]:hidden"
            >
              {agentMessages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.sender === 'user' ? 'ml-auto flex-row-reverse max-w-md' : 'mr-auto max-w-2xl'}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${msg.sender === 'user' ? 'bg-blue-600 border-blue-500 text-white text-xs font-black' : 'bg-emerald-600/10 border-emerald-500/20 text-emerald-400'}`}>
                    {msg.sender === 'user' ? 'U' : <Bot size={14} />}
                  </div>
                  <div className={`px-4 py-3 rounded-2xl text-xs border whitespace-pre-wrap leading-relaxed ${msg.sender === 'user' ? 'bg-blue-600 border-blue-500 text-white rounded-tr-none' : 'bg-slate-950/80 border-slate-800 text-slate-200 rounded-tl-none'}`}>
                    {msg.sender === 'user' ? msg.text : formatAgentText(msg.text)}
                  </div>
                </motion.div>
              ))}

              {agentLoading && (
                <div className="flex gap-3 mr-auto">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center border bg-emerald-600/10 border-emerald-500/20 text-emerald-400"><Bot size={14} /></div>
                  <div className="px-5 py-4 rounded-2xl rounded-tl-none bg-slate-950/80 border border-slate-800 flex gap-1.5 items-center">
                    {[0, 150, 300].map(d => (
                      <div key={d} className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                </div>
              )}
              {/* Anchor untuk scroll bottom */}
              <div ref={chatBottomRef} />
            </div>

            {/* Suggested questions */}
            <div className="px-6 pb-3 pt-2 flex flex-wrap gap-2 border-t border-white/5">
              {[
                'Apa itu LexiMed?',
                'Apa fungsi VoltAgent?',
                'Bagaimana arsitektur sistemnya?',
                'Modul radiologi pakai AI apa?',
                'Siapa pengembangnya?',
                'Apa itu OpenClaw?',
              ].map(q => (
                <button
                  key={q}
                  onClick={() => setAgentInput(q)}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[9px] font-bold text-slate-400 hover:bg-emerald-600/20 hover:text-emerald-400 hover:border-emerald-500/30 transition-all uppercase tracking-wider"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleAgentSend} className="p-4 bg-slate-950/50 border-t border-white/5">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={agentInput}
                  onChange={(e) => setAgentInput(e.target.value)}
                  disabled={agentLoading}
                  placeholder={agentLoading ? 'LexiCore sedang berpikir...' : 'Tanya apa saja tentang LexiMed.ai...'}
                  className="flex-1 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl py-3 px-4 text-xs outline-none focus:ring-2 focus:ring-emerald-500/40 placeholder:text-slate-700"
                />
                <button
                  type="submit"
                  disabled={agentLoading || !agentInput.trim()}
                  className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all active:scale-95 disabled:bg-slate-800 disabled:cursor-not-allowed"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-24 px-6 bg-gradient-to-br from-emerald-600 to-blue-700 relative overflow-hidden z-20 border-t border-white/5">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center space-y-8 relative z-10"
        >
          <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight italic">Transformasikan Administrasi Medis Hari Ini</h2>
          <p className="text-blue-100 text-sm font-medium max-w-lg mx-auto">Masuk ke dalam ekosistem penunjang keputusan klinis masa depan yang cepat, cerdas, aman, dan efisien.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-4 bg-white text-slate-950 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all shadow-2xl flex items-center justify-center gap-3 mx-auto active:scale-95"
          >
            Mulai Otomasi Rekam Medis <ChevronRight size={18} />
          </button>
        </motion.div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-slate-950 text-slate-400 py-16 px-6 relative z-20 border-t border-white/5 text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 border-b border-white/5 pb-12 mb-12">
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ boxShadow: ['0 0 8px rgba(16,185,129,0.2)', '0 0 20px rgba(16,185,129,0.4)', '0 0 8px rgba(16,185,129,0.2)'] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="w-8 h-8 rounded-xl flex items-center justify-center overflow-hidden border border-white/10"
              >
                <img src="/logo.png" alt="LexiMed Logo" className="w-full h-full object-contain" />
              </motion.div>
              <span className="text-lg font-black tracking-tight text-white italic">LexiMed<span className="text-emerald-400">.ai</span></span>
            </div>
            <p className="text-slate-400 leading-relaxed font-medium max-w-sm">Platform CDSS berbasis multi-role AI Agent untuk rekam medis elektronik rumah sakit. Dirancang khusus untuk RS UNS Madiun.</p>
          </div>

          <div className="md:col-span-3 space-y-4">
            <h4 className="text-white font-black uppercase tracking-wider text-sm italic">Infrastruktur Node</h4>
            <ul className="space-y-2.5 font-bold uppercase tracking-wide text-[10px] text-slate-500">
              <li>🩺 Doctor Clinical CDSS</li>
              <li>🎚️ Nurse Care Extraction</li>
              <li>☢️ Radiology Expert Explorer</li>
              <li>📊 Hospital Analytic Management</li>
              <li>⚡ Admin Audit Security Trail</li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-4">
            <h4 className="text-white font-black uppercase tracking-wider text-sm italic">Otoritas Pengembang</h4>
            <ul className="space-y-3 font-semibold text-slate-400">
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-emerald-400 shrink-0" />
                <a href="mailto:ilhameka93@student.uns.ac.id" className="hover:text-emerald-400 transition-colors">ilhameka93@student.uns.ac.id</a>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-emerald-400 shrink-0" />
                <a href="https://wa.me/6285231287023" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors">0852-3128-7023</a>
              </li>
              <li className="text-[10px] font-black uppercase tracking-wider text-slate-500 pt-1">
                D3 Teknik Informatika — Sekolah Vokasi<br />Universitas Sebelas Maret (UNS) Madiun
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] font-bold uppercase tracking-wider text-slate-600">
          <p>&copy; 2026 LexiMed.ai — Hak Cipta Tim Inovasi Vokasi UNS.</p>
          <div className="flex items-center gap-2 font-mono text-[10px]">
            Powered by{' '}
            <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <Cpu size={14} className="text-emerald-500" />
            </motion.div>
            {' '}OpenClaw Layer Engine v1.0
          </div>
        </div>
      </footer>
    </div>
  );
}